'use strict';
// Task 8.1 deterministic controls: versioned checkpoint storage observation only. No candidate inputs; the factory performs no file writes.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),skill=path.join(root,'skills/targeted-cv');
const markdown=fs.readFileSync(path.join(skill,'references/refinement-session.md'),'utf8');
const blocks=[...markdown.matchAll(/^```javascript\r?\n([\s\S]*?)^```\s*$/gm)];
assert.equal(blocks.length,1,'refinement-session.md must keep exactly one executable JavaScript block');
const {createVersionedRefinementCheckpoint,createRefinementCheckpoint,inspectRefinement}=new Function(blocks[0][1]+';return {createVersionedRefinementCheckpoint,createRefinementCheckpoint,inspectRefinement};')();
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),clone=x=>structuredClone(x);
const work=fs.mkdtempSync(path.join(root,'outputs/m4-task81-'));
let serial=0;const cache=new Map();
const validator=schemaFile=>value=>{const key=schemaFile+JSON.stringify(value);if(cache.has(key))return cache.get(key);const f=path.join(work,`v-${++serial}.json`);fs.writeFileSync(f,JSON.stringify(value),{flag:'wx'});const r=spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(skill,'schemas',schemaFile),f],{encoding:'utf8',windowsHide:true,timeout:120000});assert.ok(!r.error,r.error?.message);assert.ok([0,1].includes(r.status),r.stderr);const ok=r.status===0;cache.set(key,ok);return ok;};
const validateRecord=validator('refinement-session.schema.json'),validateStorage=validator('refinement-checkpoint-storage.schema.json');
const record=()=>({schema_version:'1.0',session_id:'fixture-session',application_id:'fixture-application',selection:{profile:{resolved_path:'/fictional/profile.json',sha256:sha('profile'),schema_version:'2.1'},reusable_base:null,target_sha256:sha('target'),settings_sha256:sha('settings'),context:null},owner_artifacts:{strategy:null,document_manifest:null,document_session:null,predecessors:[]},questions:[],statements:[],choices:[],profile_operations:[],revisions:[],comparisons:[],stop_state:{state:'active',reason:null,pending_operation_refs:[],last_confirmed_deliverables:[]}});
const readOnlyCalls=['readArtifact','sha256','decode','encode','toBase64','fromBase64','parseJson','validateStorage','validateRecord'];
function makeHost(){const calls=[];const host={
  application_id:'fixture-application',session_id:'fixture-session',
  sha256:async b=>{calls.push('sha256');return sha(b);},
  encode:s=>{calls.push('encode');return Buffer.from(s,'utf8');},
  decode:b=>{calls.push('decode');return new TextDecoder('utf-8',{fatal:true}).decode(b);},
  toBase64:b=>{calls.push('toBase64');return Buffer.from(b).toString('base64');},
  fromBase64:s=>{calls.push('fromBase64');if(typeof s!=='string'||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(s))throw Error('malformed base64');return Buffer.from(s,'base64');},
  parseJson:t=>{calls.push('parseJson');return JSON.parse(t);},
  validateStorage:v=>{calls.push('validateStorage');return validateStorage(v);},
  validateRecord:v=>{calls.push('validateRecord');return validateRecord(v);},
  readArtifact:async ref=>{calls.push('readArtifact');return fs.existsSync(ref.resolved_path)?fs.readFileSync(ref.resolved_path):null;}
};return {host,calls};}
const put=(name,bytes)=>{const f=path.join(work,name);fs.writeFileSync(f,bytes,{flag:'wx'});return {resolved_path:f,sha256:sha(bytes)};};
const assertReadOnly=calls=>{for(const c of calls)assert.ok(readOnlyCalls.includes(c),'unexpected host call '+c);};

test('legacy factory and raw 1.0 validator remain available unchanged',()=>{
  assert.equal(typeof createRefinementCheckpoint,'function');
  assert.equal(typeof inspectRefinement,'function');
  assert.ok(blocks[0][1].includes('function createRefinementCheckpoint(host)'));
  assert.ok(blocks[0][1].includes('function inspectRefinement(record, previousObservedRecord, currentOwnerObservations)'));
});

test('valid storage/record pair observes with independent outer and payload digests',async()=>{
  const {host,calls}=makeHost(),factory=createVersionedRefinementCheckpoint(host);
  const r=record(),payload=Buffer.from(JSON.stringify(r));
  const prev=put('predecessor.json',Buffer.from('fictional predecessor bytes'));
  const wrapperBytes=await factory.wrap(payload,prev);
  assert.ok(wrapperBytes instanceof Uint8Array);
  const wrapper=JSON.parse(Buffer.from(wrapperBytes).toString('utf8'));
  assert.deepEqual(Object.keys(wrapper),['schema_version','kind','previous','record_utf8_base64','record_sha256']);
  assert.equal(wrapper.schema_version,'1.0');assert.equal(wrapper.kind,'refinement-checkpoint-storage');
  assert.deepEqual(wrapper.previous,prev);assert.equal(wrapper.record_sha256,sha(payload));
  assert.equal(Buffer.from(wrapper.record_utf8_base64,'base64').toString('utf8'),JSON.stringify(r));
  assert.ok(validateStorage(wrapper));
  const ref=put('checkpoint-1.json',wrapperBytes);
  const result=await factory.observe(ref);
  assert.equal(result.status,'observed',JSON.stringify(result));
  assert.equal(result.mode,'refinement-checkpoint-storage');
  const w=result.witness;
  assert.deepEqual(w.artifact,ref);
  assert.equal(w.payloadSha256,sha(payload));
  assert.notEqual(w.payloadSha256,ref.sha256,'payload digest must be independent of the outer storage hash');
  assert.deepEqual(w.record,r);
  assert.ok(Buffer.from(w.payload).equals(payload));
  const pw=await factory.payloadWitness(w);
  assert.deepEqual(pw.record,r);
  assert.equal(pw.sha256,sha(payload));
  assert.equal(pw.hashRecord(clone(r)),sha(payload),'adapter proves the exact retained payload parses to that record');
  assert.equal(pw.hashRecord({...r,session_id:'other'}),null);
  assert.equal(pw.hashRecord({...r,questions:[{}]}),null);
  assertReadOnly(calls);
});

test('fresh-chain baseline wrapper has null previous and observes',async()=>{
  const {host}=makeHost(),factory=createVersionedRefinementCheckpoint(host);
  const payload=Buffer.from(JSON.stringify(record()));
  const wrapperBytes=await factory.wrap(payload,null);
  const wrapper=JSON.parse(Buffer.from(wrapperBytes).toString('utf8'));
  assert.equal(wrapper.previous,null);
  const ref=put('checkpoint-baseline.json',wrapperBytes);
  const result=await factory.observe(ref);
  assert.equal(result.status,'observed',JSON.stringify(result));
  assert.equal(result.witness.payloadSha256,sha(payload));
});

test('explicitly selected legacy raw 1.0 checkpoint is a permitted predecessor with coincident hashes',async()=>{
  const {host,calls}=makeHost(),factory=createVersionedRefinementCheckpoint(host);
  const r=record(),raw=Buffer.from(JSON.stringify(r));
  const ref=put('legacy-checkpoint.json',raw);
  const result=await factory.observe(ref);
  assert.equal(result.status,'observed',JSON.stringify(result));
  assert.equal(result.mode,'legacy-raw');
  assert.equal(result.witness.payloadSha256,ref.sha256,'legacy payload and storage hashes coincide');
  const pw=await factory.payloadWitness(result.witness);
  assert.equal(pw.sha256,ref.sha256);
  assert.equal(pw.hashRecord(clone(r)),ref.sha256);
  assertReadOnly(calls);
});

test('mutated, malformed, incorrectly hashed or foreign predecessors fail without file writes',async()=>{
  const {host,calls}=makeHost(),factory=createVersionedRefinementCheckpoint(host);
  const r=record(),payload=Buffer.from(JSON.stringify(r));
  const good=await factory.wrap(payload,null);
  const wrapper=JSON.parse(Buffer.from(good).toString('utf8'));
  const write=name=>obj=>put(name,Buffer.from(typeof obj==='string'?obj:JSON.stringify(obj)));
  const cases=[];
  cases.push(['storage_hash_mismatch',{resolved_path:put('c-outer.json',good).resolved_path,sha256:sha('other bytes')}]);
  cases.push(['artifact_unavailable',{resolved_path:path.join(work,'absent.json'),sha256:sha('x')}]);
  const mutated=clone(wrapper);mutated.record_utf8_base64=Buffer.from(JSON.stringify({...r,session_id:'fixture-session',stop_state:{state:'paused',reason:'tampered',pending_operation_refs:[],last_confirmed_deliverables:[]}})).toString('base64');
  cases.push(['payload_hash_mismatch',put('c-payload-mutated.json',JSON.stringify(mutated))]);
  const badPayloadHash=clone(wrapper);badPayloadHash.record_sha256=sha('not the payload');
  cases.push(['payload_hash_mismatch',put('c-payload-hash.json',JSON.stringify(badPayloadHash))]);
  const unpadded=clone(wrapper);unpadded.record_utf8_base64=wrapper.record_utf8_base64.replace(/=+$/,'')||wrapper.record_utf8_base64+'=';
  cases.push(['storage_schema',put('c-unpadded.json',JSON.stringify(unpadded))]);
  // An equivalent byte string with nonzero trailing bits: same payload, noncanonical text.
  const alpha='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',base=wrapper.record_utf8_base64;
  let noncanon=null;
  for(let i=base.length-1;i>=0&&!noncanon;i--){const c=base[i];if(c==='=')continue;for(const a of alpha){if(a===c)continue;const t=base.slice(0,i)+a+base.slice(i+1);if(Buffer.from(t,'base64').equals(payload)&&t!==base){noncanon=t;break;}}}
  assert.ok(noncanon,'fixture must admit a noncanonical equivalent encoding');
  const trailingBits=clone(wrapper);trailingBits.record_utf8_base64=noncanon;
  cases.push(['payload_encoding_noncanonical',put('c-trailing.json',JSON.stringify(trailingBits))]);
  const badUtf8=clone(wrapper);badUtf8.record_utf8_base64=Buffer.from([0xff,0xfe,0xfd]).toString('base64');badUtf8.record_sha256=sha(Buffer.from([0xff,0xfe,0xfd]));
  cases.push(['payload_not_utf8',put('c-utf8.json',JSON.stringify(badUtf8))]);
  const notJson=clone(wrapper);const junk=Buffer.from('not json at all');notJson.record_utf8_base64=junk.toString('base64');notJson.record_sha256=sha(junk);
  cases.push(['payload_not_json',put('c-notjson.json',JSON.stringify(notJson))]);
  const invalidRecord=clone(wrapper);const badRecord=Buffer.from(JSON.stringify({schema_version:'1.0',session_id:'fixture-session'}));invalidRecord.record_utf8_base64=badRecord.toString('base64');invalidRecord.record_sha256=sha(badRecord);
  cases.push(['record_schema',put('c-badrecord.json',JSON.stringify(invalidRecord))]);
  const extraProp=clone(wrapper);extraProp.surprise=true;
  cases.push(['storage_schema',put('c-extra.json',JSON.stringify(extraProp))]);
  const badVersion=clone(wrapper);badVersion.schema_version='2.0';
  cases.push(['storage_schema',put('c-version.json',JSON.stringify(badVersion))]);
  const badKind=clone(wrapper);badKind.kind='other-storage';
  cases.push(['unrecognized_storage_format',put('c-kind.json',JSON.stringify(badKind))]);
  const foreign=clone(wrapper);const foreignPayload=Buffer.from(JSON.stringify({...r,application_id:'other-application'}));foreign.record_utf8_base64=foreignPayload.toString('base64');foreign.record_sha256=sha(foreignPayload);
  cases.push(['source_identity_mismatch',put('c-foreign.json',JSON.stringify(foreign))]);
  cases.push(['unrecognized_storage_format',put('c-garbage.json','{"not":"a checkpoint"}')]);
  cases.push(['storage_not_json',put('c-text.json','plain text, not json')]);
  cases.push(['invalid_selection_ref',{resolved_path:'/fictional/x.json',sha256:'nothex'}]);
  for(const [finding,ref]of cases){
    const before=calls.length;
    const result=await factory.observe(ref);
    assert.equal(result.status,'failed',`${finding}: ${JSON.stringify(result)}`);
    assert.equal(result.finding,finding,`expected ${finding}, got ${JSON.stringify(result)}`);
    for(let i=before;i<calls.length;i++)assert.ok(readOnlyCalls.includes(calls[i]),'write-side host call '+calls[i]);
  }
  // No write capability exists on the observation host at all.
  for(const key of ['create','write','stage','replace','backup','acquire'])assert.ok(!(key in host),'observation host must not expose '+key);
});

test('mutated, cloned or foreign witnesses fail',async()=>{
  const {host}=makeHost(),factory=createVersionedRefinementCheckpoint(host);
  const payload=Buffer.from(JSON.stringify(record()));
  const ref=put('witness-target.json',await factory.wrap(payload,null));
  const observed=await factory.observe(ref);
  assert.equal(observed.status,'observed');
  const w=observed.witness;
  assert.throws(()=>clone(w),'a live witness must not be cloneable');
  assert.equal((await factory.payloadWitness(cloneSafe(w))).status,'failed');
  const foreignFactory=createVersionedRefinementCheckpoint(makeHost().host);
  const cross=await foreignFactory.payloadWitness(w);
  assert.equal(cross.status,'failed');assert.equal(cross.finding,'foreign_or_unknown_witness');
  assert.equal((await factory.payloadWitness(null)).status,'failed');
  assert.equal((await factory.payloadWitness({mode:'legacy-raw'})).status,'failed');
  const tampered=await factory.observe(ref);
  tampered.witness.record={...record(),session_id:'edited'};
  const bad=await factory.payloadWitness(tampered.witness);
  assert.equal(bad.status,'failed');assert.equal(bad.finding,'witness_tampered');
  // A tampered witness is evicted: even a restored shape no longer authenticates.
  assert.equal((await factory.payloadWitness(tampered.witness)).status,'failed');
  const fresh=await factory.observe(ref);
  assert.equal((await factory.payloadWitness(fresh.witness)).sha256,sha(payload));
});
function cloneSafe(x){try{return clone(x);}catch{return {stolen:true};}}

test.after(()=>console.log(`PASS checkpoint storage: closed wrapper, strict decoding, independent digests, live witnesses, legacy predecessors, write-free rejections; ${cache.size} actual schema validations.`));
