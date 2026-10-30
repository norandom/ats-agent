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
const createWindowsCreationAdapter = load('profile-updates.md', 'createWindowsCreationAdapter');
const createProfileIntake = load('candidate-profile.md', 'createProfileIntake');
const dispatchVersion = load('profile-contract.md', 'dispatchVersion');
const validateProfile = load('profile-validation.md', 'validateProfile');
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const blank = require('../../skills/targeted-cv/templates/cv-facts.blank.json');
const base = require('./fixtures/populated.cjs')(blank); base.evidence = []; base.review_questions = [];
const evidence = require('./acceptance-evidence.cjs')();
let checks = 0;
const check = (a, b) => { assert.deepEqual(a, b); checks++; };
const output = path.join(root, 'outputs/profile-tests'); fs.mkdirSync(output, { recursive: true });
const workspace = fs.mkdtempSync(path.join(output, 'persistence-'));
function ps(script, paths, shell = 'pwsh') {
  const r = spawnSync(shell, ['-NoProfile', '-NonInteractive', '-Command', '$ErrorActionPreference="Stop"; ' + script], {
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
async function nativeCreationLease() {
  const document = fs.readFileSync(path.join(root, 'skills/targeted-cv/references/profile-updates.md'), 'utf8');
  const script = document.match(/```powershell\r?\n([\s\S]*?)```/);
  assert.ok(script, 'installed reference supplies a usable native creation lease');
  if (process.platform !== 'win32') {
    assert.match(document, /Other hosts remain unassessed/); return;
  }
  const scriptPath = path.join(workspace, 'installed-native.ps1');
  fs.writeFileSync(scriptPath, script[1]);
  const { spawn } = require('node:child_process');
  const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-File', scriptPath], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
  const lines = require('node:readline').createInterface({ input: child.stdout });
  const pending = []; let stderr = '';
  child.stderr.on('data', b => { stderr += b; });
  lines.on('line', line => { const done = pending.shift(); if (done) done(JSON.parse(line)); });
  const ask = data => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('Native lease response timeout: ' + stderr)), 15000);
    pending.push(value => { clearTimeout(timer); resolve(value); }); child.stdin.write(JSON.stringify(data) + '\n');
  });
  const external = (file, action) => {
    const r = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      '$ErrorActionPreference="Stop";try {switch($env:NATIVE_ACTION){read{$s=[IO.File]::Open($env:NATIVE_FILE,"Open","Read","ReadWrite,Delete");$s.Dispose()}write{$s=[IO.File]::Open($env:NATIVE_FILE,"Open","Write","ReadWrite,Delete");$s.Dispose()}delete{[IO.File]::Delete($env:NATIVE_FILE)}rename{[IO.File]::Move($env:NATIVE_FILE,$env:NATIVE_FILE+".moved")}directoryRename{[IO.Directory]::Move($env:NATIVE_FILE,$env:NATIVE_FILE+".moved")}};"allowed"}catch{"denied"}'],
    { windowsHide: true, encoding: 'utf8', env: { ...process.env, NATIVE_FILE: file, NATIVE_ACTION: action } });
    assert.equal(r.status, 0, r.stderr); return r.stdout.trim();
  };
  try {
    const source = path.join(workspace, 'fictional-source.json'); fs.writeFileSync(source, '{"fictional":true}');
    const original = fs.readFileSync(source), sourceAcl = acl(source);
    const storage = await ask({ op: 'establishRoot', workspace, name: 'fresh-private-' + crypto.randomUUID() });
    assert.equal(storage.ok, true, JSON.stringify(storage));
    assert.equal(storage.ordinary_user, true, 'actual native proof requires an ordinary user');
    await versionPersistenceCases(ask, storage);
    const destination = path.join(storage.path, 'successor.json');
    const request = { op: 'acquire', phase: 'create', policy_id: 'windows-private-new-file-v1', root: storage.capability,
      source: { resolved_path: source, sha256: hash(original) }, destination };
    const lease = await ask(request); assert.equal(lease.ok, true, JSON.stringify(lease));
    for (const action of ['write','delete','rename']) assert.equal(external(source, action), 'denied', 'source ' + action);
    assert.equal(external(storage.path, 'directoryRename'), 'denied', 'native parent relocation guard');
    const bytes = Buffer.from(JSON.stringify(base));
    const created = await ask({ op: 'createNew', lease: lease.lease, bytes: bytes.toString('base64') });
    assert.equal(created.ok, true, JSON.stringify(created));
    assert.equal(created.bytes, bytes.toString('base64')); assert.equal(created.reopened, true);
    const validated = await validate(JSON.parse(Buffer.from(created.bytes, 'base64').toString('utf8')));
    assert.equal(validated.schema, 'passed'); assert.equal(validated.semantics, 'passed');
    for (const action of ['write','delete','rename']) assert.equal(external(destination, action), 'denied', 'reopened ' + action);
    assert.equal(external(destination, 'read'), 'allowed', 'ordinary readers allowed after creation');
    assert.equal((await ask({ op: 'verifyPolicy', lease: lease.lease })).ok, true);
    assert.equal((await ask({ op: 'createNew', lease: lease.lease, bytes: bytes.toString('base64') })).ok, false, 'one attempt');
    assert.equal((await ask({ op: 'release', lease: lease.lease })).ok, true);
    assert.deepEqual(fs.readFileSync(source), original); assert.equal(acl(source), sourceAcl);
    assert.equal((await ask(request)).ok, false, 'occupied destination');
    const inspection = await ask({ ...request, phase: 'inspect' }); assert.equal(inspection.ok, true, JSON.stringify(inspection));
    assert.equal((await ask({ op: 'readDestination', lease: inspection.lease })).bytes, bytes.toString('base64'));
    assert.equal((await ask({ op: 'createNew', lease: inspection.lease, bytes: bytes.toString('base64') })).ok, false);
    await ask({ op: 'release', lease: inspection.lease });
    const absent = await ask({ ...request, phase: 'inspect', destination: path.join(storage.path, 'absent.json') });
    assert.equal(absent.ok, true); assert.equal((await ask({ op: 'readDestination', lease: absent.lease })).bytes, null);
    await ask({ op: 'release', lease: absent.lease });
    assert.equal((await ask({ ...request, destination: path.join(workspace, 'foreign.json'), root: storage.capability })).ok, false);
    assert.equal((await ask({ ...request, destination: path.join(storage.path, 'changed.json'), source: { resolved_path: source, sha256: '0'.repeat(64) } })).ok, false);
    assert.equal((await ask({ op: 'establishRoot', workspace, name: path.basename(storage.path) })).ok, false, 'no root adoption');
    const link = path.join(workspace, 'hardlink.json'); fs.linkSync(source, link);
    assert.equal((await ask({ ...request, destination: path.join(storage.path, 'linked-source.json') })).ok, false, 'multiple links rejected');
    fs.unlinkSync(link);
    const junction = path.join(workspace, 'redirected');
    ps('New-Item -ItemType Junction -Path $env:TEST_LINK -Target $env:TEST_TARGET | Out-Null', { TEST_LINK: junction, TEST_TARGET: storage.path });
    assert.equal((await ask({ op: 'establishRoot', workspace: junction, name: 'redirected-root' })).ok, false, 'reparse parent rejected');
    const unsafe = await ask({ op: 'establishRoot', workspace, name: 'unsafe-parent-' + crypto.randomUUID() }); assert.equal(unsafe.ok, true);
    ps('$sid=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value;$a=[Security.AccessControl.DirectorySecurity]::new();$a.SetSecurityDescriptorSddlForm("D:P(A;;FA;;;$sid)(A;;FA;;;SY)",[Security.AccessControl.AccessControlSections]::Access);[IO.Directory]::SetAccessControl($env:TEST_FILE,$a)', { TEST_FILE: unsafe.path }, 'powershell.exe');
    assert.equal((await ask({ ...request, root: unsafe.capability, destination: path.join(unsafe.path, 'unsafe.json') })).ok, false, 'FullControl parent rejected');
    const raced = { ...request, destination: path.join(storage.path, 'race.json') };
    const first = await ask(raced), second = await ask(raced);
    assert.equal(first.ok, true); assert.equal(second.ok, true);
    assert.equal((await ask({ op: 'createNew', lease: first.lease, bytes: bytes.toString('base64') })).ok, true);
    assert.equal((await ask({ op: 'createNew', lease: second.lease, bytes: Buffer.from('{}').toString('base64') })).ok, false, 'atomic race collision');
    assert.equal((await ask({ op: 'createNew', lease: second.lease, bytes: bytes.toString('base64') })).ok, false, 'failed attempt cannot replay');
    assert.deepEqual(fs.readFileSync(raced.destination), bytes);
    await ask({ op: 'release', lease: first.lease }); await ask({ op: 'release', lease: second.lease });
  } finally { child.stdin.end(); child.kill(); }
}
async function run() {
  await nativeCreationLease();
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
async function versionPersistenceCases(ask, storage) {
  const source = path.join(workspace, 'version-source.json'), original = Buffer.from(JSON.stringify(base));
  fs.writeFileSync(source, original); const originalAcl = acl(source);
  let serial = 0, priorConfirmed = null;
  const acquireNative = createWindowsCreationAdapter({request:ask,root:storage.capability,fromBase64:s=>Buffer.from(s,'base64'),toBase64:b=>Buffer.from(b).toString('base64')});
  for (const mode of ['success', 'lost_ack', 'read_failure', 'collision', 'atomic_collision', 'partial', 'absent', 'policy', 'validation', 'source_changed', 'selection', 'busy', 'replaced_identity', 'restart', 'late_source', 'late_selection', 'source_identity', 'release_failure', 'release_selection', 'pre_validation', 'scoped']) {
    const destination = path.join(storage.path, 'version-' + mode + '.json');
    const profile = structuredClone(mode==='lost_ack' ? priorConfirmed : base);
    if (mode === 'scoped') { profile.schema_version = '2.1'; profile.application_scope = { application_id: 'fictional-version-app', target_sha256: 'c'.repeat(64), origin_profile: {schema_version:'2.0',resolved_path:source,sha256:hash(original)} }; }
    const sourceBytes = Buffer.from(JSON.stringify(profile)); fs.writeFileSync(source, sourceBytes);
    const selected = {generation:1, selection:{resolved_path:source,profile_sha256:hash(sourceBytes),schema_version:profile.schema_version},profile};
    const proposal = structuredClone(profile); proposal.candidate.name = mode==='lost_ack' ? 'Fictional Later Successor Person' : 'Fictional Successor Person';
    let creates = 0, firstRead = true, attempted = false, decisions = 0, failValidation = false, inspectOnly = false, inspected = 0, failedRelease = false;
    const taskRequest={task_id:'fictional-version-name',required:[{pointer:'/candidate/name',record_id:null,reason:'Explicitly selected candidate identity for synthetic intake.'}]};
    const host = {taskRequest,creationPolicyId:'windows-private-new-file-v1',currentSelection:()=>structuredClone(selected),sha256:hash,
      encode:s=>Buffer.from(s),decode:b=>new TextDecoder('utf-8',{fatal:true}).decode(b),
      currentApplicationSelection:()=>profile.application_scope && {application_id:profile.application_scope.application_id,target_sha256:profile.application_scope.target_sha256},
      validate:async p => failValidation ? {schema:'failed',semantics:'failed'} : validateProfile(p,{applicationSelection:host.currentApplicationSelection(), validate:async()=>{
        const file=path.join(workspace,'version-validate-'+(++serial)+'.json');fs.writeFileSync(file,JSON.stringify(p));
        const r=spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(root,'skills/targeted-cv/schemas',p.schema_version==='2.1'?'cv-facts-application.schema.json':'cv-facts.schema.json'),file],{encoding:'utf8',windowsHide:true});
        return {state:r.status===0?'passed':'failed',findings:[]}; }},taskRequest),
      userDecision:async reviewed=>{decisions++;return {decision:'approved',reviewed,authorization:{id:'version-auth-'+mode,scope:reviewed.scope,request_reference:'fictional-exact-request',approved_at:'2026-10-30T12:00:00Z',proposal_id:reviewed.proposal_id,resolved_path:reviewed.resolved_path}};},now:()=> '2026-10-30T12:01:00Z',
      acquireCreate:async options=>{
        if (inspectOnly) check(options.phase,'inspect');
        if (attempted && options.phase==='inspect') inspected++;
        const lease=await acquireNative(options); if(!lease || lease.conflict)return lease;
        const read=lease.readDestination, create=lease.createNew, verify=lease.verifyPolicy;
        return {...lease,
          readDestination:async()=>{if(attempted && ['read_failure','busy','replaced_identity','restart','late_source','late_selection','source_identity'].includes(mode) && firstRead){firstRead=false;throw Error('read unavailable');}return read();},
          release:async()=>{await lease.release();if(attempted && mode==='release_failure' && !failedRelease){failedRelease=true;throw Error('release acknowledgement unavailable');}if(attempted && mode==='release_selection')selected.generation++;},
          verifyPolicy:async()=>{if(attempted && mode==='policy')return false;return verify();},
          ...(create ? {createNew:async bytes=>{creates++;attempted=true;
            if(mode==='atomic_collision') {
              const competitor=await acquireNative(options);
              await competitor.createNew(bytes); await competitor.release();
            }
            if(mode==='partial'){await create(Buffer.from('{}'));throw Error('partial');}
            if(mode==='absent')throw Error('dispatch unavailable');
            await create(bytes);
            if(mode==='validation')failValidation=true;
            if(mode==='lost_ack')throw Error('lost acknowledgement');}} : {})};
      }};
    const request={proposal_id:'version-proposal-'+mode,history_id:'version-history-'+mode,scope:mode==='scoped'?'application_fact_update':'fact_update',source_ids:['source-demo'],proposed_profile:proposal,selection_effect:'select_after_confirmation',changes:[{pointer:'/candidate/name',before:profile.candidate.name,after:proposal.candidate.name,reason:'Fictional authorized successor correction.'}]};
    const api=createProfileUpdates(host), decision=await api.prepareVersion(selected,request,destination);
    check(decision.decision_state,'authorized'); check(decisions,1);
    if(mode==='success') {
      check((await api.persistVersion(structuredClone(decision))).status,'unconfirmed');
      check((await createProfileUpdates(host).persistVersion(decision)).status,'unconfirmed');
      const old=await api.prepare(selected,request); check((await api.persistVersion(old)).status,'unconfirmed');
      decision.proposed_profile.candidate.name='Unapproved Fictional Mutation';
      check((await api.persistVersion(decision)).status,'unconfirmed');
      decision.proposed_profile.candidate.name=proposal.candidate.name;
      check((await api.persist(decision)).decision_state,'decision_required');
      check((await api.persistFork(decision)).decision_state,'decision_required');
    }
    if(mode==='collision') {
      const competitor=await acquireNative({source:{resolved_path:source,sha256:hash(sourceBytes)},destination,policy_id:host.creationPolicyId,phase:'create'});
      await competitor.createNew(Buffer.from(JSON.stringify(decision.proposed_profile,null,2)+'\n')); await competitor.release();
    }
    if(mode==='source_changed')fs.appendFileSync(source,' ');
    if(mode==='selection')selected.generation++;
    if(mode==='pre_validation')failValidation=true;
    const result=await api.persistVersion(decision);
    check(result.status,['success','lost_ack','scoped'].includes(mode)?'confirmed':mode==='pre_validation'?'rejected':mode==='collision'||mode==='source_changed'||mode==='selection'?'conflict':'unconfirmed');
    check(Object.keys(result).sort(),['active_selection','destination','findings','proposal_id','source_selection','status']);
    check(result.active_selection,'unchanged');
    check(creates,['collision','source_changed','selection','pre_validation'].includes(mode)?0:1);
    inspectOnly=true;
    if(mode==='busy'){host.acquireCreate=async options=>{check(options.phase,'inspect');return null;};}
    if(mode==='replaced_identity') {fs.renameSync(destination,destination+'.retained'); fs.writeFileSync(destination,fs.readFileSync(destination+'.retained')); ps('Set-Acl -LiteralPath $env:TEST_FILE -AclObject (Get-Acl -LiteralPath $env:TEST_ORIGINAL)',{TEST_FILE:destination,TEST_ORIGINAL:destination+'.retained'});}
    if(mode==='source_identity') {fs.renameSync(source,source+'.retained');fs.writeFileSync(source,sourceBytes);}
    if(mode==='late_source')fs.appendFileSync(source,' ');
    if(mode==='late_selection')selected.generation++;
    const again=await (mode==='restart'?createProfileUpdates(host):api).persistVersion(decision);
    check(again.status,['success','lost_ack','scoped','read_failure','release_failure'].includes(mode)?'confirmed':mode==='pre_validation'?'rejected':['collision','source_changed','selection','late_selection','release_selection'].includes(mode)?'conflict':'unconfirmed');
    if(mode==='restart')check((await createProfileUpdates(host).persistVersion(decision)).status,'unconfirmed');
    check(creates,['collision','source_changed','selection','pre_validation'].includes(mode)?0:1);
    if(['atomic_collision','partial','absent'].includes(mode))check(inspected,1);
    if(result.status==='confirmed') {
      check(result.destination.sha256,hash(fs.readFileSync(destination)));check(result.destination.schema_version,profile.schema_version);
      const saved=JSON.parse(fs.readFileSync(destination));check(saved.change_history.slice(0,-1),profile.change_history);check(saved.sources,profile.sources);
      if(mode==='success')priorConfirmed=structuredClone(saved);
      if(mode==='lost_ack')check(saved.change_history.length,base.change_history.length+2);
      check(saved,decision.proposed_profile);
      if(mode==='scoped')check(saved.application_scope,profile.application_scope);
      const intake=createProfileIntake({resolvePath:(w,p)=>path.resolve(w,p),realpath:fs.realpathSync,readBytes:fs.readFileSync,decodeUtf8:host.decode,sha256:hash});
      const selectionRequest={workspace_root:workspace,facts_path:source,...(mode==='scoped'?{application_selection:host.currentApplicationSelection()}:{})};
      check(intake.select(selectionRequest).status,'selected');
      check(intake.snapshot().selection.resolved_path,source);
      const authorityCalls=decisions;
      // This explicit action is already covered by the reviewed select_after_confirmation request.
      check(intake.select({...selectionRequest,facts_path:result.destination.resolved_path}).status,'selected');
      const reopened=intake.snapshot();check(reopened.selection.profile_sha256,result.destination.sha256);
      check(dispatchVersion(reopened.profile).status,'current');
      const report=await host.validate(reopened.profile);check(report.schema,'passed');check(report.semantics,'passed');check(report.readiness,'ready');
      check(decisions,authorityCalls);
    }
    check(fs.readFileSync(source),['source_changed','late_source'].includes(mode)?Buffer.concat([sourceBytes,Buffer.from(' ')]):sourceBytes);
    check(acl(source),originalAcl);
  }
  console.log('Task6.3 native owner cases passed: exact actual schema/readback, closed result, identity-backed reconciliation, collision isolation, scope/history and source continuity.');
}
