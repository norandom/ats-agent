# Brief: portable-candidate-profile

## Problem
Applicants need reusable career data that can be supplied to a distributable skill without personal information embedded in the skill.

## Current State
This is a new milestone boundary split from the initialized targeted-cv-skill umbrella. Shared research and user decisions remain in that directory. A candidate schema and blank template already exist as preliminary inputs; the legacy Python scorer is still present. No milestone implementation or phase approval is implied.

## Desired Outcome
A new user can provide their own structured facts file, validate it, and retain sourced corrections without changing skill instructions.

## Approach
Deliver M1 scope as a reusable skill capability, governed by project steering. Use the existing evidence/source register and user-confirmed decisions. Specify observable contracts before implementation; preserve judgment in persuasive writing and explicit invariants in data handling.

## Scope
### In
- Versioned candidate JSON schema, blank intake template and schema migration policy.
- Intake from supplied CV text/documents, claim/source identifiers, unknown values and review questions.
- Explicit runtime input path and task-specific completeness checks; never infer identity from the host.
- Candidate fact-update contract: propose additions/corrections, record user authorization, preserve source history, reject invalid writes.
- Separate candidate facts from application-specific language, country, offer and document state.

### Out
- Offer interpretation, scoring definitions, question prioritization and document composition.
- WordCraft session handling and release packaging.

## Boundary Candidates
- Versioned candidate JSON schema, blank intake template and schema migration policy.
- Intake from supplied CV text/documents, claim/source identifiers, unknown values and review questions.
- Explicit runtime input path and task-specific completeness checks; never infer identity from the host.

## Out of Boundary
Do not redefine upstream-owned contracts. Any new dependency or ownership change must update the roadmap before downstream implementation.

## Upstream / Downstream
- **Upstream**: none; existing project decisions are inputs.
- **Downstream**: targeted-application-strategy, live-application-refinement, portable-skill-release.

## Existing Spec Touchpoints
- **Extends**: no active feature spec; this replaces part of the targeted-cv-skill umbrella's intended scope.
- **Adjacent**: see roadmap ownership and dependencies. The umbrella is historical/shared context, not a second implementation owner.

## Milestone Acceptance Evidence
- Two unrelated synthetic candidates use the same instructions and schema without identity leakage.
- Invalid data, duplicate IDs, broken source references and missing required generation inputs yield actionable messages.
- A user-approved factual correction updates only the selected profile; a document-only edit does not mutate it.
- Unknown dates, credentials and proficiency levels remain unknown; intake never silently invents them.

## Open Design Investigations
- Review the initial generic schema for genuinely optional fields, date precision, source statuses and backwards compatibility.
- Choose a source-preserving update representation and validation approach without introducing maintained Python application code.

## Constraints
No personal data in committed instructions or distributable assets. German/English target output; WordCraft MCP authors final DOCX; blue/no photos; DIN 5008 letters for Germany in either language. No maintained Python application. Keep professional source support distinct from editorial judgment and user preferences. Candidate examples are synthetic and unrelated to private profiles.

## Kiro Status
Discovery brief only. Next: initialize, generate requirements, review requirements, design, review design, tasks, review tasks, implementation and validation. No automatic approval or implementation readiness.
