'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { profile, offer } = require('./fixtures.cjs');
const { createHarness, extractBlock, classifyCheck } = require('./foundation.cjs');

async function run() {
  assert.throws(() => extractBlock('no code', ['missing']), /exactly one/);
  assert.throws(() => extractBlock('```javascript\nconst x=1;\n```\n```javascript\nconst x=2;\n```', ['x']), /exactly one/);
  assert.throws(() => extractBlock('```javascript\nconst x=1;\n```', ['absent']), /absent/);
  assert.equal(extractBlock('```javascript\nconst x=7;\n```', ['x']).x, 7);
  assert.equal(classifyCheck({ status: null, error: { code: 'ENOENT' } }), 'not_assessed');
  const h = createHarness();
  assert.equal(h.tools.node, 'passed'); assert.equal(h.tools.uvx, 'passed'); assert.equal(h.tools.validator, 'passed');
  for (const kind of ['operations', 'laboratory']) {
    const p = profile(kind, h.blank);
    assert.notEqual(p.candidate.name, profile(kind === 'operations' ? 'laboratory' : 'operations', h.blank).candidate.name);
    p.candidate.name = 'Changed synthetic name';
    assert.notEqual(p.candidate.name, profile(kind, h.blank).candidate.name);
    assert.ok(offer(kind).text.length);
    const result = await h.validate(profile(kind, h.blank));
    assert.deepEqual([result.schema, result.semantics, result.readiness], ['passed', 'passed', 'not_assessed']);
  }
  const invalid = profile('operations', h.blank); invalid.unexpected = true;
  assert.equal((await h.validate(invalid)).schema, 'failed');
  const broken = profile('operations', h.blank); broken.candidate.source_ids = ['missing-source'];
  const semantic = await h.validate(broken);
  assert.equal(semantic.schema, 'passed'); assert.equal(semantic.semantics, 'failed');
  const unavailable = await h.validate(profile('operations', h.blank), { executable: path.join(h.workspace, 'missing-validator') });
  assert.deepEqual([unavailable.schema, unavailable.semantics], ['not_assessed', 'not_assessed']);
  const selected = h.select(profile('operations', h.blank));
  assert.equal(selected.selection.status, 'selected');
  assert.equal(selected.snapshot.profile.candidate.name, profile('operations', h.blank).candidate.name);
  const relocated = createHarness({ relocate: true });
  assert.notEqual(relocated.skillRoot, h.skillRoot);
  const smoke = await relocated.validate(relocated.select(profile('laboratory', relocated.blank)).snapshot.profile);
  assert.deepEqual([smoke.schema, smoke.semantics], ['passed', 'passed']);
  for (const asset of relocated.assets) assert.equal(asset.sha256, asset.relocated_sha256);
  assert.equal(fs.existsSync(path.join(relocated.workspace, 'ats_agent.py')), false);
  h.saveEvidence(); relocated.saveEvidence();
  assert.equal(h.evidence.reasoning, 'not_assessed');
  assert.ok(h.evidence.checks.every(c => c.method === 'executed_upstream_validation'));
  console.log('Strategy foundation passed: real schema/semantic checks, invalid schema/reference/unavailable negatives, fictional selection and byte-identical relocation. Host reasoning not assessed.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
