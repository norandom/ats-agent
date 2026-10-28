# Research and design decisions

## Summary

- Feature: live-application-refinement.
- Discovery scope: integration-focused extension with cross-contract analysis. No new external dependency or undocumented WordCraft operation is proposed.
- Application-only evidence needs a scope marker that survives copying and resume. A marked full profile preserves existing career-reference semantics.
- Existing session and document capabilities already provide actual editing, preservation and recovery. Refinement adds conversation state and owner handoffs.
- Requirements are approved. Design review and implementation acceptance remain separate gates.

## Research Log

### Career evidence and application scope

Read the profile contract, validation, update and intake references alongside the strategy contract, evidence planner, host integration and comparison rules. Two read-only discovery agents examined profile/strategy and session/document integration separately. Neither received private candidate data.

Strategy 1.1 accepts new career facts only after confirmed profile persistence and fresh selection. Application context holds recipient information and intent; it is not an alternate qualification source. Profile 2.0 has no application scope marker. A plain copied profile would therefore look reusable when opened independently. Strategy's application ID can currently be null for role-only work.

The selected extension adds a closed 2.1 application profile and makes application identity explicit in strategy 1.2. Profile 2.0 remains accepted without migration. Normal career evidence references resolve against the selected, fully validated profile. New scope is enforced at intake and every active strategy check.

### Persistence and authorization

The existing profile protocol supports exact baseline/diff authorization, private backup, exclusive writing, security-preserving replacement and read-back validation. It currently defers absent destinations. Application-profile creation therefore needs a bounded explicit create operation, including exclusive destination creation, privacy verification and uncertain-result reconciliation. It cannot be a casual file copy followed by an assumed success.

Mixed choices require two separately observed writes. Reusable promotion selects only authorized facts against the current reusable base. The application profile then receives a reviewed reconciliation. Neither saved history nor a full application-profile replacement may authorize unrelated changes to the reusable file.

### Live documents and recovery

Document-session 1.0 already owns document identity, current inspection, durable intent before dispatch, one request in flight, uncertain outcomes and reconnect reconciliation. Application-documents 1.1 owns composition, language-specific spans, private anchors, normal recomposition, check-only refresh and current verification.

The refinement record refers to those records rather than duplicating operation state. New manifest revisions preserve predecessor evidence and freshly bind the same observed live documents. Historical ready states remain historical after a source change or restart.

### Questions and diagnostic continuity

The current question planner uses semantic distinction keys, a default batch of three, limits of one through five and explicit reopening reasons. Reuse those rules. Resume and profile forks require current reassessment of remembered dispositions, not repeated questions under new IDs or restoration of old support.

Current comparison requires directly observed profile-update continuity and compatible rubric, scope and populations. The initial fork is conservatively non-comparable. Later confirmed updates on the same scoped profile may compare through the extended observed-update route. There is no promised score increase.

## Architecture Pattern Evaluation

| Option | Strength | Limitation | Decision |
| --- | --- | --- | --- |
| Unmarked profile copy | Reuses evidence pointers | Can silently become reusable when reopened | Reject |
| Sidecar-only restriction | Leaves profile schema unchanged | Detached sidecar loses scope at ordinary intake | Reject |
| Overlay and new career namespace | Avoids copying unchanged records | Adds merge precedence and reference translation across every consumer | Reject |
| Marked full application profile | Preserves ordinary records and meaning checks; carries scope with data | Requires versioned intake and explicit fork creation | Select |
| Separate workflow service | Centralizes orchestration | Duplicates host session and existing owner protocols | Reject |

## Design Decisions

### Generalize the fact destination, keep one validation model

User choice changes the destination and reuse boundary, not the standard of evidence. Both destinations use profile validation and reviewed provenance. The design keeps career references unchanged and distinguishes reusable 2.0 facts from application-scoped 2.1 facts.

### Adopt the existing editing and review protocols

WordCraft operations, document preservation, source eligibility, rubrics and semantic review already have explicit contracts. Reuse them. Helpers remain pure validators or bounded test tools; the agent session performs conversation and authoring. No external library search is needed because the extension introduces no new external API or package.

### Keep scope decisions and semantic confirmation separate

A plausible answer is not a completed scope choice; a scope choice is not a successful write. Pending statements remain private until the selected source has confirmed persistence and meaning review. Additions, corrections and later capabilities retain their different semantics.

### Prefer truthful partial results

Reusable and application writes, as well as CV/letter/language updates, can complete separately. Keep per-destination and per-member outcomes. Initial forks, unobserved restarts and changed populations can produce non-comparable diagnostics without preventing useful editorial progress.

### Simplify the new state

One closed refinement record stores question dispositions, statements, choices, revision links and stop state. Existing owners retain their source and operation records. Do not add a database, event bus, retry engine, universal merge mechanism or second authoring path.

## Risks and Mitigations

- Scope stripping or mismatched applications: require a profile-level marker and independently selected identity; reject wrong scope before support review.
- Local facts leaking into reusable updates: review selected-statement diffs against the current base; never promote the complete application file.
- False continuity: mark initial forks non-comparable and require directly observed update chains for numeric deltas.
- Manual claims silently gaining support: preserve text but withhold verified delivery until meaning and source review pass.
- Old receipts appearing current: preserve pinned historical schemas and require new 1.2 observations for current acceptance.
- Tests replacing visible work: final acceptance requires actual desktop MCP artifacts, read-back, saved files and all-page inspection, with simulations labelled separately.

## References

- [M4 requirements](requirements.md): approved user-visible behavior.
- [Profile contract](../../../skills/targeted-cv/references/profile-contract.md) and [profile updates](../../../skills/targeted-cv/references/profile-updates.md): version and persistence boundaries.
- [Strategy evidence](../../../skills/targeted-cv/references/strategy-evidence.md) and [strategy review](../../../skills/targeted-cv/references/strategy-review.md): questions and comparability.
- [Strategy integration](../../../skills/targeted-cv/references/application-strategy.md): current source binding and update observation.
- [Document session](../../../skills/targeted-cv/references/document-session.md) and [application documents](../../../skills/targeted-cv/references/application-documents.md): native operations, composition and verification.
- [Privacy steering](../../steering/privacy.md) and [roadmap](../../steering/roadmap.md): private data boundary and authorized extension.

The Kiro design workflow supplied discovery, synthesis and review gates. COBESY's composition guidance structured the design around applicant choices and owner responsibilities; Humanizer review kept explanatory prose direct while preserving formal contracts.
