# Strategy tests

Fresh host reasoning is recorded in `semantic-cases/inputs.json` and `semantic-cases/host-review-v1.2.json`; executed integrated results and runtime hashes are in `semantic-cases/observed-v1.2.json`. Run `node tests/targeted-application-strategy/semantic-acceptance.test.cjs` to replay the reviewed decisions with real validators. The observation record binds the exact runtime asset hashes; changed runtime bytes require a reviewed re-record, never an automatic fix.

## Scenario traceability

| Exact requirements | Fresh cases and acceptance property | Additional deterministic regression |
| --- | --- | --- |
| 2.1, 2.2, 2.4 | Conflicting priorities retain exact source spans, explicit required and ambiguous optional priority, with a focused clarification | offer.test.cjs covers atomic outcome, responsibility, qualification and context populations |
| 2.3, 2.5 | Weak inventory connects the supported action to the target; no fabricated culture or inferred mandatory criteria | offer.test.cjs separates labelled inference from explicit criteria |
| 3.1, 3.2, 3.4, 3.5 | Unsupported appeal, authority, historical tools, credential uncertainty and skipped answer retain limits and propose corrections/questions | evidence.test.cjs covers all five evidence states and partial conditions |
| 3.3, 3.7, 6.6 | Source-defined REX expansion preserves concept with unavailable taxonomy; no lexical reward or universal acronym claim | evidence.test.cjs and diagnostics.test.cjs cover inaccurate synonyms and repetition invariance |
| 3.1, 3.5, 3.6, 5.5 | Credential question first asks whether a permit was ever held, explicitly allows never held, then asks validity conditionally; historical tool asks last use; authority question asks about any evidenced authorization, including current work, without turning historical supervision into a current confirmed gap | evidence.test.cjs covers credential status and source limits |
| 4.1, 4.2, 4.3 | Weak inventory becomes a concrete contribution; historical tools remain secondary; rejected authority/impact have supported revisions | composition.test.cjs checks inventory and selected-claim gates |
| 4.4, 4.5 | Both languages use the same snapshot; German drift is withheld independently and corrected; sentences remain short and dash-free | composition.test.cjs checks language-specific withholding |
| 4.6 | This host actually applied available COBESY and Humanizer; unavailable taxonomy does not imply missing editorial methods | methods.test.cjs covers available, missing, declined and installed-but-unavailable methods |
| 5.1, 5.2, 5.3, 5.4 | Focused questions have affected criteria and rationale; finite limit 3; skipped recency remains suppressed and uncertain | questions.test.cjs covers deferred batches, disposition states, paraphrases and justified reopening |
| 6.5 | Photo and completed-award-date omissions do not reduce evidence coverage/support; explicit request remains application completeness | diagnostics.test.cjs verifies omission invariance |
| 8.1, 8.2 | Editorial anchors are project judgment, optional writing guidance is not vendor behavior, unavailable taxonomy has no consulted passage | editorial-review.test.cjs and diagnostics.test.cjs cover bounded dimensions |
| 8.3 | Source commands and reference-code claims produce neither tool actions nor factual authority | context.test.cjs and offer.test.cjs cover inert source content |

Expected properties in this table guide review; they are not evidence that the host understood the text. Tests replay recorded decisions and prove contract behavior only. Independent reviewer disposition belongs in the parent task review, not an implementer's claim.

## Relocation acceptance

`node tests/targeted-application-strategy/full-acceptance.cjs` copies an explicit allowlist of the 13 runtime assets, every strategy test suite and its required test support into a fresh external temporary directory. The copied upstream Windows persistence test adapter is unchanged. The external tree has no Git checkout, sibling skill collection, candidate inputs or model credentials. Each suite creates its own synthetic workspace; at most three suites execute concurrently. `--smoke` runs the real integration suite from the relocated tree: selected-profile validation, an offer handoff, a pending answer, authorized persistence through the upstream adapter, fresh validation, continuity, role-only positioning and private save.

`acceptance-coverage.json` enumerates all 48 numbered criteria, the exact source assertion, its owning executed suite and the property it checks. Where meaning, usefulness or editorial quality requires host judgment, `host_observations` identifies the actual semantic cases. Recorded host judgments and their independent review remain separate from deterministic replay; this runner does not conduct another semantic review.

| Adverse condition | Actual executed assertion source |
| --- | --- |
| Unreadable or unvalidated selected profile | context.test.cjs rejects input-unreadable and validation gates; integration.test.cjs rejects invalid-profile binding and assembly |
| Unrelated candidate swap | context.test.cjs asserts the new context contains no candidate-operations data; integration.test.cjs repeats the isolation check |
| Same-path byte replacement and stale saved handoff | context.test.cjs invalidates after changed selected bytes; integration.test.cjs rejects saving the old handoff after the file changes |
| Missing or untrusted continuity | integration.test.cjs rejects an arbitrary reselection receipt and clears dispositions; comparison.test.cjs rejects a supplied confirmed flag without a host receipt |
| Unavailable/stale document observations | editorial-review.test.cjs requires not_assessed for missing or stale observations |
| Changed criteria/proposition populations | comparison.test.cjs requires null affected deltas with population/proposition reasons |
| Missing asset, modified bytes, suite failure or omitted coverage | full-acceptance.test.cjs requires the acceptance driver to throw |

The reports at ignored `outputs/strategy-tests/` record every executed command and exit status, all runtime and test SHA-256 hashes, coverage and limits. The driver verifies source and relocated bytes again after execution; any changed byte prevents acceptance. The semantic observation baseline independently binds all 13 runtime assets and the 14 actual handoffs. For reuse of a fresh report, call the exported `verifyManifest` against its combined runtime/test hashes, then `checkResults(report.commands, 'full')` or `'smoke'`; the caller must explicitly choose the mode. Privacy verification runs separately at the repository root with the explicitly selected `private/cv-facts.json`.

The boundary remains strategy-only: no WordCraft authoring, final package release, actual ATS acceptance or legacy retirement is asserted. The [current validation report](../../.kiro/specs/targeted-application-strategy/validation-report.md) records the final gate and remaining review obligations.
