'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),skill=path.join(root,'skills/targeted-cv');
const load=(file,name)=>new Function(fs.readFileSync(path.join(skill,'references',file),'utf8').match(/```javascript\r?\n([\s\S]*?)```/)[1]+`;return ${name};`)();
const create=load('profile-updates.md','createProfileUpdates'),validateProfile=load('profile-validation.md','validateProfile');
const blank=require('../../skills/targeted-cv/templates/cv-facts.blank.json'),populated=require('../portable-candidate-profile/fixtures/populated.cjs');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const output=path.join(root,'outputs/m4-task22');fs.mkdirSync(output,{recursive:true});const work=fs.mkdtempSync(path.join(output,'run-'));
const app={application_id:'fictional-application',target_sha256:'a'.repeat(64)};let schemaCount=0,checks=0;
const check=(a,b)=>{assert.deepEqual(a,b);checks++;};
function ps(script,env){const r=spawnSync('pwsh',['-NoProfile','-NonInteractive','-Command','$ErrorActionPreference="Stop"; '+script],{encoding:'utf8',windowsHide:true,env:{...process.env,...env}});assert.equal(r.status,0,r.stderr);return r.stdout.trim();}
const acl=f=>ps('(Get-Acl -LiteralPath $env:TEST_FILE).Sddl',{TEST_FILE:f});
async function setup(){
 const dir=fs.mkdtempSync(path.join(work,'case-')),source=path.join(dir,'reusable.json'),dest=path.join(dir,'application.json');
 const base=populated(blank);base.evidence=[];base.review_questions=[];
 const original=Buffer.from(JSON.stringify(base,null,3)+'\r\n');fs.writeFileSync(source,original,{flag:'wx'});
 let selected={generation:1,selection:{resolved_path:source,profile_sha256:hash(original)},profile:base};let currentApp=structuredClone(app),decisions=0,creates=0,replacements=0;
 const host={currentSelection:()=>structuredClone(selected),currentApplicationSelection:()=>structuredClone(currentApp),now:()=> '2026-10-28T12:01:00Z',sha256:hash,encode:s=>Buffer.from(s),decode:b=>new TextDecoder('utf-8',{fatal:true}).decode(b),
 validate:async p=>validateProfile(p,{applicationSelection:currentApp,validate:async(schema,value)=>{const file=path.join(dir,`validate-${++schemaCount}.json`);fs.writeFileSync(file,JSON.stringify(value));const r=spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(skill,schema),file],{encoding:'utf8',windowsHide:true});assert.ok(!r.error,r.error?.message);return {state:r.status===0?'passed':'failed',findings:[]};}}),
 userDecision:async reviewed=>{decisions++;return {decision:'approved',reviewed,authorization:{id:`auth-${decisions}`,scope:reviewed.scope,request_reference:'fictional-explicit-user-turn',approved_at:'2026-10-28T12:00:00Z',proposal_id:reviewed.proposal_id,resolved_path:reviewed.resolved_path}};},
 acquireFork:async(sourcePath,destination)=>{assert.equal(sourcePath,source);assert.equal(destination,dest);return {single_writer:true,private_location:true,exclusive_create:true,readSource:async()=>fs.readFileSync(source),read:async()=>fs.existsSync(dest)?fs.readFileSync(dest):null,retainSource:async bytes=>{const f=path.join(dir,'source.retained');fs.writeFileSync(f,bytes,{flag:'wx'});return f;},readRetained:async f=>fs.readFileSync(f),create:async bytes=>{creates++;const fd=fs.openSync(dest,'wx',0o600);try{fs.writeFileSync(fd,bytes);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}},verifySecurity:async()=>acl(source)===acl(path.join(dir,'source.retained'))&&!!acl(dest),release:async()=>{}};},
 acquirePersistence:async destination=>{assert.equal(destination,dest);const security=acl(dest);return {single_writer:true,private_location:true,security_preserving_replace:true,read:async()=>fs.readFileSync(dest),stage:async bytes=>{const f=path.join(dir,'known.stage');fs.writeFileSync(f,bytes,{flag:'wx'});return f;},readStage:async f=>fs.readFileSync(f),backup:async bytes=>{const f=path.join(dir,'original.backup');fs.writeFileSync(f,bytes,{flag:'wx'});ps('Set-Acl -LiteralPath $env:TEST_BACKUP -AclObject (Get-Acl -LiteralPath $env:TEST_FILE)',{TEST_BACKUP:f,TEST_FILE:dest});return f;},readBackup:async f=>fs.readFileSync(f),replace:async stage=>{replacements++;ps('[System.IO.File]::Replace($env:TEST_STAGE,$env:TEST_FILE,[NullString]::Value,$false)',{TEST_STAGE:stage,TEST_FILE:dest});},verifySecurity:async()=>acl(dest)===security&&acl(path.join(dir,'original.backup'))===security,cleanupStage:async f=>{if(fs.existsSync(f))fs.unlinkSync(f);},release:async()=>{}};}}
 const profile=structuredClone(base);profile.schema_version='2.1';profile.application_scope={...app,origin_profile:{schema_version:'2.0',resolved_path:source,sha256:hash(original)}};profile.profile.push({id:'fictional-new-capability',statement:'Additional fictional coordination capability',source_ids:['source-demo']});
 const choices={proposal_id:'fork-proposal',history_id:'fork-history',source_ids:['source-demo'],facts:[{statement_id:'fictional-new-capability',use:'application_only'}]};
 const api=create(host);
 return {api,host,source,dest,original,profile,choices,dir,selected:()=>selected,setApp:a=>currentApp=a,selectApplication:()=>{selected={generation:2,selection:{resolved_path:dest,profile_sha256:hash(fs.readFileSync(dest))},profile:JSON.parse(fs.readFileSync(dest))};},counts:()=>({decisions,creates,replacements}),prepare:()=>api.prepareFork(structuredClone(selected),app,dest,profile,choices)};
}
(async()=>{
 const x=await setup(),decision=await x.prepare();check(decision.decision_state,'authorized');
 check((await x.prepare()).decision_state,'authorized');check(x.counts().decisions,1);
 check((await x.api.persistFork(structuredClone(decision))).status,'unconfirmed');
 check((await x.api.persistFork(decision)).status,'confirmed');check(fs.readFileSync(x.source),x.original);check(fs.readFileSync(path.join(x.dir,'source.retained')),x.original);check(x.counts().creates,1);
 check((await x.api.persistFork(decision)).status,'confirmed');check(x.counts().creates,1);
 x.selectApplication();const selected=x.selected(),proposed=structuredClone(selected.profile);proposed.profile.push({id:'fictional-later-capability',statement:'Later fictional planning capability',source_ids:['source-demo']});
 const request={proposal_id:'update-proposal',history_id:'update-history',scope:'application_fact_update',source_ids:['source-demo'],proposed_profile:proposed,changes:[{pointer:'/profile',before:selected.profile.profile,after:proposed.profile,reason:'New supported fictional fact for this application.'}]};
 const update=await x.api.prepare(selected,request);check(update.decision_state,'authorized');const before=fs.readFileSync(x.dest);
 ps('$a=Get-Acl -LiteralPath $env:TEST_FILE; $a.SetAccessRuleProtection($true,$true); Set-Acl -LiteralPath $env:TEST_FILE -AclObject $a',{TEST_FILE:x.dest});
 check((await x.api.persist(update)).status,'confirmed');check(fs.readFileSync(path.join(x.dir,'original.backup')),before);check(fs.readFileSync(x.source),x.original);check(x.counts().replacements,1);
 // Existing scoped updates cannot borrow reusable authority or change their marker.
 x.selectApplication();const current=x.selected();const next=structuredClone(current.profile);next.profile.push({id:'fictional-next',statement:'Further fictional scoped evidence',source_ids:['source-demo']});
 const nextRequest={...request,proposal_id:'next-update',history_id:'next-history',proposed_profile:next,changes:[{pointer:'/profile',before:current.profile.profile,after:next.profile,reason:'Further scoped addition.'}]};
 check((await x.api.prepare(current,{...nextRequest,scope:'fact_update'})).status,'rejected');
 const changedScope=structuredClone(nextRequest);changedScope.proposed_profile.application_scope.origin_profile.sha256='c'.repeat(64);check((await x.api.prepare(current,changedScope)).status,'rejected');
 x.setApp({...app,target_sha256:'d'.repeat(64)});check((await x.api.prepare(current,nextRequest)).status,'conflict');x.setApp(app);
 const nextDecision=await x.api.prepare(current,nextRequest);check(nextDecision.decision_state,'authorized');
 check((await x.api.persist(structuredClone(nextDecision))).status,'unconfirmed');
 const acquireUpdate=x.host.acquirePersistence;x.host.acquirePersistence=async p=>{const l=await acquireUpdate(p);l.security_preserving_replace=false;return l;};
 check((await x.api.persist(nextDecision)).status,'unconfirmed');check(x.counts().replacements,1);
 x.host.acquirePersistence=acquireUpdate;fs.appendFileSync(x.dest,' ');check((await x.api.persist(nextDecision)).status,'conflict');check(x.counts().replacements,1);check(fs.readFileSync(x.source),x.original);
 for(const mode of ['existing','pending','document_only','source_changed','missing_guarantee','lost_ack','partial','read_failure','wrong_application','imported','validation_failure','security_failure']){
  const y=await setup();
  if(mode==='pending')y.choices.facts[0].use='pending';
  if(mode==='document_only')y.host.userDecision=async reviewed=>({decision:'document_only',reviewed});
  const d=await y.prepare();
  if(mode==='existing')fs.writeFileSync(y.dest,'existing-file');
  if(mode==='source_changed')fs.appendFileSync(y.source,' ');
  if(mode==='wrong_application')y.setApp({...app,application_id:'different'});
  const acquire=y.host.acquireFork;let first=true;
  y.host.acquireFork=async(...args)=>{const l=await acquire(...args),create=l.create,read=l.read;
   if(mode==='missing_guarantee')l.exclusive_create=false;
   if(mode==='security_failure')l.verifySecurity=async()=>false;
   l.create=async bytes=>{await create(mode==='partial'?Buffer.from('{}'):bytes);if(mode==='lost_ack')throw Error('fictional lost ack');};
   l.read=async()=>{if(mode==='read_failure'&&y.counts().creates&&first){first=false;throw Error('fictional read unavailable');}return read();};return l;};
  if(mode==='validation_failure'){const v=y.host.validate;y.host.validate=async p=>y.counts().creates?{schema:'failed',semantics:'failed'}:v(p);}
  const r=await y.api.persistFork(mode==='imported'?structuredClone(d):d);
  check(r.status,mode==='lost_ack'?'confirmed':['existing','source_changed','wrong_application'].includes(mode)?'conflict':'unconfirmed');
  const again=await y.api.persistFork(mode==='imported'?structuredClone(d):d);check(again.status,['lost_ack','read_failure'].includes(mode)?'confirmed':['existing','source_changed','wrong_application'].includes(mode)?'conflict':'unconfirmed');
  check(y.counts().creates,['lost_ack','partial','read_failure','validation_failure','security_failure'].includes(mode)?1:0);
  if(mode==='existing')check(fs.readFileSync(y.dest).toString(),'existing-file');
  if(mode!=='source_changed')check(fs.readFileSync(y.source),y.original);
 }
 console.log(`PASS scoped persistence: ${checks} assertions; ${schemaCount} actual schema validations; exclusive creation, .NET replacement, protected ACL, exact backups, no replay. Test-owned isolated workspaces only: ${work}`);
})().catch(e=>{console.error(e);process.exitCode=1;});
