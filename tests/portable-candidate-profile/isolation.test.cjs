'use strict';
const assert = require('node:assert/strict');
const { run, scanAssets } = require('./isolation.cjs');
// Prove the scan recognizes representative leaks, without accessing private inputs.
assert.deepEqual(scanAssets([{ path: 'probe.md', text: 'Orla Cloudquill' }]).map(f => f.code), ['synthetic_candidate']);
assert.equal(scanAssets([{ path: 'probe.md', text: String.raw`C:\Users\fictional-host\facts.json` }])[0].code, 'machine_path');
assert.equal(scanAssets([{ path: 'probe.md', text: '/home/fictional-host/facts.json' }])[0].code, 'machine_path');
assert.deepEqual(scanAssets([{ path: 'probe.json', text: 'https://json-schema.org/draft/2020-12/schema' }]), []);
run().then(evidence => {
  const expected = ['absent-selection', 'missing-path', 'unreadable-path', 'hostile-incomplete-source', 'first-selected-write', 'switch-clears-state-authority', 'second-selected-write', 'return-to-first', 'reusable-assets'];
  assert.deepEqual(evidence.cases.map(c => c.id), expected);
  for (const c of evidence.cases) {
    assert.equal(c.matches_expectation, true, c.id);
    assert.deepEqual(c.observed, c.expected, c.id);
    assert.ok(c.requirements.length, c.id);
  }
  const covered = new Set(evidence.cases.flatMap(c => c.requirements));
  for (const id of ['1.1','1.2','1.3','1.4','1.5','3.1','3.2','3.3','3.4','3.5','7.1','7.2','7.3','7.4','7.5']) assert.ok(covered.has(id), id);
  assert.equal(evidence.replacements, 2);
  assert.ok(evidence.validator_executions >= 10);
  for (const v of evidence.validators) { assert.equal(v.state, 'passed'); assert.equal(v.exit_status, 0); }
  assert.ok(evidence.asset_count > 5);
  console.log(`Profile isolation: ${evidence.cases.length} named scenarios passed; ${evidence.validator_executions} real schema executions; 2 Windows replacements; ${evidence.asset_count} reusable assets scanned.`);
}).catch(error => { console.error(error); process.exitCode = 1; });
