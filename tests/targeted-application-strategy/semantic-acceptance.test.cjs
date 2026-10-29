'use strict';
// Current replay and immutable historical provenance are separate checks.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const inputs=require('./semantic-cases/inputs.json'),reviews=require('./semantic-cases/host-review-v1.2.json');
assert.equal(inputs.length,11);assert.deepEqual(reviews.map(x=>x.id),inputs.map(x=>x.id));assert.ok(reviews.every(r=>r.reason.startsWith('Current 1.2 host review: ')));
for(const [file,digest]of Object.entries({'observed.json':'f63e04d7182c27e046cb6402db91c18a421f55019b972ba52f6f8a3fa3b774a9','observed-v1.1.json':'8f4439765176575d4b6e44a5afe9c4584c1395d9ab73b83cf19afdb67407c24d','host-review-v1.1.json':'413e03e79ca66ac5913441e446523409c72a8168fbbc23d60128266c0a021fe0'}))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'semantic-cases',file))).digest('hex'),digest,'Historical evidence must not be rewritten as current');
require('./semantic-cases/run.cjs').run(inputs,reviews).catch(e=>{console.error(e);process.exitCode=1;});
