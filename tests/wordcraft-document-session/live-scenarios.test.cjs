const test=require('node:test'),assert=require('node:assert/strict');
const {projectInspection, acceptanceStatus, requireInitialSelection}=require('./live-scenarios.cjs');
test('explicit foreground observation requires provenance, recency and selected artifact scope',()=>{
 const {validateForegroundObservation}=require('./live-scenarios.cjs');
 const now=Date.parse('2026-10-26T16:00:00Z'),value={source:'explicit_user',response:'ready',prompt:'Bring the existing WordCraft window to the foreground',observedAt:'2026-10-26T15:59:00Z',selectedArtifact:'/fictional/original.docx',scope:'initial foreground only'};
 assert.deepEqual(validateForegroundObservation(value,value.selectedArtifact,now),value);
 for(const change of [{source:'simulated'},{response:''},{prompt:''},{observedAt:'2026-10-26T15:00:00Z'},{observedAt:'invalid'},{selectedArtifact:'/other.docx'},{scope:'all documents'}])assert.throws(()=>validateForegroundObservation({...value,...change},value.selectedArtifact,now));
});
test('environment identity follows shipped canonical formula and includes both executables and used commands',()=>{
 const {environmentIdentity}=require('./live-scenarios.cjs'),crypto=require('node:crypto');
 const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
 const input={server:'wordcraft',version:'0.10.0',mode:'desktop',desktopExecutableSha256:'a'.repeat(64),cliExecutableSha256:'b'.repeat(64),tools:[{name:'z',inputSchema:{type:'object'}},{name:'a',inputSchema:{required:['x']}}],commands:[{id:'para.style',params:'{"style": string}'}]};
 const expected=[['a',hash(JSON.stringify(input.tools[1].inputSchema))],['command:para.style',hash(input.commands[0].params)],['z',hash(JSON.stringify(input.tools[0].inputSchema))]];
 assert.deepEqual(environmentIdentity(input),{catalogPairs:expected,fingerprint:hash(JSON.stringify([input.server,input.version,input.mode,input.desktopExecutableSha256,input.cliExecutableSha256,expected]))});
 const original=environmentIdentity(input).fingerprint;
 for(const update of [{desktopExecutableSha256:'c'.repeat(64)},{cliExecutableSha256:'d'.repeat(64)},{commands:[{id:'para.style',params:'different'}]},{tools:[{name:'a',inputSchema:{}}]}])assert.notEqual(environmentIdentity({...input,...update}).fingerprint,original);
 assert.throws(()=>environmentIdentity({...input,desktopExecutableSha256:null}));
 assert.throws(()=>environmentIdentity({...input,commands:[{id:'para.style'}]}));
});
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

test('complete cases cannot hide restoration failure or a run error',()=>{
 const cases=['cv-lifecycle','letter-lifecycle','nonconflict','conflict','formatting','lost-response','unresolved','missing-tool','switching','visibility'].map(id=>({id,status:'passed',evidenceKind:['unresolved','missing-tool'].includes(id)?'simulated_control':'actual_mcp'}));
 assert.equal(acceptanceStatus(cases,{originalRestored:true}),'passed');
 for(const state of [{},{originalRestored:false},{originalRestored:true,restoreError:'failed'},{originalRestored:true,error:'failed'}]) assert.equal(acceptanceStatus(cases,state),'pending');
 assert.equal(acceptanceStatus([...cases,cases[0]],{originalRestored:true}),'pending');
});
