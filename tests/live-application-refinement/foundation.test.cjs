'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { prepare, freshRun, privateDestination } = require('./foundation.cjs');
const { requireLiveEvidence } = require('./acceptance-check.cjs');

test('two fictional applicants validate with isolated bilingual document members', async () => {
  const result = await prepare();
  assert.equal(result.applicants.length, 2);
  assert.notEqual(result.applicants[0].profile.candidate.id, result.applicants[1].profile.candidate.id);
  for (const applicant of result.applicants) {
    assert.equal(applicant.validation.schema, 'passed');
    assert.equal(applicant.validation.semantics, 'passed');
    assert.deepEqual(applicant.members.map(m => `${m.kind}:${m.language}`).sort(), ['cover_letter:de','cover_letter:en','cv:de','cv:en']);
    assert.equal(new Set(applicant.members.map(m => m.destination)).size, 4);
    for (const member of applicant.members) assert.ok(member.destination.startsWith(result.destination + path.sep));
  }
  assert.equal(result.embeddedContent.authorization, 'not_granted');
  assert.equal(result.liveAuthoring, 'not_assessed');
  assert.ok(fs.existsSync(path.join(result.destination, 'fixtures.json')));
});

test('private fresh runs reject shareable paths and never overwrite', () => {
  assert.throws(() => privateDestination('tests/leak'), /ignored outputs/);
  assert.throws(() => privateDestination('outputs/../tests/leak'), /ignored outputs/);
  const a = freshRun(), b = freshRun();
  assert.notEqual(a,b);
});

test('initial inventory lists only existing explicit assets', () => {
  const manifest = require('./acceptance-manifest.json');
  const files = [...manifest.runtime, ...manifest.tests];
  assert.equal(new Set(files).size, files.length);
  for (const file of files) {
    assert.ok(!path.isAbsolute(file) && !file.includes('..'));
    assert.ok(fs.statSync(path.resolve(__dirname,'../..',file)).isFile(), file);
  }
  assert.equal(manifest.phase, 'final-validation');
});

test('missing or catalog-only live evidence cannot pass final acceptance', () => {
  for (const receipt of [null, {}, {kind:'simulated_control'}, {kind:'actual_mcp_read_only', status:'observed'}]) {
    assert.throws(() => requireLiveEvidence(receipt), /Missing live refinement evidence/);
  }
});
