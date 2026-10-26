const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function decide(input) {
  const source = fs.readFileSync(path.resolve(__dirname, '../../skills/targeted-cv/references/wordcraft-operations.md'), 'utf8');
  const context = vm.createContext({});
  vm.runInContext(source.match(/```javascript\r?\n([\s\S]*?)```/)[1], context);
  return context.inspectDocumentOperation(input);
}
const binding = {id:'fictional-cv', connectionId:'connection', path:'/selected/cv.docx', nativeId:null};
const base = () => ({binding, operation:'save', observation:{connectionId:'connection', nativeId:null, path:null, freshInspection:true, uninterrupted:true, stateContinuity:true, confirmedBindingReceipt:true}, destination:'/selected/cv.docx', destinationState:'source', switching:false, unsaved:'no', discardAuthorized:false});
test('confirmed receipt plus uninterrupted fresh state binds saved document', () => {
  assert.equal(decide(base()).decision, 'proceed');
});
test('text or logical ID alone cannot establish identity; reconnect requires rebind', () => {
  for (const key of ['confirmedBindingReceipt','uninterrupted','stateContinuity','freshInspection']) {
    const input=base(); input.observation[key]=false;
    assert.equal(decide(input).decision,'selection');
  }
  const input=base(); input.observation.connectionId='new';
  assert.equal(decide(input).decision,'selection');
});
test('wrong native path or identifier blocks even when continuity is claimed', () => {
  const input=base(); input.observation.path='/other/cv.docx';
  assert.equal(decide(input).decision,'selection');
  input.observation.path=binding.path; input.binding={...binding,nativeId:'selected'};input.observation.nativeId='other';
  assert.equal(decide(input).decision,'selection');
});
test('new unsaved binding requires confirmed creation and current connection continuity', () => {
  const input=base();input.binding={...binding,path:null}; input.operation='read';
  assert.equal(decide(input).decision,'proceed');
  input.observation.confirmedBindingReceipt=false;
  assert.equal(decide(input).decision,'selection');
});
test('switch preserves unsaved or unknown work until saved or explicit discard decision', () => {
  for(const unsaved of ['yes','unknown']) {
    const input=base();input.switching=true;input.unsaved=unsaved;
    assert.equal(decide(input).decision,'unsaved_work');
    input.discardAuthorized=true;assert.equal(decide(input).decision,'proceed');
  }
});
test('export collisions and unknown destination block; ordinary save stays in place', () => {
  const input=base();input.operation='export';input.destination='/selected/export.docx';
  for(const state of ['exists','unknown','source']) {input.destinationState=state;assert.equal(decide(input).decision,'destination');}
  input.destinationState='absent';assert.equal(decide(input).decision,'proceed');
  input.operation='save';assert.equal(decide(input).decision,'destination');
});
test('confirmed persistence reports artifact source and separate round-trip status', () => {
  const input=base();input.operation='export';input.destination='/selected/export.docx';input.destinationState='absent';
  input.result={status:'success',path:input.destination};input.roundTrip='failed';
  const result=decide(input);assert.equal(result.decision,'confirmed');assert.equal(result.artifact.relationship,'export');
  assert.equal(result.artifact.documentId,binding.id);assert.equal(result.roundTrip,'failed');
  assert.equal(input.binding.path,'/selected/cv.docx');
});
test('unconfirmed save paths, timeouts and dispatched errors never claim success', () => {
  for(const result of [{status:'timeout'}, {status:'error'}, {status:'success'}, {status:'success',path:'/wrong.docx'}]) {
    assert.equal(decide({...base(),result}).decision,'uncertain');
  }
  assert.equal(decide({...base(),result:{status:'rejected_before_dispatch'}}).decision,'failed');
});
test('save does not imply round-trip verification', () => {
  const result=decide({...base(),result:{status:'success',path:binding.path}});
  assert.equal(result.decision,'confirmed');assert.equal(result.roundTrip,'not_assessed');
  assert.equal(result.artifact.relationship,'saved_document');
});
