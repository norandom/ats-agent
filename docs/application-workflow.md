# Prepare an application

Start with your [private facts file](your-facts.md) and a job offer. Use the [targeted-cv entrypoint](../skills/targeted-cv/SKILL.md) from this checkout to choose relevant evidence, clarify what is missing, and create editable documents in WordCraft. Standalone installation packages and the automated conversational refinement loop are still separate work; you can request bounded edits through the existing document session.

## Choose the offer, language and country

Tell the agent which facts file to use and paste the offer. Choose German or English, name the target country, and say whether you want a CV, a cover letter or both. You can request both languages from the same facts. Select a private destination for each document. A CV-only request creates no letter.

If you do not have an offer, name a target role. You can still develop a general contribution argument, but a job-specific coverage score would have no basis.

At the start, the agent checks whether [COBESY and Humanizer](writing-skills.md) are available. If either is missing, choose help with installation, manual installation or the built-in writing guidance. You can continue without installing them.

## Review the proposed direction

The agent separates the offer's required qualifications, preferences and ambiguous requests. It explains which parts of your experience best address the work and proposes a focused opening and supporting examples.

Check whether that direction represents you. For a leadership role, responsibility, decisions and operating scope may matter more than a long tool list. For a technical role, specific current tools may deserve more space. Your actual history sets the limits of either presentation.

## Answer the questions that matter

The agent asks a small batch of questions and explains what each answer could improve. A question might clarify whether you advised on a decision or approved it, whether a qualification remains current, or what changed after a project.

Answer what you can. You can skip a question, say it does not apply or confirm a gap. The agent retains these distinctions and should not ask again without a material reason. A useful new fact can be proposed for your reusable profile; a wording preference belongs only to the application.

## Review the draft and diagnostics

Read the draft for its overall argument as well as individual claims. It should make your contribution easy to understand and give you statements you can defend in an interview.

| Review dimension | What it tells you |
| --- | --- |
| Offer coverage | Which requirements have supporting evidence and which remain unresolved |
| Claim support | Whether the proposed wording stays within your facts |
| Employer appeal | Whether the selected examples explain a useful contribution |
| Readability | Whether sentences and terminology are clear |
| Document checks | What was actually checked in the generated file |

These are review aids, not hiring probabilities. Unknown information is shown as unknown. A missing tool result is not a zero score for you. Repeating a keyword does not strengthen its supporting evidence.

## Create and edit the documents in WordCraft

The agent opens or brings WordCraft to the foreground before authoring. It creates the CV and requested cover letter live through WordCraft MCP in the visible desktop session. When working on several documents or languages, it identifies and displays the document it is currently editing.

WordCraft MCP also reads the documents back. After each substantive edit, the agent checks the actual text and, when needed, document structure before continuing. Creation, editing, reading, inspection and saving stay in WordCraft. The document session passes factual corrections back to the application workflow for your decision about updating the private facts file; application-specific wording and layout stay with the application.

The agent handles one document request at a time and saves the pending change and its baseline privately before changing WordCraft. If private persistence fails, it stops that change. Missing inspection or editing capabilities leave the change pending with an explanation. Only executed checks are reported as verified; unavailable checks are not assessed and earlier checks may be stale.

Before switching documents or languages, the agent resolves unsaved work and selects and identifies the new document. It respects your later focus changes. If a response is lost or access is interrupted, it retains the pending work, re-establishes document identity and inspects the current result before considering another attempt. It does not replay stored actions. Saving and explicit DOCX export report their confirmed destination separately from any reopen or layout verification.

Watch the draft take shape, then request changes to the opening, expertise section, selected examples or layout. The workflow reads the current document before applying edits so your manual work can be considered. Saved DOCX files belong to those live documents; creating a file in the background and opening it afterward is not the default live-authoring flow.

The CV baseline uses blue accents, no photo, readable spacing and automatic current-page/total-page footers. Use the space your relevant experience needs. Completed degree and certification award dates are omitted by default; relevant expiry and in-progress status remain accurate.

For German-market cover letters, the agent applies the sourced DIN 5008 project checklist in either language and reports which layout checks passed. That is not a full-standard conformity claim. Missing required addresses or other letter inputs leave the letter pending while a supported CV can proceed. The same applies when one language needs further support review: it does not stop another independently supported version.

You receive the saved editable DOCX location after read-back and reopen checks, together with passed, failed and unassessed results. A document with unresolved mandatory checks remains a draft. An edit makes earlier affected checks stale until the revised file is inspected again. German and English versions may differ in phrasing, but must preserve the same meaning and evidence.

## Keep each application separate

Save the offer, drafts, questions and review notes with this application, apart from your reusable facts. In this checkout, personal inputs belong under ignored `private/` and generated documents under ignored `outputs/`.

When you switch offers or update your facts, ask for a fresh review. Earlier scores may no longer be comparable. Before sending an application, read the final wording and inspect every page yourself.
