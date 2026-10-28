'use strict';
// Bounded acceptance experiment. Only the existing desktop MCP authors/inspects DOCX.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {McpClient,requireTool}=require('../wordcraft-document-session/foundation.cjs');
const {privateDestination,sha256}=require('../wordcraft-application-documents/foundation.cjs');
const {prepareAcceptance}=require('./revision-upstream.cjs');
const vm=require('node:vm'),sessionHost=vm.createContext({});
for(const block of fs.readFileSync(path.resolve(__dirname,'../../skills/targeted-cv/references/wordcraft-operations.md'),'utf8').matchAll(/```javascript\r?\n([\s\S]*?)```/g))vm.runInContext(block[1],sessionHost);
const {inspectDocumentOperation}=sessionHost;
const mm=n=>n*72/25.4;
async function run(cli,endpoint,destination,original){
 const output=privateDestination(destination),receipt=path.join(output,'receipt.json'),r=JSON.parse(fs.readFileSync(receipt));
 const f=JSON.parse(fs.readFileSync(path.join(output,'input.json'))),p=structuredClone(f.documents.find(d=>d.id==='cv-en').paragraphs);const scopeIndex=p.findIndex(x=>x.id==='scope-one'),overlapIndex=p.findIndex(x=>x.id==='achievement-two');p[scopeIndex].text=p[scopeIndex].text.replace('Works with','Works alongside');p[overlapIndex].text=r.overlap.current;
 f.profile=JSON.parse(fs.readFileSync(r.application.path));f.documents.find(d=>d.id==='cv-en').paragraphs[overlapIndex].text=f.profile.profile.at(-1).statement;
 const profileRun={f,prepareRevised:()=>prepareAcceptance(path.join(output,'revised'),f,r.application.path)};
 const previousManifest=JSON.parse(fs.readFileSync(r.upstream.manifest.path)),initial=r.stages[0],previousMember=previousManifest.documents.find(d=>d.id==='cv-en');
 previousMember.destination=path.join(output,'cv-en-final.docx');previousMember.session={document_id:initial.documentId,connection_id:r.connectionId,snapshot_id:'baseline',snapshot_sha256:initial.snapshotSha256,saved_path:previousMember.destination,saved_sha256:sha256(fs.readFileSync(previousMember.destination))};previousMember.state='authored';
 const persist=()=>fs.writeFileSync(receipt,JSON.stringify(r,null,2));
 const c=McpClient.connect(cli,endpoint);c.maxBytes=24*1024*1024;let tools,commands,binding,owns=false;
 async function call(name,args={}){requireTool(tools,name);const entry={name,args,at:new Date().toISOString(),outcome:'pending'};r.calls.push(entry);persist();const raw=await c.rpc('tools/call',{name,arguments:args});let value;try{value=JSON.parse(raw.content.find(b=>b.type==='text')?.text)}catch{value=null;}if(name==='ui_inspect')value=Object.fromEntries(['title','dirty','focused','pages'].map(k=>[k,value[k]]));entry.outcome=raw.isError?'uncertain':'returned';entry.observed=value;persist();assert.ok(!raw.isError,name+' uncertain; do not replay');return {raw,value};}
 const read=async(n,a)=>(await call(n,a)).value;
 const exec=async(command,params={})=>{assert.ok(commands.some(x=>x.id===command),'Missing command '+command);return read('execute',{command,params});};
 const snap=async()=>({text:await read('get_text'),structure:await read('inspect_document')});
 async function intent(label,action){const before=await snap(),ui=await read('ui_inspect');const guard=inspectDocumentOperation({binding,observation:{connectionId:r.connectionId,freshInspection:true,confirmedBindingReceipt:true,uninterrupted:true,stateContinuity:true},operation:'read'});assert.equal(guard.decision,'proceed');const i={label,binding:structuredClone(binding),before,ui,at:new Date().toISOString(),status:'pending'};r.intents.push(i);persist();await action();i.after=await snap();i.status='observed';persist();}
 async function range(i,text){await exec('select.range',{anchor:{story:'body',path:[i],off:0},focus:{story:'body',path:[i],off:Buffer.byteLength(text,'utf8')}});const selected=await read('inspect_document');assert.equal(selected.selection.text,text);assert.deepEqual(selected.selection.anchor.path,[i]);assert.equal(selected.selection.anchor.story,'body');}
 async function at(i,off=0){await exec('select.range',{anchor:{story:'body',path:[i],off},focus:{story:'body',path:[i],off}});}
 async function measure(i,off=0){await at(i,off);return (await exec('document.layout')).caret;}
 async function save(file){await intent('Save selected artifact',async()=>{const saved=await read('save_document',{path:file});assert.equal(saved.path,file);binding.path=file;});}
 async function reopen(file){assert.equal((await read('ui_inspect')).dirty,false);const opened=await read('open_document',{path:file});assert.equal(opened.path,file);binding.path=file;await snap();}
 async function cvFormat(p,start=0){
  await exec('select.range',{anchor:{story:'body',path:[start],off:0},focus:{story:'body',path:[p.length-1],off:Buffer.byteLength(p.at(-1).text,'utf8')}});
  for(const [cmd,params] of [['para.style',{style:'Normal'}],['format.font',{name:'Arial'}],['format.size',{size:11}],['format.color',{color:'202020'}],['format.bold',{value:false}],['format.italic',{value:false}],['para.spacing',{before:0,after:4}],['para.lineSpacing',{value:1.1}],['para.alignLeft',{}],['para.keepNext',{value:false}],['para.shading',{color:null}],['para.bullets',{off:true}],['para.keepLines',{value:true}]])await exec(cmd,params);
  for(let i=start;i<p.length;i++){const x=p[i];await range(i,x.text);
   if(x.kind==='name'){await exec('format.size',{size:22});await exec('format.color',{color:'1F4E79'});await exec('para.keepNext',{value:true});}
   if(x.kind==='headline'){await exec('format.size',{size:12});await exec('para.keepNext',{value:true});}
   if(x.kind==='heading'){await exec('para.style',{style:'Heading 2'});await exec('format.font',{name:'Arial'});await exec('format.size',{size:12});await exec('format.color',{color:'1F4E79'});await exec('format.bold',{value:true});await exec('para.spacing',{before:9,after:4});await exec('para.keepNext',{value:true});}
   if(['label','project'].includes(x.kind)){await exec('format.bold',{value:true});await exec('para.keepNext',{value:true});}
   if(x.kind==='date')await exec('para.keepNext',{value:true});if(x.kind==='summary')await exec('para.shading',{color:'EAF1F8'});if(x.kind==='bullet')await exec('para.bullets',{kind:'bullet'});
  }
 }
 async function stage(doc,name,p){
  const file=path.join(output,name+'.docx');assert.ok(!fs.existsSync(file)||file===binding.path,'Destination collision');
  await intent('Neutral document properties and refresh fields',async()=>{await exec('file.properties',{title:'',subject:'',author:'',keywords:'',comments:'',category:''});await exec('references.updateFields',{all:true});});
  await save(file);await reopen(file);
  const s={id:name,documentId:binding.id,kind:doc.kind,language:doc.language,artifact:file,expected:p.map(x=>x.text).join('\n'),reopened:true,visualReview:'not_assessed',semanticReview:'not_assessed',renders:[],paragraphs:[]};r.stages.push(s);
  if(doc.kind==='cv'){await intent('Inspect actual footer field objects',async()=>{await exec('insert.editFooter',{page:0});await exec('select.all');s.footerFields=await exec('fields.selected');s.footerSelection=await read('inspect_document');await exec('insert.closeHeader');});await save(file);await reopen(file);}
  // All final evidence below is read-only. Selection movement does not change saved document content.
  s.before=await snap();s.bytesBefore=sha256(fs.readFileSync(file));s.metadata=s.before.structure.properties;s.structure=s.before.structure;s.text=s.before.text;s.document=await exec('document.inspect',{text:true});s.layout=await exec('document.layout');
  for(let i=0;i<p.length;i++)s.paragraphs.push({kind:p[i].kind,text:p[i].text,start:await measure(i),end:await measure(i,Buffer.byteLength(p[i].text,'utf8')),observed:await exec('document.paragraph',{path:[i]})});
  s.lineHeight=doc.kind==='cover_letter'?s.paragraphs.find(x=>x.kind==='salutation').start.h:null;
  // Reset selection so before/after snapshots have matching selection as well as content/structure.
  await exec('select.range',{anchor:s.before.structure.selection.anchor,focus:s.before.structure.selection.focus});
  for(let page=1;page<=s.structure.pages;page++){const {raw}=await call('render_page',{page,scale:1.5});const img=raw.content.find(x=>x.type==='image');assert.ok(img);const renderPath=path.join(output,name+'-'+page+'.png');fs.writeFileSync(renderPath,Buffer.from(img.data,'base64'));s.renders.push({page,path:renderPath,sha256:sha256(fs.readFileSync(renderPath)),status:'not_assessed'});}
  s.after=await snap();s.finalUI=await read('ui_inspect');s.sha256=sha256(fs.readFileSync(file));s.snapshotSha256=sha256(JSON.stringify({text:s.text,structure:s.structure,paragraphs:s.paragraphs}));s.textExact=s.text.text===s.expected;s.artifactStable=s.bytesBefore===s.sha256;s.editable=s.structure.blocks.every(b=>b.type==='paragraph');
  assert.equal(s.textExact,true);assert.equal(s.artifactStable,true);assert.equal(s.finalUI.dirty,false);assert.deepEqual(s.before,s.after);s.observedAt=new Date().toISOString();persist();console.log(JSON.stringify({phase:'review-ready',id:name,pages:s.structure.pages,artifact:file,renders:s.renders.map(x=>x.path)}));return s;
 }
 try{
  const init=await c.rpc('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'m4-task52-reconcile',version:'1'}});assert.ok(init.instructions.includes('connected to the WordCraft app at '+endpoint));c.notify('notifications/initialized');tools=(await c.rpc('tools/list',{})).tools;commands=await read('list_commands');
  const reopenedState=await snap();let alreadyRevised=false;if(reopenedState.text.text!==p.map(x=>x.text).join('\n')){p[overlapIndex].text=f.profile.profile.at(-1).statement;assert.equal(reopenedState.text.text,p.map(x=>x.text).join('\n'));alreadyRevised=true;}binding={id:initial.documentId,connectionId:r.connectionId,path:previousMember.destination,nativeId:null};
  r.recovery={kind:'fresh read-only reinspection after known pre-dispatch proposal rejection',noRevisionDispatched:true,at:new Date().toISOString(),snapshot:reopenedState};persist();
  // Confirm exact pending manual work before saving/rebinding; no edit replay.
  await save(previousMember.destination);const current=await snap(),proposed=f.profile.profile.at(-1).statement,doc=f.documents.find(d=>d.id==='cv-en');  profileRun.f.documents.find(d=>d.id==='cv-en').paragraphs[scopeIndex].text=p[scopeIndex].text;const revised=await profileRun.prepareRevised();r.binding=revised.strategy.binding;for(const nextMember of revised.manifest.documents)nextMember.destination=previousManifest.documents.find(d=>d.id===nextMember.id).destination;const currentSnapshot={id:'current-manual',documentId:binding.id,connectionId:r.connectionId,fingerprint:sha256(JSON.stringify(current)),text:current.text.text,structure:current.structure};const trusted={...revised.trusted,privateDestinations:[...revised.trusted.privateDestinations,...previousManifest.documents.map(d=>d.destination)],previousManifest,previous_manifest_sha256:revised.trusted.fingerprint(previousManifest,sha256),session:{sessionId:r.connectionId,connection:{id:r.connectionId},bindings:[{id:binding.id,kind:'cv',language:'en',path:binding.path,connectionId:r.connectionId,currentSnapshotId:currentSnapshot.id}],snapshots:[currentSnapshot]}};const proposal=await require('../wordcraft-application-documents/manifest-fixture.cjs').load('application-documents.md',['proposeDocumentRevision']).proposeDocumentRevision(previousManifest,revised.manifest,trusted);assert.equal(proposal.decision,'revise',JSON.stringify(proposal));revised.manifest=proposal.proposal;r.manifestRevision={decision:proposal.decision,predecessor_sha256:trusted.previous_manifest_sha256};const prevFile=path.join(output,'predecessor-manifest.json');fs.writeFileSync(prevFile,JSON.stringify(previousManifest,null,2));r.upstream.predecessor_manifest={path:prevFile,sha256:sha256(fs.readFileSync(prevFile))};for(const [name,value]of Object.entries({strategy:revised.strategy,manifest:revised.manifest})){const file=path.join(output,'revised-'+name+'.json');fs.writeFileSync(file,JSON.stringify(value,null,2));r.upstream['revised_'+name]={path:file,sha256:sha256(fs.readFileSync(file))};}
  if(!alreadyRevised)await intent('Resolved targeted revision on the same selected CV',async()=>{const inspected=await snap();assert.equal(inspected.text.text,p.map(x=>x.text).join('\n'));await range(overlapIndex,p[overlapIndex].text);await read('type_text',{text:proposed});p[overlapIndex].text=proposed;});
  r.manual.after=await exec('document.paragraph',{path:[scopeIndex]});assert.deepEqual(r.manual.after,r.manual.before);await stage(doc,'cv-en-final',p);r.finishedAt=new Date().toISOString();persist();console.log(JSON.stringify({phase:'actual-review-ready',receipt,stages:r.stages.map(s=>({artifact:s.artifact,renders:s.renders}))}));
 }catch(e){r.recoveryError=e.stack;persist();throw e;}finally{c.close();}
 return r;
}
module.exports={run};
if(require.main===module)run(...process.argv.slice(2)).catch(e=>{console.error(e.stack);process.exitCode=1;});
