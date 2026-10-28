# Implementation Plan

Implement the approved M4 design as a session-based skill. Markdown runtime instructions and embedded deterministic helpers are implementation assets in this project. Update adopter guidance alongside the entry flow; do not create a separate documentation phase or replacement application.

Tasks run sequentially. Shared profile/strategy contracts, reference helpers and live desktop resources prevent safe parallel implementation here. Independent review still follows each executable task. Each unit below has a bounded deliverable sized for the project's normal 1-3 hour task guideline; this is a planning bound, not an elapsed-time promise. No test or live acceptance item is optional.

- [x] 1. Establish the refinement validation and live-session foundation
  - Reuse the existing pnpm, uvx schema validation and desktop WordCraft tooling; check declared capabilities without changing the applicant's open documents.
  - Create wholly fictional refinement scenarios, isolated private run destinations and the initial runtime/test asset inventory. Include two different applicants and separate German/English document members.
  - Provide the fixture/schema test entry and receipt collector skeleton with explicit missing-live-evidence failure. Keep actual observations separate from simulated outcomes.
  - Done when the fixture checks run from the declared toolchain, private output locations are verified, and a read-only desktop capability observation identifies the selected connection and its limitations.
  - _Boundary: RefinementRecord validation foundation_
  - _Requirements: 1.1, 4.1, 4.9, 7.8, 7.9_

- [x] 2. Preserve the chosen scope of career facts
- [x] 2.1 Add marked application-profile validation
  - Add the application-only profile version and its immutable application, target and origin marker while preserving reusable-profile and legacy-migration behavior.
  - Extend exact version dispatch, active-record validation and scoped selection. Preserve IDs, sources, history, unknowns and the existing career-reference shape.
  - Reject wrong applications, changed targets, unsupported versions and attempts to use scope/history metadata as career evidence. Verify unchanged field parity with the reusable contract.
  - Done when the same copied application profile remains scoped under fresh intake, while existing reusable and migration fixtures retain their original behavior.
  - _Boundary: ScopedProfile_
  - _Depends: 1_
  - _Requirements: 1.6, 3.1, 3.5, 3.9, 3.11, 3.12, 7.3, 7.9_

- [x] 2.2 Create and update an application profile with verified authority
  - Add exact proposal and scope decisions for first creation and later application-profile updates, distinct from reusable-profile authority.
  - Establish exclusive private creation, existing-destination refusal, exact read-back and full validation; preserve source bytes and verify the reusable source remains unchanged.
  - Reuse baseline, backup, security-preserving replacement and uncertain-write reconciliation for later updates. A pending scope choice supplies no support or write permission.
  - Done when fictional first creation and update cases persist verified scoped facts, and partial creation, changed baselines, missing guarantees and imported approvals return bounded unresolved outcomes without retrying mutations.
  - _Boundary: ScopedProfile_
  - _Requirements: 3.4, 3.5, 3.6, 3.7, 3.8, 3.13, 7.1, 7.4, 7.9_

- [x] 2.3 Promote only selected facts to the reusable profile
  - Apply reusable choices against the freshly selected reusable base, then reconcile confirmed changes into the application profile without losing application-only additions.
  - Process mixed fact groups in the designed order; preserve correction provenance and additive chronology. Do not replace the reusable base with the complete application profile.
  - Surface collisions, conflicting edits and partial success separately for each destination. Reuse exact unchanged authorization, and request a revised decision only when scope or proposed changes differ.
  - Done when mixed-scope fixtures prove that only selected facts reach the reusable base, pending facts remain unused and a failed second write can be reconciled without repeating the successful first write.
  - _Boundary: ScopedProfile_
  - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7, 3.9, 3.11, 3.12, 3.13, 7.4_

- [x] 3. Bind strategy to the selected application evidence
- [x] 3.1 Integrate scoped profiles into current strategy bindings
  - Preserve historical strategy validation and introduce the current binding with an application identity even for role-only CV work.
  - Accept validated reusable or application-scoped career sources, enforce scope during binding and subsequent current-state checks, and keep application metadata on its separate source route.
  - Route career answers to the selected profile scope and rebuild claims after confirmed persistence. A new source binding invalidates old wording/support rather than inheriting ready flags.
  - Done when integrated fixtures accept supported facts only for the selected application, reject wrong scope after asynchronous source changes, and leave role-only offer coverage unassessed.
  - _Boundary: StrategyIntegration_
  - _Depends: 2.1, 2.2, 2.3_
  - _Requirements: 1.1, 1.2, 1.4, 1.6, 3.1, 3.2, 3.5, 3.8, 3.13, 6.5, 7.3, 7.9_

- [x] 3.2 Preserve question dispositions and honest diagnostic comparisons
  - Reassess prior dispositions by semantic distinction after forks, updates and resume; retain valid skipped/gap states and suppress paraphrased repeats.
  - Promote pending answers only after confirmed selected-source persistence and meaning review. Reopen questions only for the existing material-conflict, freshness or changed-requirement reasons.
  - Treat the first fork as a non-comparable baseline; extend directly observed same-profile update continuity without changing rubrics or relaxing population checks.
  - Done when comparison fixtures show valid deltas only for compatible rows, explain unchanged/lower results and null deltas, and never turn missing or skipped evidence into inability.
  - _Boundary: StrategyIntegration_
  - _Requirements: 1.2, 1.3, 2.1, 2.2, 2.5, 2.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.2, 7.6_

- [x] 4. Retain private refinement progress
- [x] 4.1 Define and validate the refinement record
  - Implement the closed record for selected sources, statements, scope decisions, question dispositions, owner artifact references, revision members and stop state.
  - Add the embedded deterministic integrity helper using independently observed owner artifacts and a trusted previous checkpoint.
  - Validate the design's permitted transitions and evidence guards, including verified-state invalidation and uncertainty reconciliation. Reject executable instructions, unknown fields and fabricated owner outcomes.
  - Done when record tests accept valid partial progress and reject illegal transitions, cross-application references, unobserved verification and uncertainty bypasses.
  - _Boundary: RefinementRecord_
  - _Depends: 3.1, 3.2_
  - _Requirements: 3.1, 3.2, 3.4, 3.7, 3.13, 5.4, 7.1, 7.3, 7.8, 7.9_

- [x] 4.2 Checkpoint, resume and stop without restoring stale authority
  - Implement verified private checkpoints and expected-baseline checks; distinguish historical loaded state from current observations.
  - Route profile and document operations to their owner recovery protocols. Missing checkpoint guarantees block new dependent mutations and leave persisted resume unconfirmed.
  - Reestablish current source selections and context confirmations on resume; enforce explicit user continuation from stopped states and permit read-only reconciliation of in-flight work.
  - Done when interrupted and stale-session fixtures preserve confirmed progress, refuse forged approvals, stop new dispatches and identify the last confirmed deliverables and unresolved operations.
  - _Boundary: RefinementRecord_
  - _Requirements: 1.4, 3.7, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_

- [x] 5. Refine current WordCraft documents safely
- [x] 5.1 Integrate current strategy with document revisions
  - Preserve historical document validators and introduce the current manifest binding, including a separately retained predecessor revision.
  - Recompose after fact, scope, context or wording changes; keep check-only refresh limited to new check observations.
  - Preserve selected live document identities and destinations through fresh inspection. Rebuild factual inventories and code-point mappings for preserved manual content; unresolved manual claims block verified delivery.
  - Track each requested document/language independently, including pending metadata, factual inconsistencies and limited-scope changes.
  - Done when consumer tests reject stale support and copied checks, while current supported members retain their live identity and unsupported members remain explicitly pending.
  - _Boundary: LiveRevision, StrategyIntegration integration_
  - _Depends: 3.1, 3.2, 4.1, 4.2_
  - _Requirements: 1.4, 1.5, 3.10, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 5.4_

- [x] 5.2 Prove one application-only revision in visible WordCraft
  - Use the existing session protocol for focus, safe switching, current inspection, persisted intent, targeted edits and read-back; do not add a second operation coordinator.
  - Through the host session, add one sourced fictional application-only fact and revise an existing CV in place, preserving an unrelated manual text and formatting change.
  - Demonstrate overlap withholding and resolution on that document. Save, reopen and inspect the affected content, reading order, all rendered pages and automatic page fields.
  - Done when a separately saved editable CV and actual MCP receipts show the new supported wording, unchanged reusable facts and preserved manual work. Label simulated capability failures separately.
  - _Boundary: LiveRevision, ScopedProfile, StrategyIntegration integration_
  - _Depends: 2.2, 4.2, 5.1_
  - _Requirements: 3.5, 3.10, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.5, 5.6_

- [ ] 6. Connect the conversational refinement flow
- [ ] 6.1 Route questions, answers and user choices through the skill
  - Extend the entry flow to orient from current sources and reports, select finite useful question batches and accept free-text answers or unsolicited corrections.
  - Classify independently meaningful statements, seek only material clarifications, and let the applicant choose the scope for exact facts or identified groups. Accept qualitative results and distinguish later capabilities from earlier work.
  - Connect profile/context/editorial handoffs to supported composition, the private record and live revision. Continue unaffected documents while a fact or letter input is pending.
  - Keep user-facing workflow guidance aligned with the implemented session behavior and existing COBESY/Humanizer defaults.
  - Done when a fictional host-session run follows the installed skill entry through question, answer, selected persistence and a visible supported document revision without a separate workflow service.
  - _Boundary: RefinementFlow integration_
  - _Depends: 2.3, 3.2, 4.2, 5.2_
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4, 3.7, 3.8, 3.9, 3.11, 3.12, 3.13, 4.6_

- [ ] 6.2 Explain member outcomes and terminate the loop correctly
  - Present revision-specific diagnostic results with their methods, limits and reasons, distinguishing new evidence from editorial changes and avoiding guaranteed score gains.
  - Report partial profile writes, pending members, language inconsistencies and unassessed checks without presenting the whole application as verified.
  - End questioning and mutation initiation on acceptance, decline, stop or exhausted supported improvements; report last confirmed files, reusable-profile changes and remaining issues.
  - Done when integration cases show actionable partial results and accurate comparisons, then stop with no further questions or writes while retaining unresolved operations for owner reconciliation.
  - _Boundary: RefinementFlow integration_
  - _Depends: 3.2, 4.2, 5.1_
  - _Requirements: 4.7, 4.8, 5.1, 5.2, 5.3, 5.4, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.4, 7.5, 7.6, 7.7_

- [ ] 7. Validate the complete refinement experience
- [ ] 7.1 Verify bilingual revisions and mixed fact choices live
  - Exercise the complete skill flow with wholly fictional German/English CV and Germany-market letter members, retaining separate output files.
  - Demonstrate application-only and reusable choices, selective promotion, chronology-preserving additions, manual preservation and current supported wording across requested members.
  - Include a deliberately pending member, report it honestly, then resolve and verify it; inspect all final pages, reading order, automatic pagination and applicable letter conventions.
  - Done when independently reviewed, current-hash-bound receipts and separate editable DOCX files prove the complete live flow rather than fixture replay.
  - _Boundary: RefinementFlow end-to-end acceptance_
  - _Depends: 6.1, 6.2_
  - _Requirements: 1.1, 1.3, 1.5, 2.2, 2.3, 2.4, 2.7, 3.4, 3.5, 3.6, 3.8, 3.9, 3.10, 3.11, 3.12, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.8, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.3, 6.5, 6.6_

- [ ] 7.2 Verify interruption, isolation and stopping
  - Interrupt the actual connection after a dispatched edit at a controlled boundary, reconnect and reconcile through observed state without duplicate writing.
  - Exercise stale sources, another applicant/application, imported approvals, missing capabilities, skipped questions and explicit stop. Keep deterministic absent/ambiguous-effect controls distinct from actual observations.
  - Verify new writes remain blocked for unresolved operations and stopped sessions until the required reconciliation and explicit continuation occur.
  - Done when the retained host trace and owner receipts show safe recovery, no cross-application fact reuse, no replay and no new mutations or question batches after stop.
  - _Boundary: RefinementFlow end-to-end acceptance_
  - _Requirements: 1.4, 2.5, 2.6, 3.7, 3.13, 4.7, 4.9, 6.2, 6.4, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.9_

- [ ] 7.3 Validate relocation, privacy and full coverage
  - Finish the receipt checker and full-acceptance runner, rejecting absent, altered or stale live evidence and any unsupported completion assertion.
  - Run affected profile, strategy and document regression suites with historical validators pinned; validate current scenarios against current contracts and update their declared inventories.
  - Run the declared M4 assets outside the checkout, check all 56 criteria against actual evidence, and perform repository/index privacy checks plus human review of shareable artifacts.
  - Done when the relocated checks and required live acceptance pass, the final report states remaining limits, and no real candidate content or machine-specific dependency enters the reusable skill. Release publishing and legacy removal remain outside this milestone.
  - _Boundary: RefinementFlow final validation_
  - _Depends: 7.1, 7.2_
  - _Requirements: 1.2, 1.6, 3.5, 6.1, 6.2, 6.5, 7.2, 7.3, 7.8, 7.9_

## Implementation Notes

- Windows validation adapters use pwsh and pnpm.exe; inherited Windows PowerShell 5.1 module paths can break Get-Acl, and a pnpm wrapper can hide an assertion exit code.
