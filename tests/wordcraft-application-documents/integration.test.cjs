'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {prepareIntegration}=require('./integration-fixture.cjs');
const {load,sha256}=require('./manifest-fixture.cjs');
const {inspectDocumentManifest}=load('application-documents.md',['inspectDocumentManifest']);
test('selected fictional facts traverse real upstream assembly into requested-only document mapping',async()=>{
 const f=await prepareIntegration();
 assert.deepEqual(await inspectDocumentManifest(f.manifest,f.trusted),[]);
 assert.deepEqual(f.manifest.documents.map(d=>d.kind+':'+d.language),['cv:en']);
 assert.equal(sha256(fs.readFileSync(f.factsPath)),f.factsHash);
 const stale={...f.trusted,binding:{...f.trusted.binding,canonical_sha256:sha256('different selection')}};
 assert.ok((await inspectDocumentManifest(f.manifest,stale)).some(x=>x.code==='binding_mismatch'));
 const entry=path.resolve(__dirname,'../../skills/targeted-cv/SKILL.md');
 for(const file of [entry,path.resolve(path.dirname(entry),'references/application-documents.md')]){
  const text=fs.readFileSync(file,'utf8');
  for(const [,link] of text.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g))if(!link.includes('://'))assert.ok(fs.existsSync(path.resolve(path.dirname(file),link)),link);
 }
});
