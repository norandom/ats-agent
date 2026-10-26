# Roadmap

Updated 2026-10-26. Portable candidate profile validated GO (14 tasks, 41 acceptance criteria). M1 remains incomplete pending the WordCraft session contract.

## Overview
Replace the legacy CV scorer with a separately distributable skill that reads private structured candidate data, interprets a pasted offer, develops an employer-oriented contribution argument, and creates/refines German or English application documents live in WordCraft MCP. Evidence constrains claims without dictating the narrative. Transparent diagnostics guide questions and improvements.

## Approach Decision
- **Chosen**: five delivery milestones across six focused feature specs. The first milestone establishes candidate-data and WordCraft contracts independently; subsequent milestones integrate them into a usable application workflow.
- **Why**: verify the largest integration uncertainty early, assign one owner to each shared contract and preserve end-to-end checks of employer appeal.
- **Alternatives considered**: retain one large spec (simpler indexing, but intertwined data/scoring/document/release obligations); separate specs for every language/template/score (more parallelism, but duplicated contracts and fragmented acceptance). Neither is selected.
- User authorized milestone decomposition after discussing the workflow. This does not constitute approval of requirements, design, tasks or implementation.

## Scope
- **In**: portable facts intake; employer analysis and ontology alignment; focused qualification/evidence questions; transparent scores; WordCraft CV/cover-letter generation and live refinement; bilingual presentation; DIN 5008 letters for Germany; separate skill packaging; legacy retirement.
- **Out**: job submission, recruiter messaging, psychometric diagnosis, proprietary ATS score predictions, DIN certification claims, automatic publishing, changing the sibling Skills catalog.

## Constraints
- Candidate data lives outside the distributable skill; runtime-selected JSON, never personal hardcoding. Public examples must be synthetic.
- WordCraft MCP authors final DOCX. Capability checks precede reliance on tool operations; no invented APIs or substitute authoring engine.
- German/English language is independent of target country. Germany-targeted letters follow DIN 5008 in either language.
- Blue; no photos; chosen reference family 11–13. Private screenshots inform design but are not packaged. Reading order and visual quality require actual checks.
- Use uv/uvx for applicable tools, without a maintained Python application. The existing Python code remains until replacement acceptance passes.
- Follow the sibling Skills packaging conventions while making this repository/install independent of that checkout.
- Preserve Requirements → Design → Tasks → Implementation review gates. Do not use batch fast-track by default.

## Boundary Strategy
- **Why this split**: candidate persistence, document operations, application reasoning, document presentation, iterative orchestration and distribution have different contracts and validation evidence.
- **Shared seams to watch**: profile corrections vs draft edits; strategy scoring definitions vs document check evidence; WordCraft identity/conflict handling vs live-loop state; private references vs redistributable assets.
- **Ownership**: profile spec owns schema/provenance/update semantics; session spec owns verified tool operations; strategy spec owns terminology, questions and rubrics; documents spec owns composition/layout/anchors/check results; refinement spec owns interaction/session orchestration; release spec owns distributable entrypoint integration and packaging.
- Changing a shared contract requires revalidating its direct consumers. Update this roadmap if boundaries or dependencies change.

## Specs (dependency order)
- [ ] portable-candidate-profile -- Reusable private JSON intake, validation, provenance and approved corrections. Dependencies: none
- [ ] wordcraft-document-session -- Verified WordCraft capabilities, stable document identity and safe operations. Dependencies: none
- [ ] targeted-application-strategy -- Employer positioning, terminology, question priorities and diagnostic rubrics. Dependencies: portable-candidate-profile
- [ ] wordcraft-application-documents -- Editable bilingual CVs and DIN cover letters with visual/extraction evidence. Dependencies: targeted-application-strategy, wordcraft-document-session
- [ ] live-application-refinement -- Answer-driven live edits, manual-edit preservation and score deltas. Dependencies: portable-candidate-profile, wordcraft-document-session, targeted-application-strategy, wordcraft-application-documents
- [ ] portable-skill-release -- Standalone distribution, archive privacy checks and validated legacy retirement. Dependencies: portable-candidate-profile, wordcraft-document-session, targeted-application-strategy, wordcraft-application-documents, live-application-refinement

Checkboxes above track completed specification pipelines if the batch workflow is later explicitly invoked. They do not mean implemented features. Delivery acceptance is tracked separately below.

## Delivery Milestones
| Milestone | Specs | User-visible outcome | Exit evidence |
| --- | --- | --- | --- |
| M1 — Data and engine foundation | portable-candidate-profile; wordcraft-document-session | Another person can supply their own facts; actual WordCraft operations are proven | Synthetic profile validation and isolation; synthetic DOCX create/read/edit/reopen; manual-edit and uncertain-write handling |
| M2 — Employer-oriented strategy | targeted-application-strategy | Offer produces a persuasive positioning plan, relevant questions and explainable baseline scores | Traceable claims, truthful synonyms, explicit unknowns, reviewed rubric examples and human assessment of appeal |
| M3 — First complete application | wordcraft-application-documents | CV and requested cover letter in German or English through WordCraft | Editable DOCX, checked reading order/rendering, blue/no-photo identity, verified Germany DIN letter structure |
| M4 — Live refinement | live-application-refinement | User answers questions and improves live documents with meaningful score changes | Preserved manual edits, consistent CV/letter changes, explicit profile-update choice, resume and stop behavior |
| M5 — Shareable replacement | portable-skill-release | A clean installation works for a new user; obsolete Python workflow is retired | Installed-package end-to-end checks, archive allowlist/privacy audit, license checks, standalone operation and updated instructions |

The profile half of M1 is implemented and validated; the WordCraft session design gate remains open. No complete delivery milestone or release is claimed. M2 strategy requirements are generated and reviewed, awaiting human approval before design.

## Execution Waves
1. Profile and WordCraft session specifications can proceed independently.
2. Strategy depends on the profile contract.
3. Documents combines strategy with verified document operations.
4. Live refinement integrates all preceding contracts.
5. Release validates the integrated workflow and packages it.

Actual WordCraft capability verification is a hard gate before freezing dependent document/session designs. Planning can describe an investigation without falsely treating it as a successful proof.

## Existing Spec Updates
- `targeted-cv-skill` is retained as the umbrella research/decision archive. Its original end-to-end scope is decomposed into the six specs above; it is not a seventh implementation spec. Original phase flags are preserved as historical, not used to schedule work.

## Direct Implementation Candidates
None in this discovery step. Existing schema/template/ignore changes remain preliminary inputs to M1 and M5 acceptance.

## Shared Context and Traceability
- `../specs/targeted-cv-skill/research.md`: professional and practitioner source register.
- `../specs/targeted-cv-skill/presentation-decisions.md`: visual, language and DIN decisions → documents.
- `../specs/targeted-cv-skill/data-and-refinement-decisions.md`: portability → profile/release; tool behavior → session; rubric/questions → strategy; iteration → refinement.
- `../specs/targeted-cv-skill/brief.md`: employer-first narrative and original migration scope → all milestones.
- Private input/reference files are read only by tasks that need them; never copied into committed specs or review prompts.

## Review and Next Step
An independent read-only discovery review accepted the decomposition with boundary/dependency refinements incorporated. WordCraft behavior, detailed DIN layout guidance and redistribution rights remain unverified investigations, not completed checks.

M1 status: both requirements sets were approved by the user. `portable-candidate-profile` is `tasks-generated`: design approved, task graph independently reviewed, tasks awaiting approval. `wordcraft-document-session` remains `requirements-generated`: discovery demonstrated headless MCP operations, but the live design gate found unsafe internal replay in the installed 0.10.0 GUI bridge and missing manual-edit/concurrency proof. See that spec's research.md and design-review.md. Neither feature is implementation-ready.

Next: review the portable-profile implementation tasks; resolve and verify the WordCraft live-session integration findings before finalizing its design. Generate implementation tasks only after the corresponding design is approved. The two M1 streams remain independently progressable.

`$kiro-spec-batch` is an available optional fast-track, not executed here: it automatically passes `-y` to design and tasks. Use only when that fast-track is intentionally requested.
