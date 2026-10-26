'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { createHarness, classifyCheck } = require('./foundation.cjs');
const { profile } = require('./fixtures.cjs');
const { handoff } = require('./contract-fixture.cjs');
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
async function run() {
  const h = createHarness();
  const { stableSerialize, fingerprint, targetFingerprint, inspectStrategy } = h.load('strategy-contract.md', ['stableSerialize', 'fingerprint', 'targetFingerprint', 'inspectStrategy']);
  const p = profile('operations', h.blank);
  const instance = handoff(p, { sha256, fingerprint, targetFingerprint });
  let sequence = 0;
  const validate = async (schema, value, skillRoot = h.skillRoot) => {
    const file = path.join(h.workspace, `strategy-${++sequence}.json`);
    fs.writeFileSync(file, JSON.stringify(value));
    const result = spawnSync('uvx', ['--from', 'check-jsonschema==0.38.2', 'check-jsonschema', '--schemafile', path.join(skillRoot, schema), file], { encoding: 'utf8', windowsHide: true });
    return { state: classifyCheck(result), findings: [] };
  };
  const context = { profile: p, binding: instance.binding, sha256, validate };
  const archivedProfile = structuredClone(p);
  archivedProfile.change_history = [{
    id: 'history-fictional', proposal_id: 'proposal-fictional', base_sha256: sha256('fictional earlier bytes'),
    authorization: { id: 'authorization-fictional', scope: 'fact_update', request_reference: 'Fictional correction request', approved_at: '2026-01-02T10:00:00Z', proposal_id: 'proposal-fictional', resolved_path: '/fictional/private/facts.json' },
    accepted_at: '2026-01-02T10:01:00Z', source_ids: ['source-operations'],
    changes: [{ pointer: '/employment/0/claims/0/statement', before: { statement: 'Directed an invented global dispatch fleet.' }, after: { statement: 'Reconciled parcel manifests.' }, reason: 'Fictional correction of unsupported authority.' }]
  }];
  const archiveValidation = await h.validate(archivedProfile);
  assert.deepEqual([archiveValidation.schema, archiveValidation.semantics], ['passed', 'passed']);
  const archivedInstance = handoff(archivedProfile, { sha256, fingerprint, targetFingerprint });
  const archiveContext = { ...context, profile: archivedProfile, binding: archivedInstance.binding };
  const archivePointers = [
    '/change_history/0/changes/0/before', '/change_history/0/changes/0/before/statement',
    '/change_history/0/changes/0/after', '/change_history/0/changes/0/after/statement',
    '/change_history/0', '/change_history/0/changes', '/change_history/0/changes/0'
  ];
  for (const pointer of archivePointers) {
    const x = structuredClone(archivedInstance);
    Object.assign(x.claims[0].evidence[0], { record_id: 'history-fictional', pointer });
    const result = await inspectStrategy(x, archiveContext);
    assert.equal(result.schema, 'passed');
    assert.equal(result.deterministic, 'failed', `Archived evidence must fail: ${pointer}`);
    assert.ok(result.findings.some(f => f.code === 'profile_archive' && f.pointer === '/claims/0/evidence/0/pointer' && f.corrective_action));
  }
  const historyMetadata = structuredClone(archivedInstance);
  Object.assign(historyMetadata.claims[0].evidence[0], { record_id: 'history-fictional', pointer: '/change_history/0/changes/0/reason' });
  assert.equal((await inspectStrategy(historyMetadata, archiveContext)).deterministic, 'passed');
  const good = await inspectStrategy(instance, context);
  assert.deepEqual([good.schema, good.deterministic, good.host_meaning], ['passed', 'passed', 'not_assessed'], JSON.stringify(good.findings));
  const relocated = createHarness({ relocate: true });
  const relocatedInspect = relocated.load('strategy-contract.md', ['inspectStrategy']).inspectStrategy;
  assert.equal((await relocatedInspect(instance, { ...context, validate: (schema, exact) => validate(schema, exact, relocated.skillRoot) })).deterministic, 'passed');
  assert.equal(stableSerialize({ z: 1, a: { c: 3, b: 2 } }), '{"a":{"b":2,"c":3},"z":1}');
  assert.equal(fingerprint({ a: 1, b: 2 }, sha256), fingerprint({ b: 2, a: 1 }, sha256));
  assert.notEqual(fingerprint(['a', 'b'], sha256), fingerprint(['b', 'a'], sha256));
  assert.throws(() => stableSerialize({ invalid: undefined }));
  assert.throws(() => stableSerialize(NaN));
  assert.throws(() => stableSerialize('\ud800'));
  assert.throws(() => stableSerialize(Array(2)));
  assert.notEqual(fingerprint('é', sha256), fingerprint('e\u0301', sha256));
  const partialLanguage = structuredClone(instance);
  partialLanguage.claims[0].realizations[1].semantic_state = 'unresolved';
  partialLanguage.positioning.selected_claims[0].languages = ['en'];
  assert.equal((await inspectStrategy(partialLanguage, context)).deterministic, 'passed');
  const role = structuredClone(instance);
  role.target = { kind: 'role', title: 'Dispatch Coordinator', context: null, sha256: '' };
  role.target.sha256 = targetFingerprint(role.target, sha256);
  role.binding.target_sha256 = role.target.sha256;
  role.criteria = []; role.mappings = []; role.diagnostics = []; role.comparison = null;
  role.positioning.criterion_set_sha256 = fingerprint([], sha256);
  role.inferred_needs[0].spans = [];
  role.claims[0].target_references = [{ namespace: 'inferred_need', id: 'inferred_need:one' }];
  role.findings[0].criteria = [];
  role.questions[0].affected = [{ namespace: 'claim', id: 'claim:one' }];
  role.dispositions[0].binding = structuredClone(role.binding);
  assert.equal((await inspectStrategy(role, { ...context, binding: role.binding })).deterministic, 'passed');
  const schemaCases = [
    x => { x.extra = true; }, x => { x.claims[0].extra = true; },
    x => { x.settings.languages = null; }, x => { x.state = 'ready_for_submission'; },
    x => { x.criteria[0].id = 'claim:wrong'; }, x => { x.questions[0].priority = 8; },
    x => { x.binding.canonical_sha256 = 'bad'; }, x => { x.diagnostics[0].denominator = -1; },
    x => { x.claims[0].realizations[0].semantic_state = 'verified'; },
    x => { x.diagnostics[0].status = 'not_assessed'; },
    x => { x.document_checks[0].extra = true; },
    x => { x.guidance[0].extra = true; }
  ];
  for (const mutate of schemaCases) { const x = structuredClone(instance); mutate(x); const r = await inspectStrategy(x, context); assert.equal(r.schema, 'failed'); assert.equal(r.deterministic, 'not_assessed'); }
  const cases = [
    ['duplicate_id', x => x.claims.push(structuredClone(x.claims[0]))],
    ['broken_reference', x => { x.mappings[0].criterion.id = 'criterion:missing'; }],
    ['profile_reference', x => { x.claims[0].evidence[0].record_id = 'source-operations'; }],
    ['profile_pointer', x => { x.claims[0].evidence[0].pointer = '/candidate/name'; }],
    ['source_reference', x => { x.claims[0].evidence[0].source_ids = ['claim-operations']; }],
    ['span_mismatch', x => { x.criteria[0].spans[0].end -= 1; }],
    ['span_mismatch', x => { x.claims[0].realizations[0].spans[0].end = 999; }],
    ['binding_mismatch', x => { x.binding.generation += 1; }],
    ['fingerprint_mismatch', x => { x.target.text += ' '; }],
    ['mapping_cardinality', x => { x.mappings = []; }],
    ['selected_claim_unreviewed', x => { x.claims[0].realizations[1].semantic_state = 'unresolved'; }],
    ['broken_reference', x => { x.findings[0].claims[0].id = 'claim:missing'; }],
    ['fingerprint_mismatch', x => { x.diagnostics[0].population_sha256 = '0'.repeat(64); }],
    ['span_mismatch', x => { x.findings[0].draft_span.span.excerpt = 'wrong'; }],
    ['invalid_handoff_state', x => { x.state = 'ready_for_document_draft'; x.findings[0].severity = 'blocking'; }],
    ['broken_reference', x => { x.question_batch.suppressed_ids[0].id = 'question:missing'; }],
    ['binding_mismatch', x => { x.binding.validation_profile_sha256 = '0'.repeat(64); }],
    ['duplicate_language', x => { x.claims[0].realizations.push(structuredClone(x.claims[0].realizations[0])); }]
  ];
  for (const [code, mutate] of cases) {
    const x = structuredClone(instance); mutate(x);
    const r = await inspectStrategy(x, context);
    assert.equal(r.schema, 'passed', code); assert.equal(r.deterministic, 'failed', code);
    assert.ok(r.findings.some(f => f.code === code && f.pointer.startsWith('/') && f.corrective_action), `${code}: ${JSON.stringify(r.findings)}`);
    assert.equal(r.host_meaning, 'not_assessed');
  }
  const missing = await inspectStrategy(instance, { ...context, validate: async () => ({ state: 'not_assessed' }) });
  assert.deepEqual([missing.schema, missing.deterministic, missing.host_meaning], ['not_assessed', 'not_assessed', 'not_assessed']);
  const noBinding = await inspectStrategy(instance, { ...context, binding: null });
  assert.equal(noBinding.deterministic, 'not_assessed');
  console.log(`Strategy contracts passed: populated fictional handoff, ${schemaCases.length} real-schema negatives, ${cases.length} localized integrity negatives, ${archivePointers.length} historical archive negatives and metadata positive; host meaning not assessed.`);
}
run().catch(e => { console.error(e); process.exitCode = 1; });
