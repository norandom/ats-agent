'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {setup,load,sha256}=require('./manifest-fixture.cjs');
const {stableSerialize,fingerprint,inspectStrategy}=load('strategy-contract.md',['stableSerialize','fingerprint','inspectStrategy']);
const {reviewEditorial}=load('strategy-review.md',['reviewEditorial']);
const {toStrategyDocumentChecks}=load('document-verification.md',['toStrategyDocumentChecks']);
function fixture(){
 const artifact={id:'letter-de',saved_path:'private/fictional.docx',saved_sha256:sha256('saved bytes'),snapshot_sha256:sha256('snapshot'),saved:true,current:true,accessibleEvidence:['private/observation.json']};
 const check={id:'letter-de:content',kind:'content',status:'passed',artifact_sha256:artifact.saved_sha256,snapshot_sha256:artifact.snapshot_sha256,producer:'fictional observer',method:'exact read-back',observed_at:'2026-10-27T06:00:00Z',evidence_reference:'private/observation.json',reason:'Exact observed text matches.'};
 return {artifact,checks:[check,{...check,id:'letter-de:render',kind:'render',status:'not_assessed',reason:'No current page review.'}]};
}
test('adapter preserves the closed upstream shape, missing checks and failure reasons',()=>{
 const {artifact,checks}=fixture();const out=toStrategyDocumentChecks(artifact,checks);
 assert.equal(out.length,2);assert.equal(out[0].id,'document_check:letter-de-content');
 assert.deepEqual(Object.keys(out[0]).sort(),['id','producer','method','artifact_id','artifact_sha256','observed_at','check','result','evidence_reference','reason'].sort());
 assert.equal(out[1].result,'not_assessed');assert.equal(out[1].reason,'No current page review.');
 checks[0].status='failed';assert.equal(toStrategyDocumentChecks(artifact,checks)[0].result,'failed');
 assert.deepEqual(toStrategyDocumentChecks(artifact,[]),[]);
});
test('adapter refuses unsaved hashes and downgrades mismatched revision evidence',()=>{
 for(const change of [a=>a.saved=false,a=>a.current=false,a=>a.saved_sha256=null,a=>a.saved_path=null]){const {artifact,checks}=fixture();change(artifact);assert.deepEqual(toStrategyDocumentChecks(artifact,checks),[]);}
 for(const change of [c=>c.snapshot_sha256=sha256('old'),c=>c.artifact_sha256=sha256('old'),c=>c.evidence_reference=null,c=>c.method=null,c=>c.observed_at='invalid']){const {artifact,checks}=fixture();change(checks[0]);assert.ok(toStrategyDocumentChecks(artifact,checks).every(c=>c.result!=='passed'));}
});
test('unchanged strategy consumer verifies independent checks and refuses forged incoming results',async()=>{
 const {base,validate}=await setup();const s=structuredClone(base.strategy),{artifact,checks}=fixture();
 s.findings=[];s.comparison=null;
 s.document_checks=toStrategyDocumentChecks(artifact,checks);assert.equal(s.document_checks.length,2);
 const observation={binding:structuredClone(s.binding),artifact_id:artifact.id,artifact_sha256:artifact.saved_sha256,checks:structuredClone(s.document_checks)};
 const host={stableSerialize,fingerprint,inspectStrategy,sha256,validate,current:()=>({binding:s.binding,evidence:{profile:base.profile,validation:{schema:'passed',semantics:'passed'}}}),reviewEditorialJudgments:async()=>({}),observeDocumentArtifacts:async()=>[observation]};
 const accepted=await reviewEditorial(s,host);assert.equal(accepted.document_checks[0].result,'passed');assert.equal(accepted.document_checks[1].result,'not_assessed');
 assert.ok(accepted.diagnostics.every(d=>d.value===null));assert.ok(accepted.findings.some(f=>f.category==='document'));
 assert.equal((await validate('schemas/application-strategy.schema.json',{...s,...accepted})).state,'passed');
 for(const change of [c=>c.result='failed',c=>c.producer='forged',c=>c.observed_at='2025-01-01T00:00:00Z',c=>c.artifact_sha256=sha256('old')]){const forged=structuredClone(s);change(forged.document_checks[0]);assert.equal((await reviewEditorial(forged,host)).document_checks[0].result,'not_assessed');}
 assert.ok((await reviewEditorial(s,{...host,observeDocumentArtifacts:async()=>[]})).document_checks.every(c=>c.result==='not_assessed'));
 if(process.env.CONSUMER_MODE==='actual'){
  const actual=await observeCurrent(s.binding);s.document_checks=actual.checks;
  const result=await reviewEditorial(s,{...host,observeDocumentArtifacts:async()=>[actual]});
  assert.equal(result.document_checks.find(c=>c.check==='content').result,'passed');
  assert.equal(result.document_checks.find(c=>c.check==='round_trip').result,'passed');
  assert.equal(result.document_checks.find(c=>c.check==='letter_layout').result,'not_assessed');
  assert.equal(result.document_checks.find(c=>c.check==='render').result,'not_assessed');
  require('node:fs').writeFileSync('outputs/document-consumer-current/result.json',JSON.stringify(result,null,2));
 }else assert.ok(!process.env.CONSUMER_MODE||process.env.CONSUMER_MODE==='offline');
});

async function observeCurrent(binding){
 const fs=require('node:fs'),path=require('node:path'),{randomUUID}=require('node:crypto');
 const {McpClient}=require('../wordcraft-document-session/foundation.cjs');
 const {verifyObservedDocument}=load('document-verification.md',['verifyObservedDocument']);
 assert.ok(process.env.CONSUMER_CURRENT_RECEIPT,'Explicit current receipt required');
 const previous=JSON.parse(fs.readFileSync(process.env.CONSUMER_CURRENT_RECEIPT));
 const artifact=previous.artifact,dir='outputs/document-consumer-current',file=dir+'/receipt.json';
 fs.mkdirSync(dir,{recursive:true});const calls=[];
 const c=McpClient.connect(process.env.WORDCRAFT_CLI,process.env.WORDCRAFT_ENDPOINT);
 const read=async(name,args={})=>{const raw=await c.rpc('tools/call',{name,arguments:args});assert.ok(!raw.isError);const value=JSON.parse(raw.content.find(b=>b.type==='text').text);calls.push({name,args,at:new Date().toISOString()});return value;};
 try{
  await c.rpc('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'document-consumer',version:'1'}});c.notify('notifications/initialized');await c.rpc('tools/list',{});
  const ui=await read('ui_inspect');assert.equal(ui.dirty,false);assert.equal(ui.title,path.basename(artifact,'.docx'));
  assert.equal((await read('get_text')).text,previous.after.text.text);assert.equal(sha256(fs.readFileSync(artifact)),previous.bytesAfter);
  const opened=await read('open_document',{path:artifact});assert.equal(opened.path,artifact);
  const snapshot=async()=>({text:await read('get_text'),structure:await read('inspect_document')});
  const before=await snapshot(),bytesBefore=sha256(fs.readFileSync(artifact));
  const after=await snapshot(),bytesAfter=sha256(fs.readFileSync(artifact));assert.equal((await read('ui_inspect')).dirty,false);
  assert.equal(stableSerialize(before),stableSerialize(after));assert.equal(bytesBefore,bytesAfter);
  // Host identities are scoped to this explicitly bound connection, never reused from archived replay.
  const session={document_id:randomUUID(),connection_id:randomUUID(),snapshot_id:randomUUID(),snapshot_sha256:sha256(stableSerialize(after)),saved_path:artifact,saved_sha256:bytesAfter};
  const observation={before:session,after:session,bytesBefore,bytesAfter,reopened:true,editable:after.structure.blocks.every(b=>b.type==='paragraph'),continuity:true,accessible:true,evidence_reference:file,producer:'current WordCraft host observation',method:'same-file reopen; MCP text and structure; saved byte hashing',observed_at:new Date().toISOString(),reviewedText:previous.after.text.text,bodyText:after.text.text,structure:after.structure,pageCount:after.structure.pages};
  const checked=verifyObservedDocument({id:'letter-de',kind:'cover_letter',market:'DE',language:'de',session},observation,stableSerialize);
  fs.writeFileSync(file,JSON.stringify({nativeIdentity:'not_exposed',hostBindingBasis:'Same-file reopen in this connection; clean UI, text/structure and bytes unchanged.',calls,artifact,before,after,observation,checked},null,2));
  const checks=toStrategyDocumentChecks({id:'letter-de',...session,saved:true,current:true,accessibleEvidence:[file]},checked.checks);
  return {binding:structuredClone(binding),artifact_id:'letter-de',artifact_sha256:bytesAfter,checks};
 }finally{c.close();}
}
