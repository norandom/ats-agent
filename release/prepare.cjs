'use strict';
// Generic maintenance only; importing this module has no filesystem side effects.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const {checkRegularFile,validateFoundation}=require('../tests/portable-skill-release/foundation.cjs');
const {readDeclaration,validateRecord}=require('./candidate-definition.cjs');
const {checkDefinition}=require('./check.cjs');
const descriptorName='SOURCE-SNAPSHOT.json';
const metadata=['release/notes.md','.gitattributes','VERSION','package.json','release/README.md','release/prepare.cjs','release/package.cjs'];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
// Bytewise CRLF equivalence avoids lossy UTF-8 decoding of arbitrary maintenance bytes.
function lfBytes(bytes){return Buffer.from([...bytes].filter((byte,i)=>byte!==13||bytes[i+1]!==10));}
function demand(value){if(!value)throw Error('Preparation precondition failed');}
const failure=(category,scope)=>({status:'failed',issues:[{category,scope,next_action:'Select matching generic source inputs and an absent safe destination; retain existing files and retry explicitly.'}]});
function noRedirect(absolute){
 demand(typeof absolute==='string'&&absolute.length);const resolved=path.resolve(absolute),parsed=path.parse(resolved);let current=parsed.root;
 for(const part of resolved.slice(parsed.root.length).split(path.sep).filter(Boolean)){current=path.join(current,part);let stat;try{stat=fs.lstatSync(current);}catch(error){if(error.code!=='ENOENT')throw error;}if(stat)demand(!stat.isSymbolicLink());}return resolved;
}
/** Complete explicit generic build/test closure; no private inputs, author configuration or glob. */
function genericInputs(root){
 noRedirect(root);const foundation=JSON.parse(fs.readFileSync(checkRegularFile(root,'tests/portable-skill-release/manifest.json'),'utf8'));validateFoundation(root,foundation);
 const inventory=JSON.parse(fs.readFileSync(checkRegularFile(root,'release/manifest.json'),'utf8'));
 return [...new Set([...foundation.core.map(a=>a.path),...foundation.maintenance,...inventory.assets.map(a=>a.source),...metadata])].sort();
}
function git(root,args,options={}){return execFileSync('git',args,{cwd:root,windowsHide:true,maxBuffer:64*1024*1024,stdio:['pipe','pipe','pipe'],...options});}
function selectedBlobs(root,revision,files){
 const tree=git(root,['ls-tree','-r','-z',revision]).toString('utf8').split('\0').filter(Boolean);
 const indexed=new Map(tree.map(line=>{const [head,file]=line.split('\t'),[mode,type,id]=head.split(' ');return [file,{mode,type,id}];}));
 const entries=files.map(file=>{const entry=indexed.get(file);demand(entry?.mode==='100644'&&entry.type==='blob');return entry;});
 const output=git(root,['cat-file','--batch'],{input:entries.map(e=>e.id).join('\n')+'\n'});let offset=0;const result=new Map();
 for(let i=0;i<files.length;i++){const end=output.indexOf(10,offset),header=output.subarray(offset,end).toString('ascii').split(' '),size=Number(header[2]);demand(header[0]===entries[i].id&&header[1]==='blob'&&Number.isSafeInteger(size));offset=end+1;result.set(files[i],output.subarray(offset,offset+size));offset+=size+1;}demand(offset===output.length);return result;
}
function collect({root,sourceRevision,sourceEpoch,allowDevelopment=false}){
 root=noRedirect(root);demand(/^[a-f0-9]{40}$/.test(sourceRevision));demand(Number.isSafeInteger(sourceEpoch)&&sourceEpoch>=0);
 demand(git(root,['rev-parse','--verify',sourceRevision+'^{commit}']).toString().trim()===sourceRevision);
 demand(Number(git(root,['show','-s','--format=%ct',sourceRevision]).toString().trim())===sourceEpoch);
 const definition=checkDefinition(root);if(definition.status!=='passed')return definition;const declared=readDeclaration(root);if(declared.status!=='passed')return declared;
 const manifest=JSON.parse(fs.readFileSync(checkRegularFile(root,'release/manifest.json'),'utf8')),files=genericInputs(root),blobs=selectedBlobs(root,sourceRevision,files),payload=new Set(manifest.assets.map(a=>a.source)),bytes=new Map();let development=false;
 const build_inputs=files.map(file=>{
  const raw=fs.readFileSync(checkRegularFile(root,file)),blob=blobs.get(file);let selected=blob;
  if(!raw.equals(blob)){
   demand(!payload.has(file));const eolOnly=lfBytes(raw).equals(lfBytes(blob));
   if(!eolOnly){demand(allowDevelopment);development=true;selected=raw;}
  }
  bytes.set(file,selected);return {path:file,sha256:hash(selected),size:selected.length,checkout_sha256:hash(raw)};
 });
 const assets=manifest.assets.map(a=>({...a,size:bytes.get(a.source).length,sha256:hash(bytes.get(a.source))}));
 const snapshot={schema_version:'1.0',kind:'prepared-candidate',name:declared.value.declaration.name,version:declared.value.version,source_revision:sourceRevision,source_epoch:sourceEpoch,development_snapshot:development,assets,build_inputs};
 const result=validateRecord(snapshot);return result.status==='passed'?{status:'passed',value:snapshot,bytes}:result;
}
/** Capture an external descriptor BEFORE staging; all descriptor paths are source-relative. */
function captureSourceSnapshot(options){try{const result=collect(options);return result.status==='passed'?{status:'passed',value:result.value,checks:[]}:result;}catch{return failure('integrity','source-snapshot');}}
/** @param {{root:string,snapshot:object}} definition @param {string} destination */
function prepareCandidate(definition,destination){
 let scope='destination';try{
  const target=noRedirect(destination),root=noRedirect(definition.root);demand(!fs.existsSync(target)&&target!==root&&!root.startsWith(target+path.sep));
  demand(!definition.snapshot.build_inputs.some(a=>path.join(root,a.path).startsWith(target+path.sep)));
  scope='source-snapshot';const result=collect({root,sourceRevision:definition.snapshot.source_revision,sourceEpoch:definition.snapshot.source_epoch,allowDevelopment:definition.snapshot.development_snapshot});
  if(result.status!=='passed')return result;demand(equal(result.value,definition.snapshot));
  // All source preconditions complete before writes. Exclusive leaf creation never overwrites a destination.
  fs.mkdirSync(path.dirname(target),{recursive:true});fs.mkdirSync(target);
  for(const [file,bytes]of result.bytes){const output=path.join(target,file);fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,bytes,{flag:'wx',mode:0o644});}
  fs.writeFileSync(path.join(target,descriptorName),JSON.stringify(result.value,null,2)+'\n',{flag:'wx',mode:0o644});
  return {status:'passed',value:result.value,checks:[{method:'selected-Git-blobs-and-exact-generic-closure',observation_class:'actual',status:'passed',limits:'Preparation only. Privacy review, archive integrity, reproducibility and installed acceptance remain unassessed; preparation grants no release readiness.'}]};
 }catch{return failure(scope==='destination'?'destination':'integrity',scope);}
}
function listFiles(root,relative=''){
 let files=[];for(const entry of fs.readdirSync(path.join(root,relative),{withFileTypes:true})){const file=relative?relative+'/'+entry.name:entry.name;demand(!entry.isSymbolicLink());if(entry.isDirectory())files.push(...listFiles(root,file));else {checkRegularFile(root,file);files.push(file);}}return files.sort();
}
/** Verify a prepared context WITHOUT Git. Supply independently selected expected provenance in Dagger. */
function verifyPreparedCandidate(root,{sourceRevision,sourceEpoch}={}){
 try{
  noRedirect(root);const snapshot=JSON.parse(fs.readFileSync(checkRegularFile(root,descriptorName),'utf8')),valid=validateRecord(snapshot);if(valid.status!=='passed')return valid;demand(snapshot.kind==='prepared-candidate');
  if(sourceRevision!==undefined)demand(snapshot.source_revision===sourceRevision);if(sourceEpoch!==undefined)demand(snapshot.source_epoch===sourceEpoch);
  const expected=genericInputs(root);demand(equal(snapshot.build_inputs.map(a=>a.path),expected));demand(equal(listFiles(root),[...expected,descriptorName].sort()));
  for(const input of snapshot.build_inputs){const bytes=fs.readFileSync(checkRegularFile(root,input.path));demand(bytes.length===input.size&&hash(bytes)===input.sha256);}
  const manifest=JSON.parse(fs.readFileSync(checkRegularFile(root,'release/manifest.json'),'utf8'));demand(equal(snapshot.assets,manifest.assets.map(a=>{const input=snapshot.build_inputs.find(i=>i.path===a.source);return {...a,size:input.size,sha256:input.sha256};})));
  const definition=checkDefinition(root),declared=readDeclaration(root);if(definition.status!=='passed')return definition;if(declared.status!=='passed')return declared;demand(declared.value.version===snapshot.version&&declared.value.declaration.name===snapshot.name);
  return {status:'passed',value:{snapshot,release_ready:false,artifact_ready:'not_assessed'},checks:[]};
 }catch{return failure('integrity','prepared-context');}
}
module.exports={genericInputs,captureSourceSnapshot,prepareCandidate,verifyPreparedCandidate,descriptorName};
if(require.main===module){
 // capture --root ROOT --source-revision SHA --source-epoch EPOCH --snapshot ABSENT_FILE [--development]
 // stage --root ROOT --snapshot FILE --destination ABSENT_DIR
 // verify --root PREPARED --source-revision SHA --source-epoch EPOCH
 const [command,...args]=process.argv.slice(2),options={};let result;
 try{for(let i=0;i<args.length;i++){const key=args[i];demand(/^--[a-z-]+$/.test(key)&&!Object.hasOwn(options,key));if(key==='--development')options[key]=true;else {demand(args[i+1]&&!args[i+1].startsWith('--'));options[key]=args[++i];}}
  const allowed=command==='capture'?['--root','--source-revision','--source-epoch','--snapshot','--development']:command==='stage'?['--root','--snapshot','--destination']:command==='verify'?['--root','--source-revision','--source-epoch']:[];
  demand(allowed.length&&Object.keys(options).every(k=>allowed.includes(k))&&typeof options['--root']==='string');
  if(command==='capture'){
   const output=noRedirect(options['--snapshot']),root=path.resolve(options['--root']);demand(!fs.existsSync(output));demand(!output.startsWith(root+path.sep)||output.startsWith(path.join(root,'outputs')+path.sep));
   result=captureSourceSnapshot({root,sourceRevision:options['--source-revision'],sourceEpoch:Number(options['--source-epoch']),allowDevelopment:options['--development']===true});
   if(result.status==='passed'){fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result.value,null,2)+'\n',{flag:'wx'});}
  }else if(command==='stage')result=prepareCandidate({root:options['--root'],snapshot:JSON.parse(fs.readFileSync(options['--snapshot'],'utf8'))},options['--destination']);
  else {demand(options['--source-revision']&&options['--source-epoch']);result=verifyPreparedCandidate(options['--root'],{sourceRevision:options['--source-revision'],sourceEpoch:Number(options['--source-epoch'])});}
 }catch{result=failure('definition','command-line');}console.log(JSON.stringify(result,null,2));if(result.status!=='passed')process.exitCode=1;
}
