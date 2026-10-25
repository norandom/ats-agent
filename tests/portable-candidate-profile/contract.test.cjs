'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const base = path.join(root, 'skills/targeted-cv');
const schema = path.join(base, 'schemas/cv-facts.schema.json');
const legacy = path.join(base, 'schemas/cv-facts-v1.schema.json');
assert.ok(fs.existsSync(schema), 'current 2.0 schema must exist');
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(legacy)).digest('hex'), '83ff6c5aafe7d507905cfa2a0638bd4350b4b4bae3f8d48c58a0f430fe1c53a3');
assert.equal(fs.existsSync(path.join(root, 'schemas/cv-facts.schema.json')), false);
assert.equal(fs.existsSync(path.join(root, 'templates/cv-facts.blank.json')), false);
const blank = JSON.parse(fs.readFileSync(path.join(base, 'templates/cv-facts.blank.json')));
assert.equal(blank.schema_version, '2.0');
assert.deepEqual(Object.keys(blank).sort(), ['schema_version', 'candidate', 'sources', 'profile', 'employment', 'education', 'professional_development', 'skill_groups', 'projects', 'volunteering', 'languages', 'review_questions', 'evidence', 'conflicts', 'change_history', 'migration_origin'].sort());
assert.equal(blank.migration_origin, null);
for (const [key, value] of Object.entries(blank)) {
  if (!['schema_version', 'candidate', 'migration_origin'].includes(key)) assert.deepEqual(value, [], key);
}
for (const [key, value] of Object.entries(blank.candidate)) {
  if (key === 'id') assert.ok(value);
  else if (key === 'location') assert.deepEqual(value, { city: null, country: null });
  else if (Array.isArray(value)) assert.equal(value.length, 0);
  else assert.equal(value, null);
}
const populated = require('./fixtures/populated.cjs')(blank);
const output = path.join(root, 'outputs/profile-tests');
fs.mkdirSync(output, { recursive: true });
const workspace = fs.mkdtempSync(path.join(output, 'contract-'));
let checks = 0;
function validate(name, value, expected, selectedSchema = schema) {
  const file = path.join(workspace, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(value));
  const result = spawnSync('uvx', ['--from', 'check-jsonschema==0.38.2', 'check-jsonschema', '--schemafile', selectedSchema, file], { encoding: 'utf8', timeout: 120000, windowsHide: true });
  assert.equal(result.error, undefined, name);
  assert.equal(result.status, expected, `${name}: validator exit status mismatch`);
  checks++;
}
validate('blank', blank, 0);
validate('populated', populated, 0);
validate('legacy', JSON.parse(fs.readFileSync(path.join(root, 'tests/fantasy-cv/facts.json'))), 0, legacy);
for (const version of ['1.0', '3.0']) validate(`wrong-version-${version}`, { ...blank, schema_version: version }, 1);
// Every active object must reject unknown properties; opaque JSON values are intentionally exempt.
function closedObjects(value, keys = []) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) return value.forEach((item, i) => closedObjects(item, [...keys, i]));
  const changed = structuredClone(populated);
  let target = changed; for (const key of keys) target = target[key];
  target.unexpected = true;
  validate(`unknown-${checks}`, changed, 1);
  for (const [key, child] of Object.entries(value)) {
    if (['original_profile', 'value', 'before', 'after'].includes(key)) continue;
    closedObjects(child, [...keys, key]);
  }
}
closedObjects(populated);
for (const key of Object.keys(blank)) {
  const missing = structuredClone(blank); delete missing[key]; validate(`missing-${key}`, missing, 1);
}
for (const [collection, property] of [['sources', 'verification'], ['sources', 'type'], ['evidence', 'status'], ['conflicts', 'status'], ['review_questions', 'disposition'], ['education', 'completion_status']]) {
  const changed = structuredClone(populated); changed[collection][0][property] = 'unsupported'; validate(`enum-${collection}-${property}`, changed, 1);
}
const definition = JSON.parse(fs.readFileSync(schema));
function localOnly(value) {
  if (!value || typeof value !== 'object') return;
  assert.equal(Object.hasOwn(value, 'default'), false);
  if (value.$ref) assert.ok(value.$ref.startsWith('#/$defs/'));
  Object.values(value).forEach(localOnly);
}
localOnly(definition);
console.log(`PASS profile contract: ${checks} external schema checks; legacy bytes preserved; closed objects, enums, versions and all-null scaffold verified. Semantic checks not assessed.`);
