# Research: ordinary-user profile versions

## Summary

Discovery began at the existing ProfileUpdate integration seam and expanded to platform security and checkpoint consumers. The selected approach adds explicit new-file capabilities, leaves replacement unchanged and reuses existing validation and authorization. Kiro design discovery/synthesis, COBESY composition and Humanizer review guided the scoped amendment.

## Platform evidence

- Microsoft documents [SACL access](https://learn.microsoft.com/en-us/windows/win32/secauthz/sacl-access-right) as requiring the security privilege. The current token lacks it; token adjustment cannot add an absent privilege. The installed replacement contract therefore correctly deferred.
- [ReplaceFileW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-replacefilew) documents retained properties but is insufficient evidence for a general audit-ACE preservation claim. Successful content/DACL probes do not close that assurance gap.
- The [.NET Framework FileStream constructor](https://learn.microsoft.com/en-us/dotnet/api/system.io.filestream.-ctor?view=netframework-4.8) accepts path, mode, rights, sharing, buffer size, options and FileSecurity. It applies access rights at creation. Use explicit create-new semantics and restrictive sharing.
- [DirectoryInfo.Create with DirectorySecurity](https://learn.microsoft.com/en-us/dotnet/api/system.io.directoryinfo.create?view=netframework-4.8) supports access control at creation. It does nothing for an existing directory, so it is not evidence of exclusive directory ownership. A production lease must assess and hold the actual selected parent, not trust a precheck or silently adopt a directory.

An ordinary-user Windows PowerShell 5.1 primitive probe demonstrated private new-file creation, source write/rename exclusion, destination read exclusion while open, occupied-target rejection, exact reopened bytes and unchanged source bytes/assessed security. Original audit metadata was neither copied nor claimed preserved. The first scratch attempt used a nonexistent eight-argument overload; reflection and official documentation identified the seven-argument constructor, and the corrected probe passed. That setup error is not a behavioral RED test.

The probe does not establish full stable-parent/file identity, whole-interval exclusion, policy authorization or owner confirmation. Those remain implementation and acceptance obligations. Private evidence is retained under ignored outputs; it contains no real candidate facts.

## Existing contracts and compatibility

The current factory exposes prepare/persist, selected-statement preparation and application fork operations. Replacement requires an existing destination and its applicable security baseline; it must not be reinterpreted as creation. Live generation checks, exact trusted decisions and private capability identity are reusable guards.

Facts 2.0 supports initial_intake, fact_update and migration history scopes. Scoped 2.1 additionally supports application scopes. Keep those enums and data shapes unchanged. Put storage mode and source/destination selection in the private reviewed envelope, not a new fact-history scope. Never copy an entire application profile back to reusable data.

## Synthesis and alternatives

- Generalize only the needed native create lease: profile versions and refinement checkpoints share creation guarantees, while each owner retains validation and state semantics.
- Adopt existing native file APIs; add no storage framework, service or database.
- Reject weakened replacement, automatic elevation, implicit fallback, automatic latest-file selection and imported approval flags.
- Retain the original rather than manufacturing another backup copy for a new-file operation. Existing replacement backup behavior remains unchanged.
- Creation confirmation and canonical selection are separate; exact prior authority can cover both without duplicate prompts.

The [design amendment](ordinary-user-versioning-design.md) defines the mode-specific envelope, policy, lease, errors and tests. The refinement owner separately addresses application reconciliation and storage continuity. Release acceptance must be rebuilt after runtime changes; current partial documents do not transfer to that future artifact.
