'use strict';
// Test-only desktop experiment. No runtime workflow or alternative transport.
const fs=require('node:fs'),path=require('node:path');
const {McpClient,requireTool}=require('../wordcraft-document-session/foundation.cjs');
const {privateDestination,sha256}=require('./foundation.cjs');
const vm=require('node:vm');
const sessionHost=vm.createContext({});
for(const name of ['document-session.md','wordcraft-operations.md']){const source=fs.readFileSync(path.join(__dirname,'../../skills/targeted-cv/references',name),'utf8');for(const block of source.matchAll(/```javascript\r?\n([\s\S]*?)```/g))vm.runInContext(block[1],sessionHost);}
const {fixtures,checkPresentation}=require('./presentation-exercise.cjs');
const mm=value=>value*72/25.4;
async function run(cli,endpoint,output,original,expectedFile){
 output=privateDestination(output);fs.mkdirSync(output);
 const expected=JSON.parse(fs.readFileSync(expectedFile,'utf8')),originalHash=sha256(fs.readFileSync(original));
 const r={kind:'actual_desktop_cv_presentation',startedAt:new Date().toISOString(),units:{pointsPerMm:72/25.4,renderPixelsPerPoint:1.5,footerPageBase:0,renderPageBase:1},original:{path:path.resolve(original),sha256:originalHash,nativeIdentity:'not_exposed'},calls:[],stages:[],visualReview:'not_assessed'};
 const c=McpClient.connect(cli,endpoint);c.maxBytes=24*1024*1024;let tools,commands,switchStarted=false,probeOwned=false;
 const persist=()=>fs.writeFileSync(path.join(output,'receipt.json'),JSON.stringify(r,null,2));
 const parsed=result=>{const t=result.content?.find(x=>x.type==='text');if(!t)return null;try{return JSON.parse(t.text)}catch{return t.text}};
 async function call(name,args={}){requireTool(tools,name);const entry={tool:name,args,at:new Date().toISOString(),outcome:'pending'};r.calls.push(entry);persist();const result=await c.rpc('tools/call',{name,arguments:args});entry.outcome=result.isError?'failed':'returned';let value=parsed(result);if(name==='ui_inspect')value=Object.fromEntries(['title','dirty','focused','pages'].map(k=>[k,value[k]]));entry.observed=value;if(result.isError){persist();throw Error(name+' failed: '+JSON.stringify(value));}persist();return {value,result};}
 const read=async(name,args)=>(await call(name,args)).value;
 const exec=async(command,params={})=>{if(!commands.some(x=>x.id===command))throw Error('Undiscovered command '+command);return read('execute',{command,params});};
 async function snapshot(label){const s={text:await read('get_text'),structure:await read('inspect_document'),layout:await exec('document.layout'),full:await exec('document.inspect',{text:true})};fs.writeFileSync(path.join(output,label+'.json'),JSON.stringify(s,null,2));return s;}
 async function stage(name,text){await exec('references.updateFields',{all:true});const file=path.join(output,name+'.docx');await read('save_document',{path:file});await read('open_document',{path:file});await exec('insert.editFooter',{page:0});await exec('select.all');const fields=await exec('fields.selected');const footerSelection=await read('inspect_document');const footerParagraph=await exec('document.paragraph',{path:[0],story:footerSelection.selection.anchor.story});await exec('insert.closeHeader');const s=await snapshot(name);s.footerFields=fields;s.footerParagraph=footerParagraph;fs.writeFileSync(path.join(output,name+'.json'),JSON.stringify(s,null,2));const pages=s.structure.pages;const stage={name,pages,visualReview:'not_assessed',artifactStable:true,textExact:s.text.text===text,reopened:true,artifact:file,sha256:sha256(fs.readFileSync(file)),snapshotSha256:sha256(JSON.stringify(s)),rendered:[],fieldCodes:Array.isArray(fields)?fields.map(f=>f.instr):[],rawFieldEvidence:{fields,footerParagraph}};r.stages.push(stage);for(let page=1;page<=pages;page++){const {result}=await call('render_page',{page,scale:1.5});const img=result.content.find(x=>x.type==='image');if(!img)throw Error('Render image missing');fs.writeFileSync(path.join(output,`${name}-${page}.png`),Buffer.from(img.data,'base64'));stage.rendered.push(page);stage.renderHashes??={};stage.renderHashes[page]=sha256(Buffer.from(img.data,'base64'));}persist();return s;}
 try{
 const init=await c.rpc('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'formatting-probe',version:'1'}});if(!init.instructions?.includes('connected to the WordCraft app at '+endpoint))throw Error('Desktop endpoint unconfirmed');r.server=init.serverInfo;c.notify('notifications/initialized');const catalog=await c.rpc('tools/list',{});if(catalog.nextCursor)throw Error('Incomplete catalog');tools=catalog.tools;r.tools=tools;commands=await read('list_commands');r.commands=commands;
 r.initialUI=await read('ui_inspect');const initial=await snapshot('original-before');if(r.initialUI.dirty||r.initialUI.title!==path.basename(original,'.docx')||initial.text.text!==expected)throw Error('Original changed or dirty; switching withheld');
 r.switchDecision=sessionHost.inspectDocumentOperation({binding:{id:'selected-original',connectionId:'desktop',path:path.resolve(original),nativeId:null},observation:{connectionId:'desktop',path:null,nativeId:null,freshInspection:true,confirmedBindingReceipt:true,uninterrupted:true,stateContinuity:true},operation:'read',switching:true,unsaved:r.initialUI.dirty?'yes':'no'});if(r.switchDecision.decision!=='proceed')throw Error('Session switch guard rejected');switchStarted=true;await read('new_document',{template:'blank'});probeOwned=true;

 const all=fixtures();
 for(const f of all){
 if(f.name==='short-de')await read('new_document',{template:'blank'});
 const text=f.paragraphs.map(p=>p.text).join('\n');
 if(f.name==='long-de'){await exec('select.all');}
 await read('type_text',{text,paragraphs:true});await exec('select.all');
 for(const [command,params] of [['para.style',{style:'Normal'}],['layout.size',{name:'A4'}],['layout.margins',{top:mm(18),bottom:mm(18),left:mm(18),right:mm(18)}],['format.font',{name:'Arial'}],['format.size',{size:11}],['format.color',{color:'202020'}],['para.spacing',{before:0,after:4}],['para.lineSpacing',{value:1.1}],['para.alignLeft',{}],['para.keepNext',{value:false}],['para.shading',{color:null}],['para.bullets',{off:true}],['hf.position',{header:mm(10),footer:mm(10)}]])await exec(command,params);
 for(const p of f.paragraphs){
 await read('select_text',{text:p.text});
 if(p.kind==='name') {await exec('format.size',{size:22});await exec('format.color',{color:'1F4E79'});await exec('para.keepNext',{value:true});}
 if(p.kind==='headline') {await exec('format.size',{size:12});await exec('para.keepNext',{value:true});}
 if(p.kind==='heading'){await exec('para.style',{style:'Heading 2'});await exec('format.font',{name:'Arial'});await exec('format.size',{size:12});await exec('format.color',{color:'1F4E79'});await exec('format.bold',{value:true});await exec('para.spacing',{before:9,after:4});await exec('para.keepNext',{value:true});}
 if(['label','project'].includes(p.kind)){await exec('format.bold',{value:true});await exec('para.keepNext',{value:true});}
 if(p.kind==='date')await exec('para.keepNext',{value:true});
 if(p.kind==='summary')await exec('para.shading',{color:'EAF1F8'});
 if(p.kind==='bullet')await exec('para.bullets',{kind:'bullet'});
 await exec('para.keepLines',{value:true});
 }
 if(f.name==='long-de'){await read('select_text',{text:'Ausgewählte Projekte'});await exec('para.pageBreakBefore',{value:true});}
 if(f.name!=='long-de'){await exec('insert.createFooter',{page:0});await read('type_text',{text:f.language==='de'?'Seite ':'Page '});await exec('insert.field',{instr:'PAGE'});await read('type_text',{text:' / '});await exec('insert.field',{instr:'NUMPAGES'});await exec('insert.closeHeader');}
 const observed=await stage(f.name,text);r.stages.at(-1).source=f;r.stages.at(-1).paragraphs=[];
 const settings={page:'A4',marginsMm:18,font:'Arial',bodyPt:11,lineSpacing:1.1,afterPt:4,text:'202020',blue:'1F4E79',summary:'EAF1F8',namePt:22,headlinePt:12,heading:{size:12,bold:true,before:9,after:4},footerMm:10,breakBeforeProjects:f.name==='long-de'};
 r.stages.at(-1).presentation={profile:f.name==='long-de'?'cv-blue-1-project-break-1':'cv-blue-1',settings,settingsSha256:sha256(JSON.stringify(settings)),reason:f.name==='long-de'?'All-page review of presentation-2 found crowded first page and short second page; break before projects keeps the project section together.':'Baseline'};
 for(let i=0;i<f.paragraphs.length;i++){r.stages.at(-1).paragraphs.push(await exec('document.paragraph',{path:[i]}));}
 r.stages.at(-1).artifactStable=sha256(fs.readFileSync(r.stages.at(-1).artifact))===r.stages.at(-1).sha256;persist();
 }

 }catch(e){r.error=e.message;}
 finally{
 if(switchStarted&&probeOwned){try{const ui=await read('ui_inspect');if(ui.dirty)await read('save_document',{path:path.join(output,'probe-final.docx')});await read('open_document',{path:original});const restored=await snapshot('original-after');r.originalRestored=restored.text.text===expected;r.finalUI=await read('ui_inspect');}catch(e){r.restoreError=e.message;}}
 r.originalBytesUnchanged=sha256(fs.readFileSync(original))===originalHash;r.finishedAt=new Date().toISOString();r.gate=checkPresentation(r);persist();c.close();}
 console.log(JSON.stringify({output,error:r.error,gate:r.gate,stages:r.stages.map(({name,pages,textExact})=>({name,pages,textExact})),originalRestored:r.originalRestored}));return r;
}
module.exports={run,mm};
if(require.main===module)run(...process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
