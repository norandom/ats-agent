'use strict';
// Maintenance-only fixture checks. Fresh installed sessions receive JSON inputs, never this harness.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),skill=path.join(root,'skills/targeted-cv'),dir=path.join(__dirname,'fixtures');
const read=(id,kind)=>JSON.parse(fs.readFileSync(path.join(dir,`applicant-${id}.${kind}.json`),'utf8'));
const load=(file,names)=>new Function(fs.readFileSync(path.join(skill,'references',file),'utf8').match(/```javascript\r?\n([\s\S]*?)```/)[1]+`;return {${names}};`)();
const {validateProfile}=load('profile-validation.md','validateProfile');
const {createProfileIntake}=load('candidate-profile.md','createProfileIntake');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const work=path.join(root,'outputs/m5-task22');fs.mkdirSync(work,{recursive:true});let sequence=0;
const validate=async(schema,value)=>{const input=path.join(work,`validation-${++sequence}.json`);fs.writeFileSync(input,JSON.stringify(value));const r=spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(skill,schema),input],{encoding:'utf8',windowsHide:true,timeout:30000});assert.ifError(r.error);assert.equal(r.signal,null);assert.ok([0,1].includes(r.status),'Validator must execute');return {state:r.status===0?'passed':'failed',findings:[]};};
test('both explicit raw sources pass current schema and owner semantics without mutation',async()=>{
 for(const id of ['a','b']){const p=read(id,'facts'),before=JSON.stringify(p),r=await validateProfile(p,{validate});assert.equal(p.schema_version,'2.0');assert.equal(r.schema,'passed');assert.equal(r.semantics,'passed');assert.equal(r.readiness,'not_assessed');assert.equal(JSON.stringify(p),before);}
});
test('copyable A covers every reusable field and populated career collection with honest unknowns',()=>{
 const p=read('a','facts'),s=JSON.parse(fs.readFileSync(path.join(skill,'schemas/cv-facts.schema.json')));assert.deepEqual(Object.keys(p).sort(),Object.keys(s.properties).sort());
 const mappings={candidate:'candidate',sources:'source',profile:'claim',employment:'employment',education:'education',professional_development:'development',skill_groups:'skillGroup',projects:'project',volunteering:'volunteering',languages:'language',evidence:'evidence',conflicts:'conflict',review_questions:'reviewQuestion',change_history:'changeHistory'};
 for(const [key,def]of Object.entries(mappings)){const values=Array.isArray(p[key])?p[key]:[p[key]];assert.ok(values.length,key);for(const v of values)assert.deepEqual(Object.keys(v).sort(),Object.keys(s.$defs[def].properties).sort(),key);}
 assert.equal(p.migration_origin,null);assert.equal(p.candidate.phone,null);assert.ok(p.professional_development.some(x=>x.since===null));assert.equal(p.candidate.location.country,'Germany');
});
test('facts are grounded in fictional source text and never contain future scripted answers',()=>{
 for(const id of ['a','b']){const p=read(id,'facts'),source=read(id,'source'),turns=read(id,'turns');assert.equal(source.fictional,true);assert.ok(source.text.includes(p.candidate.name));
 const claims=[...p.profile,...p.employment.flatMap(e=>e.claims),...p.skill_groups.flatMap(g=>g.claims),...p.projects,...p.volunteering];for(const c of claims)assert.ok(source.text.includes(c.statement),c.id);
 for(const entry of p.employment)for(const k of ['employer','title','start'])assert.ok(source.text.includes(entry[k]));
 for(const entry of p.education)for(const k of ['qualification','institution'])assert.ok(source.text.includes(entry[k]));
 for(const entry of p.professional_development)for(const k of ['name','organization'])assert.ok(source.text.includes(entry[k]));
 for(const entry of p.languages)assert.ok(source.text.includes(entry.language)&&source.text.includes(entry.proficiency));
 for(const c of p.conflicts)for(const alternative of c.alternatives)assert.ok(source.text.includes(alternative.value));
 for(const question of p.review_questions)if(question.answer!==null)assert.ok(source.text.includes(question.answer));
 for(const turn of turns.turns.filter(t=>t.kind==='new_fact')){assert.ok(!JSON.stringify(p).includes(turn.answer));assert.equal(turn.source.type,'user_answer');assert.ok(turn.source.id&&turn.source.as_of);assert.ok(['application_only','application_and_reusable'].includes(turn.use));}
 assert.ok(turns.turns.some(t=>t.kind==='skip'));assert.ok(turns.turns.some(t=>t.kind==='qualitative_answer'));assert.ok(turns.turns.some(t=>t.kind==='new_fact'&&t.use==='application_only'));assert.ok(turns.turns.some(t=>t.kind==='new_fact'&&t.use==='application_and_reusable'));
 }
});
test('separate offers/settings request A bilingual set and B isolated pair without composed prose',()=>{
 const a=read('a','settings'),b=read('b','settings');assert.notEqual(a.application_id,b.application_id);assert.notEqual(a.working_directory,b.working_directory);assert.notEqual(read('a','facts').candidate.id,read('b','facts').candidate.id);
 assert.deepEqual(a.languages,['en','de']);assert.deepEqual(a.requested_documents,['cv','cover_letter']);assert.deepEqual(b.languages,['en']);assert.deepEqual(b.requested_documents,['cv','cover_letter']);
 for(const id of ['a','b']){const settings=read(id,'settings'),offer=read(id,'offer');assert.equal(settings.target_country,'DE');assert.equal(settings.facts_selection,'explicit_required');assert.equal(offer.kind,'offer');assert.ok(offer.text.length>100);assert.ok(offer.recipient.organization&&offer.recipient.postal_address);for(const suffix of ['facts','offer','settings','turns','source'])assert.doesNotMatch(JSON.stringify(read(id,suffix)),/expected_cv|expected_letter|paragraphs|matching_score|approved_verdict/);}
});
test('profile intake owner requires selection and rejects A application-scoped source for B',async()=>{
 const a=read('a','facts'),b=read('b','facts'),sa=read('a','settings'),sb=read('b','settings'),selectionA={application_id:sa.application_id,target_sha256:hash(read('a','offer').text)},selectionB={application_id:sb.application_id,target_sha256:hash(read('b','offer').text)};
 const scoped={...structuredClone(a),schema_version:'2.1',application_scope:{...selectionA,origin_profile:{schema_version:'2.0',resolved_path:'/fictional/applicant-a/facts.json',sha256:hash(JSON.stringify(a))}}};
 assert.equal((await validateProfile(scoped,{validate,applicationSelection:selectionA})).semantics,'passed');assert.equal((await validateProfile(scoped,{validate,applicationSelection:selectionB})).semantics,'failed');
 let bytes=Buffer.from(JSON.stringify(scoped)),reads=0;const intake=createProfileIntake({resolvePath:(_w,p)=>p,realpath:p=>p,readBytes:()=>{reads++;return bytes;},decodeUtf8:b=>b.toString(),sha256:hash});
 assert.equal(intake.select({workspace_root:'/fictional'}).status,'selection_required');assert.equal(reads,0);
 assert.equal(intake.select({workspace_root:'/fictional',facts_path:'/fictional/copied-a.json',application_selection:selectionB}).status,'scope_mismatch');assert.equal(intake.snapshot().profile,null);
 bytes=Buffer.from(JSON.stringify(b));assert.equal(intake.select({workspace_root:'/fictional',facts_path:'/fictional/b.json',application_selection:selectionB}).status,'selected');assert.equal(intake.snapshot().profile.candidate.id,b.candidate.id);
});
