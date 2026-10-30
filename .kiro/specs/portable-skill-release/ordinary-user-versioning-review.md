# Ordinary-user versioning proposal review

## Result

The user selected this direction for upstream specification review, approved the ten requirements and then approved both reviewed designs on 2026-10-30. The generated task additions await approval. This explicit new mode is not a reinterpretation of the installed replacement contract. No runtime changes, candidate mutations or M5 readiness approval follow from this specification review.

## Required changes

| Owner | Proposed scope | Existing contract affected |
| --- | --- | --- |
| Candidate Profile | Exact consent, verified creation policy, validated new reusable version and explicit next-source selection | Requirements 1, 6 and 7; ProfileUpdate and installed ProfileUpdates |
| Refinement | Subsequent application versions and trusted checkpoint continuity under that supported creation policy | Requirements 3 and 7; ScopedProfile and RefinementRecord |
| Strategy and documents | Revalidate current source eligibility, claim associations and invalidation after selection changes | Existing consumer contracts; no new scoring or document engine |
| Release | Rebuild and repeat installed acceptance after owner changes | Existing inventory, adapters, exact-artifact evidence and readiness gates |

The Candidate Profile draft amends requirement 7.3 explicitly: the current text otherwise restricts updates to the selected existing profile and contradicts a new destination. Its proposed requirement 8 contains seven criteria. Refinement's proposed requirement 8 adds three criteria. This keeps ten new criteria across two existing specifications.

## Security and selection limits

Creation establishes a new object's disclosed security policy. Replacement must preserve the existing object's required properties. Successful creation cannot establish preservation of an unread audit policy, and ordinary-user status cannot establish destination privacy. Unknown mandatory obligations still defer the operation. The design must enumerate supported and unassessed properties and demonstrate the route on the actual host.

Creation and selection are separate outcomes. The next canonical source requires explicit authority, including a request that already covers that selection. No silent latest-file scan is allowed. Checkpoint generation belongs to the authorized private session workspace; it must retain trusted predecessor and unresolved-operation continuity without prompting the applicant for technical filenames.

## Verification and phase gate

Requirements review checked observable EARS criteria, explicit owners, current-contract contradictions, unchanged replacement deferral, application-only isolation and the checkpoint dependency. The drafts contain no candidate instances or new service. Independent review supplied the boundary findings and proposed criteria; the parent wrote the amendments and checked their consistency inline.

The approved [Candidate Profile amendment](../portable-candidate-profile/ordinary-user-versioning-requirements.md) and [refinement amendment](../live-application-refinement/ordinary-user-versioning-requirements.md) are incorporated into their canonical requirements. Requirements, designs and all ten implementation tasks are now approved for the new revision. Current validation remains outstanding, while earlier GO results remain explicitly historical. Implementation must establish the actual capability and evidence. M5 task 6.1 remains blocked on the current artifact.
