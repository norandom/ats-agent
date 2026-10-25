'use strict';
// Acceptance recorder only: execute installed blocks, never read real candidate inputs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..'), skill = path.join(root, 'skills/targeted-cv');
const blank = require('../../skills/targeted-cv/templates/cv-facts.blank.json');
const first = require('./fixtures/intake-reviewed.cjs');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const load = (name, exports) => new Function(fs.readFileSync(path.join(skill, 'references', name), 'utf8').match(/```javascript\r?\n([\s\S]*?)```/)[1] + `;return {${exports}};`)();
const { createProfileIntake } = load('candidate-profile.md', 'createProfileIntake');
const { dispatchVersion } = load('profile-contract.md', 'dispatchVersion');
const { validateProfile, evidenceView } = load('profile-validation.md', 'validateProfile,evidenceView');
const { createProfileUpdates } = load('profile-updates.md', 'createProfileUpdates');
// Deliberately unrelated occupation and education, independently reviewed against this paste.
// The mappings are host-reviewed fixtures, not an automatic semantic extraction claim.
const secondSource = { id: 'cv-second', origin: 'explicit second candidate paste', locator: 'paste', text: 'Tovin Starbasket\nCostume Maker at Pebble Theatre, 2018-02 to 2020.\nCertificate in Stage Sewing, completed.\nItalian: basic.', unreadable_regions: [] };
const secondProfile = structuredClone(blank);
secondProfile.candidate.name = 'Tovin Starbasket'; secondProfile.candidate.source_ids = [secondSource.id];
secondProfile.sources = [{ id: secondSource.id, type: 'candidate_supplied_cv', origin: secondSource.origin, locator: 'paste', received_at: null, as_of: null, verification: 'user_reported', verification_basis: null }];
secondProfile.employment = [{ id: 'role-second', employer: 'Pebble Theatre', title: 'Costume Maker', location: null, start: '2018-02', end: '2020', current: null, as_of: null, source_ids: [secondSource.id], claims: [] }];
secondProfile.education = [{ id: 'edu-second', qualification: 'Certificate in Stage Sewing', institution: null, start: null, end: null, completion_status: 'completed', source_ids: [secondSource.id] }];
secondProfile.languages = [{ id: 'lang-second', language: 'Italian', proficiency: 'basic', cefr: null, source_ids: [secondSource.id] }];
const secondReview = { proposed_profile: secondProfile, extraction_issues: [], source_spans: [
  ['/candidate/name', 'Tovin Starbasket'], ['/employment/0/employer', 'Pebble Theatre'], ['/employment/0/title', 'Costume Maker'], ['/employment/0/start', '2018-02'], ['/employment/0/end', '2020'], ['/education/0/qualification', 'Certificate in Stage Sewing'], ['/education/0/completion_status', 'completed'], ['/languages/0/language', 'Italian'], ['/languages/0/proficiency', 'basic']
].map(([pointer, quote]) => { const start = secondSource.text.indexOf(quote); return { pointer, source_id: secondSource.id, start, end: start + quote.length, quote }; }) };
const denylist = ['Orla Cloudquill', 'Lantern Orchard', 'Diploma in Orchard Systems', 'Tovin Starbasket', 'Pebble Theatre', 'Certificate in Stage Sewing'];
function scanAssets(assets) {
  const findings = [];
  for (const asset of assets) {
    if (denylist.some(value => asset.text.includes(value))) findings.push({ path: asset.path, code: 'synthetic_candidate' });
    if (/(?:(?<![A-Za-z0-9])[A-Za-z]:[\\/]|\\\\[A-Za-z0-9_.-]+\\|\/(?:Users|home)\/[^/\s]+)/.test(asset.text)) findings.push({ path: asset.path, code: 'machine_path' });
  }
  return findings;
}
function ps(script, env) {
  const r = spawnSync('pwsh', ['-NoProfile', '-NonInteractive', '-Command', '$ErrorActionPreference="Stop"; ' + script], { encoding: 'utf8', windowsHide: true, env: { ...process.env, ...env } });
  assert.equal(r.status, 0, r.stderr); return r.stdout.trim();
}
const acl = file => ps('(Get-Acl -LiteralPath $env:TEST_FILE).Sddl', { TEST_FILE: file });
async function run() {
  const base = path.join(root, 'outputs/profile-tests'); fs.mkdirSync(base, { recursive: true });
  const workspace = fs.mkdtempSync(path.join(base, 'isolation-'));
  const destinations = ['first.json', 'second.json'].map(n => path.join(workspace, n));
  for (const file of destinations) { fs.writeFileSync(file, JSON.stringify(blank)); ps('$a=Get-Acl -LiteralPath $env:TEST_FILE; $a.SetAccessRuleProtection($true,$true); Set-Acl -LiteralPath $env:TEST_FILE -AclObject $a', { TEST_FILE: file }); }
  const evidence = { cases: [], validator_executions: 0, replacements: 0, asset_count: 0, validators: [], limitations: ['Host-reviewed fictional prose mappings; offset checks do not prove semantic entailment.', 'Writer exclusion limited to fresh unpublished synthetic workspace; security checks cover destination and backup SDDL only.', 'Synthetic denylist and generic path scan plus manual review do not certify arbitrary identifying content or release archives.'] };
  const flush = () => fs.writeFileSync(path.join(workspace, 'evidence.json'), JSON.stringify(evidence, null, 2));
  function record(id, requirements, observed, expected) {
    const matches = JSON.stringify(observed) === JSON.stringify(expected);
    evidence.cases.push({ id, requirements, observed, expected, matches_expectation: matches }); flush();
    assert.deepEqual(observed, expected, id);
  }
  const reads = [], writes = [];
  const settings = { application_language: 'de', target_country: 'DE', offer: 'fictional offer', chosen_documents: ['cv'], output_destination: 'separate', live_document: 'separate' };
  const intakeHost = { resolvePath: (w, p) => path.resolve(w, p), realpath: fs.realpathSync, readBytes: p => { reads.push(p); return fs.readFileSync(p); }, decodeUtf8: b => new TextDecoder('utf-8', { fatal: true }).decode(b), sha256: hash };
  const intake = createProfileIntake(intakeHost, settings);
  const select = file => intake.select({ workspace_root: workspace, facts_path: file });
  const absent = select(undefined);
  record('absent-selection', ['1.2','1.4','1.5'], { status: absent.status, profile: intake.snapshot().profile, reads: reads.length }, { status: 'selection_required', profile: null, reads: 0 });
  const missing = select('missing.json');
  record('missing-path', ['1.3','1.4','1.5'], { status: missing.status, profile: intake.snapshot().profile, actionable: !!missing.action && !!missing.affected_input }, { status: 'input_unreadable', profile: null, actionable: true });
  const denied = createProfileIntake({ ...intakeHost, readBytes: () => { throw Error('EACCES'); } });
  const unreadable = denied.select({ workspace_root: workspace, facts_path: destinations[0] });
  record('unreadable-path', ['1.3','1.4'], { status: unreadable.status, profile: denied.snapshot().profile, actionable: !!unreadable.action && !!unreadable.affected_input }, { status: 'input_unreadable', profile: null, actionable: true });
  async function validate(profile) {
    assert.equal(dispatchVersion(profile).status, 'current');
    return validateProfile(profile, { validate: async (schema, value) => {
      const index = ++evidence.validator_executions, filename = `validation-${index}.json`;
      fs.writeFileSync(path.join(workspace, filename), JSON.stringify(value));
      const r = spawnSync('uvx', ['--from', 'check-jsonschema==0.38.2', 'check-jsonschema', '--schemafile', path.join(skill, schema), path.join(workspace, filename)], { encoding: 'utf8', windowsHide: true, timeout: 120000 });
      const state = r.error || r.signal || r.status === null ? 'not_assessed' : r.status === 0 ? 'passed' : 'failed';
      evidence.validators.push({ input: filename, state, exit_status: r.status, error: r.error?.code ?? null }); flush();
      return { state, findings: [] };
    } });
  }
  let decisions = 0;
  const updates = createProfileUpdates({
    currentSelection: () => intake.snapshot(), validate, now: () => '2026-10-25T12:01:00Z',
    userDecision: async reviewed => ({ decision: 'approved', reviewed, authorization: { id: `auth-${++decisions}`, scope: reviewed.scope, request_reference: `explicit-fictional-request-${decisions}`, approved_at: '2026-10-25T12:00:00Z', proposal_id: reviewed.proposal_id, resolved_path: reviewed.resolved_path } }),
    sha256: hash, encode: s => Buffer.from(s), decode: b => new TextDecoder('utf-8', { fatal: true }).decode(b),
    acquirePersistence: async destination => {
      assert.equal(destination, intake.snapshot().selection.resolved_path);
      assert.ok(destinations.includes(destination));
      const security = acl(destination), suffix = writes.length, backup = path.join(workspace, `original-${suffix}.backup`);
      return { single_writer: true, private_location: true, security_preserving_replace: true,
        read: async () => fs.readFileSync(destination),
        stage: async bytes => { const file = path.join(workspace, `known-${suffix}.stage`); fs.writeFileSync(file, bytes, { flag: 'wx' }); return file; },
        readStage: async file => fs.readFileSync(file),
        backup: async bytes => { fs.writeFileSync(backup, bytes, { flag: 'wx' }); ps('Set-Acl -LiteralPath $env:TEST_BACKUP -AclObject (Get-Acl -LiteralPath $env:TEST_FILE)', { TEST_BACKUP: backup, TEST_FILE: destination }); return backup; },
        readBackup: async file => fs.readFileSync(file),
        replace: async stage => { ps('[System.IO.File]::Replace($env:TEST_STAGE,$env:TEST_FILE,[NullString]::Value,$false)', { TEST_STAGE: stage, TEST_FILE: destination }); writes.push(destination); evidence.replacements++; },
        verifySecurity: async () => acl(destination) === security && acl(backup) === security,
        cleanupStage: async file => { if (fs.existsSync(file)) fs.unlinkSync(file); }, release: async () => {}
      };
    }
  });
  async function prepare(proposal, id) {
    const selected = intake.snapshot(), proposed = proposal.proposed_profile;
    const changes = Object.keys(proposed).filter(k => JSON.stringify(proposed[k]) !== JSON.stringify(selected.profile[k])).map(k => ({ pointer: '/' + k, before: selected.profile[k], after: proposed[k], reason: 'Explicit fictional reusable-profile intake request.' }));
    const decision = await updates.prepare(selected, { proposal_id: id, history_id: `history-${id}`, scope: 'initial_intake', source_ids: proposal.source_ids, changes, proposed_profile: proposed });
    assert.equal(decision.decision_state, 'authorized'); return decision;
  }
  assert.equal(select('first.json').selection.resolved_path, destinations[0]);
  const firstGeneration = intake.snapshot().generation, beforeReads = reads.length;
  const proposalA = intake.propose(first.sources, first.review, firstGeneration);
  const reportA = await validate(proposalA.proposed_profile);
  const viewA = evidenceView(proposalA.selection, proposalA.proposed_profile, reportA);
  record('hostile-incomplete-source', ['3.1','3.2','3.3','3.4','3.5','7.5'], { status: proposalA.status, validation: [reportA.schema, reportA.semantics], authority: proposalA.authorization, unexpected_reads: reads.length - beforeReads, writes: writes.length, source_spans: proposalA.source_spans.length, questions: viewA.profile.review_questions.length, start: viewA.profile.employment[0].start, end: viewA.profile.employment[0].end, title: viewA.profile.employment[0].title, qualification: viewA.profile.education[0].completion_status, qualification_end: viewA.profile.education[0].end, cefr: viewA.profile.languages[0].cefr, issues: proposalA.extraction_issues.map(f => f.code) }, { status: 'proposal', validation: ['passed','passed'], authority: null, unexpected_reads: 0, writes: 0, source_spans: 11, questions: 2, start: '2021', end: '2023-04', title: null, qualification: 'in_progress', qualification_end: null, cefr: null, issues: ['source_unreadable','conflicting_sources','source_unreadable'] });
  const decisionA = await prepare(proposalA, 'first-intake');
  const pendingDecisionA = await prepare(proposalA, 'first-intake');
  const untouchedB = fs.readFileSync(destinations[1]);
  const resultA = await updates.persist(decisionA), savedA = fs.readFileSync(destinations[0]);
  fs.writeFileSync(path.join(workspace, 'first-result.json'), JSON.stringify(resultA, null, 2));
  record('first-selected-write', ['1.1','7.1','7.3'], { status: resultA.status, hash_matches: resultA.resulting_sha256 === hash(savedA), peer_unchanged: fs.readFileSync(destinations[1]).equals(untouchedB), settings_separate: Object.keys(settings).every(k => !Object.hasOwn(JSON.parse(savedA), k)) }, { status: 'confirmed', hash_matches: true, peer_unchanged: true, settings_separate: true });
  // Repopulate pending source review before switching; the old live authorization must also be rejected.
  assert.equal(select('first.json').status, 'selected');
  assert.equal(intake.propose(first.sources, { ...first.review, proposed_profile: intake.snapshot().profile }, intake.snapshot().generation).status, 'proposal');
  assert.equal(select(destinations[1]).selection.resolved_path, destinations[1]);
  const switched = intake.snapshot(), stale = await updates.persist(pendingDecisionA);
  record('switch-clears-state-authority', ['1.5','7.1','7.2','7.3'], { profile_is_blank: JSON.stringify(switched.profile) === JSON.stringify(blank), questions: switched.profile.review_questions.length, sources: switched.sources.length, pending: switched.pending_proposal, settings: switched.application_settings, old_authority: stale.status, old_generation: intake.propose(first.sources, first.review, firstGeneration).status, replacement_count: writes.length }, { profile_is_blank: true, questions: 0, sources: 0, pending: null, settings, old_authority: 'conflict', old_generation: 'selection_changed', replacement_count: 1 });
  const proposalB = intake.propose([secondSource], secondReview, intake.snapshot().generation);
  assert.equal(proposalB.status, 'proposal');
  const decisionB = await prepare(proposalB, 'second-intake');
  const pendingDecisionB = await prepare(proposalB, 'second-intake'), resultB = await updates.persist(decisionB);
  const savedB = fs.readFileSync(destinations[1]), profileB = JSON.parse(savedB);
  record('second-selected-write', ['1.1','3.1','3.4','7.1','7.2','7.3','7.5'], { status: resultB.status, hash_matches: resultB.resulting_sha256 === hash(savedB), peer_unchanged: fs.readFileSync(destinations[0]).equals(savedA), first_identity_absent: !savedB.includes(Buffer.from(first.review.proposed_profile.candidate.name)), facts_match_second: JSON.stringify({ ...profileB, change_history: [] }) === JSON.stringify(secondProfile), questions: profileB.review_questions.length, source_ids: profileB.sources.map(s => s.id), history_paths: profileB.change_history.every(h => h.authorization.resolved_path === destinations[1]), settings_separate: Object.keys(settings).every(k => !Object.hasOwn(profileB, k)), new_decision: decisions }, { status: 'confirmed', hash_matches: true, peer_unchanged: true, first_identity_absent: true, facts_match_second: true, questions: 0, source_ids: ['cv-second'], history_paths: true, settings_separate: true, new_decision: 2 });
  select('first.json');
  record('return-to-first', ['7.2','7.3'], { own_profile: JSON.stringify(intake.snapshot().profile) === JSON.stringify(JSON.parse(savedA)), second_unchanged: fs.readFileSync(destinations[1]).equals(savedB), second_authority: (await updates.persist(pendingDecisionB)).status, pending: intake.snapshot().pending_proposal }, { own_profile: true, second_unchanged: true, second_authority: 'conflict', pending: null });
  const files = fs.readdirSync(skill, { recursive: true, withFileTypes: true }).filter(e => e.isFile()).map(e => path.join(e.parentPath, e.name));
  const assets = files.map(file => ({ path: path.relative(skill, file).replaceAll('\\', '/'), text: fs.readFileSync(file, 'utf8') }));
  evidence.asset_count = assets.length;
  record('reusable-assets', ['1.5','7.4','7.5'], { findings: scanAssets(assets), blank_identity: blank.candidate.name, blank_sources: blank.sources.length, blank_questions: blank.review_questions.length }, { findings: [], blank_identity: null, blank_sources: 0, blank_questions: 0 });
  evidence.assets_inspected = assets.map(a => a.path); flush(); return evidence;
}
module.exports = { run, scanAssets };
