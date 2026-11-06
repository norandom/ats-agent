'use strict';
// Task 9.2 deterministic controls: closed versioned evidence index/review, explicit chain, decoded-payload references.
// No candidate inputs; fixtures are wholly fictional and stay under ignored outputs/.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const gate=require('./acceptance-check.cjs'),runner=require('./full-acceptance.cjs');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),clone=x=>structuredClone(x);
const work=fs.mkdtempSync(path.join(root,'outputs/m4-task92-'));
const schemaPath=path.join(__dirname,'evidence-index.schema.json');
let serial=0;const cache=new Map();
const schemaValid=value=>{const key=JSON.stringify(value);if(cache.has(key))return cache.get(key);const f=path.join(work,`s-${++serial}.json`);fs.writeFileSync(f,JSON.stringify(value),{flag:'wx'});const r=spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',schemaPath,f],{encoding:'utf8',windowsHide:true,timeout:120000});assert.ok(!r.error,r.error?.message);assert.ok([0,1].includes(r.status),r.stderr);const ok=r.status===0;cache.set(key,ok);return ok;};

const r1=path.join(work,'reusable-root'),r2=path.join(work,'app-root');
fs.mkdirSync(r1);fs.mkdirSync(r2);
const put=(dir,name,value)=>{const f=path.join(dir,name);const bytes=Buffer.from(typeof value==='string'?value:JSON.stringify(value));fs.writeFileSync(f,bytes,{flag:'wx'});return {resolved_path:f,sha256:sha(bytes)};};
const ref=f=>({resolved_path:f.resolved_path,sha256:f.sha256});

const reusable=put(r1,'reusable.json',{schema_version:'2.0',candidate:{id:'fictional-candidate',name:'Fictional Person'}});
const appPath=path.join(r2,'application.json'),appBytes=Buffer.from(JSON.stringify({schema_version:'2.1',candidate:{id:'fictional-candidate',name:'Fictional Person'},application_scope:{application_id:'fictional-app',target_sha256:sha('fictional-target'),origin_profile:{schema_version:'2.0',resolved_path:reusable.resolved_path,sha256:reusable.sha256}}}));
fs.writeFileSync(appPath,appBytes,{flag:'wx'});const app=ref({resolved_path:appPath,sha256:sha(appBytes)});
const strategyPath=path.join(r2,'strategy.json'),manifestPath=path.join(r2,'manifest.json'),finalPath=path.join(r2,'final-report.json');
const binding={application_id:'fictional-app',canonical_sha256:app.sha256,resolved_path:appPath,target_sha256:sha('fictional-target'),settings_sha256:sha('fictional-settings'),profile_version:'2.1',schema_version:'1.2'};
const strategy=put(r2,'strategy.json',{schema_version:'1.2',binding:clone(binding)});
const manifest=put(r2,'manifest.json',{schema_version:'1.2',binding:clone(binding)});
const final=put(r2,'final-report.json',{application_complete:true});
const record=()=>({schema_version:'1.0',session_id:'fictional-session',application_id:'fictional-app',
  selection:{profile:{resolved_path:appPath,sha256:sha(appBytes),schema_version:'2.1'},reusable_base:ref(reusable),target_sha256:sha('fictional-target'),settings_sha256:sha('fictional-settings'),context:null},
  owner_artifacts:{strategy:ref(strategy),document_manifest:ref(manifest),document_session:null,predecessors:[]},
  questions:[],statements:[],choices:[],profile_operations:[],
  revisions:[{id:'rev-1',source_baselines:null,affected_claim_ids:[],predecessor_manifest:null,members:[{kind:'cv',language:'en',manifest_document_id:'cv-en',logical_document_id:'doc-1',intent_ids:[],receipt_refs:[],status:'verified',next_action:null}],verification_refs:[]}],
  comparisons:[],stop_state:{state:'active',reason:null,pending_operation_refs:[],last_confirmed_deliverables:[]}});
const wrapper=(rec,previous)=>{const payload=Buffer.from(JSON.stringify(rec));return {schema_version:'1.0',kind:'refinement-checkpoint-storage',previous,record_utf8_base64:payload.toString('base64'),record_sha256:sha(payload)};};
const c1=put(r2,'c1.json',record()); // legacy raw 1.0 predecessor
const c2=put(r2,'c2.json',wrapper(record(),ref(c1)));
const c3=put(r2,'c3.json',wrapper(record(),ref(c2)));
const receipts={previousReceipt:put(r1,'receipt-a.json',{}),previousReview:put(r1,'review-a.json',{}),currentReceipt:put(r2,'receipt-b.json',{}),currentReview:put(r2,'review-b.json',{}),recoveryReceipt:put(r2,'receipt-c.json',{}),controls:put(r2,'controls.json',{})};
const allFiles=[...fs.readdirSync(r1).map(n=>path.join(r1,n)),...fs.readdirSync(r2).map(n=>path.join(r2,n))].sort();
const files=allFiles.map(f=>({path:f,sha256:sha(fs.readFileSync(f))}));
// Closure = plain-JSON refs (profile origin, strategy/manifest binding, wrapper previous links) plus refs decoded from checkpoint payloads.
const references=[appPath,c1.resolved_path,c2.resolved_path,manifestPath,reusable.resolved_path,strategy.resolved_path].sort();
const index=()=>({schema_version:'1.0',kind:'m4-versioned-evidence-index',inputs:Object.fromEntries(Object.entries(receipts).map(([k,v])=>[k,v.resolved_path])),input_selections:{reusable_profile:ref(reusable),application_profile:ref(app),checkpoint:ref(c3),strategy:ref(strategy),manifest:ref(manifest),final_report:ref(final),checkpoint_chain:[ref(c1),ref(c2)]},roots:[r1,r2],references:clone(references),files:clone(files)});
const digestOf=idx=>sha(JSON.stringify(idx));
const indexFile=path.join(work,'index.json');
fs.writeFileSync(indexFile,JSON.stringify(index()));
const reviewOf=(idx,idxFile)=>({schema_version:'1.0',kind:'m4-versioned-selection-review',reviewer:'fictional reviewer',observation:'Fictional explicit selection review of the exact index.',selected_index:idxFile,index_file_sha256:sha(fs.readFileSync(idxFile)),normalized_index_sha256:digestOf(idx),input_selections:clone(idx.input_selections),selected_roots_reviewed:true,file_hashes_reviewed:idx.files.length,reference_membership_reviewed:idx.references.length});

test('closed versioned index and selection review validate against the shipped schema and verify',()=>{
  const idx=index();assert.ok(schemaValid(idx),'index must satisfy the closed schema');
  const review=reviewOf(idx,indexFile);assert.ok(schemaValid(review),'review must satisfy the closed schema');
  assert.equal(gate.verifyVersionedIndex(idx,digestOf(idx)).state,'passed');
  assert.equal(gate.verifyVersionedIndex(idx,digestOf(idx)).chain,3,'legacy raw predecessor plus two storage versions');
  assert.equal(runner.checkSelectionReview(review,idx,indexFile,digestOf(idx),sha),true);
  // Dispatch: verify() routes the versioned kind to the versioned path (chain break surfaces there).
  const broken=index();broken.input_selections.checkpoint_chain=[ref(c1),ref(c1)];
  fs.writeFileSync(path.join(work,'broken.json'),JSON.stringify(broken));
  assert.throws(()=>gate.verify(path.join(work,'broken.json'),digestOf(broken)),/Duplicate/);
});

test('schema rejects widened kinds, extra keys, relative paths and non-array chains',()=>{
  const idx=index();
  assert.equal(schemaValid({...idx,kind:'m4-evidence-index'}),false,'legacy kind is not this contract');
  assert.equal(schemaValid({...idx,extra:true}),false);
  assert.equal(schemaValid({...idx,input_selections:{...idx.input_selections,checkpoint_chain:{}}}),false);
  assert.equal(schemaValid({...idx,input_selections:{...idx.input_selections,checkpoint:{resolved_path:'relative/c3.json',sha256:c3.sha256}}}),false);
  assert.equal(schemaValid({...idx,schema_version:'2.0'}),false);
  const review=reviewOf(idx,indexFile);
  assert.equal(schemaValid({...review,selected_roots_reviewed:false}),false);
  assert.equal(schemaValid({...review,file_hashes_reviewed:0}),false);
});

test('versioned index rejects changed, missing, foreign, cyclic, substituted and renamed evidence',()=>{
  const base=index(),digest=digestOf(base);
  assert.equal(gate.verifyVersionedIndex(base,digest).state,'passed');
  const reindex=mutate=>{const idx=index();mutate(idx);return {idx,digest:digestOf(idx)};};
  // Changed indexed bytes.
  const changed=reindex(i=>{});fs.appendFileSync(strategy.resolved_path,' ');
  assert.throws(()=>gate.verifyVersionedIndex(changed.idx,changed.digest),/changed/i);
  fs.writeFileSync(strategy.resolved_path,JSON.stringify({schema_version:'1.2',binding}));
  // Omitted inventory row.
  let r=reindex(i=>{i.files.pop();});assert.throws(()=>gate.verifyVersionedIndex(r.idx,r.digest),/membership/);
  // Wrong digest.
  assert.throws(()=>gate.verifyVersionedIndex(base,'0'.repeat(64)),/authentication/);
  // Extra selection key.
  r=reindex(i=>{i.input_selections.latest={...ref(c3)};});assert.throws(()=>gate.verifyVersionedIndex(r.idx,r.digest),/Closed input_selections/);
  // Broken previous link (cyclic predecessor).
  r=reindex(i=>{i.input_selections.checkpoint_chain=[ref(c1),ref(c1)];});assert.throws(()=>gate.verifyVersionedIndex(r.idx,r.digest),/Duplicate/);
  r=reindex(i=>{i.input_selections.checkpoint_chain=[ref(c2),ref(c1)];});assert.throws(()=>gate.verifyVersionedIndex(r.idx,r.digest),/previous link/);
  // Legacy raw predecessor is terminal: a storage baseline followed by a legacy raw is rejected.
  const c0=put(r2,'c0.json',wrapper(record(),null));
  r=reindex(i=>{i.input_selections.checkpoint_chain=[ref(c0),ref(c1)];i.files.push({path:c0.resolved_path,sha256:c0.sha256});});
  assert.throws(()=>gate.verifyVersionedIndex(r.idx,r.digest),/Legacy raw/);
  fs.unlinkSync(c0.resolved_path);
  // Renamed copy of a chain member: same bytes, different path than the previous link binds.
  fs.copyFileSync(c1.resolved_path,path.join(r2,'c1-renamed.json'));
  r=reindex(i=>{i.input_selections.checkpoint_chain=[{resolved_path:path.join(r2,'c1-renamed.json'),sha256:c1.sha256},ref(c2)];i.files.push({path:path.join(r2,'c1-renamed.json'),sha256:c1.sha256});});
  assert.throws(()=>gate.verifyVersionedIndex(r.idx,r.digest),/previous link/);
  fs.unlinkSync(path.join(r2,'c1-renamed.json'));
  // Missing chain file.
  r=reindex(i=>{i.input_selections.checkpoint_chain=[ref(c1),{resolved_path:path.join(r2,'absent.json'),sha256:'1'.repeat(64)}];});
  assert.throws(()=>gate.verifyVersionedIndex(r.idx,r.digest));
  // Foreign current record: rebuilt wrapper with different application_id, strategy binding unchanged.
  const foreign=record();foreign.application_id='other-app';
  const fc=put(r2,'c-foreign.json',wrapper(foreign,ref(c2)));
  r=reindex(i=>{i.input_selections.checkpoint=ref(fc);i.files.push({path:fc.resolved_path,sha256:fc.sha256});});
  assert.throws(()=>gate.verifyVersionedIndex(r.idx,r.digest));
  fs.unlinkSync(fc.resolved_path);
  // Substituted strategy bytes (same selected ref, changed content rehashed into index).
  fs.writeFileSync(strategy.resolved_path,JSON.stringify({schema_version:'1.2',binding:{...binding,application_id:'other-app'}}));
  r=reindex(i=>{i.files=i.files.map(f=>f.path===strategy.resolved_path?{path:f.path,sha256:sha(fs.readFileSync(f.path))}:f);});
  assert.throws(()=>gate.verifyVersionedIndex(r.idx,r.digest));
  fs.writeFileSync(strategy.resolved_path,JSON.stringify({schema_version:'1.2',binding}));
  // Payload reference outside selected roots.
  const outside=record();outside.owner_artifacts.strategy={resolved_path:path.join(work,'outside.json'),sha256:sha('x')};fs.writeFileSync(path.join(work,'outside.json'),'{}');
  const oc=put(r2,'c-outside.json',wrapper(outside,ref(c2)));
  r=reindex(i=>{i.input_selections.checkpoint=ref(oc);i.files.push({path:oc.resolved_path,sha256:oc.sha256});});
  assert.throws(()=>gate.verifyVersionedIndex(r.idx,r.digest),/outside independently selected evidence roots/);
  fs.unlinkSync(oc.resolved_path);fs.unlinkSync(path.join(work,'outside.json'));
  // Omitted decoded-payload reference membership.
  r=reindex(i=>{i.references=i.references.filter(x=>x!==strategy.resolved_path);});
  assert.throws(()=>gate.verifyVersionedIndex(r.idx,r.digest),/reference closure/);
  // Review count tampering.
  const idx=index(),review=reviewOf(idx,indexFile);
  assert.throws(()=>runner.checkSelectionReview({...review,file_hashes_reviewed:review.file_hashes_reviewed-1},idx,indexFile,digestOf(idx),sha),/reviewed files/);
  assert.throws(()=>runner.checkSelectionReview({...review,normalized_index_sha256:'0'.repeat(64)},idx,indexFile,digestOf(idx),sha),/digest/);
  assert.throws(()=>runner.checkSelectionReview({...review,input_selections:{...idx.input_selections,checkpoint:ref(c2)}},idx,indexFile,digestOf(idx),sha),/exact input selections/);
  // Baseline still passes after all mutations were reverted.
  assert.equal(gate.verifyVersionedIndex(index(),digestOf(index())).state,'passed');
});

test.after(()=>console.log(`PASS versioned acceptance: closed index/review schema, explicit chain links, decoded-payload references, tamper rejection; ${cache.size} actual schema validations.`));
