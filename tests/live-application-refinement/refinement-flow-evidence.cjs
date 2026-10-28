'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {checkRevisionEvidence,hash}=require('./revision-evidence.cjs');
function checkAnsweredContinuity(record,strategy,next,key){
 assert.equal(record.questions.find(q=>q.distinction_key===key)?.disposition,'answered','Current private question must be answered');
 const d=strategy.dispositions.find(d=>d.distinction_key===key);assert.equal(d?.status,'answered','Current strategy must retain answered disposition');assert.deepEqual(d.binding,strategy.binding);assert.ok(d.evidence.length);
 const q=strategy.questions.find(q=>q.distinction_key===key);assert.equal(q?.disposition,'answered','Current strategy question must be answered');
 assert.ok(!next.question_batch.selected_ids.some(r=>r.id===q.id),'Next batch must not repeat the answered distinction');assert.ok(next.question_batch.suppressed_ids.some(r=>r.id===q.id),'Next batch must suppress answered distinction');
 assert.equal(next.questions.find(q=>q.distinction_key===key)?.disposition,'answered');
}
function checkFlowEvidence(t){
 assert.equal(t?.kind,'actual-host-refinement-flow','Missing actual host refinement flow');assert.equal(t.review,'passed');
 const read=ref=>{assert.equal(hash(fs.readFileSync(ref.resolved_path)),ref.sha256);return JSON.parse(fs.readFileSync(ref.resolved_path));};
 const turn=read(t.sourceTurn);assert.equal(turn.semanticReview.state,'supported');
 assert.deepEqual(t.steps.map(s=>s.step),['begin','question','answer','interpret','route','persist','live-revision']);
 const q=t.steps[1].plan;assert.equal(q.question_batch.limit,3);assert.equal(q.question_batch.selected_ids.length,1);assert.ok(q.questions[0].rationale);assert.ok(q.questions[0].missing_distinction);
 assert.equal(t.steps[2].text,turn.answer);assert.deepEqual(t.steps[3].statements,turn.statements);
 const chosen=turn.statements.find(s=>s.id===t.steps[4].choice.statement_ids[0]);assert.equal(t.steps[4].choice.use,'application_only');assert.equal(chosen.use,'application_only');
 const revision=read(t.steps[6].receipt);checkRevisionEvidence(revision);assert.equal(t.steps[5].result.status,'confirmed');assert.equal(t.steps[5].selected.sha256,revision.application.sha256);
 const profile=JSON.parse(fs.readFileSync(revision.application.path));assert.equal(profile.profile.at(-1).statement,chosen.text);
 for(const s of turn.statements.filter(s=>s.use==='pending'||s.classification==='hypothetical'))assert.ok(!profile.profile.some(f=>f.statement===s.text));
 assert.deepEqual(t.checkpoints.map(c=>c.phase),['answer-before-profile-mutation','exact-choice-before-profile-mutation','confirmed-profile-before-document-dispatch','answered-before-targeted-revision']);assert.ok(t.checkpoints.every(c=>c.result.status==='confirmed'));
 const record=read(t.record);assert.equal(record.application_id,revision.binding.application_id);assert.equal(record.selection.profile.sha256,revision.application.sha256);assert.ok(record.choices.some(c=>c.fact_use==='pending'));assert.equal(record.profile_operations[0].status,'confirmed');
 assert.equal(record.owner_artifacts.strategy.sha256,revision.upstream.revised_strategy.sha256);assert.equal(record.owner_artifacts.document_manifest.sha256,revision.upstream.revised_manifest.sha256);assert.ok(record.revisions.some(r=>r.members.some(m=>m.status==='verified'&&m.logical_document_id===revision.stages[1].documentId)));
 const strategy=read(record.owner_artifacts.strategy);checkAnsweredContinuity(record,strategy,t.continuity.next_plan,q.questions[0].distinction_key);assert.deepEqual(t.continuity.current_binding,strategy.binding);assert.deepEqual(t.continuity.restored,strategy.dispositions);
 assert.equal(t.recordIntegrity.state,'passed');assert.equal(t.finalCheckpoint.status,'confirmed');
 return {state:'passed',limits:t.limits};
}
module.exports={checkFlowEvidence,checkAnsweredContinuity};
if(require.main===module){try{console.log(checkFlowEvidence(JSON.parse(fs.readFileSync(process.argv[2]))));}catch(e){console.error(e.stack);process.exitCode=1;}}
