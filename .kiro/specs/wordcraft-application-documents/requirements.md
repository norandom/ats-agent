# Application-document requirements

## Introduction

Applicants need an editable CV and, when requested, a cover letter that makes their relevant contribution easy to understand. The application-document workflow composes the selected evidence into German or English documents and authors them live through the existing WordCraft MCP session. Facts constrain claims; they do not dictate a field-by-field biography or an inventory of keywords.

## Project description

Deliver M3: compose, present and verify targeted CVs and requested cover letters from the selected private structured profile and current application strategy. Preserve meaning across languages, use the approved blue/no-photo presentation, and apply the project's DIN 5008 convention to Germany-targeted letters in either language. Keep the workflow session-based; Node.js helpers and tests use pnpm and do not become another application.

## Boundary context

- In scope: document composition, localized presentation, editable sections for later refinement, live authoring, saved DOCX delivery and truthful content/layout check results.
- Out of scope: interpreting new qualifications, changing canonical facts, defining diagnostic scores, managing the conversational refinement loop, installing or packaging the complete skill, replacing WordCraft or submitting applications.
- Adjacent expectations: profile and strategy supply validated, current inputs, supported language-specific claims, application settings and unresolved questions. The session supplies verified capabilities, document identity, persistence and edit/recovery behavior. Missing evidence returns to intake or strategy; unavailable document operations remain pending. This feature supplies artifact-specific check evidence and editable document references to review and refinement.
- Evidence status: the session lifecycle is validated. Finished styling, pagination, reading order and DIN layout still require document-level acceptance. DIN dimensions and edition-specific details must be sourced during design before conformity is claimed. DIN 5008 is a user-required layout convention here; DIN 33430 does not define the letter layout.

## Requirements

### Requirement 1: Current inputs and controlled scope

**Objective:** As an applicant, I want documents compiled from my selected facts and application, so that my content cannot be mixed with another person or an obsolete draft.

#### Acceptance Criteria

1. When composition starts, the application-document workflow shall use the explicitly selected structured candidate input and its current validated strategy rather than candidate defaults, remembered personal content or environmental identity.
2. When preparing an application, the application-document workflow shall identify the selected document types, target language or languages, target market and output destination independently of reusable candidate facts.
3. If the selected facts, application context or strategy binding has changed, the application-document workflow shall withhold affected final content until the upstream selection and support decisions are refreshed.
4. If required content or an upstream readiness decision is missing, the application-document workflow shall retain private draft work and return the specific missing item to intake or strategy without inventing it or treating absence as a confirmed qualification gap.
5. When only a CV is requested, the application-document workflow shall create only that requested document; when a cover letter is also requested, it shall prepare a consistent pair for the same application.
6. The application-document workflow shall keep candidate content, drafts, evidence mappings and generated applications private while using only identity-free reusable assets and wholly fictional test fixtures.

### Requirement 2: Employer-oriented CV composition

**Objective:** As an applicant, I want a CV that makes my fit and contribution clear, so that a reader can understand relevant experience without reconstructing it from disconnected facts.

#### Acceptance Criteria

1. When composing a CV, the application-document workflow shall organize selected evidence around the strategy's target role and contribution argument rather than reproduce all available profile fields.
2. When presenting experience, the application-document workflow shall preserve employer, actual title, role dates and progression in clear reverse chronology, distinguishing any functional headline from the recorded employment title.
3. When describing capability, responsibility or impact, the application-document workflow shall preserve the supported scope, authority, outcomes and temporal relevance without upgrading advice to ownership, historical use to current proficiency or business context to personal achievement.
4. When composing expertise, the application-document workflow shall lead with relevant supported capabilities and contextual evidence, using recognizable offer terminology without keyword stuffing or unsupported synonyms; tool summaries shall remain secondary and role-relevant.
5. When presenting qualifications, the application-document workflow shall omit completed degree and certification award dates by default, preserve qualification names and status, label ongoing study, and show relevant expiry or renewal information without implying unverified active status.
6. When finalizing CV prose, the application-document workflow shall apply the strategy's COBESY/Humanizer editorial defaults or recorded fallback, use concise sentences and standard bullets, and exclude em dashes, internal scores, claim identifiers, evidence notes and unresolved drafting placeholders from the employer-facing text.

### Requirement 3: Language and document consistency

**Objective:** As an applicant, I want natural German and English versions that preserve the same facts, so that localization does not distort my qualifications or responsibilities.

#### Acceptance Criteria

1. When a language is selected, the application-document workflow shall use that language consistently for headings, narrative text, dates, greetings and page labels while preserving proper names and credential meaning.
2. When both languages are requested, the application-document workflow shall use the strategy's supported selections for each language without requiring literal translation or identical wording, allowing independently supported language output to proceed while another language remains pending.
3. When composition introduces or rewords a factual claim in either language, the application-document workflow shall obtain upstream semantic support review before finalizing it and withhold unsupported wording or changes to scope, qualification meaning, seniority, timeframe or certainty.
4. When generating a CV and cover letter together, the application-document workflow shall check shared identity, target employer and role, chronology, qualification status and factual claims for contradictions.
5. When a cover letter is requested, the application-document workflow shall develop the strategy's employer-specific contribution argument with selected supported examples rather than repeat the CV chronology or invent motivation and employer facts.
6. If required recipient details, salutation information or other letter inputs are unavailable, the application-document workflow shall distinguish required missing information from optional information, request clarification through the host and keep unresolved required items out of a delivery-ready letter.

### Requirement 4: Readable CV presentation and pagination

**Objective:** As an applicant, I want a readable document that remains understandable after text extraction, so that visual presentation does not obscure my evidence.

#### Acceptance Criteria

1. When formatting a CV, the application-document workflow shall use the approved single-column baseline with blue accents, a prominent name and role headline, a shaded profile summary when present, and recognizable section headings, without photos or photo placeholders.
2. When presenting experience and qualifications, the application-document workflow shall keep their labels and associated details visually and textually connected so that roles, employers and dates cannot be mistaken for neighboring entries.
3. When laying out content, the application-document workflow shall use readable spacing, left-aligned prose and standard text bullets, without clipping, overlapping elements or a heading stranded from its following content.
4. When selecting document length, the application-document workflow shall use the pages needed for relevant readable content rather than force a one-page limit, shrink text to conceal overflow or add unsupported filler.
5. When a CV is created, the application-document workflow shall show automatic current-page and total-page values on every page, including a one-page CV, labeled "Page X / Y" in English and "Seite X / Y" in German.
6. When content changes page count, the application-document workflow shall refresh and verify the page fields and page breaks before reporting pagination as passed.

### Requirement 5: Germany-targeted cover-letter layout

**Objective:** As an applicant to an employer in Germany, I want my cover letter to follow the agreed business-letter convention in either language.

#### Acceptance Criteria

1. When the target market is Germany and a cover letter is requested, the application-document workflow shall apply the project's DIN 5008 letter convention regardless of whether the language is German or English.
2. When preparing that letter, the application-document workflow shall include the applicable sender and recipient information, date, subject, salutation, contribution-focused body, closing and enclosure information using confirmed inputs.
3. If an address, signature or other personal letter detail is missing, the application-document workflow shall not fabricate it, copy it from another candidate or reuse an unrelated signature.
4. When validating Germany-targeted letter layout, the application-document workflow shall use a checklist whose dimensions, spacing and structural rules identify their source and applicable edition, separating sourced rules from project preferences.
5. If a required layout rule cannot be verified or an observed result fails it, the application-document workflow shall report the specific pending or failed check and withhold a full conformity claim.
6. When applying the visual identity to a Germany-targeted letter, the application-document workflow shall retain blue/no-photo branding only where compatible with the verified letter structure, with that structure taking precedence over private visual examples.

### Requirement 6: Live authoring and editable handoff

**Objective:** As an applicant, I want to watch and refine the actual documents, so that later improvements do not require replacing a finished static artifact.

#### Acceptance Criteria

1. When authoring starts, the application-document workflow shall create the requested content in the selected visible desktop session through WordCraft MCP, using the session's visibility protocol rather than treating background generation followed by opening as live authoring.
2. When switching document or language, the application-document workflow shall identify and select the intended document through the session protocol while preserving unsaved work and respecting later user focus changes.
3. When preparing content for later refinement, the application-document workflow shall preserve editable text and identifiable sections and entries with private evidence associations, without exposing technical anchors in the application prose.
4. When updating an existing document, the application-document workflow shall inspect its current state and use the session's targeted-edit behavior to preserve unrelated manual content and formatting; ambiguous or conflicting changes shall remain pending.
5. If a required authoring, inspection or persistence capability is unavailable or an operation outcome is uncertain, the application-document workflow shall retain private pending work and use the session's recovery behavior without substituting another document engine or reporting unverified completion.
6. When delivering a requested document, the application-document workflow shall provide its saved editable DOCX location and its associated check status after read-back and reopen verification, without overwriting an unrelated artifact or silently changing canonical facts.

### Requirement 7: Observable document quality

**Objective:** As an applicant, I want specific checks and useful remaining issues, so that I can distinguish a verified document from an attractive but untested draft.

#### Acceptance Criteria

1. When checking an authored document, the application-document workflow shall compare observed document text with the selected composition for omissions, unintended additions, broken characters and altered factual meaning, distinguishing mechanical results from host semantic judgment.
2. When checking reading order, the application-document workflow shall verify the observed sequence and association of identity/contact details, headings, experience, dates and qualification entries, rather than infer extraction quality from a screenshot.
3. When checking visual quality, the application-document workflow shall inspect every rendered page for spacing, page balance, legibility, clipping, headings and applicable footer behavior, reporting unavailable visual inspection as not assessed.
4. When reporting a check, the application-document workflow shall associate its result with the inspected document revision and scope, distinguish pass, fail and not assessed, and invalidate affected results after edits rather than reuse stale evidence.
5. When returning results to strategy or refinement, the application-document workflow shall provide executed document checks, editorial observations and unresolved issues separately, without introducing a new score formula, hiring probability or universal ATS-compatibility claim.
6. When this feature is accepted, the application-document workflow shall demonstrate wholly fictional English and German CVs and Germany-targeted letters through actual WordCraft authoring and read-back, including multi-page field updates, missing-input handling, source-supported layout checks and preservation of an intervening manual edit; simulated checks shall not replace required live evidence.
