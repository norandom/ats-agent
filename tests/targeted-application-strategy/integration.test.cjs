'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const {createHarness,classifyCheck}=require('./foundation.cjs');
const {profile}=require('./fixtures.cjs'),{handoff}=require('./contract-fixture.cjs');
const adapter=require('./persistence-adapter.cjs');
const hash=b=>require('node:crypto').createHash('sha256').update(b).digest('hex');
(async()=>{
 const h=createHarness(),p=profile('operations',h.blank),a=await adapter(p);
 const modules={...h.load('strategy-contract.md',['stableSerialize','fingerprint','targetFingerprint','inspectStrategy']),...h.load('profile-contract.md',['dispatchVersion']),...h.load('profile-validation.md',['evidenceView']),...h.load('profile-updates.md',['createProfileUpdates']),...h.load('strategy-evidence.md',['createQuestionPlanner','freezeOfferAnalysis']),...h.load('strategy-editorial.md',['inspectComposition','applyEditorialMethods']),...h.load('strategy-review.md',['reviewDiagnostics','reviewEditorial','compareRevisions'])};
 const {createStrategyWorkflow}=h.load('application-strategy.md',['createStrategyWorkflow']);
 let n=0,allowWrite=false,reassess=true,approve=true;
 const host={...a.host,session:'fictional-integration',intake:h.intake,readBytes:fs.readFileSync,decodeUtf8:b=>new TextDecoder('utf-8',{fatal:true}).decode(b),sha256:hash,
 userDecision:async reviewed=>approve?a.host.userDecision(reviewed):{decision:'declined',reviewed},
 discover:async()=>({available:false,installed:false}),offer:async()=>({choice:'fallback'}),embedded:async()=>({completed:true}),
 validateProfile:(v,taskRequest)=>h.validate(v,{taskRequest}),
 validate:async(schema,v)=>{const file=path.join(h.workspace,`handoff-${++n}.json`);fs.writeFileSync(file,JSON.stringify(v));const r=spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(h.skillRoot,schema),file],{encoding:'utf8',windowsHide:true});return {state:classifyCheck(r),findings:[]};},
 reassessDisposition:async()=>({retain:reassess,reason:'Fictional host reassessment: unchanged recency distinction.'}),
 reviewInventories:async v=>Object.fromEntries(v.draft.versions.map(d=>[d.language,{binding:v.binding,draft_sha256:d.sha256,claims:d.claims,inventory_complete:true,semantics_assessed:true}])),
 reviewEditorialJudgments:async()=>({}),observeDocumentArtifacts:async()=>[],
 authorizePrivateOutput:async destination=>allowWrite&&destination===path.join(h.workspace,'saved.json')?{resolved_path:destination,private_location:true,authorized:true}:null,
 writePrivate:async(destination,bytes)=>fs.writeFileSync(destination,bytes,{flag:'wx'})};
 const w=createStrategyWorkflow(host,modules);
 const rejected=[];
 const reject=(result,code)=>{assert.equal(result.status,'blocked');assert.ok(Array.isArray(result.issues)&&result.issues.length,'Coordinator rejection must return StrategyFinding issues');assert.ok(Object.hasOwn(result,'request'),'Coordinator rejection must declare request');if(code)assert.equal(result.issues[0].id,`finding:workflow-${code}`);rejected.push(...result.issues);return result;};
 reject(await w.assemble(null),'context_unavailable');
 w.select({workspace_root:h.workspace,facts_path:a.selectedPath});
 const seed=handoff(p,{...modules,sha256:hash});
 seed.editorial_methods=(await w.editorialMethods()).methods;
 assert.equal(seed.editorial_methods.find(m=>m.id==='editorial_method:embedded').executed,true);
 const input={target:seed.target,settings:seed.settings,evaluation_date:'2026-01-03',task_request:{task_id:'strategy',required:[]}};
 assert.equal((await w.bind(input)).status,'ready');
 const make=()=>{const v=structuredClone(seed),c=w.current();v.binding=c.binding;v.target=c.target;v.settings=c.settings;v.dispositions.forEach(d=>d.binding=c.binding);v.comparison=null;return v;};
 reject(await w.assemble(null),'binding_mismatch');
 reject(await w.prepareUpdate({}),'update_request_invalid');
 reject(await w.assemble({...make(),unexpected:true}),'handoff_schema');
 let built=await w.assemble(make());assert.equal(built.status,'ready',JSON.stringify(built));assert.equal(built.value.state,'ready_for_document_draft');assert.ok(Object.isFrozen(built.value.claims[0]));assert.equal(built.checks.schema,'passed');assert.equal(built.checks.host_meaning,'not_assessed');
 const pendingDraft=make();pendingDraft.dispositions.push({id:'disposition:pending',binding:w.current().binding,distinction_key:'pending-contact',status:'pending',answer:'Fictional contact answer awaits saving.',evidence:[],reopen_reason:null});
 built=await w.assemble(pendingDraft);assert.equal(built.status,'ready',JSON.stringify(built));
 const previous=built.value;
 reject(await w.save(previous,path.join(h.workspace,'saved.json')),'private_output_denied');allowWrite=true;assert.equal((await w.save(previous,path.join(h.workspace,'saved.json'))).status,'saved');
 const proposed=structuredClone(p);proposed.candidate.email='fictional@example.invalid';
 const request={proposal_id:'integration-update',history_id:'integration-history',scope:'fact_update',source_ids:['source-operations'],proposed_profile:proposed,changes:[{pointer:'/candidate/email',before:null,after:proposed.candidate.email,reason:'Wholly fictional confirmed contact answer.'}]};
 const decision=await w.prepareUpdate(request);assert.equal(decision.decision_state,'authorized');assert.equal(w.current(),null);reject(await w.assemble(seed),'pending_update');reject(await w.bind(input),'pending_update');assert.equal(JSON.parse(fs.readFileSync(a.selectedPath)).candidate.email,null);
 reject(await w.persistUpdate(structuredClone(decision)),'update_decision_required');
 const persisted=await w.persistUpdate(decision);assert.equal(persisted.status,'confirmed');assert.equal(persisted.resulting_sha256,hash(fs.readFileSync(a.selectedPath)));assert.equal(w.current(),null);
 assert.equal((await w.bind(input)).status,'ready');
 const receipt=await w.observeConfirmedUpdate(previous.binding,w.current().binding);assert.ok(receipt);assert.deepEqual(receipt.previous_profile,p);assert.ok(receipt.changed_fields.includes('/candidate/email'));
 const restored=await w.restoreDispositions();assert.equal(restored.length,1);assert.equal(restored[0].status,'skipped');assert.deepEqual(restored[0].binding,w.current().binding);
 reassess=false;assert.deepEqual(await w.restoreDispositions(),[]);reassess=true;
 built=await w.assemble({...make(),dispositions:restored},{previous});assert.equal(built.status,'ready',JSON.stringify(built));assert.equal(built.value.comparison.status,'evidence_update');
 const unsupported=make();unsupported.claims[0].realizations[0].semantic_state='unsupported';built=await w.assemble(unsupported);assert.equal(built.status,'ready',JSON.stringify(built));assert.equal(built.value.state,'needs_revision');assert.deepEqual(built.value.positioning.selected_claims[0].languages,['de']);assert.ok(built.value.findings.some(f=>f.severity==='blocking'));assert.equal(built.value.questions.length,1);
 await w.bind({...input,task_request:{task_id:'missing',required:[{pointer:'/candidate/phone',record_id:p.candidate.id,reason:'Fictional contact requirement.'}]}});built=await w.assemble(make());assert.equal(built.value.state,'bounded');
 await w.bind({...input,target:{kind:'role',title:'Dispatch coordinator',context:null}});const role=make();role.criteria=[];role.inferred_needs=[];role.mappings=[];role.findings.forEach(f=>f.criteria=[]);role.claims.forEach(c=>c.target_references=[]);role.questions.forEach(q=>q.affected=q.affected.filter(r=>r.namespace==='claim'));role.positioning.criterion_set_sha256=modules.fingerprint([],hash);built=await w.assemble(role);assert.equal(built.status,'ready',JSON.stringify(built));assert.ok(built.value.diagnostics.filter(d=>d.dimension==='offer_coverage').every(d=>d.status==='not_assessed'));
 w.select({workspace_root:h.workspace,facts_path:a.selectedPath});assert.equal(w.current(),null);await w.bind(input);assert.equal(await w.observeConfirmedUpdate(previous.binding,w.current().binding),null);assert.deepEqual(await w.restoreDispositions(),[]);
 approve=false;const deniedProfile=structuredClone(w.current().evidence.profile);deniedProfile.candidate.email='other-fictional@example.invalid';
 const denied=await w.prepareUpdate({...request,proposal_id:'declined-update',history_id:'declined-history',proposed_profile:deniedProfile,changes:[{pointer:'/candidate/email',before:proposed.candidate.email,after:deniedProfile.candidate.email,reason:'Fictional declined correction.'}]});
 assert.equal(denied.decision_state,'declined');assert.notEqual((await w.persistUpdate(denied)).status,'confirmed');assert.equal(w.current(),null);assert.deepEqual(await w.restoreDispositions(),[]);
 w.select({workspace_root:h.workspace,facts_path:a.selectedPath});await w.bind(input);
 fs.appendFileSync(a.selectedPath,' ');assert.equal(w.current(),null);reject(await w.save(previous,path.join(h.workspace,'stale.json')),'context_unavailable');
 w.select({workspace_root:h.workspace,facts_path:'missing-fictional.json'});assert.equal(w.current(),null);assert.deepEqual(await w.restoreDispositions(),[]);
 const laboratory=h.select(profile('laboratory',h.blank));w.select({workspace_root:h.workspace,facts_path:laboratory.snapshot.selection.resolved_path});await w.bind(input);assert.equal(JSON.stringify(w.current()).includes('candidate-operations'),false);
 const invalid=profile('laboratory',h.blank);invalid.candidate.name=42;const invalidSelection=h.select(invalid);w.select({workspace_root:h.workspace,facts_path:invalidSelection.snapshot.selection.resolved_path});const failed=await w.bind(input);assert.equal(failed.status,'blocked');assert.ok(failed.issues.length);assert.ok(Object.hasOwn(failed,'request'));rejected.push(...failed.issues);reject(await w.assemble(null),'context_unavailable');
 const schema=JSON.parse(fs.readFileSync(path.join(h.skillRoot,'schemas/application-strategy.schema.json')));
 const failureSchema=path.join(h.workspace,'workflow-findings.schema.json'),failures=path.join(h.workspace,'workflow-findings.json');
 fs.writeFileSync(failureSchema,JSON.stringify({$schema:schema.$schema,type:'array',items:{$ref:'#/$defs/StrategyFinding'},$defs:schema.$defs}));fs.writeFileSync(failures,JSON.stringify(rejected));
 const checked=spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',failureSchema,failures],{encoding:'utf8',windowsHide:true});assert.equal(checked.status,0,checked.stdout+checked.stderr);
 console.log('PASS integrated actual upstream persistence, fresh validation, continuity, reassessment, private handoff states, role flow and invalidation. Host semantic callbacks are explicit fictional test adapters.');
})().catch(e=>{console.error(e);process.exitCode=1;});

