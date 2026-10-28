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
async function run(cli,endpoint,destination,original,host={}){
 const output=privateDestination(destination);fs.mkdirSync(output);fs.mkdirSync(path.join(output,'baseline'));fs.mkdirSync(path.join(output,'revised'));
 const profileRun=await require('./revision-profile.cjs').prepare(output,host),upstream=profileRun.baseline,f=upstream.fixture,receipt=path.join(output,'receipt.json');
 if(host.afterProfile)await host.afterProfile(profileRun);
 fs.writeFileSync(path.join(output,'input.json'),JSON.stringify(f,null,2));
 const r={kind:'actual-application-only-revision',startedAt:new Date().toISOString(),connectionId:randomUUID(),calls:[],intents:[],stages:[],runtimeHashes:{},original:null,units:{geometry:'points',pointsPerMm:72/25.4,renderPixelsPerPoint:1.5},review:'not_assessed'};
 r.profileWrite=profileRun.profileWrite;r.reusable={path:profileRun.source,sha256:sha256(profileRun.before)};r.application={path:profileRun.dest,sha256:sha256(fs.readFileSync(profileRun.dest))};r.upstream={};
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
  const init=await c.rpc('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'m4-task52-revision',version:'1'}});assert.ok(init.instructions.includes('connected to the WordCraft app at '+endpoint));r.server=init.serverInfo;c.notify('notifications/initialized');tools=(await c.rpc('tools/list',{})).tools;r.tools=tools;commands=await read('list_commands');
  r.foregroundGate={parentObserved:'User confirmed dedicated desktop is visible; user explicitly prohibits computer use; author through official MCP only',current:await read('ui_inspect')};assert.equal(r.foregroundGate.current.dirty,false);r.foregroundGate.focusPolicy='User visible-desktop confirmation accepted; subsequent focus changes respected.';
  await snap();r.creation=await read('new_document',{template:'blank'});await snap();binding={id:randomUUID(),connectionId:r.connectionId,path:null,nativeId:null};r.selectedDocument={logicalId:binding.id,title:r.foregroundGate.current.title};
  const doc=f.documents.find(d=>d.id==='cv-en'),p=structuredClone(doc.paragraphs),baseline=structuredClone(p);
  await intent('Author fictional baseline in dedicated selected desktop',async()=>{await read('type_text',{text:p.map(x=>x.text).join('\n'),paragraphs:true});await exec('select.all');await exec('layout.size',{name:'A4'});await exec('layout.margins',{top:mm(18),bottom:mm(18),left:mm(18),right:mm(18)});await cvFormat(p);const pi=p.findIndex(x=>x.id==='projects-heading');await range(pi,p[pi].text);await exec('para.pageBreakBefore',{value:true});await exec('insert.createFooter',{page:0});await read('type_text',{text:'Page '});await exec('insert.field',{instr:'PAGE'});await read('type_text',{text:' / '});await exec('insert.field',{instr:'NUMPAGES'});await exec('insert.closeHeader');});
  console.log(JSON.stringify({phase:'visible-baseline-authored',documentId:binding.id}));
  const initial=await stage(doc,'cv-en-baseline',p);await save(path.join(output,'cv-en-final.docx'));const previousManifest=structuredClone(upstream.manifest);const previousMember=previousManifest.documents.find(d=>d.id==='cv-en');previousMember.destination=binding.path;previousMember.session={document_id:binding.id,connection_id:r.connectionId,snapshot_id:'baseline',snapshot_sha256:initial.snapshotSha256,saved_path:binding.path,saved_sha256:sha256(fs.readFileSync(binding.path))};previousMember.state='authored';
  const scopeIndex=p.findIndex(x=>x.id==='scope-one'),overlapIndex=p.findIndex(x=>x.id==='achievement-two');
  await intent('Test actor manual prose and formatting edits',async()=>{await range(scopeIndex,p[scopeIndex].text);p[scopeIndex].text=p[scopeIndex].text.replace('Works with','Works alongside');await read('type_text',{text:p[scopeIndex].text});await range(scopeIndex,p[scopeIndex].text);await exec('format.italic',{value:true});await range(overlapIndex,p[overlapIndex].text);p[overlapIndex].text=p[overlapIndex].text.replace('a handover checklist','a practical handover checklist');await read('type_text',{text:p[overlapIndex].text});});
  r.manual={actor:'Explicit fictional test actor through actual MCP; not a real applicant interaction',before:await exec('document.paragraph',{path:[scopeIndex]})};
  const current=await snap(),proposed=profileRun.f.documents.find(d=>d.id==='cv-en').paragraphs.find(x=>x.id==='achievement-two').text;
  const count=r.calls.length;r.overlap={before:baseline[overlapIndex].text,current:p[overlapIndex].text,proposed,withheld:true,reason:'Target overlaps intervening manual checklist wording; no mutation dispatched until test actor resolves exact conflict.',snapshot:current,mutationsWhileWithheld:0};persist();assert.equal(r.calls.length,count);
  r.overlap.resolution={actor:'Fictional scenario actor',decision:'Replace this checklist bullet with the application-only monthly review fact; retain the separate manual scope prose and italic formatting.',at:new Date().toISOString()};persist();
  profileRun.f.documents.find(d=>d.id==='cv-en').paragraphs[scopeIndex].text=p[scopeIndex].text;const revised=await profileRun.prepareRevised();r.binding=revised.strategy.binding;for(const nextMember of revised.manifest.documents)nextMember.destination=previousManifest.documents.find(d=>d.id===nextMember.id).destination;const currentSnapshot={id:'current-manual',documentId:binding.id,connectionId:r.connectionId,fingerprint:sha256(JSON.stringify(current)),text:current.text.text,structure:current.structure};const trusted={...revised.trusted,privateDestinations:[...revised.trusted.privateDestinations,...previousManifest.documents.map(d=>d.destination)],previousManifest,previous_manifest_sha256:revised.trusted.fingerprint(previousManifest,sha256),session:{sessionId:r.connectionId,connection:{id:r.connectionId},bindings:[{id:binding.id,kind:'cv',language:'en',path:binding.path,connectionId:r.connectionId,currentSnapshotId:currentSnapshot.id}],snapshots:[currentSnapshot]}};const proposal=await require('../wordcraft-application-documents/manifest-fixture.cjs').load('application-documents.md',['proposeDocumentRevision']).proposeDocumentRevision(previousManifest,revised.manifest,trusted);assert.equal(proposal.decision,'revise',JSON.stringify(proposal));revised.manifest=proposal.proposal;r.manifestRevision={decision:proposal.decision,predecessor_sha256:trusted.previous_manifest_sha256};const prevFile=path.join(output,'predecessor-manifest.json');fs.writeFileSync(prevFile,JSON.stringify(previousManifest,null,2));r.upstream.predecessor_manifest={path:prevFile,sha256:sha256(fs.readFileSync(prevFile))};for(const [name,value]of Object.entries({strategy:revised.strategy,manifest:revised.manifest})){const file=path.join(output,'revised-'+name+'.json');fs.writeFileSync(file,JSON.stringify(value,null,2));r.upstream['revised_'+name]={path:file,sha256:sha256(fs.readFileSync(file))};}
  await intent('Resolved targeted revision on the same selected CV',async()=>{const inspected=await snap();assert.equal(inspected.text.text,p.map(x=>x.text).join('\n'));await range(overlapIndex,p[overlapIndex].text);await read('type_text',{text:proposed});p[overlapIndex].text=proposed;});
  r.manual.after=await exec('document.paragraph',{path:[scopeIndex]});assert.deepEqual(r.manual.after,r.manual.before);await stage(doc,'cv-en-final',p);r.finishedAt=new Date().toISOString();persist();console.log(JSON.stringify({phase:'actual-review-ready',receipt,stages:r.stages.map(s=>({artifact:s.artifact,renders:s.renders}))}));
 }catch(e){r.error=e.stack;persist();throw e;}finally{c.close();}
 return r;
}
module.exports={run};
if(require.main===module)run(...process.argv.slice(2)).catch(e=>{console.error(e.stack);process.exitCode=1;});
