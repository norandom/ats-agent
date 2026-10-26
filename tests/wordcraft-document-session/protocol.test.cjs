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
function edit(input) {
  const source = fs.readFileSync(path.resolve(__dirname, '../../skills/targeted-cv/references/wordcraft-operations.md'), 'utf8');
  const context = vm.createContext({});
  for (const block of source.matchAll(/```javascript\r?\n([\s\S]*?)```/g)) vm.runInContext(block[1], context);
  return context.inspectScopedEdit(input);
}
function editCase() {
  const baseline = {parts:[{id:'body',text:'A fictional draft.',format:'plain'},{id:'footer',text:'Page 1',format:'blue'}]};
  const current = structuredClone(baseline);
  return {...base(), afterObservation:structuredClone(base().observation), baseline, current, target:{partId:'body',text:'draft',replacement:'revision'},
    selection:{partId:'body',start:12,end:17,text:'draft'}, requireFormatting:true};
}
test('scoped edit requires fresh identity and exact inspected selection', () => {
  const input=editCase();assert.equal(edit(input).decision,'proceed');
  input.observation.freshInspection=false;assert.equal(edit(input).decision,'selection');
  input.observation.freshInspection=true;input.selection.start=0;assert.equal(edit(input).decision,'selection');
  delete input.selection;assert.equal(edit(input).decision,'selection');
});
test('duplicate and missing exact targets withhold mutation', () => {
  const input=editCase();input.current.parts[0].text+=' draft';assert.equal(edit(input).decision,'conflict');
  input.current.parts[0].text='A fictional update.';assert.equal(edit(input).decision,'conflict');
  input.baseline.parts[0].text+=' draft';assert.equal(edit(input).decision,'target');
});
test('rebase preserves intervening text and formatting outside the target', () => {
  const input=editCase();input.current.parts[1]={id:'footer',text:'Page 1 of 2',format:'green'};
  const result=edit(input);assert.equal(result.decision,'proceed');assert.equal(result.intervening,true);
  input.after=structuredClone(input.current);input.after.parts[0].text='A fictional revision.';
  assert.equal(edit(input).decision,'confirmed');assert.equal(edit(input).formatting,'passed');
  input.after.parts[1].text='Page 1';assert.equal(edit(input).decision,'conflict');
});
test('overlapping target format changes remain pending', () => {
  const input=editCase();input.current.parts[0].format='bold';assert.equal(edit(input).decision,'conflict');
});
test('read-back detects wrong replacement, out-of-scope text and format drift', () => {
  for (const change of [after=>after.parts[0].text='A fictional draft.', after=>after.parts[0].text='Other revision.', after=>after.parts[1].format='red', after=>after.parts.reverse()]) {
    const input=editCase();input.after=structuredClone(input.current);input.after.parts[0].text='A fictional revision.';change(input.after);
    assert.equal(edit(input).decision,'conflict');
  }
});
test('uninspectable preservation blocks dependent edits and never passes by default', () => {
  const input=editCase();input.current.parts[1].format=null;
  assert.equal(edit(input).decision,'capability');assert.equal(edit(input).formatting,'not_assessed');
  input.requireFormatting=false;assert.equal(edit(input).decision,'proceed');
  input.after=structuredClone(input.current);input.after.parts[0].text='A fictional revision.';
  assert.equal(edit(input).formatting,'not_assessed');
  input.after.parts.pop();assert.equal(edit(input).decision,'conflict');
});
test('same-part nonconflicting additions rebase selection offsets and expected read-back', () => {
  const input=editCase();input.current.parts[0].text='New. A fictional draft.';
  assert.equal(edit(input).decision,'selection');
  input.selection.start+=5;input.selection.end+=5;
  assert.equal(edit(input).decision,'proceed');assert.equal(edit(input).formatting,'not_assessed');
  input.after=structuredClone(input.current);input.after.parts[0].text='New. A fictional revision.';
  assert.equal(edit(input).decision,'confirmed');
});
test('post-edit identity and unavailable read-back cannot confirm the edit', () => {
  const input=editCase();input.after=structuredClone(input.current);input.after.parts[0].text='A fictional revision.';
  input.afterObservation.path='/other.docx';assert.equal(edit(input).decision,'selection');
  input.afterObservation=structuredClone(input.observation);input.after.parts[1].format=null;
  assert.equal(edit(input).decision,'uncertain');assert.equal(edit(input).formatting,'not_assessed');
  input.after={};assert.equal(edit(input).decision,'uncertain');
});
test('malformed or ambiguous part projections and overlapping string matches stop edits', () => {
  const input=editCase();input.current.parts.push({...input.current.parts[0]});
  assert.equal(edit(input).decision,'capability');
  input.current=structuredClone(input.baseline);input.baseline.parts[0].format=null;
  assert.equal(edit(input).decision,'capability');
  input.baseline.parts[0].format='plain';input.target.text='aa';input.baseline.parts[0].text='aaa';
  assert.equal(edit(input).decision,'target');
});
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
