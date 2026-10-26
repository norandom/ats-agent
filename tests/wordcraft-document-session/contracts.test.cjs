const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const schemaPath = path.join(root, 'skills/targeted-cv/schemas/document-session.schema.json');
const referencePath = path.join(root, 'skills/targeted-cv/references/document-session.md');
const time = '2026-10-26T12:00:00Z';
const fp = 'a'.repeat(64);
function fixture() {
  return {schema_version:'1.0', sessionId:'session', connection:{id:'connection', server:'fictional-wordcraft', version:null, mode:'desktop', environmentFingerprint:fp},
    capabilities:[{operation:'read',status:'demonstrated',tool:'get_text',inputSchemaFingerprint:fp,format:'docx',connectionId:'connection',evidenceIds:['receipt']}],
    bindings:[{id:'document',connectionId:'connection',kind:'cv',language:'en',path:null,nativeId:null,currentSnapshotId:'snapshot'}],
    snapshots:[{id:'snapshot',documentId:'document',connectionId:'connection',fingerprint:fp,text:'Fictional example',structure:[],selection:null,observedAt:time}],
    intents:[{id:'intent',documentId:'document',baselineSnapshotId:'snapshot',operation:'edit',target:'Fictional example',context:'body',replacement:'Fictional revision',scope:'body paragraph',destination:null,format:null}],
    receipts:[{id:'receipt',documentId:'document',connectionId:'connection',operation:'read',tool:'get_text',inputSchemaFingerprint:fp,format:'docx',executedAt:time,outcome:{status:'confirmed',value:{documentId:'document',snapshotId:'snapshot',artifact:null},evidenceIds:['receipt']}}],
    checks:[{id:'check',documentId:'document',snapshotId:'snapshot',snapshotFingerprint:fp,producerTool:'get_text',executedAt:time,scope:'body text',kind:'content',status:'passed',freshness:'current',evidenceIds:['receipt'],reason:null}]};
}
function structurallyValid(record) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(),'fictional-session-'));
  try {
    const input = path.join(dir,'record.json'); fs.writeFileSync(input,JSON.stringify(record));
    const result = spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',schemaPath,input],{encoding:'utf8'});
    if(result.error) throw result.error;
    assert.ok(result.status === 0 || /validation errors/.test(result.stdout + result.stderr), result.stdout + result.stderr);
    return result.status === 0;
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
}
function integrity(record) {
  const source = fs.readFileSync(referencePath,'utf8').match(/```javascript\r?\n([\s\S]*?)```/)[1];
  const context = vm.createContext({}); vm.runInContext(source,context);
  return context.inspectSessionIntegrity(record);
}
test('valid fictional contract and actual shipped integrity block',()=>{
  assert.equal(structurallyValid(fixture()),true); assert.equal(integrity(fixture()).length,0);
});
test('closed fields, malformed data, authentication and missing evidence are rejected',()=>{
  for(const change of [r=>r.token='secret',r=>r.connection.authKey='secret',r=>r.snapshots[0].structure=[{token:'secret'}],r=>r.schema_version='2.0',r=>r.checks[0].executedAt='yesterday',r=>r.capabilities[0].evidenceIds=[],r=>r.checks[0].evidenceIds=[],r=>r.receipts[0].outcome.value.artifact={destination:'outputs/example.docx',format:'docx'},r=>r.receipts[0].outcome.status='success']) {
    const record=fixture();change(record);assert.equal(structurallyValid(record),false);
  }
});
test('outcome variants remain distinct and unavailable checks are not assessed',()=>{
  for(const outcome of [{status:'pending',reason:'selection',intentId:'intent',nextAction:'Reselect'}, {status:'uncertain',intentId:'intent',evidenceIds:['receipt'],nextAction:'Inspect'}, {status:'failed',code:'unavailable',message:'No access',evidenceIds:[]}]) {
    const record=fixture();record.receipts[0].outcome=outcome;record.capabilities[0].status='unverified';record.checks=[];
    assert.equal(structurallyValid(record),true);
  }
  const record=fixture();Object.assign(record.checks[0],{status:'not_assessed',producerTool:null,executedAt:null,evidenceIds:[],reason:'Unavailable'});
  assert.equal(structurallyValid(record),true); assert.equal(integrity(record).length,0);
  record.checks[0].status='passed';assert.equal(structurallyValid(record),false);
});
test('integrity rejects duplicate IDs, dangling references, mismatched states and stale claims',()=>{
  for(const change of [r=>r.intents[0].id='snapshot',r=>r.intents[0].baselineSnapshotId='missing',r=>r.snapshots[0].documentId='missing',r=>r.checks[0].snapshotFingerprint='b'.repeat(64),r=>r.bindings[0].currentSnapshotId=null,r=>r.checks[0].evidenceIds=['missing'],r=>r.capabilities[0].inputSchemaFingerprint='b'.repeat(64),r=>r.receipts[0].connectionId='missing',r=>r.checks[0].kind='parser_compatibility']) {
    const record=fixture();change(record);assert.ok(integrity(record).length>0);
  }
});
test('old evidence is retained only with explicit stale freshness',()=>{
  const record=fixture();record.snapshots.push({...record.snapshots[0],id:'new',fingerprint:'b'.repeat(64)});record.bindings[0].currentSnapshotId='new';
  assert.ok(integrity(record).length>0);record.checks[0].freshness='stale';assert.equal(integrity(record).length,0);
});
test('confirmed artifacts preserve document relationship and cannot imply round-trip checks',()=>{
  const record=fixture();record.capabilities=[];record.checks=[];
  const receipt=record.receipts[0];receipt.operation='export';receipt.outcome.value.artifact={documentId:'document',destination:'outputs/fictional.docx',format:'docx',relationship:'export'};
  assert.equal(structurallyValid(record),true);assert.equal(integrity(record).length,0);
  receipt.outcome.value.artifact.documentId='other';assert.ok(integrity(record).length>0);
  receipt.outcome.value.artifact=null;assert.ok(integrity(record).length>0);
});
test('historical connection evidence cannot authorize a new desktop connection',()=>{
  const record=fixture();record.previousConnections=[record.connection];
  record.connection={...record.connection,id:'new-connection',version:'changed'};
  assert.ok(integrity(record).includes('stale_capability_connection'));
  record.capabilities=[];record.checks[0].freshness='stale';assert.equal(integrity(record).length,0);
  assert.equal(structurallyValid(record),true);
});
test('render evidence cannot stand in for extraction or reading-order checks',()=>{
  const record=fixture();record.capabilities=[];record.receipts[0].operation='render';record.receipts[0].tool='render_page';
  record.checks[0].producerTool='render_page';record.checks[0].kind='render';assert.equal(integrity(record).length,0);
  for(const kind of ['reading_order','extraction']) {record.checks[0].kind=kind;assert.ok(integrity(record).length>0);}
});
test('each capability status validates; outcome mixtures and cross-document evidence fail',()=>{
  for(const status of ['demonstrated','failed_or_unsupported','unavailable','unverified']) {
    const record=fixture();record.capabilities[0].status=status;assert.equal(structurallyValid(record),true);
  }
  const record=fixture();record.receipts[0].outcome.intentId='intent';assert.equal(structurallyValid(record),false);
  delete record.receipts[0].outcome.intentId;
  record.bindings.push({...record.bindings[0],id:'other-document',currentSnapshotId:null});
  record.receipts[0].documentId='other-document';assert.ok(integrity(record).length>0);
});
