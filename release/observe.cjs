'use strict';
// Maintenance observation only. The host runs the application using installed owners.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const {isDeepStrictEqual:same}=require('node:util');
const {validateRecord}=require('./candidate-definition.cjs');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const text=v=>typeof v==='string'&&v.trim().length>0;
function demand(ok){if(!ok)throw Error('Observation precondition failed');}
function keys(v,required,optional=[]){demand(v&&typeof v==='object'&&!Array.isArray(v)&&required.every(k=>Object.hasOwn(v,k))&&Object.keys(v).every(k=>[...required,...optional].includes(k)));}
function relative(v){demand(text(v)&&/^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*$/.test(v)&&!v.split('/').some(p=>p==='.'||p==='..'));return v;}
function inside(a,b){const rel=path.relative(a,b);return rel===''||(!rel.startsWith('..'+path.sep)&&rel!=='..'&&!path.isAbsolute(rel));}
function safe(v){demand(text(v)&&path.isAbsolute(v));const resolved=path.resolve(v);let cursor=path.parse(resolved).root;for(const part of resolved.slice(cursor.length).split(path.sep).filter(Boolean)){cursor=path.join(cursor,part);demand(!fs.lstatSync(cursor).isSymbolicLink());}return resolved;}
function read(root,name){
 relative(name);const file=safe(path.join(root,name));demand(inside(root,file));const descriptor=fs.openSync(file,fs.constants.O_RDONLY|(fs.constants.O_NOFOLLOW||0));
 try{const before=fs.fstatSync(descriptor);demand(before.isFile()&&before.nlink===1);const bytes=fs.readFileSync(descriptor),after=fs.fstatSync(descriptor),current=fs.statSync(safe(file));demand(before.dev===after.dev&&before.ino===after.ino&&before.size===after.size&&before.mtimeMs===after.mtimeMs&&current.dev===after.dev&&current.ino===after.ino);return {bytes,ref:{path:name,sha256:hash(bytes),size:bytes.length}};}finally{fs.closeSync(descriptor);}
}
function inventory(root){const files=[];function walk(dir=''){for(const entry of fs.readdirSync(safe(path.join(root,dir)),{withFileTypes:true})){const name=dir?dir+'/'+entry.name:entry.name;relative(name);const full=safe(path.join(root,name));if(fs.lstatSync(full).isDirectory())walk(name);else files.push(read(root,name).ref);}}walk();demand(files.some(f=>f.path==='SKILL.md'));return files.sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);}
/** Delegation boundary, NOT a filesystem implementation or a certification of host guarantees.
 * Only live trusted host callbacks can issue leases/decisions. Imported JSON is never consulted. */
function createHostAdapters(trusted={}){
 const contracts={
  acquirePersistence:{flags:['single_writer','private_location','security_preserving_replace'],methods:['read','stage','readStage','backup','readBackup','replace','verifySecurity','cleanupStage','release']},
  acquireFork:{flags:['single_writer','private_location','exclusive_create'],methods:['readSource','read','retainSource','readRetained','create','verifySecurity','release']},
  acquireCheckpoint:{flags:['single_writer','private_location','stable_identity'],methods:['read','verifySecurity','release']}
 };
 const result={};for(const [name,contract]of Object.entries(contracts))result[name]=async(...args)=>{
  if(typeof trusted[name]!=='function')return null;let lease;try{lease=await trusted[name](...args);const checkpoint=name!=='acquireCheckpoint'||lease?.resolved_path===args[0]&&((lease.exclusive_create===true&&typeof lease.create==='function')||(lease.security_preserving_replace===true&&['stage','readStage','backup','readBackup','replace'].every(k=>typeof lease[k]==='function')));if(lease&&checkpoint&&contract.flags.every(k=>lease[k]===true)&&contract.methods.every(k=>typeof lease[k]==='function'))return lease;}catch{/* An unavailable preflight never establishes a lease. */}
  try{await lease?.release?.();}catch{/* Host must retain private uncertain state. */}return null;
 };
 result.userDecision=async envelope=>{if(typeof trusted.userDecision!=='function')return null;try{const baseline=structuredClone(envelope),decision=await trusted.userDecision(structuredClone(baseline));if(decision&&['approved','declined'].includes(decision.decision)&&same(decision.reviewed,baseline)&&(decision.decision==='declined'||decision.authorization&&typeof decision.authorization==='object'))return decision;}catch{/* No imported authority fallback. */}return null;};
 result.declaration={kind:'trusted-host-delegation',status:'not_assessed',operations:[...Object.keys(contracts),'userDecision'].filter(k=>typeof trusted[k]==='function'),contracts:['references/profile-updates.md','references/refinement-session.md'],limits:'Callbacks are explicit trusted host boundaries; presence is not proof of exclusion, security policy or authenticated permission. Missing live guarantees defer writes.'};
 return result;
}
/**
 * @param {{installed_root:string,evidence_root:string,artifact:string,applicants:object[]}} selection Explicit private locations, independently selected by the host.
 * @param {(session:object)=>Promise<void>} run Fresh host session; no workflow/expected prose supplied by this collector.
 * @param {{host?:Function,prerequisites?:Array,transport?:object,adapters?:object}} services Live trusted host callbacks, separate from serialized evidence.
 * @returns {Promise<object>} Collection result; never grants installed acceptance or readiness.
 */
async function observeInstalled(selection,run,services={}){
 let scope='selection';try{
  keys(selection,['installed_root','evidence_root','artifact','applicants']);keys(services,[],['host','prerequisites','transport','adapters']);demand(typeof run==='function');
  const installed=safe(selection.installed_root),evidence=safe(selection.evidence_root),checkout=path.resolve(__dirname,'..');
  demand(fs.statSync(installed).isDirectory()&&fs.statSync(evidence).isDirectory()&&!inside(installed,evidence)&&!inside(evidence,installed));
  demand(!inside(checkout,installed)&&!inside(path.resolve(checkout,'../Skills'),installed));
  const before=inventory(installed),artifact=read(evidence,selection.artifact).ref;
  demand(Array.isArray(selection.applicants)&&selection.applicants.length>0);const ids=new Set();
  const applicants=selection.applicants.map(a=>{keys(a,['id','facts','settings','state']);demand(text(a.id)&&!ids.has(a.id));ids.add(a.id);return {id:a.id,facts:read(evidence,a.facts).ref,settings:read(evidence,a.settings).ref,state:read(evidence,a.state).ref};});
  const lists={owner_receipts:[],operations:[],saved_outputs:[],renders:[],reviews:[]},reads=new Map(),prerequisites=[],limits=['Collection and hashes do not authenticate source meaning, approval, MCP effects or workflow acceptance.','Trace covers this API only; trusted host must report other reads. This is not an OS sandbox.','Evidence directory privacy and external writer exclusion belong to the selected trusted host.'];
  const adapters=createHostAdapters(services.adapters);let host=null;
  if(typeof services.host==='function'){scope='host-observation';try{host=await services.host();keys(host,['name','version','platform','connection']);demand(Object.values(host).every(text));host=structuredClone(host);}catch{host=null;}}
  let journal,sequence=0;
  function retain(label,value){if(!journal){journal='observation-'+crypto.randomUUID();fs.mkdirSync(path.join(evidence,journal),{mode:0o700});}const name=journal+'/'+String(++sequence).padStart(4,'0')+'-'+label+'.json';const bytes=Buffer.from(JSON.stringify(value));fs.writeFileSync(path.join(evidence,name),bytes,{flag:'wx',mode:0o600});return read(evidence,name).ref;}
  for(const probe of services.prerequisites||[]){keys(probe,['id','probe']);demand(text(probe.id)&&typeof probe.probe==='function'&&!prerequisites.some(p=>p.id===probe.id));let response=null;try{response=await probe.probe();}catch{/* Unavailable; do not claim successful action. */}prerequisites.push({id:probe.id,status:text(response?.version)?'observed':'not_assessed',version:text(response?.version)?response.version:null,ref:retain('prerequisite-response',response)});}
  let tools=null,identity=null;const transport={status:'not_assessed',discovery:null,identity:null};
  async function invoke(kind,request,callback){
   const requestRef=retain('request',request);
   const event=(phase,intent,response,status)=>({schema_version:'1.0',kind:'installed-transport-event',operation:kind,phase,intent,request:requestRef,response,status});
   const intent=retain('intent',event('intent',null,null,'recorded'));lists.operations.push(intent);
   try{const response=await callback(),payload=retain('response',response),ref=retain('result',event('result',intent,payload,'recorded'));lists.operations.push(ref);return {response,ref};}catch{lists.operations.push(retain('uncertain',event('uncertain',intent,null,'not_assessed')));return null;}
  }
  const session=Object.freeze({
   readResource(name){scope='installed-resource';const found=read(installed,name),expected=before.find(f=>f.path===name);demand(expected&&same(expected,found.ref));reads.set(name,found.ref);return found.bytes;},
   loadOwner(name,symbol){scope='installed-owner';demand(/^references\/[a-z0-9-]+\.md$/.test(name)&&/^[A-Za-z_$][\w$]*$/.test(symbol));const source=this.readResource(name).toString('utf8'),blocks=[...source.matchAll(/```javascript\r?\n([\s\S]*?)```/g)].map(m=>m[1]);demand(blocks.length>0);const context=vm.createContext({structuredClone,TextEncoder,TextDecoder});const owner=new vm.Script(blocks.join('\n')+'\n;typeof '+symbol+' === "function" ? '+symbol+' : null',{filename:name}).runInContext(context,{timeout:1000});demand(typeof owner==='function');return owner;},
   capture(category,name){scope='selected-evidence';demand(Object.hasOwn(lists,category));const ref=read(evidence,name).ref;if(!lists[category].some(r=>r.path===ref.path))lists[category].push(ref);return ref;},
   adapters,
   transport:Object.freeze({
    async discover(){scope='transport-discovery';tools=null;identity=null;transport.status='not_assessed';transport.discovery=null;transport.identity=null;if(typeof services.transport?.discover!=='function')return {status:'not_assessed'};const observed=await invoke('discovery',null,()=>services.transport.discover());if(!observed||!Array.isArray(observed.response?.tools)||!observed.response.tools.every(t=>text(t.name)))return {status:'not_assessed'};tools=new Set(observed.response.tools.map(t=>t.name));transport.discovery=observed.ref;return {status:'observed',tools:[...tools]};},
    async identity(){scope='transport-identity';identity=null;transport.identity=null;transport.status='not_assessed';if(!tools||typeof services.transport?.identity!=='function')return {status:'not_assessed'};const observed=await invoke('identity',null,()=>services.transport.identity());if(!observed||!text(observed.response?.document_id))return {status:'not_assessed'};identity=observed.response.document_id;transport.identity=observed.ref;transport.status='observed';return {status:'observed',document_id:identity};},
    async call(tool,args){scope='transport-call';if(!tools?.has(tool)||!identity||typeof services.transport?.call!=='function')return {status:'not_assessed'};const observed=await invoke('call',{tool,args},()=>services.transport.call(tool,args));return observed?{status:'observed',response:observed.response,ref:observed.ref}:{status:'not_assessed'};}
   })
  });
  scope='host-session';await run(session);scope='installed-after';const after=inventory(installed);demand(same(before,after));
  const value={schema_version:'1.0',kind:'installed-observation',artifact,installed_root:installed,before,after,host,host_observation_class:'host_judgment',prerequisites,resource_reads:[...reads.values()],applicants,...lists,transport,adapters:adapters.declaration,workflow_status:'not_assessed',limits};
  scope='observation-schema';const checked=validateRecord(value);if(checked.status!=='passed')return checked;
  return {status:'passed',value:checked.value,checks:[{method:'installed-byte-and-transport-collection',observation_class:'actual',status:'passed',limits:'Collection only; installed workflow, permission, host guarantees and readiness remain not_assessed.'}]};
 }catch{return {status:'failed',issues:[{category:'evidence',scope,next_action:'Retain selected private files and observed uncertain operations; inspect the selection or missing capability and retry without replaying mutations.'}]};}
}
module.exports={observeInstalled,createHostAdapters};
