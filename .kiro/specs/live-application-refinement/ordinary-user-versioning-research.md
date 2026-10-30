# Research: versioned refinement storage

## Summary

The profile-only route would leave later application updates and checkpoint replacement blocked. This amendment retains those existing owners and adds new-file storage with an explicit predecessor witness. Kiro integration discovery and synthesis, COBESY composition and Humanizer review informed the design.

## Integration findings

Application facts remain scoped 2.1. Later versions must retain immutable application identity, target and original-profile reference, preserve local evidence and keep reusable promotion selective. Current strategy bindings include path and generation; a changed path needs directly observed owner continuity or a fresh non-comparable baseline.

The current checkpoint factory writes raw refinement-session 1.0 records. Both it and the transition inspector verify the previous record hash. The documented legacy hash callback covers exact retained raw checkpoint bytes; returning an outer wrapper hash for an inner record would violate that contract.

The new storage envelope retains the exact inner record byte payload and its digest separately from the outer artifact hash. The new factory authenticates decoding and matching of that payload before supplying a mode-specific record-integrity witness. The raw 1.0 schema, legacy factory and legacy hash adapter remain unchanged. This avoids a career-data or historical session-record migration.

## Acceptance selection

The current maintenance index is unversioned `m4-evidence-index`; it assumes four physical roots and infers application/checkpoint/strategy/manifest filenames beside a receipt. Its review binds a normalized index digest and inventory counts. These historical conventions cannot select arbitrary immutable versions safely.

The current path therefore needs a distinct closed versioned index and selection review, explicit source/checkpoint refs and exact index-file bytes as well as its existing normalized digest. Preserve the public full-validator call and dispatch index kinds explicitly. Legacy filename and backup enumeration remain historical only. Do not create aliases or copied receipts to satisfy old names.

## Decisions and risks

- Reuse the [profile creation policy](../portable-candidate-profile/ordinary-user-versioning-research.md); checkpoint logic supplies its own current-record and predecessor checks.
- Choose one new storage file per checkpoint rather than a record plus sidecar transaction or an overwritten latest-pointer file. The wrapper adds encoding overhead but avoids a two-file confirmation problem.
- Base64 is data encoding, not privacy protection. Decode, hash and validate the actual inner record; a schema content annotation is insufficient.
- A previous reference inside stored data cannot authenticate its own chain. Resume must use independently trusted selections/current owner inspection and retain unresolved operations and stop boundaries.
- Current acceptance source selections and native file guarantees require real-host tests. Generic fixtures, trusted-looking JSON and successful creation primitives do not establish actual workflow acceptance.

The [design amendment](ordinary-user-versioning-design.md) provides the concrete contracts and file plan. Existing checkpoint/document operation ownership is unchanged; there is no new model endpoint or tool dispatcher.
