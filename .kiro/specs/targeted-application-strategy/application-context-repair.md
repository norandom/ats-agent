# Keep application evidence separate from career facts

Status: correction direction and concrete [design amendment](application-context-design.md) approved on 27 October 2026. The appended [implementation tasks](tasks.md#application-context-correction) passed independent review and await human approval. No upstream contract changes are implemented by this note.

## The complete letter exposed a missing evidence source

The strategy contract can cite only records in the selected canonical career profile. Its review marks a factual claim without canonical evidence as unsupported. Target references identify relevance, but do not establish support.

The document workflow also requires the complete letter to account for recipient details, the application date, employer statements and confirmed application-specific intent. These belong to the offer or the current application. Putting them in the reusable career profile would violate the existing separation of facts and workflow.

The profile, strategy and document component tests passed separately. The complete bilingual application revealed that their evidence contracts do not cover this boundary. Formatting and text read-back cannot resolve it.

## Recommended correction

Keep the career profile unchanged. Extend the strategy-owned evidence contract to distinguish three sources:

| Source | Examples | Required binding |
| --- | --- | --- |
| Canonical candidate facts | Employment, qualifications, contact details | Selected profile identity and exact bytes |
| Selected offer | Advertised responsibilities and employer statements | Exact offer hash and source span |
| Confirmed application context | Recipient address, application date, salutation, intent and enclosures | Separate private context identity/hash, confirmation and provenance |

A claim may need more than one source. A letter sentence linking experience to an advertised need must retain both references and a host review of the complete meaning. A reference alone never grants support.

The host must obtain current context independently and bind its confirmation to the selected application, not just to matching text. An incoming draft cannot confirm its own application metadata. Changing the offer or application context invalidates affected claims and comparisons, while leaving reusable candidate facts intact. Missing confirmation remains pending for the affected document. Offer or application-context evidence must never establish a candidate's employment, qualifications or achievements.

Preserve existing canonical evidence behavior and diagnostic formulas. Count every factual proposition, including application assertions, against the same support rubric. Never exclude an inconvenient assertion from the inventory or label it decorative solely to bypass review. Keep metadata, confirmations and generated artifacts private.

## Ownership and implementation order

1. **Strategy contract:** review the exact additive/versioned schema design and compatibility behavior. Specify separate application context, evidence references and hash binding. Do not weaken canonical-profile validation.
2. **Strategy host and review:** validate independently current offer/context evidence, require confirmation where appropriate, and invalidate affected claims after context changes. Cover forged confirmation, stale or wrong-application context, changed offer, changed comparison inputs and mixed-source wording. Verify that non-candidate evidence cannot prove a candidate qualification or career assertion.
3. **Document integration:** consume the corrected strategy contract. Keep letter metadata in the application manifest, with consistent provenance and current binding. Do not add an alternative document-side support checker.
4. **Acceptance:** rerun the complete fictional English/German application through the corrected boundary, then perform relocation and the feature-level validation gate.

These are corrections to the existing application workflow, not a new scoring system or a new runtime service. The detailed schema and task amendments must be reviewed in their owning specification before implementation resumes across this boundary.

## Current delivery boundary

The usable skill entrypoint, live document operations, CV and letter presentation references, revision-bound checks and strategy check adapter are implemented. The full application acceptance remains incomplete. Reviewed WordCraft drafts can be inspected, but must not be described as passing the complete facts-to-application workflow until this correction is implemented and validated.
