'use strict';
// Test-only live exercise. Reuses the session transport; no shipped compositor.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {McpClient,requireTool}=require('../wordcraft-document-session/foundation.cjs');
const {privateDestination,sha256}=require('./foundation.cjs');
const {fixture,paragraphs}=require('./letter-fixture.cjs');
const mm=n=>n*72/25.4;
async function run(cli,endpoint,destination,selectedReceipt){
 const output=privateDestination(destination);fs.mkdirSync(output);
 const r={kind:'actual_desktop_germany_letters',startedAt:new Date().toISOString(),calls:[],stages:[],units:{geometry:'points',pointsPerMm:72/25.4,renderPixelsPerPoint:1.5},visualReview:'not_assessed'};
 const persist=()=>fs.writeFileSync(path.join(output,'receipt.json'),JSON.stringify(r,null,2));
 const host=vm.createContext({});for(const name of ['document-session.md','wordcraft-operations.md'])for(const b of fs.readFileSync(path.join(__dirname,'../../skills/targeted-cv/references',name),'utf8').matchAll(/```javascript\r?\n([\s\S]*?)```/g))vm.runInContext(b[1],host);
 const c=McpClient.connect(cli,endpoint);let tools,commands;
 async function call(name,args={}){requireTool(tools,name);const entry={tool:name,args,at:new Date().toISOString(),outcome:'pending'};r.calls.push(entry);persist();const raw=await c.rpc('tools/call',{name,arguments:args});let value;try{value=JSON.parse(raw.content.find(b=>b.type==='text')?.text)}catch{value=null;}if(name==='ui_inspect')value=Object.fromEntries(['title','dirty','focused','pages'].map(k=>[k,value[k]]));entry.outcome=raw.isError?'failed':'returned';entry.observed=value;persist();if(raw.isError)throw Error(name+' failed');return {value,raw};}
 const read=async(n,a)=>(await call(n,a)).value;
 const exec=async(command,params={})=>{if(!commands.some(c=>c.id===command))throw Error('Missing command '+command);return read('execute',{command,params});};
 async function at(i,off=0){const p={story:'body',path:[i],off};await exec('select.range',{anchor:p,focus:p});}
 async function measure(i,off=0){await at(i,off);return (await exec('document.layout')).caret;}
 try{
 const init=await c.rpc('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'letter-live',version:'1'}});if(!init.instructions?.includes('connected to the WordCraft app at '+endpoint))throw Error('Desktop endpoint unconfirmed');c.notify('notifications/initialized');tools=(await c.rpc('tools/list',{})).tools;commands=await read('list_commands');r.commands=commands;
 r.initialUI=await read('ui_inspect');r.initialText=await read('get_text');await read('inspect_document');
 if(selectedReceipt){const previous=JSON.parse(fs.readFileSync(selectedReceipt,'utf8')).stages.at(-1);if(r.initialUI.dirty||r.initialUI.title!==path.basename(previous.artifact,'.docx')||r.initialText.text!==previous.expected||sha256(fs.readFileSync(previous.artifact))!==previous.sha256)throw Error('Selected prior exercise changed');await read('open_document',{path:previous.artifact});r.selectedOriginal={path:previous.artifact,sha256:previous.sha256};}
 else if(r.initialUI.dirty||r.initialUI.title!=='Document1'||r.initialText.text!=='')throw Error('Only explicitly selected clean blank Document1 may be replaced');
 for(const language of ['en','de']){
 if(language==='de'){const ui=await read('ui_inspect');if(ui.dirty)throw Error('Intervening unsaved edit: switch withheld');}
 await read('new_document',{template:'blank'});await read('get_text');await read('inspect_document');
 const f=fixture(language),p=paragraphs(f),text=p.map(x=>x.text).join('\n');
 r.stages.push({language,fixture:f,expected:text,visualReview:'not_assessed'});const s=r.stages.at(-1);
 s.selectionGuard=host.inspectDocumentOperation({binding:{id:'letter-'+language,path:null,nativeId:null,connectionId:'desktop'},observation:{connectionId:'desktop',freshInspection:true,confirmedBindingReceipt:true,uninterrupted:true,stateContinuity:true},operation:'read'});if(s.selectionGuard.decision!=='proceed')throw Error('Selection guard');
 await read('type_text',{text,paragraphs:true});await exec('select.all');
 for(const [cmd,params] of [['para.style',{style:'Normal'}],['layout.size',{name:'A4'}],['layout.margins',{top:mm(10),bottom:mm(20),left:mm(25),right:mm(20)}],['format.font',{name:'Arial'}],['format.size',{size:11}],['format.color',{color:'202020'}],['para.spacing',{before:0,after:0}],['para.lineSpacing',{value:1}],['para.alignLeft',{}],['para.keepNext',{value:false}],['para.keepLines',{value:true}]])await exec(cmd,params);
 async function selectParagraph(i){await exec('select.range',{anchor:{story:'body',path:[i],off:0},focus:{story:'body',path:[i],off:Buffer.byteLength(p[i].text,'utf8')}});}
 await selectParagraph(0);await exec('format.color',{color:'1F4E79'});
 const returnIndex=p.findIndex(x=>x.kind==='return');await selectParagraph(returnIndex);await exec('format.size',{size:8});
 // Place regions from observed line tops, never from guessed baselines.
 for(const [i,target] of [[returnIndex,45],[p.findIndex(x=>x.kind==='recipient'),62.7],[p.findIndex(x=>x.kind==='date'),95],[p.findIndex(x=>x.kind==='subject'),105]]){const caret=await measure(i);if(caret.y>mm(target)+0.1)throw Error('Content already exceeds intended region');await exec('para.spacing',{before:mm(target)-caret.y,after:0});}
 const subject=p.findIndex(x=>x.kind==='subject');await selectParagraph(subject);await exec('format.bold',{value:true});await exec('para.keepNext',{value:true});
 const line=(await measure(p.findIndex(x=>x.kind==='salutation'))).h;s.lineHeight=line;
 for(let i=0;i<p.length;i++){if(['salutation','body','closing','signer','enclosures'].includes(p[i].kind)){await at(i);await exec('para.spacing',{before:line*(p[i].kind==='salutation'?2:p[i].kind==='signer'?3:1),after:0});}}
 const file=path.join(output,'letter-'+language+'.docx');if(fs.existsSync(file))throw Error('Destination collision');await read('save_document',{path:file});await read('open_document',{path:file});
 s.artifact=file;s.sha256=sha256(fs.readFileSync(file));s.reopened=true;s.text=await read('get_text');s.structure=await read('inspect_document');s.document=await exec('document.inspect',{text:true});s.layout=await exec('document.layout');s.textExact=s.text.text===text;s.paragraphs=[];
 for(let i=0;i<p.length;i++)s.paragraphs.push({kind:p[i].kind,text:p[i].text,start:await measure(i),end:await measure(i,Buffer.byteLength(p[i].text,'utf8')),observed:await exec('document.paragraph',{path:[i]})});
 s.rendered=[];for(let page=1;page<=s.structure.pages;page++){const rendered=await call('render_page',{page,scale:1.5});const img=rendered.raw.content.find(x=>x.type==='image');if(!img)throw Error('Render missing');const png=Buffer.from(img.data,'base64'),renderPath=path.join(output,`letter-${language}-${page}.png`);fs.writeFileSync(renderPath,png);s.rendered.push({page,path:renderPath,sha256:sha256(png)});}
 s.finalUI=await read('ui_inspect');s.artifactStable=sha256(fs.readFileSync(file))===s.sha256;s.snapshotSha256=sha256(JSON.stringify({text:s.text,structure:s.structure,paragraphs:s.paragraphs}));persist();console.log(JSON.stringify({language,artifact:file,renders:s.rendered,textExact:s.textExact,pages:s.structure.pages}));
 }
 }catch(e){r.error=e.message;process.exitCode=1;}finally{r.finishedAt=new Date().toISOString();persist();c.close();}console.log(JSON.stringify({output,error:r.error}));
}
if(require.main===module)run(...process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
