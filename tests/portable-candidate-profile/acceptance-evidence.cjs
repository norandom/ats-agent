'use strict';
// Test-only output: never persist candidate payloads or destination paths here.
const assert = require('node:assert/strict');
const fs = require('node:fs');
module.exports = () => {
  const cases = [];
  return {
    record(name, requirements, observed, expected) {
      assert.deepEqual(observed, expected, name);
      assert.ok(!cases.some(c => c.name === name), 'duplicate observation');
      cases.push({ name, requirements, observed, expected });
    },
    finish() {
      if (process.env.PROFILE_ACCEPTANCE_EVIDENCE) fs.writeFileSync(process.env.PROFILE_ACCEPTANCE_EVIDENCE, JSON.stringify({
        limitations: 'Synthetic test-owned Windows workspace; protected DACL only. No general host concurrency or complete filesystem security assurance.', cases
      }, null, 2) + '\n', { flag: 'wx' });
    }
  };
};
