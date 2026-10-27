'use strict';
// Invented application only. Semantic labels are fixture inputs, not model judgments.
function handoff(profile, { sha256, fingerprint, targetFingerprint }) {
  const r = (namespace, local = 'one') => ({ namespace, id: `${namespace}:${local}` });
  const span = excerpt => ({ start: 0, end: Array.from(excerpt).length, excerpt });
  const evidence = { record_id: 'claim-operations', pointer: '/employment/0/claims/0/statement', source_ids: ['source-operations'], original_state: 'supported', observation_limit: 'Fictional observation through 2025-12 only.' };
  const target = { kind: 'offer', text: '📦 Reconcile manifests.', sha256: '' };
  target.sha256 = targetFingerprint(target, sha256);
  const settings = { languages: ['en', 'de'], market: 'DE', requested_documents: ['cv'], question_limit: 3 };
  const binding = { schema_version: '1.1', application_id: null, application_context_sha256: null, host_session: 'fictional-session', generation: 1, resolved_path: '/fictional/private/facts.json', canonical_sha256: sha256(JSON.stringify(profile)), profile_version: '2.0', validation_profile_sha256: sha256(JSON.stringify(profile)), target_sha256: target.sha256, settings_sha256: fingerprint(settings, sha256), evaluation_date: '2026-01-03' };
  const criteria = [{ id: 'criterion:one', kind: 'responsibility', priority: 'required', wording: 'Reconcile manifests', concept: 'manifest reconciliation', spans: [span(target.text)], grouping_rationale: 'One explicit responsibility.' }];
  const realizations = [
    { language: 'en', wording: 'Reconciled parcel manifests.', spans: [span('Reconciled parcel manifests.')], semantic_state: 'supported', semantic_reason: 'Fixture label only.' },
    { language: 'de', wording: 'Glich Paketlisten ab.', spans: [span('Glich Paketlisten ab.')], semantic_state: 'supported', semantic_reason: 'Fixture label only.' }
  ];
  const rubric = { version: 'strategy-review/1.0', definition: 'Demonstrated required criterion coverage.', scale: { minimum: 0, maximum: 100, unit: 'percent' }, weights: [{ reference: r('criterion'), weight: 1 }], unknown_treatment: 'Non-supported states remain in the denominator.' };
  return {
    schema_version: '1.1', binding, application_context: null, state: 'bounded', target, settings, criteria,
    inferred_needs: [{ id: 'inferred_need:one', status: 'inferred', wording: 'Reliable handover may matter.', rationale: 'Hypothesis from manifest work.', spans: [span(target.text)] }],
    mappings: [{ criterion: r('criterion'), state: 'supported', evidence: [structuredClone(evidence)], rationale: 'Fictional record addresses manifest work.', limits: ['No independent verification.'] }],
    positioning: { audience: 'Dispatch hiring team', intended_decision: 'Discuss relevant experience', contribution_thesis: 'Careful manifest handling supports dispatch.', selected_claims: [{ claim: r('claim'), languages: ['en', 'de'] }], selections: [{ claim: r('claim'), decision: 'include', rationale: 'Relevant episode.' }], expertise_groups: [{ name: 'Manifest accuracy', claims: [r('claim')], rationale: 'Relevant work capability.' }], terminology: [{ id: 'terminology:one', original_term: 'parcel manifests', proposed_term: 'Paketlisten', relation: 'translation', evidence: [structuredClone(evidence)], guidance: [r('guidance')], rationale: 'Fixture translation.', limits: ['Host meaning remains unassessed.'] }], criterion_set_sha256: fingerprint(criteria, sha256) },
    claims: [{ id: 'claim:one', subject: 'candidate', context_evidence: [], proposition: 'Reconciled parcel manifests.', evidence: [structuredClone(evidence)], target_references: [r('criterion'), r('inferred_need')], limits: ['Historical episode.'], realizations }],
    draft: { artifact_id: 'fictional-draft', versions: realizations.map(v => ({ language: v.language, text: v.wording, sha256: sha256(v.wording), inventory_status: 'complete', claims: [{ claim: r('claim'), spans: [span(v.wording)] }] })) },
    questions: [{ id: 'question:one', distinction_key: 'manifest-recent-use', affected: [r('criterion'), r('claim')], text: 'When did you last reconcile manifests?', rationale: 'Clarify recency.', expected_effect: 'Bound current wording.', missing_distinction: 'Date of last use.', priority: 3, offer_order: 0, disposition: 'skipped', reopen_reason: null }],
    question_batch: { limit: 3, selected_ids: [], deferred_ids: [], suppressed_ids: [r('question')] },
    dispositions: [{ id: 'disposition:one', binding: structuredClone(binding), distinction_key: 'manifest-recent-use', status: 'skipped', answer: null, evidence: [], reopen_reason: null }],
    guidance: [{ id: 'guidance:one', authority_class: 'project_judgment', source: 'Fictional test guidance', url: null, version: '1', accessed_at: '2026-01-03', consulted_passage: 'Preserve historical limits.', scope: 'Fixture terminology', limits: ['No claim of external research.'] }],
    editorial_methods: [{ id: 'editorial_method:one', name: 'Embedded criteria', source: null, version: '1.0', available: true, executed: false, fallback: true, fallback_reason: 'Fixture does not execute editorial methods.' }],
    diagnostics: [{ id: 'diagnostic:one', dimension: 'offer_coverage', scope: { language: null, priority: 'required' }, rubric, rubric_sha256: fingerprint(rubric, sha256), population: [r('criterion')], population_sha256: fingerprint([r('criterion')], sha256), status: 'assessed', check_kind: 'deterministic', value: 100, numerator: 1, denominator: 1, counts: { supported: 1, absent: 0, uncertain: 0, transferable: 0, confirmed_gap: 0, unsupported: 0, unresolved: 0 }, reason: 'Fixture arithmetic; not recalculated by contract validation.' }],
    document_checks: [{ id: 'document_check:one', producer: 'Fictional observer', method: 'No document inspection', artifact_id: 'fictional-artifact', artifact_sha256: sha256('fictional artifact'), observed_at: '2026-01-03T12:00:00Z', check: 'Reading order', result: 'not_assessed', evidence_reference: null, reason: 'No document tool ran.' }],
    findings: [{ id: 'finding:one', category: 'readability', severity: 'informational', check_kind: 'host_judgment', status: 'not_assessed', claims: [r('claim')], criteria: [r('criterion')], document_check: r('document_check'), document_anchor: null, draft_span: { language: 'en', span: span(realizations[0].wording) }, observed_issue: 'Editorial review is pending.', correction: 'Review wording in context.', rationale: 'Mechanical checks do not assess meaning.' }],
    comparison: { status: 'not_comparable', previous_snapshot_sha256: sha256('fictional prior snapshot'), dimensions: [{ dimension: 'offer_coverage', current: r('diagnostic'), previous_value: 50, current_value: 100, delta: null, reasons: ['Changed population.'] }], reasons: ['Fixture comparison only.'] }
  };
}
module.exports = { handoff };
