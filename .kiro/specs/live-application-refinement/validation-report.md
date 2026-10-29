# M4 feature validation

Date: 2026-10-29. Decision: **GO** for live application refinement. All fifteen implementation tasks passed independent review. Installed-workflow acceptance, publication and legacy retirement remain M5 work.

## Executed validation

The frozen full acceptance run passed 69 suites and 186 reported Node tests with zero failures and zero skips. It copied 193 explicitly declared runtime and test assets to an unrelated temporary directory and checked source, copied and selected evidence hashes after execution. All 56 criteria have coverage entries tied to executed suites and checking-code locations.

The only later changes were two EOF normalizations and eight corrections identifying deterministic controls accurately in the coverage metadata. Original snapshot bytes, hashes and logs remain private. Independent review verified those changes, ran twelve fresh critical tests and a relocated smoke check, and approved the corrected inventory. The controller then independently checked the current inventory, all coverage entries and retained suite results, reran the authenticated actual-evidence gate and relocated smoke, and confirmed no incomplete or blocked task.

Current runtime liveness passed through the installed WordCraft MCP: initialization and discovery of all sixteen tools succeeded. This read-only smoke changed no document. Its receipt is retained privately with the full and smoke results. Five selected actual profile, strategy, document and checkpoint artifacts also passed the pinned schema validator.

Run the complete check with explicitly selected private evidence and its independently trusted digest:

```powershell
pnpm.exe exec node tests/live-application-refinement/full-acceptance.cjs <private-index.json> <trusted-index-sha256> <private-index-review.json>
pnpm.exe exec node tests/live-application-refinement/full-acceptance.cjs <private-index.json> <trusted-index-sha256> <private-index-review.json> --smoke
pnpm.exe exec node tests/privacy/check-repository.cjs <selected-private-facts.json>
```

The ignored validation bundle retains the original full run, current smoke, source snapshots, metadata corrections, semantic reviews and command logs. The evidence index binds 603 selected files and 105 referenced file paths. The gate requires complete runtime membership and an independently selected digest; it cannot create substitute evidence when a receipt is missing.

## Requirements and evidence

The exact mapping is in [the acceptance manifest](../../../tests/live-application-refinement/acceptance-manifest.json). Its evidence classifications distinguish actual observations, deterministic controls and host judgment. A source locator alone does not establish a criterion; the executed assertions and independently reviewed observations supply that assessment.

| Criteria | Evidence scope |
| --- | --- |
| 1.1 to 1.6 | Current source, target, language and document selection; readiness, partial inputs, role-only limits and stale-selection controls |
| 2.1 to 2.7 | Existing batch planner, useful distinctions, qualitative outcomes, free answers, skipped dispositions and bounded reopening |
| 3.1 to 3.13 | Statement classification, exact scope choices, confirmed persistence, selected promotion, corrections, pending facts, manual claims and chronology |
| 4.1 to 4.9 | Actual MCP inspection and targeted edits, preserved manual prose and formatting, conflict resolution, save/reopen, observed interruption recovery and separately labeled missing-capability controls |
| 5.1 to 5.6 | Separate English/German CVs and Germany-market letters, deliberately pending then resolved member, semantic consistency and all-page review |
| 6.1 to 6.6 | Existing diagnostic methods, zero/lower/non-comparable results, source-bound reports and unsupported-claim limits |
| 7.1 to 7.9 | Private checkpoints, current-owner resume guards, isolation controls, actual reconnect without replay, stop boundaries and inert restored instructions |

Actual bilingual acceptance retained four separate editable documents and six final rendered pages. Both CVs have two pages with native unlocked PAGE and NUMPAGES fields. Both letters have one page and passed the sourced project letter checklist. Independent reviewers inspected the pages and meaning against the fictional source statements.

The earlier mixed-choice run proves actual application-only persistence, selected reusable promotion and manual preservation, but did not create a closed refinement checkpoint. It remains historical. A later actual follow-up supplies current pre-dispatch checkpoints, answered-question restoration, repeat suppression and verified members. The gate does not invent earlier checkpoints.

Actual interruption acceptance dispatched one edit, terminated the CLI before acknowledgment, reconnected and observed the intended effect through MCP. The document owner reconciled it without replay. A confirmed checkpoint preceded the subsequent ordinary save. Explicit stop blocked new questions and profile, edit, save and export actions; no later MCP call occurred. Thirty deterministic controls are retained separately. That recovery member is not presented as a verified complete application.

## Design and integration

The entrypoint connects RefinementFlow, ScopedProfile, StrategyIntegration, LiveRevision and RefinementRecord in the approved dependency direction. Profile owns evidence and persistence; strategy owns eligibility, questions and diagnostic comparisons; documents own composition and verification; the session owns WordCraft operations. Refinement coordinates these owners and never turns a report, saved approval or matching hash into mutation authority.

Application profiles use 2.1 with immutable application scope. Reusable profiles remain 2.0. Current strategy and document contracts are 1.2; document-session and refinement records remain 1.0. Historical validators and observations remain version-specific. All affected profile, strategy, session and document suites executed in relocation. Current semantic regression uses a separately reviewed fourteen-case 1.2 observation; original historical observations were not rewritten.

No new service, model endpoint, database, document engine or custom MCP bridge was introduced. Test drivers remain outside the reusable runtime. No boundary violation, blocked task or uncovered criterion remains.

## Privacy and limits

Repository and staged-content privacy checks passed, followed by manual review of changed shareable assets. Candidate instances, answers, documents, receipts and identifying machine paths remain ignored private inputs or outputs. The scanner cannot prove the absence of every identifying combination or binary metadata leak.

The initial broad RED test accidentally passed by catching a missing-function error. Meaningful disabled-baseline failures were recorded later, followed by passing corrected tests. The required pre-implementation RED order was not satisfied. This process deviation remains disclosed in the task report and independent review; no test chronology has been rewritten.

Host semantic and visual assessments remain judgments. Hashes establish integrity, not truth or language comprehension. Recovery establishes observed effect, not exactly-once external delivery. The environment allowlist is not an operating-system sandbox. Unavailable diagnostics stay unassessed; no hiring probability, proprietary ATS prediction, numerical score gain or full normative DIN conformity is claimed.

## Validation Report

- DECISION: GO
- MECHANICAL_RESULTS: Full 69-suite/186-test run PASS; current targeted checks and relocated smoke PASS; WordCraft MCP smoke PASS; changed-file placeholder and secret checks CLEAN; privacy PASS.
- INTEGRATION: Cross-task contracts, shared state and boundary audit PASS.
- COVERAGE: 56/56 criteria; no coverage gap.
- DESIGN: Approved component boundaries and dependency direction retained; declared assets verified.
- OWNERSHIP: LOCAL
- UPSTREAM_SPEC: N/A
- BLOCKED_TASKS: None.
- REMEDIATION: None required. M5 acceptance remains separate.
