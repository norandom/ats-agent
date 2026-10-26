# Feature validation: portable candidate profile

Date: 2026-10-26. Decision: **GO** within the approved profile boundary.

All 14 executable tasks passed independent task review. Final feature review found no blocking issue in the contracts, dependency direction, asset layout or integration. Requirements coverage is 7/7 sections and 41/41 acceptance criteria. Task 5.4 was committed as `f3a8669`.

## Executed evidence

- `node tests/portable-candidate-profile/full-acceptance.cjs`: independent final-driver execution exited 0; 11 top-level suites and 62 named observations. Intake, correction and lossless migration ran from seven byte-identical assets copied outside the checkout. Nested persistence and migration suites execute once through their acceptance runner.
- `node tests/portable-candidate-profile/full-acceptance.test.cjs`: evidence and dependency controls passed; missing, incomplete or mismatched observations cannot satisfy coverage.
- `node tests/portable-candidate-profile/full-acceptance.cjs --smoke`: fresh controller and feature-review runs exited 0. Copied blank selection, version dispatch and actual pinned schema/semantic validation passed; readiness remained not assessed without a task request.
- The feature reviewer checked the successful full-suite report against current hashes for all seven runtime assets, 23 test files and the fictional legacy fixture. The expensive full suite was independently executed once for final review, not rerun merely to restate the same result.
- Placeholder and credential scans were clean after inspection; the generation-token test variable is not a credential. Repository privacy scanning passed before the task commit.

Detailed synthetic run evidence remains ignored under `outputs/profile-tests/full-acceptance-dX6uaS/`. The public requirement-to-observation mapping and reproducible commands are in [scenarios.md](../../../tests/portable-candidate-profile/scenarios.md). This report contains no candidate data.

## Integration and design assessment

Selection, version dispatch, validation, private evidence handoff, scoped decisions and verified persistence agree across the four reference protocols. Selection changes invalidate pending evidence and authority. Application settings remain separate. Source history, unknowns, conflict alternatives and original migration data are retained. The documented layout and dependency direction match the design. There are no blocked profile tasks.

The profile flow has no runtime dependency on the legacy scorer, WordCraft, a sibling checkout, an additional model service or a replacement application. Final skill entrypoint and distribution remain release work.

## Limits and next boundary

Source interpretation is host-reviewed synthetic evidence, not an automated prose-parser or source-authentication guarantee. Filesystem execution verifies isolated Windows replacement and protected-DACL behavior. A real destination still requires the documented writer-exclusion and applicable security assurances; otherwise writes defer. Unavailable checks do not become passes.

No personal profile migration, release archive or downstream document workflow is included in this GO decision. M1 still needs the WordCraft session contract. The profile result enables strategy requirements; schema, evidence or update-contract changes require downstream revalidation.
