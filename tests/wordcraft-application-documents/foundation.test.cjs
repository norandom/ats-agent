const test = require('node:test');
const assert = require('node:assert/strict');
const { prepare, privateDestination, readOnlyTool } = require('./foundation.cjs');

test('fictional bilingual pair validates through unchanged upstream contracts', async () => {
  const f = await prepare();
  assert.deepEqual([f.profileReport.schema, f.profileReport.semantics], ['passed', 'passed']);
  assert.deepEqual([f.strategyReport.schema, f.strategyReport.deterministic, f.strategyReport.host_meaning], ['passed', 'passed', 'not_assessed']);
  assert.deepEqual(f.strategy.settings.requested_documents, ['cv', 'cover_letter']);
  assert.deepEqual(f.strategy.settings.languages, ['en', 'de']);
  assert.equal(f.profile.candidate.name, 'Ivo Paperbrook');
  assert.ok(f.longProfile.employment.length >= 30);
  for (const language of ['en','de']) assert.ok(f.paginationText[language].length > 5000);
  assert.deepEqual([f.longReport.schema, f.longReport.semantics], ['passed', 'passed']);
  assert.equal(f.metadata.complete.application_date, '2026-10-26');
  assert.equal(f.metadata.missing.recipient_address, null);
  assert.equal(f.metadata.missing.application_date, null);
  assert.equal(f.sessionFindings.length, 0);
});

test('private destinations and inspection allowlist fail closed', () => {
  assert.throws(() => privateDestination('tests/leak'), /ignored outputs/);
  assert.throws(() => privateDestination('outputs/../tests/leak'), /ignored outputs/);
  assert.throws(() => readOnlyTool('execute', []), /Read-only/);
  assert.throws(() => readOnlyTool('get_text', []), /unavailable/);
  assert.throws(() => readOnlyTool('get_text', [{name:'get_text', inputSchema:{required:['path']}}]), /changed/);
});
