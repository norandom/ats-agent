'use strict';
// Test-only cross-layer acceptance recorder. Every assessed schema uses the real
// pinned validator; semantics come from the distributable reference unchanged.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const base = path.join(root, 'skills/targeted-cv');
const blank = require('../../skills/targeted-cv/templates/cv-facts.blank.json');
const populated = require('./fixtures/populated.cjs');
function reference(file, exports) {
  const code = fs.readFileSync(path.join(base, 'references', file), 'utf8').match(/```javascript\r?\n([\s\S]*?)```/)[1];
  return new Function(`${code}; return { ${exports} };`)();
}
const { validateProfile, semanticIntegrity, evidenceView } = reference('profile-validation.md', 'validateProfile, semanticIntegrity, evidenceView');
const { createProfileIntake } = reference('candidate-profile.md', 'createProfileIntake');
const request = pointer => ({ task_id: 'synthetic-edge', required: [{ pointer, record_id: null, reason: 'Required by this synthetic test.' }] });
const outcome = (schema, semantics, readiness) => ({ schema, semantics, readiness });
const ready = outcome('passed', 'passed', 'ready');
const incomplete = outcome('passed', 'passed', 'incomplete');
const invalid = outcome('passed', 'failed', 'not_assessed');
const unassessed = outcome('not_assessed', 'not_assessed', 'not_assessed');
async function run() {
  const output = path.join(root, 'outputs/profile-tests'); fs.mkdirSync(output, { recursive: true });
  const workspace = fs.mkdtempSync(path.join(output, 'edge-cases-'));
  const evidence = { validator: 'check-jsonschema==0.38.2', validator_executions: 0, cases: [] };
  const save = () => fs.writeFileSync(path.join(workspace, 'evidence.json'), JSON.stringify(evidence, null, 2));
  async function scenario(id, requirements, edit, expected, code = null, pointer = '/candidate/name', options = {}) {
    const profile = options.blank ? structuredClone(blank) : populated(blank);
    profile.evidence = []; profile.review_questions = [];
    edit(profile);
    const before = JSON.stringify(profile);
    const row = { id, requirements, expected, validator: { execution: 'not_called', exit_status: null }, semantic_execution: 'not_called', observed: null, matches_expectation: false };
    evidence.cases.push(row);
    const host = {
      validate: async (schema, value) => {
        const file = path.join(workspace, `${id}.json`); fs.writeFileSync(file, JSON.stringify(value));
        const executable = options.noValidator ? path.join(workspace, 'missing-validator') : 'uvx';
        const result = spawnSync(executable, ['--from', 'check-jsonschema==0.38.2', 'check-jsonschema', '--output-format', 'json', '--schemafile', path.join(base, schema), file], { encoding: 'utf8', windowsHide: true, timeout: 120000 });
        row.validator = { execution: result.error ? 'unavailable' : 'executed', exit_status: result.status, error_code: result.error?.code || null };
        if (options.noValidator) { assert.equal(result.error?.code, 'ENOENT'); return { state: 'not_assessed' }; }
        assert.ifError(result.error); assert.equal(result.signal, null);
        evidence.validator_executions++;
        assert.ok([0, 1].includes(result.status), 'Unexpected validator invocation failure');
        const diagnostics = JSON.parse(result.stdout);
        // Preserve genuine private diagnostics; never manufacture a field path.
        fs.writeFileSync(path.join(workspace, `${id}.validator.json`), JSON.stringify(diagnostics, null, 2));
        if (result.status === 0) return { state: 'passed', findings: [] };
        const errors = diagnostics.errors;
        assert.ok(Array.isArray(errors) && errors.length, 'Rejected schema must have actual diagnostics');
        return { state: 'failed', findings: errors.map(error => ({ code: 'schema_invalid', pointer: error.path === '$.candidate' ? '/candidate' : null, record_id: null, message: error.message, corrective_action: 'Repair the field according to the pinned validator diagnostic and rerun validation.' })) };
      },
      semanticIntegrity: async value => {
        if (options.noSemantics) { row.semantic_execution = 'injected_unavailable'; throw Error('Synthetic unavailable computation'); }
        row.semantic_execution = 'executed_reference'; return semanticIntegrity(value);
      }
    };
    try {
      row.observed = await validateProfile(profile, host, options.noTask ? null : request(pointer));
      assert.equal(JSON.stringify(profile), before, `${id}: validation must preserve all supplied precision and history`);
      assert.deepEqual(outcome(row.observed.schema, row.observed.semantics, row.observed.readiness), expected, id);
      if (code) assert.ok(row.observed.findings.some(f => f.code === code), `${id}: missing ${code}`);
      if (options.check) options.check(profile, row.observed, evidenceView(null, profile, row.observed));
      row.matches_expectation = true;
    } finally { save(); }
  }
  const unchanged = () => {};
  await scenario('valid', ['2.1', '4.1', '5.1'], unchanged, ready);
  await scenario('blank', ['2.2', '2.3', '4.4'], unchanged, incomplete, 'task_incomplete', '/candidate/name', { blank: true });
  // Raw malformed JSON is rejected by the actual selection protocol, before schema dispatch.
  const malformed = path.join(workspace, 'malformed-json.json'); fs.writeFileSync(malformed, '{"schema_version":');
  const intake = createProfileIntake({ resolvePath: (w, p) => path.resolve(w, p), realpath: p => fs.realpathSync(p), readBytes: p => fs.readFileSync(p), decodeUtf8: b => new TextDecoder('utf-8', { fatal: true }).decode(b), sha256: b => crypto.createHash('sha256').update(b).digest('hex') });
  const selection = intake.select({ workspace_root: workspace, facts_path: 'malformed-json.json' });
  assert.equal(selection.status, 'parse_invalid'); assert.ok(selection.action); assert.equal(intake.snapshot().profile, null);
  evidence.cases.push({ id: 'malformed-json', requirements: ['4.1', '4.3'], expected: { ...unassessed, selection_status: 'parse_invalid' }, observed: { ...unassessed, selection_status: selection.status, findings: [{ code: selection.status, pointer: null, record_id: null, message: 'Selected synthetic JSON could not be parsed.', corrective_action: selection.action }] }, validator: { execution: 'not_called', exit_status: null }, semantic_execution: 'not_called', matches_expectation: true }); save();
  await scenario('unsupported-version', ['2.4', '2.5'], p => p.schema_version = '99.0', unassessed, 'unsupported_version');
  await scenario('malformed-record', ['4.1', '4.3'], p => p.candidate = null, outcome('failed', 'not_assessed', 'not_assessed'), 'schema_invalid');
  await scenario('duplicate-id', ['4.2', '4.3', '5.1'], p => p.languages[0].id = p.profile[0].id, invalid, 'duplicate_id');
  await scenario('missing-source', ['4.2', '4.3', '5.1'], p => p.candidate.source_ids = ['missing'], invalid, 'broken_reference');
  await scenario('wrong-kind', ['4.2', '4.3'], p => p.projects[0].employer_id = p.profile[0].id, invalid, 'broken_reference');
  await scenario('invalid-calendar', ['3.4', '4.3'], p => p.employment[0].start = '2023-02-29', invalid, 'invalid_date');
  await scenario('mixed-precision', ['3.4', '5.3'], p => { p.employment[0].start = '2024'; p.employment[0].end = '2024-02-29'; }, ready, 'ambiguous_chronology');
  await scenario('impossible-chronology', ['3.4', '4.3'], p => { p.employment[0].start = '2025'; p.employment[0].end = '2024-02'; }, invalid, 'impossible_chronology');
  await scenario('null-end', ['5.3', '4.5'], unchanged, incomplete, 'task_incomplete', '/employment/0/current', { check: p => { assert.equal(p.employment[0].end, null); assert.equal(p.employment[0].current, null); } });
  await scenario('bounded-current', ['5.7'], p => { p.employment[0].current = true; p.employment[0].as_of = '2001'; }, ready, 'observation_limit', '/employment/0/current', { check: p => assert.equal(p.employment[0].as_of, '2001') });
  await scenario('undated-current', ['5.7', '4.5'], p => { p.employment[0].current = true; p.employment[0].as_of = null; p.sources[0].as_of = null; }, incomplete, 'observation_limit', '/employment/0/current');
  await scenario('verification-upgrade', ['5.2'], p => p.sources[0].verification = 'independently_verified', invalid, 'verification_basis_required');
  for (const status of ['supported', 'uncertain', 'absent', 'transferable', 'confirmed_gap']) {
    await scenario(`evidence-${status}`, ['5.4', '4.4', '4.5'], p => p.evidence = [{ id: 'edge-evidence', record_id: 'candidate', field_pointer: '/name', status, source_ids: ['source-demo'], rationale: null }], ['supported', 'transferable'].includes(status) ? ready : incomplete, null, '/candidate/name', { check: (p, r, view) => assert.equal(view.profile.evidence[0].status, status) });
  }
  for (const disposition of ['answered', 'skipped', 'not_applicable', 'confirmed_gap']) {
    await scenario(`question-${disposition}`, ['5.5'], p => p.review_questions = [{ id: 'edge-question', related_ids: ['candidate'], question: 'Confirm the fictional input?', disposition, answer: disposition === 'answered' ? 'Synthetic answer.' : null, answer_source_ids: ['answered', 'confirmed_gap'].includes(disposition) ? ['source-demo'] : [] }], disposition === 'confirmed_gap' ? incomplete : ready, null, '/candidate/name', { check: (p, r, view) => { assert.equal(view.profile.review_questions[0].disposition, disposition); assert.deepEqual(view.profile.review_questions[0].related_ids, ['candidate']); } });
  }
  await scenario('conflict-open', ['3.3', '5.6', '4.5'], unchanged, incomplete, 'task_incomplete', '/education/0/qualification');
  const resolve = p => { p.conflicts[0].status = 'resolved'; p.conflicts[0].selected_alternative = 0; p.conflicts[0].resolution_source_ids = ['source-demo']; p.education[0].qualification = p.conflicts[0].alternatives[0].value; p.education[0].source_ids = ['source-demo']; };
  await scenario('conflict-resolved', ['3.3', '5.6'], resolve, ready, null, '/education/0/qualification', { check: (p, r, view) => { assert.equal(view.profile.conflicts[0].alternatives.length, 2); assert.deepEqual(view.unresolved_record_ids, []); } });
  await scenario('conflict-mismatch', ['5.6', '4.3'], p => { resolve(p); p.education[0].qualification = 'Different fictional award'; }, invalid, 'conflict_canonical_mismatch');
  await scenario('required-missing', ['2.3', '4.4', '4.5'], unchanged, incomplete, 'task_incomplete', '/candidate/email');
  await scenario('optional-unknown', ['2.3', '4.6'], unchanged, ready, null, '/candidate/name', { check: p => { assert.equal(p.candidate.email, null); assert.equal(p.languages[0].cefr, null); assert.equal(p.education[0].end, null); } });
  await scenario('validator-unavailable', ['4.1', '4.4'], unchanged, unassessed, 'check_unavailable', '/candidate/name', { noValidator: true });
  await scenario('semantics-unavailable', ['4.1', '4.4'], unchanged, outcome('passed', 'not_assessed', 'not_assessed'), 'check_unavailable', '/candidate/name', { noSemantics: true });
  await scenario('no-task', ['4.4'], unchanged, outcome('passed', 'passed', 'not_assessed'), null, '/candidate/name', { noTask: true });
  return evidence;
}
module.exports = { run };
