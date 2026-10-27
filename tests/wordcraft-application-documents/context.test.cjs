'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {setup,load}=require('./manifest-fixture.cjs');
const {inspectDocumentManifest}=load('application-documents.md',['inspectDocumentManifest']);
let baseline;
async function fresh(){baseline ||= await setup();return {...baseline,manifest:structuredClone(baseline.manifest),trusted:{...baseline.trusted}};}
test('context metadata is versioned and caller confirmation alone cannot release a letter',async()=>{
 const f=await fresh();assert.equal(f.manifest.schema_version,'1.1');
 assert.deepEqual(await inspectDocumentManifest(f.manifest,f.trusted),[]);
 const letter=f.manifest.documents[1];letter.letter_inputs.recipient.context_refs=[];
 assert.ok((await inspectDocumentManifest(f.manifest,f.trusted)).some(x=>x.code==='missing_inputs'));
 letter.letter_inputs.missing_required=['recipient'];letter.state='pending';letter.issues=['Confirm recipient'];
 assert.deepEqual(await inspectDocumentManifest(f.manifest,f.trusted),[]);
 assert.equal(f.manifest.documents[0].state,'draft');
});
test('ordered recipient, localized dates, salutations and empty enclosures match current records',async()=>{
 for(const change of [i=>i.recipient.context_refs.reverse(),i=>i.recipient.context_refs[0].record_id='context:date',i=>i.date.value='2026-01-03',i=>i.salutation.value='Invented greeting',i=>i.enclosures.value=['Invented attachment'],i=>i.date.context_refs[0].context_sha256='0'.repeat(64),i=>i.date.context_refs[0].application_id='other']){
  const f=await fresh();change(f.manifest.documents[1].letter_inputs);
  assert.ok((await inspectDocumentManifest(f.manifest,f.trusted)).some(x=>x.code==='context_metadata'));
 }
 const f=await fresh();f.manifest.documents[3].letter_inputs.date.value='3 January 2026';
 assert.ok((await inspectDocumentManifest(f.manifest,f.trusted)).some(x=>x.code==='context_metadata'));
});
test('archived manifest binds original strategy contract; current consumer rejects old and unknown versions',async()=>{
 const f=await fresh(),old=structuredClone(f.manifest);old.schema_version='1.0';old.binding.schema_version='1.0';delete old.binding.application_id;delete old.binding.application_context_sha256;
 for(const d of old.documents)if(d.letter_inputs)for(const k of ['recipient','date','salutation','enclosures'])delete d.letter_inputs[k].context_refs;
 assert.equal((await f.validate('schemas/application-documents-v1.schema.json',old)).state,'passed');
 assert.equal((await inspectDocumentManifest(old,f.trusted))[0].code,'unsupported_version');
 old.schema_version='9.0';assert.equal((await inspectDocumentManifest(old,f.trusted))[0].code,'unsupported_version');
});
test('independent confirmation revocation and async selection changes cannot consume cached ready state',async()=>{
 const f=await fresh(),saved=structuredClone(f.sources.confirmation_observations);
 f.sources.confirmation_observations=[];
 assert.ok((await inspectDocumentManifest(f.manifest,f.trusted)).some(x=>x.code==='context_unavailable'));
 f.sources.confirmation_observations=saved;await f.reselect();
 const validate=f.trusted.validate;
 f.trusted.validate=async(schema,value)=>{const result=await validate(schema,value);if(schema.includes('strategy'))f.sources.application_context_bytes+=' ';return result;};
 assert.ok((await inspectDocumentManifest(f.manifest,f.trusted)).some(x=>x.code==='context_unavailable'));
 f.sources.application_context_bytes=f.sources.application_context_bytes.trimEnd();await f.reselect();
});
test('unconfirmed metadata leaves only the affected letter pending and cannot use check-only refresh',async()=>{
 const f=await setup(),previous=structuredClone(f.trusted.strategy),context=JSON.parse(f.sources.application_context_bytes);
 context.records.find(r=>r.id==='context:salutation-de').confirmation=null;
 f.sources.application_context_bytes=JSON.stringify(context);f.sources.confirmation_observations=context.records.flatMap(r=>r.confirmation?[r.confirmation]:[]);
 const bound=await f.reselect();assert.equal(bound.status,'ready');
 const s=f.trusted.strategy;s.application_context=context;s.binding=bound.value.binding;s.dispositions.forEach(d=>d.binding=structuredClone(s.binding));
 f.trusted.binding=s.binding;f.trusted.strategy_sha256=f.trusted.fingerprint(s,f.trusted.sha256);
 const refresh=load('application-documents.md',['proposeCheckOnlyRefresh']).proposeCheckOnlyRefresh;
 assert.equal((await refresh(f.manifest,previous,{...f.trusted,documentArtifacts:[]})).decision,'revalidate');
 f.manifest.binding=s.binding;f.manifest.origin_strategy_sha256=f.manifest.strategy_sha256=f.trusted.strategy_sha256;f.trusted.origin_strategy_sha256=f.trusted.strategy_sha256;
 for(const d of f.manifest.documents)if(d.letter_inputs)for(const key of ['recipient','date','salutation','enclosures'])for(const ref of d.letter_inputs[key].context_refs)ref.context_sha256=s.binding.application_context_sha256;
 const de=f.manifest.documents[3];de.state='pending';de.issues=['Confirm German salutation'];de.letter_inputs.missing_required=['salutation'];
 assert.deepEqual(await inspectDocumentManifest(f.manifest,f.trusted),[]);
 assert.equal(f.manifest.documents[0].state,'draft');assert.equal(f.manifest.documents[1].state,'draft');
});
