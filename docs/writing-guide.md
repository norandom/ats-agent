# Write for the reader's next decision

Use COBESY to decide what a document needs to explain, then Humanizer to make the prose clear and natural. These are editorial defaults for the README, docs, specifications and application prose. They do not replace source verification, privacy checks or Kiro templates.

## Start with the reader and the action

Before drafting, state the audience, purpose, main claim and intended action. Treat assumptions about the audience as assumptions. We do not know a reader's organizational culture or psychological safety from a job title or a job advertisement.

The README and user guides address candidates preparing applications. Lead with their intended flow and separate reusable career facts from application choices. Link the roadmap for availability and progress; do not turn the README into a status report. Contributor guidance stays in separate references. No organizational culture or wider adoption network is assumed.

## Use a composition blueprint before prose

The governing idea is that readers should find the next useful action without mistaking a design intention for a delivered capability.

| Document | Reader's decision | Main claim and structure | Detail to keep elsewhere |
| --- | --- | --- | --- |
| Root README | How do I prepare my application? | Facts, offer, questions, WordCraft refinement, optional skills | Status reports, CLI flags and implementation detail |
| Docs index | Which guide answers my question? | Short routes by reader goal | Repeated feature descriptions |
| Workflow | What inputs and decisions will be needed? | Input, contribution argument, questions, documents, refinement | Internal implementation contracts |
| Facts guide | What do I record once and reuse? | Career evidence, uncertainty, corrections and privacy | Offer-specific choices and draft wording |
| Writing skills | How do I add optional writing help? | Purpose, sources, install/manual/fallback choice | Marketplace internals and unrelated packages |
| Research | Which design choices does the evidence justify? | Thesis, evidence, limits, implications, falsifiable hypotheses | Personal examples and unsupported prescriptions |
| Legacy guide | How do I run and interpret existing code? | Setup, usage, limits | Promises about the future skill |

Lead sections with their point. Keep one main idea per paragraph and put limitations next to the claim they qualify. Use tables when readers need to compare choices. Preserve exact identifiers, schema fields, commands and link targets.

The strongest objection belongs in the research itself: reported preferences and observational correlations cannot establish that a proposed CV transformation improves hiring outcomes. State what evidence would challenge the proposal, rather than writing around that objection.

## Edit with Humanizer

Run the draft, audit and revision loop internally. Remove generic enthusiasm, vague authority, inflated significance, repeated summaries and formulaic contrasts. Prefer concrete subjects and verbs. Vary sentence length when it helps the reader; do not add anecdotes, metrics or opinions to make technical prose feel personal.

Use sentence-case headings, ordinary punctuation and no em or en dashes in authored prose. Keep necessary technical vocabulary and qualifications. For application copy, retain the candidate's supported meaning and voice. Natural wording must never strengthen a claim beyond its source.

## Check whether the structure worked

A reader should be able to prepare private facts, start an application and understand how questions and edits improve it. Availability and evidence should be reachable through clear links. If these actions require reading every page or understanding the implementation milestones, revise the routing. This is the disproof condition for the documentation structure, not a claim that usability testing has already passed.

Before delivery, review headings and topic sentences together. Check for duplicated sections, misplaced detail, unsupported claims, missing source limits and accidental personal data. Resolve links and distinguish executed tests from editorial review. Behavioral rollout exercises are unnecessary for these reference documents unless a real adoption task is requested.
