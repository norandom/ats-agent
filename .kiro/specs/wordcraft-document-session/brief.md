# Brief: wordcraft-document-session

## Problem
The existing desktop-connected WordCraft MCP supports the requested live editing and read-back flow. This specification defines the reusable session protocol around that interface.

## Current State
This is a new milestone boundary split from the initialized targeted-cv-skill umbrella. Shared research and user decisions remain in that directory. A candidate schema and blank template already exist as preliminary inputs; the legacy Python scorer is still present. No milestone implementation or phase approval is implied.

## Desired Outcome
A documented and demonstrated WordCraft capability contract supports stable document creation, inspection and controlled edits, with explicit limits.

## Approach
Deliver M1 scope as a reusable skill capability, governed by project steering. Use the existing evidence/source register and user-confirmed decisions. Specify observable contracts before implementation; preserve judgment in persuasive writing and explicit invariants in data handling.

## Scope
### In
- Discover actual connected WordCraft tools, schemas, supported formats, local setup and version details.
- Demonstrate synthetic DOCX create/open/read/update/save operations and stable document identification.
- Specify edit preconditions, stale-state/manual-edit detection, safe retry behavior and recovery after uncertain writes.
- Determine available WordCraft MCP rendering and extraction capabilities; mark unavailable checks not assessed.
- Document verified uv/uvx setup where applicable; do not guess a package or launch command.

### Out
- Candidate facts, employer analysis, CV styling, DIN layout and scoring policy.
- Loop-level question sequencing and marketplace distribution.

## Boundary Candidates
- Discover actual connected WordCraft tools, schemas, supported formats, local setup and version details.
- Demonstrate synthetic DOCX create/open/read/update/save operations and stable document identification.
- Specify edit preconditions, stale-state/manual-edit detection, safe retry behavior and recovery after uncertain writes.

## Out of Boundary
Do not redefine upstream-owned contracts. Any new dependency or ownership change must update the roadmap before downstream implementation.

## Upstream / Downstream
- **Upstream**: none; existing project decisions are inputs.
- **Downstream**: wordcraft-application-documents, live-application-refinement, portable-skill-release.

## Existing Spec Touchpoints
- **Extends**: no active feature spec; this replaces part of the targeted-cv-skill umbrella's intended scope.
- **Adjacent**: see roadmap ownership and dependencies. The umbrella is historical/shared context, not a second implementation owner.

## Milestone Acceptance Evidence
- A synthetic document is created, read back, edited and reopened using actual tools with evidence of identity and content continuity.
- A manual change is detected/preserved; an uncertain write is inspected before retry rather than duplicated.
- Unavailable capabilities are explicitly classified; no fallback replaces WordCraft as authoring engine.
- The downstream design names only demonstrated operations; missing essential live-edit capability is a visible blocker.

## Open Design Investigations
- Basic desktop MCP creation, targeted editing, reading and persistence are demonstrated; validate remaining operation contracts before relying on them.
- Check applicable server/tool licensing and setup requirements from its actual source; do not assume ecosystem compatibility.
- Use WordCraft MCP for rendering and extraction where available; do not introduce another service or UI-automation dependency.

## Constraints
No personal data in committed instructions or distributable assets. German/English target output; WordCraft MCP authors final DOCX; blue/no photos; DIN 5008 letters for Germany in either language. No maintained Python application. Keep professional source support distinct from editorial judgment and user preferences. Candidate examples are synthetic and unrelated to private profiles.

## Kiro Status
Discovery brief only. Next: initialize, generate requirements, review requirements, design, review design, tasks, review tasks, implementation and validation. No automatic approval or implementation readiness.
