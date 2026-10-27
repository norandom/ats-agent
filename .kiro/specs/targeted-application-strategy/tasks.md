# Implementation plan

Implement the approved strategy design as portable instructions, contracts and deterministic checks executed by the host. Reference-file work is runtime skill implementation, not a documentation-only task. Each executable item is sized for roughly 1-3 hours and includes focused verification. No item is optional.

The sequence is deliberately serial: adjacent tasks share the contract, fixtures or test harness. No parallel marker claims independence where those resources overlap. File ownership follows the design's File Structure Plan. Existing profile assets remain unchanged; document editing, final skill packaging and legacy retirement stay outside this plan.

- [x] 1. Establish strategy verification foundations
  - Check host Node and uvx availability and the existing pinned schema validator without introducing another model service or package runtime.
  - Create the strategy test harness and unrelated fictional profile/offer factories; extract executable blocks from the shipped references rather than copying their logic into tests.
  - Route generated artifacts to ignored test workspaces and establish relocation support and private-data checks.
  - Demonstrate a smoke test that loads a fictional upstream profile with the real validator and distinguishes executed checks from test adapters.
  - _Boundary: Verification_
  - _Requirements: 1.1, 8.4, 8.5_

- [x] 2. Establish private strategy contracts and trusted context
- [x] 2.1 Define the versioned handoff and reference integrity rules
  - Implement the closed strategy contract, local schema definitions, typed ID namespaces, null rules, exact text spans and stable serialization for fingerprints.
  - Define all planned evidence, claim, question, guidance, diagnostic, method and document-observation records without adding fields to canonical candidate facts.
  - Supply deterministic checks for invalid references, malformed bindings, duplicate IDs, out-of-range spans and invalid handoff states.
  - Demonstrate valid fictional handoffs passing schema/integrity checks and malformed variants failing with localized corrective findings.
  - _Boundary: StrategyContext_
  - _Depends: 1_
  - _Requirements: 1.3, 3.2, 6.1, 7.1, 7.2, 8.4_

- [x] 2.2 Bind strategy to validated canonical evidence and an explicit target
  - Implement selection/generation binding with canonical-byte verification and validation of the exact parsed profile; reject pending proposals and forged validation. Accept current 2.0, route recognized legacy formats to the upstream compatibility workflow, and block unknown versions without implementing migration here.
  - Separate offer or declared-role target from language, market and requested-document settings; calculate their fingerprints without accepting source-provided hashes as authority.
  - Implement repair-only behavior for failed/unassessed validation and bounded positioning for incomplete task readiness, retaining observation limits.
  - Demonstrate missing selection/target, same-path reselection, proposal substitution and stale snapshots returning the specified input or blocked result without confirmed support or scores; recognized legacy input requests upstream conversion while unknown versions remain blocked.
  - _Boundary: StrategyContext_
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 1.8, 7.4, 8.3_

- [x] 3. Implement employer analysis and evidence questions
- [x] 3.1 Interpret offer criteria and priorities with source references
  - Implement the host analysis protocol for atomic responsibilities, outcomes, qualifications and context with exact source spans.
  - Preserve required/preferred/unspecified priority, retain contradictions and keep inferred needs in a separate labelled collection.
  - Deduplicate repetition while preserving distinct conditions and freeze the criterion population before scoring.
  - Demonstrate fictional explicit, ambiguous and contradictory offers yielding traceable criteria, labelled inferences and focused clarification without invented employer culture.
  - _Boundary: EvidencePlanner_
  - _Depends: 2.2_
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.2, 8.3_

- [x] 3.2 Map evidence and terminology without inflating capability
  - Implement five-state evidence mapping with original upstream states, field references, partial-satisfaction reasoning and material freshness limits.
  - Keep profile-relative and record-relative pointers distinct; retain task-material input requests and supporting source namespaces.
  - Implement semantic checks for authority, organizational scope, credential status, related terms versus equivalence and optional occupational lookup limits.
  - Demonstrate exact matches, transferability, gaps, conflicting sources, historical tools and inaccurate synonyms receiving distinct supported or bounded interpretations and corrective alternatives.
  - _Boundary: EvidencePlanner_
  - _Requirements: 1.5, 1.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 8.1, 8.2_

- [x] 3.3 Prioritize finite question batches and preserve dispositions
  - Implement semantic distinction keys, priority tiers and stable ties, selected/deferred/suppressed sets, and the declared default and allowed question limits.
  - Preserve answered, skipped, not-applicable, confirmed-gap and pending states without treating nonanswers as inability.
  - Suppress rephrased duplicates and require a material reason for reopening; retain potential reusable answers as pending upstream updates.
  - Demonstrate batches never exceeding their limit, all deferred questions retained, declined questions suppressed, and precise requests for missing authority, dates or status.
  - _Boundary: EvidencePlanner_
  - _Requirements: 1.6, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4. Implement contribution composition and editorial review
- [x] 4.1 Compose supported contribution arguments in both languages
  - Implement audience/decision/thesis selection, inclusion/exclusion rationale and capability-oriented expertise structure.
  - Inventory factual propositions and preserve genuine historical titles, temporal context and responsibility while drafting stronger employer-relevant wording.
  - Review German and English realizations separately against the same canonical proposition and snapshot; exclude unsupported or unresolved realizations from selected claims.
  - Demonstrate a truthful weak inventory improved with supported context, an appealing unsupported claim rejected, and translation drift localized to the affected language.
  - _Boundary: PositioningEditor_
  - _Depends: 3.2, 3.3_
  - _Requirements: 3.2, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4.2 Integrate optional writing skills and the embedded fallback
  - Implement discovery and execution reporting for COBESY and Humanizer using the user-selected repository links and actual available versions.
  - Offer assisted installation, manual instructions or fallback once when missing; delegate any authorized installation to the host without implementing an installer or requiring the collection.
  - Distinguish installed, available and executed; preserve existing installs and user constraints, including no em/en dashes in submitted prose.
  - Demonstrate available, missing, declined and installed-but-unavailable paths with simulated host capabilities, accurate method records and usable fallback prose; perform no real installation in tests.
  - _Boundary: PositioningEditor_
  - _Requirements: 4.5, 4.6, 8.1, 8.2, 8.3, 8.5_

- [x] 5. Implement transparent diagnostics and revision comparison
- [x] 5.1 Calculate coverage and semantic claim support
  - Implement the versioned rubric with equal weights, explicit populations, separate required/preferred/unspecified coverage and per-language claim support.
  - Require full factual-proposition inventory and semantic-review evidence before whole-draft support scoring; retain unknown states and zero-denominator reasons.
  - Prevent keyword repetition, omitted photos/award dates and unrelated attributes from changing scores; keep explicit application-completeness requests separate.
  - Demonstrate the design's worked examples, partial inventories, role-only targets and unavailable inputs producing exact arithmetic or not_assessed results with explanatory counts.
  - _Boundary: StrategyReview_
  - _Depends: 3.3, 4.2_
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [x] 5.2 Review appeal, readability and supplied document observations
  - Implement the distinct ordinal editorial anchors with localized reasons and evidence references, without combining them into an overall score.
  - Validate external document observations against producer/method/artifact/time/evidence fields; unavailable or stale observations remain not assessed.
  - Deliver categorized/severity-rated findings, affected claims/criteria and available locations, concrete corrections and their rationale without applying document edits.
  - Demonstrate that strong prose cannot compensate for an unsupported claim and that text review never claims unexecuted rendering, extraction or ATS validation.
  - _Boundary: StrategyReview_
  - _Requirements: 4.2, 4.5, 6.3, 6.4, 6.7, 6.8, 7.2, 8.1, 8.2_

- [x] 5.3 Compare revisions only under explicit comparable conditions
  - Implement dimension-specific fingerprints and checks for target, criterion population, rubric, language, market, method and proposition population.
  - Support labelled evidence-update comparisons through trusted continuity and identify changed evidence; otherwise provide non-comparability reasons and side-by-side results without a delta.
  - Reject arbitrary reselection and matching structural candidate IDs as identity evidence; retain artifact-specific comparison scope for document observations.
  - Demonstrate wording-only comparisons, changed claim populations, changed rubrics, language/method changes and untrusted identity changes receiving the specified comparison outcomes.
  - _Boundary: StrategyReview_
  - _Requirements: 6.1, 6.3, 7.1, 7.3, 7.4_

- [x] 6. Integrate and validate the portable strategy capability
- [x] 6.1 Integrate canonical updates, continuity and private handoff
  - Connect context, planning, composition and review with the unchanged upstream profile workflow and authorized private output locations.
  - Demonstrate a proposed answer staying pending until confirmed persistence and fresh selection; use a host-observed continuity record to restore eligible dispositions and comparisons only across that verified chain.
  - Assemble and validate bounded, needs-revision and ready-for-document-draft handoffs, withholding unsupported selected claims while retaining useful private questions and diagnostics.
  - Demonstrate complete fictional offer and role-only flows using real upstream schema/semantic validation; confirm failed or arbitrary reselection clears candidate reasoning.
  - _Boundary: Integration: StrategyContext, EvidencePlanner, PositioningEditor, StrategyReview_
  - _Depends: 2.2, 3.3, 4.2, 5.3_
  - _Requirements: 1.1, 1.4, 1.5, 1.6, 1.7, 1.8, 5.3, 5.4, 7.1, 7.3, 7.4, 8.4_

- [x] 6.2 Validate semantic usefulness, bilingual consistency and adverse cases
  - Run fresh host reasoning over fictional cases for weak inventories, unsupported appeal, authority inflation, old tools, credential uncertainty and conflicting offer priorities.
  - Independently review meaning preservation, employer appeal and useful questions; record observed outputs rather than treating prerecorded expected labels as comprehension evidence.
  - Exercise source instructions, taxonomy unavailability, omitted award dates/photos, skipped answers and language-specific drift alongside the deterministic regressions.
  - Demonstrate localized failures and supported revisions, with host judgments distinguished from executed checks and no real candidate content in shareable evidence.
  - _Boundary: Verification_
  - _Depends: 6.1_
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5, 6.5, 6.6, 8.1, 8.2, 8.3_

- [x] 6.3 Validate relocation, isolation and final strategy handoff
  - Execute the integrated checks against relocated skill/profile assets without the developer checkout, sibling collection, legacy scorer or additional model credentials.
  - Exercise unrelated candidate swaps, same-path replacement, missing continuity records, stale saved reports, unavailable document evidence and changed diagnostics populations.
  - Inspect helper dependencies and shareable assets for model-service calls and private content; verify test evidence binds the exact runtime assets reviewed.
  - Demonstrate a clean final handoff and all acceptance coverage with executable assertions separated from editorial review. Record unresolved checks honestly; do not claim WordCraft authoring, package release or legacy retirement.
  - _Boundary: Verification_
  - _Requirements: 1.2, 1.8, 6.1, 6.2, 6.3, 6.4, 6.7, 6.8, 7.1, 7.2, 7.3, 7.4, 8.3, 8.4, 8.5_

## Implementation Notes

- Coordinator failures must use the complete StrategyFinding result union; validate failure envelopes against the closed schema as well as successful handoffs.

## Application-context correction

The approved [design amendment](application-context-design.md) extends the completed 1.0 work above. Tasks 7 through 11 are sequential because they share the contract, reference blocks and fixtures. Existing pnpm, uvx validation and upstream adapters from task 1 are reused; no new service or dependency setup is required. Each task includes its focused checks and task-local review. Original completion records remain historical evidence, not acceptance of the correction.

- [x] 7. Extend the versioned source contract and shared support eligibility
  - Preserve the original strategy schema for historical validation and introduce the approved 1.1 context, binding, subject and contextual-reference shapes. Reject unknown versions and require fresh reconstruction rather than upgrading ready states by inserting defaults.
  - Keep career evidence unchanged and exclusive to qualification mappings. Resolve offer spans and application-value pointers against independently supplied sources, with one shared eligibility rule for subsequent consumers.
  - Preserve unsupported claims with empty arrays and distinguish well-formed pending confirmation from malformed, forged, stale or wrong-application evidence. Support confirmed empty enclosures and the existing deterministic hash convention.
  - Reuse the real schema validator and shipped-reference test loader. Update fictional contract fixtures and test source classification, closed shapes, exact spans, context bindings, null context and archived validation without weakening career checks.
  - Completion is passing focused real-schema and reference-integrity checks, with original 1.0 historical fixtures still valid against their archive and rejected by the current consumer.
  - _Boundary: StrategyContext_
  - _Requirements: 1.1, 1.3, 1.5, 1.6, 1.8, 3.1, 3.2, 7.1, 7.4, 8.3, 8.4, 8.5_

- [x] 8. Bind independently selected application inputs throughout the host session
  - Connect private application context and confirmation observations to current profile and target selection. Recheck current selections after asynchronous operations and before assembly; never let an imported draft establish its own confirmation.
  - Keep application records outside career facts. Reusable factual answers still require the existing confirmed profile-update path. Resume requires independent context selection and confirmation, while a canonical-only CV can proceed without letter context.
  - Invalidate affected claims and observations after context, target or confirmation changes. Retain independently established prior source observations for later comparisons; saved handoff bindings alone cannot establish historical trust.
  - Connect assembly to shared eligibility and retain pending contextual claims without authorizing their selected draft output. Exercise selection changes during validation, forged confirmation, wrong-application reuse, role-only targets and null context.
  - Completion is passing host-flow integration checks through real upstream profile validation, demonstrating no canonical writes and no ready handoff from stale selections.
  - _Boundary: StrategyContext_
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8, 7.1, 7.4, 8.3, 8.4_

- [x] 9. Integrate contextual claims with editorial review and comparable diagnostics
  - Route missing or pending application context to a focused application-specific input request through evidence planning. Verify that the request names the missing distinction, respects existing question limits/dispositions, and does not become a career-profile update or qualification gap.
  - Apply reviewed candidate, offer, application and mixed subject distinctions. Split independent propositions and retain every needed source for wording that relates candidate experience to employer needs.
  - Connect editorial review, support calculation and integrity recomputation to the same eligibility result. Preserve the complete factual inventory, existing formulas, weights and career-only offer-coverage mappings.
  - Review English and German realizations independently. Demonstrate a candidate qualification disguised as application intent being rejected by semantic review; distinguish executed structural checks from host judgment. Pending letter evidence must not invalidate independently supported CV content.
  - Compare support and editorial results only with independently trusted prior context and matching application identity/context, subject and reference populations. Explain non-comparability after changes; retain eligible career-only coverage comparison under its existing conditions.
  - Completion is consistent assembly/editorial/diagnostic outcomes for contextual-only and mixed claims, unchanged arithmetic regressions, and reviewed bilingual negative cases for misclassification and inflated relationships.
  - _Boundary: Integration: EvidencePlanner, PositioningEditor, StrategyReview_
  - _Depends: 7, 8_
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.4, 5.1, 6.1, 6.2, 6.3, 6.4, 6.8, 7.1, 7.2, 7.3, 7.4_

- [ ] 10. Integrate confirmed context into the document consumer
  - Introduce document manifest 1.1 and archive 1.0 with its historical strategy-binding reference pinned. Reject unknown/current-incompatible versions and rebuild current manifests from reviewed strategy inputs without inheriting old delivery status.
  - Link recipient, date, salutation and enclosure metadata to ordered upstream confirmed context references. Verify exact values and declared language formatting, including confirmed no enclosures. Caller-supplied confirmation flags or arbitrary provenance strings are insufficient.
  - Keep missing references and pending confirmation local to the affected letter. Preserve supported CV output, existing document identity/manual-edit handling and the unchanged WordCraft session interface.
  - Reject context changes through the check-only refresh path; compose and review changed content through the corrected upstream strategy instead. Update actual acceptance fixtures to consume the new contract without inventing canonical facts or a second support evaluator.
  - Completion is passing document-consumer integration checks against real 1.1 strategy data, stable historical manifest validation, and rejection of metadata mismatch, stale refresh and forged confirmation. Full WordCraft acceptance remains M3 tasks 7.1 and 7.2.
  - _Boundary: Document consumer integration_
  - _Depends: 7, 8, 9_
  - _Requirements: 1.3, 1.5, 3.2, 4.4, 6.3, 6.4, 7.1, 7.3, 7.4, 8.4_

- [ ] 11. Validate the corrected strategy and release the M3 acceptance dependency
  - Run fresh canonical, context, editorial, comparison and consumer regression checks against the exact current shipped assets; retain actual source and asset bindings in the private evidence.
  - Run the corrected assets and schema archives outside the checkout with explicit allowlists, using existing tooling without sibling repositories, candidate data, model credentials or new endpoints. Recheck all 48 criteria against original coverage plus the correction, rather than repeating unrelated implementation.
  - Complete semantic review of the bilingual contextual and mixed-source cases, and separately verify deterministic rejection cases. Run repository/index privacy checks and inspect the shareable changes manually.
  - Completion is a reviewed strategy validation report that states the current contract version, tests, evidence limits and GO or unresolved findings. Preserve the prior 1.0 GO as historical; do not claim complete WordCraft application acceptance from strategy tests.
  - On GO, resume existing application-document tasks 7.1 and 7.2 for actual bilingual CV/letter authoring, read-back, save/reopen, all-page review, manual-edit preservation, relocation and final feature validation. Those tasks retain ownership of M3 completion.
  - _Boundary: Verification_
  - _Depends: 7, 8, 9, 10_
  - _Requirements: 1.1, 1.8, 3.2, 4.4, 6.1, 6.3, 6.4, 6.8, 7.1, 7.3, 7.4, 8.3, 8.4, 8.5_
