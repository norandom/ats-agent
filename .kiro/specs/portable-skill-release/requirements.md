# Requirements Document

## Introduction

An adopter should be able to install the Targeted CV Skill, select their own private facts and job offer, and create and refine application documents without the development checkout. Maintainers need evidence that the distributed artifact delivers the validated workflow before retiring the legacy scorer.

The Targeted CV Release is the subject of the acceptance criteria. Specification language is English. Application output supports German and English independently of target country.

## Boundary context

- In scope: release identity, standalone installation, complete approved assets, package privacy and integrity, declared prerequisites, adopter instructions, redistribution rights, installed-workflow acceptance and conditional legacy retirement.
- Adjacent expectations: M1 through M4 supply candidate intake, evidence and authorization rules, application strategy, document composition, WordCraft operations and conversational refinement. Release must preserve and exercise these capabilities rather than redefine their contracts or scoring methods.
- Existing constraints: WordCraft MCP authors and inspects final documents; the host supplies reasoning. The flow is session-based, with no replacement application or model API requirement. Applicable deterministic tooling uses uv/uvx and pnpm. Windows instructions use PowerShell and Linux instructions use Bash. Build-platform support and desktop-workflow support are separate claims.
- Out of scope: new application features, job submission, recruiter messaging, automatic remote publication, sibling marketplace changes and rewriting published Git history. Real candidate data and private reference material must not enter specifications, packages or reusable acceptance examples.

## Requirements

### Requirement 1: Install a complete, identifiable skill

**Objective:** As an adopter, I want a recognizable standalone package, so that I can install the intended workflow without the author's environment.

#### Acceptance criteria

1. When preparing a release candidate, the Targeted CV Release shall identify its skill name, release version, source revision and included capability scope consistently across its distributable artifacts and release instructions.
2. When declaring installation support, the Targeted CV Release shall identify at least one supported standalone installation target and the supported ecosystem formats, distinguishing package-format compatibility from validated host and desktop operation.
3. When an adopter installs a declared distribution format, the Targeted CV Release shall provide the entrypoint and all referenced runtime resources needed for its advertised workflow without either source repository or author-specific paths.
4. When assembling a release candidate, the Targeted CV Release shall include the approved current profile, strategy, document-session, document and refinement resources, retaining any historical resources needed for supported compatibility behavior.
5. If a required resource is missing, incompatible or unresolved, the Targeted CV Release shall reject release readiness and identify the affected capability before advertising a complete installation.
6. When an adopter installs or replaces the skill, the Targeted CV Release shall keep candidate inputs, generated documents and local application state outside the replaceable package and preserve existing user files.

### Requirement 2: Verify package privacy and integrity

**Objective:** As an adopter or maintainer, I want inspectable artifacts, so that sharing the skill does not expose private material or hide changed content.

#### Acceptance criteria

1. When packaging the skill, the Targeted CV Release shall include only explicitly permitted generic assets in every declared distribution format.
2. The Targeted CV Release shall exclude real candidate information, private inputs and outputs, supplied reference documents, credentials and local configuration from packages and shareable release evidence.
3. When verifying an artifact, the Targeted CV Release shall inspect its actual entries and contents, including metadata, rather than infer privacy from Git ignore rules or a staging directory alone.
4. If an artifact contains an unexpected, missing, redirected or altered entry, the Targeted CV Release shall fail verification and identify the discrepancy without exposing private content in the report.
5. When delivering local release artifacts, the Targeted CV Release shall provide integrity information that identifies their exact bytes and their relationship to the selected source revision and package inventory.
6. When checking release reproducibility, the Targeted CV Release shall report whether repeated preparation from the same declared inputs produces the same artifact content and explain any unverified or intentionally variable output.
7. If privacy or integrity verification is incomplete or fails, the Targeted CV Release shall withhold release readiness and preserve existing private files without attempting automatic deletion or history rewriting.

### Requirement 3: Explain and check prerequisites

**Objective:** As an adopter, I want to know what my installation needs, so that I can start a session without troubleshooting undocumented services.

#### Acceptance criteria

1. When presenting setup instructions, the Targeted CV Release shall distinguish required host, file-access and WordCraft MCP capabilities from optional writing skills and maintainer-only build or test tooling.
2. When claiming a supported host and platform combination, the Targeted CV Release shall provide its tested prerequisite versions, relevant connection assumptions and the validation status of that combination.
3. When starting the installed workflow, the Targeted CV Release shall check the selected WordCraft connection through its available MCP capabilities before depending on document operations.
4. If a prerequisite or required capability is unavailable, the Targeted CV Release shall explain the affected action and recovery step, retain pending work and refrain from claiming that action succeeded.
5. The Targeted CV Release shall operate without a project-specific model endpoint or model API-key requirement, maintained Python application or background Node service, while identifying any applicable external deterministic tools separately.
6. When optional COBESY or Humanizer support is unavailable, the Targeted CV Release shall offer the documented installation or embedded-fallback choice without replacing an existing installation or treating silence as installation permission.

### Requirement 4: Prove the installed workflow

**Objective:** As an adopter, I want evidence from the distributed skill, so that checkout-only tests do not stand in for a working installation.

#### Acceptance criteria

1. When validating a release candidate, the Targeted CV Release shall exercise the actual installed artifact outside the development and sibling repositories, using only declared runtime resources and prerequisites.
2. When running installed acceptance, the Targeted CV Release shall complete the advertised facts-to-offer-to-live-document flow for two wholly fictional applicants using explicitly selected structured facts and isolated application state.
3. When validating the advertised language and document scope, the Targeted CV Release shall retain distinct editable German and English CV and Germany-market cover-letter outputs, with current source, language and document associations verified through the existing owners.
4. When exercising installed intake and strategy, the Targeted CV Release shall demonstrate missing-evidence questions, a skipped question, a concrete qualitative answer and honest diagnostic limitations through the existing workflow.
5. When exercising installed refinement, the Targeted CV Release shall demonstrate explicit application-only and reusable fact choices, confirmed persistence and preservation of unrelated manual document work through the approved contracts.
6. When reporting installed document acceptance, the Targeted CV Release shall retain actual MCP authoring, read-back, save/reopen, all-page layout, reading-order, automatic pagination and applicable letter-check evidence, together with competent meaning and visual review.
7. If installed acceptance reaches a pending member, interrupted operation or stopped session, the Targeted CV Release shall preserve the existing owner recovery and stopping rules and report partial progress without substituting checkout artifacts or simulated success.
8. When granting release readiness, the Targeted CV Release shall bind its installed acceptance and affected regression results to the exact candidate artifact, fail on missing, stale or failed mandatory evidence, and distinguish actual observations from deterministic controls and host judgments.

### Requirement 5: Guide adopters through their own application

**Objective:** As an adopter, I want instructions organized around my application, so that I can use the skill without reading the development history.

#### Acceptance criteria

1. When publishing user instructions in the candidate package, the Targeted CV Release shall explain installation, private facts, offer or role selection, questions, live documents and refinement in the order an adopter needs them.
2. When explaining data handling, the Targeted CV Release shall distinguish reusable career facts, application-only evidence, application settings and generated documents, including where user decisions and private backups belong.
3. When supplying templates or copyable examples, the Targeted CV Release shall provide valid examples for their declared contract versions, use wholly fictional content, and require explicit selection rather than treating sample facts as candidate defaults.
4. When documenting commands for a claimed platform, the Targeted CV Release shall use PowerShell on Windows and Bash on Linux and identify whether each command is for an applicant session or release maintenance.
5. When describing availability, the Targeted CV Release shall distinguish the candidate package, previously published versions and unvalidated host or platform combinations, linking development detail separately from the adopter's intended flow.

### Requirement 6: Establish redistribution and local release readiness

**Objective:** As a maintainer, I want a reviewable release candidate with clear rights and evidence, so that publication is an informed separate action.

#### Acceptance criteria

1. When including an asset in a distributable package, the Targeted CV Release shall record its applicable license or redistribution authorization and include required notices.
2. If an asset's redistribution rights or the project's release license are unresolved, the Targeted CV Release shall identify the unresolved decision and withhold release readiness rather than invent a license.
3. When referencing professional research or optional external skills, the Targeted CV Release shall distinguish references and setup links from bundled material and shall not imply permission to redistribute source publications or external skills.
4. When preparing release evidence, the Targeted CV Release shall provide reproducible local and CI validation entrypoints consistent with the project's Dagger workflow, with declared inputs, executed results and unassessed checks identified.
5. When presenting a candidate for release review, the Targeted CV Release shall summarize artifact identity, supported installation scope, installed acceptance, regression, privacy, integrity and rights results, and any remaining limitations.
6. When preparing local artifacts without a separate publication instruction, the Targeted CV Release shall leave remote releases, tags, package registries and sibling marketplace catalogs unchanged.

### Requirement 7: Retire the legacy application after replacement acceptance

**Objective:** As a maintainer, I want one supported application path, so that adopters do not follow obsolete model-API instructions after migration.

#### Acceptance criteria

1. When legacy retirement is requested, the Targeted CV Release shall require passing installed-workflow, affected regression, privacy, integrity and rights checks for the selected replacement candidate.
2. If replacement acceptance is incomplete or fails, the Targeted CV Release shall retain the legacy application and report which retirement prerequisite remains unmet.
3. When retiring the legacy application, the Targeted CV Release shall identify and remove the obsolete maintained entrypoints, application-only dependencies and tracked application examples within the approved retirement scope, while preserving ignored user inputs, reference material, documents and backups.
4. When retiring legacy functionality, the Targeted CV Release shall preserve any reused deterministic review behavior through the approved replacement workflow and distinguish external tools that internally use Python from the retired application.
5. When legacy files are retired, the Targeted CV Release shall update active setup, usage, dependency and CI instructions so they resolve to the supported skill workflow and clearly label any retained historical material.
6. When declaring retirement complete, the Targeted CV Release shall rerun the replacement candidate's applicable installed and regression checks, report the resulting artifact identity, and retain a traceable recovery reference for the prior legacy state without rewriting published history.
