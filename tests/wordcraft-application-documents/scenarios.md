# Complete document acceptance

Run from the checkout through `pnpm exec node tests/wordcraft-application-documents/full-acceptance.cjs <actual-receipt.json> <independent-review.json>`. Add `--smoke` for the explicit first-usable composition smoke. On Windows use `pnpm.exe`. Both modes require actual evidence; an offline-only result cannot pass this gate.

The checked-in manifest enumerates every owned test suite, runtime asset and supporting test asset. The harness verifies exact suite membership, all 42 criterion rows, assertion references, zero failures and zero skipped tests. It copies this allowlist outside the checkout and compares both copied and source hashes after execution. The six current M3 assets and archived document schema are included alongside upstream dependencies. It uses the real pinned uvx validator and removes model credentials from child environments. This is a test relocation, not release packaging or an operating-system sandbox.

## Actual scenarios and historical receipt equivalence

The mandatory actual branch invokes `acceptance-check.cjs` against the exact selected receipt and independent review, both before and after the suite. A second replay loads the copied verifier and runtime assets outside the checkout. The original receipt and review bytes are copied unchanged. Their absolute document, PNG and upstream JSON paths remain explicitly selected external fictional evidence inputs. All consumed input hashes are recorded and rechecked. They are not portable runtime resources, and this test does not claim that the evidence archive itself has been relocated.

| Scenario | Current actual assertion and review | Controlled adverse coverage |
| --- | --- | --- |
| Current selected profile, strategy and application context | Exact upstream files, current runtime hashes and composite draft text binding | Contracts, context, composition and languages suites reject stale, unsupported or revoked inputs |
| English/German CV and Germany letter | Six actual stages, four final documents, exact body, saved/reopened bytes, editable paragraphs | Requested-only integration, missing letter and unsupported language controls |
| CV presentation | Observed paragraph marks and resolved settings; independent all-page visual review | Presentation and formatting-probe gates reject missing fields, pages and unsupported observations |
| Automatic pagination | English and German one-page baselines and expanded CVs, PAGE/NUMPAGES objects and reviewed labels on every page | Missing page/field rejection in verification and presentation |
| Reading order and factual meaning | Exact observed body and paragraph order, independent association review; host review of all 96 source-backed realizations | Mechanical omission, stale bytes and missing structure cases do not pretend to judge meaning |
| Germany letter geometry | Fourteen sourced checklist rows across the two language letters, observed geometry and every-page review | Letter and verification gates refuse command-only or unmeasured geometry |
| Visible session, switching and manual preservation | Recorded selected-session calls/intents, editable artifacts and preserved before/after manual paragraphs | Uncertain and unavailable operations remain pending in contract controls |
| Artifact evidence handoff | Current receipt bytes and revision-specific check gate | Consumer tests execute unchanged strategy review with independent observations and reject forged flags |

The current comprehensive receipt replaces optional historical presentation, verification and consumer live-receipt formats for feature acceptance. Those historical branches are not claimed as executed. Their pure rejection tests still execute. Current acceptance checks do not manufacture old-format receipts or infer a live pass from an environment variable. No new desktop mutation occurs during relocation. A separate read-only MCP liveness probe is required for final feature validation.

## Judgment and limits

The independent review covers all eight rendered PNG pages, six stages, source semantics, reading order and metadata. Replaying the review checks its exact receipt and artifact hashes; JavaScript does not independently understand prose or inspect pixels. The 42-row mapping combines named executable controls with this reviewed actual evidence. Privacy scanning and manual review, final independent implementation review, design alignment and blocked-task assessment remain controller gates before GO. No universal ATS compatibility, full normative DIN audit, refinement completion, release installation or legacy retirement is asserted.
