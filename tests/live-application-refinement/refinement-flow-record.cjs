'use strict';
// Test-only filesystem adapters for the shipped checkpoint owner, in a new private run.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const {load,sha256}=require('../wordcraft-application-documents/manifest-fixture.cjs');
function createRecordWriter(output,applicationId,sessionId){
 const {inspectRefinement,createRefinementCheckpoint}=load('refinement-session.md',['inspectRefinement','createRefinementCheckpoint']);
 const schema=path.resolve(__dirname,'../../skills/targeted-cv/schemas/refinement-session.schema.json'),destination=path.join(output,'refinement-checkpoint.json');let serial=Math.max(0,...fs.readdirSync(output).map(n=>Number(/(?:validation|stage|backup)-(\d+)\.json$/.exec(n)?.[1]||0))),previous=null;
 const observed={artifacts:[],choices:[],questions:[],profile_operations:[],members:[]};
 const ref=file=>({resolved_path:path.resolve(file),sha256:sha256(fs.readFileSync(file))});
 const retain=(name,value)=>{const file=path.join(output,name+'.json');fs.writeFileSync(file,JSON.stringify(value,null,2),{flag:'wx'});return ref(file);};
 const validateRecord=value=>{const file=path.join(output,'record-validation-'+(++serial)+'.json');fs.writeFileSync(file,JSON.stringify(value));const r=spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',schema,file],{encoding:'utf8',windowsHide:true});assert.ok([0,1].includes(r.status),r.stderr);return r.status===0;};
 // File.Replace may set SE_DACL_AUTO_INHERITED while retaining the same ACEs,
 // owner/group and protection. Compare effective security, retaining P and ACE flags.
 const acl=file=>{const r=spawnSync('pwsh',['-NoProfile','-Command','(Get-Acl -LiteralPath $env:FLOW_FILE).Sddl'],{env:{...process.env,FLOW_FILE:file},encoding:'utf8',windowsHide:true});assert.equal(r.status,0,r.stderr);return r.stdout.trim().replace(/D:AI(?=\()/,'D:');};
 const replaceScript=path.join(output,'checkpoint-replace.ps1');if(!fs.existsSync(replaceScript))fs.writeFileSync(replaceScript,'param([string]$Stage,[string]$Destination)\n$ErrorActionPreference="Stop"\n[System.IO.File]::Replace($Stage,$Destination,[NullString]::Value,$false)\n',{flag:'wx'});
 function inspect(record,prior){
  for(const a of observed.artifacts)assert.equal(ref(a.ref.resolved_path).sha256,a.ref.sha256,'Owner artifact changed');
  return inspectRefinement(record,prior,{...observed,application_id:applicationId,session_id:sessionId,selection:record.selection,validateRecord,hashRecord:r=>{assert.deepEqual(r,previous.record);return previous.sha256;}});
 }
 const checkpoint=createRefinementCheckpoint({sha256,encode:s=>Buffer.from(s),decode:b=>new TextDecoder('utf-8',{fatal:true}).decode(b),validateRecord,inspect,acquire:async target=>{
  assert.equal(target,destination);const before=fs.existsSync(target)?acl(target):null;
  return {resolved_path:target,single_writer:true,private_location:true,stable_identity:true,exclusive_create:true,security_preserving_replace:true,read:async()=>fs.existsSync(target)?fs.readFileSync(target):null,
   create:async bytes=>{const fd=fs.openSync(target,'wx',0o600);try{fs.writeFileSync(fd,bytes);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}},
   stage:async bytes=>{const f=path.join(output,'checkpoint-stage-'+serial+'.json');fs.writeFileSync(f,bytes,{flag:'wx',mode:0o600});return f;},readStage:async f=>fs.readFileSync(f),
   backup:async bytes=>{const f=path.join(output,'checkpoint-backup-'+serial+'.json');fs.writeFileSync(f,bytes,{flag:'wx',mode:0o600});return f;},readBackup:async f=>fs.readFileSync(f),
   replace:async stage=>{const r=spawnSync('pwsh',['-NoProfile','-File',replaceScript,stage,target],{encoding:'utf8',windowsHide:true});assert.equal(r.status,0,r.stderr);},verifySecurity:async()=>!before||acl(target)===before,release:async()=>{}};
 }});
 return {ref,retain,observed,inspect,observePrevious:bytes=>{assert.equal(previous,null);previous={record:JSON.parse(bytes),sha256:sha256(bytes)};},observeArtifact:artifact=>{observed.artifacts.push({ref:artifact,application_id:applicationId,validated:true});return artifact;},save:async record=>{
  const r=await checkpoint(record,previous?.sha256||null,destination,previous);assert.equal(r.status,'confirmed',JSON.stringify(r));previous={record:JSON.parse(fs.readFileSync(destination)),sha256:ref(destination).sha256};return r;
 }};
}
module.exports={createRecordWriter};
