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
