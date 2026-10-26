# Brief: wordcraft-application-documents

## Problem
Applicants need persuasive, editable documents that honor the selected visual identity and national letter conventions while preserving recoverable content.

## Current State
This is a new milestone boundary split from the initialized targeted-cv-skill umbrella. Shared research and user decisions remain in that directory. A candidate schema and blank template already exist as preliminary inputs; the legacy Python scorer is still present. No milestone implementation or phase approval is implied.

## Desired Outcome
A targeted CV and requested cover letter are authored live through WordCraft MCP in a visible foreground desktop session, in German or English, with checked text and layout. The user can watch drafting and request refinements to those same documents.

## Approach
Deliver M3 scope as a reusable skill capability, governed by project steering. Use the existing evidence/source register and user-confirmed decisions. Specify observable contracts before implementation; preserve judgment in persuasive writing and explicit invariants in data handling.

## Scope
### In
- Compose CV/letter content from the application strategy and evidence contract.
- Implement reusable blue/no-photo presentation based on references 11–13, without distributing private screenshots.
- Localize content, headings and dates; preserve proper names and credential meaning.
- For Germany, implement verified DIN 5008 cover-letter structure in either language; distinguish DIN 33430 methodology.
- Generate using the session contract; keep audit metadata and scores out of the submitted documents.
- Use the foreground desktop session for actual authoring; identify and display the active CV or letter when switching documents/languages. Headless generation followed by opening a finished file is not equivalent acceptance evidence.
- Inspect page balance, typography, umlauts, contacts, role/date relationships and reading order; output check evidence for the strategy rubric.
- Own editable document structure/anchors for later targeted refinement.

### Out
- Defining scoring formulas, interpreting candidate qualifications or saving profile corrections.
- Low-level WordCraft discovery and the conversational refinement loop.

## Boundary Candidates
- Compose CV/letter content from the application strategy and evidence contract.
- Implement reusable blue/no-photo presentation based on references 11–13, without distributing private screenshots.
- Localize content, headings and dates; preserve proper names and credential meaning.

## Out of Boundary
Do not redefine upstream-owned contracts. Any new dependency or ownership change must update the roadmap before downstream implementation.

## Upstream / Downstream
- **Upstream**: targeted-application-strategy, wordcraft-document-session.
- **Downstream**: live-application-refinement, portable-skill-release.

## Existing Spec Touchpoints
- **Extends**: no active feature spec; this replaces part of the targeted-cv-skill umbrella's intended scope.
- **Adjacent**: see roadmap ownership and dependencies. The umbrella is historical/shared context, not a second implementation owner.

## Milestone Acceptance Evidence
- Synthetic German and English applications preserve identical underlying facts and accurate employer-specific positioning.
- Blue/no-photo reference direction survives rendered review; the chosen column layout passes extraction/order checks or a documented revision is made.
- Germany-targeted letters in both languages pass a sourced DIN checklist; missing address/signature data is not fabricated.
- Documents reopen in WordCraft with editable text; all claimed visual/extraction checks actually ran.
- Public assets contain no candidate data, local absolute paths, private source material or unlicensed template copies.

## Open Design Investigations
- Verify exact DIN dimensions/spacing before claiming conformity; public scope alone is insufficient.
- Set typography, shades and pagination using synthetic previews and reference hierarchy.
- Resolve essential capability gaps through the upstream session spec, not undocumented alternate authoring.

## Constraints
No personal data in committed instructions or distributable assets. German/English target output; WordCraft MCP authors final DOCX; blue/no photos; DIN 5008 letters for Germany in either language. No maintained Python application. Keep professional source support distinct from editorial judgment and user preferences. Candidate examples are synthetic and unrelated to private profiles.

## Kiro Status
Requirements approved on 2026-10-26. Design generated with full discovery and independent review PASS covering all 42 criteria. Human design approval is next, followed by task generation and its approval gate. No implementation readiness is implied.
