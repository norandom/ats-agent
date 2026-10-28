'use strict';
// Task-local evidence gate. Full M4 completion remains the separate task 7.3 gate.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function checkRevisionEvidence(r){
 assert.ok(r?.kind==='actual-application-only-revision','Missing actual application-only revision receipt');
 assert.ok(r.calls.length>20);assert.equal(r.profileWrite.status,'confirmed');
 assert.equal(hash(fs.readFileSync(r.reusable.path)),r.reusable.sha256);
 assert.equal(hash(fs.readFileSync(r.application.path)),r.application.sha256);
 assert.equal(r.binding.profile_version,'2.1');assert.equal(r.binding.schema_version,'1.2');
 for(const [name,sha]of Object.entries(r.runtimeHashes))assert.equal(hash(fs.readFileSync(path.resolve(__dirname,'../../skills/targeted-cv',name))),sha,'Changed runtime '+name);
 for(const value of Object.values(r.upstream))if(value?.path&&value.sha256)assert.equal(hash(fs.readFileSync(value.path)),value.sha256,'Changed owner artifact');assert.equal(r.manifestRevision.decision,'revise');assert.ok(r.calls.some(c=>c.name==='type_text'&&c.outcome==='returned'&&c.args.text.includes('Since September 2026')));assert.equal(r.stages.length,2);assert.equal(r.stages[0].documentId,r.stages[1].documentId);
 assert.notEqual(r.stages[0].artifact,r.stages[1].artifact);
 assert.deepEqual(r.manual.before,r.manual.after);assert.equal(r.overlap.withheld,true);assert.equal(r.overlap.mutationsWhileWithheld,0);assert.ok(r.overlap.resolution);
 for(const s of r.stages){assert.equal(hash(fs.readFileSync(s.artifact)),s.sha256);assert.equal(s.textExact,true);assert.equal(s.reopened,true);assert.equal(s.renders.length,s.structure.pages);assert.equal(s.artifactStable,true);assert.ok(s.footerFields.some(f=>f.instr==='PAGE'&&!f.locked));assert.ok(s.footerFields.some(f=>f.instr==='NUMPAGES'&&!f.locked));assert.equal(s.paragraphs.map(p=>p.text).join('\n'),s.text.text);for(const p of s.renders)assert.equal(hash(fs.readFileSync(p.path)),p.sha256);}
 assert.equal(r.review?.state,'passed','Actual host semantic and all-page visual review required');
 return {state:'passed',limits:['One fictional English CV; no bilingual/full-loop acceptance claim.']};
}
module.exports={checkRevisionEvidence,hash};
if(require.main===module){try{console.log(checkRevisionEvidence(JSON.parse(fs.readFileSync(process.argv[2]))));}catch(e){console.error(e.message);process.exitCode=1;}}
