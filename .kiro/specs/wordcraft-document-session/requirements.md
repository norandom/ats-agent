# Requirements Document

## Introduction

Applicants and operators use the existing desktop-connected WordCraft MCP to create, read, edit and save application documents. Synthetic live probes have demonstrated creation, targeted text replacement, read-back, saving and reopening. M1 turns that working flow into a reusable skill contract with operation-level verification.

## Project Description (Input)

Establish and demonstrate a WordCraft document session that can create, inspect, edit, save, reopen and export synthetic DOCX documents while preserving their identity and manual edits. Report unavailable or unverified operations explicitly, retain private work when blocked, and reconcile uncertain writes before retrying. WordCraft is the sole final DOCX authoring engine.

## Boundary Context

- **In scope**: verified capability and setup reporting; document selection and identity; creation, reading, controlled editing, persistence, reopening and export; stale-state handling; manual-edit preservation; uncertain-write recovery; truthful inspection results; synthetic acceptance evidence.
- **Out of scope**: candidate facts and canonical-profile updates; employer analysis; CV styling and DIN layout; diagnostic rubrics; refinement question sequencing; packaging and release; replacement application implementation.
- **Adjacent expectations**: later document and refinement workflows supply the selected document, requested content change and destination. They consume this feature's demonstrated operations, limitations and document/check status. Document edits do not authorize changes to canonical candidate facts. Rendering and extraction use available WordCraft MCP capabilities; unavailable checks remain not assessed.
- **Evidence status at requirements generation**: WordCraft capabilities, setup, tool schemas, versions and operation semantics remain unverified. No live WordCraft probe or synthetic execution is required to generate these requirements. Acceptance evidence below is a future delivery obligation, not a claim of completion. Capability verification is required before freezing dependent document/session designs. Capability-verification probes may exercise unverified operations with synthetic content; the demonstrated-support gate applies to dependent application work, not to the probe needed to establish support.

## Requirements

### Requirement 1: Capability and setup evidence

**Objective:** As an operator, I want an evidence-based capability report, so that I can distinguish usable operations from unresolved integration assumptions.

#### Acceptance Criteria

1. When a document session is prepared, the document session shall report the verification status of creation, document selection/opening, reading, targeted editing, saving, reopening, export, rendering and text extraction.
2. When reporting an operation's status, the document session shall distinguish demonstrated support, demonstrated failure or unsupported behavior, unavailable access, and behavior that has not been verified.
3. When an operation is reported as demonstrated, the document session shall identify the observed tool and input contract, tested format, relevant environment/version information when available, and execution evidence supporting that status.
4. If an operation required for dependent application work lacks demonstrated support, the document session shall identify that operation as a blocker to that work rather than claim completion.
5. When setup instructions are supplied, the document session shall identify the actual source and verified setup details, including package identity, launch invocation and version where applicable, and mark unresolved prerequisites or licensing conditions as unverified instead of supplying guessed commands or compatibility claims.

### Requirement 2: Document identity and lifecycle

**Objective:** As a user, I want to work on an identifiable document across operations, so that changes and exported results belong to the intended application.

#### Acceptance Criteria

1. When creation is requested and its required capabilities are demonstrated, the document session shall create the requested document through WordCraft and report a reference that identifies the created document for subsequent operations.
2. When an existing document is selected, the document session shall establish and report its identity before applying changes.
3. If the intended document cannot be identified unambiguously, the document session shall withhold changes and request resolution of the document selection.
4. When a document is read or reopened, the document session shall report its current readable content and whether its identity matches the selected document.
5. When a save or export is requested, the document session shall report the outcome, the resulting artifact or destination when confirmed, and its relationship to the selected document.
6. If persistence or export cannot be confirmed, the document session shall report that limitation without claiming that an artifact was saved or exported successfully.
7. When the application workflow starts authoring a CV or cover letter, the document session shall open or raise WordCraft in the foreground and bind MCP authoring to the displayed desktop document, identifying the active document when switching documents or languages; subsequent user focus changes shall be respected rather than repeatedly overridden.

### Requirement 3: Controlled changes and preservation

**Objective:** As a user, I want a requested edit to affect the intended content, so that my document and unrelated manual work remain intact.

#### Acceptance Criteria

1. When an edit is requested, the document session shall inspect the current selected document and establish the intended target and scope before changing it.
2. When applying an edit, the document session shall preserve the selected document's identity and content and formatting outside the requested scope.
3. If the requested edit target is missing or ambiguous, the document session shall leave the document unchanged and explain the unresolved target.
4. When an edit has been applied, the document session shall read back the affected content and report the substantive change and verification outcome.
5. If required inspection, targeted modification or read-back is unavailable, the document session shall retain the requested change as private pending work and identify the missing capability rather than replace the document or claim a verified edit.

### Requirement 4: Stale state and manual-edit conflicts

**Objective:** As a user, I want intervening edits respected, so that automated refinement does not silently overwrite my work.

#### Acceptance Criteria

1. When the current document differs from the state on which a pending edit was based, the document session shall report the intervening change before applying that pending edit.
2. If an intervening change overlaps the requested edit or makes its target uncertain, the document session shall preserve the current document and request a decision on the conflicting change.
3. When an intervening manual change does not conflict with the requested edit, the document session shall preserve that manual change in the resulting document.
4. If the session cannot establish whether its edit preconditions still hold, the document session shall stop the affected edit and report the uncertainty rather than silently overwrite potentially newer content.

### Requirement 5: Uncertain writes and unavailable access

**Objective:** As a user, I want recoverable failures handled without duplicate changes or loss of pending work, so that interrupted sessions remain trustworthy.

#### Acceptance Criteria

1. If a create, edit, save or export attempt returns an uncertain outcome, the document session shall mark the outcome as uncertain rather than label the operation successful or safely absent.
2. When considering a retry after an uncertain write, the document session shall inspect the affected document or resulting artifact to determine whether the intended effect already occurred before repeating the operation.
3. If the intended effect is confirmed after an uncertain write, the document session shall report the recovered outcome without repeating that effect.
4. If inspection cannot resolve an uncertain write, the document session shall retain the uncertainty and pending intent, withhold automatic repetition, and explain what information or access is needed to continue.
5. If WordCraft access becomes unavailable, the document session shall preserve private draft and pending-change state and report the missing access without substituting another final authoring engine.
6. When access is restored, the document session shall re-establish the selected document's identity and current state before resuming pending changes.

### Requirement 6: Honest inspection results

**Objective:** As an operator, I want the checks actually performed to be visible, so that document quality claims match available evidence.

#### Acceptance Criteria

1. When reporting rendering, content extraction or reading-order checks, the document session shall distinguish executed checks and their evidence from unavailable, failed or unexecuted checks.
2. If a check could not be executed, the document session shall label it not assessed rather than passing it by default.
3. When inspecting content, structure or rendered output, the document session shall use available WordCraft MCP tools and identify the tool, check and document state examined; unavailable checks shall not introduce another service or UI-automation dependency.
4. When inspection evidence concerns an earlier document state, the document session shall identify that limitation rather than present it as verification of later edits.
5. When presenting rendered output or extracted text, the document session shall limit its conclusions to the checks performed and shall not present visual inspection alone as proof of ATS compatibility.

### Requirement 7: Synthetic milestone acceptance proof

**Objective:** As an operator, I want reproducible evidence of the supported lifecycle and its limits, so that downstream work starts from a proven document contract.

#### Acceptance Criteria

1. When M1 document-session acceptance is evaluated, the document session shall provide execution evidence from a synthetic document showing creation, read-back, a controlled edit, save, reopen and DOCX export with identity and content continuity.
2. When manual-edit preservation is evaluated, the document session shall provide before/after evidence that an intervening manual change is detected and retained, including a conflicting-change case that does not silently overwrite the change.
3. When uncertain-write recovery is evaluated, the document session shall provide evidence that an uncertain outcome is inspected before retry and does not produce a duplicate effect, with unresolved uncertainty reported as blocked.
4. When unavailable-capability behavior is evaluated, the document session shall provide evidence that missing capabilities are reported and dependent work remains blocked without an alternative final authoring engine.
5. When acceptance evidence is recorded, the document session shall use synthetic content unrelated to private candidate profiles and exclude real candidate data, private reference documents and machine-specific personal defaults from committed evidence.
6. If a required acceptance scenario has not been executed successfully, the document session shall identify it as pending, failed or blocked and shall not report the document-session milestone as accepted.
7. When live authoring is evaluated, the document session shall demonstrate MCP-driven creation and editing of synthetic CV and cover-letter content in the visible desktop documents, with content read-back and saved-artifact identity; headless generation followed by opening the resulting file shall not count as this evidence.

## User-directed clarification

On 26 October 2026 the user explicitly requested foreground live authoring for CVs and cover letters in the skill flow. Criteria 2.7 and 7.7 capture that instruction. Earlier requirements approval remains recorded; this clarification does not approve a session design, implementation tasks or unexecuted capability claims.

### Existing-MCP scope confirmed by the user

The user confirmed that WordCraft MCP handles document creation, selection, editing, reading, inspection and saving, with no other services. Content read-back uses get_text and structural inspection uses inspect_document where available. The desktop-connected CLI is the chosen interface; a custom bridge, fork or UI-automation dependency is outside scope.

Criteria 5.2 through 5.4 govern retries initiated by the skill after an observed uncertain result. They do not promise exactly-once delivery inside the external CLI. Criterion 7.3 tests skill-level inspect-before-retry behavior and reports transport limits separately. Successful ordinary calls remain usable; an ambiguous operation pauses the affected change for inspection.

Criteria 4.1 through 4.4 require fresh inspection and preservation of observed intervening changes, not a native lock against simultaneous typing. Use short sequential edit turns; withhold an edit when the current target cannot be established. This user-directed clarification removes the custom-bridge and native compare-and-swap prerequisites without claiming those capabilities exist.
