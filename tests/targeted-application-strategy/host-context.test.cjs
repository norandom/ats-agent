'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {createHarness}=require('./foundation.cjs');
const fixtures=require('./fixtures.cjs');
const sha256=b=>require('node:crypto').createHash('sha256').update(b).digest('hex');
(async()=>{
 const h=createHarness(),p=fixtures.profile('operations',h.blank);
 const contracts=h.load('strategy-contract.md',['stableSerialize','fingerprint','targetFingerprint','inspectApplicationContext','claimEligibility']);
 const {createStrategyContext}=h.load('application-strategy.md',['createStrategyContext']);
 const selected=h.select(p),before=fs.readFileSync(selected.snapshot.selection.resolved_path);
 const target={...fixtures.offer('operations'),sha256:contracts.targetFingerprint(fixtures.offer('operations'),sha256)};
 const record={id:'context:recipient',kind:'recipient_name',value:'Fictional Recipient',provenance:{kind:'user_input',reference:'fictional-input',observed_at:'2026-01-03T10:00:00Z',offer_span:null},confirmation:null};
 const confirmation={application_id:'fictional-application',record_sha256:contracts.fingerprint({id:record.id,kind:record.kind,value:record.value,provenance:record.provenance},sha256),interaction_ref:'fictional-confirmation',confirmed_at:'2026-01-03T10:01:00Z'};
 record.confirmation=confirmation;
 const application={application_id:confirmation.application_id,target_sha256:target.sha256,records:[record]};
 const original={target,application_context_bytes:JSON.stringify(application),confirmation_observations:[confirmation]};
 let live=structuredClone(original),during=null;
 const host={session:'fictional-host-context',currentSelection:()=>h.intake.snapshot(),currentApplicationSelection:()=>structuredClone(live),readBytes:fs.readFileSync,decodeUtf8:b=>new TextDecoder('utf-8',{fatal:true}).decode(b),sha256,
 ...h.load('profile-contract.md',['dispatchVersion']),...h.load('profile-validation.md',['evidenceView']),
 validateProfile:async(profile,taskRequest)=>{const report=await h.validate(profile,{taskRequest});if(during)during();return report;}};
 const context=createStrategyContext(host,contracts);
 const input=()=>({snapshot:h.intake.snapshot(),target:live.target,settings:{languages:['en'],market:'DE',requested_documents:['cv']},evaluation_date:'2026-01-03'});
 const bind=()=>context.bindStrategy(input());
 let r=await bind();assert.equal(r.status,'ready');assert.equal(r.value.binding.application_id,application.application_id);
 assert.equal(r.value.binding.schema_version,'1.1');assert.equal(r.value.binding.application_context_sha256,sha256(original.application_context_bytes));
 assert.deepEqual(r.value.application_context,application);
 for(const mutate of [()=>{live.target={kind:'role',title:'Dispatch',context:null,sha256:contracts.targetFingerprint({kind:'role',title:'Dispatch',context:null},sha256)};},()=>{live.application_context_bytes+=' ';},()=>{live.confirmation_observations=[];}]){
  live=structuredClone(original);assert.equal((await bind()).status,'ready');mutate();assert.equal(context.current(),null);
  live=structuredClone(original);during=mutate;assert.notEqual((await bind()).status,'ready');assert.equal(context.current(),null);during=null;
 }
 live=structuredClone(original);live.confirmation_observations=[];assert.notEqual((await bind()).status,'ready','saved confirmation alone cannot restore authority');
 live=structuredClone(original);const forged=JSON.parse(live.application_context_bytes);forged.records[0].confirmation.application_id='other';live.application_context_bytes=JSON.stringify(forged);assert.notEqual((await bind()).status,'ready');
 live=structuredClone(original);assert.notEqual((await context.bindStrategy({...input(),target:{kind:'role',title:'Other role',context:null}})).status,'ready');
 live={target,application_context_bytes:null,confirmation_observations:[]};r=await bind();assert.equal(r.status,'ready');assert.equal(r.value.application_context,null);assert.equal(r.value.binding.application_id,null);
 live={...live,target:{kind:'role',title:'Dispatch',context:null}};live.target.sha256=contracts.targetFingerprint(live.target,sha256);r=await bind();assert.equal(r.value.mode,'role_only');
 assert.equal(r.value.job_specific_coverage,false);
 live=structuredClone(original);const pending=JSON.parse(live.application_context_bytes);pending.records[0].confirmation=null;live.application_context_bytes=JSON.stringify(pending);live.confirmation_observations=[];assert.equal((await bind()).status,'ready','pending context permits independent work');
 const resumed=createStrategyContext({...host,currentApplicationSelection:()=>null},contracts);assert.notEqual((await resumed.bindStrategy(input())).status,'ready');
 assert.deepEqual(fs.readFileSync(selected.snapshot.selection.resolved_path),before);
 assert.ok(h.evidence.checks.every(c=>c.method==='executed_upstream_validation'));
 console.log('PASS host context: independently selected sources, validation races, resume, role/null context and no canonical writes');
})().catch(e=>{console.error(e);process.exitCode=1;});
