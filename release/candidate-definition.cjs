'use strict';
// Maintenance boundary only: validates release records; never runs an application workflow.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const schema=path.join(__dirname,'candidate.schema.json');
const issue=(category,scope,next_action)=>({category,scope,next_action});
const failure=(category,scope,next_action)=>({status:'failed',issues:[issue(category,scope,next_action)]});
const exact=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
/** @param {unknown} record @returns {{status: string, value?: object, checks?: object[], issues?: object[]}}
 * Validate structure through the pinned validator, then release-specific invariants. */
function validateRecord(record){
 let directory;
 try{
  directory=fs.mkdtempSync(path.join(os.tmpdir(),'targeted-cv-release-'));
  const input=path.join(directory,'record.json');fs.writeFileSync(input,JSON.stringify(record),{mode:0o600});
  const check=spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',schema,input],{encoding:'utf8',windowsHide:true,timeout:30000,shell:false});
  if(check.error)return {status:'not_assessed',issues:[issue('prerequisite','schema-validator','Provide the pinned uvx validator and retry validation.')]};
  if(check.status!==0&&/not found|failed to (?:download|fetch)|network|connection|timed out|No solution found|Failed to spawn/i.test(check.stderr||''))return {status:'not_assessed',issues:[issue('prerequisite','schema-validator','Restore pinned validator availability before validating records.')]};
  if(check.status!==0)return failure('definition',record?.kind||'record','Correct the closed maintenance record; validator details are withheld to avoid echoing private inputs.');
  if(record.kind==='candidate-declaration'){
   if(!exact(record.scope,['profile','strategy','document-session','documents','refinement']))return failure('definition','scope','Retain all approved capabilities.');
   const contracts={profile:['1.0','2.0','2.1'],strategy:['1.0','1.1','1.2'],documents:['1.0','1.1','1.2'],document_session:['1.0'],refinement_session:['1.0']};
   for(const [key,value]of Object.entries(contracts))if(!exact(record.contracts[key],value))return failure('definition','contracts','Retain the current and compatibility contract versions.');
   const ids=record.prerequisites.map(p=>p.id);if(new Set(ids).size!==ids.length)return failure('prerequisite','prerequisites','Remove duplicate prerequisite identities.');
   const required={
    'host-reasoning':['applicant',['session-reasoning']],
    'private-files':['applicant',['explicit-selection','hashing','stable-path-identity','exclusive-writer','security-preserving-stage-backup-replace','exact-authorization','readback']],
    javascript:['applicant',['embedded-owner-algorithms','trusted-filesystem-adapters']],
    'schema-validator':['applicant',[]],
    'wordcraft-mcp':['applicant',['desktop-connection','tool-discovery','live-authoring','readback','render','save-reopen']],
    node:['maintenance',[]],pnpm:['maintenance',[]],uv:['maintenance',[]],dagger:['maintenance',[]],
    'archive-tools':['maintenance',['zip','unzip']],'checkout-tests':['maintenance',['deterministic-regressions']]
   };
   for(const [id,[role,capabilities]]of Object.entries(required)){
    const p=record.prerequisites.find(p=>p.id===id);if(!p||!p.required||p.role!==role||!capabilities.every(c=>p.capabilities.includes(c)))return failure('prerequisite',id,'Declare the required capability and its runtime or maintenance role.');
   }
   const validator=record.prerequisites.find(p=>p.id==='schema-validator');
   if(validator.version!=='0.38.2'||JSON.stringify(validator.command)!==JSON.stringify(['uvx','--from','check-jsonschema==0.38.2','check-jsonschema']))return failure('prerequisite','schema-validator','Use the approved exact validator command.');
   for(const id of ['cobesy','humanizer']){const p=record.prerequisites.find(p=>p.id===id);if(!p||p.required||p.role!=='optional'||!p.capabilities.includes('install-or-embedded-fallback'))return failure('prerequisite',id,'Keep optional installation and embedded fallback available.');}
   if(new Set(record.targets.map(t=>t.id)).size!==record.targets.length)return failure('definition','targets','Use unique target identifiers.');
   if(!record.targets.some(t=>t.id==='windows-filesystem'&&t.platform==='windows'&&t.format==='portable-zip'))return failure('definition','targets','Retain the primary Windows filesystem acceptance target.');
   if(!exact(record.targets.map(t=>t.format),['portable-zip','skill-alias','plugin-zip']))return failure('definition','formats','Declare all approved distribution formats.');
   for(const t of record.targets){
    if(t.connection!=='desktop-wordcraft-mcp')return failure('prerequisite',t.id,'Declare the desktop WordCraft MCP connection.');
    if([t.layout_verified,t.host_load_verified,t.workflow_verified].some(s=>s!=='not_assessed')||t.evidence!==null)return failure('evidence',t.id,'Keep intended-target declarations unassessed; verification belongs to artifact-bound support reports.');
    if(t.javascript_runtime==='external-node'&&!record.prerequisites.some(p=>p.id==='host-node'&&p.role==='applicant'&&p.required&&p.version))return failure('prerequisite',t.id,'Declare the selected external Node runtime as an applicant prerequisite.');
   }
  }
  if(record.kind==='readiness-report'&&(!exact(record.gates.map(g=>g.id),['definition','integrity','rights','privacy','reproducibility','installed-acceptance','affected-regressions','core-preservation'])||record.status!==require('./readiness.cjs').readinessStatus(record.gates)))return failure('evidence','readiness-status','Derive readiness from all mandatory gates; stored status cannot override evidence.');
  return {status:'passed',value:structuredClone(record),checks:[]};
 }catch{return failure('definition','record','Provide a serializable maintenance record and available schema.');}
 finally{if(directory){try{const input=path.join(directory,'record.json');if(fs.existsSync(input))fs.unlinkSync(input);fs.rmdirSync(directory);}catch{/* Cleanup cannot authorize success or replace the validation result. */}}}
}
/** Read only declared generic release inputs. Optional packageVersion is a comparison input for tests/build integration. */
function readDeclaration(root,{packageVersion}={}){
 try{
  const declaration=JSON.parse(fs.readFileSync(path.join(root,'release/candidate.json'),'utf8'));
  const result=validateRecord(declaration);if(result.status!=='passed')return result;
  const version=fs.readFileSync(path.join(root,'VERSION'),'utf8').trim();
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  if(!/^2\.0\.0-alpha\.[1-9][0-9]*$/.test(version)||Number(version.split('.').at(-1))<2||version!==pkg.version||(packageVersion!==undefined&&version!==packageVersion))return failure('definition','version','Select an unused alpha after the published baseline and align package metadata.');
  const entry=fs.readFileSync(path.join(root,'skills/targeted-cv/SKILL.md'),'utf8');
  if(!/^name: targeted-cv\r?$/m.test(entry))return failure('definition','entrypoint','Align the skill name with release identity.');
  return {status:'passed',value:{declaration,version,host_metadata:hostMetadata(declaration.name,version)},checks:[]};
 }catch{return failure('definition','release-inputs','Provide the declaration, VERSION, package metadata and skill entrypoint.');}
}
/** Generate only locally observed layout metadata; this conveys no host-load or workflow approval. */
function hostMetadata(name,version){
 if(name!=='targeted-cv'||!/^2\.0\.0-alpha\.[1-9][0-9]*$/.test(version)||Number(version.split('.').at(-1))<2)throw Error('Invalid candidate identity');
 return {generic:{name,version},codex:{name,version,skills:'./skills/'},claude:{name,version},gemini:{name,version,skills:['./skills/']}};
}
module.exports={validateRecord,readDeclaration,hostMetadata};
