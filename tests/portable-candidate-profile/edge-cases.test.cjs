'use strict';
const assert = require('node:assert/strict');
const { run } = require('./edge-cases.cjs');
run().then(evidence => {
  const ids = evidence.cases.map(c => c.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ['valid', 'blank', 'malformed-json', 'unsupported-version', 'malformed-record', 'duplicate-id', 'missing-source', 'wrong-kind', 'invalid-calendar', 'mixed-precision', 'impossible-chronology', 'null-end', 'bounded-current', 'undated-current', 'verification-upgrade', 'conflict-open', 'conflict-resolved', 'conflict-mismatch', 'required-missing', 'optional-unknown', 'validator-unavailable', 'semantics-unavailable', 'no-task', ...['supported', 'uncertain', 'absent', 'transferable', 'confirmed_gap'].map(s => `evidence-${s}`), ...['answered', 'skipped', 'not_applicable', 'confirmed_gap'].map(s => `question-${s}`)]) assert.ok(ids.includes(id), id);
  for (const c of evidence.cases) {
    assert.equal(c.matches_expectation, true, c.id);
    assert.ok(c.requirements.length, c.id);
    assert.ok(c.observed && c.expected, c.id);
    for (const f of c.observed.findings) assert.ok('pointer' in f && 'record_id' in f && f.code && f.message && f.corrective_action, c.id);
    if (c.observed.schema === 'passed') assert.equal(c.validator.exit_status, 0, c.id);
    if (c.observed.semantics === 'passed') assert.equal(c.semantic_execution, 'executed_reference', c.id);
  }
  const covered = new Set(evidence.cases.flatMap(c => c.requirements));
  for (const requirement of ['2.1', '2.2', '2.3', '2.4', '2.5', '3.3', '3.4', '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7']) assert.ok(covered.has(requirement), requirement);
  for (const [id, pointer] of Object.entries({ 'malformed-record': '/candidate', 'duplicate-id': '/languages/0/id', 'missing-source': '/candidate/source_ids/0', 'wrong-kind': '/projects/0/employer_id', 'invalid-calendar': '/employment/0/start', 'verification-upgrade': '/sources/0/verification_basis', 'required-missing': '/candidate/email' })) assert.ok(evidence.cases.find(c => c.id === id).observed.findings.some(f => f.pointer === pointer), `${id}: actionable field finding`);
  for (const id of ['unsupported-version', 'malformed-json']) assert.equal(evidence.cases.find(c => c.id === id).validator.execution, 'not_called', id);
  console.log(`Profile edge cases: ${ids.length} observed outcomes passed; ${evidence.validator_executions} real pinned schema executions.`);
}).catch(error => { console.error(error); process.exitCode = 1; });
