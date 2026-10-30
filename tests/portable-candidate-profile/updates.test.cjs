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
  const version = setup();
  version.host.creationPolicyId = 'windows-private-new-file-v1';
  version.host.sha256 = async () => 'a'.repeat(64);
  version.host.acquireCreate = async options => {
    check(options.phase, 'inspect');
    return { policy_id: options.policy_id, phase: 'inspect', destination: options.destination,
      private_location: true, stable_identity: true, single_writer: true,
      source_identity: 'source-id', parent_identity: 'parent-id', destination_identity: null,
      readSource: async () => 'source-bytes', readDestination: async () => null,
      verifyPolicy: async () => true, release: async () => {} };
  };
  const successor = await version.api.prepareVersion(version.selection, version.proposal, '/synthetic/new.json');
  check(successor.decision_state, 'authorized');
  check(successor.reviewed.storage_mode, 'new_version');
  check(successor.reviewed.source_selection, { ...version.selection.selection, schema_version: '2.0' });
  check(successor.reviewed.resolved_path, '/synthetic/new.json');
  check(successor.reviewed.creation_policy_id, 'windows-private-new-file-v1');
  check(successor.proposed_profile.change_history.slice(0, -1), base.change_history);
  check(version.selection.profile, base);
  check((await version.api.persist(successor)).decision_state, 'decision_required');
  check((await version.api.persistFork(successor)).decision_state, 'decision_required');
  check((await version.api.prepareVersion(version.selection, version.proposal, '/synthetic/new.json')).decision_state, 'authorized');
  check(version.calls(), 1);
  version.host.userDecision = async () => null;
  check((await version.api.prepareVersion(version.selection, version.proposal, '/synthetic/other.json')).decision_state, 'decision_required');
  const versionSetup = () => {
    const x = setup();
    x.host.creationPolicyId = 'windows-private-new-file-v1';
    x.host.sha256 = async () => 'a'.repeat(64);
    x.host.acquireCreate = version.host.acquireCreate;
    return x;
  };
  for (const mutate of [
    x => x.host.creationPolicyId = 'unassessed',
    x => x.host.acquireCreate = async () => null,
    x => x.host.sha256 = async () => 'b'.repeat(64),
    x => { const acquire = x.host.acquireCreate; x.host.acquireCreate = async o => ({ ...await acquire(o), readDestination: async () => '' }); },
    x => { const acquire = x.host.acquireCreate; x.host.acquireCreate = async o => ({ ...await acquire(o), verifyPolicy: async () => false }); },
    x => { const acquire = x.host.acquireCreate; x.host.acquireCreate = async o => ({ ...await acquire(o), destination: '/synthetic/foreign.json' }); },
    x => x.proposal.scope = 'migration',
    x => x.proposal.proposed_profile.schema_version = '2.1',
    x => x.proposal.proposed_profile.migration_origin = { forged: true }
  ]) {
    const x = versionSetup(); mutate(x);
    const r = await x.api.prepareVersion(x.selection, x.proposal, '/synthetic/new.json');
    assert.notEqual(r.decision_state, 'authorized'); check(x.calls(), 0);
  }
  const sameTarget = versionSetup(); check((await sameTarget.api.prepareVersion(sameTarget.selection, sameTarget.proposal, sameTarget.selection.selection.resolved_path)).status, 'rejected');
  const unready = versionSetup(); unready.host.taskRequest = {}; unready.host.validate = async () => ({schema:'passed', semantics:'passed', readiness:'blocked'});
  check((await unready.api.prepareVersion(unready.selection, unready.proposal, '/synthetic/new.json')).decision_state, 'validation_required'); check(unready.calls(), 0);
  const switchedVersion = versionSetup(); switchedVersion.host.userDecision = async reviewed => { switchedVersion.switch(); return { decision: 'declined', reviewed }; };
  check((await switchedVersion.api.prepareVersion(switchedVersion.selection, switchedVersion.proposal, '/synthetic/new.json')).status, 'conflict');
  const lateCollision = versionSetup(); let occupied = false;
  const inspectAcquire = lateCollision.host.acquireCreate;
  lateCollision.host.acquireCreate = async o => ({ ...await inspectAcquire(o), readDestination: async () => occupied ? 'occupied' : null });
  const approve = lateCollision.host.userDecision;
  lateCollision.host.userDecision = async reviewed => { const d = await approve(reviewed); occupied = true; return d; };
  check((await lateCollision.api.prepareVersion(lateCollision.selection, lateCollision.proposal, '/synthetic/new.json')).status, 'conflict');
  const choicesVersion = versionSetup();
  const choices = { facts: [{ statement_id: 'statement-demo', use: 'application_and_reusable', source_ids: choicesVersion.proposal.source_ids, changes: choicesVersion.proposal.changes }] };
  choicesVersion.proposal.selection_effect = 'select_after_confirmation';
  const chosenVersion = await choicesVersion.api.prepareVersion(choicesVersion.selection, choicesVersion.proposal, '/synthetic/new.json', choices);
  check(chosenVersion.decision_state, 'authorized'); check(chosenVersion.reviewed.statement_choices, choices); check(chosenVersion.reviewed.selection_effect, 'select_after_confirmation');
  choices.facts[0].use = 'application_only';
  check((await choicesVersion.api.prepareVersion(choicesVersion.selection, choicesVersion.proposal, '/synthetic/new.json', choices)).status, 'rejected');
  const foreign = versionSetup(); foreign.host.userDecision = async () => ({decision:'approved', reviewed: successor.reviewed, authorization: successor.authorization});
  check((await foreign.api.prepareVersion(foreign.selection, foreign.proposal, '/synthetic/foreign.json')).decision_state, 'decision_required');
  check((await foreign.api.persist(structuredClone(successor))).decision_state, 'decision_required');
  const releaseFailure = versionSetup(); const releaseAcquire = releaseFailure.host.acquireCreate;
  releaseFailure.host.acquireCreate = async o => ({ ...await releaseAcquire(o), release: async () => { throw Error('lease uncertain'); } });
  check((await releaseFailure.api.prepareVersion(releaseFailure.selection, releaseFailure.proposal, '/synthetic/new.json')).decision_state, 'creation_policy_required');
  const priorReplacement = versionSetup(); const oldApproval = await priorReplacement.api.prepare(priorReplacement.selection, priorReplacement.proposal);
  priorReplacement.host.userDecision = async () => ({decision:'approved', reviewed:oldApproval.reviewed, authorization:oldApproval.authorization});
  check((await priorReplacement.api.prepareVersion(priorReplacement.selection, priorReplacement.proposal, '/synthetic/new.json')).decision_state, 'decision_required');
  const scopedVersion = versionSetup();
  const scope = { application_id: 'application-fictional', target_sha256: 'c'.repeat(64), origin_profile: {schema_version: '2.0', resolved_path: '/synthetic/origin.json', sha256: 'd'.repeat(64)} };
  scopedVersion.selection.profile.schema_version = '2.1'; scopedVersion.selection.profile.application_scope = scope;
  scopedVersion.proposal.scope = 'application_fact_update'; scopedVersion.proposal.proposed_profile.schema_version = '2.1'; scopedVersion.proposal.proposed_profile.application_scope = structuredClone(scope);
  scopedVersion.host.currentApplicationSelection = () => ({application_id: scope.application_id, target_sha256: scope.target_sha256});
  scopedVersion.host.validate = p => validateProfile(p, { applicationSelection: scopedVersion.host.currentApplicationSelection(), validate: async () => ({state:'passed', findings:[]}) });
  const scopedDecision = await scopedVersion.api.prepareVersion(scopedVersion.selection, scopedVersion.proposal, '/synthetic/application-new.json');
  check(scopedDecision.decision_state, 'authorized'); check(scopedDecision.proposed_profile.application_scope, scope);
  scopedVersion.proposal.proposed_profile.application_scope.origin_profile.sha256 = 'e'.repeat(64);
  check((await scopedVersion.api.prepareVersion(scopedVersion.selection, scopedVersion.proposal, '/synthetic/application-new.json')).status, 'rejected');
  scopedVersion.proposal.proposed_profile.schema_version = '2.0';
  check((await scopedVersion.api.prepareVersion(scopedVersion.selection, scopedVersion.proposal, '/synthetic/promoted.json')).status, 'rejected');
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
      const r = spawnSync('uvx', ['--from', 'check-jsonschema==0.38.2', 'check-jsonschema', '--schemafile', path.join(root, p.schema_version === '2.1' ? 'skills/targeted-cv/schemas/cv-facts-application.schema.json' : 'skills/targeted-cv/schemas/cv-facts.schema.json'), input], { encoding: 'utf8', windowsHide: true });
      assert.equal(r.status, 0, r.stderr || r.stdout); return { state: 'passed', findings: [] };
    }, applicationSelection: real.host.applicationSelection });
  };
  check((await real.api.prepare(real.selection, real.proposal)).decision_state, 'authorized');
  const realVersion = versionSetup(); realVersion.host.validate = real.host.validate;
  check((await realVersion.api.prepareVersion(realVersion.selection, realVersion.proposal, '/synthetic/new.json')).decision_state, 'authorized');
  scopedVersion.proposal.proposed_profile.schema_version = '2.1'; scopedVersion.proposal.proposed_profile.application_scope = structuredClone(scope);
  real.host.applicationSelection = scopedVersion.host.currentApplicationSelection(); scopedVersion.host.validate = real.host.validate;
  check((await scopedVersion.api.prepareVersion(scopedVersion.selection, scopedVersion.proposal, '/synthetic/application-new.json')).decision_state, 'authorized');
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
