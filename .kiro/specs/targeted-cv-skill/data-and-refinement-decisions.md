# Portable data and interactive refinement

User direction recorded 2026-10-25. Requirements/design remain to be generated and reviewed.

## Structured data boundary
- Current 2.0 candidate input is JSON conforming to `skills/targeted-cv/schemas/cv-facts.schema.json`. A reusable empty starter is `skills/targeted-cv/templates/cv-facts.blank.json`.
- Existing 1.0 inputs retain their validator at `skills/targeted-cv/schemas/cv-facts-v1.schema.json`; relocation does not migrate private instances.
- The current private instance is `private/cv-facts.json`. The skill accepts an explicit facts-file path at runtime, with a workspace-relative default only; no machine-specific absolute paths or personal defaults.
- No candidate name, contact, employer history, qualification or metric may appear in skill instructions, templates, manifests, committed fixtures or release bundles. No identity may be inferred from the environment or remembered from a previous candidate.
- Source records and stable claim IDs preserve provenance. Unknowns are null; arrays distinguish employment, qualifications, capabilities, projects and open questions.
- A blank file is a valid intake scaffold, not sufficient input for a finished application. Validate structure, unique IDs and source references; then check task-specific completeness.
- User answers add sourced facts or resolve questions; document edits alone do not silently change the canonical data. Ask whether factual corrections should update the reusable profile.
- Keep application settings separate from candidate facts: offer input, output language, target country, selected documents and output destination.

## Live refinement in WordCraft
- Begin with employer needs and the evidence available. Distinguish absent documentation, uncertain evidence, transferable evidence and a user-confirmed qualification gap.
- Ask a small set of high-value questions at a time: missing required qualifications, relevant examples, outcomes, scale, leadership scope and useful adjacent experience. Do not repeatedly ask about a confirmed gap or fabricate a qualification to improve fit.
- Explain why a question matters to the offer. Accept “not applicable,” “do not have it,” and “skip”; continue with honest positioning and remaining gaps.
- Create and refine the actual WordCraft document. Inspect its current state before changes, retain document identity and preserve manual user edits. Capability discovery must verify whether targeted edits and read-back are supported.
- After a refinement pass, summarize substantive edits, remaining gaps and score changes with reasons. Stop when the user accepts, declines further refinement or no useful supported improvement remains.
- If WordCraft is unavailable, preserve private draft state and identify the missing connection; do not silently substitute a different output engine.

## Scores requested by user
Provide transparent diagnostic scores rather than an asserted proprietary ATS score or hiring probability. Design must define and expose each rubric, weighting, denominator and uncertainty treatment before using it.

Candidate dimensions: job-requirement coverage, evidence strength, employer relevance/appeal, and document readability/extraction. Missing evidence must not be scored as proof of missing ability. Separate subjective editorial assessments from checks actually executed. Mark unavailable checks “not assessed,” never award a passing score by default. Show before/after differences on a stable rubric; if requirements or weighting change, explain that the scores are not directly comparable.

Scoring must direct useful questions and edits, not reward keyword stuffing or unsupported claims. No numerical thresholds have been agreed yet.

## Separate skill distribution using the sibling ecosystem
Inspected local `../Skills`: versioned skill folders with SKILL.md; build.sh/lib.sh bundle support; build-marketplace.ps1/lib.ps1; .marketplace/skills.json and templates for portable/Codex/Claude/Gemini packages.

Reuse these conventions in this separate repository; do not move this skill into the sibling repository or modify its catalog without a separate request. The packaged skill must run without the sibling checkout. Package only an explicit skill subtree and approved assets; never bundle the entire repository. Exclude private/, examples/, outputs/, local paths, candidate instances and reference documents supplied for private review. Validate archive contents, not just Git ignore rules: the inspected ecosystem uses recursive copies of skill source directories.

The actual SKILL.md, manifests, build integration and live WordCraft behavior are still implementation work, not completed by these notes.
