'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');

test('actual flow rejects absent question-answer-scope evidence',()=>{
 const {checkFlowEvidence}=require('./refinement-flow-evidence.cjs');
 assert.throws(()=>checkFlowEvidence(null),/actual host/);
 assert.throws(()=>checkFlowEvidence({kind:'simulation'}),/actual host/);
});
test('current answered disposition must survive strategy and next planning',()=>{
 const {checkAnsweredContinuity}=require('./refinement-flow-evidence.cjs');
 const key='handover:monthly-review-scope-period',binding={canonical_sha256:'current'},d={distinction_key:key,status:'answered',binding,evidence:[{record_id:'new-fact'}]};
 const record={questions:[{distinction_key:key,disposition:'answered'}]},strategy={binding,dispositions:[d],questions:[{id:'question:handover-evolution',distinction_key:key,disposition:'answered'}]},next={question_batch:{selected_ids:[],suppressed_ids:[{id:'question:handover-evolution'}]},questions:strategy.questions};
 assert.doesNotThrow(()=>checkAnsweredContinuity(record,strategy,next,key));
 assert.throws(()=>checkAnsweredContinuity({...record,questions:[{distinction_key:key,disposition:'pending'}]},strategy,next,key),/answered/);
 assert.throws(()=>checkAnsweredContinuity(record,{...strategy,dispositions:[]},next,key),/answered/);
 assert.throws(()=>checkAnsweredContinuity(record,strategy,{...next,question_batch:{selected_ids:[{id:'question:handover-evolution'}],suppressed_ids:[]}},key),/repeat|suppress/);
});
if(process.env.TASK61_TRACE)test('actual flow preserves exact scope and private current record; tampering fails',()=>{
 const {checkFlowEvidence}=require('./refinement-flow-evidence.cjs'),trace=JSON.parse(fs.readFileSync(process.env.TASK61_TRACE));
 assert.equal(checkFlowEvidence(trace).state,'passed');
 for(const mutate of [t=>t.steps.splice(1,1),t=>t.review='not_assessed',t=>t.steps.find(s=>s.step==='route').choice.use='reusable',t=>t.record.sha256='0'.repeat(64),t=>t.sourceTurn.sha256='0'.repeat(64),t=>t.continuity.restored[0].status='pending',t=>t.continuity.next_plan.question_batch.selected_ids=[{namespace:'question',id:'question:handover-evolution'}]]){
  const changed=structuredClone(trace);mutate(changed);assert.throws(()=>checkFlowEvidence(changed));
 }
});
