'use strict';
// All evidence and destinations are wholly fictional; no candidate input is read.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '../..'), skill = path.join(root, 'skills/targeted-cv');
const load = (file, name) => new Function(fs.readFileSync(path.join(skill, 'references', file), 'utf8').match(/```javascript\r?\n([\s\S]*?)```/)[1] + `;return ${name};`)();
const create = load('profile-updates.md', 'createProfileUpdates'), validateProfile = load('profile-validation.md', 'validateProfile');
const populated = require('../portable-candidate-profile/fixtures/populated.cjs'), blank = require('../../skills/targeted-cv/templates/cv-facts.blank.json');
const digest = b => crypto.createHash('sha256').update(b).digest('hex'), clone = structuredClone;
const app = {application_id:'fictional-selected-application', target_sha256:'b'.repeat(64)};
const base = populated(blank); base.evidence = []; base.review_questions = [];
const local = {id:'fictional-local', statement:'Additional fictional work from 2025; earlier archive work remains unchanged.', source_ids:['source-demo']};
const promoted = {id:'fictional-promoted', statement:'Later fictional coordination from 2026; no earlier responsibility implied.', source_ids:['source-demo']};
const fresh = {id:'fictional-concurrent', statement:'Independently confirmed fictional reusable evidence.', source_ids:['source-demo']};
const pending = {id:'fictional-pending', statement:'Unchosen fictional capability.', source_ids:['source-demo']};
let checks=0, schemaChecks=0;
const check = (a,b) => {assert.deepEqual(a,b);checks++;};
fs.mkdirSync(path.join(root,'outputs/m4-task23'),{recursive:true});
const work=fs.mkdtempSync(path.join(root,'outputs/m4-task23/run-'));
async function setup() {
  // Memory lease is a deterministic failure control, not proof of real writer exclusion/security.
  const files=new Map(), replacements=new Map(), decisions=[];let generation=0,selected=null,readFailure=false;
  const reusable='/fictional/reusable.json', application='/fictional/application.json';
  const current=clone(base);current.profile.push(fresh);
  const scoped=clone(base);scoped.schema_version='2.1';scoped.application_scope={...app,origin_profile:{schema_version:'2.0',resolved_path:reusable,sha256:digest(Buffer.from(JSON.stringify(base)))}};scoped.profile.push(local,promoted);
  for(const [p,v] of [[reusable,current],[application,scoped]])files.set(p,Buffer.from(JSON.stringify(v)));
  const select=p=>{selected={generation:++generation,selection:{resolved_path:p,profile_sha256:digest(files.get(p))},profile:JSON.parse(files.get(p))};return clone(selected);};
  const host={currentSelection:()=>clone(selected),currentApplicationSelection:()=>clone(app),now:()=> '2026-10-28T12:00:00Z',sha256:digest,encode:s=>Buffer.from(s),decode:b=>b.toString(),
    validate:async p=>validateProfile(p,{applicationSelection:app,validate:async(schema,value)=>{
      const file=path.join(work,`validation-${++schemaChecks}.json`);fs.writeFileSync(file,JSON.stringify(value));
      const r=spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(skill,schema),file],{encoding:'utf8',windowsHide:true});
      assert.ok(!r.error,r.error?.message);return {state:r.status===0?'passed':'failed',findings:[]};}}),
    userDecision:async reviewed=>{decisions.push(clone(reviewed));return {decision:'approved',reviewed,authorization:{id:`fictional-auth-${decisions.length}`,scope:reviewed.scope,request_reference:'fictional-user-selected-exact-groups-and-both-destinations',approved_at:'2026-10-28T12:00:00Z',proposal_id:reviewed.proposal_id,resolved_path:reviewed.resolved_path}};},
    acquirePersistence:async p=>{let stage,backup;return {single_writer:true,private_location:true,security_preserving_replace:true,
      read:async()=>{if(p===application&&readFailure&&(replacements.get(p)||0)>0){readFailure=false;throw Error('fictional lost read-back');}return files.get(p);},
      stage:async b=>{stage=b;return 'stage';},readStage:async()=>stage,backup:async b=>{backup=b;return 'backup';},readBackup:async()=>backup,
      replace:async()=>{replacements.set(p,(replacements.get(p)||0)+1);files.set(p,stage);},verifySecurity:async()=>true,cleanupStage:async()=>{},release:async()=>{}};}};
  // Renewed leases retain the original operation's stage/backup, as required by the contract.
  const leases=new Map(),acquire=host.acquirePersistence;host.acquirePersistence=async p=>{if(!leases.has(p))leases.set(p,await acquire(p));return leases.get(p);};
  return {api:create(host),host,files,select,reusable,application,decisions,replacements,failRead:()=>readFailure=true};
}
function proposal(selected, after, id, use, statementId) {
  const changes=[{pointer:'/profile',before:clone(selected.profile.profile),after:clone(after.profile),reason:'Reviewed selected fictional fact only; retain earlier chronology and local records.'}];
  return {request:{proposal_id:id,history_id:`history-${id}`,scope:selected.profile.schema_version==='2.0'?'fact_update':'application_fact_update',source_ids:['source-demo'],proposed_profile:after,changes},
    choices:{facts:[{statement_id:statementId,use,source_ids:['source-demo'],changes:clone(changes)}]}};
}
(async()=>{
 const x=await setup();const selected=x.select(x.reusable),after=clone(selected.profile);after.profile.push(promoted);
 const p=proposal(selected,after,'promote','application_and_reusable',promoted.id);
 after.employment[0].title='Fictional Archive Coordinator';
 const correction={pointer:'/employment/0/title',before:selected.profile.employment[0].title,after:after.employment[0].title,reason:'Explicit fictional correction; retain earlier account and source in accepted history for wording review.'};
 p.request.changes.push(clone(correction));p.choices.facts[0].changes.push(clone(correction));
 const d=await x.api.prepareSelected(selected,p.request,p.choices);check(d.decision_state,'authorized');
 check(d.reviewed.statement_choices,p.choices);
 check((await x.api.prepareSelected(selected,p.request,p.choices)).decision_state,'authorized');check(x.decisions.length,1);
 check((await x.api.persist(d)).status,'confirmed');check(x.replacements.get(x.reusable),1);
 const savedBase=JSON.parse(x.files.get(x.reusable));check(savedBase.profile,[...base.profile,fresh,promoted]);check(savedBase.profile.some(f=>f.id===local.id||f.id===pending.id),false);
 // Select the application separately, preserve its origin/conflicts/local records, reconcile the confirmed promotion and add an unrelated chosen local fact.
 const s=x.select(x.application),combined=clone(s.profile);combined.profile.push({id:'fictional-new-local',statement:'Additional fictional planning in 2026.',source_ids:['source-demo']});
 const q=proposal(s,combined,'combined','application_only','fictional-new-local');
 combined.employment[0].title=after.employment[0].title;
 q.request.changes.push(clone(correction));q.choices.facts.push({statement_id:'fictional-title-correction',use:'application_and_reusable',source_ids:['source-demo'],changes:[clone(correction)]});
 const ad=await x.api.prepareSelected(s,q.request,q.choices);check(ad.decision_state,'authorized');
 x.failRead();check((await x.api.persist(ad)).status,'unconfirmed');check(x.replacements.get(x.application),1);
 check((await x.api.persist(ad)).status,'confirmed');check(x.replacements.get(x.application),1);check(x.replacements.get(x.reusable),1);
 const savedApp=JSON.parse(x.files.get(x.application));check(savedApp.profile,[...base.profile,local,promoted,combined.profile.at(-1)]);check(savedApp.conflicts,base.conflicts);check(savedApp.application_scope,s.profile.application_scope);
 check(savedApp.employment[0],{...s.profile.employment[0],title:after.employment[0].title});check(savedApp.sources,s.profile.sources);check(savedApp.change_history.slice(0,-1),s.profile.change_history);
 check(savedApp.change_history.at(-1).changes.at(-1),correction);check(savedBase.change_history.at(-1).changes.at(-1),correction);
 // Broader copy-back, pending inclusion, imported scope and changed source records cannot fit the exact chosen diff.
 for(const mutate of [
   z=>z.request.proposed_profile.profile.push(local),
   z=>z.request.proposed_profile.profile.push(pending),
   z=>z.request.proposed_profile.sources[0].origin='Changed without chosen source diff',
   z=>z.request.proposed_profile.schema_version='2.1',
   z=>z.choices.facts[0].use='pending',
   z=>z.choices.facts[0].use='application_only',
   z=>z.choices.facts.push(clone(z.choices.facts[0])),
   z=>z.choices.facts[0].source_ids=['unchosen-source'],
   z=>z.request.changes[0].after.push(local)
 ]){
   const y=await setup(),sel=y.select(y.reusable),a=clone(sel.profile);a.profile.push(promoted);const z=proposal(sel,a,'negative','application_and_reusable',promoted.id);mutate(z);
   check((await y.api.prepareSelected(sel,z.request,z.choices)).status,'rejected');check(y.decisions.length,0);
 }
 // Collision is reviewed, never merged. Stale bytes block writes despite previously valid preparation.
 const y=await setup(),ys=y.select(y.reusable),collision=clone(ys.profile);collision.profile.push({...promoted,id:local.id},{...local});
 const cp=proposal(ys,collision,'collision','application_and_reusable',local.id);
 check((await y.api.prepareSelected(ys,cp.request,cp.choices)).status,'rejected');check(y.decisions.length,0);
 const z=await setup(),zs=z.select(z.reusable),za=clone(zs.profile);za.profile.push(promoted);const zp=proposal(zs,za,'stale','application_and_reusable',promoted.id);
 const zd=await z.api.prepareSelected(zs,zp.request,zp.choices);z.files.set(z.reusable,Buffer.from(z.files.get(z.reusable).toString()+' '));check((await z.api.persist(zd)).status,'conflict');check(z.replacements.size,0);
 console.log(`PASS selective promotion: ${checks} assertions; ${schemaChecks} actual schema validations. Deterministic leases only; real filesystem persistence is covered by scoped-persistence.test.cjs. ${work}`);
})().catch(e=>{console.error(e);process.exitCode=1;});
