'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const {createHarness,classifyCheck}=require('../targeted-application-strategy/foundation.cjs');
const {profile}=require('../targeted-application-strategy/fixtures.cjs'),{handoff}=require('../targeted-application-strategy/contract-fixture-current.cjs');
const adapter=require('../targeted-application-strategy/persistence-adapter.cjs');
const hash=b=>require('node:crypto').createHash('sha256').update(b).digest('hex');
(async()=>{
 const h=createHarness(),p=profile('operations',h.blank),a=await adapter(p);
 const modules={...h.load('strategy-contract.md',['stableSerialize','fingerprint','targetFingerprint','inspectStrategy','inspectApplicationContext','claimEligibility']),...h.load('profile-contract.md',['dispatchVersion']),...h.load('profile-validation.md',['evidenceView']),...h.load('profile-updates.md',['createProfileUpdates']),...h.load('strategy-evidence.md',['createQuestionPlanner','freezeOfferAnalysis']),...h.load('strategy-editorial.md',['inspectComposition','applyEditorialMethods']),...h.load('strategy-review.md',['reviewDiagnostics','reviewEditorial','compareRevisions'])};
 const {createStrategyWorkflow}=h.load('application-strategy.md',['createStrategyWorkflow']);
 let n=0,allowWrite=false,reassess=true,approve=true;
 let applicationSelection, history=null, persistence=null, reviews=new Map();
 const host={...a.host,currentApplicationSelection:()=>applicationSelection,session:'fictional-integration',intake:h.intake,readBytes:fs.readFileSync,decodeUtf8:b=>new TextDecoder('utf-8',{fatal:true}).decode(b),sha256:hash,
 userDecision:async reviewed=>approve?a.host.userDecision(reviewed):{decision:'declined',reviewed},
 discover:async()=>({available:false,installed:false}),offer:async()=>({choice:'fallback'}),embedded:async()=>({completed:true}),
 validateProfile:(v,taskRequest,applicationSelection)=>h.validate(v,{taskRequest,applicationSelection}),
 validate:async(schema,v)=>{const file=path.join(h.workspace,`handoff-${++n}.json`);fs.writeFileSync(file,JSON.stringify(v));const r=spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(h.skillRoot,schema),file],{encoding:'utf8',windowsHide:true});return {state:classifyCheck(r),findings:[]};},
 observeDispositionHistory:async()=>history,
 observeDispositionPersistence:async()=>persistence,
 reassessDisposition:async d=>reviews.get(d.distinction_key),
 reviewInventories:async v=>Object.fromEntries(v.draft.versions.map(d=>[d.language,{binding:v.binding,draft_sha256:d.sha256,claims:d.claims,inventory_complete:true,semantics_assessed:true}])),
 reviewEditorialJudgments:async()=>({}),observeDocumentArtifacts:async()=>[],
 authorizePrivateOutput:async destination=>allowWrite&&destination===path.join(h.workspace,'saved.json')?{resolved_path:destination,private_location:true,authorized:true}:null,
 writePrivate:async(destination,bytes)=>fs.writeFileSync(destination,bytes,{flag:'wx'})};
 const w=createStrategyWorkflow(host,modules);
 const bind=async input=>{applicationSelection={application_id:'fictional-application',target:{...input.target,sha256:modules.targetFingerprint(input.target,hash)},application_context_bytes:null,confirmation_observations:[]};return w.bind(input);};
 const rejected=[];
 const reject=(result,code)=>{assert.equal(result.status,'blocked');assert.ok(Array.isArray(result.issues)&&result.issues.length,'Coordinator rejection must return StrategyFinding issues');assert.ok(Object.hasOwn(result,'request'),'Coordinator rejection must declare request');if(code)assert.equal(result.issues[0].id,`finding:workflow-${code}`);rejected.push(...result.issues);return result;};
 reject(await w.assemble(null),'context_unavailable');
 w.select({workspace_root:h.workspace,facts_path:a.selectedPath});
 const seed=handoff(p,{...modules,sha256:hash});
 seed.editorial_methods=(await w.editorialMethods()).methods;
 assert.equal(seed.editorial_methods.find(m=>m.id==='editorial_method:embedded').executed,true);
 const input={target:seed.target,settings:seed.settings,evaluation_date:'2026-01-03',task_request:{task_id:'strategy',required:[]}};
 assert.equal((await bind(input)).status,'ready');
 const make=()=>{const v=structuredClone(seed),c=w.current();v.binding=c.binding;v.target=c.target;v.settings=c.settings;v.dispositions.forEach(d=>d.binding=c.binding);v.comparison=null;return v;};

 const keys=['answered','skipped','not_applicable','confirmed_gap','pending'];
 const dispositions=keys.map((status,i)=>({id:'disposition:continuity-'+i,binding:w.current().binding,distinction_key:'fictional-'+status,status,answer:status==='pending'?'Fictional answer awaiting selected persistence.':null,evidence:[],reopen_reason:null}));
 for(const d of dispositions)reviews.set(d.distinction_key,{retain:true,reason:'Fresh fictional meaning reassessment: unchanged relevant distinction.'});
 const initialBinding=w.current().binding;
 const scoped={...structuredClone(p),schema_version:'2.1',application_scope:{application_id:initialBinding.application_id,target_sha256:initialBinding.target_sha256,origin_profile:{schema_version:'2.0',resolved_path:a.selectedPath,sha256:initialBinding.canonical_sha256}}};
 const scopedPath=a.selectedPath;fs.writeFileSync(scopedPath,JSON.stringify(scoped));
 const selectScoped=()=>w.select({workspace_root:h.workspace,facts_path:scopedPath,application_selection:{application_id:initialBinding.application_id,target_sha256:initialBinding.target_sha256}});
 selectScoped();assert.equal((await bind(input)).status,'ready');
 assert.equal(await w.observeConfirmedUpdate(initialBinding,w.current().binding),null,'first fork never manufactures numeric continuity');
 history={current_binding:w.current().binding,previous_profile:p,dispositions,changed_fields:[]};
 let restored=await w.restoreDispositions();
 assert.equal(restored.length,5,'fork/resume preserves independently reassessed interaction dispositions');
 assert.deepEqual(restored.map(d=>d.status),keys);
 assert.ok(restored.every(d=>d.evidence.length===0));
 const evidence=seed.claims[0].evidence;
 reviews.set('fictional-pending',{retain:true,reason:'Fresh meaning review of the fictional persisted answer.',status:'answered',evidence});
 restored=await w.restoreDispositions();assert.equal(restored.find(d=>d.distinction_key==='fictional-pending').status,'pending');
 persistence={status:'confirmed',current_binding:w.current().binding,distinction_key:'fictional-pending',resulting_sha256:w.current().binding.canonical_sha256};
 restored=await w.restoreDispositions();assert.equal(restored.find(d=>d.distinction_key==='fictional-pending').status,'answered');assert.deepEqual(restored.at(-1).evidence,evidence);
 for(const invalid of [{...persistence,status:'authorized'},{...persistence,resulting_sha256:hash('wrong fictional bytes')},{...persistence,distinction_key:'another-distinction'}]){
  const good=persistence;persistence=invalid;assert.equal((await w.restoreDispositions()).at(-1).status,'pending');persistence=good;
 }
 reviews.set('fictional-answered',{retain:true,reason:' '});assert.equal((await w.restoreDispositions()).some(d=>d.status==='answered'&&d.distinction_key==='fictional-answered'),false);
 reviews.set('fictional-skipped',{retain:false,reason:'Material requirement changed.'});assert.equal((await w.restoreDispositions()).some(d=>d.status==='skipped'),false);
 reviews.set('fictional-pending',{retain:true,reason:'Reviewed but invalid scope metadata.',status:'answered',evidence:[{...evidence[0],pointer:'/application_scope'}]});assert.equal((await w.restoreDispositions()).at(-1).status,'pending');
 history.current_binding={...w.current().binding,application_id:'other-fictional-application'};assert.deepEqual(await w.restoreDispositions(),[]);
 history=null;assert.deepEqual(await w.restoreDispositions(),[]);
 // Directly observed update on the same 2.1 source uses real owner persistence, fresh validation and unchanged scope.
 const beforeDraft=make();beforeDraft.dispositions=dispositions.map(d=>({...d,binding:w.current().binding}));
 const before=await w.assemble(beforeDraft);assert.equal(before.status,'ready',JSON.stringify(before));
 const proposed=structuredClone(scoped);proposed.candidate.email='fictional-continuity@example.invalid';
 const decision=await w.prepareUpdate({proposal_id:'scoped-continuity',history_id:'scoped-continuity-history',scope:'application_fact_update',source_ids:['source-operations'],proposed_profile:proposed,changes:[{pointer:'/candidate/email',before:null,after:proposed.candidate.email,reason:'Fictional selected-source correction.'}]});
 assert.equal(decision.decision_state,'authorized');assert.equal((await w.persistUpdate(decision)).status,'confirmed');assert.equal((await bind(input)).status,'ready');
 assert.ok(await w.observeConfirmedUpdate(before.value.binding,w.current().binding));
 reviews.set('fictional-skipped',{retain:true,reason:'Fresh unchanged fictional distinction.'});
 reviews.set('fictional-pending',{retain:true,reason:'Still awaiting exact answer persistence.'});
 const restoredUpdate=await w.restoreDispositions();assert.ok(restoredUpdate.some(d=>d.status==='skipped'));assert.equal(restoredUpdate.at(-1).status,'pending');
 const after=await w.assemble({...make(),dispositions:restoredUpdate},{previous:before.value});assert.equal(after.status,'ready',JSON.stringify(after));assert.equal(after.value.comparison.status,'evidence_update');assert.ok(after.value.comparison.dimensions.filter(d=>d.delta!==null).every(d=>d.delta===0));
 selectScoped();assert.equal((await bind(input)).status,'ready');
 assert.equal(await w.observeConfirmedUpdate(before.value.binding,w.current().binding),null,'restart or arbitrary reselection loses the observed update chain');
 assert.deepEqual(await w.restoreDispositions(),[]);
 history={current_binding:w.current().binding,previous_profile:scoped,dispositions,changed_fields:[]};
 assert.ok((await w.restoreDispositions()).some(d=>d.status==='skipped'),'resume rechecks authenticated history without reviving numeric continuity');
 const restarted=await w.assemble(make(),{previous:after.value});assert.equal(restarted.status,'ready',JSON.stringify(restarted));assert.equal(restarted.value.comparison.status,'not_comparable');assert.ok(restarted.value.comparison.dimensions.every(d=>d.delta===null));
  // Task 9.1: an exact owned source-to-successor selection is directly observed continuity, not a fresh baseline.
  const cur=w.current(),beforeSucc=await w.assemble(make());
  assert.equal(beforeSucc.status,'ready',JSON.stringify(beforeSucc));
  const succProfile=structuredClone(cur.evidence.profile);succProfile.candidate.phone='fictional-successor-phone';
  const succPath=path.join(h.workspace,'successor-2.1.json');fs.writeFileSync(succPath,JSON.stringify(succProfile),{flag:'wx'});
  const obs={source:{resolved_path:cur.binding.resolved_path,sha256:cur.binding.canonical_sha256},destination:{resolved_path:succPath,sha256:hash(fs.readFileSync(succPath))},changed_fields:['/candidate/phone'],application_scope:cur.evidence.profile.application_scope};
  reject(await w.selectSuccessor({workspace_root:h.workspace,facts_path:succPath},{...obs,source:{...obs.source,sha256:hash('forged source bytes')}}),'successor_observation_invalid');
  reject(await w.selectSuccessor({workspace_root:h.workspace,facts_path:succPath},{...obs,destination:{resolved_path:cur.binding.resolved_path,sha256:cur.binding.canonical_sha256}}),'successor_observation_invalid');
  reject(await w.selectSuccessor({workspace_root:h.workspace,facts_path:succPath},{...obs,changed_fields:[]}),'successor_observation_invalid');
  reject(await w.selectSuccessor({workspace_root:h.workspace,facts_path:succPath},{...obs,application_scope:{application_id:'other-fictional-application'}}),'successor_observation_invalid');
  const sel=await w.selectSuccessor({workspace_root:h.workspace,facts_path:succPath,application_selection:{application_id:cur.binding.application_id,target_sha256:cur.binding.target_sha256}},obs);
  assert.equal(sel.status,'selected',JSON.stringify(sel));
  assert.equal((await bind(input)).status,'ready');
  assert.equal(w.current().binding.resolved_path,succPath,'live selection adopted the successor destination');
  const chainObs=await w.observeConfirmedUpdate(cur.binding,w.current().binding);
  assert.ok(chainObs,'owned successor selection produces the observed update chain');
  assert.equal(chainObs.previous_binding.resolved_path,cur.binding.resolved_path);
  assert.equal(chainObs.current_binding.resolved_path,succPath);
  assert.deepEqual(chainObs.changed_fields,['/candidate/phone']);
  const afterSucc=await w.assemble(make(),{previous:beforeSucc.value});
  assert.equal(afterSucc.status,'ready',JSON.stringify(afterSucc));
  assert.equal(afterSucc.value.comparison.status,'evidence_update','successor chain is a comparable evidence update, not a fresh baseline');
  assert.ok(afterSucc.value.comparison.dimensions.some(d=>d.delta!==null));
  selectScoped();assert.equal((await bind(input)).status,'ready');
  assert.equal(await w.observeConfirmedUpdate(cur.binding,w.current().binding),null,'arbitrary reselection never manufactures continuity');
  console.log('PASS fictional fork/resume distinction reassessment, retained dispositions, guarded pending promotion, current evidence checks and owned successor continuity.');
})().catch(e=>{console.error(e);process.exitCode=1;});
