'use strict';
// Test-only harness: execute the exact distributable algorithm using fictional data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const ref = path.join(root, 'skills/targeted-cv/references/profile-validation.md');
assert.ok(fs.existsSync(ref), 'ProfileValidation executable reference must exist');
const block = fs.readFileSync(ref, 'utf8').match(/```javascript\r?\n([\s\S]*?)```/);
assert.ok(block, 'single executable host block must exist');
const { validateProfile, semanticIntegrity } = new Function(`${block[1]}; return { validateProfile, semanticIntegrity };`)();
const blank = require('../../skills/targeted-cv/templates/cv-facts.blank.json');
const populated = require('./fixtures/populated.cjs');
let checks = 0;
async function check(fn) { await fn(); checks++; }
const host = { validate: async () => ({ state: 'passed', findings: [] }) };
async function report(change, base = populated(blank)) {
  change(base);
  const before = JSON.stringify(base);
  const r = await validateProfile(base, host);
  await check(async () => assert.equal(JSON.stringify(base), before, 'validation must not mutate facts'));
  for (const f of r.findings) await check(async () => assert.ok(f.code && f.pointer !== undefined && f.record_id !== undefined && f.message && f.corrective_action));
  return r;
}
async function invalid(change, code, pointer) {
  const r = await report(change);
  await check(async () => assert.equal(r.semantics, 'failed'));
  await check(async () => assert.ok(r.findings.some(f => f.code === code && f.pointer === pointer), JSON.stringify(r)));
}
async function run() {
  for (const p of [blank, populated(blank)]) {
    const r = await report(() => {}, structuredClone(p));
    await check(async () => assert.equal(r.schema, 'passed'));
    await check(async () => assert.equal(r.semantics, 'passed'));
    await check(async () => assert.equal(r.readiness, 'not_assessed'));
  }
  await invalid(p => p.languages[0].id = p.profile[0].id, 'duplicate_id', '/languages/0/id');
  await invalid(p => p.sources.push({ ...p.sources[0] }), 'duplicate_id', '/sources/1/id');
  await invalid(p => p.change_history[0].authorization.id = p.profile[0].id, 'duplicate_id', '/change_history/0/authorization/id');
  await invalid(p => p.candidate.id = '  ', 'empty_id', '/candidate/id');
  await check(async () => assert.equal((await report(p => p.sources[0].id = 'candidate')).semantics, 'failed')); // existing provenance now dangles
  const overlap = structuredClone(blank); overlap.sources = [{ ...populated(blank).sources[0], id: overlap.candidate.id }];
  await check(async () => assert.equal((await validateProfile(overlap, host)).semantics, 'passed'));
  await invalid(p => p.candidate.source_ids = [], 'missing_provenance', '/candidate/source_ids');
  await invalid(p => p.employment[0].claims[0].source_ids = [], 'missing_provenance', '/employment/0/claims/0/source_ids');
  await invalid(p => { p.languages[0].proficiency = 'Synthetic level'; }, 'missing_provenance', '/languages/0/source_ids');
  await invalid(p => { p.employment[0].employer = null; p.employment[0].title = null; p.employment[0].start = null; p.employment[0].as_of = null; p.employment[0].current = false; p.employment[0].source_ids = []; }, 'missing_provenance', '/employment/0/source_ids');
  await invalid(p => p.review_questions[0].answer_source_ids = ['missing'], 'broken_reference', '/review_questions/0/answer_source_ids/0');
  await invalid(p => p.conflicts[0].alternatives[0].source_ids = ['missing'], 'broken_reference', '/conflicts/0/alternatives/0/source_ids/0');
  await invalid(p => p.conflicts[0].resolution_source_ids = ['missing'], 'broken_reference', '/conflicts/0/resolution_source_ids/0');
  await invalid(p => p.projects[0].employer_id = p.profile[0].id, 'broken_reference', '/projects/0/employer_id');
  await invalid(p => p.review_questions[0].related_ids = ['source-demo'], 'broken_reference', '/review_questions/0/related_ids/0');
  await invalid(p => p.evidence[0].record_id = 'source-demo', 'broken_reference', '/evidence/0/record_id');
  for (const pointer of ['/missing', '/__proto__', '/statement/length', '/source_ids/01', '/source_ids/-', '/bad~2escape']) {
    await invalid(p => p.evidence[0].field_pointer = pointer, 'broken_pointer', '/evidence/0/field_pointer');
  }
  const nullTarget = await report(p => { p.evidence[0].record_id = 'education-demo'; p.evidence[0].field_pointer = '/qualification'; });
  await check(async () => assert.equal(nullTarget.semantics, 'passed'));
  await check(async () => assert.equal((await report(p => p.evidence[0].field_pointer = '')).semantics, 'passed'));
  for (const date of ['2023-02-29', '1900-02-29', '2024-04-31', '0000', '2024-13', '2024-00', '2024-01-00']) {
    await invalid(p => p.employment[0].start = date, 'invalid_date', '/employment/0/start');
  }
  await invalid(p => { p.employment[0].start = '2025'; p.employment[0].end = '2024'; }, 'impossible_chronology', '/employment/0/end');
  await invalid(p => { p.professional_development[0].since = '2025-03'; p.professional_development[0].valid_until = '2025-02'; p.professional_development[0].source_ids = ['source-demo']; }, 'impossible_chronology', '/professional_development/0/valid_until');
  const ambiguous = await report(p => { p.employment[0].start = '2024'; p.employment[0].end = '2024-02-29'; });
  await check(async () => assert.equal(ambiguous.semantics, 'passed'));
  await check(async () => assert.ok(ambiguous.findings.some(f => f.code === 'ambiguous_chronology')));
  await check(async () => assert.equal((await report(p => { p.employment[0].start = '2024-02-29'; p.employment[0].end = '2024-02-29'; })).semantics, 'passed'));
  await check(async () => assert.equal((await report(p => { p.employment[0].start = '2000-02-29'; })).semantics, 'passed'));
  await check(async () => assert.equal((await report(p => { p.migration_origin.original_profile = { id: p.candidate.id, source_ids: ['missing'], start: '9999-99' }; p.change_history[0].changes[0].before = { id: p.candidate.id, source_ids: ['missing'] }; })).semantics, 'passed'));
  for (const validate of [async () => { throw Error('unavailable'); }, async () => ({ state: 'not_assessed' }), async () => ({ state: 'invalid-state' })]) {
    const r = await validateProfile(blank, { validate });
    await check(async () => assert.equal(r.schema, 'not_assessed'));
    await check(async () => assert.equal(r.semantics, 'not_assessed'));
  }
  const unavailable = await validateProfile(blank, { ...host, semanticIntegrity: async () => { throw Error('unavailable'); } });
  await check(async () => assert.equal(unavailable.schema, 'passed'));
  await check(async () => assert.equal(unavailable.semantics, 'not_assessed'));
  let semanticCalls = 0;
  await validateProfile(blank, { validate: async () => ({ state: 'failed', findings: [] }), semanticIntegrity: async () => { semanticCalls++; return semanticIntegrity(blank); } });
  await check(async () => assert.equal(semanticCalls, 0, 'schema failure must prevent semantic execution'));
  let calls = 0;
  const unsupported = await validateProfile({ schema_version: '1.0' }, { validate: async () => { calls++; } });
  await check(async () => assert.equal(calls, 0)); await check(async () => assert.equal(unsupported.schema, 'not_assessed'));
  const output = path.join(root, 'outputs/profile-tests'); fs.mkdirSync(output, { recursive: true });
  const workspace = fs.mkdtempSync(path.join(output, 'validation-'));
  const real = { validate: async (schema, value) => {
    const file = path.join(workspace, 'synthetic.json'); fs.writeFileSync(file, JSON.stringify(value));
    const r = spawnSync('uvx', ['--from', 'check-jsonschema==0.38.2', 'check-jsonschema', '--schemafile', path.join(root, 'skills/targeted-cv', schema), file], { encoding: 'utf8', windowsHide: true, timeout: 120000 });
    assert.ifError(r.error); assert.equal(r.signal, null);
    return { state: r.status === 0 ? 'passed' : 'failed', findings: r.status === 0 ? [] : [{ code: 'schema_invalid', pointer: '/candidate', record_id: null, message: 'Candidate violates schema.', corrective_action: 'Restore the required candidate object.' }] };
  } };
  for (const p of [blank, populated(blank)]) await check(async () => assert.equal(p.schema_version, '2.0'));
  await check(async () => assert.equal((await validateProfile(blank, real)).semantics, 'passed'));
  await check(async () => assert.equal((await validateProfile(populated(blank), real)).semantics, 'passed'));
  const malformed = structuredClone(blank); malformed.candidate = null;
  const rejected = await validateProfile(malformed, real);
  await check(async () => assert.equal(rejected.schema, 'failed')); await check(async () => assert.equal(rejected.semantics, 'not_assessed'));
  await check(async () => assert.equal(rejected.findings[0].pointer, '/candidate'));
  console.log(`Profile integrity: ${checks} checks passed (including 3 real pinned uvx validations).`);
}
run().catch(error => { console.error(error); process.exitCode = 1; });
