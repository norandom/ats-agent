'use strict';
// Host-authored fictional prose and semantic judgments. Assertions test mechanics only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const {createHarness,classifyCheck} = require('./foundation.cjs');
const {profile} = require('./fixtures.cjs');
const {handoff} = require('./contract-fixture.cjs');
const sha256 = text => crypto.createHash('sha256').update(text).digest('hex');
const ref = id => ({namespace:'claim',id});
const span = (text, excerpt) => {const start = Array.from(text.slice(0,text.indexOf(excerpt))).length;return {start,end:start+Array.from(excerpt).length,excerpt};};
(async () => {
  const h = createHarness(), p = profile('operations',h.blank), original = JSON.stringify(p);
  const upstream = await h.validate(p); assert.equal(upstream.schema,'passed'); assert.equal(upstream.semantics,'passed');
  const contract = {...h.load('strategy-contract.md',['fingerprint','targetFingerprint','inspectStrategy']),sha256};
  const {inspectComposition} = h.load('strategy-editorial.md',['inspectComposition']);
  const s = handoff(p,contract);
  s.questions = []; s.dispositions = []; s.diagnostics = []; s.findings = []; s.comparison = null;
  s.question_batch = {limit:3,selected_ids:[],deferred_ids:[],suppressed_ids:[]};
  s.inferred_needs = []; s.positioning.terminology = [];
  const evidence = structuredClone(s.claims[0].evidence);
  s.claims = [
    {id:'claim:manifests',proposition:'Reconciled parcel manifests.',evidence,target_references:[{namespace:'criterion',id:'criterion:one'}],limits:['Historical episode; no independent verification.'],realizations:[]},
    {id:'claim:exceptions',proposition:'Reported routing exceptions.',evidence:structuredClone(evidence),target_references:[{namespace:'criterion',id:'criterion:one'}],limits:['Reporting does not establish resolution authority.'],realizations:[]}
  ];
  const wording = {en:['Reconciled parcel manifests','reported routing exceptions'],de:['Glich Paketlisten ab','meldete Abweichungen bei der Routenplanung']};
  s.draft = {artifact_id:'fictional-composition',versions:['en','de'].map(language => {
    const text = wording[language].join(language === 'en' ? ' and ' : ' und ')+'.';
    const claims = s.claims.map((c,i) => {
      const spans = [span(text,wording[language][i])];
      c.realizations.push({language,wording:wording[language][i],spans:structuredClone(spans),semantic_state:'supported',semantic_reason:'Host reviewed the fictional statement: action and object preserved, no added authority or outcome.'});
      return {claim:ref(c.id),spans};
    });
    return {language,text,sha256:sha256(text),inventory_status:'complete',claims};
  })};
  s.positioning = {...s.positioning,audience:'Dispatch hiring team',intended_decision:'Discuss evidence of manifest accuracy and exception reporting',contribution_thesis:'Manifest reconciliation is the strongest supported contribution to this dispatch role.',selected_claims:s.claims.map(c => ({claim:ref(c.id),languages:['en','de']})),selections:s.claims.map(c => ({claim:ref(c.id),decision:'include',rationale:c.id === 'claim:manifests' ? 'Direct evidence for required reconciliation.' : 'Shows how discrepancies were communicated; does not claim resolution.'})),expertise_groups:[{name:'Manifest reconciliation and exception reporting',claims:s.claims.map(c => ref(c.id)),rationale:'Capabilities relevant to dispatch accuracy; no tool-based or leadership inference.'}]};
  s.editorial_methods = [{id:'editorial_method:embedded',name:'Embedded composition and factual language review',source:null,version:'1.0',available:true,executed:true,fallback:true,fallback_reason:'Self-contained criteria used; optional discovery and installation are outside this test.'}];
  let sequence = 0;
  const validate = async (schema,instance) => {const file = path.join(h.workspace,`composition-${++sequence}.json`);fs.writeFileSync(file,JSON.stringify(instance));return {state:classifyCheck(spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(h.skillRoot,schema),file],{encoding:'utf8',windowsHide:true})),findings:[]};};
  const host = {profile:p,binding:structuredClone(s.binding),sha256,validate,inspectStrategy:contract.inspectStrategy};
  const check = value => inspectComposition(value,host);
  const good = await check(s);assert.equal(good.schema,'passed',JSON.stringify(good));assert.equal(good.deterministic,'passed',JSON.stringify(good));assert.equal(good.host_meaning,'not_assessed');
  async function rejects(mutate,code) {const bad = structuredClone(s);mutate(bad);const r = await check(bad);assert.ok(r.schema === 'failed' || r.deterministic === 'failed',JSON.stringify(r));if(code) assert.ok(r.findings.some(f => f.code === code),JSON.stringify(r));}
  await rejects(v => v.binding.generation++, 'binding_mismatch');
  await rejects(v => v.draft.versions[0].text += ' Unreviewed addition.', 'fingerprint_mismatch');
  await rejects(v => v.claims[0].realizations[0].spans[0].end++, 'span_mismatch');
  await rejects(v => v.draft.versions[0].claims.pop(), 'inventory_realization_mismatch');
  await rejects(v => v.draft.versions[0].claims[0].claim.id = 'claim:missing', 'broken_reference');
  await rejects(v => v.positioning.selections[0].decision = 'exclude', 'selection_decision');
  await rejects(v => v.draft.versions[0].claims.push(structuredClone(v.draft.versions[0].claims[0])), 'inventory_duplicate');
  await rejects(v => v.claims[0].realizations[0].semantic_state = 'unsupported', 'selected_claim_unreviewed');
  await rejects(v => v.claims[0].realizations[0].semantic_state = 'unresolved', 'selected_claim_unreviewed');
  await rejects(v => v.claims[0].extra = true);
  const appeal = structuredClone(s), english = appeal.draft.versions[0];
  const appealWords = ['Owned dispatch operations','eliminated routing errors'];
  english.text = appealWords.join(' and ')+'.';english.sha256 = sha256(english.text);
  appeal.claims.forEach((claim,i) => {
    const spans = [span(english.text,appealWords[i])];english.claims[i].spans = spans;
    Object.assign(claim.realizations[0],{wording:appealWords[i],spans:structuredClone(spans),semantic_state:'unsupported',semantic_reason:i === 0 ? 'Reconciliation does not establish operational ownership.' : 'Reporting exceptions does not establish their elimination or causal impact.'});
  });
  assert.equal((await check(appeal)).deterministic,'failed');
  appeal.positioning.selected_claims.forEach(c => {c.languages = ['de'];});
  assert.equal((await check(appeal)).deterministic,'passed');
  const dashed = structuredClone(s);dashed.draft.versions[0].text += ' \u2014';dashed.draft.versions[0].sha256 = sha256(dashed.draft.versions[0].text);
  assert.ok((await check(dashed)).findings.some(f => f.code === 'application_dash'));
  // German drift is a host judgment. The helper only enforces that recorded state.
  const drift = structuredClone(s), german = drift.draft.versions[1];
  const changed = 'genehmigte Routenänderungen';
  german.text = wording.de[0]+' und '+changed+'.';german.sha256 = sha256(german.text);
  german.claims[1].spans = [span(german.text,changed)];
  Object.assign(drift.claims[1].realizations[1],{wording:changed,spans:structuredClone(german.claims[1].spans),semantic_state:'unsupported',semantic_reason:'Genehmigte asserts approval authority; the canonical record only supports reporting exceptions.'});
  let result = await check(drift);assert.equal(result.deterministic,'failed');
  drift.positioning.selected_claims[1].languages = ['en'];
  result = await check(drift);assert.equal(result.deterministic,'passed',JSON.stringify(result));
  assert.deepEqual(drift.positioning.selected_claims[0].languages,['en','de']);assert.deepEqual(drift.positioning.selected_claims[1].languages,['en']);
  assert.equal(drift.claims[1].proposition,s.claims[1].proposition);
  const incomplete = structuredClone(s);incomplete.draft.versions[0].inventory_status = 'incomplete';
  const partial = await check(incomplete);assert.equal(partial.inventory.en,'incomplete');assert.equal(partial.host_meaning,'not_assessed');
  assert.equal(JSON.stringify(p),original,'composition must not mutate canonical facts');
  fs.writeFileSync(path.join(h.workspace,'composition-observations.json'),JSON.stringify({supported:s,german_drift:drift,checks:{good,result,partial},limit:'Host-authored worked cases, not automated semantic classification.'},null,2));
  console.log('PASS: composition schema, binding, exact inventories, unsupported/unresolved selection, German-only drift and unchanged canonical facts.');
})().catch(e => {console.error(e);process.exitCode = 1;});
