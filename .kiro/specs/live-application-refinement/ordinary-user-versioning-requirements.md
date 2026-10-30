# Proposed requirements amendment: versioned refinement persistence

Status: requirements approved by the user on 2026-10-30 and incorporated into requirements.md. Design and tasks are also approved. Implementation is authorized; current runtime validation remains outstanding. This extends the existing refinement specification alongside the [Candidate Profile amendment](../portable-candidate-profile/ordinary-user-versioning-requirements.md).

## Boundary context

Later application-profile and checkpoint writes currently require replacement guarantees. Supporting only a new reusable profile would leave these later writes blocked. This amendment keeps their existing owners, application isolation, factual support, exact authority, stop and recovery rules.

Private checkpoint storage remains an implementation detail under the authorized session workspace. The applicant should not have to approve every technical checkpoint filename. This does not grant authority to change career facts, select a different canonical profile or discover state by scanning for the newest file.

### Requirement 8: Continue through supported new versions

**Objective:** As an applicant, I want supported new-version persistence to retain application scope and session continuity, so that a change in storage route does not bypass fact choices or recovery.

#### Acceptance criteria

1. When refinement creates a subsequent application-profile version, the Targeted CV Skill shall preserve its immutable application scope, local evidence and history, apply only separately authorized statement choices under the declared verified creation policy, and report reusable and application outcomes independently.
2. When refinement persists a checkpoint to a new version, the Targeted CV Skill shall bind it to the exact trusted predecessor and inspected owner observations, retain unresolved operations and require confirmed persistence before dependent dispatch, within the authorized private session workspace and without discovering or selecting a checkpoint by latest filename.
3. While a session is stopped or an owner operation remains unresolved, the Targeted CV Skill shall retain existing stop and recovery restrictions across version changes, without treating an allowed stop observation as authority for another mutation.

## Adjacent obligations

Existing replacement guarantees and deferral remain unchanged. Reusable source creation and explicit canonical selection belong to the Candidate Profile capability. New versions must retain the current eligibility and source-binding checks used by strategy and documents; they do not make unpersisted answers eligible evidence.

The design must specify how new application and checkpoint versions retain trusted predecessor selection, exact authority, conflict handling and current associations. Changed artifacts require fresh installed acceptance. See the [impact review](../portable-skill-release/ordinary-user-versioning-review.md).
