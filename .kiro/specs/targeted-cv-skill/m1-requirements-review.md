# M1 cross-spec requirements review

Reviewed 2026-10-25 by the coordinating agent after separate requirements drafts and inline pre-write gates.

## Scope and result
- Portable candidate profile: 7 requirement areas, 41 acceptance criteria.
- WordCraft document session: 7 requirement areas, 37 acceptance criteria.
- Result: requirements-document review passed. Human requirements approval remains pending. No design, implementation or WordCraft acceptance result is implied.

## Boundary checks
- The profile capability owns reusable facts, provenance, validity, readiness and explicitly authorized corrections; it does not author documents or prioritize employer-fit questions.
- The session capability owns document identity, operations, inspection status and recovery; it does not silently update the profile.
- Existing scoped authorization remains valid; neither initial intake nor an already authorized profile change requires repetitive approval.
- Manual document edits are preserved; a separate decision controls promotion of a factual correction into reusable profile data.
- Language, market, offer and document state remain separate from candidate facts. Downstream workflows declare necessary inputs; M1 does not invent a universal completion threshold.
- Both features distinguish unavailable/uncertain evidence from failure or success, and reserve synthetic content for committed verification evidence.

## Repair applied
Clarified the WordCraft capability gate: synthetic verification probes may exercise unverified operations. Demonstrated support gates dependent application work, avoiding a circular requirement that would prevent the first capability test.

## Deferred to design and execution
Profile representation, optionality, date precision, migration and persistence details; actual WordCraft schemas, identity/conflict semantics, setup/licensing and inspection helpers. The current tool inventory exposes no WordCraft tool; this is not evidence that the user's server is stopped. No runtime proof was attempted in requirements generation.
