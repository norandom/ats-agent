'use strict';
// Maintenance only. No import-time writes, candidate discovery or publication.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync,execFileSync}=require('node:child_process');
const {verifyPreparedCandidate}=require('./prepare.cjs'),{readDeclaration,hostMetadata,validateRecord}=require('./candidate-definition.cjs');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n'),digest=items=>hash(Buffer.from(JSON.stringify(items)));
function demand(ok){if(!ok)throw Error('Archive precondition failed');}
function safePath(value){demand(typeof value==='string'&&path.isAbsolute(value));const resolved=path.resolve(value);let cursor=path.parse(resolved).root;for(const piece of resolved.slice(cursor.length).split(path.sep).filter(Boolean)){cursor=path.join(cursor,piece);if(fs.existsSync(cursor))demand(!fs.lstatSync(cursor).isSymbolicLink());}return resolved;}
const within=(a,b)=>a===b||a.startsWith(b+path.sep);
const failure=(category,scope,status='failed')=>({status,issues:[{category,scope,next_action:'Select verified source and distinct absent destinations with ZIP tools available; preserve prior files and retry explicitly.'}]});
function entryName(name){demand(typeof name==='string'&&name.length&&!name.includes('\\')&&!/^[A-Za-z]:|^\//.test(name));demand(name.split('/').every(p=>p&&p!=='.'&&p!=='..'&&!/[. ]$|[:\x00-\x1f]/.test(p)));return name;}
/** Build only a verified selected snapshot, using the builder bytes bound to that snapshot.
 * prepared={root,sourceRevision,sourceEpoch}; output={stage,archives}, both absent absolute directories.
 * Returns unapproved outer artifact records; independent archive/privacy and installed checks remain separate.
 */
function buildArtifacts(prepared,output){
 let scope='prepared-source';try{
  const root=safePath(prepared.root);demand(/^[a-f0-9]{40}$/.test(prepared.sourceRevision)&&Number.isSafeInteger(prepared.sourceEpoch));
  const verified=verifyPreparedCandidate(root,{sourceRevision:prepared.sourceRevision,sourceEpoch:prepared.sourceEpoch});if(verified.status!=='passed')return verified;
  const snapshot=verified.value.snapshot;
  // Loaded generator modules must be identical to the selected source; no checkout builder substitution.
  for(const relative of ['release/candidate.schema.json','release/package.cjs','release/prepare.cjs','release/candidate-definition.cjs','release/check.cjs','tests/portable-skill-release/foundation.cjs']){const expected=snapshot.build_inputs.find(i=>i.path===relative);demand(expected&&hash(fs.readFileSync(path.resolve(__dirname,'..',relative)))===expected.sha256);}
  const declarationResult=readDeclaration(root);if(declarationResult.status!=='passed')return declarationResult;const declaration=declarationResult.value.declaration;
  scope='destination';const stage=safePath(output.stage),archives=safePath(output.archives);demand(!fs.existsSync(stage)&&!fs.existsSync(archives));for(const [a,b]of [[stage,archives],[archives,stage],[stage,root],[root,stage],[archives,root],[root,archives]])demand(!within(a,b));
  scope='archive-tools';for(const tool of ['zip','unzip']){const probe=spawnSync(tool,['-v'],{encoding:'utf8',windowsHide:true,timeout:30000});if(probe.error||probe.status!==0)return failure('prerequisite',tool,'not_assessed');}
  scope='layout';const inventory=JSON.parse(fs.readFileSync(path.join(root,'release/manifest.json'),'utf8')),views=hostMetadata(snapshot.name,snapshot.version),plans=[];
  const build_input_digest=digest(snapshot.build_inputs.map(({path,size,sha256})=>({path,size,sha256})));
  for(const format of ['portable-zip','plugin-zip']){
   const entries=new Map(),collisions=new Set();const add=(name,bytes)=>{entryName(name);const key=name.normalize('NFC').toLowerCase();demand(!collisions.has(key));collisions.add(key);entries.set(name,bytes);};
   for(const asset of snapshot.assets){const bytes=fs.readFileSync(path.join(root,asset.source));for(const name of asset.destinations[format])add(name,bytes);}
   const generated=inventory.generated.find(g=>g.role==='host-metadata').destinations[format];
   for(const name of generated){const view=name==='plugin.json'?'generic':name.startsWith('.codex-')?'codex':name.startsWith('.claude-')?'claude':name.startsWith('.gemini-')?'gemini':null;demand(view);add(name,json(views[view]));}
   const files=[...entries].map(([path,bytes])=>({path,size:bytes.length,sha256:hash(bytes)})).sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0),payload_digest=digest(files);
   const metadata={schema_version:'1.0',kind:'release-metadata',name:snapshot.name,version:snapshot.version,source_revision:snapshot.source_revision,source_epoch:snapshot.source_epoch,development_snapshot:snapshot.development_snapshot,format:format==='portable-zip'?'portable':'plugin',scope:declaration.scope,contracts:declaration.contracts,prerequisites:declaration.prerequisites,targets:declaration.targets,files,payload_digest,build_input_digest,release_ready:false};
   const metaNames=inventory.generated.find(g=>g.role==='release-metadata').destinations[format];demand(metaNames.length===1);const metadataBytes=json(metadata);add(metaNames[0],metadataBytes);
   plans.push({format,entries,payload_digest,release_metadata_sha256:hash(metadataBytes),filename:`${snapshot.name}-${snapshot.version}${format==='plugin-zip'?'-plugin':''}.zip`});
  }
  // Complete preflight, including final record validation, before first destination write.
  const provisional=plans.map(p=>({schema_version:'1.0',kind:'artifact',name:snapshot.name,version:snapshot.version,format:p.format,filename:p.filename,size:1,sha256:'0'.repeat(64),release_metadata_sha256:p.release_metadata_sha256,payload_digest:p.payload_digest,build_input_digest,source_revision:snapshot.source_revision}));
  for(const record of provisional){const result=validateRecord(record);if(result.status!=='passed')return result;}
  scope='archive-production';fs.mkdirSync(path.dirname(stage),{recursive:true});fs.mkdirSync(stage);fs.mkdirSync(path.dirname(archives),{recursive:true});fs.mkdirSync(archives);
  const artifacts=[];
  for(let index=0;index<plans.length;index++){
   const plan=plans[index],folder=path.join(stage,plan.format);fs.mkdirSync(folder);const names=[...plan.entries.keys()].sort();
   for(const name of names){const target=path.join(folder,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,plan.entries.get(name),{flag:'wx',mode:0o644});fs.chmodSync(target,0o644);fs.utimesSync(target,snapshot.source_epoch,snapshot.source_epoch);}
   const archive=path.join(archives,plan.filename);demand(!fs.existsSync(archive));execFileSync('zip',['-X','-q',archive,...names],{cwd:folder,env:{...process.env,TZ:'UTC'},windowsHide:true,stdio:['ignore','pipe','pipe'],timeout:60000});
   const bytes=fs.readFileSync(archive);const record={...provisional[index],size:bytes.length,sha256:hash(bytes)};const valid=validateRecord(record);if(valid.status!=='passed')return valid;artifacts.push(record);
   if(plan.format==='portable-zip'){const filename=plan.filename.replace(/\.zip$/,'.skill');fs.copyFileSync(archive,path.join(archives,filename),fs.constants.COPYFILE_EXCL);artifacts.push({...record,format:'skill-alias',filename});}
  }
  fs.writeFileSync(path.join(archives,'artifacts.json'),json(artifacts),{flag:'wx'});fs.writeFileSync(path.join(archives,'SHA256SUMS'),artifacts.map(a=>`${a.sha256}  ${a.filename}`).join('\n')+'\n',{flag:'wx'});
  return {status:'passed',value:{artifacts,release_ready:false,archive_verification:'not_assessed',installed_acceptance:'not_assessed'},checks:[{method:'source-bound-layout-build',observation_class:'actual',status:'passed',limits:'Construction only; independent archive privacy/integrity, reproducibility and installed operation remain unassessed.'}]};
 }catch{return failure('integrity',scope);}
}
module.exports={buildArtifacts};
if(require.main===module){let result;try{const options={},args=process.argv.slice(2);for(let i=0;i<args.length;i+=2){demand(['--prepared','--source-revision','--source-epoch','--stage','--archives'].includes(args[i])&&!Object.hasOwn(options,args[i])&&args[i+1]);options[args[i]]=args[i+1];}demand(Object.keys(options).length===5);result=buildArtifacts({root:options['--prepared'],sourceRevision:options['--source-revision'],sourceEpoch:Number(options['--source-epoch'])},{stage:options['--stage'],archives:options['--archives']});}catch{result=failure('definition','command-line');}console.log(JSON.stringify(result,null,2));if(result.status!=='passed')process.exitCode=1;}
