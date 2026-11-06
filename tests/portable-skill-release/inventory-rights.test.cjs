'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const root=path.resolve(__dirname,'../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const check=()=>require('../../release/check.cjs').checkDefinition;
const createdTemps=new Set();
function freshTemp(){const temp=fs.mkdtempSync(path.join(os.tmpdir(),'inventory-rights-'));createdTemps.add(fs.realpathSync(temp));return temp;}
function removeTemp(temp){
 const resolved=fs.realpathSync(temp),base=fs.realpathSync(os.tmpdir()),relative=path.relative(base,resolved);
 assert.ok(createdTemps.has(resolved)&&relative&&!relative.startsWith('..')&&!path.isAbsolute(relative),'cleanup requires our fresh directory under OS temp');
 const junction=path.join(resolved,'skills/targeted-cv/templates');if(fs.existsSync(junction)&&fs.lstatSync(junction).isSymbolicLink())fs.unlinkSync(junction);
 fs.rmSync(resolved,{recursive:true,force:true});createdTemps.delete(resolved);
}
test('exact core, extras, reviewed rights and format destinations validate without artifact readiness',()=>{
 const m0=read('release/manifest.json');const result=check()(root);assert.equal(result.status,'passed');assert.equal(result.value.core_count,m0.assets.filter(a=>a.role==='core').length);assert.equal(result.value.asset_count,m0.assets.length);assert.equal(result.value.artifact_ready,'not_assessed');
 const m=m0;assert.ok(m.assets.filter(a=>a.role==='core').length>0);
 for(const a of m.assets){assert.equal(Object.keys(a.destinations).length,3);assert.ok(a.rights_ref);}
 const license=m.assets.find(a=>a.source==='LICENSE');assert.deepEqual(license.destinations['plugin-zip'],['skills/targeted-cv/LICENSE','LICENSE']);
});
test('missing, extra, unsafe, case-colliding and unknown inventory fields fail closed',()=>{
 const mutate=[m=>m.assets.pop(),m=>m.assets.shift(),m=>m.assets.splice(m.assets.findIndex(a=>a.source.endsWith('application-documents-v1.1.schema.json')),1),m=>m.assets.push({...m.assets[0],source:'release/notes.md'}),m=>m.assets[0].source='../escape',m=>m.assets[0].destinations['portable-zip']=['targeted-cv/../escape'],m=>m.assets[1].destinations['portable-zip']=['TARGETED-CV/skill.MD'],m=>m.assets[0].unexpected=true,m=>m.generated.push({source:'pretend.json'})];
 for(const change of mutate){const m=read('release/manifest.json');change(m);assert.equal(check()(root,{manifest:m}).status,'failed');}
});
test('unresolved, stale, omitted and unknown rights and missing notice mappings fail closed',()=>{
 const mutate=[r=>r.assets.pop(),r=>r.assets[0].source_sha256='0'.repeat(64),r=>r.assets[0].review_status='unresolved',r=>r.assets[0].required_notices=[],r=>r.assets[0].authorization_ref='self-approved',r=>r.assets[0].unknown=true,r=>r.assets[0].origin='external unknown'];
 for(const change of mutate){const r=read('release/rights.json');change(r);assert.equal(check()(root,{rights:r}).status,'failed');}
 const m=read('release/manifest.json');m.assets.find(a=>a.source==='THIRD_PARTY_NOTICES.md').destinations['plugin-zip'].pop();assert.equal(check()(root,{manifest:m}).status,'failed');
});
test('changed bytes, omitted core, undeclared core files and redirected files fail',()=>{
 const temp=freshTemp();try{
 for(const p of ['skills/targeted-cv','release','tests/portable-skill-release/fixtures'])fs.mkdirSync(path.join(temp,p),{recursive:true});
 const m=read('release/manifest.json');for(const a of m.assets){const dest=path.join(temp,a.source);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,a.source),dest);}
 for(const p of ['VERSION','package.json','release/manifest.json','release/rights.json','release/candidate.json'])fs.copyFileSync(path.join(root,p),path.join(temp,p));
 assert.equal(check()(temp).status,'passed');
 const first=path.join(temp,m.assets[0].source),saved=fs.readFileSync(first);fs.appendFileSync(first,'changed');assert.equal(check()(temp).status,'failed');fs.writeFileSync(first,saved);
 const extra=path.join(temp,'skills/targeted-cv/extra.md');fs.writeFileSync(extra,'unexpected');assert.equal(check()(temp).status,'failed');fs.unlinkSync(extra);
 fs.unlinkSync(first);assert.equal(check()(temp).status,'failed');fs.writeFileSync(first,saved);const directory=path.join(temp,'skills/targeted-cv/templates');const relative=path.relative(fs.realpathSync(temp),fs.realpathSync(directory));assert.equal(relative,path.join('skills','targeted-cv','templates'));fs.rmSync(directory,{recursive:true});fs.symlinkSync(path.join(root,'skills/targeted-cv/templates'),directory,process.platform==='win32'?'junction':'dir');assert.equal(check()(temp).status,'failed');
 }finally{removeTemp(temp);}
});

test('import is side-effect free and invalid rights report affected asset without source content',()=>{
 const {spawnSync}=require('node:child_process');const child=spawnSync(process.execPath,['-e','require('+JSON.stringify(path.join(root,'release/check.cjs'))+')'],{encoding:'utf8'});assert.equal(child.status,0);assert.equal(child.stdout,'');assert.equal(child.stderr,'');
 const r=read('release/rights.json');r.assets[0].review_status='unresolved';const result=check()(root,{rights:r});assert.equal(result.issues[0].category,'rights');assert.equal(result.issues[0].scope,r.assets[0].source);
 assert.throws(()=>removeTemp(os.tmpdir()),/cleanup requires/);
});
