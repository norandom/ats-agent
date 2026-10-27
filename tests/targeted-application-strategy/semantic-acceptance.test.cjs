'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const inputs=require('./semantic-cases/inputs.json'), reviews=require('./semantic-cases/host-review-v1.1.json');
assert.equal(inputs.length,11);
assert.deepEqual(reviews.map(x=>x.id),inputs.map(x=>x.id));
require('./semantic-cases/run.cjs').run(inputs,reviews).catch(e=>{console.error(e);process.exitCode=1;});
