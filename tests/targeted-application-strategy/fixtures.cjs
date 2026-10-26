'use strict';
// Entirely invented operations/laboratory cases. No private inputs are read.
const cases = {
  operations: { name: 'Tavi Reedwheel', employer: 'Imaginary Kite Dispatch', title: 'Dispatch Coordinator', claim: 'Reconciled parcel manifests and reported routing exceptions.', offer: 'Coordinate parcel dispatch. Accurate manifest reconciliation is required. Training colleagues is preferred.' },
  laboratory: { name: 'Nela Glassfern', employer: 'Fictional Moss Laboratory', title: 'Laboratory Assistant', claim: 'Logged sample temperatures and prepared bench equipment under supervision.', offer: 'Prepare laboratory equipment and maintain sample logs. Independent assay authorization is required.' }
};
function profile(kind, blank) {
  if (!Object.hasOwn(cases, kind)) throw new Error('Unknown fictional case');
  const c = cases[kind], p = structuredClone(blank), source = `source-${kind}`;
  p.candidate.id = `candidate-${kind}`; p.candidate.name = c.name; p.candidate.source_ids = [source];
  p.sources = [{ id: source, type: 'user_answer', origin: 'Wholly fictional test statement', locator: null, received_at: '2026-01-02', as_of: '2025-12', verification: 'user_reported', verification_basis: null }];
  p.employment = [{ id: `employment-${kind}`, employer: c.employer, title: c.title, location: null, start: '2022', end: '2025-12', current: false, as_of: '2025-12', source_ids: [source], claims: [{ id: `claim-${kind}`, statement: c.claim, source_ids: [source] }] }];
  p.evidence = [{ id: `evidence-${kind}`, record_id: `claim-${kind}`, field_pointer: '/statement', status: 'supported', source_ids: [source], rationale: 'Invented statement for deterministic tests, not independent verification.' }];
  return p;
}
function offer(kind) {
  if (!Object.hasOwn(cases, kind)) throw new Error('Unknown fictional case');
  return { kind: 'offer', text: cases[kind].offer };
}
module.exports = { profile, offer };
