# Task 6.2 scenario traceability

Fresh host reasoning is recorded in semantic-cases/inputs.json and host-review.json; executed integrated results and runtime hashes are in semantic-cases/observed.json. Run `node tests/targeted-application-strategy/semantic-acceptance.test.cjs` to replay the reviewed decisions with real validators. `--record` replaces the observation artifact and is reserved for an explicitly reviewed new acceptance run, not an automatic fix for a failed assertion.

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

Expected properties in this table guide review; they are not evidence that the host understood the text. The actual prose and reasons are independently reviewable in host-review.json. Tests replay recorded decisions and prove contract behavior only. Independent reviewer disposition belongs in the parent task review, not this implementer's claim.

# Task 6.3 relocation acceptance

`node tests/targeted-application-strategy/full-acceptance.cjs` copies an explicit allowlist of the 13 runtime assets, every strategy test suite and its required test support into a fresh external temporary directory. The copied upstream Windows persistence test adapter is unchanged. The external tree has no Git checkout, sibling skill collection, legacy scorer, candidate inputs or model credentials. Child processes receive only the operating-system/tool-location environment needed to run Node, PowerShell and the pinned schema validator. Each suite creates its own synthetic workspace; at most three suites execute concurrently.

`node tests/targeted-application-strategy/full-acceptance.cjs --smoke` runs the real integration suite from that same relocated tree. It exercises selected-profile validation, an offer handoff, a pending answer, authorized persistence through the upstream adapter, fresh validation, continuity, role-only positioning and private save. This is intentionally a substantial first-usable-workflow smoke, not just a command availability probe.

`acceptance-coverage.json` enumerates all 48 numbered criteria, the exact source assertion (or delegated rejection assertion), its owning executed suite and the property it checks. Where meaning, usefulness or editorial quality requires host judgment, `host_observations` identifies the actual task 6.2 cases. Coverage validation requires the corresponding semantic replay suite to pass. In particular, 6.5 refers to the complete observed omitted-dates-photo result comparison, not the lexical-repetition assertion. Recorded host judgments and their independent task 6.2 review remain separate from deterministic replay; this runner does not conduct another semantic review.

| Adverse condition | Actual executed assertion source |
| --- | --- |
| Unreadable or unvalidated selected profile | context.test.cjs rejects input-unreadable and validation gates; integration.test.cjs rejects invalid-profile binding and assembly |
| Unrelated candidate swap | context.test.cjs asserts the new context contains no candidate-operations data; integration.test.cjs repeats the isolation check |
| Same-path byte replacement and stale saved handoff | context.test.cjs invalidates after changed selected bytes; integration.test.cjs rejects saving the old handoff after the file changes |
| Missing or untrusted continuity | integration.test.cjs rejects an arbitrary reselection receipt and clears dispositions; comparison.test.cjs rejects a supplied confirmed flag without a host receipt |
| Unavailable/stale document observations | editorial-review.test.cjs requires not_assessed for missing or stale observations |
| Changed criteria/proposition populations | comparison.test.cjs requires null affected deltas with population/proposition reasons |
| Missing asset, modified bytes, suite failure or omitted coverage | full-acceptance.test.cjs requires the acceptance driver to throw |

The reports at ignored `outputs/strategy-tests/full-acceptance.json` and `smoke-acceptance.json` record every executed command and exit status, all runtime and test SHA-256 hashes, imported helper dependencies, coverage and limits. The driver verifies source and relocated bytes again after execution; any changed byte prevents acceptance. The unchanged semantic observation baseline independently binds all 13 runtime assets and the 14 actual handoffs. Never use `--record` to repair a mismatch. Git checkout line-ending conversion or package byte changes require revalidation; checkout/package normalization belongs to release work.

For reuse of a fresh report, call the exported `verifyManifest` against its combined runtime/test hashes, then `checkResults(report.commands, 'full')` for full acceptance or `checkResults(report.commands, 'smoke')` for smoke. The caller must explicitly choose the required mode; it is never inferred from the report length. This requires the exact unique suite inventory for that mode, rejecting missing, duplicate or unexpected suites before checking exit statuses. For full acceptance, also call `checkCoverage(report.coverage, report.commands)`. A report with a failed or absent suite cannot establish acceptance. No claim is made that this static dependency inspection is an operating-system access sandbox. Privacy verification runs separately at the repository root with the explicitly selected `private/cv-facts.json`; no private candidate file is copied into relocation. The identifier checker cannot prove absence of paraphrases or identifying combinations, so manual shareable-asset review remains required.

The boundary remains strategy-only: no WordCraft authoring, final package release, actual ATS acceptance or legacy retirement is asserted.

## Observed task 6.3 execution

- `node tests/targeted-application-strategy/full-acceptance.test.cjs`: exit 1 before implementation (`MODULE_NOT_FOUND` for the new driver), then exit 0 after implementation. Negative controls cover missing files, changed bytes, failed/unexecuted results and missing coverage.
- `node tests/targeted-application-strategy/full-acceptance.cjs`: exit 0 on the frozen final source; all 14 relocated suites exited 0, including real upstream Windows persistence and the 14 semantic handoff replays. All 48 coverage entries resolved to executed assertions and applicable host observations.
- `node tests/targeted-application-strategy/full-acceptance.cjs --smoke`: exit 0 on the same frozen source; relocated integration exited 0.
- `node tests/privacy/check-repository.cjs private/cv-facts.json`: exit 0 at the repository root; 210 shareable paths checked against runtime identifiers, including working tree and index. Candidate contents were not copied or logged.
- Fresh report verification checked both manifests against the current working files and every command result; the full report also passed coverage verification. Both reports bind 13 runtime assets and 29 test assets. The independent semantic baseline still matches all 13 runtime hashes and contains 14 observed handoffs.

The full report SHA-256 is `1c1e7cd0c1759f863ed9b7953c4d979c0511c2d8bee8a9652871cefbf89b63fa`; the smoke report SHA-256 is `8b8d1730ac05ea3977cca6070d85bdc61e4421bff48bc853fa864721e4a59de1`. These identify this observed run, not future reruns. Earlier diagnostic runs passed their suites but exited 1 at the final hash guard after coverage edits; they are not acceptance evidence. No runtime assets or reviewed semantic observations were changed.

Review remediation added an exact suite-inventory gate. Its RED run exited 1 with `Missing expected exception` when the full report omitted foundation, contracts and harness tests. After the fix, unit controls passed for both valid modes and rejected missing, duplicate, unexpected, cross-mode, absent-mode and unknown-mode inputs. The full and smoke results and report hashes above are from the subsequent frozen corrected source, with explicit mode verification. No runtime asset or semantic-baseline refresh was needed.

## Current contract 1.1 correction gate

The task 6.3 results above describe the historical 1.0 implementation. Task 11 uses the same canonical full and smoke commands with an expanded explicit inventory: 17 strategy suites and seven document-consumer suites. Current reports are written under ignored `outputs/context-validation/`; both schema archives relocate alongside current assets. The full coverage manifest retains 48 criteria and adds 20 correction assertion links.

Current canonical semantic acceptance rebuilds selected sources under 1.1 and uses `semantic-cases/host-review-v1.1.json` and `observed-v1.1.json`. Original 1.0 files remain unchanged. The explicit `--record-reviewed-v1.1` option is only for construction after an actual fresh host review, never for suppressing a replay mismatch. Rebuilt handoffs, independent source selections and bindings are retained in ignored `outputs/context-validation/semantic-handoffs/` within the executing tree. Contextual judgments and their evidence limits are documented in [context-review-v1.1.md](semantic-cases/context-review-v1.1.md).

The document consumer suites exercise current metadata, archives, composition, language pairs, refresh, current strategy consumption and the real 96-claim acceptance assembly. Live WordCraft receipt paths and credentials are not forwarded into relocation. These suites establish upstream integration only; M3 still owns actual document acceptance. The [current validation report](../../.kiro/specs/targeted-application-strategy/application-context-validation.md) records the final gate and remaining review obligations.
