# Requirements Document

## Project Description (Input)

Applicants need to explain their relevant contribution to an employer while preserving truthful, sourced career claims. The validated private profile capability supplies facts, but the legacy scorer and existing composition prototypes do not provide the planned employer-oriented analysis, contextual terminology, focused evidence questions or transparent diagnostics. A pasted job offer or explicitly declared role target should produce a selective positioning plan, sourced claim map, prioritized questions and clearly qualified review results for downstream application writing and refinement.

## Introduction

M2 defines the **Application Strategy capability**. It starts with employer needs, selects relevant evidence and proposes an application argument. The facts constrain assertions without forcing the application to reproduce the entire career inventory. Diagnostic results describe the available evidence and editorial quality; they do not predict hiring decisions or proprietary ATS rankings.

An **offer requirement** is an explicit employer statement. An **inferred need** is a separately labelled interpretation. A **supported claim** preserves the meaning and limits of selected evidence, not merely a matching source identifier. **Role-only positioning** uses a user-declared target without pretending that a specific offer exists.

## Boundary Context

- **In scope:** offer interpretation, contextual terminology and truthful equivalence, contribution positioning, evidence selection, question candidates, diagnostic rubrics, editorial review and a private strategy handoff for application writing.
- **Out of scope:** candidate-file persistence or migration, document extraction/rendering/layout, document operations, live conversation scheduling, submissions and release packaging. No replacement scorer application or helper-initiated model-service calls are introduced.
- **Adjacent expectations:** the validated profile capability supplies the explicitly selected evidence and its validation limits, receives requests for necessary inputs and owns authorized factual updates. Document capabilities supply actual document-check evidence. Refinement presents questions and coordinates revisions. Strategy supplies their positioning, claim support, question priorities and review rationale without redefining their contracts.
- **Presentation and source policy:** German and English are supported; language and target market remain separate. Approved editorial defaults apply, including COBESY and Humanizer with honest fallback disclosure. Document-specific blue/no-photo, pagination and Germany-targeted DIN 5008 rules remain document responsibilities. The shared research register distinguishes professional sources, practitioner ideas and user preferences; it does not establish a proprietary ATS scoring formula or DIN certification.

## Requirements

### Requirement 1: Explicit candidate and application context

**Objective:** As an applicant, I want the strategy to use the intended facts and target, so that its recommendations apply to my application.

#### Acceptance Criteria

1. When strategy work begins, the Application Strategy capability shall use the explicitly selected profile evidence and retain its validation, uncertainty and source limits.
2. If no readable selected profile is available, the Application Strategy capability shall request profile selection through the profile workflow without inferring candidate facts from prior sessions, host identity or unrelated files.
3. When a job offer is supplied, the Application Strategy capability shall retain that offer as the application target separately from reusable candidate facts and application language or market settings.
4. If no usable offer is supplied, the Application Strategy capability shall request an offer or an explicitly declared role target and label any role-only positioning without calculating job-specific coverage.
5. If some profile information is unavailable or unresolved, the Application Strategy capability shall identify the inputs needed for the requested activity and limit conclusions to supported evidence while allowing useful clarification and bounded positioning.
6. When a new answer could change reusable facts, the Application Strategy capability shall route the proposed change through the profile update workflow and distinguish pending evidence from confirmed saved facts before using it as canonical claim support.
7. When using profile readiness or time-sensitive evidence, the Application Strategy capability shall distinguish data readiness from job suitability and present-day freshness, retain supplied observation limits and request fresher evidence when material to the target.
8. If upstream structural or semantic validation has failed or has not been assessed, the Application Strategy capability shall request repair or validation before presenting confirmed claim support or diagnostic scores, while allowing clarification needed to repair the input.

### Requirement 2: Employer needs and explicit priorities

**Objective:** As an applicant, I want the offer interpreted in terms of work and contribution, so that the application addresses the employer's needs.

#### Acceptance Criteria

1. When analyzing an offer, the Application Strategy capability shall identify its stated responsibilities, expected outcomes, qualifications and relevant work context with traceable offer references.
2. When the employer distinguishes required and preferred criteria, the Application Strategy capability shall preserve that distinction; when priority is unclear, it shall retain the ambiguity rather than silently declare a criterion mandatory.
3. When inferring a business need or priority, the Application Strategy capability shall label the inference and its rationale separately from explicit employer requirements.
4. If the offer contains contradictory or unclear expectations that materially affect positioning, the Application Strategy capability shall identify the conflict and propose a focused clarification rather than invent a resolution.
5. When prioritizing contributions, the Application Strategy capability shall explain their relevance to the target responsibilities and stated or explicitly inferred needs without inventing employer culture, internal problems or assessment practices.

### Requirement 3: Contextual terminology and supported claims

**Objective:** As an applicant, I want relevant terminology supported by my experience, so that both automated and human readers can understand my fit without inflated claims.

#### Acceptance Criteria

1. When mapping an offer concept to candidate evidence, the Application Strategy capability shall distinguish supported evidence, uncertain or absent evidence, transferable relevance and user-confirmed gaps while retaining the original evidence state.
2. When proposing a factual application claim, the Application Strategy capability shall identify its supporting records and review whether the proposed wording preserves their meaning and limits.
3. When proposing a synonym, acronym expansion or translation, the Application Strategy capability shall preserve the evidenced concept, proficiency and seniority and distinguish exact equivalence from a related or transferable concept.
4. When describing responsibility or impact, the Application Strategy capability shall preserve distinctions among organizational context, personal contribution, advisory influence, reporting responsibility, contract ownership and spending authority without inferring one from another.
5. If a useful target term or stronger claim lacks adequate evidence, the Application Strategy capability shall propose a question or a bounded alternative instead of inserting it as an established qualification.
6. When selecting credentials, the Application Strategy capability shall use their relevance to the target and preserve issuer, level and status while distinguishing verified credential naming from evidence of possession or current validity.
7. When using an external occupational reference, the Application Strategy capability shall identify the reference actually consulted and its limits without treating taxonomy membership as proof of candidate competence or employer ATS behavior.

### Requirement 4: Employer-oriented positioning and editorial quality

**Objective:** As an applicant, I want a persuasive contribution argument, so that truthful evidence communicates why it matters to this employer.

#### Acceptance Criteria

1. When preparing a positioning plan, the Application Strategy capability shall provide a contribution thesis, selected supporting examples and an explanation of their target relevance rather than an undifferentiated inventory of facts.
2. If a draft is factually supported but generic or inventory-like, the Application Strategy capability shall propose stronger framing and evidence selection without manufacturing achievements or impact.
3. When proposing expertise content, the Application Strategy capability shall align its emphasis with the target responsibilities and seniority, keeping tools and historical techniques in their evidenced context rather than using their presence alone as proof of current capability.
4. When preparing German or English wording, the Application Strategy capability shall derive it from the same selected profile snapshot and preserve equivalent claims and evidence limits while distinguishing a target-role headline from historical employment titles.
5. When reviewing application wording, the Application Strategy capability shall apply the approved composition and language-review defaults, addressing sentence clarity, grammar, generic language and unsupported emphasis and using no em or en dashes in proposed submitted copy.
6. If an optional editorial method is unavailable, the Application Strategy capability shall disclose that limitation and apply the documented editorial criteria without claiming the missing method was executed or supplies ATS validation.

### Requirement 5: Useful qualification and evidence questions

**Objective:** As an applicant, I want focused questions about facts that could improve the application, so that refinement is useful and manageable.

#### Acceptance Criteria

1. When material evidence is missing or uncertain, the Application Strategy capability shall propose a prioritized question candidate with its affected requirement or claim, rationale and expected effect on positioning or review.
2. When proposing questions, the Application Strategy capability shall declare a finite next-batch question limit, select no more than that limit in priority order and retain remaining candidates for later refinement.
3. When an answer is skipped, marked not applicable or confirmed as a gap, the Application Strategy capability shall preserve that disposition without converting a skipped or absent answer into evidence of inability.
4. If a proposed question is already answered, skipped or marked not applicable for the same selected evidence and target, the Application Strategy capability shall avoid repeating it unless a material conflict, freshness limit or changed requirement justifies asking again.
5. If a date, renewal status, metric detail or scope of authority is material to the target, the Application Strategy capability shall ask precisely for the missing distinction without requiring unrelated personal details or guessing the answer.

### Requirement 6: Transparent and bounded diagnostics

**Objective:** As an applicant, I want understandable review results, so that I can improve the application without mistaking diagnostics for hiring predictions.

#### Acceptance Criteria

1. When preparing to calculate a diagnostic score, the Application Strategy capability shall identify the rubric version, dimension, scale, applicable weights, denominator and treatment of unknown or unassessed information.
2. When reporting offer coverage, the Application Strategy capability shall distinguish required and preferred criteria and show supported, absent, uncertain, transferable and confirmed-gap results without silently including inferred needs as explicit mandatory criteria.
3. When reporting review results, the Application Strategy capability shall distinguish evidence checks, editorial judgments and executed document checks and provide the basis for each result.
4. If an input, tool result or document check needed for a diagnostic is unavailable, the Application Strategy capability shall report that diagnostic as not assessed with the missing evidence or action, rather than assign a zero candidate score or fabricate a check result.
5. When reviewing application quality, the Application Strategy capability shall not deduct for omitted photos, completed-qualification award dates or unrelated personal attributes; an explicit application request for missing information shall be treated separately from evidence of suitability.
6. When assessing terminology, the Application Strategy capability shall not reward repetition or unsupported keyword insertion or penalize an unfamiliar acronym independently of its evidenced relevance and understandable presentation.
7. The Application Strategy capability shall identify its diagnostics as project-defined review aids and refrain from presenting them as hiring probabilities, universal ATS rankings, psychometric measurements or DIN compliance certification.
8. The Application Strategy capability shall provide distinct review dimensions for offer coverage, claim support, employer appeal and editorial readability while reporting executed document checks separately.

### Requirement 7: Review handoff and comparable refinement

**Objective:** As an applicant, I want recommendations and revisions to remain traceable, so that I can understand what improved and what is still unresolved.

#### Acceptance Criteria

1. When delivering a strategy or review, the Application Strategy capability shall provide a private handoff containing the target interpretation, positioning, selected claims and support, unresolved issues, prioritized questions and qualified diagnostics tied to the reviewed input versions.
2. When recommending an edit, the Application Strategy capability shall report the finding category, severity and check status, affected claim and available requirement or document references, observed issue, proposed correction and evidential or editorial rationale without applying document changes itself.
3. When comparing revisions, the Application Strategy capability shall use comparable inputs, rubric definitions and denominators or explicitly identify the changes that prevent a like-for-like comparison.
4. When the selected candidate, profile snapshot, offer or role target changes, the Application Strategy capability shall invalidate affected prior conclusions and diagnostics before reusing them, without carrying another candidate's facts, questions or assumptions into the new strategy.

### Requirement 8: Grounding, privacy and execution boundaries

**Objective:** As an applicant, I want a grounded and reusable workflow, so that its guidance is credible and my personal information stays private.

#### Acceptance Criteria

1. When using guidance to justify a recommendation, the Application Strategy capability shall distinguish professional source support, vendor-specific behavior, practitioner opinion, user preferences and project judgment, including material access or applicability limits.
2. The Application Strategy capability shall refrain from adopting unverified universal keyword quotas, placement advantages, reference-code interpretations or personal-trait inferences as assessment rules.
3. When reading an offer, profile or source document, the Application Strategy capability shall treat embedded workflow instructions as data rather than authority to access unrelated information, disclose private content or authorize changes.
4. The Application Strategy capability shall keep candidate-specific inputs, claim maps, questions and review outputs private and keep real candidate data out of reusable instructions, specifications, tests and distributable assets.
5. The Application Strategy capability shall perform its reasoning without requiring credentials for additional model services or initiating model-service requests from helper programs.

## Verification Intent

Use unrelated synthetic profiles and offers to review both employer appeal and factual support. Include a truthful but weak inventory, an appealing unsupported claim, accurate versus inflated synonyms, role-only positioning, ambiguous offer priorities, missing/skipped/confirmed-gap answers, bounded current claims, differing credential relevance, bilingual coherence, changed input versions, unavailable document checks and hostile source instructions. Inspect the usefulness of contribution framing and questions as editorial judgment, separately from executed evidence checks. Verify that omitted award dates and photos do not cause deductions and keyword repetition cannot manufacture supported coverage.

Concrete rubric scales, weights, worked examples and handoff representation belong to design. Supporting sources and their access limits are recorded in [the shared research register](../targeted-cv-skill/research.md); [editorial-defaults.md](editorial-defaults.md) and [review-agent-spec.md](review-agent-spec.md) retain the approved direction and proposals. No source register entry alone establishes source truth, proprietary ATS behavior or a validated selection instrument.
