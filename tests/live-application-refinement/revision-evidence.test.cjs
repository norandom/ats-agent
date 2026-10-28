'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {checkRevisionEvidence}=require('./revision-evidence.cjs');
test('actual revision receipt required; catalog and simulation do not substitute',()=>{
 assert.throws(()=>checkRevisionEvidence(null),/Missing actual/);
 assert.throws(()=>checkRevisionEvidence({kind:'simulation'}),/Missing actual/);
});
if(process.env.TASK52_RECEIPT){
 const fs=require('node:fs'),r=JSON.parse(fs.readFileSync(process.env.TASK52_RECEIPT));
 test('actual receipt passes; absent, altered, incomplete or stale evidence fails',()=>{
  assert.equal(checkRevisionEvidence(r).state,'passed');
  for(const mutate of [x=>x.review.state='not_assessed',x=>x.stages[1].renders.pop(),x=>x.stages[1].footerFields=[],x=>x.reusable.sha256='0'.repeat(64),x=>x.upstream.revised_manifest.sha256='0'.repeat(64),x=>x.manifestRevision.decision='blocked',x=>x.manual.after=null,x=>x.overlap.mutationsWhileWithheld=1,x=>x.runtimeHashes['SKILL.md']='0'.repeat(64)]){
   const changed=structuredClone(r);mutate(changed);assert.throws(()=>checkRevisionEvidence(changed));
  }
 });
}
