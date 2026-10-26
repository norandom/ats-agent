// Scripted host observations only: these tests are not actual MCP receipts.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '../..');
fs.mkdirSync(path.join(root,'outputs'),{recursive:true});
const dir = fs.mkdtempSync(path.join(root, 'outputs/fictional-session-integration-'));
const file = path.join(dir, 'record.json');
const fp = 'a'.repeat(64), time = '2026-10-26T12:00:00Z';
const host = vm.createContext({});
for (const name of ['document-session', 'wordcraft-capabilities', 'wordcraft-operations']) {
  const text = fs.readFileSync(path.join(root, `skills/targeted-cv/references/${name}.md`), 'utf8');
  for (const block of text.matchAll(/```javascript\r?\n([\s\S]*?)```/g)) vm.runInContext(block[1], host);
}
function fixture() {
  const mappings = {create:'new_document',open_select:'open_document',read:'get_text',edit:'type_text',save:'save_document',reopen:'open_document',export:'save_document',render:'render_page',extraction:'get_text'};
  const connection = {id:'connection',server:'fictional-wordcraft',version:'0.10.0',mode:'desktop',environmentFingerprint:fp};
  const binding = {id:'cv-en',connectionId:'connection',kind:'cv',language:'en',path:'/fictional/cv.docx',nativeId:null,currentSnapshotId:'baseline'};
  const record = {schema_version:'1.0',sessionId:'fictional-integration',connection,capabilities:[],bindings:[binding],snapshots:[{id:'baseline',documentId:binding.id,connectionId:connection.id,fingerprint:fp,text:'A fictional draft.',structure:[],selection:null,observedAt:time}],intents:[],receipts:[],checks:[]};
  for (const [operation,tool] of Object.entries(mappings)) {
    const id = `proof-${operation}`;
    record.capabilities.push({operation,tool,status:'demonstrated',inputSchemaFingerprint:fp,format:'docx',connectionId:connection.id,evidenceIds:[id]});
    record.receipts.push({id,documentId:binding.id,connectionId:connection.id,operation,tool,inputSchemaFingerprint:fp,format:'docx',executedAt:time,outcome:{status:'confirmed',value:{documentId:binding.id,snapshotId:'baseline',artifact:['save','export'].includes(operation)?{documentId:binding.id,destination:'/fictional/cv.docx',format:'docx',relationship:operation==='save'?'saved_document':'export'}:null},evidenceIds:[id]}});
  }
  const intent={id:'change',documentId:binding.id,baselineSnapshotId:'baseline',operation:'edit',target:'draft',context:'body',replacement:'revision',scope:'body word',destination:null,format:null};
  record.intents.push(intent);
  record.checks.push({id:'old-check',documentId:binding.id,snapshotId:'baseline',snapshotFingerprint:fp,producerTool:'get_text',executedAt:time,scope:'body',kind:'content',status:'passed',freshness:'current',evidenceIds:['proof-read'],reason:null});
  const observation={connection:{...connection},tools:Object.fromEntries([...Object.values(mappings),'inspect_document','select_text'].map(t=>[t,fp]))};
  const identity={connectionId:connection.id,path:binding.path,nativeId:null,freshInspection:true,uninterrupted:true,stateContinuity:true,confirmedBindingReceipt:true};
  const current={parts:[{id:'body',text:'A fictional draft.',format:'plain'}]};
  const edit={binding,observation:identity,baseline:structuredClone(current),current,target:{partId:'body',text:'draft',replacement:'revision'},selection:{partId:'body',start:12,end:17,text:'draft'},requireFormatting:true};
  return {record,observation,intent,edit};
}
function validate(record) {
  fs.mkdirSync(dir,{recursive:true});
  const input=path.join(dir,'validate.json');fs.writeFileSync(input,JSON.stringify(record));
  const result=spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(root,'skills/targeted-cv/schemas/document-session.schema.json'),input],{encoding:'utf8'});
  assert.equal(result.status,0,result.stdout+result.stderr);
  assert.equal(host.inspectSessionIntegrity(record).length,0);
}
function persist(record,trace) {
  validate(record);
  fs.writeFileSync(file,JSON.stringify(record));
  const read=JSON.parse(fs.readFileSync(file,'utf8'));
  assert.deepEqual(read,record);trace.push('persist-readback');return read;
}
function gate(f,persistedRecord,extra={}) {
  return host.inspectSessionDispatch({record:f.record,observation:f.observation,intentId:f.intent.id,persistedRecord,
    operationDecision:host.inspectScopedEdit(f.edit).decision,requestDocumentId:f.intent.documentId,requestLanguage:'en',...extra});
}
function receipt(f,outcome,id='attempt') {
  return {id,documentId:f.intent.documentId,connectionId:f.record.connection.id,operation:f.intent.operation,
    tool:outcome.status==='pending'?null:'type_text',inputSchemaFingerprint:outcome.status==='pending'?null:fp,format:'docx',executedAt:outcome.status==='pending'?null:time,outcome};
}
test.after(()=> {for(const name of ['record.json','validate.json']) {const p=path.join(dir,name);if(fs.existsSync(p))fs.unlinkSync(p);} if(fs.existsSync(dir))fs.rmdirSync(dir);});

test('fictional end-to-end host trace persists pending then confirmed outcome; stale checks stay stale',()=>{
  const f=fixture(),trace=[];
  const ignored=spawnSync('git',['check-ignore',file],{cwd:root,encoding:'utf8'});assert.equal(ignored.status,0);
  f.record.receipts.push(receipt(f,{status:'pending',reason:'selection',intentId:'change',nextAction:'Inspect target'},'pending'));
  const persisted=persist(f.record,trace);
  assert.equal(gate(f,persisted).decision,'dispatch');trace.push('scripted-mutation');
  f.edit.after=structuredClone(f.edit.current);f.edit.after.parts[0].text='A fictional revision.';f.edit.afterObservation=f.edit.observation;
  assert.equal(host.inspectScopedEdit(f.edit).decision,'confirmed');trace.push('scripted-readback');
  f.record.snapshots.push({...f.record.snapshots[0],id:'after',fingerprint:'b'.repeat(64),text:'A fictional revision.'});
  f.record.bindings[0].currentSnapshotId='after';f.record.checks[0].freshness='stale';
  f.record.receipts.push(receipt(f,{status:'confirmed',value:{documentId:'cv-en',snapshotId:'after',artifact:null},evidenceIds:['attempt']}));
  const saved=persist(f.record,trace);assert.equal(saved.receipts.at(-1).outcome.status,'confirmed');
  assert.equal(saved.receipts.find(r=>r.id==='pending').outcome.status,'pending');
  assert.deepEqual(trace,['persist-readback','scripted-mutation','scripted-readback','persist-readback']);
});
test('failed actual private persistence withholds dispatch for every mutation',()=>{
  fs.mkdirSync(dir,{recursive:true});
  for(const operation of ['create','edit','save','export']) {
    const f=fixture();f.intent.operation=operation;
    if(['save','export'].includes(operation)){f.intent.destination='/fictional/result.docx';f.intent.format='docx';}
    let persisted=null,writes=0;
    assert.throws(()=>{fs.writeFileSync(dir,JSON.stringify(f.record));persisted=f.record;});
    if(gate(f,persisted).decision==='dispatch')writes++;
    assert.equal(writes,0);
  }
});
test('gate rejects stale persistence, wrong operation decision, wrong document/language and missing capabilities',()=>{
  const f=fixture();const saved=persist(f.record,[]);
  f.intent.replacement='different';assert.equal(gate(f,saved).decision,'persist');f.intent.replacement='revision';
  for(const extra of [{operationDecision:'conflict'},{requestDocumentId:'letter-de'},{requestLanguage:'de'}])assert.notEqual(gate(f,saved,extra).decision,'dispatch');
  f.record.capabilities.find(c=>c.operation==='read').status='unavailable';
  const blocked=persist(f.record,[]);assert.equal(gate(f,blocked).decision,'capability');
  assert.ok(gate(f,blocked).blocked.includes('read'));
});
test('resume loads private intent, rebinds and freshly inspects before editing; no stored action replay',()=>{
  const f=fixture(),trace=[];persist(f.record,[]);
  f.record=JSON.parse(fs.readFileSync(file,'utf8'));trace.push('load-intent');f.intent=f.record.intents[0];
  f.edit.observation={...f.edit.observation,freshInspection:false};
  assert.equal(gate(f,f.record).decision,'selection');
  trace.push('scripted-rebind');f.edit.observation={...f.edit.observation,freshInspection:true};
  trace.push('scripted-fresh-inspection');
  const recovery=host.inspectUncertainOperation({...f.edit,operation:'edit',intentId:f.intent.id,access:'available',attempt:{dispatch:'unknown'},after:structuredClone(f.edit.current),afterObservation:f.edit.observation,currentEvidenceId:'proof-read'});
  assert.equal(recovery.decision,'revalidate');trace.push('absence-and-authorization-revalidated');
  f.record.snapshots.push({...f.record.snapshots[0],id:'resume-current'});f.record.bindings[0].currentSnapshotId='resume-current';f.record.checks[0].freshness='stale';
  f.intent={...f.intent,id:'resumed-change',baselineSnapshotId:'resume-current',context:'body; renewed authorization after inspection of original change'};f.record.intents.push(f.intent);
  const saved=persist(f.record,trace);assert.equal(gate(f,saved).decision,'dispatch');trace.push('scripted-mutation');
  assert.deepEqual(trace,['load-intent','scripted-rebind','scripted-fresh-inspection','absence-and-authorization-revalidated','persist-readback','scripted-mutation']);
});
test('uncertain attempt is retained and cannot be replayed by a subsequent session request',()=>{
  const f=fixture();f.record.receipts.push(receipt(f,{status:'uncertain',intentId:'change',evidenceIds:[],nextAction:'Restore and inspect'}));
  const saved=persist(f.record,[]);assert.equal(gate(f,saved).decision,'reconcile');
  f.observation.tools={};assert.notEqual(gate(f,saved).decision,'dispatch');
  assert.equal(JSON.parse(fs.readFileSync(file,'utf8')).receipts.at(-1).outcome.status,'uncertain');
});
test('complete records validate every outcome variant and reject mismatching receipt operation',()=>{
  for(const outcome of [{status:'confirmed',value:{documentId:'cv-en',snapshotId:'baseline',artifact:null},evidenceIds:['attempt']},
    ...['selection','conflict','capability'].map(reason=>({status:'pending',reason,intentId:'change',nextAction:'Resolve'})),
    {status:'uncertain',intentId:'change',evidenceIds:[],nextAction:'Inspect'},
    {status:'failed',code:'pre_dispatch',message:'Private persistence failed; no dispatch',evidenceIds:[]}]) {
    const f=fixture();f.record.receipts.push(receipt(f,outcome));validate(f.record);
    if(outcome.intentId){f.record.receipts.at(-1).operation='save';assert.ok(host.inspectSessionIntegrity(f.record).includes('intent_receipt_mismatch'));}
  }
});
test('switch preserves unsaved work and requires fresh selected document; correction routing remains upstream',()=>{
  const f=fixture();
  const input={binding:f.edit.binding,observation:f.edit.observation,operation:'read',switching:true,unsaved:'yes',discardAuthorized:false};
  assert.equal(host.inspectDocumentOperation(input).decision,'unsaved_work');
  input.unsaved='no';assert.equal(host.inspectDocumentOperation(input).decision,'proceed');
  const saved=persist(f.record,[]);assert.equal(gate(f,saved,{requestLanguage:'de'}).decision,'selection');
  const letter={...f.edit.binding,id:'letter-de',kind:'cover_letter',language:'de',path:'/fictional/letter.docx',currentSnapshotId:'letter-baseline'};
  f.record.bindings.push(letter);f.record.snapshots.push({...f.record.snapshots[0],id:'letter-baseline',documentId:letter.id});
  f.intent={...f.intent,id:'letter-change',documentId:letter.id,baselineSnapshotId:'letter-baseline'};f.record.intents.push(f.intent);
  f.edit.binding=letter;assert.equal(gate(f,persist(f.record,[]),{requestLanguage:'de'}).decision,'selection');
  f.edit.observation={...f.edit.observation,path:letter.path};
  assert.equal(gate(f,persist(f.record,[]),{requestLanguage:'de'}).decision,'dispatch');
  const source=fs.readFileSync(path.join(root,'skills/targeted-cv/references/document-session.md'),'utf8');
  assert.match(source,/factual corrections[\s\S]*owning application workflow/i);
});
