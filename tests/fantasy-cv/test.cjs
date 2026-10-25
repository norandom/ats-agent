const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const out=path.resolve(process.argv[2]||'outputs/john-doe-demo');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const facts=read(path.join(__dirname,'facts.json'));
const offer=read(path.join(__dirname,'offer.json'));
let checks=0;
const check=(name,fn)=>{fn();checks++;console.log('PASS '+name);};
const ids=new Set(),sources=new Set(facts.sources.map(s=>s.id));
function walk(v){if(!v||typeof v!=='object')return;if(v.id){assert(!ids.has(v.id),'Duplicate id');ids.add(v.id);}if(v.source_ids)for(const id of v.source_ids)assert(sources.has(id),'Broken source reference');if(Array.isArray(v))v.forEach(walk);else Object.values(v).forEach(walk);}
check('fixture IDs and provenance',()=>walk(facts));
check('copyable sample covers every legacy schema field and collection',()=>{
 const schema=read(path.join(__dirname,'../../skills/targeted-cv/schemas/cv-facts-v1.schema.json'));
 function cover(s,v){if(s.properties){for(const [k,child] of Object.entries(s.properties)){assert(Object.hasOwn(v,k),'Missing sample field '+k);cover(child,v[k]);}}if(s.items){assert(v.length>0,'Empty sample collection');for(const item of v)cover(s.items,item);}}
 cover(schema,facts);
});
const log=read(path.join(out,'verification.json'));
const inspection=JSON.parse(log.find(x=>x.tool==='inspect_document').result.find(x=>x.type==='text').text);
const actual=inspection.blocks.filter(b=>b.type==='paragraph').map(b=>b.text);
check('reopened DOCX content and reading order',()=>assert.deepEqual(actual,read(path.join(out,'expected-text.json'))));
check('one-page document with no image blocks',()=>{assert.equal(inspection.pages,1);assert(inspection.blocks.every(b=>b.type==='paragraph'));});
check('claim map resolves to selected facts',()=>{for(const p of read(path.join(out,'claim-map.json')))for(const id of p.fact_ids)assert(ids.has(id));});
check('unanswered qualifications are not claimed',()=>{const text=actual.join('\n');assert(!text.includes('incident-command certification'));assert(!text.includes('available for extended off-world'));assert(!text.includes('q-command'));});
check('transparent coverage and missing-evidence questions',()=>{const r=read(path.join(out,'review.json'));assert.deepEqual(r.required,{supported:5,total:6});assert.deepEqual(r.preferred,{supported:0,total:1});assert.equal(r.questions.length,2);assert(r.questions.every(q=>q.status==='open'));for(const r of offer.requirements)for(const id of r.evidence)assert(ids.has(id));});
check('candidate and metrics come from selected input',()=>{
 const dir=path.join(out,'input-isolation');fs.mkdirSync(dir,{recursive:true});
 const alternate=structuredClone(facts);alternate.candidate.name='Alex Example';alternate.candidate.email='alex@example.net';alternate.employment[0].claims[0].statement='Led 17 extraterrestrial incident responses in 2025.';
 const p=path.join(dir,'facts.json');fs.writeFileSync(p,JSON.stringify(alternate));
 execFileSync(process.execPath,[path.join(__dirname,'build-demo.cjs'),p,path.join(__dirname,'offer.json'),dir]);
 const text=read(path.join(dir,'expected-text.json')).join('\n');assert(text.includes('Alex Example'));assert(!text.includes(facts.candidate.name));assert(!text.includes(facts.candidate.email));assert(text.includes('Led 17'));assert(!text.includes('Led 42'));
});
fs.writeFileSync(path.join(out,'test-results.json'),JSON.stringify({checks,passed:checks,scope:'Synthetic fixture and reopened headless WordCraft DOCX; live GUI preservation and full skill behavior not tested'},null,2));
console.log(`${checks} checks passed`);
