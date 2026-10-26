'use strict';
// Test-only relocation driver. No runtime profile implementation lives here.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const requirements = [5, 6, 5, 6, 7, 7, 5].flatMap((count, group) => Array.from({ length: count }, (_, index) => `${group + 1}.${index + 1}`));
function verifyCoverage(rows) {
  const coverage = {};
  for (const row of rows) {
    assert.ok(row.observed && Object.keys(row.observed).length, 'missing observed outcome');
    assert.deepEqual(row.observed, row.expected, 'observed outcome mismatch');
    assert.ok(row.suite && row.name && row.requirements.length, 'missing evidence identity');
    for (const id of row.requirements) {
      assert.ok(requirements.includes(id), 'unknown requirement');
      (coverage[id] ||= []).push({ suite: row.suite, case: row.name });
    }
  }
  for (const id of requirements) assert.ok(coverage[id]?.length, `missing observed requirement ${id}`);
  return coverage;
}
const assets = ['references/candidate-profile.md', 'references/profile-contract.md', 'references/profile-validation.md', 'references/profile-updates.md', 'schemas/cv-facts.schema.json', 'schemas/cv-facts-v1.schema.json', 'templates/cv-facts.blank.json'];
const suites = ['contract', 'foundation', 'validation', 'evidence', 'migration', 'intake', 'updates', 'integration', 'edge-cases', 'isolation', 'persistence-acceptance'];
function verifyReferences(contents) {
  let links = 0;
  for (const [asset, text] of Object.entries(contents)) {
    if (asset.endsWith('.md')) {
      for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
        const target = path.posix.normalize(path.posix.join(path.posix.dirname(asset), match[1].split('#')[0]));
        assert.ok(Object.hasOwn(contents, target), 'unresolved relocated reference'); links++;
      }
    } else if (asset.startsWith('schemas/')) {
      const visit = value => {
        if (!value || typeof value !== 'object') return;
        if (Object.hasOwn(value, '$ref')) assert.ok(value.$ref.startsWith('#'), 'external schema dependency');
        for (const child of Object.values(value)) visit(child);
      };
      visit(JSON.parse(text));
    }
  }
  return links;
}
async function run() {
  const root = path.resolve(__dirname, '../..');
  const relocated = fs.mkdtempSync(path.join(os.tmpdir(), 'profile-relocated-'));
  const relative = path.relative(root, relocated);
  assert.ok(path.isAbsolute(relative) || relative === '..' || relative.startsWith('..' + path.sep), 'relocation must be outside repository');
  const output = path.join(root, 'outputs/profile-tests'); fs.mkdirSync(output, { recursive: true });
  const evidenceRoot = fs.mkdtempSync(path.join(output, 'full-acceptance-'));
  const report = { status: 'incomplete', assets: [], suites: [], coverage: null,
    limitations: 'Synthetic host-reviewed source mappings, not automatic prose interpretation or source authentication. Windows File.Replace and protected DACL only in fresh unpublished test-owned workspaces; no general writer exclusion, audit/encryption/network security guarantee. No final SKILL entrypoint or release archive verified.' };
  const save = () => fs.writeFileSync(path.join(evidenceRoot, 'evidence.json'), JSON.stringify(report, null, 2) + '\n');
  // Location stays in ignored output; public summaries contain no machine paths.
  fs.writeFileSync(path.join(evidenceRoot, 'workspace.txt'), relocated + '\n');
  const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
  function copy(relative) {
    const source = path.join(root, relative), destination = path.join(relocated, relative);
    assert.ok(fs.lstatSync(source).isFile(), 'only regular test/allowlisted asset files may be copied');
    fs.mkdirSync(path.dirname(destination), { recursive: true }); fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL);
    assert.equal(hash(fs.readFileSync(source)), hash(fs.readFileSync(destination)), 'relocated bytes differ');
    return destination;
  }
  for (const asset of assets) {
    const destination = copy('skills/targeted-cv/' + asset);
    report.assets.push({ asset, sha256: hash(fs.readFileSync(destination)), identical: true });
  }
  report.resolved_reference_links = verifyReferences(Object.fromEntries(assets.map(asset => [asset, fs.readFileSync(path.join(relocated, 'skills/targeted-cv', asset), 'utf8')])));
  // Existing adapters and fixtures are test infrastructure, outside the seven-asset skill.
  for (const entry of fs.readdirSync(__dirname, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !/\.(cjs|json)$/.test(entry.name) || entry.name.startsWith('full-acceptance')) continue;
    copy(path.relative(root, path.join(entry.parentPath, entry.name)));
  }
  copy('tests/fantasy-cv/facts.json');
  for (const absent of ['main.py', 'ats_agent.py', 'SKILL.md', 'node_modules', '../Skills']) assert.equal(fs.existsSync(path.join(relocated, absent)), false, 'unexpected runtime dependency');
  // Every copied harness resolves __dirname-relative resources from the unrelated root.
  // Node package search and caller preloads cannot smuggle in checkout dependencies.
  const env = { ...process.env }; delete env.NODE_PATH; delete env.NODE_OPTIONS; delete env.PROFILE_ACCEPTANCE_EVIDENCE;
  save();
  if (process.argv.includes('--smoke')) {
    const skill = path.join(relocated, 'skills/targeted-cv');
    const load = (file, names) => new Function(fs.readFileSync(path.join(skill, 'references', file), 'utf8').match(/```javascript\r?\n([\s\S]*?)```/)[1] + `; return {${names}};`)();
    const { createProfileIntake } = load('candidate-profile.md', 'createProfileIntake');
    const { dispatchVersion } = load('profile-contract.md', 'dispatchVersion');
    const { validateProfile } = load('profile-validation.md', 'validateProfile');
    const intake = createProfileIntake({ resolvePath: (w, p) => path.resolve(w, p), realpath: fs.realpathSync, readBytes: fs.readFileSync, decodeUtf8: b => b.toString('utf8'), sha256: hash });
    const selected = intake.select({ workspace_root: relocated, facts_path: 'skills/targeted-cv/templates/cv-facts.blank.json' });
    assert.equal(selected.status, 'selected'); assert.equal(dispatchVersion(intake.snapshot().profile).status, 'current');
    const validation = await validateProfile(intake.snapshot().profile, { validate: async schema => {
      const result = spawnSync('uvx', ['--from', 'check-jsonschema==0.38.2', 'check-jsonschema', '--schemafile', path.join(skill, schema), path.join(skill, 'templates/cv-facts.blank.json')], { cwd: relocated, env, encoding: 'utf8', windowsHide: true, timeout: 120000 });
      assert.equal(result.status, 0, 'smoke requires actual pinned schema success');
      return { state: 'passed', findings: [] };
    } });
    assert.deepEqual([validation.schema, validation.semantics, validation.readiness], ['passed', 'passed', 'not_assessed']);
    report.status = 'smoke_passed'; report.smoke = { selection: selected.status, schema: validation.schema, semantics: validation.semantics, readiness: validation.readiness }; save();
    console.log('Relocated smoke: copied blank selected; current version and actual schema/semantic validation passed; task readiness not assessed. No persistence or full acceptance claim.');
    return report;
  }
  for (const suite of suites) {
    console.log(`Relocated suite: ${suite}`);
    const result = spawnSync(process.execPath, [path.join(relocated, 'tests/portable-candidate-profile', suite + '.test.cjs')], { cwd: relocated, env, encoding: 'utf8', windowsHide: true, timeout: 600000 });
    report.suites.push({ suite, status: result.status, signal: result.signal || null, error: result.error?.code || null }); save();
    fs.writeFileSync(path.join(evidenceRoot, suite + '.log'), (result.stdout || '') + (result.stderr || ''));
    assert.equal(result.status, 0, `${suite}: failed; inspect private suite output`);
    process.stdout.write(result.stdout || '');
  }
  const testOutput = path.join(relocated, 'outputs/profile-tests');
  const findOne = prefix => {
    const dirs = fs.readdirSync(testOutput).filter(name => name.startsWith(prefix));
    assert.equal(dirs.length, 1, `expected one fresh ${prefix} evidence directory`);
    return path.join(testOutput, dirs[0]);
  };
  const rows = [];
  for (const suite of ['edge-cases', 'isolation']) {
    const evidence = JSON.parse(fs.readFileSync(path.join(findOne(suite + '-'), 'evidence.json')));
    for (const row of evidence.cases) {
      assert.equal(row.matches_expectation, true);
      // Edge findings supplement the asserted state triple; retain exact expected keys.
      const observed = Object.fromEntries(Object.keys(row.expected).map(key => [key, row.observed[key]]));
      rows.push({ suite, name: row.id, requirements: row.requirements, observed, expected: row.expected });
    }
  }
  const persistence = findOne('persistence-acceptance-');
  for (const suite of ['persistence', 'migration-integration']) {
    const evidence = JSON.parse(fs.readFileSync(path.join(persistence, suite + '.json')));
    rows.push(...evidence.cases.map(row => ({ ...row, suite })));
  }
  // Recheck immutable relocated assets after executing every flow.
  for (const item of report.assets) assert.equal(hash(fs.readFileSync(path.join(relocated, 'skills/targeted-cv', item.asset))), item.sha256);
  report.observations = rows; report.coverage = verifyCoverage(rows); report.status = 'passed'; save();
  console.log(`Full relocated profile acceptance: ${suites.length} top-level suites, ${rows.length} named observations, 41/41 criteria mapped. Seven byte-identical assets; intake, correction and lossless migration executed outside checkout. See scenarios.md for limits.`);
  return report;
}
module.exports = { verifyCoverage, verifyReferences, requirements, run };
if (require.main === module) run().catch(error => { console.error(error); process.exitCode = 1; });
