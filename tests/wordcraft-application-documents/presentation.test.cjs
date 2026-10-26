'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {checkPresentation,fixtures}=require('./presentation-exercise.cjs');
const fs=require('node:fs'),path=require('node:path');
const {sha256}=require('./foundation.cjs');
test('presentation gate rejects unavailable or incomplete actual evidence',()=>{
 assert.equal(checkPresentation({}).status,'pending');
 const r={originalRestored:true,originalBytesUnchanged:true,stages:[]};
 assert.equal(checkPresentation(r).status,'pending');
});
if(process.env.PRESENTATION_RECEIPT)test('actual desktop receipt preserves paragraph order, style properties, fields and artifact bytes',()=>{
 const filename=path.resolve(process.env.PRESENTATION_RECEIPT),r=JSON.parse(fs.readFileSync(filename,'utf8'));
 assert.equal(r.kind,'actual_desktop_cv_presentation');assert.equal(checkPresentation(r).status,'passed');
 for(const s of r.stages){
  const snapshot=JSON.parse(fs.readFileSync(path.join(path.dirname(filename),s.name+'.json'),'utf8'));
  assert.equal(sha256(fs.readFileSync(s.artifact)),s.sha256);assert.equal(sha256(JSON.stringify(snapshot)),s.snapshotSha256);
  assert.equal(s.presentation.settingsSha256,sha256(JSON.stringify(s.presentation.settings)));
  assert.equal(snapshot.text.text,s.source.paragraphs.map(p=>p.text).join('\n'));
  assert.equal(s.paragraphs.length,s.source.paragraphs.length);
  for(let i=0;i<s.paragraphs.length;i++){
   const actual=s.paragraphs[i],source=s.source.paragraphs[i],mark=actual.paragraph.mark;
   assert.equal(actual.paragraph.text,source.text);assert.equal(actual.resolved.align,'left');assert.equal(mark.font,'Arial');
   assert.equal(mark.size,source.kind==='name'?22:['headline','heading'].includes(source.kind)?12:11);
   if(['heading','label','project','date'].includes(source.kind))assert.equal(actual.resolved.keepNext,true);
   if(source.kind==='heading'){assert.equal(mark.bold,true);assert.deepEqual(mark.color.Rgb,[31,78,121]);assert.equal(actual.resolved.spaceBefore,9);}
   if(source.kind==='summary')assert.ok(actual.resolved.shading);
   if(source.kind==='bullet')assert.ok(actual.resolved.numbering);
   if(s.name==='long-de'&&source.text==='Ausgewählte Projekte')assert.equal(actual.resolved.pageBreakBefore,true);
  }
  assert.deepEqual(snapshot.footerFields.map(f=>f.instr),['PAGE','NUMPAGES']);
  for(const page of s.rendered)assert.equal(sha256(fs.readFileSync(path.join(path.dirname(filename),`${s.name}-${page}.png`))),s.renderHashes[page]);
 }
 assert.equal(sha256(fs.readFileSync(r.original.path)),r.original.sha256);
});
test('fictional compositions have unique paragraphs and localized labels',()=>{
 for(const f of fixtures()) {assert.equal(new Set(f.paragraphs.map(p=>p.text)).size,f.paragraphs.length);assert.ok(f.paragraphs.some(p=>p.kind==='scope'));assert.ok(f.paragraphs.some(p=>p.kind==='bullet'));assert.ok(f.paragraphs.some(p=>p.kind==='project'));assert.ok(!f.paragraphs.some(p=>/[—]/u.test(p.text)));}
});
test('receipt gate checks exact text, field identity, all pages and rendered review',()=>{
 const stages=['short-en','short-de','long-de'].map((name,i)=>({name,pages:i===2?2:1,textExact:true,reopened:true,fieldCodes:['PAGE','NUMPAGES'],rendered:i===2?[1,2]:[1],visualReview:'passed',artifactStable:true}));
 const r={originalRestored:true,originalBytesUnchanged:true,stages};assert.equal(checkPresentation(r).status,'passed');
 for(const change of [s=>s.fieldCodes=['PAGE'],s=>s.rendered=[1],s=>s.textExact=false,s=>s.visualReview='not_assessed',s=>s.artifactStable=false]) {const b=structuredClone(r);change(b.stages[2]);assert.equal(checkPresentation(b).status,'pending');}
});
