'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const pipeline=require('../../release/pipeline.cjs');
test('comparison rejects missing formats and does not infer readiness',()=>{
 assert.equal(pipeline.compareBuilds({}).status,'failed');assert.equal(pipeline.compareBuilds(null).status,'failed');assert.equal(pipeline.prepareRun(undefined).status,'failed');
});
test('production validates selected provenance before output writes',()=>{
 assert.equal(pipeline.produce({root:process.cwd(),sourceRevision:'f'.repeat(40),sourceEpoch:0},'outputs/invalid-production').status,'failed');
});
