'use strict';
// Wholly fictional fixtures, never derived from candidate inputs.
module.exports = function populated(blank) {
  const p = structuredClone(blank);
  const claim = id => ({ id, statement: 'Maintained a fictional archive.', source_ids: ['source-demo'] });
  p.sources = [{ id: 'source-demo', type: 'user_answer', origin: 'Synthetic exercise', locator: null, received_at: '2026-01-01', as_of: '2025', verification: 'user_reported', verification_basis: null }];
  p.candidate.name = 'Fictional Example'; p.candidate.source_ids = ['source-demo'];
  p.candidate.links = [{ label: 'Example', url: 'https://example.invalid' }];
  p.profile = [claim('profile-demo')];
  p.employment = [{ id: 'employment-demo', employer: 'Imaginary Archive', title: 'Archivist', location: null, start: '2020', end: null, current: null, as_of: '2025-01', source_ids: ['source-demo'], claims: [claim('work-demo')] }];
  p.education = [{ id: 'education-demo', qualification: null, institution: null, start: null, end: null, completion_status: null, source_ids: [] }];
  p.professional_development = [{ id: 'development-demo', name: null, organization: null, since: null, valid_until: null, source_ids: [] }];
  p.skill_groups = [{ id: 'group-demo', label: null, claims: [claim('skill-demo')] }];
  p.projects = [{ ...claim('project-demo'), start: '2024-01-01', end: null, employer_id: 'employment-demo' }];
  p.volunteering = [{ ...claim('volunteer-demo'), since: null }];
  p.languages = [{ id: 'language-demo', language: null, proficiency: null, cefr: null, source_ids: [] }];
  p.evidence = ['supported', 'uncertain', 'absent', 'transferable', 'confirmed_gap'].map((status, i) => ({ id: `evidence-${i}`, record_id: 'profile-demo', field_pointer: '/statement', status, source_ids: ['source-demo'], rationale: null }));
  p.conflicts = [{ id: 'conflict-demo', record_id: 'education-demo', field_pointer: '/qualification', alternatives: [{ value: 'Unknown award A', source_ids: ['source-demo'] }, { value: 'Unknown award B', source_ids: ['source-demo'] }], status: 'open', resolution_source_ids: [], selected_alternative: null }];
  p.review_questions = ['open', 'answered', 'skipped', 'not_applicable', 'confirmed_gap'].map((disposition, i) => ({ id: `question-${i}`, related_ids: ['profile-demo'], question: 'Confirm fictional evidence?', disposition, answer_source_ids: ['source-demo'], answer: null }));
  p.migration_origin = { from_version: '1.0', source_sha256: 'a'.repeat(64), original_profile: { arbitrary: [null, true, 3, 'legacy', { retained: 'opaque' }] } };
  p.change_history = [{ id: 'history-demo', proposal_id: 'proposal-demo', base_sha256: null, authorization: { id: 'authorization-demo', scope: 'initial_intake', request_reference: 'Synthetic approval', approved_at: '2026-01-01T12:00:00Z', proposal_id: 'proposal-demo', resolved_path: 'synthetic-profile.json' }, accepted_at: '2026-01-01T12:00:00Z', source_ids: ['source-demo'], changes: [{ pointer: '/candidate/name', before: null, after: 'Fictional Example', reason: 'Synthetic intake' }] }];
  return p;
};
