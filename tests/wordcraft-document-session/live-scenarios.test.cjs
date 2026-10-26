const test=require('node:test'),assert=require('node:assert/strict');
const {projectInspection, acceptanceStatus, requireInitialSelection}=require('./live-scenarios.cjs');
test('initial selection rejects blank or different text without opening or discarding it',()=>{
 const expected='Explicit fictional saved document';
 assert.doesNotThrow(()=>requireInitialSelection(expected,expected));
 for(const observed of ['', '  \n', 'Another fictional document'])
  assert.throws(()=>requireInitialSelection(observed,expected),/Initial selected document mismatch/);
});
test('inspection projection refuses invented part identity and preserves inspected formatting',()=>{
 assert.throws(()=>projectInspection({blocks:[{text:'x'}]}));
 const p=projectInspection({blocks:[{index:0,text:'x',style:'Normal',runs:[{bold:true}]}],sections:[]});
 assert.equal(p.parts[0].id,'body:0');assert.match(p.parts[0].format,/bold/);
});
test('missing, failed, or simulated lifecycle cases cannot accept live suite',()=>{
 assert.equal(acceptanceStatus([]),'pending');
 assert.equal(acceptanceStatus([{id:'cv-lifecycle',status:'passed',evidenceKind:'simulated_control'}]),'pending');
});
