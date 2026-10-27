'use strict';
// Default is offline controls. Actual mode requires all three explicit paths:
// VERIFICATION_MODE=actual; VERIFICATION_CV_RECEIPT, VERIFICATION_LETTER_RECEIPT,
// VERIFICATION_CURRENT_RECEIPT. Missing actual receipts fail; no test disappears.
const test=require('node:test'),assert=require('node:assert/strict');
const {load,sha256}=require('./manifest-fixture.cjs');
const {stableSerialize}=load('strategy-contract.md',['stableSerialize']);
const {verifyObservedDocument}=load('document-verification.md',['verifyObservedDocument']);
function gate(e,o){return verifyObservedDocument(e,o,stableSerialize);}
function fixture(kind='cv'){
 const session={document_id:'fictional',connection_id:'fictional-connection',snapshot_id:'fictional-snapshot',snapshot_sha256:sha256('observed snapshot'),saved_path:'private/fictional.docx',saved_sha256:sha256('actual fictional bytes')};
 return {entry:{id:'fictional',kind,language:'en',market:'DE',session},o:{before:{...session},after:{...session},bytesBefore:session.saved_sha256,bytesAfter:session.saved_sha256,reopened:true,editable:true,continuity:true,accessible:true,evidence_reference:'private/fictional-observation.json',producer:'controlled test',method:'supplied observations',observed_at:'2026-10-27T06:00:00Z',reviewedText:'Fictional Employer\nRole\n2024',bodyText:'Fictional Employer\nRole\n2024',structure:{paragraphs:3},readingOrder:{status:'passed',reason:'Employer, role and date association inspected.',associations:['employer-role-date']},pageCount:2,renders:[1,2].map(page=>({page,accessible:true,evidence_reference:'private/page-'+page+'.png',status:'passed',footerText:`Page ${page} / 2`})),fields:[{part:'footer:0',instr:'PAGE'},{part:'footer:0',instr:'NUMPAGES'}]}};
}
test('exact body and independent semantic judgments stay distinct',()=>{
 const {entry,o}=fixture();let r=gate(entry,o);assert.ok(r.checks.every(c=>c.status==='passed'));assert.equal(r.semanticReview.status,'not_assessed');
 o.bodyText+=' ';assert.equal(gate(entry,o).checks.find(c=>c.kind==='content').status,'failed');
});
test('stale bytes, changed snapshot, missing continuity and inaccessible evidence invalidate results',()=>{
 for(const change of [o=>o.bytesAfter=sha256('changed'),o=>o.after.snapshot_sha256=sha256('edit'),o=>o.continuity=false,o=>o.accessible=false,o=>o.reopened=false]){const {entry,o}=fixture();change(o);assert.ok(gate(entry,o).checks.every(c=>c.status==='not_assessed'));}
});
test('missing pages, body-only field codes and screenshots cannot pass independent checks',()=>{
 for(const [kind,change] of [['render',o=>o.renders.pop()],['pagination',o=>o.fields=[{part:'body',instr:'PAGE'},{part:'body',instr:'NUMPAGES'}]],['reading_order',o=>delete o.structure]]){const {entry,o}=fixture();change(o);assert.equal(gate(entry,o).checks.find(c=>c.kind===kind).status,'not_assessed');}
 const {entry,o}=fixture();o.renders[1].footerText='Page 1 / 2';assert.equal(gate(entry,o).checks.find(c=>c.kind==='pagination').status,'failed');
});
test('unobservable geometry and command arguments cannot pass letter checklist',()=>{
 const {entry,o}=fixture('cover_letter');o.checklistComplete=true;o.letterRules=[{rule_id:'fictional',source_url:'project-rule',edition:'1',authority:'project_choice',expected:'25 mm',measured:25,measurement_method:'command_args',evidence_reference:'private/row',status:'passed'}];
 assert.equal(gate(entry,o).checks.at(-1).status,'not_assessed');o.letterRules[0].measurement_method='render_pixels';assert.equal(gate(entry,o).checks.at(-1).status,'not_assessed');o.renderPixelsPerPoint=1.5;assert.equal(gate(entry,o).checks.at(-1).status,'passed');o.letterRules[0].measured=null;assert.equal(gate(entry,o).checks.at(-1).status,'not_assessed');
});
test('actual replay is explicitly separate and refuses absent receipts',()=>{
 const {replay}=require('./verification-replay.cjs');assert.throws(()=>replay(),/Both actual receipt paths required/);
 if(process.env.VERIFICATION_MODE==='actual'){
  const result=replay(process.env.VERIFICATION_CV_RECEIPT,process.env.VERIFICATION_LETTER_RECEIPT);
  assert.equal(result.documents.length,5);assert.equal(result.renderedPages,6);assert.equal(result.checklistRows,14);
  for(const d of result.documents){assert.equal(d.checks.find(c=>c.kind==='content').status,'passed');assert.equal(d.checks.find(c=>c.kind==='render').status,'passed');assert.equal(d.currentRevision,'not_assessed');}
  const fresh=require('./verification-replay.cjs').replayCurrent(process.env.VERIFICATION_CURRENT_RECEIPT);
  for(const kind of ['round_trip','content','reading_order','render'])assert.equal(fresh.checks.find(c=>c.kind===kind).status,'passed');
  assert.equal(fresh.checks.find(c=>c.kind==='letter_layout').status,'not_assessed');
  assert.equal(fresh.semanticReview.status,'not_assessed');
 } else { assert.ok(!process.env.VERIFICATION_MODE||process.env.VERIFICATION_MODE==='offline'); }
});
