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
const { dispatchVersion } = load('profile-contract.md', 'dispatchVersion');
const { validateProfile, evidenceView } = load('profile-validation.md', 'validateProfile,evidenceView');
const { createProfileUpdates } = load('profile-updates.md', 'createProfileUpdates');
const fixture = require('./fixtures/intake-reviewed.cjs');
const blank = require('../../skills/targeted-cv/templates/cv-facts.blank.json');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
let checks = 0, validations = 0, replacements = 0, decisions = 0;
const check = (actual, expected) => { assert.deepEqual(actual, expected); checks++; };
function ps(script, env) {
  const result = spawnSync('pwsh', ['-NoProfile', '-NonInteractive', '-Command', '$ErrorActionPreference="Stop"; ' + script], { encoding: 'utf8', windowsHide: true, env: { ...process.env, ...env } });
  assert.equal(result.status, 0, result.stderr); return result.stdout.trim();
}
const acl = file => ps('(Get-Acl -LiteralPath $env:TEST_FILE).Sddl', { TEST_FILE: file });
async function run() {
  assert.match(read('candidate-profile.md'), /## Integrated host sequence/, 'the intake reference must connect the four protocols');
  for (const call of ['dispatchVersion', 'validateProfile', 'evidenceView', 'currentSelection', 'prepare', 'persist']) assert.ok(read('candidate-profile.md').includes('`' + call + '`'), `host sequence must wire ${call}`);
  const output = path.join(root, 'outputs/profile-tests'); fs.mkdirSync(output, { recursive: true });
  const workspace = fs.mkdtempSync(path.join(output, 'integration-'));
  const selectedPath = path.join(workspace, 'selected.json'), other = path.join(workspace, 'unselected.json');
  fs.writeFileSync(selectedPath, JSON.stringify(blank)); fs.writeFileSync(other, JSON.stringify(blank));
  const untouched = fs.readFileSync(other);
  ps('$a=Get-Acl -LiteralPath $env:TEST_FILE; $a.SetAccessRuleProtection($true,$true); Set-Acl -LiteralPath $env:TEST_FILE -AclObject $a', { TEST_FILE: selectedPath });
  const security = acl(selectedPath), backups = [];
  const settings = { application_language: 'de', target_country: 'DE', offer: 'fictional offer', chosen_documents: ['cv'], output_destination: 'separate', live_document: 'separate' };
  const intake = createProfileIntake({ resolvePath: (w, p) => path.resolve(w, p), realpath: fs.realpathSync, readBytes: fs.readFileSync, decodeUtf8: b => new TextDecoder('utf-8', { fatal: true }).decode(b), sha256: hash }, settings);
  const select = () => intake.select({ workspace_root: workspace, facts_path: 'selected.json' });
  check(select().status, 'selected');
  const task = { task_id: 'fictional-title-handoff', required: [{ record_id: 'role-a', pointer: '/employment/0/title', reason: 'This task needs the sourced role title.' }] };
  async function validate(profile, request = null) {
    check(dispatchVersion(profile).status, 'current');
    return validateProfile(profile, { validate: async (schema, value) => {
      check(schema, dispatchVersion(value).schema);
      const file = path.join(workspace, `validation-${++validations}.json`); fs.writeFileSync(file, JSON.stringify(value));
      const r = spawnSync('uvx', ['--from', 'check-jsonschema==0.38.2', 'check-jsonschema', '--schemafile', path.join(skill, schema), file], { encoding: 'utf8', windowsHide: true });
      return { state: r.error || r.signal || r.status === null ? 'not_assessed' : r.status === 0 ? 'passed' : 'failed', findings: [] };
    } }, request);
  }
  check((await validate(intake.snapshot().profile, task)).readiness, 'incomplete');
  const proposal = intake.propose(fixture.sources, fixture.review, intake.snapshot().generation);
  check(proposal.status, 'proposal'); check(proposal.authorization, null);
  const report = await validate(proposal.proposed_profile, task);
  check([report.schema, report.semantics, report.readiness], ['passed', 'passed', 'incomplete']);
  check(report.findings.some(f => f.code === 'task_incomplete' && f.pointer === '/employment/0/title' && f.corrective_action), true);
  const view = evidenceView(proposal.selection, proposal.proposed_profile, report);
  check(view.unresolved_record_ids.includes('role-a'), true); check(view.profile.conflicts, fixture.review.proposed_profile.conflicts);
  check(view.profile.languages[0].cefr, null); check(view.profile.employment[0].title, null);
  // Host decision resolves two explicit scoped synthetic user requests, never source text/history.
  const host = {
    currentSelection: () => intake.snapshot(), validate: p => validate(p), now: () => '2026-10-25T12:01:00Z',
    userDecision: async reviewed => { decisions++; return { decision: 'approved', reviewed, authorization: { id: `auth-${decisions}`, scope: reviewed.scope, request_reference: `explicit-synthetic-request-${decisions}`, approved_at: '2026-10-25T12:00:00Z', proposal_id: reviewed.proposal_id, resolved_path: reviewed.resolved_path } }; },
    sha256: hash, encode: s => Buffer.from(s), decode: b => new TextDecoder('utf-8', { fatal: true }).decode(b),
    acquirePersistence: async destination => {
      check(destination, selectedPath);
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
  async function save(proposed, scope, id, source_ids) {
    const selected = intake.snapshot();
    const changes = Object.keys(proposed).filter(k => JSON.stringify(proposed[k]) !== JSON.stringify(selected.profile[k])).map(k => ({ pointer: '/' + k, before: selected.profile[k], after: proposed[k], reason: 'Host-reviewed synthetic source and explicit reusable-profile request.' }));
    const request = { proposal_id: id, history_id: `history-${id}`, scope, source_ids, changes, proposed_profile: proposed };
    const decision = await updates.prepare(selected, request);
    check(decision.decision_state, 'authorized'); check(decision.status, 'unconfirmed');
    const count = decisions;
    check((await updates.prepare(selected, request)).decision_state, 'authorized'); check(decisions, count);
    const result = await updates.persist(decision);
    check(result.status, 'confirmed'); check(result.resulting_sha256, hash(fs.readFileSync(selectedPath)));
    check((await updates.persist(decision)).status, 'confirmed');
    check(select().status, 'selected'); // Refresh hash and discard pending proposal/authority before correction.
    check(intake.snapshot().selection.profile_sha256, result.resulting_sha256);
    return intake.snapshot().profile;
  }
  // Save valid unresolved intake without claiming readiness for the downstream title task.
  const initial = await save(proposal.proposed_profile, 'initial_intake', 'intake', proposal.source_ids);
  check((await validate(initial, task)).readiness, 'incomplete'); check(initial.change_history.length, 1);
  const corrected = structuredClone(initial);
  const source = { id: 'answer-title', origin: 'explicit user answer', locator: 'synthetic turn', text: 'The title was Research Assistant. Save that title to my reusable profile.', unreadable_regions: [] };
  corrected.sources.push({ id: source.id, type: 'user_answer', origin: source.origin, locator: source.locator, received_at: null, as_of: null, verification: 'user_reported', verification_basis: null });
  corrected.employment[0].title = 'Research Assistant'; corrected.employment[0].source_ids.push(source.id);
  Object.assign(corrected.conflicts[0], { status: 'resolved', selected_alternative: 1, resolution_source_ids: [source.id] });
  Object.assign(corrected.review_questions[0], { disposition: 'answered', answer: 'Research Assistant', answer_source_ids: [source.id] });
  const quote = 'Research Assistant', start = source.text.indexOf(quote);
  const correction = intake.propose([source], { proposed_profile: corrected, source_spans: [{ pointer: '/employment/0/title', source_id: source.id, start, end: start + quote.length, quote }], extraction_issues: [] }, intake.snapshot().generation);
  check(correction.status, 'proposal');
  host.taskRequest = task; host.validate = p => validate(p, task);
  const final = await save(correction.proposed_profile, 'fact_update', 'correction', correction.source_ids);
  const finalView = evidenceView(intake.snapshot().selection, final, await validate(final, task));
  check(finalView.validation.readiness, 'ready'); check(finalView.profile.employment[0].title, quote);
  check(finalView.profile.conflicts[0].alternatives, initial.conflicts[0].alternatives);
  check(finalView.profile.employment[0].claims, initial.employment[0].claims);
  check(finalView.profile.review_questions[0].disposition, 'answered'); check(finalView.profile.education[0].end, null);
  check(finalView.profile.languages[0].cefr, null); check(finalView.unresolved_record_ids.includes('edu-a'), true);
  check(final.change_history.map(h => h.authorization.scope), ['initial_intake', 'fact_update']);
  check(final.change_history[1].base_sha256, hash(backups[1].bytes));
  check(final.change_history[1].source_ids, [source.id]); check(decisions, 2); check(replacements, 2);
  for (const b of backups) { check(fs.readFileSync(b.file), b.bytes); check(acl(b.file), security); }
  check(acl(selectedPath), security); check(fs.readFileSync(other), untouched);
  check(intake.snapshot().application_settings, settings); check(intake.snapshot().pending_proposal, null);
  for (const key of Object.keys(settings)) check(Object.hasOwn(final, key), false);
  console.log(`Profile integration: ${checks} checks passed; ${validations} real schema runs; intake and sourced correction confirmed through exact reference blocks, .NET replacement and protected DACL read-back. Synthetic workspace assurance only.`);
}
run().catch(error => { console.error(error); process.exitCode = 1; });
