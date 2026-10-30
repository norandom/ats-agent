'use strict';
// Maintenance-only bounded host operation. No application owners, model or desktop calls.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function demand(ok){if(!ok)throw Error('Installation precondition failed');}
function safe(value){demand(typeof value==='string'&&path.isAbsolute(value));const target=path.resolve(value);let cursor=path.parse(target).root;for(const part of target.slice(cursor.length).split(path.sep).filter(Boolean)){cursor=path.join(cursor,part);try{demand(!fs.lstatSync(cursor).isSymbolicLink());}catch(e){if(e.code!=='ENOENT')throw e;}}return target;}
function absent(value){safe(value);try{fs.lstatSync(value);throw Error('Destination exists');}catch(e){if(e.code!=='ENOENT')throw e;}}
function managed(result){const prefix=result.value.artifact.format==='plugin-zip'?'skills/targeted-cv/':'targeted-cv/';const files=result.value.inventory.filter(f=>f.path.startsWith(prefix)).map(f=>({...f,path:f.path.slice(prefix.length)}));demand(files.length>0&&files.some(f=>f.path==='SKILL.md'));return {prefix,files};}
function exact(root,files){
 safe(root);demand(fs.lstatSync(root).isDirectory());const expected=new Map(files.map(f=>[f.path,f])),dirs=new Set();for(const f of files){const parts=f.path.split('/');while(parts.length>1){parts.pop();dirs.add(parts.join('/'));}}
 let count=0;function walk(relative=''){for(const entry of fs.readdirSync(path.join(root,relative),{withFileTypes:true})){const name=relative?relative+'/'+entry.name:entry.name,full=safe(path.join(root,name)),stat=fs.lstatSync(full);demand(!stat.isSymbolicLink());if(stat.isDirectory()){demand(dirs.has(name));walk(name);}else{const wanted=expected.get(name);demand(stat.isFile()&&stat.nlink===1&&wanted);const bytes=fs.readFileSync(full);demand(bytes.length===wanted.size&&hash(bytes)===wanted.sha256);count++;}}}walk();demand(count===files.length);
}
function copyManaged(from,to,files){absent(to);fs.mkdirSync(to);for(const file of files){const dest=path.join(to,file.path);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(safe(path.join(from,file.path)),dest,fs.constants.COPYFILE_EXCL);}exact(to,files);}
function verifySelected(selection,destination){
 demand(selection&&Object.keys(selection).sort().join(',')==='archive,expected'&&selection.expected&&!Object.hasOwn(selection.expected,'destination'));
 const verifier=safe(path.join(safe(selection.expected.prepared.root),'release/verify.cjs'));demand(fs.lstatSync(verifier).isFile());
 // The selected prepared root is trusted executable maintenance input, never inferred from archive bytes.
 return require(verifier).verifyArtifact(selection.archive,{...selection.expected,...(destination?{destination}:{})});
}
/** Explicit trusted selection: {archive, expected:{artifact,prepared}}; expected records are selected independently of the archive. */
function installManaged(selection,operation){
 let scope='selection',lock,locked=false,oldMoved=false,destination,old;
 try{
  demand(selection&&operation&&Object.keys(selection).sort().join(',')==='archive,expected'&&Object.keys(operation).every(k=>['destination','stage','prior','recovery'].includes(k)));
  demand(!Object.hasOwn(selection.expected,'destination'));
  destination=safe(operation.destination);const stage=safe(operation.stage),parent=path.dirname(destination);demand(fs.statSync(parent).isDirectory()&&path.dirname(stage)===parent&&stage!==destination);absent(stage);
  let recovery;if(operation.prior){recovery=safe(operation.recovery);demand(path.dirname(recovery)===parent&&recovery!==stage&&recovery!==destination);absent(recovery);}else{demand(!Object.hasOwn(operation,'recovery'));absent(destination);}
  scope='exclusive-host-operation';lock=destination+'.install-lock';safe(lock);fs.mkdirSync(lock);locked=true;
  scope='archive';const verified=verifySelected(selection);demand(verified.status==='passed');const current=managed(verified);
  let previous;if(operation.prior){demand(Object.keys(operation.prior).sort().join(',')==='archive,expected'&&!Object.hasOwn(operation.prior.expected,'destination'));const prior=verifySelected(operation.prior);demand(prior.status==='passed');previous=managed(prior);scope='prior-managed-inventory';exact(destination,previous.files);}
  scope='sibling-staging';const staged=verifySelected(selection,stage);demand(staged.status==='passed');const source=safe(path.join(stage,current.prefix));exact(source,current.files);
  if(previous){scope='recovery-copy';copyManaged(destination,recovery,previous.files);exact(destination,previous.files);scope='managed-replacement';old=path.join(stage,'prior-managed');absent(old);safe(destination);fs.renameSync(destination,old);oldMoved=true;}else absent(destination);
  safe(destination);fs.renameSync(source,destination);exact(destination,current.files);oldMoved=false;
  return {status:'passed',value:{artifact:verified.value.artifact,inventory:current.files,destination,stage,...(recovery?{recovery}:{}),installed_acceptance:'not_assessed',release_ready:false},checks:[{method:'verified-archive-sibling-stage-and-exact-managed-replacement',observation_class:'actual',status:'passed',limits:'Cooperative exclusive host writer required throughout; no desktop or applicant workflow acceptance.'}]};
 }catch{if(oldMoved){try{absent(destination);fs.renameSync(old,destination);}catch{/* Retain prior-managed and recovery; never overwrite an unexpected destination. */}}return {status:'failed',issues:[{category:'destination',scope,next_action:'Retain destination, sibling stage and recovery; inspect locally and retry only with matching independently selected archives and exclusive host access.'}]};
 }finally{if(locked){try{safe(lock);fs.rmdirSync(lock);}catch{/* Preserve unexpected lock contents for local inspection. */}}}
}
module.exports={installManaged};
