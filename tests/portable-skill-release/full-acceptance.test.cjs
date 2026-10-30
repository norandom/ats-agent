'use strict';
// All policy fixtures are controls, never actual applicant/desktop evidence.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const runner=require('./full-acceptance.cjs'),root=path.resolve(__dirname,'../..');
test('frozen B selector binding permits later report HEAD while rejecting a substituted B source or selection',()=>{
 const source={root:'/fictional/prepared-b',sourceRevision:'b'.repeat(40),sourceEpoch:1},selection={candidate:{prepared:source},verifiedArtifacts:[{sha256:'a'.repeat(64)}]},retirement={currentSource:{candidateB:structuredClone(selection),currentRevision:'c'.repeat(40)}};
 assert.equal(runner.bindCandidateB(retirement,selection,source),true);
 assert.throws(()=>runner.bindCandidateB(retirement,{...selection,verifiedArtifacts:[]},source));assert.throws(()=>runner.bindCandidateB(retirement,selection,{...source,sourceRevision:'d'.repeat(40)}));
});
test('complete validation declares exact deterministic suites, five owner validators and all 44 criteria',()=>{
 const p=runner.validateInventory(root);assert.equal(p.status,'passed');assert.equal(p.criteria,44);assert.equal(p.owners,5);assert.ok(p.suites>=18);
 const inventory=JSON.parse(fs.readFileSync(path.join(root,'tests/portable-skill-release/validation-manifest.json')));for(const change of [v=>v.suites.pop(),v=>v.suites.push(v.suites[0]),v=>v.owners.pop(),v=>v.criteria.pop(),v=>v.criteria[0].suites=['missing.test.cjs'],v=>v.command='echo passed']){const v=structuredClone(inventory);change(v);assert.throws(()=>runner.validateInventory(root,v));}
});
test('mandatory test results require executed exact inventory, nonzero counts and zero skips/failures/cancellations',()=>{
 const suite='tests/portable-skill-release/retirement.test.cjs',ok={suite,exit_code:0,tests:5,failed:0,skipped:0,cancelled:0,todo:0};assert.doesNotThrow(()=>runner.checkResults([ok],[suite]));
 for(const change of [r=>r.tests=0,r=>r.skipped=1,r=>r.failed=1,r=>r.cancelled=1,r=>r.todo=1,r=>r.exit_code=1,r=>r.tests=NaN]){const r={...ok};change(r);assert.throws(()=>runner.checkResults([r],[suite]));}assert.throws(()=>runner.checkResults([], [suite]));assert.throws(()=>runner.checkResults([ok,ok],[suite]));
});
test('TAP parser measures actual child summaries and rejects missing, repeated and skipped totals',()=>{
 const good='# tests 3\n# pass 3\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n';assert.deepEqual(runner.parseTap(good),{tests:3,failed:0,cancelled:0,skipped:0,todo:0});assert.throws(()=>runner.parseTap('passed=true'));assert.throws(()=>runner.parseTap(good+good));assert.equal(runner.parseTap(good.replace('# skipped 0','# skipped 1')).skipped,1);
});
test('planned criterion map cannot mark actual acceptance or substitute control/new host evidence',()=>{
 const map=runner.plannedCriteria();assert.equal(map.length,44);assert.ok(map.every(r=>r.status==='not_assessed'));assert.throws(()=>runner.validateCriterionReview({approved:true},{}));
 const context={source_revision:'a'.repeat(40),build_input_digest:'b'.repeat(64),artifacts:['c'.repeat(64)],indices:[{sha256:'d'.repeat(64),host:{name:'Fictional',version:'1',platform:'windows',connection:'control'},files:[{path:'/fictional/output',sha256:'e'.repeat(64),size:1}]}]};
 const review={schema_version:'1.0',kind:'release-criterion-review',source_revision:context.source_revision,build_input_digest:context.build_input_digest,artifacts:context.artifacts,indices:context.indices.map(({sha256,host})=>({sha256,host})),reviewer:'Fictional policy reviewer',criteria:map.map(r=>({requirement:r.requirement,outcome:'passed',observation_class:'host_judgment',reason:'Fictional policy review only, not actual acceptance.',references:[context.indices[0].files[0]]}))};assert.doesNotThrow(()=>runner.validateCriterionReview(review,context));
 for(const change of [v=>v.criteria.pop(),v=>v.criteria[0].observation_class='control',v=>v.indices[0].host.version='new',v=>v.criteria[0].references[0].sha256='f'.repeat(64),v=>v.approved=true]){const r=structuredClone(review);change(r);assert.throws(()=>runner.validateCriterionReview(r,context));}
});
test('public complete validation rejects arbitrary commands and imported results before child execution',()=>{
 const result=spawnSync(process.execPath,['tests/portable-skill-release/full-acceptance.cjs'],{cwd:root,encoding:'utf8'});assert.notEqual(result.status,0);assert.match(result.stdout,/failed/);assert.equal(runner.checkConfiguration({command:'echo passed'}).status,'failed');
});
test('candidate A has only fixed retirement deferrals while B requires every criterion',()=>{
 const context={source_revision:'a'.repeat(40),build_input_digest:'b'.repeat(64),artifacts:['c'.repeat(64)],indices:[{sha256:'d'.repeat(64),host:{name:'Fictional',version:'1',platform:'windows',connection:'control'},files:[{path:'/fictional/output',sha256:'e'.repeat(64),size:1}]}]},deferred=['7.3','7.5','7.6'];
 const r={schema_version:'1.0',kind:'release-criterion-review',source_revision:context.source_revision,build_input_digest:context.build_input_digest,artifacts:context.artifacts,indices:context.indices.map(({sha256,host})=>({sha256,host})),reviewer:'Fictional policy reviewer',criteria:runner.plannedCriteria().map(c=>({requirement:c.requirement,outcome:deferred.includes(c.requirement)?'not_assessed':'passed',observation_class:deferred.includes(c.requirement)?'control':'host_judgment',reason:deferred.includes(c.requirement)?'Deferred until task 7.1 and fresh B acceptance.':'Fictional review for policy only.',references:deferred.includes(c.requirement)?[]:[context.indices[0].files[0]]}))};assert.doesNotThrow(()=>runner.validateCriterionReview(r,context,'candidate-a'));assert.throws(()=>runner.validateCriterionReview(r,context,'candidate-b'));r.criteria[0].outcome='not_assessed';assert.throws(()=>runner.validateCriterionReview(r,context,'candidate-a'));assert.throws(()=>runner.validateAcceptanceReport({status:'passed',acceptance:'ready'}, {},'candidate-a'));
});
test('closed maintenance schema keeps historical records and adds versioned retirement/validation records',async()=>{
 const {validateRecord}=require('../../release/candidate-definition.cjs'),gate=require('../../release/retirement.cjs');assert.equal(validateRecord(structuredClone(gate.approvedPlan)).status,'passed');
 const attempt={schema_version:'1.1',kind:'retirement-attempt',phase:'before-removal',plan_sha256:'a'.repeat(64),source_a:'b'.repeat(40),recovery_revision:'c'.repeat(40),retirement_revision:null,source_b:null,dedicated_diff_sha256:null};assert.equal(validateRecord(attempt).status,'passed');assert.equal(validateRecord({...attempt,approved:true}).status,'failed');assert.equal(validateRecord({...attempt,phase:'after-removal'}).status,'failed');
 const empty=await runner.run(undefined);assert.equal(validateRecord(empty).status,'passed');assert.equal(empty.acceptance,'not_assessed');assert.equal(validateRecord({...empty,unexpected:true}).status,'failed');assert.equal(validateRecord(gate.checkRetirement()).status,'passed');
 const schema=JSON.parse(fs.readFileSync(path.join(root,'release/candidate.schema.json')));assert.equal(schema.$defs.retirement.properties.schema_version.const,'1.0');assert.equal(schema.$defs.attempt.properties.schema_version.const,'1.0');
});
