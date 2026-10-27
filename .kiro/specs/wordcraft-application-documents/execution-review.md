# Delivery review, 27 October 2026

The work produced reusable components and actual WordCraft examples, but delayed the usable application flow. Completing infrastructure tasks was not the same as delivering the skill the user could run.

## Evidence from 26 October

Git records 39 commits between 07:46 and 19:35. That interval is not a measurement of active work or cost. The day added 21,925 lines: 14,992 in tests and harnesses, 3,972 in reusable assets, 2,900 in specifications and steering, and 61 elsewhere. Line counts describe the change mix, not its value.

The six M3 implementation commits, `f185be0` through `aa7cdcb`, span 18:20–19:35 and added 1,179 lines: 874 test/harness lines, 284 reusable reference/schema lines and 21 spec/steering lines. They delivered a verification foundation, actual formatting probes, private manifest validation, composition guidance, language consistency and refresh checks, and the CV presentation recipe. The earlier day completed profile validation and implemented strategy and document-session capabilities.

Actual WordCraft work included saved/reopened fictional English and German CVs, dynamic page fields, all-page renders and measured recipient placement. Review caught concrete defects, including a global readiness check that incorrectly blocked a supported language and incomplete environment identity evidence in session acceptance. These were useful corrections. The repeated implementation, validation and review stages nevertheless delayed visible features.

## Findings and response

1. **Usable entrypoint is deferred.** There is no `skills/targeted-cv/SKILL.md`. Release owns that entrypoint in the current design, while M3 integration is task 6. The references are useful components, not an installed complete skill. Prioritize a complete host-session path after letter presentation and the required verification boundary; reconsider deferring the thin entrypoint until distribution work. Do not claim that packaging or entrypoint integration already exists.
2. **Complete application acceptance is pending.** Tasks through 4.1 are complete. Presentation examples deliberately bypass full strategy assembly and cannot prove the entire facts-to-CV-and-letter path. Finish the actual letter and integrated request-to-delivery trace before expanding optional test infrastructure.
3. **Offline and live checks need distinct outcomes.** The presentation suite registers actual-receipt replay only when `PRESENTATION_RECEIPT` is supplied. Its default green result therefore proves only offline controls. Mandatory live acceptance must fail explicitly without its receipt and name the actual artifacts it verified. Preserve offline unit tests as a separate check.
4. **Validation should follow changes.** Reuse unchanged, hash-matched passing evidence where appropriate. Require independent review and fresh evidence for changed behavior, but avoid an additional full rerun merely to repeat another actor's current result. Show a usable document in each document-feature slice.

This review was read-only and used Git, specifications and reusable/test code. It did not inspect real candidate inputs or independently repeat yesterday's live authoring. Historical live claims above are bounded by the retained task evidence. Existing runtime contracts and approved feature requirements remain in force; this review does not silently change release ownership.

## Adopted delivery correction

Following the user's instruction to prioritize actual features, the M3 design, task 6 and steering now explicitly include a thin `SKILL.md` entrypoint. It routes completed references with relative paths; it does not introduce a second coordinator or expose unfinished refinement. Task 7 relocates six runtime assets, including this entrypoint. M5 retains distribution metadata, packaging, archive acceptance and legacy retirement. A separate read-only boundary review found no additional contract changes needed for this adjustment.
