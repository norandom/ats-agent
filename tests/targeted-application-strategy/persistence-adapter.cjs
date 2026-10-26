'use strict';
// Reuse the existing Windows persistence acceptance adapter, not its algorithm.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
module.exports=async function persistenceAdapter(profile){
 const file=path.resolve(__dirname,'../portable-candidate-profile/persistence.test.cjs');
 const source=fs.readFileSync(file,'utf8');
 const start="const base = require('./fixtures/populated.cjs')(blank); base.evidence = []; base.review_questions = [];";
 const end='async function run() {';
 assert.equal(source.split(start).length,2);assert.equal(source.split(end).length,2);
 const prefix=source.split(end)[0].replace(start,'const base = structuredClone(injectedProfile);').replace("source_ids: ['source-demo']",'source_ids: [base.sources[0].id]');
 const {createRequire}=require('node:module');
 return new Function('require','__dirname','injectedProfile',prefix+'\nreturn setup();')(createRequire(file),path.dirname(file),profile);
};
