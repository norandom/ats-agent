'use strict';
// Simulated host capabilities test orchestration, never real skill installation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const {createHarness,classifyCheck} = require('./foundation.cjs');
const {profile} = require('./fixtures.cjs');
const {handoff} = require('./contract-fixture.cjs');
const sha256 = text => crypto.createHash('sha256').update(text).digest('hex');
(async () => {
  const h = createHarness();
  const {applyEditorialMethods} = h.load('strategy-editorial.md',['applyEditorialMethods']);
  const contract = {...h.load('strategy-contract.md',['fingerprint','targetFingerprint']),sha256};
  const p = profile('operations',h.blank), original = JSON.stringify(p);
  const calls = [], installed = new Map();
  let choice = 'fallback', available = true, failure = false, embeddedDone = true;
  const session = {};
  const host = {
    discover: async name => {calls.push(['discover',name]);return {installed:installed.has(name),available,version:name === 'cobesy' ? '1.3.0' : undefined,metadata:name === 'humanizer' ? {version:'2.9.1'} : {}};},
    offer: async missing => {calls.push(['offer',missing]);return {choice,authorized:choice === 'assisted'};},
    execute: async name => {calls.push(['execute',name]);if(failure) throw Error('simulated failure');return {completed:true};},
    embedded: async () => {calls.push(['embedded']);return {completed:embeddedDone};}
  };
  const full = await applyEditorialMethods(session,host);
  assert.equal(full.methods.length,2);
  assert.deepEqual(full.methods.map(m => m.version),['1.3.0','2.9.1']);
  assert.ok(full.methods.every(m => m.available && m.executed && !m.fallback));
  assert.equal(calls.filter(c => c[0] === 'offer').length,0);
  available = false;
  const missingSession = {};
  const fallback = await applyEditorialMethods(missingSession,host);
  assert.ok(fallback.methods.slice(0,2).every(m => !m.available && !m.executed && m.fallback));
  assert.equal(fallback.methods[2].executed,true);
  await applyEditorialMethods(missingSession,host);
  assert.equal(calls.filter(c => c[0] === 'offer').length,1,'one grouped offer per session');
  choice = 'declined';
  const declinedSession = {};
  await applyEditorialMethods(declinedSession,host);
  available = true;
  const declined = await applyEditorialMethods(declinedSession,host);
  assert.ok(declined.methods.slice(0,2).every(m => m.available && !m.executed && m.fallback));
  assert.equal(calls.filter(c => c[0] === 'offer').length,2,'decline persists');
  available = false;choice = 'manual';
  const manual = await applyEditorialMethods({},host);
  assert.equal(manual.handoffs.length,0);
  assert.equal(manual.guidance.length,2);
  assert.equal(manual.guidance[0].source,'https://github.com/norandom/Skills/tree/main/cobesy');
  choice = 'assisted';
  const installSession = {};
  const requested = await applyEditorialMethods(installSession,host);
  assert.equal(requested.handoffs.length,2);
  assert.ok(requested.handoffs.every(r => r.preserve_existing === true));
  installed.set('cobesy',true);installed.set('humanizer',true);
  const pending = await applyEditorialMethods(installSession,host);
  assert.ok(pending.methods.slice(0,2).every(m => !m.available && !m.executed));
  assert.equal(pending.handoffs.length,0,'do not retry installer handoff automatically');
  available = true;
  const rediscovered = await applyEditorialMethods(installSession,host);
  assert.ok(rediscovered.methods.every(m => m.executed));
  failure = true;
  const failed = await applyEditorialMethods({},host);
  assert.ok(failed.methods.slice(0,2).every(m => m.available && !m.executed && m.fallback_reason));
  embeddedDone = false;
  const unfinished = await applyEditorialMethods({},host);
  assert.equal(unfinished.methods[2].executed,false);
  available = false;
  const preserved = await applyEditorialMethods({},host);
  assert.equal(preserved.handoffs.length,0,'preserve unavailable existing installations');
  installed.clear();
  const unauthorized = await applyEditorialMethods({}, {...host,offer:async () => ({choice:'assisted',authorized:false})});
  assert.equal(unauthorized.handoffs.length,0,'assistance without authorization cannot dispatch installer');
  const uncertain = await applyEditorialMethods({}, {...host,discover:async () => ({available:true,installed:true}),execute:async () => ({completed:false})});
  assert.ok(uncertain.methods.slice(0,2).every(m => m.version === null && !m.executed));
  const discoveryFailed = await applyEditorialMethods({}, {...host,discover:async () => {throw Error('simulated discovery failure');},embedded:async () => {throw Error('simulated fallback failure');}});
  assert.ok(discoveryFailed.methods.every(m => !m.executed));
  assert.notEqual(contract.fingerprint(full.methods,sha256),contract.fingerprint(failed.methods,sha256));
  const versionChanged = structuredClone(full.methods);versionChanged[1].version = '2.9.2';
  assert.notEqual(contract.fingerprint(full.methods,sha256),contract.fingerprint(versionChanged,sha256));
  // Closed schema validates every execution variant, not a test-only approximation.
  let sequence = 0;
  for (const result of [full,fallback,declined,manual,requested,pending,rediscovered,failed,unfinished,preserved,unauthorized,uncertain,discoveryFailed]) {
    const value = handoff(p,contract);value.editorial_methods = result.methods;
    const file = path.join(h.workspace,`methods-${++sequence}.json`);fs.writeFileSync(file,JSON.stringify(value));
    const checked = spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(h.skillRoot,'schemas/application-strategy.schema.json'),file],{encoding:'utf8',windowsHide:true});
    assert.equal(classifyCheck(checked),'passed',checked.stdout+checked.stderr);
  }
  assert.equal(JSON.stringify(p),original);
  console.log('PASS: optional discovery, versions, once-only choices, authorized handoff, rediscovery, failure honesty, closed schema and method fingerprint changes.');
})().catch(error => {console.error(error);process.exitCode = 1;});
