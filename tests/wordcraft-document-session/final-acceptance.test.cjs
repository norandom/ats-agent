const test=require('node:test'),assert=require('node:assert/strict');
const {validateSuite,validateAssets,validateEvidence,criteria,provenance,runtime}=require('./final-acceptance.cjs');
test('suite aggregation rejects omitted, renamed, failed or skipped executable tests',()=>{
 const expected=['first','second'];
 const tap='ok 1 - first\nok 2 - second\n# tests 2\n# pass 2\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n';
 assert.doesNotThrow(()=>validateSuite(tap,expected));
 for(const text of [tap.replace('second','other'),tap.replace('# pass 2','# pass 1'),tap.replace('# skipped 0','# skipped 1'),tap.replace('ok 2','not ok 2'),tap.replace('# tests 2','# tests 1')]) assert.throws(()=>validateSuite(text,expected));
});
test('flags and unreviewed receipt bytes cannot establish actual MCP evidence',()=>{
 for(const report of [{milestone:'passed',evidenceKind:'actual_mcp'},{...provenance},{}]) assert.throws(()=>validateEvidence(Buffer.from(JSON.stringify(report)),Buffer.from('{}'),{}));
});
test('coverage contains exactly the 39 source criteria with concrete check references',()=>{
 const ids=[5,7,5,4,6,5,7].flatMap((n,i)=>Array.from({length:n},(_,j)=>`${i+1}.${j+1}`));
 assert.deepEqual(criteria.map(c=>c.id),ids);
 for(const c of criteria){assert.ok(c.tests.length);assert.ok(c.limit);}
});
test('stale, missing, duplicate or extra runtime assets invalidate live receipt reuse',()=>{
 const assets=runtime.map(name=>({name,sha256:'a'.repeat(64)})),current=Object.fromEntries(assets.map(a=>[a.name,a.sha256]));
 assert.doesNotThrow(()=>validateAssets(assets,current));
 for(const changed of [assets.slice(1),[...assets,assets[0]],[...assets,{name:'unexpected',sha256:'a'.repeat(64)}]])assert.throws(()=>validateAssets(changed,current));
 assert.throws(()=>validateAssets(assets,{...current,[runtime[0]]:'b'.repeat(64)}),/Runtime drift/);
});
