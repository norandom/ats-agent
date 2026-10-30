'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {validateRecord,readDeclaration,hostMetadata}=require('../../release/candidate-definition.cjs');
const root=path.resolve(__dirname,'../..');
const candidate=()=>JSON.parse(fs.readFileSync(path.join(root,'release/candidate.json')));
test('candidate identity validates with current contracts and no operational success claim',()=>{
 const r=readDeclaration(root);assert.equal(r.status,'passed');assert.equal(r.value.version,'2.0.0-alpha.2');assert.equal(r.value.declaration.name,'targeted-cv');
 assert.ok(r.value.declaration.targets.every(t=>t.workflow_verified==='not_assessed'));
 assert.deepEqual(hostMetadata('targeted-cv','2.0.0-alpha.2'),{generic:{name:'targeted-cv',version:'2.0.0-alpha.2'},codex:{name:'targeted-cv',version:'2.0.0-alpha.2',skills:'./skills/'},claude:{name:'targeted-cv',version:'2.0.0-alpha.2'},gemini:{name:'targeted-cv',version:'2.0.0-alpha.2',skills:['./skills/']}});
});
test('closed declaration rejects unknown keys, current commit hashes and incomplete prerequisites',()=>{
 for(const mutate of [v=>v.unexpected=true,v=>v.source_revision='a'.repeat(40),v=>v.prerequisites.pop(),v=>v.prerequisites.find(p=>p.id==='schema-validator').version='latest',v=>v.targets[0].workflow_verified='passed',v=>{v.targets[0].workflow_verified='passed';v.targets[0].host='claimed-host';v.targets[0].evidence={path:'evidence/fake.json',sha256:'a'.repeat(64),size:1}},v=>v.contracts.profile.pop(),v=>v.inventory_ref='../private/facts.json']){
  const v=candidate();mutate(v);assert.equal(validateRecord(v).status,'failed');
 }
});
test('record variants validate nonempty exact identities and reject unknown nested fields',()=>{
 const h='a'.repeat(64),file={path:'evidence/check.json',sha256:h,size:1};
 const cases=[
 {schema_version:'1.0',kind:'prepared-candidate',name:'targeted-cv',version:'2.0.0-alpha.2',source_revision:'a'.repeat(40),source_epoch:1793318400,development_snapshot:false,assets:[{source:'release/README.md',destinations:{'portable-zip':['targeted-cv/README.md'],'skill-alias':['targeted-cv/README.md'],'plugin-zip':['skills/targeted-cv/README.md']},role:'guide',size:1,sha256:h,rights_ref:'project'}],build_inputs:[{...file,checkout_sha256:h}]},
 {schema_version:'1.0',kind:'artifact',name:'targeted-cv',version:'2.0.0-alpha.2',format:'portable-zip',filename:'targeted-cv.zip',size:1,sha256:h,release_metadata_sha256:h,payload_digest:h,build_input_digest:h,source_revision:'a'.repeat(40)},
 {schema_version:'1.0',kind:'check-result',status:'not_assessed',method:'control',observation_class:'control',scope:'archive',inputs:[file],outputs:[],limits:['No actual acceptance'],issues:[]},
 {schema_version:'1.0',kind:'installed-evidence',artifact:file,installed_root:'external/targeted-cv',before:[file],after:[file],host:{name:'fictional-host',version:'1.0',platform:'windows',connection:'desktop-mcp'},prerequisites:[file],resource_reads:[file],applicants:[{id:'applicant-a',facts:file,settings:file,state:file}],owner_receipts:[file],operations:[file],saved_outputs:[file],renders:[file],reviews:[file]},
 {schema_version:'1.0',kind:'readiness',status:'not_assessed',candidate:file,artifacts:[file],gates:[file],support:[{target:'windows-filesystem',layout_verified:'not_assessed',host_load_verified:'not_assessed',workflow_verified:'not_assessed',evidence:null}],limits:['No installed acceptance'],evidence_index:file},
 {schema_version:'1.0',kind:'retirement-declaration',remove:['example.py'],update:['docs/legacy-cli.md'],recovery_policy:'dedicated-revision-only',preserve_ignored:true},
 {schema_version:'1.0',kind:'retirement-attempt',declaration:file,accepted_a:file,approved_scope_digest:h,observed_source_revision:'a'.repeat(40),recovery_revision:'b'.repeat(40),execution:'not_assessed',candidate_b:null,checks:[]}
 ];
 for(const v of cases){assert.equal(validateRecord(v).status,'passed',v.kind);const bad=structuredClone(v);bad.extra=true;assert.equal(validateRecord(bad).status,'failed',v.kind);}
 for(const change of [v=>v.assets[0].sha256='fake',v=>v.assets[0].extra=true,v=>v.build_inputs[0].extra=true,v=>v.assets[0].destinations['portable-zip']=['../outside'],v=>v.source_revision='short']){const bad=structuredClone(cases[0]);change(bad);assert.equal(validateRecord(bad).status,'failed');}
});
test('version conflicts and incompatible host prerequisites fail without mutating inputs',()=>{
 const v=candidate(),before=JSON.stringify(v);assert.equal(readDeclaration(root,{packageVersion:'2.0.0-alpha.1'}).status,'failed');
 v.targets[0].javascript_runtime='external-node';assert.equal(validateRecord(v).status,'failed');assert.equal(JSON.stringify(candidate()),before);
 assert.throws(()=>hostMetadata('other','2.0.0-alpha.2'));assert.throws(()=>hostMetadata('targeted-cv','2.0.0'));
});

test('nonserializable input returns a discriminated failure',()=>{
 const circular={};circular.loop=circular;assert.equal(validateRecord(circular).status,'failed');assert.equal(validateRecord(undefined).status,'failed');
});
