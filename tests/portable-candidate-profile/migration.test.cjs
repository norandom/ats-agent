'use strict';
// Test-only harness executes the distributable reference's single algorithm.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const reference = path.join(root, 'skills/targeted-cv/references/profile-contract.md');
assert.ok(fs.existsSync(reference), 'ProfileContract reference must exist');
const block = fs.readFileSync(reference, 'utf8').match(/```javascript\r?\n([\s\S]*?)```/);
assert.ok(block, 'executable host protocol must exist');
const { dispatchVersion, proposeMigration } = new Function(`${block[1]}; return { dispatchVersion, proposeMigration };`)();
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const decodeUtf8 = bytes => new TextDecoder('utf-8', { fatal: true }).decode(bytes);
const blank = require('../../skills/targeted-cv/templates/cv-facts.blank.json');
const original = fs.readFileSync(path.join(root, 'tests/fantasy-cv/facts.json'));
const legacy = JSON.parse(original);
const calls = [];
const adapters = { sha256: hash, decodeUtf8, validate: async (schema, value) => { calls.push(schema); return 'passed'; } };
let checks = 0;
function check(fn) { fn(); checks++; }
async function run() {
  check(() => assert.equal(dispatchVersion(blank).schema, 'schemas/cv-facts.schema.json'));
  check(() => assert.equal(dispatchVersion(legacy).status, 'migration_required'));
  for (const value of [null, {}, { schema_version: 2 }, { schema_version: '3.0' }]) {
    check(() => assert.equal(dispatchVersion(value).schema, null));
    const result = await proposeMigration(Buffer.from(JSON.stringify(value)), adapters);
    check(() => assert.equal(result.status, 'unsupported_version'));
  }
  check(() => assert.equal(calls.length, 0));
  const result = await proposeMigration(original, adapters);
  check(() => assert.equal(result.status, 'proposal'));
  check(() => assert.deepEqual(calls, ['schemas/cv-facts-v1.schema.json', 'schemas/cv-facts.schema.json']));
  check(() => assert.deepEqual(result.profile.migration_origin.original_profile, legacy));
  check(() => assert.equal(result.profile.migration_origin.source_sha256, hash(original)));
  check(() => assert.deepEqual(result.original_bytes, original));
  check(() => assert.deepEqual(fs.readFileSync(path.join(root, 'tests/fantasy-cv/facts.json')), original));
  function ids(value) {
    if (!value || typeof value !== 'object') return [];
    return [...(Object.hasOwn(value, 'id') ? [value.id] : []), ...Object.values(value).flatMap(ids)];
  }
  const active = { ...result.profile, migration_origin: null };
  check(() => assert.ok(ids(legacy).every(id => ids(active).includes(id))));
  check(() => assert.equal(result.profile.sources[0].received_at, '2026-10-25'));
  check(() => assert.equal(result.profile.sources[0].as_of, null));
  check(() => assert.equal(result.profile.employment[0].as_of, legacy.employment[0].as_of));
  check(() => assert.equal(result.profile.sources[0].verification, 'unknown'));
  for (const pointer of ['/sources/0/type', '/sources/0/language', '/sources/0/verification']) {
    check(() => assert.ok(result.required_acknowledgements.includes(pointer)));
  }
  check(() => assert.equal(result.validation.semantics, 'not_assessed'));
  check(() => assert.equal(result.validation.readiness, 'not_assessed'));
  const variant = structuredClone(legacy);
  variant.sources[0].type = 'user_answer';
  variant.sources[0].verification = 'candidate_reported';
  variant.candidate.phone = '';
  variant.profile[0].id = 'candidate'; // New candidate ID must avoid active collisions.
  delete variant.employment[0].as_of;
  variant.education[0].completion_status = 'legacy-unspecified';
  variant.review_questions[0].status = 'skipped';
  variant.review_questions[1].status = 'answered'; // v1 carries no answer evidence.
  const mapped = await proposeMigration(Buffer.from(JSON.stringify(variant)), adapters);
  check(() => assert.equal(mapped.profile.sources[0].verification, 'user_reported'));
  check(() => assert.equal(mapped.profile.candidate.phone, null));
  check(() => assert.notEqual(mapped.profile.candidate.id, 'candidate'));
  check(() => assert.equal(mapped.profile.employment[0].as_of, null));
  check(() => assert.equal(mapped.profile.education[0].completion_status, null));
  check(() => assert.equal(mapped.profile.review_questions[0].disposition, 'skipped'));
  check(() => assert.equal(mapped.profile.review_questions[1].disposition, 'open'));
  check(() => assert.ok(mapped.required_acknowledgements.includes('/review_questions/1/status')));
  check(() => assert.deepEqual(mapped.profile.migration_origin.original_profile, variant));
  const limits = structuredClone(variant);
  limits.sources[0].verification = 'independently_verified';
  limits.sources[0].received_on = 'last spring';
  limits.employment[0].start = 'during training';
  limits.employment[0].current = false;
  limits.employment[0].end = null;
  limits.review_questions[0].status = 'confirmed_gap';
  const limited = await proposeMigration(Buffer.from(JSON.stringify(limits)), adapters);
  check(() => assert.equal(limited.profile.sources[0].verification, 'unknown'));
  check(() => assert.equal(limited.profile.sources[0].verification_basis, null));
  check(() => assert.equal(limited.profile.sources[0].received_at, null));
  check(() => assert.equal(limited.profile.employment[0].start, null));
  check(() => assert.equal(limited.profile.employment[0].current, false));
  check(() => assert.equal(limited.profile.review_questions[0].disposition, 'open'));
  for (const pointer of ['/sources/0/verification', '/sources/0/received_on', '/employment/0/start', '/review_questions/0/status']) {
    check(() => assert.ok(limited.required_acknowledgements.includes(pointer)));
  }
  const reformatted = Buffer.from(JSON.stringify(legacy));
  const reformattedResult = await proposeMigration(reformatted, adapters);
  check(() => assert.notEqual(reformattedResult.profile.migration_origin.source_sha256, result.profile.migration_origin.source_sha256));
  check(() => assert.deepEqual(reformattedResult.profile.migration_origin.original_profile, result.profile.migration_origin.original_profile));
  const denied = await proposeMigration(original, { ...adapters, validate: async () => 'failed' });
  check(() => assert.equal(denied.status, 'schema_invalid'));
  check(() => assert.equal(denied.profile, undefined));
  const unavailable = await proposeMigration(original, { ...adapters, validate: async () => { throw Error('unavailable'); } });
  check(() => assert.equal(unavailable.status, 'check_unavailable'));
  const failedProposal = await proposeMigration(original, { ...adapters, validate: async schema => schema.includes('-v1') ? 'passed' : 'failed' });
  check(() => assert.equal(failedProposal.status, 'schema_invalid'));
  check(() => assert.equal(failedProposal.validation.schema, 'failed'));
  const missingHash = await proposeMigration(original, { ...adapters, sha256: () => null });
  check(() => assert.equal(missingHash.status, 'check_unavailable'));
  const callsBeforeCurrent = calls.length;
  const current = await proposeMigration(Buffer.from(JSON.stringify(blank)), adapters);
  check(() => assert.equal(current.status, 'already_current'));
  check(() => assert.equal(calls.length, callsBeforeCurrent));
  const malformed = await proposeMigration(Buffer.from('{'), adapters);
  check(() => assert.equal(malformed.status, 'parse_invalid'));
  // External validator proves the protocol produces real current-schema data.
  const base = path.join(root, 'outputs/profile-tests'); fs.mkdirSync(base, { recursive: true });
  const workspace = fs.mkdtempSync(path.join(base, 'migration-'));
  const validate = async (schema, value) => {
    const file = path.join(workspace, `${path.basename(schema)}.input.json`);
    fs.writeFileSync(file, JSON.stringify(value));
    const execution = spawnSync('uvx', ['--from', 'check-jsonschema==0.38.2', 'check-jsonschema', '--schemafile', path.join(root, 'skills/targeted-cv', schema), file], { encoding: 'utf8', windowsHide: true, timeout: 120000 });
    assert.equal(execution.error, undefined);
    assert.equal(execution.status, 0, execution.stdout + execution.stderr);
    return 'passed';
  };
  const observed = await proposeMigration(original, { ...adapters, validate });
  check(() => assert.equal(observed.status, 'proposal'));
  console.log(`PASS migration protocol: ${checks} assertions; 2 actual uvx schema checks; proposal only, no canonical writes.`);
}
run().catch(error => { console.error(error); process.exitCode = 1; });
