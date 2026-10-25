'use strict';
// Fictional data only; execute the distributable reference, not a test implementation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const text = fs.readFileSync(path.join(__dirname, '../../skills/targeted-cv/references/profile-validation.md'), 'utf8');
const code = text.match(/```javascript\r?\n([\s\S]*?)```/)[1];
const api = new Function(`${code}; return { validateProfile, evidenceView };`);
const blank = require('../../skills/targeted-cv/templates/cv-facts.blank.json');
const populated = require('./fixtures/populated.cjs');
const host = { validate: async () => ({ state: 'passed', findings: [] }) };
let checks = 0;
const check = (a, b) => { assert.deepEqual(a, b); checks++; };
function clean() { const p = populated(blank); p.evidence = []; p.review_questions = []; return p; }
function request(pointer, record_id = null) { return { task_id: 'synthetic-task', required: [{ pointer, record_id, reason: 'Needed for the fictional task.' }] }; }
async function run() {
  const { validateProfile, evidenceView } = api();
  async function runCase(edit, task = null) { const p = clean(); edit(p); const before = JSON.stringify(p); const r = await validateProfile(p, host, task); check(JSON.stringify(p), before); return { p, r }; }
  async function invalid(edit, code) { const { r } = await runCase(edit); check(r.semantics, 'failed'); check(r.findings.some(f => f.code === code && f.pointer && f.corrective_action), true); }
  await invalid(p => p.sources[0].verification = 'independently_verified', 'verification_basis_required');
  await invalid(p => { p.review_questions = [{ id: 'q', related_ids: ['profile-demo'], question: '?', disposition: 'answered', answer: null, answer_source_ids: [] }]; }, 'answer_evidence_required');
  await invalid(p => { p.sources[0].type = 'document'; p.evidence = [{ id: 'e', record_id: 'profile-demo', field_pointer: '/statement', status: 'confirmed_gap', source_ids: ['source-demo'], rationale: null }]; }, 'gap_user_source_required');
  await invalid(p => { p.conflicts[0].alternatives[0].source_ids = []; }, 'conflict_alternatives_required');
  await invalid(p => { p.education[0].qualification = 'Unknown award A'; p.education[0].source_ids = ['source-demo']; }, 'open_conflict_canonical');
  await invalid(p => { p.conflicts[0].selected_alternative = 0; }, 'open_conflict_selection');
  await invalid(p => { p.conflicts[0].status = 'resolved'; p.conflicts[0].selected_alternative = 0; p.conflicts[0].resolution_source_ids = ['source-demo']; }, 'conflict_canonical_mismatch');
  await invalid(p => { p.conflicts[0].status = 'resolved'; p.conflicts[0].selected_alternative = 99; }, 'conflict_resolution_required');
  await invalid(p => p.change_history[0].authorization.proposal_id = 'other', 'history_authorization_mismatch');
  await invalid(p => p.change_history[0].authorization.request_reference = ' ', 'history_authorization_incomplete');
  await invalid(p => p.change_history[0].authorization.approved_at = '2027-01-01T12:00:00Z', 'history_chronology');
  await invalid(p => p.change_history[0].authorization.scope = 'fact_update', 'history_scope_mismatch');
  await invalid(p => { p.review_questions = [{ id: 'q', related_ids: ['profile-demo'], question: '?', disposition: 'confirmed_gap', answer: null, answer_source_ids: [] }]; }, 'gap_user_source_required');
  await invalid(p => { p.evidence = [{ id: 'e', record_id: 'profile-demo', field_pointer: '/statement', status: 'supported', source_ids: [], rationale: null }]; }, 'evidence_source_required');
  await invalid(p => { p.conflicts[0].status = 'resolved'; p.conflicts[0].selected_alternative = 0; p.conflicts[0].resolution_source_ids = ['source-demo']; p.sources[0].type = 'document'; }, 'conflict_resolution_required');
  await invalid(p => p.change_history[0].changes[0].pointer = '/bad~2pointer', 'history_change_invalid');
  await invalid(p => p.change_history[0].changes[0].after = null, 'history_change_invalid');
  check((await runCase(p => { p.sources[0].verification = 'independently_verified'; p.sources[0].verification_basis = 'Fictional verification exhibit reference.'; })).r.semantics, 'passed');
  check((await runCase(p => { p.change_history[0].base_sha256 = 'a'.repeat(64); })).r.semantics, 'passed'); // intake into an existing blank profile is possible
  check((await runCase(p => { p.education[0].qualification = 'Unknown award A'; p.education[0].source_ids = ['source-demo']; p.evidence = [{ id: 'e', record_id: 'education-demo', field_pointer: '', status: 'uncertain', source_ids: [], rationale: null }]; }, request('/education/0/qualification'))).r.readiness, 'incomplete');
  // Equality compares JSON structure rather than object key insertion order.
  const objectResolution = await runCase(p => { p.conflicts[0].record_id = 'candidate'; p.conflicts[0].field_pointer = '/location'; p.conflicts[0].status = 'resolved'; p.conflicts[0].selected_alternative = 0; p.conflicts[0].resolution_source_ids = ['source-demo']; p.conflicts[0].alternatives[0].value = { country: null, city: 'Fictional City' }; p.candidate.location = { city: 'Fictional City', country: null }; });
  check(objectResolution.r.semantics, 'passed');
  check((await validateProfile(structuredClone(blank), host, request(''))).readiness, 'incomplete');
  check((await validateProfile(structuredClone(blank), host, request('/candidate'))).readiness, 'incomplete');
  for (const pointer of ['/candidate/email', '/missing', '/education/0', '/education/0/qualification']) {
    const { r } = await runCase(() => {}, request(pointer)); check(r.schema, 'passed'); check(r.semantics, 'passed'); check(r.readiness, 'incomplete'); check(r.findings.some(f => f.code === 'task_incomplete' && f.pointer === pointer), true);
  }
  check((await runCase(() => {}, request('/candidate/name', 'candidate'))).r.readiness, 'ready');
  check((await runCase(() => {}, request('/candidate/name', 'missing'))).r.readiness, 'incomplete');
  check((await runCase(() => {})).r.readiness, 'not_assessed');
  check((await runCase(() => {}, { task_id: 'task', required: [] })).r.readiness, 'ready');
  check((await runCase(() => {}, { task_id: 'task', required: [{ pointer: '/candidate/name', record_id: null }] })).r.readiness, 'not_assessed');
  check((await runCase(p => { p.evidence = [{ id: 'e', record_id: 'candidate', field_pointer: '/name', status: 'uncertain', source_ids: [], rationale: null }]; }, request('/candidate/name'))).r.readiness, 'incomplete');
  for (const disposition of ['skipped', 'not_applicable']) check((await runCase(p => { p.review_questions = [{ id: 'q', related_ids: ['candidate'], question: '?', disposition, answer: null, answer_source_ids: [] }]; }, request('/candidate/name'))).r.readiness, 'ready');
  const resolved = await runCase(p => { p.conflicts[0].status = 'resolved'; p.conflicts[0].selected_alternative = 0; p.conflicts[0].resolution_source_ids = ['source-demo']; p.education[0].qualification = 'Unknown award A'; p.education[0].source_ids = ['source-demo']; }, request('/education/0/qualification'));
  check(resolved.r.semantics, 'passed'); check(resolved.r.readiness, 'ready');
  const bounded = await runCase(p => p.employment[0].current = true, request('/employment/0/current'));
  check(bounded.r.readiness, 'ready'); check(bounded.r.findings.some(f => f.code === 'observation_limit'), true);
  check((await runCase(p => { p.employment[0].current = true; p.employment[0].as_of = null; p.sources[0].as_of = null; }, request('/employment/0/current'))).r.readiness, 'incomplete');
  check((await runCase(p => { p.employment[0].current = true; p.employment[0].as_of = null; }, request('/employment/0/current'))).r.readiness, 'ready'); // source observation stays bounded, receipt date never substituted
  check((await runCase(p => { p.employment[0].current = false; p.employment[0].as_of = null; p.sources[0].as_of = null; }, request('/employment/0/current'))).r.readiness, 'ready');
  for (const status of ['absent', 'uncertain', 'confirmed_gap', 'transferable', 'supported']) {
    const result = await runCase(p => { p.evidence = [{ id: 'e', record_id: 'candidate', field_pointer: '/name', status, source_ids: ['source-demo'], rationale: null }]; }, request('/candidate/name'));
    check(result.r.readiness, ['absent', 'uncertain', 'confirmed_gap'].includes(status) ? 'incomplete' : 'ready');
    check(evidenceView(null, result.p, result.r).profile.evidence[0].status, status);
  }
  const view = evidenceView({ resolved_path: 'fictional.json' }, resolved.p, resolved.r);
  check(view.profile, resolved.p); check(view.validation, resolved.r); check(view.unresolved_record_ids, []);
  const unresolved = await runCase(() => {}); check(evidenceView(null, unresolved.p, unresolved.r).unresolved_record_ids, ['education-demo']);
  const noHost = await validateProfile(clean(), { ...host, semanticIntegrity: async () => { throw Error('unavailable'); } }, request('/candidate/name'));
  check(noHost.readiness, 'not_assessed'); check(noHost.semantics, 'not_assessed');
  console.log(`Profile evidence/readiness: ${checks} checks passed.`);
}
run().catch(error => { console.error(error); process.exitCode = 1; });
