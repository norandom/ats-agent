'use strict';
// Deterministic host adapter for the entry's readiness -> owner -> dispatch boundary.
// Filesystem effects below are offline controls, never claimed as WordCraft edits.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {load,sha256}=require('../wordcraft-application-documents/manifest-fixture.cjs');
const {inspectRefinement,inspectRefinementResume}=load('refinement-session.md',['inspectRefinement','inspectRefinementResume']);
const {createQuestionPlanner}=load('strategy-evidence.md',['createQuestionPlanner']);
const operationCode=fs.readFileSync(path.resolve(__dirname,'../../skills/targeted-cv/references/wordcraft-operations.md'),'utf8').match(/```javascript\r?\n([\s\S]*?)```/)[1];
const inspectDocumentOperation=new Function(operationCode+';return inspectDocumentOperation;')();
const {stableSerialize}=load('strategy-contract.md',['stableSerialize']);
const root=path.resolve(__dirname,'../..'),work=fs.mkdtempSync(path.join(root,'outputs/m4-task62-stop-'));
let serial=0;const cache=new Map();
const validateRecord=r=>{const bytes=JSON.stringify(r);if(cache.has(bytes))return cache.get(bytes);const f=path.join(work,`record-${++serial}.json`);fs.writeFileSync(f,bytes,{flag:'wx'});const out=spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(root,'skills/targeted-cv/schemas/refinement-session.schema.json'),f],{encoding:'utf8',windowsHide:true});assert.ok([0,1].includes(out.status),out.stderr);cache.set(bytes,out.status===0);return out.status===0;};
const ref=n=>({resolved_path:path.join(work,n),sha256:sha256(n)}),clone=structuredClone;
const record=()=>({schema_version:'1.0',application_id:'fictional-stop',session_id:'fictional-stop-session',selection:{profile:{...ref('profile.json'),schema_version:'2.1'},reusable_base:null,target_sha256:sha256('target'),settings_sha256:sha256('settings'),context:null},owner_artifacts:{strategy:null,document_manifest:null,document_session:null,predecessors:[]},questions:[],statements:[],choices:[],profile_operations:[],revisions:[],comparisons:[],stop_state:{state:'active',reason:null,pending_operation_refs:[],last_confirmed_deliverables:[]}});
const current=r=>({validateRecord,application_id:r.application_id,session_id:r.session_id,selection:clone(r.selection),sources_validated:true,context_confirmed:true,documents_inspected:true,owners_reconciled:true,dispositions_reassessed:true,reports_reassessed:true,checkpoint_confirmed:true});
function integrity(r,p,stop){
 const artifacts=[];function walk(x){if(!x||typeof x!=='object')return;if(x.resolved_path&&x.sha256)artifacts.push({ref:{resolved_path:x.resolved_path,sha256:x.sha256},application_id:r.application_id,validated:true});Object.values(x).forEach(walk);}walk(r);
 return inspectRefinement(r,{record:p,sha256:sha256(JSON.stringify(p))},{validateRecord,application_id:r.application_id,session_id:r.session_id,selection:clone(r.selection),hashRecord:x=>sha256(JSON.stringify(x)),artifacts,stop});
}
const binding={host_session:'offline-stop-control',generation:1},planner=createQuestionPlanner({current:()=>({binding,settings:{question_limit:3}})},{stableSerialize});
function hostTurn(r,observed,action,destination){
 const gate=inspectRefinementResume(r,observed);
 if(action==='question'){
  if(!gate.questions)return {status:'blocked',gate};
  return planner.questions({binding,questions:[{id:'question:scope',distinction_key:'scope',affected:[],text:'Which responsibility is supported?',rationale:'Clarify scope.',expected_effect:'Bound supported wording.',missing_distinction:'Decision authority.',priority:1,offer_order:0,disposition:'open',reopen_reason:null}],dispositions:[]});
 }
 if(!gate.mutations)return {status:'blocked',gate};
 // Normal document-owner guard still applies after refinement readiness.
 const owned=inspectDocumentOperation({operation:'save',binding:{id:'offline-document',nativeId:'offline-native',path:destination,connectionId:'offline'},observation:{nativeId:'offline-native',path:destination,connectionId:'offline',freshInspection:true},destination,destinationState:'source'});
 if(owned.decision!=='proceed')return {status:'blocked',owned};
 fs.writeFileSync(destination,'offline dispatched save effect',{flag:'wx'});return {status:'dispatched'};
}
test('entry readiness reaches real planner/file effect while active, then blocks every stop reason',()=>{
 const active=record();assert.equal(validateRecord(active),true);
 assert.equal(hostTurn(active,current(active),'question').value.question_batch.selected_ids.length,1);
 const positive=path.join(work,'positive.docx');assert.equal(hostTurn(active,current(active),'save',positive).status,'dispatched');assert.equal(fs.readFileSync(positive,'utf8'),'offline dispatched save effect');
 for(const state of ['accepted','declined','paused','exhausted']){
  const stopped=clone(active);stopped.stop_state={state,reason:'Fictional host stop observation.',pending_operation_refs:[ref('retained-intent.json')],last_confirmed_deliverables:[ref('last-confirmed.docx')]};
  const stop=state==='exhausted'?{state,exhaustion_assessed:true}:{state,user_request:true};assert.equal(integrity(stopped,active,stop).state,'passed');
  const observed=current(stopped);observed.checkpoint_confirmed=false; // A failed checkpoint never revokes a live stop.
  assert.equal(hostTurn(stopped,observed,'question').status,'blocked');
  for(const action of ['profile_update','edit','save','export']){
   const destination=path.join(work,state+'-'+action+'.docx');assert.equal(hostTurn(stopped,observed,action,destination).status,'blocked');assert.equal(fs.existsSync(destination),false);
  }
  // Even successful storage and continuation-shaped data cannot reopen a stopped record.
  assert.equal(inspectRefinementResume(stopped,{...current(stopped),user_continuation:true}).continuation_ready,true);
  assert.equal(hostTurn(stopped,{...current(stopped),user_continuation:true},'question').status,'blocked');
  const illicit=clone(stopped);illicit.questions=[{distinction_key:'new',question_id:'new',disposition:'pending',statement_ids:[],reason:'Attempted after stop.'}];assert.equal(integrity(illicit,stopped,null).state,'failed');
  const illicitWrite=clone(stopped);illicitWrite.profile_operations=[{id:'new-operation',proposal_ref:ref('proposal.json'),result_ref:null,statement_ids:[],destination_role:'application',status:'pending'}];assert.equal(integrity(illicitWrite,stopped,null).state,'failed');
  const resume=clone(stopped);resume.stop_state={state:'active',reason:null,pending_operation_refs:clone(stopped.stop_state.pending_operation_refs),last_confirmed_deliverables:clone(stopped.stop_state.last_confirmed_deliverables)};
  assert.equal(integrity(resume,stopped,null).state,'failed');assert.equal(integrity(resume,stopped,{state:'active',user_continuation:true,fresh_selection:true,unresolved_inspected:true}).state,'passed');
  // Fresh owner recovery is required even after an explicitly observed transition.
  assert.equal(hostTurn(resume,{...current(resume),owners_reconciled:false},'save',path.join(work,state+'-resume.docx')).status,'blocked');
  assert.deepEqual(stopped.stop_state.pending_operation_refs,[ref('retained-intent.json')]);
 }
});
test('stopping retains a dispatched uncertain member and rejects a replacement intent',()=>{
 const before=record();before.revisions=[{id:'revision-interrupted',source_baselines:clone(before.selection),affected_claim_ids:[],predecessor_manifest:null,members:[{kind:'cv',language:'en',manifest_document_id:'cv-en',logical_document_id:'offline-live',intent_ids:['original-intent'],receipt_refs:[],status:'uncertain',next_action:'Inspect original document-session intent through owner recovery, without replay.'}],verification_refs:[]}];
 const stopped=clone(before);stopped.stop_state={state:'paused',reason:'Fictional stop during uncertain dispatch.',pending_operation_refs:[ref('original-intent')],last_confirmed_deliverables:[]};
 assert.equal(integrity(stopped,before,{state:'paused',user_request:true}).state,'passed');assert.equal(hostTurn(stopped,current(stopped),'edit',path.join(work,'uncertain-replay.docx')).status,'blocked');
 const replaced=clone(stopped);replaced.revisions[0].members[0].intent_ids=['replacement-intent'];assert.equal(integrity(replaced,stopped,null).state,'failed');
 const hidden=clone(stopped);hidden.revisions=[];assert.equal(integrity(hidden,stopped,null).state,'failed');assert.equal(fs.existsSync(path.join(work,'uncertain-replay.docx')),false);
});
