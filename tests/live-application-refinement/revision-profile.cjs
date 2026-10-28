'use strict';
// Bounded task 5.2 fixture persistence through the shipped owner; no document engine.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const {fixture}=require('../wordcraft-application-documents/acceptance-fixture.cjs');
const {load}=require('../wordcraft-application-documents/manifest-fixture.cjs');
const {hash}=require('./revision-evidence.cjs');
async function prepare(output,host={}){ output=path.resolve(output);
 const f=fixture(),source=path.join(output,'reusable.json'),dest=path.join(output,'application.json');fs.writeFileSync(source,JSON.stringify(f.profile,null,2),{flag:'wx'});

 // Match the existing explicitly selected offer contract rather than inventing target metadata.
 const baseline=await require('./revision-upstream.cjs').prepareAcceptance(path.join(output,'baseline'));
 if(host.onBaseline)await host.onBaseline(baseline);
 const app={application_id:baseline.strategy.binding.application_id,target_sha256:baseline.strategy.target.sha256};
 const {createHarness}=require('../targeted-application-strategy/foundation.cjs'),h=createHarness();h.intake.select({workspace_root:output,facts_path:source});
 const before=fs.readFileSync(source),proposed=structuredClone(f.profile);proposed.schema_version='2.1';proposed.application_scope={...app,origin_profile:{schema_version:'2.0',resolved_path:source,sha256:hash(before)}};
 const fact={id:'fact-application-handover-review',statement:'Since September 2026, reviews the shift handover checklist with packing colleagues each month and records agreed clarifications. Staffing and route approval remain with the manager.',source_ids:['source-application-answer']};
 proposed.sources.push({id:'source-application-answer',type:'user_answer',origin:'Wholly fictional task 5.2 answer, explicitly application-only.',locator:null,received_at:'2026-10-28',as_of:'2026-10-28',verification:'user_reported',verification_basis:null});proposed.profile.push(fact);
 let decisionCount=0;
 const acl=file=>{const r=spawnSync('pwsh',['-NoProfile','-NonInteractive','-Command','(Get-Acl -LiteralPath $env:TEST_FILE).Sddl'],{env:{...process.env,TEST_FILE:file},encoding:'utf8',windowsHide:true});assert.equal(r.status,0,r.stderr);return r.stdout.trim();};
 const api=load('profile-updates.md',['createProfileUpdates']).createProfileUpdates({currentSelection:()=>h.intake.snapshot(),currentApplicationSelection:()=>app,now:()=>new Date().toISOString(),sha256:hash,encode:s=>Buffer.from(s),decode:b=>new TextDecoder('utf-8',{fatal:true}).decode(b),validate:p=>h.validate(p,{applicationSelection:app}),
 userDecision:async reviewed=>{decisionCount++;assert.equal(reviewed.scope,'application_fork');if(host.userDecision)return host.userDecision(reviewed);return {decision:'approved',reviewed,authorization:{id:'task52-fictional-application-choice',scope:reviewed.scope,request_reference:'Task 5.2 fictional scenario authorization: this identified fact application-only, reusable unchanged.',approved_at:new Date().toISOString(),proposal_id:reviewed.proposal_id,resolved_path:reviewed.resolved_path}};},
 acquireFork:async(a,b)=>{assert.equal(a,source);assert.equal(b,dest);return {single_writer:true,private_location:true,exclusive_create:true,readSource:async()=>fs.readFileSync(source),read:async()=>fs.existsSync(dest)?fs.readFileSync(dest):null,retainSource:async bytes=>{const file=path.join(output,'reusable-retained.json');fs.writeFileSync(file,bytes,{flag:'wx'});return file;},readRetained:async p=>fs.readFileSync(p),create:async bytes=>{const fd=fs.openSync(dest,'wx',0o600);try{fs.writeFileSync(fd,bytes);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}},verifySecurity:async()=>acl(source)===acl(path.join(output,'reusable-retained.json'))&&!!acl(dest),release:async()=>{}};}});
 const d=await api.prepareFork(h.intake.snapshot(),app,dest,proposed,{proposal_id:'task52-fork',history_id:'task52-history',source_ids:['source-application-answer'],facts:[{statement_id:fact.id,use:'application_only'}]});assert.equal(d.decision_state,'authorized',JSON.stringify(d));const result=await api.persistFork(d);assert.equal(result.status,'confirmed',JSON.stringify(result));assert.equal(decisionCount,1);assert.deepEqual(fs.readFileSync(source),before);
 assert.equal(h.intake.select({workspace_root:output,facts_path:dest,application_selection:app}).status,'selected');const profile=JSON.parse(fs.readFileSync(dest));const validated=await h.validate(profile,{applicationSelection:app});assert.equal(validated.schema,'passed');assert.equal(validated.semantics,'passed');
 f.profile=profile;const cv=f.documents.find(d=>d.id==='cv-en');cv.paragraphs.find(p=>p.id==='achievement-two').text=fact.statement;cv.paragraphs.find(p=>p.id==='achievement-two').source={record_id:fact.id,pointer:'/profile/'+(profile.profile.length-1)+'/statement',source_ids:fact.source_ids};
 return {f,source,dest,before,profileWrite:result,baseline,prepareRevised:()=>require('./revision-upstream.cjs').prepareAcceptance(path.join(output,'revised'),f,dest,host.revisedInteraction||null)};
}
module.exports={prepare};
if(require.main===module)prepare(process.argv[2]).then(x=>x.prepareRevised()).then(()=>console.log('PASS actual owner fork and 1.2 assembly')).catch(e=>{console.error(e);process.exitCode=1;});
