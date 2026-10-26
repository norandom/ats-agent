// Test-only acceptance driver. The host protocol remains Markdown, not this harness.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {McpClient,requireTool,validateFixtures}=require('./foundation.cjs');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const mandatory=['cv-lifecycle','letter-lifecycle','nonconflict','conflict','formatting','lost-response','unresolved','missing-tool','switching','visibility'];
function acceptanceStatus(cases,state={}){return state.originalRestored===true&&!state.restoreError&&!state.error&&state.status!=='failed'&&cases.length===mandatory.length&&mandatory.every(id=>cases.filter(c=>c.id===id&&c.status==='passed'&&c.evidenceKind===(['unresolved','missing-tool'].includes(id)?'simulated_control':'actual_mcp')).length===1)?'passed':'pending';}
function requireInitialSelection(observed,expected){if(observed!==expected)throw Error('Initial selected document mismatch; no open, discard or mutation permitted');}
function projectInspection(v){
 if(!Array.isArray(v.blocks)||!v.blocks.length)throw Error('No inspectable blocks');
 return {parts:v.blocks.map(b=>{if(!Number.isInteger(b.index)||typeof b.text!=='string')throw Error('No inspection-derived block identity');const {index,text,len,...format}=b;return {id:'body:'+index,text,format:JSON.stringify(format)};})};
}
function body(r){const t=r.content?.find(x=>x.type==='text');if(!t)throw Error('No structured tool response');return JSON.parse(t.text);}
async function run(executable,endpoint,output,selectedPath){
 const root=path.resolve(__dirname,'../..'),fixture=validateFixtures(require('./fixtures.json'));
 const selected=JSON.parse(fs.readFileSync(selectedPath,'utf8').replace(/^\uFEFF/,''));
 if(selected.fictional!==true||!selected.selectedArtifact||typeof selected.expectedText!=='string')throw Error('Explicit selected fictional document required');
 const {validateOutputDirectory}=require('./live-acceptance.cjs');output=validateOutputDirectory(root,output);
 if(fs.existsSync(output))throw Error('Select a fresh output directory');fs.mkdirSync(output,{recursive:true});
 const host=vm.createContext({}),assets=[];
 for(const name of ['references/document-session.md','references/wordcraft-capabilities.md','references/wordcraft-operations.md','schemas/document-session.schema.json']){
  const text=fs.readFileSync(path.join(root,'skills/targeted-cv',name),'utf8');assets.push({name,sha256:hash(text)});
  if(name.endsWith('.md'))for(const b of text.matchAll(/```javascript\r?\n([\s\S]*?)```/g))vm.runInContext(b[1],host);
 }
 const report={evidenceKind:'actual_mcp',mode:'desktop-connected',startedAt:new Date().toISOString(),assets,endpoint,environment:{node:process.version,cliVersion:execFileSync(executable,['--version'],{encoding:'utf8',windowsHide:true}).trim(),executableSha256:hash(fs.readFileSync(executable))},calls:[],scenarios:mandatory.map(id=>({id,status:'pending',evidenceKind:['unresolved','missing-tool'].includes(id)?'simulated_control':'actual_mcp'})),limits:['No DIN, finished styling, ATS compatibility, atomic typing protection or exactly-once transport claim.'],milestone:'pending'};
 let client=McpClient.connect(executable,endpoint),binding,current,record,sequence=0,tools,originalVerified=false;
 const id=prefix=>prefix+'-'+(++sequence),now=()=>new Date().toISOString();
 const check=(yes,label)=>{if(!yes)throw Error(label);};
 function scenario(name,evidence){Object.assign(report.scenarios.find(x=>x.id===name),{status:'passed',evidence});}
 async function call(name,args={},actor='host'){
  requireTool(tools,name);let result=await client.rpc('tools/call',{name,arguments:args});
  if(name==='ui_inspect'&&!result.isError){const observed=body(result);result={...result,content:[{type:'text',text:JSON.stringify(Object.fromEntries(['focused','title','window','pages','dirty','canvasRect'].map(k=>[k,observed[k]])))}],projection:'Only selected-document visibility fields retained; unrelated recent paths omitted'};}
  const entry={id:id('mcp'),tool:name,args,actor,executedAt:now(),result};report.calls.push(entry);check(!result.isError,name+' returned error');return body(result);
 }
 function persist(){
  const temp=path.join(output,'session.next.json'),dest=path.join(output,'session.json');fs.writeFileSync(temp,JSON.stringify(record,null,2));
  execFileSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(root,'skills/targeted-cv/schemas/document-session.schema.json'),temp],{encoding:'utf8',windowsHide:true});
  check(host.inspectSessionIntegrity(record).length===0,'Record integrity');fs.renameSync(temp,dest);check(fs.readFileSync(dest,'utf8')===JSON.stringify(record,null,2),'Persistence readback');
 }
 function receipt(operation,tool,outcome,receiptId=id('receipt')){record.receipts.push({id:receiptId,documentId:binding.id,connectionId:record.connection.id,operation,tool,inputSchemaFingerprint:tool?hash(JSON.stringify(requireTool(tools,tool).inputSchema)):null,format:'docx',executedAt:tool?now():null,outcome});return receiptId;}
 function confirmed(operation,tool,snapshotId,artifact=null,evidence=[]){const rid=id('receipt');receipt(operation,tool,{status:'confirmed',value:{documentId:binding.id,snapshotId,artifact},evidenceIds:[rid,...evidence]},rid);
  const canonical={create:'new_document',read:'get_text',edit:'type_text',save:'save_document',export:'save_document',reopen:'open_document',open_select:'open_document'};
  if(canonical[operation]===tool){const capability={operation,tool,status:'demonstrated',inputSchemaFingerprint:hash(JSON.stringify(requireTool(tools,tool).inputSchema)),format:'docx',connectionId:record.connection.id,evidenceIds:[rid]};const previous=record.capabilities.find(c=>c.operation===operation);if(previous)Object.assign(previous,capability);else record.capabilities.push(capability);}
  return rid;}
 async function inspect(){
  const text=(await call('get_text')).text,structure=await call('inspect_document');
  const snapshot={id:id('snapshot'),documentId:binding.id,connectionId:record.connection.id,text,structure:[{part:'body',description:JSON.stringify(structure)}],selection:JSON.stringify(structure.selection??null),observedAt:now()};snapshot.fingerprint=hash(JSON.stringify([snapshot.text,snapshot.structure,snapshot.selection]));record.snapshots.push(snapshot);binding.currentSnapshotId=snapshot.id;
  current={snapshot,raw:structure,projection:projectInspection(structure)};current.readReceipt=confirmed('read','get_text',snapshot.id);return current;
 }
 function observation(){return {connectionId:record.connection.id,path:binding.path,nativeId:null,freshInspection:true,uninterrupted:true,stateContinuity:true,confirmedBindingReceipt:true};}
 async function mutation(operation,tool,args,scope,actor='host',drop=false){
  const intent={id:id('intent'),documentId:binding.id,baselineSnapshotId:binding.currentSnapshotId,operation,target:operation==='edit'?(scope.target||'empty body'):null,context:operation==='edit'?scope.context||'Explicit fictional acceptance scope':null,replacement:operation==='edit'?scope.replacement??'':null,scope:scope.description||scope.target||operation,destination:['save','export'].includes(operation)?args.path:null,format:['save','export'].includes(operation)?'docx':null};record.intents.push(intent);
  receipt(operation,null,{status:'pending',reason:'selection',intentId:intent.id,nextAction:'Persisted before dispatch; inspect result'});persist();
  binding.currentSnapshotId=null;
  let result=await call(tool,args,actor);
  if(drop){const rid=receipt(operation,tool,{status:'uncertain',intentId:intent.id,evidenceIds:[],nextAction:'Injected host response loss; inspect before retry'});persist();return {intent,rid};}
  await inspect();let artifact=null;
  if(['save','export'].includes(operation)){check(path.resolve(result.path)===path.resolve(args.path),'Actual saved path');artifact={documentId:binding.id,destination:args.path,format:'docx',relationship:operation==='export'?'export':'saved_document'};binding.path=args.path;}
  confirmed(operation,tool,current.snapshot.id,artifact);persist();return result;
 }
 async function open(file,expected){const result=await call('open_document',{path:file});binding.path=file;await inspect();check(current.snapshot.text.trimEnd()===expected.trimEnd(),'Reopened content');confirmed('reopen','open_document',current.snapshot.id);persist();return result;}
 async function select(target){await call('select_text',{text:target});await inspect();check(current.raw.selection?.text===target,'Actual selected text');const a=current.raw.selection.anchor,f=current.raw.selection.focus;check(a.story==='body'&&f.story==='body'&&a.path.length===1&&a.path[0]===f.path[0],'Selection single body block');return {partId:'body:'+a.path[0],text:target,start:Math.min(a.off,f.off),end:Math.max(a.off,f.off)};}
 async function scoped(target,replacement,baseline,actor='host',drop=false){
  const selection=await select(target);const input={binding,observation:observation(),baseline:baseline||current.projection,current:current.projection,target:{partId:selection.partId,text:target,replacement},selection,requireFormatting:true};
  const decision=host.inspectScopedEdit(input);check(decision.decision==='proceed','Scoped edit '+decision.decision);report.calls.push({id:id('decision'),actor,helper:'inspectScopedEdit',decision:JSON.parse(JSON.stringify(decision)),baseline:input.baseline,current:input.current});
  const result=await mutation('edit','type_text',{text:replacement},{target,replacement},actor,drop);
  if(drop){await inspect();const recovered=host.inspectUncertainOperation({...input,operation:'edit',intentId:result.intent.id,attempt:{dispatch:'unknown'},access:'available',after:current.projection,afterObservation:observation(),currentEvidenceId:current.readReceipt});check(recovered.decision==='recovered','Lost response recovery');confirmed('edit','type_text',current.snapshot.id,null,[result.rid,current.readReceipt]);persist();scenario('lost-response',{decision:recovered,attempt:result.rid,readReceipt:current.readReceipt,noRetry:true});}
  else check(host.inspectScopedEdit({...input,after:current.projection,afterObservation:observation()}).decision==='confirmed','Scoped readback and formatting');
  return input;
 }
 try{
  const init=await client.rpc('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'fictional-live-acceptance',version:'1'}});check(init.instructions?.includes('connected to the WordCraft app at '+endpoint),'Desktop connection');client.notify('notifications/initialized');report.serverInfo=init.serverInfo;
  const catalog=await client.rpc('tools/list',{});check(!catalog.nextCursor,'Complete catalog');tools=catalog.tools;report.tools=tools;
  record={schema_version:'1.0',sessionId:'fictional-acceptance',connection:{id:'connection',server:init.serverInfo.name,version:init.serverInfo.version||null,mode:'desktop',environmentFingerprint:hash(JSON.stringify([report.environment,tools]))},capabilities:[],bindings:[],snapshots:[],intents:[],receipts:[],checks:[]};
  const initial=(await call('get_text')).text;await call('inspect_document');requireInitialSelection(initial,selected.expectedText);
  check((await call('get_text')).text===selected.expectedText,'Selected original content');originalVerified=true;
  binding={id:'original-fictional-letter',connectionId:'connection',kind:'cover_letter',language:'en',path:selected.selectedArtifact,nativeId:null,currentSnapshotId:null};record.bindings.push(binding);await inspect();await mutation('save','save_document',{path:selected.selectedArtifact},{description:'Preserve explicitly selected original in place'});
  const ui=await call('ui_inspect');report.initialUI=ui;
  const commands=await call('list_commands',{query:'para.style'});report.formatCommands=commands;
  for(const doc of fixture.documents){
   binding={id:'fixture-'+doc.kind,connectionId:'connection',kind:doc.kind==='letter'?'cover_letter':'cv',language:doc.language,path:null,nativeId:null,currentSnapshotId:null};record.bindings.push(binding);current=null;
   await mutation('create','new_document',{},{});await mutation('edit','type_text',{text:doc.text,paragraphs:true},{target:'empty body',replacement:doc.text});check(current.snapshot.text.trimEnd()===doc.text.trimEnd(),'Created fixture content');
   report.calls.push({id:id('ui'),documentId:binding.id,stage:'live-created',ui:await call('ui_inspect')});
   const source=path.join(output,doc.kind+'.docx'),exported=path.join(output,doc.kind+'-export.docx');check(!fs.existsSync(source)&&!fs.existsSync(exported),'Distinct collision-free destinations');
   await mutation('save','save_document',{path:source},{});
   // A discovered paragraph style gives an observable unrelated formatting property.
   const protectedText=doc.text.split('\n').find(t=>t.startsWith('Protected'));
   check(JSON.stringify(commands).includes('para.style'),'Discovered paragraph style command');await select(protectedText);
   await mutation('edit','execute',{command:'para.style',params:{style:'Heading 2'}},{target:protectedText,replacement:protectedText,description:'Controlled unrelated paragraph style via discovered command'});
   const protectedBlock=current.raw.blocks.find(b=>b.text===protectedText);check(protectedBlock?.style==='Heading2','Observable protected paragraph style');
   const baseline=current.projection;
   await scoped(protectedText,protectedText+' '+doc.edit.replacement,undefined,'separate MCP test actor');
   const input=await scoped(doc.edit.target,doc.edit.replacement,baseline,'host',doc.kind==='letter');
   check(host.inspectScopedEdit({...input,after:current.projection,afterObservation:observation()}).decision==='confirmed','Preservation after intervening actor');
   scenario('nonconflict',{documentId:binding.id,baseline:input.baseline,after:current.projection});scenario('formatting',{documentId:binding.id,scope:'inspected block formatting including unrelated Heading 2 paragraph',after:current.projection});
   // The test actor overlaps the target. The host retains its baseline and withholds its pending edit.
   report.calls.push({id:id('ui'),documentId:binding.id,stage:'live-edited',ui:await call('ui_inspect')});
   const conflictBaseline=current.projection,conflictSnapshotId=current.snapshot.id;await scoped(doc.edit.replacement,doc.edit.target,undefined,'separate MCP test actor');
   const conflict=host.inspectScopedEdit({...input,baseline:conflictBaseline,current:current.projection,target:{...input.target,text:doc.edit.replacement,replacement:doc.edit.target},selection:null});check(conflict.decision==='conflict','Overlapping actor edit withheld');
   const conflictIntent={id:id('intent'),documentId:binding.id,baselineSnapshotId:conflictSnapshotId,operation:'edit',target:doc.edit.replacement,context:'Conflicting intervening actor edit; original baseline retained',replacement:doc.edit.target,scope:'withheld conflict',destination:null,format:null};record.intents.push(conflictIntent);receipt('edit',null,{status:'pending',reason:'conflict',intentId:conflictIntent.id,nextAction:'User decision required; no overwrite'});persist();scenario('conflict',{decision:conflict,before:conflictBaseline,after:current.projection});
   const expected=current.snapshot.text;await mutation('save','save_document',{path:source},{});await open(source,expected);
   await mutation('export','save_document',{path:exported},{});await open(exported,expected);
   scenario(doc.kind+'-lifecycle',{documentId:binding.id,source,exported,relationship:'export',snapshotId:current.snapshot.id});
   report.calls.push({id:id('ui'),documentId:binding.id,ui:await call('ui_inspect')});
   // Fault controls are explicit simulated unavailable observations, never fabricated MCP effects.
   const unresolved=host.inspectUncertainOperation({...input,operation:'edit',intentId:conflictIntent.id,attempt:{dispatch:'unknown'},access:'available',after:undefined,afterObservation:observation(),currentEvidenceId:current.readReceipt});check(unresolved.decision==='uncertain','Unresolved control blocks retry');
   receipt('edit',null,{status:'uncertain',intentId:conflictIntent.id,evidenceIds:[],nextAction:'SIMULATED CONTROL: missing inspection; restore read access, no replay'});persist();scenario('unresolved',{decision:unresolved,scope:'simulated missing inspection after unknown dispatch; no live fault asserted'});
   const unavailable=host.inspectCapabilityReport(record,{connection:record.connection,tools:Object.fromEntries(tools.filter(t=>t.name!=='type_text').map(t=>[t.name,hash(JSON.stringify(t.inputSchema))]))});check(unavailable.blocked.includes('edit'),'Missing tool blocker');scenario('missing-tool',{decision:unavailable,scope:'simulated catalog removal through shipped capability helper; no dependent mutation dispatched'});
  }
  scenario('switching',{documents:record.bindings.map(b=>({id:b.id,path:b.path})),scope:'Explicit MCP new/open operations and fresh readback, each prior document saved'});
  // UI inspection proves desktop rendering state only; foreground needs explicit observed evidence.
  if(report.initialUI.focused===true&&report.initialUI.pages?.length&&report.calls.filter(c=>c.documentId&&c.ui).every(c=>c.ui.pages?.length))scenario('visibility',{initialFocused:true,initialTitle:report.initialUI.title,scope:'Actual initial ui_inspect focused flag and rendered page rectangles; per-document UI state captured. Later focus changes respected.'});
  else report.scenarios.find(x=>x.id==='visibility').reason='MCP UI evidence insufficient for initial foreground; explicit observation required.';
 }catch(e){report.error=e.message;report.status='failed';}
 finally{
  if(originalVerified&&tools){try{await call('open_document',{path:selected.selectedArtifact});check((await call('get_text')).text===selected.expectedText,'Original restored');report.originalRestored=true;}catch(e){report.restoreError=e.message;}}
  client.close();report.milestone=acceptanceStatus(report.scenarios,report);report.finishedAt=now();fs.writeFileSync(path.join(output,'acceptance-report.json'),JSON.stringify(report,null,2));
 }
 console.log(JSON.stringify({output,milestone:report.milestone,error:report.error,scenarios:report.scenarios.map(({id,status})=>({id,status}))}));return report;
}
module.exports={run,projectInspection,acceptanceStatus,requireInitialSelection};
