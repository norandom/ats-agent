# M3 feature validation

Date: 2026-10-27. Decision: **GO**. Full validation, explicit smoke, independent review and controller privacy gates passed. This report concerns application documents only.

## Scope and reproducibility

Task 7.2 adds an explicit relocation allowlist and final acceptance gate. The allowlist includes all 13 owned test suites, 25 runtime assets (six current M3 assets, the historical document schema and required upstream assets) and test support files. Execution occurs outside the checkout with no sibling repository and no model credentials in child environments. Schema tests invoke the real pinned `check-jsonschema==0.38.2` through uvx. Three suites run concurrently at most.

The canonical full command is `pnpm exec node tests/wordcraft-application-documents/full-acceptance.cjs <actual-receipt> <independent-review>`. The explicit smoke adds `--smoke`. Windows execution uses `pnpm.exe`. Ignored `outputs/documents-validation/` holds command logs, exact source/copied hashes, suite membership and criterion coverage. Missing suites, nonzero exits, skipped tests, missing assets, changed hashes and absent actual evidence fail the gate.

Fresh results: full command exit 0, all 13 suites and 54 tests passed with zero skipped tests; explicit smoke command exit 0, its integration suite passed with zero skipped tests. Both modes replayed the actual receipt successfully against current and relocated runtime assets. All 60 allowlisted source/copied files retained their hashes, and full coverage contains exactly 42 criteria. Detailed logs are retained in `full-logs/` and `smoke-logs/` under the ignored validation output directory. RED evidence is `red.txt` (new guard suite failed with the missing harness); the implemented guard suite passed all four tests in the frozen full run.

## Requirements and evidence

All 42 criteria in requirements 1–7 are enumerated in `tests/wordcraft-application-documents/acceptance-manifest.json`, with named executable assertions and the corresponding actual receipt/review scope. `scenarios.md` distinguishes actual execution, simulated adverse controls and host judgment.

The manifest's `actual_assertion` is a shared integrity guard for the actual evidence, not the sole proof of each criterion. The named per-criterion tests, the scope table below and the independent host findings supply the distinct behavioral, semantic and visual coverage. Passing a shared page-review guard alone does not establish factual meaning or input readiness.

| Criteria | Evidence scope |
| --- | --- |
| 1.1–1.6 | Current input, independent application context, stale bindings, readiness, requested-only membership and private destination controls; exact upstream profile/strategy/manifest binding in actual acceptance |
| 2.1–2.6 | Composition/range controls plus independent review of target relevance, real titles, chronology, scope, qualifications and editorial prose across source-backed realizations |
| 3.1–3.6 | Bilingual assembly, partial readiness, claim rewording and letter metadata controls; independently reviewed English/German CV/letter consistency |
| 4.1–4.6 | Actual single-column typography, headings, shading and bullets; independent every-page visual review, observed automatic fields and one-to-multiple-page changes in both languages |
| 5.1–5.6 | Confirmed letter inputs, sourced checklist and fourteen measured rows across both language letters; unavailable geometry remains pending |
| 6.1–6.6 | Actual calls/intents and document switches, saved editable artifacts, manual-change preservation, read-back/reopen and session failure controls |
| 7.1–7.6 | Exact body/snapshot/artifact checks, independent reading order and semantic review, eight reviewed PNG pages, revision invalidation and unchanged strategy consumer handoff |

The selected actual acceptance receipt has SHA-256 `ab5f455d5aff5ba20295501a4d418615648a90ddb4b7e015b108d3e89b6896e5`. It records six stages, four final documents, eight rendered pages, both pagination transitions and manual-edit preservation. Its independent review examined 96 claim realizations against the selected fictional sources. The final gate verifies the exact receipt/review, all 24 receipt-bound runtime assets, recorded call provenance and observed CV properties. No actual document is reauthored by this relocation run.

The original receipt and review are copied byte-for-byte; their absolute artifact, render and upstream JSON paths remain explicitly selected external fictional test inputs. These original paths and their hashes are recorded only in ignored evidence. The evidence archive itself is not claimed portable. Optional historical presentation/verification/consumer live branches use different receipt formats; their actual scenario obligations are explicitly replaced by the current comprehensive receipt, while their rejection tests still execute. There are no fabricated historical receipts or silently accepted mandatory omissions.

## Design and integration alignment

The implementation preserves the design's Boundary Commitments, Architecture, Components and Interfaces (Composition, Presentation, Letter and Verification), Data Models, Error Handling and Testing Strategy. Runtime code remains the approved portable references and schemas; the harness is test orchestration only. Upstream contracts are unchanged. Full integration traverses current profile validation, strategy assembly, document manifest integrity, requested-only composition and strategy evidence consumption. Semantic judgment remains host work, and hashes never substitute for meaning or visual review.

The prior strategy full and explicit smoke evidence was freshly checked against every recorded asset: 25 runtime and 53 test hashes still match, with all 24 full-suite exits and the smoke exit successful. The result is saved in `outputs/documents-validation/upstream-evidence.json`. The unrelated strategy suites were not rerun; current M3 integration suites are executed afresh.

Current runtime liveness is separately demonstrated by the read-only existing WordCraft MCP smoke in `outputs/documents-validation/live-smoke/receipt.json`: selected saved fictional original, exact body and document inspection, unchanged bytes and UI identity. It makes no fresh authoring or formatting claim.

## Final gates and limits

Independent review approved all 42 criteria, design alignment, integration and responsibility boundaries. It verified full and smoke logs, both 60-file manifests, selected evidence hashes and live-smoke provenance, and ran four fresh guard tests. The controller verified all eleven reviewer-bound current file hashes before recording this final decision. Repository and index privacy scanning passed across 304 shareable paths; manual review found no real candidate content in the new assets. All twelve implementation tasks are complete, with no blocked task or uncovered criterion.

The previously approved live acceptance is reused only while its bound runtime and source bytes remain current. No new score formula, universal ATS compatibility, full normative DIN audit, automated refinement completion, distributable release or legacy retirement is asserted. M4 consumes current strategy and document contracts 1.1; M5 retains packaging and legacy retirement.
