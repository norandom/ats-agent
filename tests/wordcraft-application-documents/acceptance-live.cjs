'use strict';
// Bounded acceptance experiment. Only the existing desktop MCP authors/inspects DOCX.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {McpClient,requireTool}=require('../wordcraft-document-session/foundation.cjs');
const {privateDestination,sha256}=require('./foundation.cjs');
const {prepareAcceptance}=require('./acceptance-upstream.cjs');
const vm=require('node:vm'),sessionHost=vm.createContext({});
for(const block of fs.readFileSync(path.resolve(__dirname,'../../skills/targeted-cv/references/wordcraft-operations.md'),'utf8').matchAll(/```javascript\r?\n([\s\S]*?)```/g))vm.runInContext(block[1],sessionHost);
const {inspectDocumentOperation}=sessionHost;
const mm=n=>n*72/25.4;
async function run(cli,endpoint,destination,original){
 const output=privateDestination(destination);fs.mkdirSync(output);
 const upstream=await prepareAcceptance(output),f=upstream.fixture,receipt=path.join(output,'receipt.json');
 fs.writeFileSync(path.join(output,'input.json'),JSON.stringify(f,null,2));
 const r={kind:'actual-bilingual-document-acceptance',startedAt:new Date().toISOString(),connectionId:randomUUID(),calls:[],intents:[],stages:[],runtimeHashes:{},original:{path:path.resolve(original)},units:{geometry:'points',pointsPerMm:72/25.4,renderPixelsPerPoint:1.5},review:'not_assessed'};
 r.upstream={};
 for(const [name,value]of Object.entries({strategy:upstream.strategy,manifest:upstream.manifest,sources:upstream.sources,profile:f.profile})){
  const file=path.join(output,'upstream-'+name+'.json');fs.writeFileSync(file,name==='profile'?JSON.stringify(value):JSON.stringify(value,null,2));r.upstream[name]={path:file,sha256:sha256(fs.readFileSync(file))};
 }
 r.upstream.strategy_snapshot_sha256=upstream.manifest.strategy_sha256;
 r.upstream.fixture_adapter_sha256=sha256(fs.readFileSync(path.join(__dirname,'acceptance-upstream.cjs')));
 const skill=path.resolve(__dirname,'../../skills/targeted-cv');
 for(const file of ['SKILL.md',...fs.readdirSync(path.join(skill,'references')).map(n=>'references/'+n),...fs.readdirSync(path.join(skill,'schemas')).map(n=>'schemas/'+n)])r.runtimeHashes[file]=sha256(fs.readFileSync(path.join(skill,file)));
 r.fixtureSha256=sha256(fs.readFileSync(path.join(__dirname,'acceptance-fixture.cjs')));
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
  const file=path.join(output,name+'.docx');assert.ok(!fs.existsSync(file),'Destination collision');
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
  r.original.ui=await read('ui_inspect');r.original.before=await snap();assert.equal(r.original.ui.title,path.basename(original,'.docx'));binding={id:'original',connectionId:r.connectionId,path:path.resolve(original),nativeId:null};
  if(r.original.ui.dirty)await save(path.resolve(original));r.original.sha256=sha256(fs.readFileSync(original));
  for(const doc of f.documents){
   const ui=await read('ui_inspect');assert.equal(ui.dirty,false,'Unsaved work blocks switching');await snap();r.intents.push({label:'Switch to '+doc.id,at:new Date().toISOString(),status:'pending'});persist();const created=await read('new_document',{template:'blank'});owns=true;binding={id:randomUUID(),connectionId:r.connectionId,path:null,nativeId:null};r.intents.at(-1).status='observed';r.intents.at(-1).creation=created;await snap();
   const p=doc.paragraphs;
   if(doc.kind==='cv'){
    const baseline=structuredClone(p.slice(0,doc.baselineCount));baseline[2].text=f.profile.candidate.email;
    await intent('Author baseline '+doc.id,async()=>{await read('type_text',{text:baseline.map(x=>x.text).join('\n'),paragraphs:true});await exec('select.all');await exec('layout.size',{name:'A4'});await exec('layout.margins',{top:mm(18),bottom:mm(18),left:mm(18),right:mm(18)});await exec('hf.position',{header:mm(10),footer:mm(10)});await cvFormat(baseline);await exec('insert.createFooter',{page:0});await read('type_text',{text:doc.language==='de'?'Seite ':'Page '});await exec('insert.field',{instr:'PAGE'});await read('type_text',{text:' / '});await exec('insert.field',{instr:'NUMPAGES'});await exec('insert.closeHeader');});
    console.log(JSON.stringify({phase:'visible-cv-authored',id:doc.id}));const initial=await stage(doc,doc.id+'-baseline',baseline);assert.equal(initial.structure.pages,1);
    // A test actor makes a real in-app formatting edit; the host then appends only new content.
    await intent('Intervening manual content and formatting change',async()=>{await range(2,baseline[2].text);await read('type_text',{text:p[2].text});await range(8,p[8].text);await exec('format.italic',{value:true});});const manualBefore=await exec('document.paragraph',{path:[8]}),manualContactBefore=await exec('document.paragraph',{path:[2]});
    await intent('Append supported career evidence without replacing existing paragraphs',async()=>{await at(baseline.length-1,Buffer.byteLength(baseline.at(-1).text,'utf8'));await read('type_text',{text:'\n'+p.slice(baseline.length).map(x=>x.text).join('\n'),paragraphs:true});await cvFormat(p,baseline.length);const projectIndex=p.findIndex(x=>x.id==='projects-heading');await range(projectIndex,p[projectIndex].text);await exec('para.pageBreakBefore',{value:true});});
    const manualAfter=await exec('document.paragraph',{path:[8]}),manualContactAfter=await exec('document.paragraph',{path:[2]});assert.deepEqual(manualAfter,manualBefore);assert.deepEqual(manualContactAfter,manualContactBefore);r.manualPreservation??=[];r.manualPreservation.push({document:doc.id,actor:'test actor simulating a manual content and formatting edit through actual MCP',before:manualBefore,after:manualAfter,contactBefore:manualContactBefore,contactAfter:manualContactAfter,preserved:true,mapping:'Final contact paragraph maps the complete selected candidate email and city; scope text unchanged, italic retained.'});
    const final=await stage(doc,doc.id,p);assert.ok(final.structure.pages>1);r.pagination??=[];r.pagination.push({document:doc.id,before:initial.id,after:final.id,beforePages:initial.structure.pages,afterPages:final.structure.pages});
   }else{
    await intent('Author and measure '+doc.id,async()=>{await read('type_text',{text:p.map(x=>x.text).join('\n'),paragraphs:true});await exec('select.all');for(const [cmd,params] of [['para.style',{style:'Normal'}],['layout.size',{name:'A4'}],['layout.margins',{top:mm(10),bottom:mm(20),left:mm(25),right:mm(20)}],['format.font',{name:'Arial'}],['format.size',{size:11}],['format.color',{color:'202020'}],['para.spacing',{before:0,after:0}],['para.lineSpacing',{value:1}],['para.alignLeft',{}],['para.keepNext',{value:false}],['para.keepLines',{value:true}]])await exec(cmd,params);
     await range(0,p[0].text);await exec('format.color',{color:'1F4E79'});const ri=p.findIndex(x=>x.kind==='return');await range(ri,p[ri].text);await exec('format.size',{size:8});
     for(const [i,target] of [[ri,45],[p.findIndex(x=>x.kind==='recipient'),62.7],[p.findIndex(x=>x.kind==='date'),95],[p.findIndex(x=>x.kind==='subject'),105]]){const caret=await measure(i);assert.ok(caret.y<=mm(target)+0.1);await exec('para.spacing',{before:mm(target)-caret.y,after:0});}
     const si=p.findIndex(x=>x.kind==='subject');await range(si,p[si].text);await exec('format.bold',{value:true});await exec('para.keepNext',{value:true});const line=(await measure(p.findIndex(x=>x.kind==='salutation'))).h;
     for(let i=0;i<p.length;i++)if(['salutation','body','closing','signer','enclosures'].includes(p[i].kind)){await at(i);await exec('para.spacing',{before:line*(p[i].kind==='salutation'?2:p[i].kind==='signer'?3:1),after:0});}
    });console.log(JSON.stringify({phase:'visible-letter-authored',id:doc.id}));await stage(doc,doc.id,p);
   }
  }
 }catch(e){r.error=e.stack;persist();throw e;}finally{
  if(owns){try{const ui=await read('ui_inspect');if(ui.dirty)await save(binding.path||path.join(output,'interrupted-draft.docx'));await read('open_document',{path:r.original.path});r.original.after=await snap();r.original.finalUI=await read('ui_inspect');r.original.restored=r.original.after.text.text===r.original.before.text.text&&r.original.finalUI.dirty===false;r.original.bytesUnchanged=sha256(fs.readFileSync(original))===r.original.sha256;}catch(e){r.restoreError=e.message;}}
  r.finishedAt=new Date().toISOString();persist();c.close();
 }
 return r;
}
module.exports={run};
if(require.main===module)run(...process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
