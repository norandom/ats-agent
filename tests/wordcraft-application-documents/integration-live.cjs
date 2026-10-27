'use strict';
// One test-only live CV slice. Full bilingual/pagination acceptance belongs to task 7.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {prepareIntegration}=require('./integration-fixture.cjs');
const {load,sha256}=require('./manifest-fixture.cjs');
const {privateDestination}=require('./foundation.cjs');
const {McpClient,requireTool}=require('../wordcraft-document-session/foundation.cjs');
async function run(cli,endpoint,destination,original){
 const output=privateDestination(destination);fs.mkdirSync(output);
 const f=await prepareIntegration(),artifact=path.join(output,'cv-en.docx'),receipt=path.join(output,'receipt.json');
 const r={kind:'actual-entry-integration',startedAt:new Date().toISOString(),calls:[],artifact,canonical:{path:f.factsPath,before:f.factsHash},semanticReview:{status:'not_assessed',reason:'Host must review selected fictional facts and assembled wording.'},runtimeHashes:{}};
 const skill=path.resolve(__dirname,'../../skills/targeted-cv');
 for(const file of ['SKILL.md',...fs.readdirSync(path.join(skill,'references')).map(n=>'references/'+n),...fs.readdirSync(path.join(skill,'schemas')).map(n=>'schemas/'+n)])r.runtimeHashes[file]=sha256(fs.readFileSync(path.join(skill,file)));
 const persist=()=>fs.writeFileSync(receipt,JSON.stringify(r,null,2));
 fs.writeFileSync(path.join(output,'input.json'),JSON.stringify({profile:f.base.profile,strategy:f.strategy,manifest:f.manifest,paragraphs:f.paragraphs},null,2));
 const c=McpClient.connect(cli,endpoint);c.maxBytes=24*1024*1024;let tools,commands;
 const parsed=raw=>{const t=raw.content?.find(b=>b.type==='text');if(!t)return null;try{return JSON.parse(t.text)}catch{return t.text}};
 async function call(name,args={}){
  const tool=requireTool(tools,name),entry={name,args,inputSchemaSha256:sha256(JSON.stringify(tool.inputSchema)),at:new Date().toISOString(),outcome:'pending'};
  // Intent and last inspection are durable before each possible mutation.
  if(!['get_text','inspect_document','ui_inspect','list_commands','render_page','get_command_help'].includes(name)){r.baseline={text:await read('get_text'),structure:await read('inspect_document')};}
  r.calls.push(entry);persist();const raw=await c.rpc('tools/call',{name,arguments:args});entry.outcome=raw.isError?'uncertain':'returned';entry.observed=parsed(raw);if(name==='ui_inspect')entry.observed=Object.fromEntries(['title','dirty','focused','pages'].map(k=>[k,entry.observed[k]]));persist();assert.ok(!raw.isError,name+' failed; do not replay');return {raw,value:entry.observed};
 }
 const read=async(name,args)=>(await call(name,args)).value;
 const exec=async(command,params={})=>{assert.ok(commands.some(x=>x.id===command),command);return read('execute',{command,params});};
 const snap=async()=>({text:await read('get_text'),structure:await read('inspect_document')});
 try{
  const init=await c.rpc('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'entry-integration',version:'1'}});assert.ok(init.instructions.includes('connected to the WordCraft app at '+endpoint));c.notify('notifications/initialized');
  tools=(await c.rpc('tools/list',{})).tools;r.tools=tools;commands=await read('list_commands');r.commands=commands;
  r.initialUI=await read('ui_inspect');r.original=path.resolve(original);r.originalBytes=sha256(fs.readFileSync(original));r.originalBefore=await snap();
  assert.equal(r.initialUI.title,path.basename(original,'.docx'),'Expected selected original before switching');
  if(r.initialUI.dirty){await read('save_document',{path:r.original});r.preservedOriginal=await snap();assert.equal(r.preservedOriginal.text.text,r.originalBefore.text.text);assert.equal((await read('ui_inspect')).dirty,false);r.originalBytes=sha256(fs.readFileSync(original));}
  // Current host binding starts with the actual creation receipt in this uninterrupted connection.
  r.created=await read('new_document',{template:'blank'});r.connectionId=randomUUID();r.documentId=randomUUID();
  await read('type_text',{text:f.text,paragraphs:true});
  console.log(JSON.stringify({phase:'visible-cv-authored',language:'en',output:artifact}));
  await exec('select.all');
  for(const [command,params] of [['layout.size',{name:'A4'}],['layout.margins',{top:51.0236,bottom:51.0236,left:51.0236,right:51.0236}],['format.font',{name:'Arial'}],['format.size',{size:11}],['para.spacing',{before:0,after:4}],['para.lineSpacing',{value:1.1}],['format.color',{color:'202020'}]])await exec(command,params);
  for(const [kind,text] of f.paragraphs){if(!['name','headline','heading','label'].includes(kind))continue;await read('select_text',{text});await exec('para.keepNext',{value:true});if(kind==='name')await exec('format.size',{size:22});if(['name','heading'].includes(kind))await exec('format.color',{color:'1F4E79'});if(['heading','label'].includes(kind))await exec('format.bold',{value:true});}
  await exec('insert.createFooter',{page:0});await read('type_text',{text:'Page '});await exec('insert.field',{instr:'PAGE'});await read('type_text',{text:' / '});await exec('insert.field',{instr:'NUMPAGES'});await exec('insert.closeHeader');
  // Model an intervening human formatting edit through actual MCP, separate from the planned host edit.
  await read('select_text',{text:f.paragraphs[3][1]});await exec('format.italic',{value:true});
  r.manualBefore=await exec('document.paragraph',{path:[3]});r.manualEdit={actor:'test actor simulating a human formatting edit',scope:'employer paragraph italic',actualMcp:true};
  await read('select_text',{text:f.paragraphs[0][1]});r.targetSelection=await read('inspect_document');assert.equal(r.targetSelection.selection.text,f.paragraphs[0][1]);assert.equal(r.targetSelection.selection.anchor.story,'body');assert.deepEqual(r.targetSelection.selection.anchor.path,[0]);await exec('format.size',{size:23});
  r.manualAfter=await exec('document.paragraph',{path:[3]});assert.deepEqual(r.manualAfter,r.manualBefore,'Unrelated observed formatting preserved');
  r.manualEdit.preserved=true;r.editScope='Name size only; employer italic formatting retained; text unchanged.';
  await exec('references.updateFields',{all:true});assert.ok(!fs.existsSync(artifact));r.save=await read('save_document',{path:artifact});assert.equal(r.save.path,artifact);
  r.reopen=await read('open_document',{path:artifact});assert.equal(r.reopen.path,artifact);
  await exec('insert.editFooter',{page:0});await exec('select.all');r.footerFields=await exec('fields.selected');await exec('insert.closeHeader');
  // Footer mode dirties this installed editor. Persist and rebind before read-only checks.
  r.saveAfterFooter=await read('save_document',{path:artifact});r.reopen=await read('open_document',{path:artifact});assert.equal(r.reopen.path,artifact);
  r.before=await snap();r.bytesBefore=sha256(fs.readFileSync(artifact));r.renders=[];
  for(let page=1;page<=r.before.structure.pages;page++){const {raw}=await call('render_page',{page,scale:1.5});const img=raw.content.find(b=>b.type==='image');assert.ok(img);const file=path.join(output,`page-${page}.png`);fs.writeFileSync(file,Buffer.from(img.data,'base64'));r.renders.push({page,path:file,sha256:sha256(fs.readFileSync(file)),status:'not_assessed'});}
  r.after=await snap();r.finalUI=await read('ui_inspect');r.bytesAfter=sha256(fs.readFileSync(artifact));assert.equal(r.finalUI.dirty,false);assert.deepEqual(r.before,r.after);assert.equal(r.bytesBefore,r.bytesAfter);assert.equal(r.after.text.text,f.text);
  const {stableSerialize,fingerprint,inspectStrategy}=f.modules;
  const session={document_id:r.documentId,connection_id:r.connectionId,snapshot_id:randomUUID(),snapshot_sha256:sha256(JSON.stringify([r.after.text.text,r.after.structure,r.after.structure.selection])),saved_path:artifact,saved_sha256:r.bytesAfter};
  const entry=f.manifest.documents[0];entry.destination=artifact;entry.session=session;entry.state='authored';entry.presentation.settings_sha256=sha256(JSON.stringify({profile:'cv-blue-1',namePt:23,manualEmployerItalic:true}));
  entry.anchors=[{section_id:'cv-evidence',part:null,text:f.text,context:f.text,baseline_snapshot_id:session.snapshot_id,status:'mapped'}];
  r.observation={before:session,after:session,bytesBefore:r.bytesBefore,bytesAfter:r.bytesAfter,reopened:true,editable:r.after.structure.blocks.every(b=>b.type==='paragraph'),continuity:true,accessible:true,evidence_reference:receipt,producer:'current WordCraft integration observation',method:'actual create, scoped format, save/reopen, MCP readback and byte hashing',observed_at:new Date().toISOString(),reviewedText:f.text,bodyText:r.after.text.text,structure:r.after.structure,pageCount:r.after.structure.pages,renders:r.renders.map(p=>({...p,accessible:true,evidence_reference:p.path})),semanticReview:r.semanticReview};
  const {verifyObservedDocument,toStrategyDocumentChecks}=load('document-verification.md',['verifyObservedDocument','toStrategyDocumentChecks']);
  r.verified=verifyObservedDocument(entry,r.observation,stableSerialize);entry.checks=r.verified.checks;
  const documentArtifacts=[{binding:f.strategy.binding,artifact_id:entry.id,artifact_sha256:r.bytesAfter,checks:toStrategyDocumentChecks({id:entry.id,...session,saved:true,current:true,accessibleEvidence:[receipt]},entry.checks)}];
  const next={...structuredClone(f.strategy),document_checks:documentArtifacts[0].checks};
  r.consumer=await f.modules.reviewEditorial(next,{...f.host,...f.modules,current:()=>f.workflow.current(),observeDocumentArtifacts:async()=>documentArtifacts});
  const trusted={...f.trusted,privateDestinations:[artifact],session:{connection:{id:r.connectionId},bindings:[{id:r.documentId,kind:'cv',language:'en',connectionId:r.connectionId,currentSnapshotId:session.snapshot_id}],snapshots:[{id:session.snapshot_id,documentId:r.documentId,connectionId:r.connectionId,fingerprint:session.snapshot_sha256,text:f.text,structure:[]}]},savedArtifacts:[{...session,reopened:true,editable:true}],observations:entry.checks.map(check=>({document_id:r.documentId,check}))};
  const {inspectDocumentManifest,proposeCheckOnlyRefresh}=load('application-documents.md',['inspectDocumentManifest','proposeCheckOnlyRefresh']);
  assert.deepEqual(await inspectDocumentManifest(f.manifest,trusted),[]);
  r.refresh=await proposeCheckOnlyRefresh(f.manifest,f.strategy,{...trusted,strategy:next,strategy_sha256:fingerprint(next,sha256),current:()=>f.workflow.current(),inspectStrategy,documentArtifacts});assert.equal(r.refresh.decision,'refresh');
  r.manifest=r.refresh.proposal;r.canonical.after=sha256(fs.readFileSync(f.factsPath));assert.equal(r.canonical.after,r.canonical.before);r.originalUnchanged=sha256(fs.readFileSync(original))===r.originalBytes;
  r.status='authored-checked-draft';r.finishedAt=new Date().toISOString();persist();console.log(JSON.stringify({output,status:r.status,pages:r.after.structure.pages,checks:r.verified.checks.map(x=>[x.kind,x.status]),manualEditPreserved:r.manualEdit.preserved}));
 }catch(e){r.error=e.message;persist();throw e;}finally{c.close();}
}
module.exports={run};
if(require.main===module)run(...process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
