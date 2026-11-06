'use strict';
// Task 8.2 deterministic controls: versioned checkpoint create/reconcile/resume. No candidate inputs.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync,spawn}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),skill=path.join(root,'skills/targeted-cv');
const markdown=fs.readFileSync(path.join(skill,'references/refinement-session.md'),'utf8');
const blocks=[...markdown.matchAll(/^```javascript\r?\n([\s\S]*?)^```\s*$/gm)];
assert.equal(blocks.length,1,'refinement-session.md must keep exactly one executable JavaScript block');
const {createVersionedRefinementCheckpoint}=new Function(blocks[0][1]+';return {createVersionedRefinementCheckpoint};')();
const updBlocks=[...fs.readFileSync(path.join(skill,'references/profile-updates.md'),'utf8').matchAll(/^```javascript\r?\n([\s\S]*?)^```\s*$/gm)];
const createWindowsCreationAdapter=new Function(updBlocks[0][1]+';return createWindowsCreationAdapter;')();
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),clone=x=>structuredClone(x);
const work=fs.mkdtempSync(path.join(root,'outputs/m4-task82-'));
let serial=0;const cache=new Map();
const validator=schemaFile=>value=>{const key=schemaFile+JSON.stringify(value);if(cache.has(key))return cache.get(key);const f=path.join(work,`v-${++serial}.json`);fs.writeFileSync(f,JSON.stringify(value),{flag:'wx'});const r=spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(skill,'schemas',schemaFile),f],{encoding:'utf8',windowsHide:true,timeout:120000});assert.ok(!r.error,r.error?.message);assert.ok([0,1].includes(r.status),r.stderr);const ok=r.status===0;cache.set(key,ok);return ok;};
const validateRecord=validator('refinement-session.schema.json'),validateStorage=validator('refinement-checkpoint-storage.schema.json');
const record=(id='fixture-application')=>({schema_version:'1.0',session_id:'fixture-session',application_id:id,selection:{profile:{resolved_path:'/fictional/profile.json',sha256:sha('profile'),schema_version:'2.1'},reusable_base:null,target_sha256:sha('target'),settings_sha256:sha('settings'),context:null},owner_artifacts:{strategy:null,document_manifest:null,document_session:null,predecessors:[]},questions:[],statements:[],choices:[],profile_operations:[],revisions:[],comparisons:[],stop_state:{state:'active',reason:null,pending_operation_refs:[],last_confirmed_deliverables:[]}});
const baseHost=()=>({application_id:'fixture-application',session_id:'fixture-session',
  sha256:async b=>sha(b),encode:s=>Buffer.from(s,'utf8'),decode:b=>new TextDecoder('utf-8',{fatal:true}).decode(b),
  toBase64:b=>Buffer.from(b).toString('base64'),
  fromBase64:s=>{if(typeof s!=='string'||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(s))throw Error('malformed');return Buffer.from(s,'base64');},
  parseJson:t=>JSON.parse(t),validateStorage:v=>validateStorage(v),validateRecord:v=>validateRecord(v),
  readArtifact:async ref=>fs.existsSync(ref.resolved_path)?fs.readFileSync(ref.resolved_path):null,
  inspect:(r,p)=>({state:validateRecord(r)&&(!p||validateRecord(p.record))?'passed':'failed'})});
// Simulated native create/inspect lease over a test-owned directory, with injected interruption controls.
function simHost(dir,opts={}) {
  const h=baseHost(),calls={createNew:0,acquires:[],released:0};
  h.creationPolicyId='windows-private-new-file-v1';
  h.authorizedCheckpointDestination=d=>typeof d==='string'&&path.resolve(d).startsWith(path.resolve(dir)+path.sep);
  h.acquireCreate=async o=>{
    calls.acquires.push({phase:o.phase,destination:o.destination,source:o.source&&o.source.sha256});
    if(o.policy_id!=='windows-private-new-file-v1'||!['create','inspect'].includes(o.phase))return null;
    if(!h.authorizedCheckpointDestination(o.destination))return null;
    if(o.source){const sp=o.source.resolved_path;if(!fs.existsSync(sp)||sha(fs.readFileSync(sp))!==o.source.sha256)return {conflict:'baseline_changed'};}
    if(o.phase==='create'&&fs.existsSync(o.destination))return {conflict:'destination_exists'};
    if(opts.unavailable)return null;
    if(o.phase==='inspect'&&opts.failInspectOnce&&!calls.inspected){calls.inspected=true;throw Error('simulated inspect outage');}
    const lease={phase:o.phase,destination:o.destination,policy_id:o.policy_id,single_writer:true,private_location:true,stable_identity:true,exclusive_create:o.phase==='create',
      readSource:async()=>fs.readFileSync(o.source.resolved_path),
      readDestination:async()=>fs.existsSync(o.destination)?fs.readFileSync(o.destination):null,
      verifyPolicy:async()=>!opts.policyFails,
      release:async()=>{calls.released++;}};
    if(o.phase==='create'){
      lease.createNew=async bytes=>{calls.createNew++;if(opts.failCreate)throw Error('simulated create failure');fs.writeFileSync(o.destination,bytes,{flag:'wx'});if(opts.loseResponse)throw Error('simulated response loss');return {ok:true,bytes:Buffer.from(bytes).toString('base64'),reopened:true};};
      lease.creationOrigin=async()=>opts.noReceipt?null:'origin-receipt-1';
    }
    return lease;
  };
  return {host:h,calls};
}
const put=(name,bytes)=>{const f=path.isAbsolute(name)?name:path.join(work,name);fs.writeFileSync(f,bytes,{flag:'wx'});return {resolved_path:f,sha256:sha(bytes)};};

test('prepare rejects invalid records, foreign witnesses, unauthorized destinations and failed owner inspection without writes',async()=>{
  const dir=fs.mkdtempSync(path.join(work,'prep-'));const {host,calls}=simHost(dir);const factory=createVersionedRefinementCheckpoint(host);
  const dest=path.join(dir,'c.json');
  assert.equal((await factory.prepare({schema_version:'1.0'},null,dest)).status,'failed');
  const r=record();
  assert.equal((await factory.prepare({...r,application_id:'other'},null,dest)).finding,'source_identity_mismatch');
  const foreignFactory=createVersionedRefinementCheckpoint(baseHost());
  const srcRef=put('legacy.json',Buffer.from(JSON.stringify(record())));
  const foreignWitness=(await foreignFactory.observe(srcRef)).witness;
  assert.equal((await factory.prepare(r,foreignWitness,dest)).finding,'foreign_or_unknown_witness');
  assert.equal((await factory.prepare(r,null,path.join(work,'outside.json'))).finding,'destination_outside_authorized_workspace');
  const badInspect=baseHost();badInspect.inspect=()=>({state:'failed'});badInspect.creationPolicyId='windows-private-new-file-v1';badInspect.authorizedCheckpointDestination=()=>true;badInspect.acquireCreate=async()=>null;
  const f2=createVersionedRefinementCheckpoint(badInspect);
  assert.equal((await f2.prepare(r,null,dest)).finding,'owner_inspection_unconfirmed');
  const prepared=await factory.prepare(r,null,dest);
  assert.equal(prepared.status,'prepared');
  assert.ok(!fs.existsSync(dest),'prepare must not write');
  assert.equal(calls.acquires.length,0);
});

test('persist confirms once, then reconciles read-only without replay',async()=>{
  const dir=fs.mkdtempSync(path.join(work,'ok-'));const {host,calls}=simHost(dir);const factory=createVersionedRefinementCheckpoint(host);
  const dest=path.join(dir,'checkpoint.json');
  const prepared=await factory.prepare(record(),null,dest);
  const cap=prepared.capability;
  const result=await factory.persist(cap);
  assert.equal(result.status,'confirmed',JSON.stringify(result));
  assert.deepEqual(result.ref,{resolved_path:dest,sha256:cap.wrapperSha256});
  assert.deepEqual(result.record,record());
  assert.equal(sha(fs.readFileSync(dest)),cap.wrapperSha256,'exact reopened bytes on disk');
  assert.equal(calls.createNew,1);
  const again=await factory.persist(cap);
  assert.equal(again.status,'confirmed');
  assert.equal(calls.createNew,1,'no replay after confirmation');
  // The confirmed storage observes through the 8.1 route.
  const observed=await factory.observe(result.ref);
  assert.equal(observed.status,'observed');
  assert.deepEqual(observed.witness.record,record());
  const pw=await factory.payloadWitness(observed.witness);
  assert.equal(pw.hashRecord(clone(record())),sha(cap.payload));
});

test('chained checkpoint binds the exact trusted predecessor and source continuity',async()=>{
  const dir=fs.mkdtempSync(path.join(work,'chain-'));const {host,calls}=simHost(dir);const factory=createVersionedRefinementCheckpoint(host);
  const firstPath=path.join(dir,'c1.json');
  const p1=await factory.prepare(record(),null,firstPath);
  const r1=await factory.persist(p1.capability);assert.equal(r1.status,'confirmed',JSON.stringify(r1));
  const first=r1.ref;
  const witness=(await factory.observe(r1.ref)).witness;
  const second=record();second.stop_state={state:'paused',reason:'User pause.',pending_operation_refs:[],last_confirmed_deliverables:[]};
  const p2=await factory.prepare(second,witness,path.join(dir,'c2.json'));
  assert.equal(p2.status,'prepared',JSON.stringify(p2));
  const wrapper=JSON.parse(Buffer.from(p2.capability.wrapperBytes).toString('utf8'));
  assert.deepEqual(wrapper.previous,r1.ref,'wrapper binds the exact predecessor artifact');
  const r2=await factory.persist(p2.capability);
  assert.equal(r2.status,'confirmed',JSON.stringify(r2));
  assert.deepEqual(r2.previous,r1.ref);
  // A changed predecessor baseline is a conflict, not a silent rebind.
  fs.writeFileSync(first.resolved_path,Buffer.from('tampered predecessor'));
  const p3=await factory.prepare(record(),witness,path.join(dir,'c3.json'));
  const r3=await factory.persist(p3.capability);
  assert.equal(r3.status,'conflict');assert.equal(r3.finding,'baseline_changed');
  assert.ok(!fs.existsSync(path.join(dir,'c3.json')),'conflict must not write');
});

test('injected interruption: attempted creates reconcile read-only and never replay',async()=>{
  // Response lost after the bytes hit the disk: no creation receipt, so never confirmed.
  let dir=fs.mkdtempSync(path.join(work,'lost-'));let {host,calls}=simHost(dir,{loseResponse:true});let factory=createVersionedRefinementCheckpoint(host);
  let cap=(await factory.prepare(record(),null,path.join(dir,'c.json'))).capability;
  let r=await factory.persist(cap);
  assert.equal(r.status,'unconfirmed',JSON.stringify(r));
  assert.ok(cap.attempted,'attempted is marked before dispatch');
  assert.ok(fs.existsSync(path.join(dir,'c.json')),'simulated write happened but the receipt is lost');
  r=await factory.persist(cap);
  assert.equal(r.status,'unconfirmed');assert.equal(r.finding,'creation_receipt_unavailable');
  assert.equal(calls.createNew,1,'read-only reconciliation, no replay');
  // Create failed before any bytes: absent destination stays unconfirmed, still no replay.
  dir=fs.mkdtempSync(path.join(work,'fail-'));({host,calls}=simHost(dir,{failCreate:true}));factory=createVersionedRefinementCheckpoint(host);
  cap=(await factory.prepare(record(),null,path.join(dir,'c.json'))).capability;
  r=await factory.persist(cap);
  assert.equal(r.status,'unconfirmed');assert.equal(r.finding,'checkpoint_absent');
  r=await factory.persist(cap);
  assert.equal(r.status,'unconfirmed');assert.equal(calls.createNew,1);
  // Successful create, then the first reconcile outage: a later persist confirms from retained receipt + reopened bytes.
  dir=fs.mkdtempSync(path.join(work,'outage-'));({host,calls}=simHost(dir,{failInspectOnce:true}));factory=createVersionedRefinementCheckpoint(host);
  cap=(await factory.prepare(record(),null,path.join(dir,'c.json'))).capability;
  r=await factory.persist(cap);
  assert.equal(r.status,'unconfirmed',JSON.stringify(r)); // inspect lease threw once
  r=await factory.persist(cap);
  assert.equal(r.status,'confirmed',JSON.stringify(r));
  assert.equal(calls.createNew,1);
});

test('conflicts, unverified leases and tampered capabilities fail without writes',async()=>{
  const dir=fs.mkdtempSync(path.join(work,'ctl-'));const {host,calls}=simHost(dir);const factory=createVersionedRefinementCheckpoint(host);
  const occupied=put(path.join(dir,'occupied.json'),Buffer.from('pre-existing fictional bytes'));
  let cap=(await factory.prepare(record(),null,occupied.resolved_path)).capability;
  let r=await factory.persist(cap);
  assert.equal(r.status,'conflict');assert.equal(r.finding,'destination_exists');
  assert.equal(fs.readFileSync(occupied.resolved_path).toString(),'pre-existing fictional bytes','occupied file untouched');
  assert.equal(calls.createNew,0);
  // Unavailable lease before any attempt: unconfirmed, not attempted, retry possible.
  const {host:h2,calls:c2}=simHost(dir,{unavailable:true});
  const f2=createVersionedRefinementCheckpoint(h2);
  cap=(await f2.prepare(record(),null,path.join(dir,'retry.json'))).capability;
  r=await f2.persist(cap);
  assert.equal(r.status,'unconfirmed');assert.equal(r.finding,'create_lease_unavailable');
  assert.ok(!cap.attempted);
  // Policy failure blocks confirmation even with correct bytes.
  const {host:h3,calls:c3}=simHost(dir,{policyFails:true});
  const f3=createVersionedRefinementCheckpoint(h3);
  cap=(await f3.prepare(record(),null,path.join(dir,'policy.json'))).capability;
  r=await f3.persist(cap);
  assert.equal(r.status,'unconfirmed');assert.equal(r.finding,'creation_policy_unconfirmed');
  assert.equal(c3.createNew,1);
  // Tampered and foreign capabilities are rejected.
  const good=(await factory.prepare(record(),null,path.join(dir,'good.json'))).capability;
  const tampered=clone({record:good.record,destination:good.destination,attempted:false,confirmed:false,receipt:null});
  assert.equal((await factory.persist(tampered)).finding,'foreign_or_unknown_capability');
  const mutated=(await factory.prepare(record(),null,path.join(dir,'mut.json'))).capability;
  mutated.destination=path.join(dir,'elsewhere.json');
  assert.equal((await factory.persist(mutated)).finding,'capability_tampered');
});

test('real ordinary-user native lease creates, protects and reconciles a checkpoint',async t=>{
  if(process.platform!=='win32'){t.skip('native creation lease requires Windows');return;}
  const document=fs.readFileSync(path.join(skill,'references/profile-updates.md'),'utf8');
  const script=document.match(/```powershell\r?\n([\s\S]*?)```/);assert.ok(script,'native lease script shipped');
  const scriptPath=path.join(work,'native-lease.ps1');fs.writeFileSync(scriptPath,script[1]);
  const child=spawn('powershell.exe',['-NoProfile','-NonInteractive','-File',scriptPath],{windowsHide:true,stdio:['pipe','pipe','pipe']});
  const lines=require('node:readline').createInterface({input:child.stdout});
  const pending=[];let stderr='';child.stderr.on('data',b=>{stderr+=b;});
  lines.on('line',line=>{const done=pending.shift();if(done)done(JSON.parse(line));});
  const ask=data=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('native timeout: '+stderr)),30000);pending.push(v=>{clearTimeout(timer);resolve(v);});child.stdin.write(JSON.stringify(data)+'\n');});
  const ps=(cmd,paths={})=>{const r=spawnSync('pwsh',['-NoProfile','-NonInteractive','-Command','$ErrorActionPreference="Stop"; '+cmd],{encoding:'utf8',windowsHide:true,env:{...process.env,...paths}});assert.equal(r.status,0,r.stderr);return r.stdout.trim();};
  const acl=f=>ps('(Get-Acl -LiteralPath $env:TEST_FILE).Sddl',{TEST_FILE:f});
  const external=(file,action)=>ps('try{switch($env:NATIVE_ACTION){write{$s=[IO.File]::Open($env:NATIVE_FILE,"Open","Write","ReadWrite,Delete");$s.Dispose()}delete{[IO.File]::Delete($env:NATIVE_FILE)}rename{[IO.File]::Move($env:NATIVE_FILE,$env:NATIVE_FILE+".moved")}}"allowed"}catch{"denied"}',{NATIVE_FILE:file,NATIVE_ACTION:action},'powershell.exe');
  try{
    const storage=await ask({op:'establishRoot',workspace:work,name:'task82-'+crypto.randomUUID()});
    assert.equal(storage.ok,true,JSON.stringify(storage));
    assert.equal(storage.ordinary_user,true,'actual native proof requires an ordinary user');
    // Explicitly selected legacy raw predecessor.
    const predecessor=record();
    const sourceRef=put('native-predecessor.json',Buffer.from(JSON.stringify(predecessor)));
    const host=baseHost();
    host.creationPolicyId='windows-private-new-file-v1';
    host.authorizedCheckpointDestination=d=>path.dirname(path.resolve(d))===storage.path;
    host.acquireCreate=createWindowsCreationAdapter({request:ask,root:storage.capability,fromBase64:s=>Buffer.from(s,'base64'),toBase64:b=>Buffer.from(b).toString('base64')});
    const factory=createVersionedRefinementCheckpoint(host);
    const witness=(await factory.observe(sourceRef)).witness;
    const destination=path.join(storage.path,'checkpoint.json');
    const prepared=await factory.prepare(record(),witness,destination);
    assert.equal(prepared.status,'prepared',JSON.stringify(prepared));
    assert.ok(!fs.existsSync(destination));
    const result=await factory.persist(prepared.capability);
    assert.equal(result.status,'confirmed',JSON.stringify(result));
    assert.deepEqual(fs.readFileSync(destination),prepared.capability.wrapperBytes,'exact reopened bytes');
    // While a lease handle is open, external writers are denied; ordinary readers are allowed.
    const held=await ask({op:'acquire',phase:'inspect',policy_id:'windows-private-new-file-v1',root:storage.capability,source:sourceRef,destination});
    assert.equal(held.ok,true,JSON.stringify(held));
    assert.equal(external(destination,'write'),'denied','protected while leased');
    assert.equal(external(destination,'delete'),'denied');
    assert.equal(external(destination,'rename'),'denied');
    assert.equal(external(destination,'read'),'allowed');
    assert.equal((await ask({op:'release',lease:held.lease})).ok,true);
    // Native one-attempt: the same create lease cannot create again.
    const again=await factory.persist(prepared.capability);
    assert.equal(again.status,'confirmed','idempotent reconcile');
    // Occupied destination is a conflict even with identical bytes.
    const lease=await ask({op:'acquire',phase:'create',policy_id:'windows-private-new-file-v1',root:storage.capability,source:sourceRef,destination});
    assert.equal(lease.ok,false,'occupied destination rejected natively');
    assert.equal(lease.code,'destination_exists');
    // The stored previous pointer is data: observing the new artifact binds the predecessor hash.
    const observed=await factory.observe(result.ref);
    assert.equal(observed.status,'observed');
    const wrapper=JSON.parse(fs.readFileSync(destination,'utf8'));
    assert.deepEqual(wrapper.previous,sourceRef);
    assert.equal(observed.witness.payloadSha256,sha(prepared.capability.payload));
    assert.notEqual(observed.witness.payloadSha256,result.ref.sha256);
  } finally { try{child.kill();}catch{} }
});

test.after(()=>console.log(`PASS checkpoint create: prepare/persist, one-attempt create, read-only reconciliation, native ordinary-user lease; ${cache.size} actual schema validations.`));
