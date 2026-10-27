'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {verify}=require('./acceptance-check.cjs');
const {prepareAcceptance}=require('./acceptance-upstream.cjs');
test('mandatory actual receipt cannot be replaced by absent evidence',()=>{
 assert.throws(()=>verify(),/Explicit current live receipt/);
});
test('synthetic success flags cannot replace current actual authoring and review',()=>{
 assert.throws(()=>verify({kind:'simulated',status:'passed',stages:[]}),/actual/);
});
test('fictional bilingual source material traverses actual strategy assembly and manifest integrity',async()=>{
 const result=await prepareAcceptance('outputs/context-documents-impl/future-acceptance');
 assert.equal(result.strategy.schema_version,'1.1');assert.equal(result.manifest.schema_version,'1.1');
 assert.equal(result.manifest.documents.length,4);
 assert.ok(result.strategy.claims.some(c=>c.subject==='offer'&&c.evidence.length===0));
 assert.ok(result.strategy.claims.some(c=>c.subject==='application'&&c.evidence.length===0));
 assert.ok(result.strategy.claims.some(c=>c.subject==='mixed'&&c.evidence.length&&c.context_evidence.length));
 assert.equal(result.checks.deterministic,'passed');
 // Mechanical receipt-binding controls only; this does not claim live authoring.
 const fs=require('node:fs'),path=require('node:path'),{sha256}=require('./foundation.cjs'),{inspectUpstreamReceipt}=require('./acceptance-check.cjs');
 const dir='outputs/context-documents-impl/receipt-control';fs.mkdirSync(dir,{recursive:true});
 const receipt={upstream:{strategy_snapshot_sha256:result.manifest.strategy_sha256,fixture_adapter_sha256:sha256(fs.readFileSync(path.join(__dirname,'acceptance-upstream.cjs')))},stages:result.manifest.documents.map(d=>({id:d.id,expected:d.draft.sections.map(s=>s.range.excerpt).join('\n')}))};
 for(const [name,value]of Object.entries({strategy:result.strategy,manifest:result.manifest,sources:result.sources,profile:result.fixture.profile})){
  const file=path.join(dir,name+'.json');fs.writeFileSync(file,JSON.stringify(value));receipt.upstream[name]={path:file,sha256:sha256(fs.readFileSync(file))};
 }
 assert.deepEqual(inspectUpstreamReceipt(receipt),[]);
 receipt.stages[0].expected+=' invented';assert.ok(inspectUpstreamReceipt(receipt).length);
 receipt.stages[0].expected=receipt.stages[0].expected.slice(0,-9);receipt.upstream.profile.sha256='0'.repeat(64);assert.ok(inspectUpstreamReceipt(receipt).length);
});
