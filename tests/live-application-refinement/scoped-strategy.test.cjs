'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const {createHarness,classifyCheck}=require('../targeted-application-strategy/foundation.cjs');
const {profile}=require('../targeted-application-strategy/fixtures.cjs');
const {handoff}=require('../targeted-application-strategy/contract-fixture-current.cjs');
const hash=b=>require('node:crypto').createHash('sha256').update(b).digest('hex');
(async()=>{
 const h=createHarness(),base=profile('operations',h.blank);
 const modules={...h.load('strategy-contract.md',['stableSerialize','fingerprint','targetFingerprint','inspectStrategy','inspectApplicationContext','claimEligibility','canonicalEvidenceIssues']),...h.load('profile-contract.md',['dispatchVersion']),...h.load('profile-validation.md',['evidenceView']),...h.load('profile-updates.md',['createProfileUpdates']),...h.load('strategy-evidence.md',['createQuestionPlanner','freezeOfferAnalysis']),...h.load('strategy-editorial.md',['inspectComposition','applyEditorialMethods']),...h.load('strategy-review.md',['reviewDiagnostics','reviewEditorial','compareRevisions'])};
 const {createStrategyContext,createStrategyWorkflow}=h.load('application-strategy.md',['createStrategyContext','createStrategyWorkflow']);
 const seed=handoff(base,{...modules,sha256:hash});
 const app={application_id:'fictional-scope-application',target_sha256:seed.target.sha256};
 let live={...app,target:seed.target,application_context_bytes:null,confirmation_observations:[]},during=null,sequence=0;
 const selection=()=>({application_id:live.application_id,target_sha256:live.target.sha256});
 const validate=async(schema,v)=>{const file=path.join(h.workspace,`binding-${++sequence}.json`);fs.writeFileSync(file,JSON.stringify(v));const r=spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(h.skillRoot,schema),file],{encoding:'utf8',windowsHide:true});return {state:classifyCheck(r),findings:[]};};
 const host={session:'fictional-scope-session',currentSelection:()=>h.intake.snapshot(),currentApplicationSelection:()=>structuredClone(live),readBytes:fs.readFileSync,decodeUtf8:b=>new TextDecoder('utf-8',{fatal:true}).decode(b),sha256:hash,...modules,validate,
 validateProfile:async(p,taskRequest,applicationSelection)=>{assert.deepEqual(applicationSelection,selection());const result=await h.validate(p,{taskRequest,applicationSelection});if(during)during();return result;}};
 const c=createStrategyContext(host,modules),input=()=>({snapshot:h.intake.snapshot(),target:live.target,settings:seed.settings,evaluation_date:'2026-01-03'}),bind=()=>c.bindStrategy(input());
 h.select(base);let r=await bind();assert.equal(r.status,'ready');assert.equal(r.value.binding.schema_version,'1.2');assert.equal(r.value.binding.application_id,app.application_id);assert.equal(r.value.application_context,null);
 const scope={...app,origin_profile:{schema_version:'2.0',resolved_path:'/fictional/reusable.json',sha256:hash(JSON.stringify(base))}};
 const scoped={...structuredClone(base),schema_version:'2.1',application_scope:scope};
 const selectedPath=path.join(h.workspace,'scoped.json');fs.writeFileSync(selectedPath,JSON.stringify(scoped));
 const select=()=>h.intake.select({workspace_root:h.workspace,facts_path:selectedPath,application_selection:app});
 assert.equal(select().status,'selected');r=await bind();assert.equal(r.status,'ready');assert.equal(r.value.binding.profile_version,'2.1');
 const snapshot=structuredClone(r.value),claim=seed.claims[0],handoffValue={...seed,schema_version:'1.2',binding:r.value.binding};
 assert.equal(modules.claimEligibility(claim,handoffValue,{...host,...live,profile:scoped,binding:r.value.binding}).state,'eligible');
 for(const application_id of [null,'','other']){live.application_id=application_id;assert.equal(c.current(),null);assert.notEqual((await bind()).status,'ready');live.application_id=app.application_id;assert.equal((await bind()).status,'ready');}
 for(const change of [()=>live.application_id='other',()=>{live.target={kind:'role',title:'Other fictional role',context:null};live.target.sha256=modules.targetFingerprint(live.target,hash);},()=>fs.appendFileSync(selectedPath,' ')]){
  live={...app,target:seed.target,application_context_bytes:null,confirmation_observations:[]};fs.writeFileSync(selectedPath,JSON.stringify(scoped));select();during=change;assert.notEqual((await bind()).status,'ready');assert.equal(c.current(),null);during=null;
 }
 live={...app,target:seed.target,application_context_bytes:null,confirmation_observations:[]};fs.writeFileSync(selectedPath,JSON.stringify(scoped));select();assert.equal((await bind()).status,'ready');
 const wrong={...structuredClone(scoped),application_scope:{...scope,application_id:'other'}};assert.equal(modules.claimEligibility(claim,handoffValue,{...host,...live,profile:wrong,binding:snapshot.binding}).state,'invalid');
 for(const [record_id,pointer] of [['fictional-history','/change_history/0/reason'],['fictional-authorization','/change_history/0/authorization'],['scope','/application_scope'],['origin','/application_scope/origin_profile']])assert.ok(modules.canonicalEvidenceIssues({...claim.evidence[0],record_id,pointer},scoped).length,'metadata cannot be career support');
 const current={...seed,schema_version:'1.2',binding:snapshot.binding};current.dispositions.forEach(d=>d.binding=snapshot.binding);
 assert.equal((await validate('schemas/application-strategy.schema.json',current)).state,'passed');
 const rejectedScope=await modules.inspectStrategy(current,{...host,...live,profile:wrong,binding:snapshot.binding});assert.equal(rejectedScope.deterministic,'failed');assert.ok(rejectedScope.findings.some(f=>f.code==='profile_scope'));
 for(const invalid of [{...current,schema_version:'1.1'},{...current,binding:{...current.binding,application_id:null}},{...current,binding:{...current.binding,profile_version:'2.2'}}])assert.equal((await validate('schemas/application-strategy.schema.json',invalid)).state,'failed');
 const historical=structuredClone(seed);historical.schema_version='1.1';historical.binding={...historical.binding,schema_version:'1.1',application_id:null};historical.dispositions.forEach(d=>d.binding=historical.binding);
 assert.equal((await validate('schemas/application-strategy-v1.1.schema.json',historical)).state,'passed');
 // Real owner persistence with actual backup, ACL-preserving replacement and reopened validation.
 const a=await require('../targeted-application-strategy/persistence-adapter.cjs')(base);fs.writeFileSync(a.selectedPath,JSON.stringify(scoped));
 const w=createStrategyWorkflow({...a.host,...host,intake:h.intake},modules);w.select({workspace_root:h.workspace,facts_path:a.selectedPath,application_selection:app});assert.equal((await w.bind(input())).status,'ready');
 const proposed=structuredClone(scoped);proposed.candidate.email='scoped-fictional@example.invalid';
 const req={proposal_id:'scoped-answer',history_id:'scoped-answer-history',scope:'application_fact_update',source_ids:['source-operations'],proposed_profile:proposed,changes:[{pointer:'/candidate/email',before:null,after:proposed.candidate.email,reason:'Fictional application-only career correction.'}]};
 assert.equal((await w.prepareUpdate({...req,scope:'fact_update'})).status,'blocked');assert.ok(w.current());
 let decision=await w.prepareUpdate(req);assert.equal(decision.decision_state,'authorized');assert.equal(w.current(),null);assert.notEqual((await w.bind(input())).status,'ready');
 const authorizedBytes=fs.readFileSync(a.selectedPath);live.application_id='other';assert.equal((await w.persistUpdate(decision)).status,'blocked');assert.deepEqual(fs.readFileSync(a.selectedPath),authorizedBytes);assert.equal(w.current(),null);
 live.application_id=app.application_id;w.select({workspace_root:h.workspace,facts_path:a.selectedPath,application_selection:app});assert.equal((await w.bind(input())).status,'ready');decision=await w.prepareUpdate(req);assert.equal(decision.decision_state,'authorized');
 assert.equal((await w.persistUpdate(structuredClone(decision))).status,'blocked');assert.equal((await w.persistUpdate(decision)).status,'confirmed');assert.equal(w.current(),null);
 assert.equal((await w.bind(input())).status,'ready');assert.equal(w.current().evidence.profile.candidate.email,proposed.candidate.email);assert.deepEqual(w.current().evidence.profile.application_scope,scope);
 w.select({workspace_root:h.workspace,facts_path:a.selectedPath,application_selection:app});assert.equal(w.current(),null);assert.equal(await w.observeConfirmedUpdate(snapshot.binding,snapshot.binding),null);
 h.select(base);live.target={kind:'role',title:'Fictional dispatch role',context:null};live.target.sha256=modules.targetFingerprint(live.target,hash);r=await bind();assert.equal(r.status,'ready');assert.equal(r.value.binding.application_id,app.application_id);assert.equal(r.value.job_specific_coverage,false);
 assert.deepEqual(modules.inspectApplicationContext({...handoffValue,target:live.target,binding:r.value.binding,application_context:null},{...host,...live}),[]);
 console.log(`PASS scoped strategy 1.2: exact scope, async/current guards, active career support, historical schema, selected-scope persistence/reselection and role-only limits; ${sequence} schema validations.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
