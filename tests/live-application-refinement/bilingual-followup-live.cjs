'use strict';
// Bounded acceptance experiment. Only the existing desktop MCP authors/inspects DOCX.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {McpClient,requireTool}=require('../wordcraft-document-session/foundation.cjs');
const {privateDestination,sha256}=require('../wordcraft-application-documents/foundation.cjs');
const {prepare}=require('./bilingual-followup-profile.cjs');
const vm=require('node:vm'),sessionHost=vm.createContext({});
for(const block of fs.readFileSync(path.resolve(__dirname,'../../skills/targeted-cv/references/wordcraft-operations.md'),'utf8').matchAll(/```javascript\r?\n([\s\S]*?)```/g))vm.runInContext(block[1],sessionHost);
const {inspectDocumentOperation}=sessionHost;
const mm=n=>n*72/25.4;
async function run(cli,endpoint,destination,source){
 const output=privateDestination(destination);fs.mkdirSync(output);
 const profileRun=await prepare(output,path.resolve(source)),upstream=profileRun.baseline,f=profileRun.f,receipt=path.join(output,'receipt.json');const revised=profileRun.current;
 fs.writeFileSync(path.join(output,'input.json'),JSON.stringify(f,null,2));
 const r={kind:'actual-checkpointed-bilingual-refinement',startedAt:new Date().toISOString(),connectionId:randomUUID(),calls:[],intents:[],stages:[],runtimeHashes:{},profile:profileRun.profile,question:profileRun.question,original:{},units:{geometry:'points',pointsPerMm:72/25.4,renderPixelsPerPoint:1.5},review:'not_assessed'};
 r.upstream={};
 for(const [name,value]of Object.entries({strategy:upstream.strategy,manifest:upstream.manifest,sources:upstream.sources,profile:f.profile})){
  const file=path.join(output,'upstream-'+name+'.json');fs.writeFileSync(file,name==='profile'?JSON.stringify(value):JSON.stringify(value,null,2));r.upstream[name]={path:file,sha256:sha256(fs.readFileSync(file))};
 }
 r.upstream.strategy_snapshot_sha256=upstream.manifest.strategy_sha256;
 r.upstream.fixture_adapter_sha256=sha256(fs.readFileSync(path.join(__dirname,'revision-upstream.cjs')));
 const skill=path.resolve(__dirname,'../../skills/targeted-cv');
 for(const file of ['SKILL.md',...fs.readdirSync(path.join(skill,'references')).map(n=>'references/'+n),...fs.readdirSync(path.join(skill,'schemas')).map(n=>'schemas/'+n)])r.runtimeHashes[file]=sha256(fs.readFileSync(path.join(skill,file)));
 r.fixtureSha256=sha256(fs.readFileSync(path.join(__dirname,'../wordcraft-application-documents/acceptance-fixture.cjs')));
 const persist=()=>fs.writeFileSync(receipt,JSON.stringify(r,null,2));
 const c=McpClient.connect(cli,endpoint);c.maxBytes=24*1024*1024;let tools,commands,binding,owns=false;
 async function call(name,args={}){requireTool(tools,name);const entry={name,args,at:new Date().toISOString(),outcome:'pending'};r.calls.push(entry);persist();const raw=await c.rpc('tools/call',{name,arguments:args});let value;try{value=JSON.parse(raw.content.find(b=>b.type==='text')?.text)}catch{value=null;}if(name==='ui_inspect')value=Object.fromEntries(['title','dirty','focused','pages'].map(k=>[k,value[k]]));entry.outcome=raw.isError?'uncertain':'returned';entry.observed=value;persist();assert.ok(!raw.isError,name+' uncertain; do not replay');return {raw,value};}
 const read=async(n,a)=>(await call(n,a)).value;
 const exec=async(command,params={})=>{assert.ok(commands.some(x=>x.id===command),'Missing command '+command);return read('execute',{command,params});};
 const snap=async()=>({text:await read('get_text'),structure:await read('inspect_document')});
 async function intent(label,action){const before=await snap(),ui=await read('ui_inspect');const guard=inspectDocumentOperation({binding,observation:{connectionId:r.connectionId,freshInspection:true,confirmedBindingReceipt:true,uninterrupted:true,stateContinuity:true},operation:'read'});assert.equal(guard.decision,'proceed');const i={label,binding:structuredClone(binding),before,ui,at:new Date().toISOString(),status:'pending'};r.intents.push(i);persist();await profileRun.beforeMutation(binding,i,r.intents.indexOf(i));await action();i.after=await snap();i.status='observed';persist();await profileRun.afterMutation(binding,r.intents.indexOf(i));}
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
  const file=path.join(output,name+'.docx');assert.ok(!fs.existsSync(file)||binding.path===file,'Destination collision');
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
  const init=await c.rpc('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'application-acceptance',version:'1'}});assert.ok(init.instructions.includes('connected to the WordCraft app at '+endpoint));r.server=init.serverInfo;c.notify('notifications/initialized');tools=(await c.rpc('tools/list',{})).tools;r.tools=tools;commands=await read('list_commands');r.commands=commands;
  r.foregroundGate={parentObserved:'User confirmed dedicated desktop visible; WordCraft MCP only; later focus changes respected',current:await read('ui_inspect')};assert.equal(r.foregroundGate.current.dirty,false);await snap();
  r.revisedUpstream={};for(const [name,value]of Object.entries({strategy:revised.strategy,manifest:revised.manifest,sources:revised.sources})){const file=path.join(output,'revised-'+name+'.json');fs.writeFileSync(file,JSON.stringify(value,null,2));r.revisedUpstream[name]={path:file,sha256:sha256(fs.readFileSync(file))};}
  for(const doc of f.documents){
   const ui=await read('ui_inspect');assert.equal(ui.dirty,false);const old=profileRun.old.stages.find(s=>s.id===doc.id);assert.equal(sha256(fs.readFileSync(old.artifact)),old.sha256);await read('open_document',{path:old.artifact});binding={id:old.documentId,connectionId:r.connectionId,path:old.artifact,nativeId:null};const opened=await snap();assert.equal(opened.text.text,old.expected);const p=structuredClone(doc.paragraphs);await stage(doc,doc.id+'-baseline',p);await save(path.join(output,doc.id+'.docx'));
   const next=revised.fixture.documents.find(d=>d.id===doc.id),final=structuredClone(next.paragraphs);let manualBefore=null;
   // A deliberately pending German letter remains at its saved baseline while the other three progress.
   if(doc.id==='letter-de'){r.pendingReport=makeReport(r,revised,output,false);fs.writeFileSync(path.join(output,'pending-report.json'),JSON.stringify(r.pendingReport,null,2));assert.equal(r.pendingReport.application_complete,false);assert.equal(r.pendingReport.members.find(m=>m.member_id==='letter-de').status,'needs_revision');persist();}
   const previousManifest=structuredClone(upstream.manifest);for(const d of previousManifest.documents)d.destination=path.join(output,d.id+'.docx');const beforeMember=previousManifest.documents.find(d=>d.id===doc.id),beforeStage=r.stages.find(s=>s.id===doc.id+'-baseline'),snapshot=await snap();beforeMember.session={document_id:binding.id,connection_id:r.connectionId,snapshot_id:'baseline-'+doc.id,snapshot_sha256:beforeStage.snapshotSha256,saved_path:binding.path,saved_sha256:sha256(fs.readFileSync(binding.path))};beforeMember.state='authored';const nextManifest=structuredClone(revised.manifest);for(const d of nextManifest.documents)d.destination=path.join(output,d.id+'.docx');const currentSnapshot={id:'current-'+doc.id,documentId:binding.id,connectionId:r.connectionId,fingerprint:sha256(JSON.stringify(snapshot)),text:snapshot.text.text,structure:snapshot.structure};const trusted={...revised.trusted,privateDestinations:previousManifest.documents.map(d=>d.destination),previousManifest,previous_manifest_sha256:revised.trusted.fingerprint(previousManifest,sha256),session:{sessionId:r.connectionId,connection:{id:r.connectionId},bindings:[{id:binding.id,kind:doc.kind,language:doc.language,path:binding.path,connectionId:r.connectionId,currentSnapshotId:currentSnapshot.id}],snapshots:[currentSnapshot]}};
   const proposal=await require('../wordcraft-application-documents/manifest-fixture.cjs').load('application-documents.md',['proposeDocumentRevision']).proposeDocumentRevision(previousManifest,nextManifest,trusted);assert.equal(proposal.decision,'revise',JSON.stringify(proposal));r.manifestRevisions??=[];const previousFile=path.join(output,doc.id+'-predecessor-manifest.json'),proposalFile=path.join(output,doc.id+'-revision-proposal.json');fs.writeFileSync(previousFile,JSON.stringify(previousManifest,null,2));fs.writeFileSync(proposalFile,JSON.stringify(proposal,null,2));r.manifestRevisions.push({document:doc.id,decision:proposal.decision,previous:{path:previousFile,sha256:sha256(fs.readFileSync(previousFile))},proposal:{path:proposalFile,sha256:sha256(fs.readFileSync(proposalFile))}});persist();
   await intent('Apply current supported targeted revision '+doc.id,async()=>{
    if(doc.kind==='cv'){
     const newRow=final.find(x=>x.id===profileRun.profile.local_id),previous=p.findIndex(x=>x.id===profileRun.old.profile.local_id);await at(previous,Buffer.byteLength(p[previous].text,'utf8'));await read('type_text',{text:'\n'+newRow.text,paragraphs:true});await range(previous+1,newRow.text);await exec('format.italic',{value:false});await exec('para.bullets',{off:true});p.splice(previous+1,0,newRow);
    }else {const i=p.findIndex(x=>x.kind==='body'&&x.text===doc.letter.body[1]);await range(i,p[i].text);await read('type_text',{text:final[i].text});p[i].text=final[i].text;}
    assert.deepEqual(p.map(x=>x.text),final.map(x=>x.text));
   });
   if(doc.kind==='cv'){const scope=p.findIndex(x=>x.id==='scope-one'),after=await exec('document.paragraph',{path:[scope]}),before=old.paragraphs.find(x=>x.kind==='scope').observed;assert.deepEqual(after,before);r.manualPreservation??=[];r.manualPreservation.push({document:doc.id,before,after,preserved:true});}
   await stage(doc,doc.id,p);persist();
  }
 }catch(e){r.error=e.stack;persist();throw e;}finally{
  r.finishedAt=new Date().toISOString();persist();profileRun.trace.receipt={path:receipt,sha256:sha256(fs.readFileSync(receipt))};profileRun.trace.currentCheckpoint=profileRun.writer.ref(path.join(output,'refinement-checkpoint.json'));fs.writeFileSync(path.join(output,'flow-trace.json'),JSON.stringify(profileRun.trace,null,2));c.close();
 }
 return r;
}
function makeReport(r,revised,output,final){
 const strategy=revised.strategy,selection={profile:{resolved_path:r.profile.application.path,sha256:r.profile.application.sha256},target_sha256:strategy.binding.target_sha256,settings_sha256:strategy.binding.settings_sha256};
 const members=revised.manifest.documents.map(d=>{const s=r.stages.find(s=>s.id===d.id);return {kind:d.kind,language:d.language,manifest_document_id:d.id,logical_document_id:s?.documentId||r.stages.find(s=>s.id===d.id+'-baseline')?.documentId,status:'needs_revision',intent_ids:[],receipt_refs:[],next_action:s?'Content saved; competent semantic/all-page review pending.':'Apply the supported July/September contributions and exception-log correction to the German letter; other members progressed.'};});
 const record={application_id:strategy.binding.application_id,selection,revisions:[{id:'task71',source_baselines:selection,members}],profile_operations:[],stop_state:{state:'active',pending_operation_refs:[]}};
 const report=require('../wordcraft-application-documents/manifest-fixture.cjs').load('application-refinement.md',['reportRefinement']).reportRefinement(record,{record,revision_id:'task71',integrity:{state:'passed'},strategy,member_results:members.map(m=>({member_id:m.manifest_document_id,status:m.status,artifact:m.status==='verified'?{resolved_path:r.stages.find(s=>s.id===m.manifest_document_id).artifact,sha256:r.stages.find(s=>s.id===m.manifest_document_id).sha256}:null,checks:[{check:'Actual MCP targeted edit/readback/save/reopen/all-page rendering',result:'not_assessed',method:'Actual receipt available; competent semantic/all-page visual review remains pending.'}],next_action:m.next_action})),profile_results:[{destination_role:'application',status:'confirmed',reason:'Actual exclusive fork and readback.'},{destination_role:'reusable',status:'confirmed',reason:'Only the selected July returns contribution persisted through actual filesystem profile owner.'}],changes:[{kind:'new_evidence',references:[r.profile.local_id,...r.profile.promoted_ids],reason:'Distinct later July/September contributions, no invented measurement or earlier attribution.'},{kind:'editorial',references:['fact-achievement-one'],reason:'Application-only correction preserves route approval limit; unrelated manual prose/italics preserved.'}],issues:['Competent semantic/all-page visual review is pending.'],checkpoint_status:'unconfirmed'});return report;
}
module.exports={run,makeReport};
if(require.main===module)run(...process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
