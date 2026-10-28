'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('task7.1 requires actual current mixed-scope four-member evidence',()=>{
 const {checkBilingualEvidence}=require('./bilingual-evidence.cjs');
 assert.throws(()=>checkBilingualEvidence(null),/actual/);
 assert.throws(()=>checkBilingualEvidence({kind:'fixture-replay'}),/actual/);
});
if(process.env.TASK71_RECEIPT)test('actual bilingual evidence rejects altered scope, member, render and owner references',()=>{
 const {checkBilingualEvidence}=require('./bilingual-evidence.cjs'),r=JSON.parse(fs.readFileSync(process.env.TASK71_RECEIPT)),review=JSON.parse(fs.readFileSync(process.env.TASK71_REVIEW));
 assert.equal(checkBilingualEvidence(r,review).state,'passed');
 for(const mutate of [x=>x.profile.promoted_ids.push(x.profile.local_id),x=>x.stages.pop(),x=>x.stages.at(-1).sha256='0'.repeat(64),x=>x.pendingReport.application_complete=true,x=>x.runtimeHashes['SKILL.md']='0'.repeat(64),x=>x.stages.at(-1).renders[0].sha256='0'.repeat(64),x=>x.profile.operations[0].result.status='unconfirmed',x=>x.manualPreservation[0].after=null,x=>x.question.plan.question_batch.selected_ids=[]]){const changed=structuredClone(r);mutate(changed);assert.throws(()=>checkBilingualEvidence(changed,review));}assert.throws(()=>checkBilingualEvidence(r,{...review,state:'not_assessed'}));
});
