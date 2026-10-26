# Feature validation: targeted application strategy

Date: 2026-10-26. Decision: **GO** within the approved strategy boundary.

All 14 executable tasks passed independent review. Feature-level coverage and design/integration reviews found no blocking findings: 8/8 requirement sections and 48/48 acceptance criteria are covered. No blocked tasks remain.

## Executed evidence

- `node tests/targeted-application-strategy/full-acceptance.cjs`: exit 0, all 14 suites executed from an allowlisted copy outside the checkout. The run used 13 runtime assets and 29 test assets, without the sibling skill collection, legacy scorer or additional model credentials.
- `node tests/targeted-application-strategy/full-acceptance.cjs --smoke`: exit 0. The relocated integration workflow exercised real upstream validation, confirmed synthetic persistence, fresh selection and private handoff assembly.
- `node tests/targeted-application-strategy/full-acceptance.test.cjs`: fresh controller and independent review runs passed. Controls reject missing assets, changed bytes, missing/duplicate/unexpected suites, absent or incorrect modes, failed results and incomplete coverage.
- Full and smoke evidence was freshly checked against current runtime/test hashes, exact expected suite identities and successful exit statuses. The full report contains all 48 coverage entries. Successful unchanged suites were not rerun merely to restate their results.
- All 21 test JavaScript files passed syntax checks. Placeholder and credential scans were clean. Final repository privacy scanning passed for 211 shareable paths, including working tree and index. Manual inspection found no real candidate content or identifying machine paths in the strategy assets and specifications.

The ignored reports are `outputs/strategy-tests/full-acceptance.json` and `smoke-acceptance.json`. Their SHA-256 values are respectively `1c1e7cd0c1759f863ed9b7953c4d979c0511c2d8bee8a9652871cefbf89b63fa` and `8b8d1730ac05ea3977cca6070d85bdc61e4421bff48bc853fa864721e4a59de1`. Reuse requires current manifests and an explicit `full` or `smoke` mode, never a mode inferred from the number of results. Earlier runs invalidated by harness edits are excluded.

Reproducible commands, requirement links and evidence limits are in [scenarios.md](../../../tests/targeted-application-strategy/scenarios.md). [Semantic acceptance](../../../tests/targeted-application-strategy/editorial-cases.md) records the fresh fictional reasoning and distinguishes it from deterministic replay.

## Task review record

Every implementer returned `READY_FOR_REVIEW`; every final independent verdict was `APPROVED`. Reference names below are under `skills/targeted-cv/references/`, and test names are under `tests/targeted-application-strategy/` unless otherwise stated.

| Task | Changed assets | Commit |
| --- | --- | --- |
| 1 | fixtures, foundation adapter and tests | `db24500` |
| 2.1 | strategy-contract.md, application-strategy schema, contract fixtures/tests, foundation adapter | `bc71448` |
| 2.2 | application-strategy.md, context tests, foundation adapter | `2698c6d` |
| 3.1 | strategy-evidence.md, offer cases/tests | `9fde510` |
| 3.2 | strategy-evidence.md, evidence tests | `6d9b532` |
| 3.3 | strategy-evidence.md, question tests | `c991e1c` |
| 4.1 | strategy-editorial.md, composition tests and fictional editorial cases | `9a5ef7c` |
| 4.2 | strategy-editorial.md, method tests and fictional fallback review | `15b33ba` |
| 5.1 | strategy-review.md, diagnostics tests | `25b648d` |
| 5.2 | strategy-review.md, editorial-review tests/cases | `a1b8822` |
| 5.3 | strategy-review.md, comparison tests | `ae0fef6` |
| 6.1 | application-strategy.md, integration tests, reused persistence adapter | `4215304` |
| 6.2 | semantic inputs, host decisions, observed results, replay harness and traceability | `9ab7979` |
| 6.3 | relocation driver/controls, coverage manifest, foundation adapter and scenarios | `1b44fcc` |

Task reviews resolved archive-pointer acceptance, abbreviated failure results, a German fallback translation drift, inconsistent saved score arithmetic, two unsupported semantic assumptions and incomplete report verification. The final tests and reviews cover the repaired versions.

## Integration and design assessment

The dependency direction remains unchanged profile contracts, trusted strategy context, employer/evidence analysis, contribution composition, review, then private handoff. Five strategy references and a closed schema implement the planned responsibilities. Focused test files expand the verification layout without introducing another application.

Canonical bytes receive fresh validation. Pending answers cannot become claim support; only observed confirmed persistence followed by matching reselection establishes continuity. Dispositions require individual reassessment. Candidate or input changes invalidate prior conclusions. Claims are selected separately by language, and archived values cannot serve as current evidence.

Coverage and claim support use explicit populations and arithmetic. Appeal and readability remain host judgments. External document checks require artifact-bound observations. Comparison checks definitions, identity and arithmetic before emitting deltas. Optional writing methods distinguish discovery, installation handoff, execution and fallback.

Independent semantic review assessed eleven source/proposal pairs and three supported revisions. It corrected an episode-specific authority restriction that had been overstated as a general qualification gap, and a question that assumed permit possession. The final fourteen handoffs replay successfully against the unchanged reviewed runtime hashes. Replay is not a new comprehension assessment.

## Limits and next consumers

This GO covers strategy, not proprietary ATS acceptance, hiring outcomes, WordCraft authoring, final skill packaging or legacy retirement. Source truth and prose meaning still require host review. Dependency inspection is static rather than an operating-system sandbox. Windows persistence assurance is limited to the reused synthetic test-owned workspace adapter.

Document and refinement consumers must preserve language-specific selections, handoff states, fresh bindings, complete findings, observed update continuity and unavailable-check semantics. Release must validate actual installed callbacks and packaged bytes; checkout or packaging byte changes invalidate this exact-byte evidence until revalidated. Private candidate data is not part of the reusable assets.
