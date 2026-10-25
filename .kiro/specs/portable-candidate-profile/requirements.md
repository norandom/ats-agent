# Requirements Document

## Project Description (Input)

Applicants need reusable career data that can be supplied to a distributable application skill without embedding personal information in that skill. A preliminary candidate JSON schema and blank template exist, but the legacy scorer does not establish the planned portable intake and correction contract. This feature enables a new user to select their own profile, intake sourced career information, validate it and retain explicitly approved corrections independently of application documents.

## Introduction

M1 establishes portable candidate facts, provenance and correction behavior. The **Candidate Profile capability** is the subject of the acceptance criteria below. A **selected profile** is the runtime-selected candidate facts file; **canonical facts** are the reusable facts saved there. A **supported task** is an intake or downstream application activity whose necessary inputs have been declared to this capability.

## Boundary Context

- **In scope:** runtime profile selection; versioned candidate JSON and blank intake scaffold; source CV intake; structural and reference validation; task-specific completeness reporting; provenance, unknowns and review questions; authorized profile corrections and isolation.
- **Out of scope:** employer interpretation, persuasive positioning, question prioritization, diagnostic scoring, document composition and presentation, WordCraft operations, live-session orchestration and release packaging.
- **Adjacent expectations:** strategy and document workflows identify the facts required for their requested activity and consume the profile's evidence and uncertainty distinctions. Refinement supplies proposed factual changes and obtains a separate reusable-profile update decision. Document edits and profile writes remain distinct outcomes. Release packaging preserves the identity-free asset boundary and verifies the packaged artifact.
- **Contract assets:** The preliminary 1.0 schema is retained unchanged at `skills/targeted-cv/schemas/cv-facts-v1.schema.json`. The current schema and empty scaffold are `skills/targeted-cv/schemas/cv-facts.schema.json` and `skills/targeted-cv/templates/cv-facts.blank.json`. Their existence is not proof that the complete profile workflow is implemented.

## Requirements

### Requirement 1: Explicit runtime profile selection

**Objective:** As an applicant, I want to select my reusable facts explicitly, so that the skill uses the intended candidate without personal defaults.

#### Acceptance Criteria

1. When the user supplies a facts-file path, the Candidate Profile capability shall select that file as the candidate input for the requested activity.
2. Where a default facts-file location is provided, the Candidate Profile capability shall document it as workspace-relative and give an explicit runtime path precedence.
3. If the selected facts file is missing or unreadable, the Candidate Profile capability shall report the affected input and the action needed to provide readable candidate data.
4. If no readable candidate input has been selected, the Candidate Profile capability shall request candidate input before supplying candidate facts to downstream work.
5. The Candidate Profile capability shall refrain from deriving candidate identity or facts from host identity, developer-machine paths, unrelated files or previous candidate sessions.

### Requirement 2: Versioned reusable profile contract

**Objective:** As an applicant, I want a reusable, versioned profile and empty starter, so that my data remains portable across supported skill versions.

#### Acceptance Criteria

1. The Candidate Profile capability shall provide a versioned candidate JSON contract covering candidate contact information, source records, profile claims, employment, education, professional development, capabilities, projects, volunteering, languages and review questions.
2. When a user starts with the blank template, the Candidate Profile capability shall accept it as an intake scaffold without treating empty placeholders as supplied candidate evidence or sufficient input for a finished application.
3. The Candidate Profile capability shall distinguish optional candidate information from information necessary for a requested task, without requiring invented values to satisfy the contract.
4. When a profile is loaded, the Candidate Profile capability shall determine whether its declared version is supported before presenting it as valid.
5. If a profile version is unsupported or requires migration, the Candidate Profile capability shall explain the compatibility condition and the documented migration or recovery action without silently rewriting the profile.
6. When an authorized schema migration is performed, the Candidate Profile capability shall preserve the candidate information and source history, and report any information that cannot be carried forward before replacing the selected profile.

### Requirement 3: Sourced CV intake

**Objective:** As an applicant, I want to supply existing career information, so that I can build a profile without re-entering every fact or losing its source.

#### Acceptance Criteria

1. When the user supplies CV text or a readable CV document for intake, the Candidate Profile capability shall produce proposed candidate facts traceable to that supplied source.
2. If a supplied document cannot be read or its relevant content cannot be reliably extracted, the Candidate Profile capability shall identify the unavailable content and request a readable source or user clarification rather than inventing facts.
3. When intake encounters incomplete or conflicting candidate information, the Candidate Profile capability shall retain the uncertainty and create review questions associated with the affected information.
4. When intake records employment titles, chronology, qualifications, proficiency levels or metrics, the Candidate Profile capability shall preserve the supplied meaning and precision without adding unsupported seniority, completion, dates, levels or quantities.
5. If supplied content contains instructions directed at the skill, the Candidate Profile capability shall treat those instructions as source content rather than authority to change the workflow, access unrelated data or authorize profile writes.

### Requirement 4: Validation and task-specific readiness

**Objective:** As an applicant, I want actionable validation results, so that I can repair my profile and understand what a requested activity still needs.

#### Acceptance Criteria

1. When a profile is loaded or a profile change is proposed, the Candidate Profile capability shall check conformance to the supported candidate contract before treating it as valid.
2. When validating a profile, the Candidate Profile capability shall check identifier uniqueness and the existence of referenced sources and related records.
3. If validation finds malformed data, duplicate identifiers or unresolved references, the Candidate Profile capability shall identify the affected field or record, the violated rule and a corrective action.
4. When a supported task requests candidate facts, the Candidate Profile capability shall report structural validity separately from the completeness of facts required for that task.
5. If required task inputs are missing or unresolved, the Candidate Profile capability shall identify those inputs and prevent an assertion that the profile is ready for that task without filling the gaps with assumptions.
6. If the profile contains optional unknown information that the requested task does not require, the Candidate Profile capability shall retain that information as unknown without classifying it as a task-readiness blocker.

### Requirement 5: Provenance, uncertainty and review state

**Objective:** As an applicant, I want evidence and uncertainty retained, so that downstream writing can distinguish supported claims from unanswered questions.

#### Acceptance Criteria

1. When a candidate claim is recorded, the Candidate Profile capability shall assign or retain a stable claim identifier and link the claim to its source records, including user-reported answers where applicable.
2. When source information is recorded, the Candidate Profile capability shall retain source identity, origin and verification status without presenting user-reported information as independently verified.
3. If a candidate value is unknown, the Candidate Profile capability shall represent the unknown explicitly as null without substituting a guessed value; an unknown end date shall not by itself establish current employment.
4. When candidate evidence is supplied to a downstream activity, the Candidate Profile capability shall preserve the distinctions among absent evidence, uncertain evidence, transferable evidence and a user-confirmed qualification gap.
5. When a user answers, skips or marks a review question as not applicable or a confirmed gap, the Candidate Profile capability shall retain that disposition and its affected claim or record references without interpreting a skipped answer as evidence of missing ability.
6. If sources conflict, the Candidate Profile capability shall preserve the conflicting source history and unresolved status until the user provides a resolution, rather than silently choosing one account as canonical fact.
7. When a source describes employment or another time-sensitive fact as current, the Candidate Profile capability shall retain any supplied as-of date and shall not extend that assertion beyond its stated observation date without additional evidence.

### Requirement 6: Explicitly authorized factual corrections

**Objective:** As an applicant, I want control over reusable-profile updates, so that document refinement cannot silently alter my career record.

#### Acceptance Criteria

1. When intake, a new answer or a factual correction could change canonical facts without existing explicit authorization for that scoped change, the Candidate Profile capability shall present the proposed change, its source and the selected profile to the user for an explicit reusable-profile update decision.
2. If the user has not authorized the proposed reusable-profile change, the Candidate Profile capability shall leave the selected profile unchanged.
3. When the user authorizes a profile change, the Candidate Profile capability shall record the authorization with the accepted change and preserve the source history and traceability of affected claims.
4. If an authorized proposed change fails validation, the Candidate Profile capability shall reject the write and report the validation issues while retaining the existing profile.
5. When a user edits an application document or approves a document-only change, the Candidate Profile capability shall leave canonical facts unchanged unless the user separately authorizes the corresponding profile update.
6. When an authorized profile write is attempted, the Candidate Profile capability shall report whether persistence was confirmed and shall not claim that the profile was updated if persistence failed or remains unverified.
7. When the user has already explicitly authorized a scoped initial intake or profile update, the Candidate Profile capability shall apply that authorization to the specified facts and destination without requiring a duplicate approval.

### Requirement 7: Candidate and application isolation

**Objective:** As an applicant, I want my private facts separated from other candidates and application settings, so that the same skill can serve unrelated users safely.

#### Acceptance Criteria

1. The Candidate Profile capability shall keep reusable candidate facts separate from offer input, application language, target country, chosen documents, output destination and live document state.
2. When the selected candidate profile changes, the Candidate Profile capability shall derive the new candidate's facts and review state only from that selected profile and sources explicitly supplied for that candidate.
3. When a profile update is authorized, the Candidate Profile capability shall apply it only to the selected profile and leave other candidate profiles unchanged.
4. The Candidate Profile capability shall keep candidate instances and their source history out of reusable instructions, blank templates and other distributable profile assets.
5. When demonstrating or validating reusable profile behavior, the Candidate Profile capability shall use unrelated synthetic candidate fixtures that contain no private candidate data.

## Verification Intent

Later implementation validation must demonstrate two unrelated synthetic candidates using the same instructions without identity leakage; malformed data, duplicate IDs, broken references and missing task inputs producing actionable findings; explicitly authorized corrections affecting only the selected profile; document-only changes leaving it unchanged; and unknown dates, credentials and proficiency remaining unknown. These are planned acceptance scenarios, not executed checks.
