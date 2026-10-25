'use strict';
// Test-only composition of the exact installed protocol blocks. Fictional sources only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..'), skill = path.join(root, 'skills/targeted-cv');
const read = name => fs.readFileSync(path.join(skill, 'references', name), 'utf8');
const load = (name, exports) => new Function(read(name).match(/```javascript\r?\n([\s\S]*?)```/)[1] + `;return {${exports}};`)();
const { createProfileIntake } = load('candidate-profile.md', 'createProfileIntake');
const { dispatchVersion, proposeMigration } = load('profile-contract.md', 'dispatchVersion,proposeMigration');
const { validateProfile } = load('profile-validation.md', 'validateProfile');
const { createProfileUpdates } = load('profile-updates.md', 'createProfileUpdates');
const original = fs.readFileSync(path.join(root, 'tests/fantasy-cv/facts.json'));
const legacy = JSON.parse(original);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
let checks = 0, validations = 0, replacements = 0, decisions = 0, leases = 0;
const check = (actual, expected) => { assert.deepEqual(actual, expected); checks++; };
function ps(script, env) {
  const result = spawnSync('pwsh', ['-NoProfile', '-NonInteractive', '-Command', '$ErrorActionPreference="Stop"; ' + script], { encoding: 'utf8', windowsHide: true, env: { ...process.env, ...env } });
  assert.equal(result.status, 0, result.stderr); return result.stdout.trim();
}
const acl = file => ps('(Get-Acl -LiteralPath $env:TEST_FILE).Sddl', { TEST_FILE: file });
async function run() {
  assert.match(read('profile-contract.md'), /## Integrated migration host sequence/, 'migration reference must connect proposal, acknowledgement and persistence');
  assert.equal(process.platform, 'win32', 'This test adapter verifies Windows File.Replace and SDDL only.');
  const output = path.join(root, 'outputs/profile-tests'); fs.mkdirSync(output, { recursive: true });
  const workspace = fs.mkdtempSync(path.join(output, 'migration-integration-'));
  const selectedPath = path.join(workspace, 'selected.json'), other = path.join(workspace, 'unselected.json');
  fs.writeFileSync(selectedPath, original); fs.writeFileSync(other, original);
  ps('$a=Get-Acl -LiteralPath $env:TEST_FILE; $a.SetAccessRuleProtection($true,$true); Set-Acl -LiteralPath $env:TEST_FILE -AclObject $a', { TEST_FILE: selectedPath });
  const security = acl(selectedPath), backups = [];
  const intake = createProfileIntake({ resolvePath: (w, p) => path.resolve(w, p), realpath: fs.realpathSync, readBytes: fs.readFileSync, decodeUtf8: b => new TextDecoder('utf-8', { fatal: true }).decode(b), sha256: hash });
  const select = () => intake.select({ workspace_root: workspace, facts_path: 'selected.json' });
  check(select().status, 'selected');
  const selected = intake.snapshot();
  check(dispatchVersion(selected.profile).status, 'migration_required');
  check(fs.readFileSync(selectedPath), original);
  async function schemaCheck(schema, value) {
    const file = path.join(workspace, 'validation-' + (++validations) + '.json'); fs.writeFileSync(file, JSON.stringify(value));
    const r = spawnSync('uvx', ['--from', 'check-jsonschema==0.38.2', 'check-jsonschema', '--schemafile', path.join(skill, schema), file], { encoding: 'utf8', windowsHide: true, timeout: 120000 });
    return r.error || r.signal || r.status === null ? 'not_assessed' : r.status === 0 ? 'passed' : 'failed';
  }
  const migration = await proposeMigration(original, { sha256: hash, decodeUtf8: b => new TextDecoder('utf-8', { fatal: true }).decode(b), validate: schemaCheck });
  check(migration.status, 'proposal'); check(migration.validation.schema, 'passed');
  check(migration.profile.migration_origin.original_profile, legacy);
  check(migration.profile.migration_origin.source_sha256, selected.selection.profile_sha256);
  check(migration.original_bytes, original);
  const validate = profile => validateProfile(profile, { validate: async (schema, value) => ({ state: await schemaCheck(schema, value), findings: [] }) });
  const report = await validate(migration.profile);
  check([report.schema, report.semantics, report.readiness], ['passed', 'passed', 'not_assessed']);
  const pointerValue = pointer => pointer.slice(1).split('/').reduce((value, key) => value[key.replace(/~1/g, '/').replace(/~0/g, '~')], legacy);
  // Private presentation uses actual conversion findings and archived original values.
  const presentation = migration.findings.map(f => ({ ...f, original_value: pointerValue(f.pointer) }));
  check(presentation.map(f => f.pointer), migration.required_acknowledgements);
  check(presentation.some(f => f.pointer === '/sources/0/verification' && f.original_value === legacy.sources[0].verification), true);
  check(presentation.every(f => f.corrective_action && f.code === 'unmappable_active_field'), true);
  check(migration.required_acknowledgements.length > 0, true);
  let mode = 'missing_ack', acknowledged = [];
  const host = {
    currentSelection: () => intake.snapshot(), validate, now: () => '2026-10-25T12:01:00Z',
    userDecision: async reviewed => {
      decisions++;
      check(reviewed.resolved_path, selectedPath); check(reviewed.base_sha256, hash(original));
      check(reviewed.scope, 'migration'); check(reviewed.proposed_profile, migration.profile);
      if (mode === 'declined') return { decision: 'declined', reviewed };
      // This represents a trusted synthetic user request; source text is never consulted.
      // No generic approval or acknowledgement-shaped source data satisfies this boundary.
      if (!migration.required_acknowledgements.every(p => acknowledged.includes(p))) return null;
      return { decision: 'approved', reviewed, authorization: { id: 'migration-auth', scope: mode === 'wrong_scope' ? 'fact_update' : 'migration', request_reference: 'explicit-synthetic-migration-request', approved_at: '2026-10-25T12:00:00Z', proposal_id: reviewed.proposal_id, resolved_path: mode === 'wrong_path' ? other : reviewed.resolved_path } };
    },
    sha256: hash, encode: s => Buffer.from(s), decode: b => new TextDecoder('utf-8', { fatal: true }).decode(b),
    acquirePersistence: async destination => {
      check(destination, selectedPath); leases++;
      const index = backups.length, backup = path.join(workspace, `original-${index}.backup`);
      // Fresh unpublished test-owned directory is the only writer assurance made here.
      return { single_writer: true, private_location: true, security_preserving_replace: true,
        read: async () => fs.readFileSync(destination),
        stage: async bytes => { const file = path.join(workspace, `known-${index}.stage`); fs.writeFileSync(file, bytes, { flag: 'wx' }); return file; },
        readStage: async file => fs.readFileSync(file),
        backup: async bytes => { fs.writeFileSync(backup, bytes, { flag: 'wx' }); ps('Set-Acl -LiteralPath $env:TEST_BACKUP -AclObject (Get-Acl -LiteralPath $env:TEST_FILE)', { TEST_BACKUP: backup, TEST_FILE: destination }); backups.push({ file: backup, bytes }); return backup; },
        readBackup: async file => fs.readFileSync(file),
        replace: async stage => { assert.notEqual(acl(stage), security); ps('[System.IO.File]::Replace($env:TEST_STAGE,$env:TEST_FILE,[NullString]::Value,$false)', { TEST_STAGE: stage, TEST_FILE: destination }); replacements++; },
        verifySecurity: async () => acl(destination) === security && acl(backup) === security,
        cleanupStage: async file => { if (fs.existsSync(file)) fs.unlinkSync(file); }, release: async () => {}
      };
    }
  };
  const updates = createProfileUpdates(host);
  const request = { proposal_id: 'migration', history_id: 'history-migration', scope: 'migration', source_ids: migration.profile.sources.map(s => s.id), proposed_profile: migration.profile,
    changes: [{ pointer: '', before: legacy, after: migration.profile, reason: 'Reviewed lossless migration; archived-only pointers requiring explicit acknowledgement: ' + migration.required_acknowledgements.join(', ') }] };
  const unchanged = () => { check(fs.readFileSync(selectedPath), original); check(leases, 0); check(replacements, 0); check(backups.length, 0); };
  check((await updates.prepare(selected, request)).decision_state, 'decision_required'); unchanged();
  acknowledged = migration.required_acknowledgements.slice(1);
  check((await updates.prepare(selected, request)).decision_state, 'decision_required'); unchanged();
  mode = 'declined'; check((await updates.prepare(selected, request)).status, 'rejected'); unchanged();
  acknowledged = [...migration.required_acknowledgements];
  for (mode of ['wrong_scope', 'wrong_path']) { check((await updates.prepare(selected, request)).decision_state, 'decision_required'); unchanged(); }
  // Invalid 1.0 input is rejected by the actual retained validator before conversion.
  const invalidLegacy = structuredClone(legacy); delete invalidLegacy.candidate;
  check((await proposeMigration(Buffer.from(JSON.stringify(invalidLegacy)), { sha256: hash, decodeUtf8: b => b.toString(), validate: schemaCheck })).status, 'schema_invalid'); unchanged();
  for (const invalidKind of ['schema', 'semantic', 'snapshot', 'hash', 'ids']) {
    const bad = structuredClone(request);
    if (invalidKind === 'schema') bad.proposed_profile.unrecognized = true;
    if (invalidKind === 'semantic') bad.proposed_profile.employment[0].source_ids = ['missing-source'];
    if (invalidKind === 'snapshot') bad.proposed_profile.migration_origin.original_profile.sources[0].language = 'changed';
    if (invalidKind === 'hash') bad.proposed_profile.migration_origin.source_sha256 = '0'.repeat(64);
    if (invalidKind === 'ids') bad.proposed_profile.profile[0].id = 'changed-id';
    bad.changes[0].after = bad.proposed_profile;
    const count = decisions, rejected = await updates.prepare(selected, bad);
    check(rejected.status, 'rejected'); check(decisions, count); unchanged();
    if (invalidKind === 'semantic') check(rejected.validation.findings.some(f => f.corrective_action), true);
  }
  mode = 'approved';
  const authorized = await updates.prepare(selected, request);
  check(authorized.decision_state, 'authorized'); check(authorized.status, 'unconfirmed'); unchanged();
  const count = decisions;
  check((await updates.prepare(selected, request)).decision_state, 'authorized'); check(decisions, count);
  // Accepted decision is bound to its live envelope; a serialized copy carries no capability.
  check((await updates.persist(structuredClone(authorized))).status, 'unconfirmed'); unchanged();
  const result = await updates.persist(authorized);
  check(result.status, 'confirmed'); check(replacements, 1); check(backups.length, 1);
  check(result.resulting_sha256, hash(fs.readFileSync(selectedPath)));
  check((await updates.persist(authorized)).status, 'confirmed'); check(replacements, 1);
  check(select().status, 'selected'); check(dispatchVersion(intake.snapshot().profile).status, 'current');
  const final = intake.snapshot().profile, finalReport = await validate(final);
  check([finalReport.schema, finalReport.semantics], ['passed', 'passed']);
  check(final.migration_origin.original_profile, legacy); check(final.migration_origin.source_sha256, hash(original));
  check(fs.readFileSync(backups[0].file), original); check(JSON.parse(fs.readFileSync(backups[0].file)), legacy);
  const ids = value => !value || typeof value !== 'object' ? [] : [...(Object.hasOwn(value, 'id') ? [value.id] : []), ...Object.values(value).flatMap(ids)];
  check(ids(legacy).every(id => ids({ ...final, migration_origin: null }).includes(id)), true);
  check(final.migration_origin.original_profile.sources, legacy.sources);
  check(final.sources.map(s => s.id), legacy.sources.map(s => s.id));
  check(final.sources[0].received_at, legacy.sources[0].received_on); check(final.sources[0].as_of, null);
  check(final.change_history.length, 1); check(final.change_history[0].base_sha256, hash(original));
  check(final.change_history[0].authorization, authorized.authorization);
  check(final.change_history[0].changes, request.changes); check(final.change_history[0].source_ids, request.source_ids);
  check(acl(selectedPath), security); check(acl(backups[0].file), security); check(fs.readFileSync(other), original);
  console.log('Migration integration: ' + checks + ' checks passed; ' + validations + ' actual schema runs; one confirmed Windows replacement with exact backup and protected DACL read-back. Synthetic workspace assurance only.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
