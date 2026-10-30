# Proposed requirements amendment: new reusable profile versions

Status: requirements approved by the user on 2026-10-30 and incorporated into requirements.md. Design and tasks are also approved. Implementation is authorized; current runtime validation remains outstanding. The direction was selected for specification review after an installed ordinary-user Windows session could not assess the security policy required for replacement.

## Boundary context

Extend the existing Candidate Profile capability. Add an explicit new-version route with a verified, disclosed creation policy. Keep strict existing-file replacement and its deferral rules. Ordinary-user status alone does not prove that a destination is private or supported. Creating a new file does not prove preservation of the original file's unexamined security metadata.

Application-scoped versions and checkpoints remain refinement responsibilities. Strategy and document consumers continue to require confirmed current source bindings. No new storage service, automatic version discovery or data-schema migration is required by these requirements.

## Proposed amendment to requirement 7.3

When a profile update is authorized, the Candidate Profile capability shall apply it only to the selected profile or the explicitly authorized new-version destination, and leave all other candidate profiles unchanged.

### Requirement 8: Save a separately authorized reusable version

**Objective:** As an applicant, I want to save confirmed facts as a new private version without replacing my selected original, so that an unsupported replacement policy does not prevent every supported update route.

#### Acceptance criteria

1. When the applicant authorizes saving selected factual changes as a new reusable version, the Candidate Profile capability shall identify the selected source, its current baseline, the exact changes and proposed destination, and preserve the selected source without replacement.
2. Where a new-version persistence route is supported, the Candidate Profile capability shall state its verified creation-security guarantees and unassessed properties without representing them as preservation of the source's security metadata.
3. If the destination exists, the source or destination context changes, or required privacy or security assurances are unavailable, the Candidate Profile capability shall withhold creation and report the conflict or deferred prerequisite without adopting or overwriting another file.
4. When a new version is created, the Candidate Profile capability shall confirm persistence only after exact reopened content, full applicable validation, source continuity and the declared creation policy have been verified.
5. When a new version is confirmed, the Candidate Profile capability shall retain private provenance and its exact artifact reference and require explicit selection before using it as the next canonical source, reusing an existing exact request that already covers that selection.
6. If creation has an uncertain outcome or the process is interrupted, the Candidate Profile capability shall preserve the original and inspect the exact attempted destination before further writes, without replaying creation or reconstructing authorization from saved content.
7. If existing-file replacement requires security guarantees that cannot be verified, the Candidate Profile capability shall retain strict deferral regardless of successful new-file creation or ordinary-user route availability.

## Review boundary

The next design must define which creation policy can actually be verified on an ordinary-user Windows host, its excluded guarantees, exact authority and identity checks, and recovery evidence. These requirements do not authorize labeling an unknown mandatory security policy as supported. A created but unselected version is not a completed source change for downstream consumers.

See the companion [refinement amendment](../live-application-refinement/ordinary-user-versioning-requirements.md) and [impact review](../portable-skill-release/ordinary-user-versioning-review.md). Human Requirements, Design and Tasks approvals precede implementation and a rebuilt installed candidate.
