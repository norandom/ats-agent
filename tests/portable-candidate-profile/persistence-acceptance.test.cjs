'use strict';
// Run existing protocol suites once, then require their assertion-backed observations.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const output = path.join(root, 'outputs/profile-tests');
fs.mkdirSync(output, { recursive: true });
const workspace = fs.mkdtempSync(path.join(output, 'persistence-acceptance-'));
const expected = {
  persistence: ['approved', 'declined', 'document_only', 'already_authorized', 'forged', 'mutated', 'invalid', 'stale', 'selection', 'no_writer', 'no_security', 'stage_failure', 'bad_stage', 'bad_backup', 'lost_ack', 'read_failure', 'mismatch', 'security_failure', 'validation_failure', 'late_stale', 'native_creation_policy', ...['success','lost_ack','read_failure','collision','atomic_collision','partial','absent','policy','validation','source_changed','selection','busy','replaced_identity','restart','late_source','late_selection','source_identity','release_failure','release_selection','pre_validation','scoped'].map(mode => 'version_' + mode)],
  'migration-integration': ['migration_preserved']
};
for (const [suite, names] of Object.entries(expected)) {
  const evidencePath = path.join(workspace, suite + '.json');
  if (!process.argv.includes('--missing-evidence-probe')) {
    const result = spawnSync(process.execPath, [path.join(__dirname, suite + '.test.cjs')], {
      encoding: 'utf8', windowsHide: true, env: { ...process.env, PROFILE_ACCEPTANCE_EVIDENCE: evidencePath }
    });
    process.stdout.write(result.stdout || '');
    assert.equal(result.status, 0, result.stderr || 'suite did not complete');
  }
  assert.ok(fs.existsSync(evidencePath), `${suite}: missing observed acceptance evidence`);
  const evidence = JSON.parse(fs.readFileSync(evidencePath));
  assert.deepEqual(evidence.cases.map(c => c.name).sort(), [...names].sort());
  for (const c of evidence.cases) {
    assert.ok(c.requirements.length && c.requirements.every(r => /^(2\.6|6\.[1-7]|7\.[35]|8\.[1-7])$/.test(r)));
    assert.ok(c.observed && Object.keys(c.observed).length, `${c.name}: missing observed result`);
    assert.deepEqual(c.observed, c.expected, c.name);
  }
}
console.log(`Persistence acceptance: ${Object.values(expected).flat().length} named observations verified in fresh ignored evidence files. Actual Windows ordinary-user native new-file policy and retained isolated replacement/migration; broader filesystem properties and installed acceptance remain unassessed.`);
