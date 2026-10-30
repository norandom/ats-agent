# Implementation Plan

Ordinary-user versioning requirements, design and new group 6 tasks are approved by the user on 2026-10-30. Earlier checked tasks retain their historical scope. Run this group before refinement's new versioning tasks; package rights/closure are finalized in refinement task 10.1, so do not bypass interim release-definition failures.

Profile design approved on 2026-10-25. Tasks approved by the user on 2026-10-25; implementation started. Each executable task is sized for approximately 1–3 hours. Reference protocols are the skill implementation, not a new application. Tests use synthetic data only; private candidate migration, WordCraft integration, final SKILL.md wiring and legacy retirement remain outside this plan.

- [x] 1. Establish the profile implementation and verification environment
  - Establish skill-relative asset locations and isolated synthetic test workspace using the approved layout.
  - Verify uv/uvx and pinned check-jsonschema 0.38.2 with a minimal task-owned probe schema, local schema resolution, host computation, hashing, staging and replacement capabilities; specify unavailable-check and unavailable-write outcomes.
  - Establish scenario execution and evidence capture without a maintained Python helper or personal data in logs.
  - Done when a synthetic local-schema check executes and host capability results identify which verification and write operations are available. Unavailable checks and deferred writes are not passed execution evidence.
  - _Boundary: Verification_
  - _Requirements: 4.1, 6.6, 7.4, 7.5_

- [x] 2. Establish versioned facts and evidence semantics
- [x] 2.1 Create the current schema and preserve the legacy validator
  - Move the existing legacy schema unchanged; create closed current-version definitions and the null-valued blank scaffold with all designed collections.
  - Represent stable identifiers, nullable facts, source metadata, evidence, conflicts, review dispositions, migration snapshots and authorized change history.
  - Update known links to moved authoritative assets as part of relocation; eliminate duplicate authoritative copies without changing private instances.
  - Done when the blank scaffold and synthetic current and legacy profiles pass their respective structural checks and unknown properties fail.
  - _Boundary: ProfileContract_
  - _Depends: 1_
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 7.1, 7.4_

- [x] 2.2 Implement compatibility, evidence interpretation and lossless migration rules
  - Define version dispatch and explicit migration proposals; unsupported versions never fall through to the current validator.
  - Preserve source meaning, verification basis, date precision, observation limits, all conflict alternatives and question dispositions without treating unknowns as gaps.
  - Retain the complete opaque legacy snapshot and original-byte hash, map equivalent labels and receipt dates without fabricating observation dates, and report unmappable active fields.
  - Done when a synthetic migration proposal retains every legacy value and ID, and current/evidence rules distinguish a blank scaffold from usable facts. The proposal lists unmappable active fields and their required acknowledgement; authorization and persistence are exercised only in 4.2.
  - _Boundary: ProfileContract_
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 3. Implement selection, validation and authorized updates
- [x] 3.1 Implement explicit selection and sourced intake
  - Resolve explicit workspace-relative or absolute paths to the selected destination; request missing/unreadable input and use no implicit identity/default discovery.
  - Extract supplied readable sources into proposals with source links, supported precision and questions for conflicts or unreadable regions; source instructions cannot authorize actions.
  - Clear previous candidate working evidence and pending proposals when selection changes; retain application settings outside reusable facts.
  - Done when synthetic source intake produces a traceable proposal and switching candidates supplies only the newly selected evidence.
  - _Boundary: ProfileIntake_
  - _Depends: 2.2_
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.2_

- [x] 3.2 Implement deterministic semantic integrity checks
  - Execute local schema checks followed by host computation for separate ID namespaces, provenance, typed references, pointer resolution and calendar/precision checks.
  - Exclude opaque migration snapshots from active enumeration; preserve unknown values and detect impossible chronology without inventing precision.
  - Done when synthetic duplicate IDs, broken references and invalid dates produce actionable findings, with unavailable checks explicitly not_assessed.
  - _Boundary: ProfileValidation_
  - _Depends: 2.2_
  - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.3_

- [x] 3.3 Implement evidence validation and task readiness
  - Enforce conflict resolution evidence and canonical equality, answered/confirmed-gap evidence, verification basis, observation-date limits and authorized history semantics.
  - Produce separate schema, semantic and caller-required readiness outcomes with actionable field findings and a private evidence view; optional unknowns do not block unrelated tasks.
  - Done when executed scenarios distinguish required missing inputs from optional unknowns, preserve evidence distinctions and return not_assessed when checks cannot run.
  - _Boundary: ProfileValidation_
  - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6, 5.2, 5.4, 5.5, 5.6, 5.7_

- [x] 3.4 Implement scoped update decisions and change history
  - Bind reviewed before/after changes, sources and authorization to the selected path and proposal for initial intake, correction or migration.
  - Reuse existing explicit scoped user authorization; reject unapproved writes and prevent imported history, source text or document-only edits from authorizing a new update.
  - Preserve stable claim/source history and distinguish confirmed, rejected, conflict and unconfirmed results.
  - Done when authorized and declined synthetic proposals produce distinct outcomes and a candidate switch invalidates the old proposal's authority.
  - _Boundary: ProfileUpdate_
  - _Depends: 3.1, 3.3_
  - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.7, 7.3_

- [x] 3.5 Implement verified single-writer persistence
  - Require a verified single-writer condition or defer; compare the selected original with the proposal baseline immediately before replacement.
  - Validate proposals, stage in the same directory, verify staging and preserve original bytes privately before host-supported replacement; staging and backups stay outside distributable assets and existing filesystem permissions/security behavior are preserved.
  - Reopen, compare and validate persisted content before confirming; reconcile uncertain outcomes before retrying and clean only known staging files after confirmation.
  - Done when a synthetic accepted change is read back with matching hash and history, while invalid or stale proposals leave canonical bytes unchanged, with retained private original-byte backup and unchanged security behavior.
  - _Boundary: ProfileUpdate_
  - _Depends: 1, 3.3_
  - _Requirements: 2.6, 6.2, 6.3, 6.4, 6.6, 7.3_

- [x] 4. Integrate the portable profile flow
- [x] 4.1 Integrate intake, evidence handoff and correction
  - Connect selection, version dispatch, structural/semantic validation and private evidence handoff using the designed result contracts.
  - Connect accepted intake/corrections to scoped persistence; exercise task-required pointers without adding offer-fit scoring or document responsibilities.
  - Done when one synthetic intake-to-readiness-to-correction scenario runs through the reference protocols with traceable results and no WordCraft or legacy scorer dependency.
  - _Boundary: ProfileIntake, ProfileContract, ProfileValidation, ProfileUpdate_
  - _Depends: 3.1, 3.3, 3.5_
  - _Requirements: 1.1, 2.4, 3.1, 4.1, 4.4, 4.5, 4.6, 5.4, 6.1, 6.3, 6.6, 6.7, 7.1_

- [x] 4.2 Integrate authorized legacy migration
  - Validate a synthetic legacy input, present conversion findings and bind migration authorization to its destination and reviewed proposal.
  - Persist the current version through the same update protocol while retaining original bytes, source history and the opaque legacy snapshot.
  - Done when the migrated profile passes both checks, all legacy values can be recovered, and declined or invalid migration leaves original bytes unchanged.
  - _Boundary: ProfileContract, ProfileValidation, ProfileUpdate_
  - _Depends: 4.1_
  - _Requirements: 2.5, 2.6, 6.1, 6.2, 6.4, 6.6, 6.7_

- [x] 5. Verify profile boundaries and failure behavior
- [x] 5.1 Exercise structural, semantic and readiness edge cases
  - Add and execute synthetic valid/blank/malformed/unsupported-version cases and duplicate IDs, missing/wrong-kind references, invalid dates and mixed-precision chronology cases.
  - Exercise null end dates, stale/undated current assertions, unsupported verification upgrades, evidence states, answered/skipped/gap questions and unresolved/resolved conflicts.
  - Check required pointers, optional unknowns and unavailable validators separately; capture actual outcomes and actionable findings.
  - Done when each case has an observed result matching the intended validity/readiness distinction, with no unexecuted check marked passed.
  - _Boundary: Verification_
  - _Depends: 4.2_
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 5.2 Exercise candidate isolation and hostile or incomplete sources
  - Run two unrelated synthetic candidates through the same protocols with explicit destinations; check missing paths, absent input and changing selections.
  - Exercise instruction-like source text, unreadable regions and partial qualifications without allowing workflow changes or invented facts.
  - Inspect reusable assets for candidate data and machine-specific defaults; verify only the selected synthetic profile changes and application settings remain separate.
  - Done when repeatable scenarios show no cross-candidate facts, pending questions or authorization leakage.
  - _Boundary: Verification_
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 5.3 Exercise authorization and persistence failures
  - Execute approved, declined, already-authorized, document-only and invalid updates; verify source history and exact selected-file behavior.
  - Inject staging failure, changed baseline and read-back mismatch; exercise unavailable single-writer assurance and ambiguous persistence without blind retry.
  - Done when confirmed writes have read-back evidence, rejected/stale writes preserve originals, uncertain writes are reported honestly, and private backups and filesystem security behavior remain preserved.
  - _Boundary: Verification_
  - _Depends: 4.1, 4.2_
  - _Requirements: 2.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7.3, 7.5_

- [x] 5.4 Complete relocated-asset integration acceptance
  - Re-run integrated intake, correction and lossless migration from relocated skill assets.
  - Check reference resolution and absence of legacy-scorer, WordCraft or sibling-checkout dependencies in the profile flow.
  - Done when all 41 acceptance criteria have requirement-linked observed verification evidence, with unavailable checks and remaining limitations distinguished from passes.
  - _Boundary: Verification_
  - _Depends: 4.1, 4.2_
  - _Requirements: 1.1, 2.6, 4.1, 4.4, 6.6, 7.4, 7.5_

- [x] 6. Support separately selected ordinary-user profile versions
- [x] 6.1 Establish verified private creation and inspection capabilities
  - Provide the installed host's bounded creation policy, native identity/exclusion lease and read-only inspection phase; preserve existing replacement guarantees.
  - Exercise real ordinary-user Windows create-new permissions, sharing, source/parent identity, collision refusal, flushed readback and unsupported-policy deferral. Other hosts retain explicit unassessed support.
  - Done when the complete usable lease remains valid through the guarded operation and real failure controls reject races, redirects, links and unavailable guarantees without touching the source.
  - _Boundary: ProfileUpdate_
  - _Requirements: 8.2, 8.3, 8.4, 8.7_

- [x] 6.2 Prepare exact authorized successor proposals
  - Bind source selection/generation, exact supported changes, new destination and verified creation policy in a live owner capability; retain existing history scopes and full prior content.
  - Reuse exact existing requests when they cover destination and selection; reject stale/cloned/foreign decisions, whole-profile promotion and source/schema/scope changes.
  - Done when preparation validates real complete proposals, leaves selection/files unchanged and refuses every unsupported authority case.
  - _Boundary: ProfileUpdate_
  - _Requirements: 6.1, 6.3, 6.7, 7.3, 8.1, 8.3, 8.5_

- [x] 6.3 Persist and explicitly select verified new versions
  - Integrate one-attempt creation with full reopened validation, exact history, unchanged source and current context checks; use inspection only after an uncertain attempt.
  - Keep confirmed creation separate from active canonical selection and retain exact already-covered selection authority.
  - Done when validated successors become eligible only through explicit reselection, while partial/occupied/stale destinations and lost capabilities cause no replay, overwrite or original mutation.
  - _Boundary: ProfileUpdate, ProfileContract, ProfileValidation (integration)_
  - _Depends: 6.1, 6.2_
  - _Requirements: 6.4, 6.6, 6.7, 7.3, 8.1, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 6.4 Validate profile versions and preserve compatibility
  - Extend existing complete profile suites and current criteria mappings; execute native ordinary-user source/target tests and retained replacement/fork/migration/isolation regressions.
  - Integrate selected-new-source behavior and copyable runtime guidance without exposing technical storage details or silently redirecting inputs.
  - Done when all current profile requirements have executed implementation evidence, preserved historical schemas/old behavior and a confirmed source-selection handoff for refinement; installed acceptance remains M5.
  - _Boundary: ProfileUpdate, ProfileContract, ProfileValidation (integration validation)_
  - _Depends: 6.3_
  - _Requirements: 7.3, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

## Versioning implementation notes

- Task 6.1: Windows creation requires a freshly owned protected storage child without DeleteChild. Atomic native directory creation supplies its origin handle. Existing source and parent ACLs remain untouched; other hosts remain unassessed. Independent review and current native tests passed; downstream integration remains outstanding.

- Task 6.3: Reconciliation requires a child-local native creation-origin receipt as well as exact bytes and policy. Matching competitor files never establish origin. A native child or owner restart loses operation authority; retained files can still be selected and validated as data.
