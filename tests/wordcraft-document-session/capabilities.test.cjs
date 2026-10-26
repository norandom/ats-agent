const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const os = require('node:os');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const reference = path.join(root, 'skills/targeted-cv/references/wordcraft-capabilities.md');
function checker() {
  const context = vm.createContext({});
  for (const file of ['document-session.md', 'wordcraft-capabilities.md']) {
    const text = fs.readFileSync(path.join(path.dirname(reference), file), 'utf8');
    vm.runInContext(text.match(/```javascript\r?\n([\s\S]*?)```/)[1], context);
  }
  return context.inspectCapabilityReport;
}
const fp = 'a'.repeat(64);
function fixture() {
  const mappings = {create:'new_document',open_select:'open_document',read:'get_text',edit:'type_text',save:'save_document',reopen:'open_document',export:'save_document',render:'render_page',extraction:'get_text'};
  const connection = {id:'connection',server:'fictional-wordcraft',version:'0.10.0',mode:'desktop',environmentFingerprint:fp};
  const record = {schema_version:'1.0',sessionId:'session',connection,capabilities:Object.entries(mappings).map(([operation,tool])=>({operation,tool,status:'unverified',inputSchemaFingerprint:fp,format:'docx',connectionId:'connection',evidenceIds:[]})),bindings:[],snapshots:[],intents:[],receipts:[],checks:[]};
  const observation = {connection:{...connection},tools:Object.fromEntries([...Object.values(mappings),'inspect_document','select_text'].map(tool=>[tool,fp]))};
  return {record,observation};
}
function demonstrate(record, operation='read') {
  const cap = record.capabilities.find(c=>c.operation===operation);
  cap.status='demonstrated';cap.evidenceIds=['receipt'];
  record.bindings=[{id:'document',connectionId:'connection',kind:'cv',language:'en',path:null,nativeId:null,currentSnapshotId:null}];
  record.receipts=[{id:'receipt',documentId:'document',connectionId:'connection',operation,tool:cap.tool,inputSchemaFingerprint:fp,format:'docx',executedAt:'2026-10-26T12:00:00Z',outcome:{status:'confirmed',value:{documentId:'document',snapshotId:null,artifact:null},evidenceIds:['receipt']}}];
}
test('catalog presence leaves all nine operations unverified and blocked',()=>{
  const {record,observation}=fixture();const result=checker()(record,observation);
  assert.equal(result.errors.length,0);assert.equal(result.blocked.length,9);
});
test('executed receipt permits only its demonstrated operation',()=>{
  const {record,observation}=fixture();demonstrate(record);
  const result=checker()(record,observation);assert.equal(result.errors.length,0);
  assert.equal(result.blocked.includes('read'),false);assert.equal(result.blocked.length,8);
  record.receipts=[];assert.ok(checker()(record,observation).blocked.includes('read'));
});
test('missing tool blocks dependent work without blocking demonstrated read',()=>{
  const {record,observation}=fixture();demonstrate(record);delete observation.tools.render_page;
  Object.assign(record.capabilities.find(c=>c.operation==='render'),{status:'unavailable',tool:null,inputSchemaFingerprint:null});
  const result=checker()(record,observation);assert.equal(result.errors.length,0);
  assert.ok(result.blocked.includes('render'));assert.equal(result.blocked.includes('read'),false);
  delete observation.tools.get_text;assert.ok(checker()(record,observation).blocked.includes('read'));
});
test('version, executable/catalog fingerprint, mode, connection and schema drift invalidate evidence',()=>{
  for(const change of [o=>o.connection.version='0.11.0',o=>o.connection.environmentFingerprint='b'.repeat(64),o=>o.connection.mode='headless',o=>o.connection.id='reconnected',o=>o.tools.get_text='b'.repeat(64)]) {
    const {record,observation}=fixture();demonstrate(record);change(observation);
    const result=checker()(record,observation);assert.ok(result.errors.length);assert.ok(result.blocked.includes('read'));
  }
});
test('headless evidence never permits desktop work, even with matching connection',()=>{
  const {record,observation}=fixture();demonstrate(record);record.connection.mode=observation.connection.mode='headless';
  assert.equal(checker()(record,observation).blocked.length,9);
});
test('failed, unavailable and unverified remain distinct; complete report and mapped tools required',()=>{
  const {record,observation}=fixture();record.capabilities[0].status='failed_or_unsupported';
  assert.equal(checker()(record,observation).errors.length,0);
  record.capabilities.pop();assert.ok(checker()(record,observation).errors.includes('missing:extraction'));
  demonstrate(record);record.capabilities.find(c=>c.operation==='read').tool='render_page';
  assert.ok(checker()(record,observation).blocked.includes('read'));
});
test('fictional capability report conforms to the shipped closed schema',()=>{
  const {record}=fixture();demonstrate(record);
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fictional-capabilities-'));
  try {
    const input=path.join(dir,'record.json');fs.writeFileSync(input,JSON.stringify(record));
    const result=spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(root,'skills/targeted-cv/schemas/document-session.schema.json'),input],{encoding:'utf8'});
    if(result.error) throw result.error;
    assert.equal(result.status,0,result.stdout+result.stderr);
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
