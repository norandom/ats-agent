'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const h=require('./full-acceptance.cjs');
test('full gate rejects missing suites, duplicate results, failed suites and skipped tests',()=>{
 const rows=h.suites.map(suite=>({suite,exit_code:0,skipped:0}));h.checkResults(rows,'full');
 for(const bad of [rows.slice(1),[...rows,rows[0]],rows.map((r,i)=>i? r:{...r,exit_code:1}),rows.map((r,i)=>i?r:{...r,skipped:1})])assert.throws(()=>h.checkResults(bad,'full'));
 assert.throws(()=>h.checkResults(rows,'other'));
});
test('relocation rejects missing assets, changed hashes and incomplete manifest membership',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'documents-guard-'));fs.writeFileSync(path.join(dir,'a'),'a');
 h.verifyManifest(dir,{a:h.hash('a')},['a']);
 assert.throws(()=>h.verifyManifest(dir,{a:h.hash('b')},['a']));
 assert.throws(()=>h.verifyManifest(dir,{a:h.hash('a')},['a','b']));
 assert.throws(()=>h.verifyManifest(dir,{b:h.hash('a')},['b']));
});
test('coverage rejects missing criteria and invented assertion references',()=>{
 h.checkCoverage(h.manifest.coverage);
 assert.throws(()=>h.checkCoverage(h.manifest.coverage.slice(1)));
 assert.throws(()=>h.checkCoverage(h.manifest.coverage.map((r,i)=>i?r:{...r,assertion:'invented assertion'})));
});
test('full acceptance refuses absent actual receipt and independent review',()=>{
 assert.throws(()=>h.checkActual(),/Explicit actual receipt/);
 assert.throws(()=>h.checkActual(__filename),/independent review/);
});
