'use strict';
// Final read-only gate. Index creation is an explicit host attestation, never fallback evidence.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const runtime=()=>require('./acceptance-manifest.json').runtime.filter(f=>!f.includes('/templates/')).map(f=>f.replace('skills/targeted-cv/','')).sort();
function checkRuntime(r){assert.deepEqual(Object.keys(r.runtimeHashes).sort(),runtime(),'Incomplete actual runtime inventory');for(const [f,h]of Object.entries(r.runtimeHashes))assert.equal(hash(fs.readFileSync(path.join(root,'skills/targeted-cv',f))),h,'Stale actual runtime');}
function filesUnder(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);assert.ok(!e.isSymbolicLink(),'No redirected evidence');return e.isDirectory()?filesUnder(p):[p];}).sort();}
function referencedFiles(files){const result=new Set();for(const file of files.filter(f=>f.endsWith('.json'))){let value;try{value=JSON.parse(fs.readFileSync(file));}catch{continue;}function visit(v){if(!v||typeof v!=='object')return;for(const [key,item]of Object.entries(v)){if(['path','resolved_path','artifact'].includes(key)&&typeof item==='string'&&path.isAbsolute(item)&&fs.existsSync(item)&&fs.statSync(item).isFile()){assert.ok(files.includes(item),'Owner reference outside independently selected evidence roots');result.add(item);}else visit(item);}}visit(value);}return [...result].sort();}
function verifyIndex(index,digest){
 assert.equal(index?.kind,'m4-evidence-index','Missing evidence index');assert.equal(hash(JSON.stringify(index)),digest,'Index authentication mismatch');
 assert.equal(index.roots.length,4,'Index needs four explicitly selected evidence roots');for(const dir of index.roots){assert.ok(path.isAbsolute(dir));assert.equal(fs.realpathSync(dir).toLowerCase(),dir.toLowerCase(),'Redirected evidence root');}assert.ok(index.files.length>4,'Empty index');
 const expected=[...new Set(index.roots.flatMap(filesUnder))].sort();assert.deepEqual(index.files.map(f=>f.path).sort(),expected,'Incomplete evidence index membership');
 assert.deepEqual(index.references,referencedFiles(expected),'Incomplete transitive owner reference closure');
 for(const f of index.files)assert.equal(hash(fs.readFileSync(f.path)),f.sha256,'Changed indexed evidence '+path.basename(f.path));
 for(const key of ['previousReceipt','previousReview','currentReceipt','currentReview','recoveryReceipt','controls'])assert.ok(index.files.some(f=>f.path===index.inputs[key]),'Unbound '+key);
 return index;
}
function requireLiveEvidence(indexFile,digest){assert.ok(typeof indexFile==='string'&&digest,'Missing live refinement evidence: explicit authenticated index required');return verify(indexFile,digest);}
function verify(indexFile,digest){
 const index=verifyIndex(JSON.parse(fs.readFileSync(indexFile)),digest),i=index.inputs;
 for(const name of ['previousReceipt','currentReceipt','recoveryReceipt'])checkRuntime(JSON.parse(fs.readFileSync(i[name])));
 const prior=JSON.parse(fs.readFileSync(i.previousReview));assert.equal(prior.receiptSha256,hash(fs.readFileSync(i.previousReceipt)),'Prior review receipt binding');
 const bilingual=require('./bilingual-followup-evidence.cjs').verify(i.currentReceipt,i.currentReview,i.previousReview);
 const recovery=require('./recovery-evidence.cjs');recovery.checkRecoveryEvidence(JSON.parse(fs.readFileSync(i.recoveryReceipt)));const controls=recovery.checkControlsEvidence(JSON.parse(fs.readFileSync(i.controls)));
 const dir=path.dirname(i.currentReceipt),closed=JSON.parse(fs.readFileSync(path.join(dir,'refinement-checkpoint.json'))),final=JSON.parse(fs.readFileSync(path.join(dir,'final-report.json')));
 const profile=JSON.parse(fs.readFileSync(path.join(dir,'application.json'))),strategy=JSON.parse(fs.readFileSync(path.join(dir,'current-strategy.json'))),manifest=JSON.parse(fs.readFileSync(path.join(dir,'current-manifest.json')));
 assert.equal(strategy.schema_version,'1.2');assert.equal(manifest.schema_version,'1.2');assert.equal(profile.schema_version,'2.1');assert.equal(closed.application_id,profile.application_scope.application_id);assert.equal(strategy.binding.application_id,closed.application_id);assert.equal(strategy.binding.canonical_sha256,closed.selection.profile.sha256);assert.equal(strategy.binding.resolved_path,closed.selection.profile.resolved_path);assert.deepEqual(strategy.binding,manifest.binding);assert.equal(profile.application_scope.target_sha256,closed.selection.target_sha256);assert.equal(strategy.binding.target_sha256,closed.selection.target_sha256);assert.equal(strategy.binding.settings_sha256,closed.selection.settings_sha256);
 assert.equal(final.application_complete,true);assert.ok(closed.revisions.at(-1).members.every(m=>m.status==='verified'));assert.ok(closed.revisions.every(r=>r.members.every(m=>!['editing','uncertain'].includes(m.status))));
 return {state:'passed',bilingual:bilingual.state,controls:controls.controls,indexDigest:digest,limits:['Read-only replay of selected actual observations, not new authoring.','Host semantic and all-page reviews remain human judgments.','Recovery member remains needs_revision; recovery is not complete application verification.','Role-only coverage, appeal and readability remain unassessed; no numerical gain asserted.']};
}
function createIndex(inputs,destination){
 const roots=[...new Set(Object.values(inputs).map(p=>path.dirname(path.resolve(p))))];assert.equal(roots.length,4);
 const selected=[...new Set(roots.flatMap(filesUnder))].sort();const index={kind:'m4-evidence-index',inputs:Object.fromEntries(Object.entries(inputs).map(([k,v])=>[k,path.resolve(v)])),roots,references:referencedFiles(selected),files:selected.map(p=>({path:p,sha256:hash(fs.readFileSync(p))}))};
 assert.ok(!roots.some(p=>path.resolve(destination).startsWith(p+path.sep)),'Index must remain outside immutable roots');fs.writeFileSync(destination,JSON.stringify(index,null,2)+'\n',{flag:'wx'});return hash(JSON.stringify(index));
}
module.exports={hash,filesUnder,verifyIndex,verify,requireLiveEvidence,createIndex,checkRuntime};
if(require.main===module){try{console.log(requireLiveEvidence(...process.argv.slice(2)));}catch(e){console.error(e.message);process.exitCode=1;}}
