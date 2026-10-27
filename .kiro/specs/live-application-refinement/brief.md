# Brief: live-application-refinement

## Problem
A first draft may miss qualifications or persuasive evidence, while careless iteration can overwrite manual edits or mix document changes with reusable facts.

## Current State
This is a new milestone boundary split from the initialized targeted-cv-skill umbrella. Shared research and user decisions remain in that directory. A candidate schema and blank template already exist as preliminary inputs; the legacy Python scorer is still present. No milestone implementation or phase approval is implied.

## Desired Outcome
The user watches and improves CVs and cover letters in the visible WordCraft desktop session through focused questions, controlled edits and understandable score changes. Refinement continues on the same identified live documents.

## Approach
Deliver M4 scope as a reusable skill capability, governed by project steering. Use the existing evidence/source register and user-confirmed decisions. Specify observable contracts before implementation; preserve judgment in persuasive writing and explicit invariants in data handling.

## Scope
### In
- Orchestrate prioritized question batches using the strategy rubric and question contract.
- Turn answers into application revisions and optional, explicitly authorized canonical profile updates via the profile contract.
- Inspect current live documents before edits; preserve manual changes using the session contract and document anchors.
- Bring WordCraft forward at authoring start and identify the active document on switches. Respect user focus changes rather than repeatedly raising the window during every edit.
- Recompute diagnostics against the same rubric and explain changes; separate new evidence from editorial improvements.
- Maintain private resumable application state, document IDs, answered/skipped questions and revision history.
- Stop on user acceptance, declined further work or no useful supported improvement; handle interruption/reconnection honestly.

### Out
- Redefining data schema, rubric formulas, WordCraft operations or layout rules.
- Publication, marketplace registration and automatic job applications.

## Boundary Candidates
- Orchestrate prioritized question batches using the strategy rubric and question contract.
- Turn answers into application revisions and optional, explicitly authorized canonical profile updates via the profile contract.
- Inspect current live documents before edits; preserve manual changes using the session contract and document anchors.

## Out of Boundary
Do not redefine upstream-owned contracts. Any new dependency or ownership change must update the roadmap before downstream implementation.

## Upstream / Downstream
- **Upstream**: portable-candidate-profile, wordcraft-document-session, targeted-application-strategy, wordcraft-application-documents. These are direct contract consumers, not merely transitive scheduling dependencies.
- **Downstream**: portable-skill-release.

## Existing Spec Touchpoints
- **Extends**: no active feature spec; this replaces part of the targeted-cv-skill umbrella's intended scope.
- **Adjacent**: see roadmap ownership and dependencies. The umbrella is historical/shared context, not a second implementation owner.

## Milestone Acceptance Evidence
- An initially undocumented qualification can be added from a sourced user answer and improve the live document and explained score.
- Confirmed gaps and skipped questions are respected; no coercive repeat questioning or invented answers.
- User edits between turns survive subsequent agent updates; stale or uncertain state is resolved before further writes.
- Related CV and cover-letter claims remain consistent after an answer or correction; deliberate differences in emphasis do not change facts.
- Profile persistence is explicitly chosen, with document-only edits kept separate.
- An interrupted session resumes the correct candidate/application/documents without cross-candidate leakage.

## Open Design Investigations
- Choose minimal private session-state representation and conflict resolution UX.
- Define a clear distinction between approved factual changes and ordinary stylistic edits.

## Constraints
No personal data in committed instructions or distributable assets. German/English target output; WordCraft MCP authors final DOCX; blue/no photos; DIN 5008 letters for Germany in either language. No maintained Python application. Keep professional source support distinct from editorial judgment and user preferences. Candidate examples are synthetic and unrelated to private profiles.

## Kiro Status
Discovery brief only. Next: initialize, generate requirements, review requirements, design, review design, tasks, review tasks, implementation and validation. No automatic approval or implementation readiness.
