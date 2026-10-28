'use strict';
// Bounded fictional actor experiment. Host interpretations are supplied explicitly;
// shipped owners handle persistence/composition and the existing MCP driver edits DOCX.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {load,sha256}=require('../wordcraft-application-documents/manifest-fixture.cjs');
const {run}=require('./revision-live.cjs');
async function experiment(cli,endpoint,destination,turnFile){
 const turn=JSON.parse(fs.readFileSync(turnFile)),out=path.resolve(destination);
 assert.equal(turn.actor,'Fictional applicant scripted by the actual host');
 assert.equal(turn.semanticReview.reviewer,'actual host');assert.equal(turn.semanticReview.state,'supported');
 const chosen=turn.statements.find(s=>s.id==='fact-application-handover-review');
 assert.equal(chosen.classification,'career_evidence');assert.equal(chosen.use,'application_only');
 const trace={kind:'actual-host-refinement-flow',actor:turn.actor,sourceTurn:{resolved_path:path.resolve(turnFile),sha256:sha256(fs.readFileSync(turnFile))},steps:[],review:'not_assessed'};let writer,record,priorInteraction,confirmedFork;
 const save=()=>fs.writeFileSync(path.join(out,'flow-trace.json'),JSON.stringify(trace,null,2));
 const result=await run(cli,endpoint,out,null,{
  onBaseline:async baseline=>{
   trace.selection={binding:baseline.strategy.binding,target:baseline.strategy.target,settings:baseline.strategy.settings,positioning:baseline.strategy.positioning.contribution_thesis,source:'freshly selected owner artifacts; no memory reconstruction'};
   const q={id:'question:handover-evolution',distinction_key:'handover:monthly-review-scope-period',affected:[{namespace:'claim',id:baseline.strategy.claims[0].id}],text:turn.question,rationale:'Clarify the contribution beyond checklist introduction without implying staffing authority.',expected_effect:'Select concrete handover evidence for the dispatch role.',missing_distinction:'Later activity, responsibility and temporal scope.',priority:3,offer_order:0,disposition:'open',reopen_reason:null};
   const plan=load('strategy-evidence.md',['createQuestionPlanner']).createQuestionPlanner({current:baseline.workflow.current},baseline.trusted).questions({binding:baseline.strategy.binding,questions:[q],dispositions:[]});assert.equal(plan.status,'ready',JSON.stringify(plan));
   assert.equal(plan.value.question_batch.limit,3);assert.deepEqual(plan.value.question_batch.selected_ids.map(x=>x.id),[q.id]);
   priorInteraction={question:structuredClone(q),profile:JSON.parse(fs.readFileSync(baseline.strategy.binding.resolved_path)),disposition:{id:'disposition:handover-evolution',binding:structuredClone(baseline.strategy.binding),distinction_key:q.distinction_key,status:'pending',answer:turn.answer,evidence:[],reopen_reason:null}};
   trace.steps.push({step:'begin',observation:trace.selection},{step:'question',plan:plan.value},{step:'answer',source:trace.sourceTurn,text:turn.answer},{step:'interpret',statements:turn.statements,review:turn.semanticReview});save();
   writer=require('./refinement-flow-record.cjs').createRecordWriter(out,baseline.strategy.binding.application_id,'task61-host-session');
   const selected=writer.observeArtifact(writer.ref(baseline.strategy.binding.resolved_path));writer.observeArtifact(trace.sourceTurn);
   const context=writer.observeArtifact(writer.retain('selected-context',baseline.strategy.application_context));
   record={schema_version:'1.0',session_id:'task61-host-session',application_id:baseline.strategy.binding.application_id,selection:{profile:{...selected,schema_version:'2.0'},reusable_base:null,target_sha256:baseline.strategy.binding.target_sha256,settings_sha256:baseline.strategy.binding.settings_sha256,context},owner_artifacts:{strategy:null,document_manifest:null,document_session:null,predecessors:[]},questions:[{distinction_key:q.distinction_key,question_id:q.id,disposition:'pending',statement_ids:[chosen.id],reason:'Answer interpreted; selected-source persistence remains pending.'}],statements:turn.statements.map(s=>({id:s.id,source_turn_ref:trace.sourceTurn,supplied_text:s.text,classification:s.classification,uncertainty:s.uncertainty,claim_ids:[],question_ids:s.id===chosen.id?[q.id]:[],temporal_qualifiers:s.temporal_qualifiers})),choices:turn.statements.filter(s=>s.classification==='career_evidence').map(s=>({id:'choice-'+s.id,statement_ids:[s.id],fact_use:'pending',proposal_sha256:null,destinations:[],decision_ref:null})),profile_operations:[],revisions:[],comparisons:[],stop_state:{state:'active',reason:null,pending_operation_refs:[],last_confirmed_deliverables:[]}};
   trace.checkpoints=[{phase:'answer-before-profile-mutation',result:await writer.save(record)}];save();
  },
  userDecision:async reviewed=>{
   assert.equal(reviewed.scope,'application_fork');assert.equal(reviewed.proposed_profile.profile.at(-1).statement,chosen.text);
   assert.equal(reviewed.proposed_profile.profile.filter(s=>s.id===chosen.id).length,1);
   for(const s of turn.statements.filter(s=>s.use==='pending'||s.classification==='hypothetical'))assert.ok(!reviewed.proposed_profile.profile.some(p=>p.statement===s.text));
   const decision={decision:'approved',reviewed,authorization:{id:'task61-actor-exact-choice',scope:reviewed.scope,request_reference:'Actual host scripted fictional applicant choice: only fact-application-handover-review application-only, reusable unchanged; other career statement pending.',approved_at:new Date().toISOString(),proposal_id:reviewed.proposal_id,resolved_path:reviewed.resolved_path}};
   trace.steps.push({step:'route',choice:{statement_ids:[chosen.id],use:chosen.use},proposal:reviewed,decision});
   const decisionRef=writer.observeArtifact(writer.retain('profile-owner-decision',decision)),choice=record.choices.find(c=>c.statement_ids.includes(chosen.id));Object.assign(choice,{fact_use:'application_only',proposal_sha256:sha256(JSON.stringify(reviewed.proposed_profile)),destinations:[{role:'application',resolved_path:reviewed.resolved_path}],decision_ref:decisionRef});writer.observed.choices=[structuredClone(choice)];
   trace.checkpoints.push({phase:'exact-choice-before-profile-mutation',result:await writer.save(record)});save();return decision;
  },
  afterProfile:async profileRun=>{
   confirmedFork={path:profileRun.dest,result:structuredClone(profileRun.profileWrite)};assert.equal(confirmedFork.result.status,'confirmed');assert.equal(sha256(fs.readFileSync(confirmedFork.path)),confirmedFork.result.resulting_sha256);
   const source=writer.observeArtifact(writer.ref(profileRun.source)),app=writer.observeArtifact(writer.ref(profileRun.dest));record.selection.profile={...app,schema_version:'2.1'};record.selection.reusable_base=source;
   const decisionRef=record.choices.find(c=>c.fact_use==='application_only').decision_ref,resultRef=writer.observeArtifact(writer.retain('profile-owner-result',profileRun.profileWrite));
   const operation={id:'profile-fork',proposal_ref:decisionRef,result_ref:resultRef,statement_ids:[chosen.id],destination_role:'application',status:'confirmed'};record.profile_operations=[operation];writer.observed.profile_operations=[structuredClone(operation)];
   trace.checkpoints.push({phase:'confirmed-profile-before-document-dispatch',result:await writer.save(record)});save();
  },
  revisedInteraction:{
   questions:()=>[structuredClone(priorInteraction.question)],
   history:async binding=>{assert.equal(binding.application_id,priorInteraction.disposition.binding.application_id);assert.equal(binding.resolved_path,confirmedFork.path);assert.equal(binding.canonical_sha256,confirmedFork.result.resulting_sha256);return {current_binding:binding,previous_profile:structuredClone(priorInteraction.profile),dispositions:[structuredClone(priorInteraction.disposition)],changed_fields:['/profile','/sources','/application_scope']};},
   reassess:async(d,previousProfile,currentProfile,changed,context)=>{
    assert.equal(d.answer,turn.answer);assert.deepEqual(previousProfile,priorInteraction.profile);assert.equal(d.distinction_key,priorInteraction.question.distinction_key);assert.equal(currentProfile.profile.at(-1).statement,chosen.text);assert.equal(context.binding.resolved_path,confirmedFork.path);
    return {retain:true,status:'answered',reason:'Actual host reviewed the directly persisted monthly review answer: additive since September 2026, no staffing or route approval; same target distinction.',evidence:[{record_id:chosen.id,pointer:'/profile/'+(currentProfile.profile.length-1)+'/statement',source_ids:['source-application-answer'],original_state:'supported',observation_limit:'Actual fictional host answer since September 2026; no earlier attribution.'}]};
   },
   persistence:async(d,binding)=>{assert.equal(d.distinction_key,priorInteraction.question.distinction_key);assert.equal(binding.resolved_path,confirmedFork.path);assert.equal(sha256(fs.readFileSync(confirmedFork.path)),confirmedFork.result.resulting_sha256);assert.equal(binding.canonical_sha256,confirmedFork.result.resulting_sha256);return {status:'confirmed',current_binding:binding,distinction_key:d.distinction_key,resulting_sha256:confirmedFork.result.resulting_sha256};},
   observe:async owner=>{
    const answered=owner.restored.find(d=>d.distinction_key===priorInteraction.question.distinction_key);assert.equal(answered?.status,'answered');assert.equal(owner.next_plan.question_batch.selected_ids.length,0);assert.ok(owner.next_plan.question_batch.suppressed_ids.some(q=>q.id===priorInteraction.question.id));
    trace.continuity={restored:owner.restored,next_plan:owner.next_plan,current_binding:owner.strategy.binding};
    record.questions[0]={...record.questions[0],disposition:'answered',reason:'Strategy restoreDispositions confirmed selected persistence and semantic review; next planning suppresses this distinction.'};writer.observed.questions=[structuredClone(record.questions[0])];
    record.owner_artifacts.strategy=writer.observeArtifact(writer.retain('strategy-answer-snapshot',owner.strategy));
    trace.checkpoints.push({phase:'answered-before-targeted-revision',result:await writer.save(record)});save();
   }
  }
 });
 const profile=JSON.parse(fs.readFileSync(result.application.path));assert.equal(profile.profile.at(-1).statement,chosen.text);
 trace.steps.push({step:'persist',result:result.profileWrite,selected:result.application,binding:result.binding},{step:'live-revision',receipt:{resolved_path:path.join(out,'receipt.json'),sha256:sha256(fs.readFileSync(path.join(out,'receipt.json')))},currentDocumentId:result.stages[1].documentId,artifact:result.stages[1].artifact});
 trace.runtimeHashes=result.runtimeHashes;trace.record=writer.ref(path.join(out,'refinement-checkpoint.json'));trace.limits=['One fictional English CV revised through actual MCP. Other scripted statements exercise host classification and pending scope, not a full bilingual acceptance.','Question and applicant turns are scripted fictional actors. Persistence, strategy validation, MCP edits, readback, save/reopen and renders are actual.'];save();
 return trace;
}
module.exports={experiment};
async function finalize(destination){
 const out=path.resolve(destination),traceFile=path.join(out,'flow-trace.json'),trace=JSON.parse(fs.readFileSync(traceFile)),receiptFile=path.join(out,'receipt.json'),r=JSON.parse(fs.readFileSync(receiptFile));
 require('./revision-evidence.cjs').checkRevisionEvidence(r); // Includes actual host review and current runtime/owner hashes.
 const checkpoint=path.join(out,'refinement-checkpoint.json'),previousBytes=fs.readFileSync(checkpoint),record=JSON.parse(previousBytes);
 const writer=require('./refinement-flow-record.cjs').createRecordWriter(out,r.binding.application_id,'task61-host-session');writer.observePrevious(previousBytes);
 // Authenticate exact observed host choice against the original owner proposal and
 // the freshly read selected profile, rather than adopting approvals from a record.
 const route=trace.steps.find(s=>s.step==='route'),app=JSON.parse(fs.readFileSync(r.application.path));assert.equal(app.profile.at(-1).statement,route.proposal.proposed_profile.profile.at(-1).statement);assert.equal(route.decision.reviewed.resolved_path,r.application.path);
 const known=[trace.sourceTurn,writer.ref(r.application.path),writer.ref(r.reusable.path),writer.ref(path.join(out,'selected-context.json')),writer.ref(path.join(out,'profile-owner-decision.json')),writer.ref(path.join(out,'profile-owner-result.json'))];for(const ref of known)writer.observeArtifact(ref);
 writer.observed.choices=record.choices.filter(c=>c.fact_use!=='pending').map(c=>{assert.deepEqual(JSON.parse(fs.readFileSync(c.decision_ref.resolved_path)),route.decision);return structuredClone(c);});
 writer.observed.profile_operations=record.profile_operations.map(op=>{assert.deepEqual(JSON.parse(fs.readFileSync(op.result_ref.resolved_path)),r.profileWrite);return structuredClone(op);});
 const strategy=writer.observeArtifact(writer.ref(r.upstream.revised_strategy.path)),manifest=writer.observeArtifact(writer.ref(r.upstream.revised_manifest.path)),session=writer.observeArtifact(writer.ref(receiptFile)),predecessor=writer.observeArtifact(writer.ref(r.upstream.predecessor_manifest.path));
 const currentStrategy=JSON.parse(fs.readFileSync(strategy.resolved_path));require('./refinement-flow-evidence.cjs').checkAnsweredContinuity(record,currentStrategy,trace.continuity.next_plan,trace.steps[1].plan.questions[0].distinction_key);writer.observed.questions=structuredClone(record.questions);
 record.owner_artifacts={strategy,document_manifest:manifest,document_session:session,predecessors:[predecessor]};
 const ownerManifest=JSON.parse(fs.readFileSync(manifest.resolved_path));
 const members=ownerManifest.documents.map(d=>({kind:d.kind,language:d.language,manifest_document_id:d.id,logical_document_id:d.id==='cv-en'?r.stages[1].documentId:null,intent_ids:d.id==='cv-en'?r.intents.map((_,i)=>session.resolved_path+'#/intents/'+i):[],receipt_refs:d.id==='cv-en'?[session]:[],status:d.id==='cv-en'?'verified':'pending',next_action:d.id==='cv-en'?null:'Not authored in this bounded English-CV experiment; retain independent member progress.'}));
 record.revisions=[{id:'current-live-revision',source_baselines:structuredClone(record.selection),affected_claim_ids:[],predecessor_manifest:predecessor,members,verification_refs:[session]}];
 const verified=members.find(m=>m.status==='verified');writer.observed.members=[{revision_id:'current-live-revision',member:structuredClone(verified),selection:structuredClone(record.selection),owner_artifacts:structuredClone(record.owner_artifacts),guards:{confirmed_effect:true,current_supported_inventory:true,mandatory_checks_passed:true}}];
 trace.recordIntegrity=writer.inspect(record,{record:JSON.parse(previousBytes),sha256:sha256(previousBytes)});assert.equal(trace.recordIntegrity.state,'passed',JSON.stringify(trace.recordIntegrity));trace.finalCheckpoint=await writer.save(record);trace.record=writer.ref(checkpoint);
 trace.steps.find(s=>s.step==='live-revision').receipt=session;trace.review='passed';fs.writeFileSync(traceFile,JSON.stringify(trace,null,2));require('./refinement-flow-evidence.cjs').checkFlowEvidence(trace);console.log('PASS current actual host flow, private owner integrity and durable checkpoint');
}
module.exports.finalize=finalize;
if(require.main===module)(process.argv[2]==='finalize'?finalize(process.argv[3]):experiment(...process.argv.slice(2))).catch(e=>{console.error(e.stack);process.exitCode=1;});
