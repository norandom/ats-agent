'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),skill=path.join(root,'skills/targeted-cv');
const load=(name,names)=>new Function(fs.readFileSync(path.join(skill,'references',name),'utf8').match(/```javascript\r?\n([\s\S]*?)```/)[1]+`;return {${names}};`)();
const {dispatchVersion,proposeMigration}=load('profile-contract.md','dispatchVersion,proposeMigration');
const {validateProfile,semanticIntegrity,assessReadiness}=load('profile-validation.md','validateProfile,semanticIntegrity,assessReadiness');
const {createProfileIntake}=load('candidate-profile.md','createProfileIntake');
const blank=require('../../skills/targeted-cv/templates/cv-facts.blank.json'),populated=require('../portable-candidate-profile/fixtures/populated.cjs');
const selected={application_id:'fictional-app',target_sha256:'a'.repeat(64)};
const scope={...selected,origin_profile:{schema_version:'2.0',resolved_path:'/fictional/base.json',sha256:'b'.repeat(64)}};
const profile=()=>({...populated(blank),schema_version:'2.1',application_scope:structuredClone(scope)});
const work=path.join(root,'outputs/m4-task21');fs.mkdirSync(work,{recursive:true});let count=0;
const validate=async(schema,value)=>{const file=path.join(work,`schema-${++count}.json`);fs.writeFileSync(file,JSON.stringify(value));const r=spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(skill,schema),file],{encoding:'utf8',windowsHide:true,timeout:120000});assert.ok(!r.error,r.error?.message);assert.ok([0,1].includes(r.status),r.stderr);return {state:r.status===0?'passed':'failed',findings:[]};};
(async()=>{
 assert.equal(dispatchVersion(profile()).schema,'schemas/cv-facts-application.schema.json');
 for(const v of [null,2.1,'2.10','3.0'])assert.equal(dispatchVersion({schema_version:v}).status,'unsupported_version');
 assert.equal(dispatchVersion(blank).schema,'schemas/cv-facts.schema.json');assert.equal(dispatchVersion({schema_version:'1.0'}).status,'migration_required');
 assert.equal((await proposeMigration(Buffer.from(JSON.stringify(profile())),{decodeUtf8:b=>b.toString()})).status,'already_current');
 const reusable=JSON.parse(fs.readFileSync(path.join(skill,'schemas/cv-facts.schema.json'))),application=JSON.parse(fs.readFileSync(path.join(skill,'schemas/cv-facts-application.schema.json')));
 const parity=structuredClone(application);parity.title=reusable.title;parity.description=reusable.description;parity.properties.schema_version=reusable.properties.schema_version;delete parity.properties.application_scope;parity.required=parity.required.filter(x=>x!=='application_scope');delete parity.$defs.applicationScope;parity.$defs.authorization.properties.scope.enum=reusable.$defs.authorization.properties.scope.enum;assert.deepEqual(parity,reusable);
 const p=profile(),before=JSON.stringify(p);const good=await validateProfile(p,{validate,applicationSelection:selected});assert.equal(good.schema,'passed');assert.equal(good.semantics,'passed');assert.equal(JSON.stringify(p),before);
 for(const selection of [null,{...selected,application_id:'other'},{...selected,target_sha256:'c'.repeat(64)}])assert.equal((await validateProfile(p,{validate,applicationSelection:selection})).semantics,'failed');
 for(const change of [q=>delete q.application_scope,q=>q.application_scope.extra=true,q=>q.application_scope.origin_profile.schema_version='2.1',q=>q.application_scope.target_sha256='invalid']){const q=profile();change(q);assert.equal((await validateProfile(q,{validate,applicationSelection:selected})).schema,'failed');}
 for(const pointer of ['/application_scope','/change_history','/sources','/schema_version','/migration_origin'])assert.equal(assessReadiness(p,{task_id:'career',required:[{pointer,record_id:null,reason:'career support'}]}).state,'incomplete');
 for(const scopeName of ['application_fork','application_fact_update']){const q=profile();q.change_history[0].authorization.scope=scopeName;q.change_history[0].base_sha256=scope.origin_profile.sha256;assert.equal((await validateProfile(q,{validate,applicationSelection:selected})).semantics,'passed');q.change_history[0].base_sha256=null;assert.equal(semanticIntegrity(q).state,'failed');}
 const q=profile();q.evidence.push({id:'metadata-evidence',record_id:'not-a-career-record',field_pointer:'',status:'supported',source_ids:[q.sources[0].id],rationale:null});assert.equal(semanticIntegrity(q).state,'failed');
 let bytes=Buffer.from(JSON.stringify(p)); const intake=createProfileIntake({resolvePath:(_w,f)=>f,realpath:f=>f,readBytes:()=>bytes,decodeUtf8:b=>b.toString(),sha256:b=>crypto.createHash('sha256').update(b).digest('hex')});
 for(const application_selection of [undefined,{...selected,application_id:'other'},{...selected,target_sha256:'c'.repeat(64)}]){assert.equal(intake.select({workspace_root:'/fictional',facts_path:'/fictional/copied.json',application_selection}).status,'scope_mismatch');assert.equal(intake.snapshot().profile,null);}
 assert.equal(intake.select({workspace_root:'/fictional',facts_path:'/fictional/copied.json',application_selection:selected}).status,'selected');
 const source={id:'new-answer',text:'Supported additional capability',unreadable_regions:[]};
 const proposal=structuredClone(p);proposal.sources.push({id:source.id,type:'user_answer',origin:null,locator:null,received_at:null,as_of:null,verification:'user_reported',verification_basis:null});proposal.profile.push({id:'added-capability',statement:source.text,source_ids:[source.id]});
 const review={proposed_profile:proposal,source_spans:[{pointer:`/profile/${proposal.profile.length-1}/statement`,source_id:source.id,start:0,end:source.text.length,quote:source.text}],extraction_issues:[]};
 const generation=intake.snapshot().generation;assert.equal(intake.propose([source],review,generation).status,'proposal');assert.deepEqual(proposal.employment,p.employment);assert.deepEqual(proposal.change_history,p.change_history);
 for(const mutate of [r=>r.proposed_profile.application_scope.application_id='other',r=>r.proposed_profile.application_scope.origin_profile.sha256='d'.repeat(64),r=>r.proposed_profile.schema_version='2.0']){const r=structuredClone(review);mutate(r);assert.equal(intake.propose([source],r,generation).status,'review_required');}
 const correction=structuredClone(review);correction.proposed_profile.employment[0].title=null;correction.proposed_profile.conflicts.push({id:'title-conflict',record_id:p.employment[0].id,field_pointer:'/title',alternatives:[{value:p.employment[0].title,source_ids:[p.sources[0].id]},{value:'Unclear later responsibility',source_ids:[source.id]}],status:'open',resolution_source_ids:[],selected_alternative:null});assert.equal(intake.propose([source],correction,generation).status,'proposal');assert.equal(semanticIntegrity(correction.proposed_profile).state,'passed');assert.equal(assessReadiness(correction.proposed_profile,{task_id:'title',required:[{pointer:'/employment/0/title',record_id:p.employment[0].id,reason:'Clarify responsibility before stronger wording.'}]}).state,'incomplete');assert.deepEqual(correction.proposed_profile.conflicts.at(-1).alternatives[0],{value:p.employment[0].title,source_ids:[p.sources[0].id]});
 const unmapped=structuredClone(review);unmapped.source_spans=[];assert.equal(intake.propose([source],unmapped,generation).status,'review_required');
 const date=profile();date.employment[0].start='2025';date.employment[0].end='2020';assert.equal(semanticIntegrity(date).state,'failed');
 const historyTarget=profile();historyTarget.evidence.push({id:'history-as-support',record_id:historyTarget.change_history[0]?.id || 'history',field_pointer:'',status:'supported',source_ids:[historyTarget.sources[0].id],rationale:null});assert.equal(semanticIntegrity(historyTarget).state,'failed');
 console.log(`PASS scoped profile: copied-file isolation, immutable scope, exact dispatch, parity, support boundaries, meaning-span review, chronology; ${count} actual schema invocations.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
