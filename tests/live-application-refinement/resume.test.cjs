'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),skill=path.join(root,'skills/targeted-cv');
const code=fs.readFileSync(path.join(skill,'references/refinement-session.md'),'utf8').match(/```javascript\r?\n([\s\S]*?)```/)[1];
const {createRefinementCheckpoint,inspectRefinementResume}=new Function(code+';return {createRefinementCheckpoint,inspectRefinementResume};')();
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),clone=x=>structuredClone(x);
const selection={profile:{resolved_path:'/fictional/profile.json',sha256:sha('profile'),schema_version:'2.1'},reusable_base:null,target_sha256:sha('target'),settings_sha256:sha('settings'),context:null};
const record=()=>({schema_version:'1.0',session_id:'fixture-session',application_id:'fixture-application',selection:clone(selection),owner_artifacts:{strategy:null,document_manifest:null,document_session:null,predecessors:[]},questions:[],statements:[],choices:[],profile_operations:[],revisions:[],comparisons:[],stop_state:{state:'active',reason:null,pending_operation_refs:[],last_confirmed_deliverables:[]}});
const work=fs.mkdtempSync(path.join(root,'outputs/m4-checkpoint-'));let validations=0;
const replaceScript=path.join(work,'replace.ps1');fs.writeFileSync(replaceScript,'param([string]$Stage,[string]$Destination)\n$ErrorActionPreference = "Stop"\n[System.IO.File]::Replace($Stage, $Destination, [NullString]::Value, $false)\n');
const acl=f=>{if(process.platform!=='win32')return fs.statSync(f).mode;const out=spawnSync('pwsh',['-NoProfile','-Command','(Get-Acl -LiteralPath $env:CHECKPOINT_FILE).Sddl'],{encoding:'utf8',windowsHide:true,env:{...process.env,CHECKPOINT_FILE:f}});assert.equal(out.status,0,out.stderr);return out.stdout.trim();};
const validateRecord=r=>{const f=path.join(work,`validate-${++validations}.json`);fs.writeFileSync(f,JSON.stringify(r));const out=spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(skill,'schemas/refinement-session.schema.json'),f],{encoding:'utf8',windowsHide:true,timeout:120000});assert.ok(!out.error,out.error?.message);assert.ok([0,1].includes(out.status),out.stderr);return out.status===0;};
const inspect=(r,p)=>({state:validateRecord(r)&&(!p||validateRecord(p.record))?'passed':'failed'});
let writes=0,failRead=false,failSecurity=false,loseResponse=false,guarantees=true;
const destination=path.join(work,'checkpoint.json');
// Unpublished test-owned directory; these guarantees do not establish exclusion for a real user destination.
const host={sha256:sha,encode:s=>Buffer.from(s),decode:b=>new TextDecoder('utf-8',{fatal:true}).decode(b),validateRecord,inspect,
 acquire:async target=>{assert.equal(target,destination);const security=fs.existsSync(target)?acl(target):null;return {resolved_path:target,single_writer:guarantees,private_location:true,stable_identity:true,exclusive_create:true,security_preserving_replace:true,
 read:async()=>{if(failRead)throw Error('simulated read failure');return fs.existsSync(target)?fs.readFileSync(target):null;},
 create:async bytes=>{writes++;const fd=fs.openSync(target,'wx',0o600);try{fs.writeFileSync(fd,bytes);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}if(loseResponse)throw Error('simulated response loss');},
 stage:async bytes=>{const s=path.join(work,`stage-${writes}.json`);fs.writeFileSync(s,bytes,{flag:'wx',mode:0o600});return s;},readStage:async s=>fs.readFileSync(s),
 backup:async bytes=>{const b=path.join(work,`backup-${writes}.json`);fs.writeFileSync(b,bytes,{flag:'wx',mode:0o600});return b;},readBackup:async b=>fs.readFileSync(b),
 replace:async s=>{writes++;if(process.platform==='win32'){const out=spawnSync('pwsh',['-NoProfile','-File',replaceScript,s,target],{encoding:'utf8',windowsHide:true});assert.equal(out.status,0,out.stderr);}else fs.renameSync(s,target);if(loseResponse)throw Error('simulated response loss');},
 verifySecurity:async()=>{if(failSecurity&&writes>=2)return false;return !security||acl(target)===security;},release:async()=>{}};}};
const current=r=>({validateRecord,application_id:r.application_id,session_id:r.session_id,selection:clone(r.selection),sources_validated:true,context_confirmed:true,documents_inspected:true,owners_reconciled:true,dispositions_reassessed:true,reports_reassessed:true,checkpoint_confirmed:true});
(async()=>{
 const r=record(),checkpoint=createRefinementCheckpoint(host);
 let result=await checkpoint(r,null,destination);assert.equal(result.status,'confirmed',JSON.stringify(result));assert.equal(result.ref.sha256,sha(fs.readFileSync(destination)));assert.equal(writes,1);
 const original=fs.readFileSync(destination),p={record:JSON.parse(original),sha256:sha(original)};
 const next=clone(r);next.stop_state={state:'paused',reason:'Fictional user pause.',pending_operation_refs:[],last_confirmed_deliverables:[]};
 result=await checkpoint(next,sha('wrong'),destination,{...p,sha256:sha('wrong')});assert.equal(result.status,'conflict');assert.equal(writes,1);
 guarantees=false;result=await createRefinementCheckpoint(host)(next,p.sha256,destination,p);assert.equal(result.status,'unconfirmed');assert.equal(writes,1);guarantees=true;
 result=await createRefinementCheckpoint(host)(next,p.sha256,destination,{...p,record:next});assert.notEqual(result.status,'confirmed');assert.equal(writes,1);
 loseResponse=true;failSecurity=true;const uncertain=createRefinementCheckpoint(host);result=await uncertain(next,p.sha256,destination,p);assert.equal(result.status,'unconfirmed');assert.equal(writes,2);
 failSecurity=false;loseResponse=false;result=await uncertain(next,p.sha256,destination,p);assert.equal(result.status,'confirmed',JSON.stringify(result));assert.equal(writes,2,'reconciliation must not replace again');
 assert.deepEqual(fs.readFileSync(path.join(work,'backup-1.json')),original);
 const loaded=current(next);let resumed=inspectRefinementResume(next,loaded);assert.equal(resumed.questions,false);assert.equal(resumed.mutations,false);
 resumed=inspectRefinementResume(next,{...loaded,user_continuation:true});assert.equal(resumed.continuation_ready,true);assert.equal(resumed.mutations,false);
 assert.equal(inspectRefinementResume(r,current(r)).mutations,true);
 for(const field of ['sources_validated','context_confirmed','documents_inspected','owners_reconciled','dispositions_reassessed','reports_reassessed','checkpoint_confirmed']){resumed=inspectRefinementResume(r,{...current(r),[field]:false});assert.equal(resumed.mutations,false,field);}
 resumed=inspectRefinementResume(r,{...current(r),application_id:'other'});assert.equal(resumed.state,'failed');assert.equal(resumed.mutations,false);
 const stale=current(r);stale.selection.settings_sha256=sha('changed');assert.equal(inspectRefinementResume(r,stale).mutations,false);
 assert.equal(inspectRefinementResume(r,{validateRecord}).mutations,false,'saved ready fields cannot establish live confirmations');
 const bad=record();bad.approval={permission:true};assert.equal(inspectRefinementResume(bad,current(bad)).state,'failed');
 const unresolved=record();unresolved.profile_operations=[{id:'not-schema-valid'}];assert.equal(inspectRefinementResume(unresolved,current(unresolved)).mutations,false);
 const absent=path.join(work,'absent.json');const missing=createRefinementCheckpoint({...host,acquire:async()=>null});result=await missing(r,null,absent);assert.equal(result.status,'unconfirmed');assert.equal(fs.existsSync(absent),false);
 failRead=true;result=await createRefinementCheckpoint(host)(r,null,destination);assert.equal(result.status,'unconfirmed');assert.equal(writes,2);
 console.log(`PASS checkpoint/resume: real private create/replace/read-back, baseline, retained backup, uncertainty without replay, stale inputs, stopped continuation; ${validations} schema checks.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
