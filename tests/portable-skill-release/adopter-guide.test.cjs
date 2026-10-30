'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const root=path.resolve(__dirname,'../..'),manifest=require('./manifest.json');
// A virtual layout checks guidance routing before archive production exists.
const extras=[['release/adopter-guide.md','README.md'],['tests/portable-skill-release/fixtures/applicant-a.facts.json','examples/sample-facts.json']];
const createdTemps=new Set();
function freshTemp(prefix){const temp=fs.mkdtempSync(path.join(os.tmpdir(),prefix));createdTemps.add(fs.realpathSync(temp));return temp;}
function removeTemp(temp){
 const resolved=fs.realpathSync(temp),base=fs.realpathSync(os.tmpdir()),relative=path.relative(base,resolved);
 assert.ok(createdTemps.has(resolved)&&relative&&!relative.startsWith('..')&&!path.isAbsolute(relative),'cleanup requires our fresh directory under OS temp');
 fs.rmSync(resolved,{recursive:true,force:true});createdTemps.delete(resolved);
}
function checkLinks(base,text){
 for(const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
  const target=match[1];if(/^https:\/\//.test(target)||target.startsWith('#'))continue;
  assert.ok(!path.isAbsolute(target)&&!target.includes('..'),'package-local link: '+target);
  assert.ok(fs.statSync(path.join(base,target.split('#')[0])).isFile(),'missing link: '+target);
 }
}
test('adopter README links resolve using only explicitly mapped installed resources',()=>{
 const temp=freshTemp('adopter-guide-');
 try{
  for(const [source,dest] of [...manifest.core.map(a=>[a.path,a.path.replace('skills/targeted-cv/','')]),...extras]){
   const destination=path.join(temp,dest);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(path.join(root,source),destination);
  }
  const guide=fs.readFileSync(path.join(temp,'README.md'),'utf8');checkLinks(temp,guide);
  for(const category of ['SKILL.md','references/','schemas/','templates/','examples/'])assert.ok(guide.includes(']('+category),'missing resource route: '+category);
  const candidate=require('../../release/candidate.json');
  const version=fs.readFileSync(path.join(root,candidate.version_source),'utf8').trim();
  assert.ok(guide.includes('`'+version+'`'),'guide must identify declared candidate version');
  const published=fs.readFileSync(path.join(root,'release/notes.md'),'utf8').match(/^# Targeted CV (\S+)/)[1];
  assert.ok(guide.includes('`'+published+'`'),'guide must distinguish published version');
  const validator=candidate.prerequisites.find(p=>p.id==='schema-validator');assert.ok(guide.includes(validator.command.join(' ')));
 }finally{removeTemp(temp);}
});
test('link check rejects checkout-relative and missing resources',()=>{
 const temp=freshTemp('adopter-links-');
 try{assert.throws(()=>checkLinks(temp,'[source](../docs/your-facts.md)'));assert.throws(()=>checkLinks(temp,'[missing](missing.md)'));assert.throws(()=>removeTemp(os.tmpdir()),/cleanup requires/);}finally{removeTemp(temp);}
});
