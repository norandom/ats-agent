'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const observer=require('../../release/observe.cjs');
const {validateRecord}=require('../../release/candidate-definition.cjs');
function fixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'m5-observe-'));t.after(()=>{assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(root,{recursive:true,force:true});});
 const installed=path.join(root,'installed'),evidence=path.join(root,'private');fs.mkdirSync(installed);fs.mkdirSync(evidence);fs.mkdirSync(path.join(installed,'references'));
 fs.writeFileSync(path.join(installed,'SKILL.md'),'fictional installed entry');
 fs.copyFileSync(path.resolve('skills/targeted-cv/references/profile-contract.md'),path.join(installed,'references/profile-contract.md'));
 fs.writeFileSync(path.join(evidence,'archive.zip'),'fictional archive identity only');
 fs.writeFileSync(path.join(evidence,'facts.json'),'{}');fs.writeFileSync(path.join(evidence,'settings.json'),'{}');fs.writeFileSync(path.join(evidence,'state.json'),'{}');
 return {root,installed,evidence,selection:{installed_root:installed,evidence_root:evidence,artifact:'archive.zip',applicants:[{id:'fictional-a',facts:'facts.json',settings:'settings.json',state:'state.json'}]}};
}
test('collects actual installed bytes and restricted owner execution with partial acceptance unassessed',async t=>{
 const f=fixture(t);const result=await observer.observeInstalled(f.selection,async session=>{
  assert.equal(session.readResource('SKILL.md').toString(),'fictional installed entry');
  const dispatch=session.loadOwner('references/profile-contract.md','dispatchVersion');assert.equal(dispatch({schema_version:'2.0'}).status,'current');
 });
 assert.equal(result.status,'passed');assert.equal(result.value.kind,'installed-observation');assert.deepEqual(result.value.before,result.value.after);
 assert.equal(result.value.resource_reads.length,2);assert.equal(result.value.workflow_status,'not_assessed');assert.equal(result.value.transport.status,'not_assessed');
 assert.equal(validateRecord(result.value).status,'passed');
 const bad=structuredClone(result.value);bad.release_ready=true;assert.equal(validateRecord(bad).status,'failed');
});
test('captures live discovery, identity and explicit operations without converting response booleans to proof',async t=>{
 const f=fixture(t);let calls=0;const result=await observer.observeInstalled(f.selection,async s=>{
  await s.transport.discover();await s.transport.identity();await s.transport.call('read_document',{id:'fictional-document'});
 },{transport:{discover:async()=>({tools:[{name:'read_document'}]}),identity:async()=>({document_id:'fictional-document'}),call:async()=>{calls++;return {success:true};}}});
 assert.equal(calls,1);assert.equal(result.status,'passed');assert.equal(result.value.transport.status,'observed');assert.equal(result.value.operations.length,6);
 assert.equal(result.value.workflow_status,'not_assessed');for(const ref of result.value.operations){const event=JSON.parse(fs.readFileSync(path.join(f.evidence,ref.path)));assert.equal(event.kind,'installed-transport-event');assert.equal(validateRecord(event).status,'passed');for(const payload of [event.request,event.response].filter(Boolean))assert.ok(fs.existsSync(path.join(f.evidence,payload.path)));}
});
test('missing discovery blocks explicit calls and preserves pending work',async t=>{
 const f=fixture(t);let calls=0;const result=await observer.observeInstalled(f.selection,async s=>assert.equal((await s.transport.call('write_document',{})).status,'not_assessed'),{transport:{call:async()=>calls++}});
 assert.equal(result.status,'passed');assert.equal(calls,0);assert.equal(result.value.transport.status,'not_assessed');assert.equal(fs.readFileSync(path.join(f.evidence,'state.json'),'utf8'),'{}');
});
test('rejects escaping/redirected reads, unknown selection fields and modified installations',async t=>{
 const f=fixture(t);assert.equal((await observer.observeInstalled({...f.selection,ready:true},async()=>{})).status,'failed');
 assert.equal((await observer.observeInstalled(f.selection,async s=>s.readResource('../private/facts.json'))).status,'failed');
 assert.equal((await observer.observeInstalled(f.selection,async()=>fs.appendFileSync(path.join(f.installed,'SKILL.md'),'changed'))).status,'failed');
});
test('hashes explicitly selected receipt files without interpreting authority or copying expected prose',async t=>{
 const f=fixture(t);fs.writeFileSync(path.join(f.evidence,'receipt.json'),JSON.stringify({confirmed:true}));
 const result=await observer.observeInstalled(f.selection,async s=>s.capture('owner_receipts','receipt.json'));
 assert.equal(result.status,'passed');assert.equal(result.value.owner_receipts.length,1);assert.equal(result.value.workflow_status,'not_assessed');
 assert.equal((await observer.observeInstalled(f.selection,async s=>s.capture('owner_receipts','../installed/SKILL.md'))).status,'failed');
});
test('trusted adapters defer missing guarantees and delegate actual lease and exact decision',async()=>{
 const absent=observer.createHostAdapters();assert.equal(await absent.acquirePersistence('/fictional'),null);assert.equal(await absent.userDecision({proposal_id:'p'}),null);
 let released=0;const lease={single_writer:true,private_location:true,security_preserving_replace:true,read(){},stage(){},readStage(){},backup(){},readBackup(){},replace(){},verifySecurity(){},cleanupStage(){},release(){released++;}};
 const incomplete=observer.createHostAdapters({acquirePersistence:async()=>({...lease,replace:undefined})});assert.equal(await incomplete.acquirePersistence('/fictional'),null);assert.equal(released,1);
 const envelope={proposal_id:'p',resolved_path:'/fictional'};const host=observer.createHostAdapters({acquirePersistence:async()=>lease,userDecision:async e=>({decision:'approved',reviewed:structuredClone(e),authorization:{id:'auth'}})});
 assert.equal(await host.acquirePersistence('/fictional'),lease);assert.deepEqual((await host.userDecision(envelope)).reviewed,envelope);
 assert.equal(await observer.createHostAdapters({userDecision:async()=>({decision:'approved',reviewed:{},authorization:{}})}).userDecision(envelope),null);
});
test('failed rediscovery invalidates previously observed capability and identity',async t=>{
 const f=fixture(t);let discoveries=0,calls=0;
 const result=await observer.observeInstalled(f.selection,async s=>{
  await s.transport.discover();await s.transport.identity();await s.transport.discover();
  assert.equal((await s.transport.call('write_document',{})).status,'not_assessed');
 },{transport:{discover:async()=>++discoveries===1?{tools:[{name:'write_document'}]}:null,identity:async()=>({document_id:'fictional'}),call:async()=>{calls++;return {};}}});
 assert.equal(result.status,'passed');assert.equal(calls,0);assert.equal(result.value.transport.status,'not_assessed');
});
test('checkpoint adapters honor initial exclusive-create and stable selected identity',async()=>{
 const lease={resolved_path:'/fictional/checkpoint',single_writer:true,private_location:true,stable_identity:true,exclusive_create:true,read(){return null;},create(){},verifySecurity(){},release(){}};
 const host=observer.createHostAdapters({acquireCheckpoint:async()=>lease});assert.equal(await host.acquireCheckpoint('/fictional/checkpoint'),lease);
 assert.equal(await host.acquireCheckpoint('/fictional/other'),null);
});
test('missing probes, owner imports and redirected private evidence never establish assessed capabilities',async t=>{
 const f=fixture(t);let result=await observer.observeInstalled(f.selection,async()=>{}, {host:async()=>({name:'fictional-host',version:'1',platform:process.platform,connection:'fictional-control'}),prerequisites:[{id:'validator',probe:async()=>{throw Error('unavailable');}}]});
 assert.equal(result.status,'passed');assert.equal(result.value.prerequisites[0].status,'not_assessed');assert.equal(result.value.prerequisites[0].version,null);
 assert.equal((await observer.observeInstalled(f.selection,async s=>s.loadOwner('references/profile-contract.md','require'))).status,'failed');
 const link=path.join(f.evidence,'linked.json');try{fs.symlinkSync(path.join(f.evidence,'facts.json'),link);}catch(e){if(e.code==='EPERM'){t.diagnostic('OS denies symlink creation; hardlink control remains exercised.');}else throw e;}
 if(fs.existsSync(link))assert.equal((await observer.observeInstalled(f.selection,async s=>s.capture('owner_receipts','linked.json'))).status,'failed');
 fs.linkSync(path.join(f.evidence,'settings.json'),path.join(f.evidence,'hardlink.json'));assert.equal((await observer.observeInstalled(f.selection,async s=>s.capture('owner_receipts','hardlink.json'))).status,'failed');
});
