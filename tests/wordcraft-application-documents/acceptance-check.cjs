'use strict';
// No document parsing: validate saved bytes and actual MCP/review evidence.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {sha256}=require('./foundation.cjs');
const {checklist}=require('./letter-check.cjs');
const {load}=require('./manifest-fixture.cjs');
const {stableSerialize,fingerprint}=load('strategy-contract.md',['stableSerialize','fingerprint']);
function inspectUpstreamReceipt(r){
 const issues=[],u=r.upstream;
 if(!u)return ['Exact upstream artifacts missing'];
 try{
  const values={};
  for(const name of ['strategy','manifest','sources','profile']){assert.equal(sha256(fs.readFileSync(u[name].path)),u[name].sha256);values[name]=JSON.parse(fs.readFileSync(u[name].path));}
  const {strategy:s,manifest:m,sources}=values;
  assert.equal(u.profile.sha256,s.binding.canonical_sha256);
  assert.equal(s.schema_version,'1.1');assert.equal(m.schema_version,'1.1');assert.equal(fingerprint(s,sha256),m.strategy_sha256);assert.equal(m.strategy_sha256,u.strategy_snapshot_sha256);assert.equal(stableSerialize(m.binding),stableSerialize(s.binding));
  assert.equal(sha256(sources.application_context_bytes),s.binding.application_context_sha256);assert.equal(stableSerialize(JSON.parse(sources.application_context_bytes)),stableSerialize(s.application_context));assert.equal(stableSerialize(sources.target),stableSerialize(s.target));
  assert.equal(u.fixture_adapter_sha256,sha256(fs.readFileSync(path.join(__dirname,'acceptance-upstream.cjs'))));
  for(const d of m.documents){const text=d.draft.sections.map(x=>x.range.excerpt).join('\n'),stage=r.stages.find(x=>x.id===d.id);assert.equal(stage?.expected,text);}
 }catch{issues.push('Exact upstream source/strategy/manifest/authoring binding failed');}
 return issues;
}
function verify(receipt,reviewFile){
 if(!receipt)throw Error('Explicit current live receipt required');
 if(typeof receipt!=='string')throw Error('An actual receipt path is required; synthetic flags cannot establish acceptance');
 const r=JSON.parse(fs.readFileSync(receipt,'utf8')),issues=[];
 assert.equal(r.kind,'actual-bilingual-document-acceptance','Expected actual bilingual acceptance');
 const review=reviewFile?JSON.parse(fs.readFileSync(reviewFile,'utf8')):null;
 if(!review||review.receiptSha256!==sha256(fs.readFileSync(receipt)))issues.push('Independent review of exact current receipt required');
 if(r.error||r.restoreError||!r.original.restored||!r.original.bytesUnchanged)issues.push('Live run or selected original restoration');
 const skill=path.resolve(__dirname,'../../skills/targeted-cv');
 for(const [file,hash] of Object.entries(r.runtimeHashes||{}))if(sha256(fs.readFileSync(path.join(skill,file)))!==hash)issues.push('Changed runtime '+file);
 if(!r.runtimeHashes?.['SKILL.md'])issues.push('Entrypoint evidence missing');
 issues.push(...inspectUpstreamReceipt(r));
 for(const id of ['cv-en-baseline','cv-en','letter-en','cv-de-baseline','cv-de','letter-de']){
  const s=r.stages?.find(s=>s.id===id),v=review?.documents?.find(s=>s.id===id);
  if(!s){issues.push(id+' missing actual authoring');continue;}
  if(!s.reopened||!s.textExact||!s.artifactStable||!s.editable||s.finalUI.dirty||s.text.text!==s.expected||sha256(fs.readFileSync(s.artifact))!==s.sha256||s.bytesBefore!==s.sha256)issues.push(id+' persistence/content');
  if(s.snapshotSha256!==sha256(JSON.stringify({text:s.text,structure:s.structure,paragraphs:s.paragraphs})))issues.push(id+' snapshot');
  if(!v||v.sha256!==s.sha256||v.semanticReview?.status!=='passed'||v.readingOrder?.status!=='passed'||!v.readingOrder.associations?.length||v.metadataReview?.status!=='passed')issues.push(id+' independent semantic/order/metadata review');
  if(s.renders.length!==s.structure.pages||!s.renders.every((p,i)=>p.page===i+1&&sha256(fs.readFileSync(p.path))===p.sha256&&v?.pages?.some(x=>x.page===p.page&&x.sha256===p.sha256&&x.status==='passed')))issues.push(id+' all-page visual review');
  if(s.kind==='cv'){
   if(!['PAGE','NUMPAGES'].every(code=>s.footerFields?.some(x=>x.instr===code)))issues.push(id+' actual fields');
   if(!s.renders.every(p=>v?.pages?.some(x=>x.page===p.page&&x.footerText===`${s.language==='de'?'Seite':'Page'} ${p.page} / ${s.structure.pages}`)))issues.push(id+' displayed pagination');
  }else{
   const rows=checklist({...s,visualReview:v?.pages?.every(x=>x.status==='passed')?'passed':'not_assessed'});
   if(rows.some(x=>x.status!=='passed'))issues.push(id+' sourced letter checklist '+rows.filter(x=>x.status!=='passed').map(x=>x.rule_id));
  }
 }
 for(const language of ['en','de']){
  const change=r.pagination?.find(x=>x.document==='cv-'+language),manual=r.manualPreservation?.find(x=>x.document==='cv-'+language);
  if(!change||change.beforePages!==1||change.afterPages<=1)issues.push(language+' actual page-count change');
  if(!manual?.preserved||JSON.stringify(manual.before)!==JSON.stringify(manual.after)||JSON.stringify(manual.contactBefore)!==JSON.stringify(manual.contactAfter))issues.push(language+' manual preservation');
 }
 if(!review?.controls?.every(x=>x.status==='passed'&&x.mode==='simulated')||!['missing-letter-input','unsupported-language','unavailable-inspection'].every(id=>review?.controls?.some(x=>x.id===id)))issues.push('Distinct adverse controls required');
 return {status:issues.length?'failed':'passed',issues,receiptSha256:sha256(fs.readFileSync(receipt)),claim:'Current fictional document acceptance only; no universal ATS compatibility or full normative DIN audit.'};
}
module.exports={verify,inspectUpstreamReceipt};
if(require.main===module){try{const result=verify(...process.argv.slice(2));console.log(JSON.stringify(result));if(result.status!=='passed')process.exitCode=1;}catch(e){console.error(e.message);process.exitCode=1;}}
