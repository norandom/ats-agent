'use strict';
// Read-only release maintenance. No application owner imports or workflow execution.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{isDeepStrictEqual:same}=require('node:util');
const {validateRecord}=require('./candidate-definition.cjs');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function demand(ok){if(!ok)throw Error('Installed evidence precondition failed');}
function keys(v,names){demand(v&&typeof v==='object'&&!Array.isArray(v)&&same(Object.keys(v).sort(),names.slice().sort()));}
function safe(file){demand(typeof file==='string'&&path.isAbsolute(file));const full=path.resolve(file);let cursor=path.parse(full).root;for(const part of full.slice(cursor.length).split(path.sep).filter(Boolean)){cursor=path.join(cursor,part);demand(!fs.lstatSync(cursor).isSymbolicLink());}return full;}
function inside(a,b){const rel=path.relative(a,b);return rel===''||(!path.isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('..'+path.sep));}
function relative(name){demand(typeof name==='string'&&/^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*$/.test(name)&&!name.split('/').some(x=>x==='.'||x==='..'));return name;}
function read(root,name){const file=safe(path.join(root,relative(name)));demand(inside(root,file));const fd=fs.openSync(file,fs.constants.O_RDONLY|(fs.constants.O_NOFOLLOW||0));try{const before=fs.fstatSync(fd);demand(before.isFile()&&before.nlink===1);const bytes=fs.readFileSync(fd),after=fs.fstatSync(fd),current=fs.statSync(safe(file));demand(before.dev===after.dev&&before.ino===after.ino&&before.size===after.size&&before.mtimeMs===after.mtimeMs&&current.ino===after.ino&&current.dev===after.dev);return {bytes,ref:{path:name,size:bytes.length,sha256:hash(bytes)}};}finally{fs.closeSync(fd);}}
function inventory(root){const result=[],dirs=new Set();function walk(dir=''){for(const entry of fs.readdirSync(safe(path.join(root,dir)),{withFileTypes:true})){const name=dir?dir+'/'+entry.name:entry.name;if(fs.lstatSync(safe(path.join(root,name))).isDirectory()){dirs.add(name);walk(name);}else result.push(read(root,name).ref);}}walk();const needed=new Set();for(const f of result){const parts=f.path.split('/');while(parts.length>1){parts.pop();needed.add(parts.join('/'));}}demand(same([...dirs].sort(),[...needed].sort()));return result.sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);}
function sorted(files){demand(new Set(files.map(f=>f.path)).size===files.length);return [...files].sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);}
/** Operator-selected archive/prepared source and evidence/review expected digests are trusted inputs,
 * selected outside the index. JSON and this helper cannot authenticate the observer or reviewer.
 * @returns {object} Mechanical CheckResult only; no workflow or release readiness grant. */
function verifyInstalledEvidence(artifact,install,evidence,review){
 let scope='selection';try{
  keys(artifact,['archive','expected']);keys(artifact.expected,['artifact','prepared']);keys(install,['installed_root']);keys(evidence,['root','index','expected_sha256']);keys(review,['path','expected_sha256']);
  const installed=safe(install.installed_root),root=safe(evidence.root),checkout=path.resolve(__dirname,'..');
  demand(!inside(checkout,installed)&&!inside(path.resolve(checkout,'../Skills'),installed)&&!inside(installed,root)&&!inside(root,installed));
  scope='evidence-index-digest';const selected=read(root,evidence.index);demand(selected.ref.sha256===evidence.expected_sha256);const index=JSON.parse(selected.bytes);
  scope='evidence-index-contract';const validation=validateRecord(index);if(validation.status!=='passed')return validation;demand(['installed-evidence','installed-observation'].includes(index.kind));
  scope='archive';const verifier=safe(path.join(safe(artifact.expected.prepared.root),'release/verify.cjs'));
  // Use independently selected trusted maintenance code, including for older archives.
  const checked=require(verifier).verifyArtifact(safe(artifact.archive),artifact.expected);if(checked.status!=='passed')return checked;
  demand(path.resolve(artifact.archive)===path.join(root,relative(index.artifact.path)));demand(same(read(root,index.artifact.path).ref,index.artifact));demand(index.artifact.sha256===checked.value.artifact.sha256&&index.artifact.size===checked.value.artifact.size);
  scope='installed-inventory';demand(index.installed_root===installed);
  const prefix=checked.value.artifact.format==='plugin-zip'?'skills/targeted-cv/':'targeted-cv/';
  const expected=sorted(checked.value.inventory.filter(f=>f.path.startsWith(prefix)).map(f=>({...f,path:f.path.slice(prefix.length)})));demand(expected.length>0&&same(sorted(index.before),expected)&&same(sorted(index.after),expected)&&same(inventory(installed),expected));
  scope='installed-read-trace';demand(index.resource_reads.length>0&&index.resource_reads.some(r=>r.path==='SKILL.md'));for(const ref of index.resource_reads)demand(expected.some(f=>same(f,ref)));
  scope='mandatory-owner-mcp-review-evidence';demand(index.host&&['prerequisites','owner_receipts','operations','saved_outputs','renders','reviews'].every(k=>Array.isArray(index[k])&&index[k].length>0));demand(index.kind==='installed-evidence');
  const inputs=index.applicants.flatMap(a=>[a.facts,a.settings,a.state]);demand(new Set(index.applicants.map(a=>a.id)).size===index.applicants.length&&new Set(inputs.map(r=>r.path)).size===inputs.length);
  const refs=[index.artifact,...inputs,...['prerequisites','owner_receipts','operations','saved_outputs','renders','reviews'].flatMap(k=>index[k])],selectedFiles=new Map();
  scope='referenced-files';for(let i=0;i<refs.length;i++){const ref=refs[i],found=read(root,ref.path);demand(same(found.ref,ref));const prior=selectedFiles.get(ref.path);demand(!prior||same(prior,ref));if(prior)continue;selectedFiles.set(ref.path,ref);
   // Only the known closed maintenance event grants nested reference meaning; arbitrary
   // MCP response payloads remain inert. Resolve their bytes, never execute them.
   let event;try{event=JSON.parse(found.bytes);}catch{/* Binary outputs remain opaque. */}
   if(event?.kind==='installed-transport-event'){const valid=validateRecord(event);if(valid.status!=='passed')return valid;demand(event.phase==='intent'?event.intent===null&&event.response===null:event.intent!==null);for(const child of [event.intent,event.request,event.response].filter(Boolean)){const prior=selectedFiles.get(child.path);demand(!prior||same(prior,child));if(!prior)refs.push(child);}}
  }
  scope='actual-mcp-intent-result-links';for(const operation of ['discovery','identity','call']){let observed=false;for(const ref of index.operations){let event;try{event=JSON.parse(read(root,ref.path).bytes);}catch{continue;}if(event.kind!=='installed-transport-event'||event.operation!==operation||event.phase!=='result'||event.status!=='recorded')continue;demand(event.intent&&event.response);const intent=JSON.parse(read(root,event.intent.path).bytes);demand(intent.kind==='installed-transport-event'&&intent.phase==='intent'&&intent.operation===operation&&same(intent.request,event.request));observed=true;}demand(observed);}
  scope='independent-review-digest';demand(review.path!==evidence.index&&!selectedFiles.has(review.path));const chosenReview=read(root,review.path);demand(chosenReview.ref.sha256===review.expected_sha256);const assessment=JSON.parse(chosenReview.bytes);
  scope='competent-review-contract';const reviewed=validateRecord(assessment);if(reviewed.status!=='passed')return reviewed;
  demand(assessment.kind==='installed-evidence-review'&&assessment.index_sha256===selected.ref.sha256&&assessment.artifact_sha256===index.artifact.sha256&&assessment.installed_root===installed&&same(sorted(assessment.inventory),expected));
  const covered=sorted([...selectedFiles.values()].filter(r=>r.path!==index.artifact.path));demand(same(sorted(assessment.reviewed_files),covered));for(const ref of assessment.reviewed_files)demand(same(read(root,ref.path).ref,ref));
  const capabilities=['desktop-connection','tool-discovery','live-authoring','readback','render','save-reopen'];demand(same([...assessment.capabilities].sort(),capabilities.sort()));
  demand(same(assessment.optional_skills.map(s=>s.skill).sort(),['cobesy','humanizer']));for(const skill of assessment.optional_skills){demand(['use-existing','embedded-fallback','authorized-install'].includes(skill.choice)&&skill.references.length>0);for(const ref of skill.references)demand(same(selectedFiles.get(ref.path),ref));}
  const findings=new Map();for(const finding of assessment.findings){demand(!findings.has(finding.scope)&&finding.outcome==='passed'&&finding.references.length>0);for(const ref of finding.references)demand(same(selectedFiles.get(ref.path),ref));findings.set(finding.scope,finding);}
  function finding(name,cls,required){const value=findings.get(name);demand(value&&value.observation_class===cls&&required.every(r=>value.references.some(f=>same(f,r))));return value;}
  scope='standalone-and-prerequisite-review';finding('standalone','host_judgment',inputs);finding('prerequisites','actual',index.prerequisites);for(const skill of assessment.optional_skills)finding(skill.skill,'actual',skill.references);
  scope='current-installed-owner-review';const ownerResources={profile:'references/profile-contract.md',strategy:'references/application-strategy.md','document-session':'references/document-session.md',documents:'references/application-documents.md',refinement:'references/refinement-session.md'};
  for(const [owner,resource]of Object.entries(ownerResources)){const value=finding('owner:'+owner,'actual',inputs);demand(index.resource_reads.some(r=>r.path===resource)&&value.references.some(r=>index.owner_receipts.some(f=>same(f,r)))&&value.references.some(r=>index.operations.some(f=>same(f,r))));}
  scope='meaning-and-all-page-visual-review';for(const output of index.saved_outputs){finding('meaning:'+output.path,'host_judgment',[output,...index.applicants.map(a=>a.facts)]);finding('visual:'+output.path,'host_judgment',[output,...index.renders]);}
  scope='final-read-only-integrity';demand(same(read(root,evidence.index).ref,selected.ref)&&same(read(root,review.path).ref,chosenReview.ref)&&same(inventory(installed),expected));for(const ref of refs)demand(same(read(root,ref.path).ref,ref));
  return {status:'passed',value:{artifact:checked.value.artifact,index:selected.ref,review:chosenReview.ref,installed_root:installed,workflow_status:'not_assessed',release_ready:false},checks:[{method:'independently-selected-installed-evidence-mechanical-verification',observation_class:'actual',status:'passed',limits:'Hashes and closed review associations only. Trusted operator must authenticate observers and competent current meaning/all-page review; no full workflow or release GO. Not an OS sandbox.'}]};
 }catch{return {status:'failed',issues:[{category:'evidence',scope,next_action:'Retain private evidence; select current exact archive, installation, complete owner/MCP receipts and independently authenticated competent review with separately selected expected digests.'}]};}
}
module.exports={verifyInstalledEvidence};
