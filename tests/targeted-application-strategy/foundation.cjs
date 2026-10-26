'use strict';
// Test adapters only. Runtime intake and semantics are extracted from shipped references.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { classifyCheck } = require('../portable-candidate-profile/foundation.cjs');
const root = path.resolve(__dirname, '../..');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const assetNames = ['references/candidate-profile.md', 'references/profile-contract.md', 'references/profile-validation.md', 'references/profile-updates.md', 'schemas/cv-facts.schema.json', 'schemas/cv-facts-v1.schema.json', 'templates/cv-facts.blank.json', 'references/strategy-contract.md', 'schemas/application-strategy.schema.json'];
const validatorArgs = ['--from', 'check-jsonschema==0.38.2', 'check-jsonschema'];
function extractBlock(text, names) {
  const blocks = [...text.matchAll(/^```javascript\r?\n([\s\S]*?)^```\s*$/gm)];
  assert.equal(blocks.length, 1, 'expected exactly one executable JavaScript block');
  assert.ok(names.every(name => /^[A-Za-z_$][\w$]*$/.test(name)), 'invalid export name');
  return new Function(blocks[0][1] + `\nreturn {${names.join(',')}};`)();
}
function createHarness({ relocate = false } = {}) {
  const output = path.join(root, 'outputs/strategy-tests');
  if (process.env.STRATEGY_ACCEPTANCE_ROOT) {
    assert.equal(path.resolve(process.env.STRATEGY_ACCEPTANCE_ROOT), root, 'relocated test root must match this harness');
    const marker = JSON.parse(fs.readFileSync(path.join(root, '.strategy-acceptance.json'), 'utf8'));
    assert.equal(marker.kind, 'synthetic-relocation');
    assert.ok(!fs.existsSync(path.join(root, '.git')), 'relocated tests must not depend on a checkout');
    assert.equal(hash(fs.readFileSync(__filename)), marker.manifest['tests/targeted-application-strategy/foundation.cjs']);
  } else {
    const ignored = spawnSync('git', ['check-ignore', '--quiet', 'outputs/strategy-tests/probe.json'], { cwd: root, windowsHide: true });
    assert.equal(ignored.status, 0, 'test artifacts must be ignored before writing');
  }
  fs.mkdirSync(output, { recursive: true });
  const evidenceDirectory = fs.mkdtempSync(path.join(output, 'foundation-'));
  const workspace = relocate ? fs.mkdtempSync(path.join(os.tmpdir(), 'strategy-relocated-')) : evidenceDirectory;
  let skillRoot = path.join(root, 'skills/targeted-cv');
  const assets = [];
  if (relocate) {
    const destination = path.join(workspace, 'skill');
    for (const asset of assetNames) {
      const from = path.join(skillRoot, asset), to = path.join(destination, asset);
      fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to, fs.constants.COPYFILE_EXCL);
      assets.push({ asset, sha256: hash(fs.readFileSync(from)), relocated_sha256: hash(fs.readFileSync(to)) });
    }
    skillRoot = destination;
  }
  const env = { ...process.env }; delete env.NODE_PATH; delete env.NODE_OPTIONS;
  const command = (executable, args) => spawnSync(executable, args, { cwd: workspace, env, encoding: 'utf8', timeout: 120000, windowsHide: true });
  const version = command('uvx', [...validatorArgs, '--version']);
  const tools = { node: classifyCheck(command(process.execPath, ['--version'])), uvx: classifyCheck(command('uvx', ['--version'])), validator: classifyCheck(version) };
  if (tools.validator === 'passed' && !/\b0\.38\.2\b/.test(version.stdout)) tools.validator = 'failed';
  const load = (asset, names) => extractBlock(fs.readFileSync(path.join(skillRoot, 'references', asset), 'utf8'), names);
  const { validateProfile } = load('profile-validation.md', ['validateProfile']);
  const { createProfileIntake } = load('candidate-profile.md', ['createProfileIntake']);
  const intake = createProfileIntake({ resolvePath: path.resolve, realpath: fs.realpathSync, readBytes: fs.readFileSync, decodeUtf8: bytes => new TextDecoder('utf-8', { fatal: true }).decode(bytes), sha256: hash });
  const evidence = { tools, assets, reasoning: 'not_assessed', adapters: 'Node filesystem, hashing and external schema command; no simulated schema success', checks: [] };
  let sequence = 0;
  async function validate(profile, { executable = 'uvx', taskRequest = null, semanticIntegrity } = {}) {
    // Serialize the exact argument passed by the upstream validator, never a stale fixture.
    const report = await validateProfile(profile, { validate: async (schema, exactProfile) => {
      const file = path.join(workspace, `validation-${++sequence}.json`);
      fs.writeFileSync(file, JSON.stringify(exactProfile), { flag: 'wx' });
      const result = command(executable, [...validatorArgs, '--schemafile', path.join(skillRoot, schema), file]);
      return { state: classifyCheck(result), findings: [] };
    }, ...(semanticIntegrity ? { semanticIntegrity } : {}) }, taskRequest);
    evidence.checks.push({ method: 'executed_upstream_validation', profile_sha256: hash(JSON.stringify(profile)), schema: report.schema, semantics: report.semantics, readiness: report.readiness });
    return report;
  }
  function select(profile) {
    const file = path.join(workspace, `selected-${++sequence}.json`);
    fs.writeFileSync(file, JSON.stringify(profile), { flag: 'wx' });
    return { selection: intake.select({ workspace_root: workspace, facts_path: file }), snapshot: intake.snapshot() };
  }
  function saveEvidence() { fs.writeFileSync(path.join(evidenceDirectory, 'evidence.json'), JSON.stringify(evidence, null, 2) + '\n'); }
  return { workspace, skillRoot, assets, tools, evidence, load, validate, select, intake, saveEvidence, blank: JSON.parse(fs.readFileSync(path.join(skillRoot, 'templates/cv-facts.blank.json'), 'utf8')) };
}
module.exports = { createHarness, extractBlock, classifyCheck };
