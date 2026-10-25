'use strict';
// Test-only environment probes. Never accepts a candidate path or writes skill assets.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

function classifyCheck(result) {
  if (result.error || result.signal || result.status === null) return 'not_assessed';
  return result.status === 0 ? 'passed' : 'failed';
}

function writeDecision(host) {
  if (host.single_writer !== 'passed' || host.security !== 'passed') return 'deferred';
  return host.replacement === 'passed' && host.read_back === 'passed' ? 'confirmed' : 'unconfirmed';
}

function runFoundation() {
  const root = path.resolve(__dirname, '../..');
  const output = path.join(root, 'outputs', 'profile-tests');
  fs.mkdirSync(output, { recursive: true });
  const workspace = fs.mkdtempSync(path.join(output, 'foundation-'));
  const fixtureRoot = path.join(__dirname, 'fixtures');
  for (const name of ['probe.schema.json', 'probe-definitions.schema.json', 'probe-valid.json', 'probe-invalid.json']) {
    fs.copyFileSync(path.join(fixtureRoot, name), path.join(workspace, name));
  }
  const evidence = {
    scope: 'synthetic environment probe only; not candidate validation or persistence',
    tools: {}, validator: {}, host: {},
    profile_semantics: 'not_assessed', profile_write: 'deferred',
    commands: [],
    assets: {
      base: 'skills/targeted-cv/',
      current_schema: 'schemas/cv-facts.schema.json',
      legacy_schema: 'schemas/cv-facts-v1.schema.json',
      blank: 'templates/cv-facts.blank.json',
      references: 'references/',
      state: 'planned; foundation does not create later-task assets'
    }
  };
  function command(executable, args) {
    const result = spawnSync(executable, args, { cwd: workspace, encoding: 'utf8', timeout: 120000, windowsHide: true });
    evidence.commands.push({ executable, args, exit_code: result.status, signal: result.signal || null, error_code: result.error?.code || null });
    return result;
  }
  try {
    evidence.tools.uv = classifyCheck(command('uv', ['--version']));
    evidence.tools.uvx = classifyCheck(command('uvx', ['--version']));
    const prefix = ['--from', 'check-jsonschema==0.38.2', 'check-jsonschema'];
    const version = command('uvx', [...prefix, '--version']);
    evidence.validator.version = classifyCheck(version);
    if (evidence.validator.version === 'passed' && !/\b0\.38\.2\b/.test(version.stdout)) evidence.validator.version = 'failed';
    evidence.validator.local_ref_valid = classifyCheck(command('uvx', [...prefix, '--schemafile', 'probe.schema.json', 'probe-valid.json']));
    evidence.validator.local_ref_invalid = classifyCheck(command('uvx', [...prefix, '--schemafile', 'probe.schema.json', 'probe-invalid.json']));
    evidence.validator.missing_executable = classifyCheck(command(path.join(workspace, 'intentionally-unavailable-validator'), ['--version']));
    // Do not retain machine paths, command output or environment values in evidence.
    evidence.commands.at(-1).executable = '<isolated missing executable>';
    const host = evidence.host;
    function probe(name, action) {
      try { action(); host[name] = 'passed'; }
      catch (error) { host[name] = 'failed'; host[`${name}_error`] = error.code || 'assertion_failed'; }
    }
    const ensure = (condition) => { if (!condition) throw new Error('probe mismatch'); };
    probe('computation', () => ensure(new Set(['synthetic-a', 'synthetic-b', 'synthetic-a']).size === 2));
    const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
    probe('hashing', () => ensure(hash('abc') === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'));
    const original = Buffer.from('{"probe":"synthetic"}\n');
    const proposed = Buffer.from('{"probe":"replacement"}\n');
    const selected = path.join(workspace, 'selected.json');
    const staging = path.join(workspace, 'selected.stage.json');
    const backup = path.join(workspace, 'original.backup.json');
    fs.writeFileSync(selected, original, { flag: 'wx' });
    // Unique, task-owned synthetic destination provides isolation for this probe only.
    host.single_writer = 'passed';
    host.single_writer_scope = 'fresh synthetic workspace only; reassess for any real destination';
    probe('staging', () => {
      fs.writeFileSync(staging, proposed, { flag: 'wx' });
      ensure(hash(fs.readFileSync(staging)) === hash(proposed));
      ensure(JSON.parse(fs.readFileSync(staging, 'utf8')).probe === 'replacement');
    });
    probe('backup', () => {
      fs.copyFileSync(selected, backup, fs.constants.COPYFILE_EXCL);
      ensure(fs.readFileSync(backup).equals(original));
    });
    probe('replacement', () => {
      ensure(host.staging === 'passed' && host.backup === 'passed');
      ensure(fs.readFileSync(selected).equals(original));
      fs.renameSync(staging, selected);
    });
    probe('read_back', () => {
      ensure(host.replacement === 'passed');
      ensure(fs.readFileSync(selected).equals(proposed));
      ensure(hash(fs.readFileSync(selected)) === hash(proposed));
      ensure(JSON.parse(fs.readFileSync(selected, 'utf8')).probe === 'replacement');
    });
    host.security = 'not_assessed';
    host.security_reason = 'rename probe does not establish preservation of existing destination ACLs/security semantics';
    evidence.profile_write = writeDecision(host);
  } finally {
    fs.writeFileSync(path.join(workspace, 'evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
  }
  return { workspace, evidence };
}

module.exports = { runFoundation, classifyCheck, writeDecision };
