'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const {createHarness,classifyCheck} = require('./foundation.cjs');
const {profile} = require('./fixtures.cjs');
const {handoff} = require('./contract-fixture.cjs');
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
(async () => {
  const h = createHarness(), p = profile('operations',h.blank);
  const contracts = {...h.load('strategy-contract.md',['stableSerialize','fingerprint','targetFingerprint','inspectStrategy']),sha256};
  const {createStrategyContext} = h.load('application-strategy.md',['createStrategyContext']);
  const {evidenceView} = h.load('profile-validation.md',['evidenceView']);
  const {dispatchVersion} = h.load('profile-contract.md',['dispatchVersion']);
  const context = createStrategyContext({session:'fictional-questions',currentSelection:() => h.intake.snapshot(),readBytes:fs.readFileSync,decodeUtf8:b => new TextDecoder('utf-8',{fatal:true}).decode(b),sha256,validateProfile:x => h.validate(x),evidenceView,dispatchVersion},contracts);
  const snapshot = handoff(p,contracts); h.select(p);
  const bind = () => context.bindStrategy({snapshot:h.intake.snapshot(),target:snapshot.target,settings:snapshot.settings,evaluation_date:'2026-01-03'});
  const bound = await bind(); assert.equal(bound.status,'ready');
  const {createQuestionPlanner} = h.load('strategy-evidence.md',['createQuestionPlanner']);
  const planner = createQuestionPlanner(context,contracts);
  const q = (id,priority=3,order=0,key=id) => ({id:'question:'+id,distinction_key:key,affected:[{namespace:'criterion',id:'criterion:one'}],text:'Which dispatch decisions could you authorize?',rationale:'Authority is unrecorded; approval changes the scope claim.',expected_effect:'Retain coordination wording until authority is established.',missing_distinction:'Personal approval authority.',priority,offer_order:order,disposition:'open',reopen_reason:null});
  const questions = [q('wording',5),q('preferred',4),q('scope-z',3,0),q('scope-a',3,0),q('required',2),q('repair',1),q('late',3,1)];
  const plan = (qs=questions,ds=[],extra={}) => planner.questions({binding:bound.value.binding,questions:qs,dispositions:ds,...extra});
  let result = plan(); assert.equal(result.status,'ready');
  const ids = values => values.map(x => x.id);
  assert.equal(result.value.question_batch.limit,3);
  assert.deepEqual(ids(result.value.question_batch.selected_ids),['question:repair','question:required','question:scope-a']);
  assert.equal(result.value.question_batch.deferred_ids.length,4);
  assert.equal(result.value.questions.length,7);
  assert.deepEqual(result.value.question_batch,plan([...questions].reverse()).value.question_batch);
  const accounted = r => {
    const batch=r.value.question_batch;
    const all=[...batch.selected_ids,...batch.deferred_ids,...batch.suppressed_ids].map(x => x.id);
    assert.equal(new Set(all).size,all.length);
    assert.deepEqual([...all].sort(),r.value.questions.map(x => x.id).sort());
  };
  accounted(result);
  for (let limit=1;limit<=5;limit++) {const r=plan(questions,[],{limit});assert.equal(r.value.question_batch.selected_ids.length,limit);assert.equal(r.value.question_batch.deferred_ids.length,7-limit);}
  for (const limit of [0,6,null,1.5,'3']) assert.equal(plan(questions,[],{limit}).status,'blocked');
  const disposition = (status,key='authority') => ({id:'disposition:'+key,binding:structuredClone(bound.value.binding),distinction_key:key,status,answer:null,evidence:[],reopen_reason:null});
  const variants = [q('authority-a',3,0,'authority'),{...q('authority-b',3,0,'authority'),text:'Did you approve decisions or coordinate them?'}];
  result=plan(variants);assert.equal(result.value.question_batch.selected_ids.length,1);assert.equal(result.value.question_batch.suppressed_ids.length,1);
  for (const status of ['answered','skipped','not_applicable','confirmed_gap','pending']) {
    result=plan(variants,[disposition(status)]);
    assert.equal(result.value.question_batch.selected_ids.length,0);
    assert.equal(result.value.question_batch.suppressed_ids.length,2);
    assert.ok(result.value.questions.every(x => x.disposition===status));
    assert.equal(result.value.dispositions[0].status,status);
    assert.equal(result.value.mappings,undefined);assert.equal(result.value.claims,undefined);
    accounted(result);assert.ok(variants.every(x => x.disposition==='open'));
  }
  for (const reason of ['conflict','freshness','changed_requirement']) {
    const reopened={...variants[0],reopen_reason:reason,rationale:'New fictional permit notice conflicts with the earlier validity account; clarify current validity.'};
    result=plan([reopened,variants[1]],[disposition('skipped')]);
    assert.deepEqual(ids(result.value.question_batch.selected_ids),['question:authority-a']);
    assert.equal(result.value.dispositions[0].status,'skipped');
    assert.equal(result.value.questions[0].reopen_reason,reason);
  }
  assert.equal(plan([{...variants[0],reopen_reason:'new_wording'}],[disposition('skipped')]).status,'blocked');
  const pending={...disposition('pending'),answer:'I could approve fictional routing changes.'};
  result=plan(variants,[pending]);assert.deepEqual(result.value.pending_update_ids,[{namespace:'disposition',id:pending.id}]);
  assert.deepEqual(result.value.dispositions[0].evidence,[]);assert.equal(result.value.dispositions[0].status,'pending');
  for (const bad of [{...pending,evidence:[snapshot.claims[0].evidence[0]]},{...pending,extra:true}]) assert.equal(plan(variants,[bad]).status,'blocked');
  for (const bad of [{...variants[0],extra:true},{...variants[0],priority:0},{...variants[0],rationale:' '},{...variants[0],offer_order:-1}]) assert.equal(plan([bad]).status,'blocked');
  assert.equal(plan([variants[0],variants[0]]).status,'blocked');
  assert.equal(plan(variants,[disposition('skipped'),{...disposition('answered'),id:'disposition:other'}]).status,'blocked');
  assert.equal(plan(variants,[],{continuity:{confirmed:true}}).status,'blocked');
  const precise = [
    variants[0],
    {...q('date',3),text:'In which month and year did you last use fictional Parcel Loom?',missing_distinction:'Last use date, not award date.',rationale:'Historical use does not establish current proficiency.'},
    {...q('status',2),text:'Is the fictional dispatch permit active, expired or awaiting renewal?',missing_distinction:'Present permit validity.',rationale:'The required active permit has uncertain renewal status.'}
  ];
  result=plan(precise,[pending]);
  Object.assign(snapshot,{binding:bound.value.binding,settings:bound.value.settings,questions:result.value.questions,dispositions:result.value.dispositions,question_batch:result.value.question_batch});
  const validate = async (schema,value) => {const file=path.join(h.workspace,'questions-handoff.json');fs.writeFileSync(file,JSON.stringify(value));return {state:classifyCheck(spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(h.skillRoot,schema),file],{encoding:'utf8',windowsHide:true})),findings:[]};};
  const checked=await contracts.inspectStrategy(snapshot,{profile:p,binding:bound.value.binding,sha256,validate});
  assert.equal(checked.schema,'passed',JSON.stringify(checked));assert.equal(checked.deterministic,'passed',JSON.stringify(checked));
  const old=structuredClone(bound.value.binding);h.intake.select({workspace_root:h.workspace,facts_path:old.resolved_path});
  assert.equal(plan().status,'blocked');assert.equal(plan().value,undefined);
  const next=await bind();assert.equal(next.status,'ready');
  assert.equal(plan().status,'blocked');
  const cleared=planner.questions({binding:next.value.binding,questions:variants,dispositions:[pending]});
  assert.equal(cleared.status,'ready');assert.deepEqual(cleared.value.dispositions,[]);assert.equal(cleared.value.question_batch.selected_ids.length,1);
  const changed=await context.bindStrategy({snapshot:h.intake.snapshot(),target:{kind:'role',title:'Fictional route analyst',context:null},settings:{...snapshot.settings,question_limit:5},evaluation_date:'2026-01-03'});
  assert.equal(changed.status,'ready');
  const newTarget=planner.questions({binding:changed.value.binding,questions,dispositions:[pending]});
  assert.equal(newTarget.value.question_batch.limit,5);assert.deepEqual(newTarget.value.dispositions,[]);
  assert.equal(plan().status,'blocked');
  h.select(profile('laboratory',h.blank));assert.equal(plan().status,'blocked');
  fs.writeFileSync(path.join(h.workspace,'question-observations.json'),JSON.stringify({precise,checked,semantic_review:'Host-authored examples and distinction keys; deterministic tests do not establish arbitrary meaning recognition.'},null,2));
  console.log('PASS: finite stable batches, retained dispositions, semantic-key suppression, pending routing, closed schema and live selection invalidation.');
})().catch(e => {console.error(e);process.exitCode=1;});
