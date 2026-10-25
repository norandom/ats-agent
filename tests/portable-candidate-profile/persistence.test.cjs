'use strict';
// Test-only Windows adapter: only fresh, test-owned synthetic destinations.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const load = (file, name) => new Function(fs.readFileSync(path.join(root, 'skills/targeted-cv/references', file), 'utf8').match(/```javascript\r?\n([\s\S]*?)```/)[1] + `;return ${name};`)();
const createProfileUpdates = load('profile-updates.md', 'createProfileUpdates');
const validateProfile = load('profile-validation.md', 'validateProfile');
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const blank = require('../../skills/targeted-cv/templates/cv-facts.blank.json');
const base = require('./fixtures/populated.cjs')(blank); base.evidence = []; base.review_questions = [];
const evidence = require('./acceptance-evidence.cjs')();
let checks = 0;
const check = (a, b) => { assert.deepEqual(a, b); checks++; };
const output = path.join(root, 'outputs/profile-tests'); fs.mkdirSync(output, { recursive: true });
const workspace = fs.mkdtempSync(path.join(output, 'persistence-'));
function ps(script, paths) {
  const r = spawnSync('pwsh', ['-NoProfile', '-NonInteractive', '-Command', '$ErrorActionPreference="Stop"; ' + script], {
    encoding: 'utf8', windowsHide: true, env: { ...process.env, ...paths }
  });
  assert.equal(r.status, 0, r.stderr); return r.stdout.trim();
}
const acl = file => ps('(Get-Acl -LiteralPath $env:TEST_FILE).Sddl', { TEST_FILE: file });
let validationId = 0;
async function validate(p) {
  const file = path.join(workspace, `validate-${++validationId}.json`); fs.writeFileSync(file, JSON.stringify(p));
  return validateProfile(p, { validate: async () => {
    const r = spawnSync('uvx', ['--from', 'check-jsonschema==0.38.2', 'check-jsonschema', '--schemafile', path.join(root, 'skills/targeted-cv/schemas/cv-facts.schema.json'), file], { encoding: 'utf8', windowsHide: true });
    return { state: r.error ? 'not_assessed' : r.status === 0 ? 'passed' : 'failed', findings: [] };
  } });
}
let caseId = 0;
async function setup(decisionMode = 'approved') {
  const dir = fs.mkdtempSync(path.join(workspace, 'case-'));
  const selectedPath = path.join(dir, 'selected.json');
  const original = Buffer.from(JSON.stringify(base, null, 3) + '\r\n');
  fs.writeFileSync(selectedPath, original, { flag: 'wx' });
  // Deliberately protected destination DACL: stage inherits a different DACL.
  ps('$a=Get-Acl -LiteralPath $env:TEST_FILE; $a.SetAccessRuleProtection($true,$true); Set-Acl -LiteralPath $env:TEST_FILE -AclObject $a', { TEST_FILE: selectedPath });
  const security = acl(selectedPath), other = path.join(dir, 'other.json'); fs.writeFileSync(other, original);
  const selected = { generation: 1, selection: { resolved_path: selectedPath, profile_sha256: hash(original) }, profile: structuredClone(base) };
  let replacements = 0, releases = 0, decisions = 0;
  const host = {
    currentSelection: () => structuredClone(selected), validate, now: () => '2026-10-25T12:01:00Z',
    userDecision: async reviewed => { decisions++; return { decision: decisionMode, reviewed, authorization: { id: `auth-${caseId}`, scope: reviewed.scope, request_reference: 'synthetic-user-turn', approved_at: '2026-10-25T12:00:00Z', proposal_id: reviewed.proposal_id, resolved_path: reviewed.resolved_path } }; },
    sha256: hash, encode: s => Buffer.from(s, 'utf8'), decode: b => new TextDecoder('utf-8', { fatal: true }).decode(b),
    acquirePersistence: async destination => {
      assert.equal(destination, selectedPath);
      // Assurance is confined to this unpublished unique test workspace, never a real profile.
      return { single_writer: true, private_location: true, security_preserving_replace: true,
        read: async () => fs.readFileSync(selectedPath),
        stage: async bytes => { const file = path.join(dir, 'known.stage'); fs.writeFileSync(file, bytes, { flag: 'wx' }); return file; },
        readStage: async file => fs.readFileSync(file),
        backup: async bytes => { const file = path.join(dir, 'original.backup'); fs.writeFileSync(file, bytes, { flag: 'wx' }); ps('Set-Acl -LiteralPath $env:TEST_BACKUP -AclObject (Get-Acl -LiteralPath $env:TEST_FILE)', { TEST_BACKUP: file, TEST_FILE: selectedPath }); return file; },
        readBackup: async file => fs.readFileSync(file),
        replace: async stage => { assert.notEqual(acl(stage), security, 'stage ACL differs; replacement must preserve destination security'); checks++; replacements++; ps('[System.IO.File]::Replace($env:TEST_STAGE,$env:TEST_FILE,[NullString]::Value,$false)', { TEST_STAGE: stage, TEST_FILE: selectedPath }); },
        verifySecurity: async () => acl(selectedPath) === security && acl(path.join(dir, 'original.backup')) === security,
        cleanupStage: async stage => { if (fs.existsSync(stage)) fs.unlinkSync(stage); },
        release: async () => { releases++; }
      };
    }
  };
  const proposed = structuredClone(base); proposed.candidate.name = 'Fictional Persistence Person';
  const request = { proposal_id: `proposal-${++caseId}`, history_id: `history-${caseId}`, scope: 'fact_update', source_ids: ['source-demo'], proposed_profile: proposed,
    changes: [{ pointer: '/candidate/name', before: base.candidate.name, after: proposed.candidate.name, reason: 'Synthetic approved correction.' }] };
  const api = createProfileUpdates(host), decision = await api.prepare(selected, request);
  if (decisionMode === 'approved') check(decision.decision_state, 'authorized');
  return { api, decision, request, host, selected, selectedPath, original, dir, other, security, decisions: () => decisions, replacements: () => replacements, releases: () => releases };
}
async function run() {
  const success = await setup();
  assert.equal(typeof success.api.persist, 'function', 'persistence feature must exist');
  const result = await success.api.persist(success.decision);
  check(result.status, 'confirmed'); check(result.resulting_sha256, hash(fs.readFileSync(success.selectedPath)));
  check(JSON.parse(fs.readFileSync(success.selectedPath)).change_history.at(-1).proposal_id, success.decision.proposal_id);
  check(fs.readFileSync(path.join(success.dir, 'original.backup')), success.original);
  check(acl(success.selectedPath), success.security); check(fs.readFileSync(success.other), success.original);
  check(success.replacements(), 1); check(success.releases(), 1);
  check((await success.api.persist(success.decision)).status, 'confirmed'); check(success.replacements(), 1);
  const saved = JSON.parse(fs.readFileSync(success.selectedPath));
  evidence.record('approved', ['6.1','6.3','6.6','7.3','7.5'], {
    status: result.status, hash_matches: result.resulting_sha256 === hash(fs.readFileSync(success.selectedPath)),
    sources_preserved: JSON.stringify(saved.sources) === JSON.stringify(base.sources),
    history_preserved: JSON.stringify(saved.change_history.slice(0, -1)) === JSON.stringify(base.change_history),
    authorization_matches: JSON.stringify(saved.change_history.at(-1).authorization) === JSON.stringify(success.decision.authorization),
    backup_exact: fs.readFileSync(path.join(success.dir, 'original.backup')).equals(success.original),
    security_matches: acl(success.selectedPath) === success.security && acl(path.join(success.dir, 'original.backup')) === success.security,
    peer_unchanged: fs.readFileSync(success.other).equals(success.original), replacements: success.replacements()
  }, { status: 'confirmed', hash_matches: true, sources_preserved: true, history_preserved: true, authorization_matches: true, backup_exact: true, security_matches: true, peer_unchanged: true, replacements: 1 });
  for (const mode of ['declined', 'document_only', 'already_authorized']) {
    const x = await setup(mode === 'already_authorized' ? 'approved' : mode);
    const decision = mode === 'already_authorized' ? await x.api.prepare(x.selected, x.request) : x.decision;
    const persisted = await x.api.persist(decision);
    evidence.record(mode, mode === 'already_authorized' ? ['6.3','6.7','7.3','7.5'] : mode === 'document_only' ? ['6.2','6.5','7.3','7.5'] : ['6.1','6.2','7.3','7.5'], {
      decision: decision.decision_state, preparation_status: decision.status, status: persisted.status, decisions: x.decisions(), replacements: x.replacements(),
      selected_unchanged: fs.readFileSync(x.selectedPath).equals(x.original), peer_unchanged: fs.readFileSync(x.other).equals(x.original)
    }, { decision: mode === 'already_authorized' ? 'authorized' : mode === 'declined' ? 'declined' : 'decision_required', preparation_status: mode === 'declined' ? 'rejected' : 'unconfirmed', status: mode === 'already_authorized' ? 'confirmed' : 'unconfirmed', decisions: 1, replacements: mode === 'already_authorized' ? 1 : 0, selected_unchanged: mode !== 'already_authorized', peer_unchanged: true });
  }
  for (const mode of ['forged', 'mutated', 'invalid', 'stale', 'selection', 'no_writer', 'no_security', 'stage_failure', 'bad_stage', 'bad_backup']) {
    const x = await setup(); let arg = x.decision;
    if (mode === 'forged') arg = structuredClone(arg);
    if (mode === 'mutated') arg.proposed_profile.candidate.name = 'Unapproved fictional value';
    if (mode === 'invalid') x.host.validate = async () => ({ schema: 'failed', semantics: 'failed' });
    if (mode === 'stale') fs.appendFileSync(x.selectedPath, ' ');
    if (mode === 'selection') x.selected.generation++;
    const acquire = x.host.acquirePersistence;
    x.host.acquirePersistence = async p => { const l = await acquire(p);
      if (mode === 'no_writer') l.single_writer = false;
      if (mode === 'no_security') l.security_preserving_replace = false;
      if (mode === 'stage_failure') l.stage = async () => { throw Error('synthetic failure'); };
      if (mode === 'bad_stage') l.readStage = async () => Buffer.from('{}');
      if (mode === 'bad_backup') l.readBackup = async () => Buffer.from('{}');
      return l;
    };
    const before = fs.readFileSync(x.selectedPath); const r = await x.api.persist(arg);
    assert.notEqual(r.status, 'confirmed', mode); checks++;
    check(fs.readFileSync(x.selectedPath), before); check(x.replacements(), 0);
    evidence.record(mode, [...(['forged','mutated'].includes(mode) ? ['6.2'] : mode === 'invalid' ? ['6.4'] : ['6.6']), '7.3','7.5'], {
      status: r.status, unchanged: fs.readFileSync(x.selectedPath).equals(before), replacements: x.replacements(), peer_unchanged: fs.readFileSync(x.other).equals(x.original)
    }, { status: ['stale','selection'].includes(mode) ? 'conflict' : mode === 'invalid' ? 'rejected' : 'unconfirmed', unchanged: true, replacements: 0, peer_unchanged: true });
  }
  for (const mode of ['lost_ack', 'read_failure', 'mismatch', 'security_failure', 'validation_failure', 'late_stale']) {
    const x = await setup(), acquire = x.host.acquirePersistence; let first = true;
    if (mode === 'validation_failure') x.host.validate = async p => x.replacements() ? { schema: 'failed', semantics: 'failed' } : validate(p);
    x.host.acquirePersistence = async p => { const l = await acquire(p), replace = l.replace, read = l.read, backup = l.backup;
      if (mode === 'late_stale') l.backup = async b => { const f = await backup(b); fs.appendFileSync(x.selectedPath, ' '); return f; };
      l.replace = async s => { await replace(s); if (mode === 'lost_ack') throw Error('ack lost'); };
      l.read = async () => { if (x.replacements() && first && mode === 'read_failure') { first = false; throw Error('read unavailable'); } return x.replacements() && mode === 'mismatch' ? Buffer.from('{}') : read(); };
      if (mode === 'security_failure') l.verifySecurity = async () => false;
      return l;
    };
    const r = await x.api.persist(x.decision);
    check(r.status, mode === 'lost_ack' ? 'confirmed' : mode === 'late_stale' ? 'conflict' : 'unconfirmed');
    const reconciled = await x.api.persist(x.decision);
    if (mode === 'read_failure') check(reconciled.status, 'confirmed');
    if (['mismatch', 'security_failure', 'validation_failure'].includes(mode)) check(reconciled.status, 'unconfirmed');
    check(x.replacements(), mode === 'late_stale' ? 0 : 1);
    evidence.record(mode, ['6.6','7.3','7.5'], {
      status: r.status, reconciliation: reconciled.status, replacements: x.replacements(),
      backup_exact: fs.readFileSync(path.join(x.dir, 'original.backup')).equals(x.original), peer_unchanged: fs.readFileSync(x.other).equals(x.original)
    }, { status: mode === 'lost_ack' ? 'confirmed' : mode === 'late_stale' ? 'conflict' : 'unconfirmed', reconciliation: ['lost_ack','read_failure'].includes(mode) ? 'confirmed' : mode === 'late_stale' ? 'conflict' : 'unconfirmed', replacements: mode === 'late_stale' ? 0 : 1, backup_exact: true, peer_unchanged: true });
  }
  evidence.finish();
  console.log(`Profile persistence: ${checks} checks passed; real .NET File.Replace, full schema/semantic validation, exact-byte backup, protected destination and backup SDDL preserved. Single-writer assurance: fresh test-owned workspace only.`);
}
run().catch(e => { console.error(e); process.exitCode = 1; });
