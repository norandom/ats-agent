'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const {createHarness,classifyCheck} = require('./foundation.cjs');
const {profile} = require('./fixtures.cjs');
const {handoff} = require('./contract-fixture.cjs');
const {cases} = require('./offer-cases.cjs');
const sha256 = text => crypto.createHash('sha256').update(text).digest('hex');
(async () => {
  const h = createHarness();
  const contracts = h.load('strategy-contract.md',['stableSerialize','fingerprint','targetFingerprint','inspectStrategy']);
  const {freezeOfferAnalysis} = h.load('strategy-evidence.md',['freezeOfferAnalysis']);
  const p = profile('operations',h.blank);
  let sequence = 0;
  const validate = async (schema, instance) => {
    const file = path.join(h.workspace,`offer-${++sequence}.json`);
    fs.writeFileSync(file,JSON.stringify(instance,null,2));
    return {state:classifyCheck(spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(h.skillRoot,schema),file],{encoding:'utf8',windowsHide:true})),findings:[]};
  };
  const observations = [];
  for (const scenario of cases()) {
    const target = {kind:'offer',text:scenario.text,sha256:sha256(scenario.text)};
    const result = freezeOfferAnalysis(target,scenario.analysis,{...contracts,sha256});
    assert.equal(result.deterministic,'passed');
    assert.equal(result.host_meaning,'not_assessed');
    assert.equal(result.criterion_set_sha256,contracts.fingerprint(scenario.analysis.criteria,sha256));
    assert.ok(Object.isFrozen(result.criteria));
    assert.ok(Object.isFrozen(result.criteria[0].spans[0]));
    const snapshot = handoff(p,{...contracts,sha256});
    snapshot.target = target; snapshot.binding.target_sha256 = target.sha256;
    snapshot.criteria = result.criteria; snapshot.inferred_needs = result.inferred_needs;
    snapshot.findings = result.findings;
    snapshot.positioning.criterion_set_sha256 = result.criterion_set_sha256;
    snapshot.positioning.selected_claims = []; snapshot.positioning.selections = [];
    snapshot.positioning.expertise_groups = []; snapshot.positioning.terminology = [];
    snapshot.positioning.contribution_thesis = 'Offer interpretation only; contribution composition remains unassessed.';
    snapshot.claims = []; snapshot.questions = []; snapshot.dispositions = []; snapshot.diagnostics = [];
    snapshot.question_batch = {limit:3,selected_ids:[],deferred_ids:[],suppressed_ids:[]};
    snapshot.draft = null; snapshot.comparison = null;
    // Assembly adapter only, no evidence matching implementation in this task.
    snapshot.mappings = result.criteria.map(c => ({criterion:{namespace:'criterion',id:c.id},state:'uncertain',evidence:[],rationale:'Evidence mapping has not been performed in this offer-analysis test.',limits:['Host mapping review remains unassessed.']}));
    const checked = await contracts.inspectStrategy(snapshot,{profile:p,binding:snapshot.binding,sha256,validate});
    assert.equal(checked.schema,'passed',JSON.stringify(checked));
    assert.equal(checked.deterministic,'passed',JSON.stringify(checked));
    observations.push({input:target,output:result,executed:checked,review:'Host-authored worked case; mechanical checks do not establish arbitrary prose comprehension.'});
  }
  const explicit = cases()[0], target = {kind:'offer',text:explicit.text,sha256:sha256(explicit.text)};
  const run = a => freezeOfferAnalysis(target,a,{...contracts,sha256});
  assert.equal(explicit.analysis.criteria.length,6);
  assert.equal(explicit.analysis.criteria[0].spans.length,2);
  assert.equal(explicit.analysis.criteria.filter(c => c.concept === 'manifest reconciliation').length,2);
  const baseline = run(explicit.analysis);
  const change = fn => {const a = structuredClone(explicit.analysis);fn(a);return run(a);};
  assert.notEqual(change(a => a.criteria.reverse()).criterion_set_sha256,baseline.criterion_set_sha256);
  assert.notEqual(change(a => a.criteria[0].priority = 'unspecified').criterion_set_sha256,baseline.criterion_set_sha256);
  assert.equal(change(a => a.inferred_needs[0].wording += ' Additional hypothesis.').criterion_set_sha256,baseline.criterion_set_sha256);
  for (const mutate of [a => a.criteria[0].spans[0].start++, a => a.criteria[0].spans[0].excerpt += ' ', a => a.criteria[0].id = a.criteria[1].id, a => a.inferred_needs[0].status = 'required', a => a.criteria[0].priority = 'mandatory', a => a.criteria[0].spans = []]) {
    const r = change(mutate); assert.equal(r.deterministic,'failed'); assert.equal(r.criterion_set_sha256,undefined);assert.ok(r.errors.every(e => e.pointer && e.corrective_action));
  }
  assert.equal(freezeOfferAnalysis({...target,sha256:sha256('other')},explicit.analysis,{...contracts,sha256}).deterministic,'failed');
  assert.equal(freezeOfferAnalysis({kind:'role',title:'Clerk',context:null,sha256:sha256('role')},explicit.analysis,{...contracts,sha256}).deterministic,'failed');
  const changed = structuredClone(explicit.analysis); const frozen = run(changed); changed.criteria[0].wording = 'Changed';
  assert.notEqual(frozen.criteria[0].wording,changed.criteria[0].wording);
  fs.writeFileSync(path.join(h.workspace,'offer-observations.json'),JSON.stringify(observations,null,2));
  console.log('PASS: four fictional host analyses, exact shipped offer freeze, populated schema/integrity, spans and mutation checks.');
})().catch(e => {console.error(e);process.exitCode = 1;});
