'use strict';
// Test-only desktop experiment. No runtime workflow or alternative transport.
const fs=require('node:fs'),path=require('node:path');
const {McpClient,requireTool}=require('../wordcraft-document-session/foundation.cjs');
const {privateDestination,sha256}=require('./foundation.cjs');
const vm=require('node:vm');
const sessionHost=vm.createContext({});
for(const name of ['document-session.md','wordcraft-operations.md']){const source=fs.readFileSync(path.join(__dirname,'../../skills/targeted-cv/references',name),'utf8');for(const block of source.matchAll(/```javascript\r?\n([\s\S]*?)```/g))vm.runInContext(block[1],sessionHost);}
const mm=value=>value*72/25.4;
function checkReceipt(r){
 const issues=[];
 if(!r.originalRestored||!r.originalBytesUnchanged)issues.push('original preservation');
 if(r.error)issues.push(r.error);
 for(const name of ['single','multiple']){const s=r.stages?.find(s=>s.name===name);if(!s||!s.textExact||!s.reopened||!(name==='single'?s.pages===1:s.pages>1)||s.rendered?.length!==s.pages||!Array.from({length:s.pages},(_,i)=>i+1).every(p=>s.rendered.includes(p))||!['PAGE','NUMPAGES'].every(f=>s.fieldCodes?.includes(f)))issues.push(name+' pagination evidence');}
 if(r.geometry?.status!=='passed')issues.push('address geometry');
 if(r.visualReview!=='passed')issues.push('rendered visual review');
 return {status:issues.length?'pending':'passed',issues};
}
async function run(cli,endpoint,output,original,expectedFile){
 output=privateDestination(output);fs.mkdirSync(output);
 const expected=JSON.parse(fs.readFileSync(expectedFile,'utf8')),originalHash=sha256(fs.readFileSync(original));
 const r={kind:'actual_desktop_formatting_probe',startedAt:new Date().toISOString(),units:{pointsPerMm:72/25.4,renderPixelsPerPoint:1.5,footerPageBase:0,renderPageBase:1},original:{path:path.resolve(original),sha256:originalHash,nativeIdentity:'not_exposed'},calls:[],stages:[],geometry:{status:'not_assessed',reason:'Awaiting observed address region'},visualReview:'not_assessed'};
 const c=McpClient.connect(cli,endpoint);c.maxBytes=24*1024*1024;let tools,commands,switchStarted=false,probeOwned=false;
 const persist=()=>fs.writeFileSync(path.join(output,'receipt.json'),JSON.stringify(r,null,2));
 const parsed=result=>{const t=result.content?.find(x=>x.type==='text');if(!t)return null;try{return JSON.parse(t.text)}catch{return t.text}};
 async function call(name,args={}){requireTool(tools,name);const entry={tool:name,args,at:new Date().toISOString(),outcome:'pending'};r.calls.push(entry);persist();const result=await c.rpc('tools/call',{name,arguments:args});entry.outcome=result.isError?'failed':'returned';let value=parsed(result);if(name==='ui_inspect')value=Object.fromEntries(['title','dirty','focused','pages'].map(k=>[k,value[k]]));entry.observed=value;if(result.isError){persist();throw Error(name+' failed: '+JSON.stringify(value));}persist();return {value,result};}
 const read=async(name,args)=>(await call(name,args)).value;
 const exec=async(command,params={})=>{if(!commands.some(x=>x.id===command))throw Error('Undiscovered command '+command);return read('execute',{command,params});};
 async function snapshot(label){const s={text:await read('get_text'),structure:await read('inspect_document'),layout:await exec('document.layout'),full:await exec('document.inspect',{text:true})};fs.writeFileSync(path.join(output,label+'.json'),JSON.stringify(s,null,2));return s;}
 async function stage(name,text){await exec('references.updateFields',{all:true});const file=path.join(output,name+'.docx');await read('save_document',{path:file});await read('open_document',{path:file});await exec('insert.editFooter',{page:0});await exec('select.all');const fields=await exec('fields.selected');const footerSelection=await read('inspect_document');const footerParagraph=await exec('document.paragraph',{path:[0],story:footerSelection.selection.anchor.story});await exec('insert.closeHeader');const s=await snapshot(name);s.footerFields=fields;s.footerParagraph=footerParagraph;fs.writeFileSync(path.join(output,name+'.json'),JSON.stringify(s,null,2));const pages=s.structure.pages;const stage={name,pages,textExact:s.text.text===text,reopened:true,artifact:file,sha256:sha256(fs.readFileSync(file)),snapshotSha256:sha256(JSON.stringify(s)),rendered:[],fieldCodes:Array.isArray(fields)?fields.map(f=>f.instr):[],rawFieldEvidence:{fields,footerParagraph}};r.stages.push(stage);for(let page=1;page<=pages;page++){const {result}=await call('render_page',{page,scale:1.5});const img=result.content.find(x=>x.type==='image');if(!img)throw Error('Render image missing');fs.writeFileSync(path.join(output,`${name}-${page}.png`),Buffer.from(img.data,'base64'));stage.rendered.push(page);stage.renderHashes??={};stage.renderHashes[page]=sha256(Buffer.from(img.data,'base64'));}persist();return s;}
 try{
 const init=await c.rpc('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'formatting-probe',version:'1'}});if(!init.instructions?.includes('connected to the WordCraft app at '+endpoint))throw Error('Desktop endpoint unconfirmed');r.server=init.serverInfo;c.notify('notifications/initialized');const catalog=await c.rpc('tools/list',{});if(catalog.nextCursor)throw Error('Incomplete catalog');tools=catalog.tools;r.tools=tools;commands=await read('list_commands');r.commands=commands;
 r.initialUI=await read('ui_inspect');const initial=await snapshot('original-before');if(r.initialUI.dirty||r.initialUI.title!==path.basename(original,'.docx')||initial.text.text!==expected)throw Error('Original changed or dirty; switching withheld');
 r.switchDecision=sessionHost.inspectDocumentOperation({binding:{id:'selected-original',connectionId:'desktop',path:path.resolve(original),nativeId:null},observation:{connectionId:'desktop',path:null,nativeId:null,freshInspection:true,confirmedBindingReceipt:true,uninterrupted:true,stateContinuity:true},operation:'read',switching:true,unsaved:r.initialUI.dirty?'yes':'no'});if(r.switchDecision.decision!=='proceed')throw Error('Session switch guard rejected');switchStarted=true;await read('new_document',{template:'blank'});probeOwned=true;
 const text='Ivo Paperbrook\nFictional Parcel Workshop\nExample Street 12\n12345 Example Town\nApplication for dispatch coordinator\nDear Hiring Team,\nI reconcile fictional dispatch notes and clarify handovers.\nKind regards,\nIvo Paperbrook\nEND OF FICTIONAL PROBE';
 await read('type_text',{text,paragraphs:true});await exec('select.all');
 for(const [command,params] of [['layout.size',{name:'A4'}],['layout.margins',{top:mm(45),bottom:mm(20),left:mm(25),right:mm(20)}],['format.font',{name:'Arial'}],['format.size',{size:11}],['para.spacing',{before:0,after:4}],['para.lineSpacing',{value:1}],['para.alignLeft',{}],['hf.position',{header:mm(10),footer:mm(10)}]])await exec(command,params);
 await read('select_text',{text:'Application for dispatch coordinator'});await exec('para.style',{style:'Heading 2'});await exec('para.keepNext',{value:true});
 await exec('insert.createFooter',{page:0});await read('type_text',{text:'Page '});await exec('insert.field',{instr:'PAGE'});await read('type_text',{text:' / '});await exec('insert.field',{instr:'NUMPAGES'});await exec('insert.closeHeader');
 await stage('single',text);
 await read('select_text',{text:'END OF FICTIONAL PROBE'});
 const replacement=Array.from({length:65},(_,i)=>`Fictional routing entry ${i+1}: reconcile the parcel manifest, record the handover and clarify the next dispatch step.`).join('\n');
 await read('type_text',{text:replacement,paragraphs:true});await stage('multiple',text.replace('END OF FICTIONAL PROBE',replacement));
 // Separate measured placement experiment; never substitute a frame into the CV.
 await read('select_text',{text:'Example Street 12'});await exec('insert.textBox',{text:'FICTIONAL ADDRESS REGION',width:mm(85),height:mm(45)});r.addressObjects=await exec('arrange.selectionPane');await exec('select.objects',{index:0});await exec('arrange.bounds',{x:mm(20),y:mm(45),width:mm(85),height:mm(45),page:0});await read('save_document',{path:path.join(output,'address-frame.docx')});await read('open_document',{path:path.join(output,'address-frame.docx')});const frame=await snapshot('address-frame');r.addressParagraph=await exec('document.paragraph',{path:[0]});r.addressPart=await exec('document.paragraph',{path:[0],story:{part:2}});r.geometry={status:'failed',reason:'Frame region has correct outer dimensions, but default text inset and body wrapping do not satisfy the letter profile; body get_text omits frame text. Detailed frame paragraph and part observations retained. Exact supplemental/recipient zone arrangement not established.',bodyIncludesFrame:frame.text.text.includes('FICTIONAL ADDRESS REGION')};const rendered=await call('render_page',{page:1,scale:1.5});const image=rendered.result.content.find(x=>x.type==='image');if(image)fs.writeFileSync(path.join(output,'address-frame.png'),Buffer.from(image.data,'base64'));
 // Ordinary paragraphs avoid the failed frame's wrapping and extraction behavior.
 await read('new_document',{template:'blank'});
 const letterText='Fictional Parcel Workshop\nExample Street 12\n12345 Example Town\nApplication for dispatch coordinator\nDear Hiring Team,\nThis is a wholly fictional placement probe.';
 await read('type_text',{text:letterText,paragraphs:true});await exec('select.all');
 for(const [command,params] of [['layout.size',{name:'A4'}],['layout.margins',{top:mm(62.7),bottom:mm(20),left:mm(25),right:mm(20)}],['format.font',{name:'Arial'}],['format.size',{size:11}],['para.spacing',{before:0,after:0}],['para.lineSpacing',{value:1}]])await exec(command,params);
 async function measure(text){await read('select_text',{text});const selected=await read('inspect_document');const start={...selected.selection.anchor,off:0};await exec('select.range',{anchor:start,focus:start});return (await exec('document.layout')).caret;}
 const first=await measure('Fictional Parcel Workshop'),last=await measure('12345 Example Town');
 const subjectBefore=await measure('Application for dispatch coordinator');
 await exec('para.spacing',{before:Math.max(0,mm(95)-subjectBefore.y),after:0});
 const letterFile=path.join(output,'body-address.docx');await read('save_document',{path:letterFile});await read('open_document',{path:letterFile});
 const positions={first:await measure('Fictional Parcel Workshop'),last:await measure('12345 Example Town'),subject:await measure('Application for dispatch coordinator')};
 const bodyAddress=await snapshot('body-address');
 r.geometry={status:Math.abs(positions.first.x-mm(25))<0.1&&Math.abs(positions.first.y-mm(62.7))<0.1&&positions.last.y+positions.last.h<mm(90)&&positions.subject.y>=mm(90)&&bodyAddress.text.text===letterText?'passed':'failed',method:'Observed document.layout caret line top and line height in points after save/reopen; not glyph baseline. Recipient-only body profile; conceptual address-field left edge is 5mm before text.',positions,artifact:letterFile,artifactSha256:sha256(fs.readFileSync(letterFile)),scope:'Recipient zone containment, 5mm offset from x20mm conceptual field, contiguous body reading order, subject below address field. Full letter/header/supplemental zone composition remains later work.',frameRecipe:'Rejected: default inset/wrapping and body extraction fail intended profile.'};
 const bodyRender=await call('render_page',{page:1,scale:1.5});const bodyImage=bodyRender.result.content.find(x=>x.type==='image');if(bodyImage)fs.writeFileSync(path.join(output,'body-address.png'),Buffer.from(bodyImage.data,'base64'));
 }catch(e){r.error=e.message;}
 finally{
 if(switchStarted&&probeOwned){try{const ui=await read('ui_inspect');if(ui.dirty)await read('save_document',{path:path.join(output,'probe-final.docx')});await read('open_document',{path:original});const restored=await snapshot('original-after');r.originalRestored=restored.text.text===expected;r.finalUI=await read('ui_inspect');}catch(e){r.restoreError=e.message;}}
 r.originalBytesUnchanged=sha256(fs.readFileSync(original))===originalHash;r.finishedAt=new Date().toISOString();r.gate=checkReceipt(r);persist();c.close();}
 console.log(JSON.stringify({output,error:r.error,gate:r.gate,stages:r.stages.map(({name,pages,textExact})=>({name,pages,textExact})),originalRestored:r.originalRestored}));return r;
}
module.exports={checkReceipt,run,mm};
if(require.main===module)run(...process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
