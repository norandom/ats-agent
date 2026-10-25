'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const load = (file, names) => new Function(fs.readFileSync(path.join(root, 'skills/targeted-cv/references', file), 'utf8').match(/```javascript\r?\n([\s\S]*?)```/)[1] + `;return {${names}};`)();
const { createProfileUpdates } = load('profile-updates.md', 'createProfileUpdates');
const { validateProfile } = load('profile-validation.md', 'validateProfile');
const blank = require('../../skills/targeted-cv/templates/cv-facts.blank.json');
const populated = require('./fixtures/populated.cjs');
let checks = 0;
const check = (actual, expected) => { assert.deepEqual(actual, expected); checks++; };
const base = populated(blank); base.evidence = []; base.review_questions = [];
function setup() {
  let selection = { generation: 1, selection: { resolved_path: '/synthetic/a.json', profile_sha256: 'a'.repeat(64) }, profile: structuredClone(base) };
  let decision = 'approved', calls = 0;
  const host = { currentSelection: () => structuredClone(selection),
    validate: p => validateProfile(p, { validate: async () => ({ state: 'passed', findings: [] }) }),
    userDecision: async reviewed => { calls++; return { decision, reviewed, authorization: { id: 'auth-new', scope: reviewed.scope, request_reference: 'synthetic-user-turn', approved_at: '2026-10-25T12:00:00Z', proposal_id: reviewed.proposal_id, resolved_path: reviewed.resolved_path } }; },
    now: () => '2026-10-25T12:01:00Z' };
  const proposed = structuredClone(base); proposed.candidate.name = 'Fictional Updated Person';
  const proposal = { proposal_id: 'proposal-new', history_id: 'history-new', scope: 'fact_update', source_ids: ['source-demo'], proposed_profile: proposed,
    changes: [{ pointer: '/candidate/name', before: base.candidate.name, after: proposed.candidate.name, reason: 'Synthetic explicit correction.' }] };
  return { host, proposal, selection, api: createProfileUpdates(host), decline: () => decision = 'declined', switch: () => { selection = { ...selection, generation: 2 }; }, calls: () => calls };
}
async function run() {
  const a = setup(), before = JSON.stringify(a.selection);
  const accepted = await a.api.prepare(a.selection, a.proposal);
  check(accepted.status, 'unconfirmed'); check(accepted.decision_state, 'authorized'); check(accepted.resulting_sha256, null);
  check(accepted.proposed_profile.change_history.length, base.change_history.length + 1);
  check(accepted.proposed_profile.sources, base.sources); check(JSON.stringify(a.selection), before);
  check((await a.api.prepare(a.selection, a.proposal)).decision_state, 'authorized'); check(a.calls(), 1);
  // Exact cached scope cannot authorize an altered proposal.
  a.host.userDecision = async () => null; a.proposal.changes[0].reason = 'Changed review reason';
  check((await a.api.prepare(a.selection, a.proposal)).decision_state, 'decision_required');
  const d = setup(); d.decline(); check((await d.api.prepare(d.selection, d.proposal)).status, 'rejected'); check(d.selection.profile, base);
  const s = setup(); await s.api.prepare(s.selection, s.proposal); s.switch(); check((await s.api.prepare(s.selection, s.proposal)).status, 'conflict');
  for (const edit of [x => x.proposal.changes[0].before = 'wrong', x => x.proposal.proposed_profile.candidate.id = 'new-id', x => x.proposal.proposed_profile.sources = [], x => x.proposal.proposed_profile.change_history = [], x => x.proposal.source_ids = ['missing'], x => x.proposal.proposed_profile.candidate.phone = 'undeclared']) {
    const x = setup(); edit(x); check((await x.api.prepare(x.selection, x.proposal)).status, 'rejected'); check(x.calls(), 0);
  }
  for (const decision of ['document_only', null, 'source_instruction']) { const x = setup(); x.host.userDecision = async () => ({ decision }); check((await x.api.prepare(x.selection, x.proposal)).decision_state, 'decision_required'); }
  const forged = setup(); forged.host.userDecision = async reviewed => ({ decision: 'approved', reviewed: { ...reviewed, base_sha256: 'b'.repeat(64) }, authorization: base.change_history[0].authorization });
  check((await forged.api.prepare(forged.selection, forged.proposal)).decision_state, 'decision_required');
  const race = setup(); race.host.userDecision = async reviewed => { race.switch(); return { decision: 'declined', reviewed }; }; check((await race.api.prepare(race.selection, race.proposal)).status, 'conflict');
  const unavailable = setup(); unavailable.host.validate = async () => ({ schema: 'not_assessed', semantics: 'not_assessed' }); check((await unavailable.api.prepare(unavailable.selection, unavailable.proposal)).decision_state, 'validation_required');
  // Actual structural validator plus the exact semantic validator, not the branch-test adapter above.
  fs.mkdirSync(path.join(root, 'outputs/profile-tests'), { recursive: true });
  const work = fs.mkdtempSync(path.join(root, 'outputs/profile-tests/updates-'));
  const real = setup(); real.host.validate = async p => {
    const input = path.join(work, 'synthetic.json'); fs.writeFileSync(input, JSON.stringify(p));
    return validateProfile(p, { validate: async () => {
      const r = spawnSync('uvx', ['--from', 'check-jsonschema==0.38.2', 'check-jsonschema', '--schemafile', path.join(root, 'skills/targeted-cv/schemas/cv-facts.schema.json'), input], { encoding: 'utf8', windowsHide: true });
      assert.equal(r.status, 0, r.stderr || r.stdout); return { state: 'passed', findings: [] };
    } });
  };
  check((await real.api.prepare(real.selection, real.proposal)).decision_state, 'authorized');
  const declined = setup(); declined.host.validate = real.host.validate; declined.decline(); check((await declined.api.prepare(declined.selection, declined.proposal)).status, 'rejected');
  const initial = setup(); initial.selection.profile = structuredClone(blank); initial.proposal.scope = 'initial_intake';
  initial.proposal.proposed_profile = structuredClone(blank); initial.proposal.proposed_profile.candidate.name = 'Fictional New Person';
  initial.proposal.proposed_profile.candidate.source_ids = ['source-demo']; initial.proposal.proposed_profile.sources = structuredClone(base.sources);
  initial.proposal.changes = [{ pointer: '', before: structuredClone(blank), after: structuredClone(initial.proposal.proposed_profile), reason: 'Explicit synthetic initial intake.' }];
  initial.host.validate = real.host.validate; check((await initial.api.prepare(initial.selection, initial.proposal)).decision_state, 'authorized');
  const { proposeMigration } = load('profile-contract.md', 'proposeMigration');
  const bytes = fs.readFileSync(path.join(root, 'tests/fantasy-cv/facts.json'));
  const hash = require('node:crypto').createHash('sha256').update(bytes).digest('hex');
  const migrated = await proposeMigration(bytes, { sha256: () => hash, decodeUtf8: b => new TextDecoder('utf-8', { fatal: true }).decode(b), validate: async () => 'passed' });
  const migration = setup(); migration.selection.profile = JSON.parse(bytes); migration.selection.selection.profile_sha256 = hash;
  migration.proposal.scope = 'migration'; migration.proposal.proposed_profile = migrated.profile; migration.proposal.source_ids = migrated.profile.sources.map(s => s.id);
  migration.proposal.changes = [{ pointer: '', before: JSON.parse(bytes), after: structuredClone(migrated.profile), reason: 'Synthetic migration review acknowledges: ' + migrated.required_acknowledgements.join(', ') }];
  migration.host.validate = real.host.validate; const migratedDecision = await migration.api.prepare(migration.selection, migration.proposal);
  check(migratedDecision.decision_state, 'authorized'); check(migratedDecision.proposed_profile.migration_origin.original_profile, JSON.parse(bytes));
  const duringValidation = setup(); duringValidation.host.validate = async () => { duringValidation.switch(); return { schema: 'passed', semantics: 'passed' }; }; check((await duringValidation.api.prepare(duringValidation.selection, duringValidation.proposal)).status, 'conflict');
  const unavailableDecision = setup(); unavailableDecision.host.userDecision = async () => { throw Error('unavailable'); }; check((await unavailableDecision.api.prepare(unavailableDecision.selection, unavailableDecision.proposal)).decision_state, 'decision_required');
  console.log(`Profile update decisions: ${checks} checks passed; actual schema and semantic validation executed.`);
}
run().catch(e => { console.error(e); process.exitCode = 1; });
