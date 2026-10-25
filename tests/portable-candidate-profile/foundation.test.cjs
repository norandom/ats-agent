'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { runFoundation, classifyCheck, writeDecision } = require('./foundation.cjs');

assert.equal(classifyCheck({ status: 0 }), 'passed');
assert.equal(classifyCheck({ status: 1 }), 'failed');
assert.equal(classifyCheck({ status: null, error: { code: 'ENOENT' } }), 'not_assessed');
assert.equal(classifyCheck({ status: null, signal: 'SIGTERM' }), 'not_assessed');
assert.equal(writeDecision({ replacement: 'passed', read_back: 'passed', single_writer: 'not_assessed', security: 'passed' }), 'deferred');
assert.equal(writeDecision({ replacement: 'passed', read_back: 'not_assessed', single_writer: 'passed', security: 'passed' }), 'unconfirmed');
assert.equal(writeDecision({ replacement: 'passed', read_back: 'passed', single_writer: 'passed', security: 'passed' }), 'confirmed');
const result = runFoundation();
assert.equal(result.evidence.tools.uv, 'passed');
assert.equal(result.evidence.tools.uvx, 'passed');
assert.equal(result.evidence.validator.version, 'passed');
assert.equal(result.evidence.validator.local_ref_valid, 'passed');
assert.equal(result.evidence.validator.local_ref_invalid, 'failed');
assert.equal(result.evidence.validator.missing_executable, 'not_assessed');
for (const operation of ['computation', 'hashing', 'staging', 'backup', 'replacement', 'read_back']) {
  assert.equal(result.evidence.host[operation], 'passed', operation);
}
assert.equal(result.evidence.host.security, 'not_assessed');
assert.equal(result.evidence.profile_write, 'deferred');
assert.equal(result.evidence.profile_semantics, 'not_assessed');
assert.equal(fs.readFileSync(path.join(result.workspace, 'original.backup.json'), 'utf8'), '{"probe":"synthetic"}\n');
assert.equal(fs.readFileSync(path.join(result.workspace, 'selected.json'), 'utf8'), '{"probe":"replacement"}\n');
assert.equal(fs.existsSync(path.join(result.workspace, 'selected.stage.json')), false);
assert.deepEqual(JSON.parse(fs.readFileSync(path.join(result.workspace, 'evidence.json'), 'utf8')), result.evidence);
console.log('PASS profile foundation: pinned local-ref validation, negative and unavailable checks, synthetic host capabilities; profile writes deferred');
