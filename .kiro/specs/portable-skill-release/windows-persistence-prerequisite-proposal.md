# Proposed ordinary-user Windows persistence prerequisite

Status: historical proposal, now followed by approved requirements, designs and ten implementation tasks. Current implementation validation remains outstanding. The owning boundary is ProfileUpdates in the portable-candidate-profile specification. M5 task 6.1 is the affected consumer.

## Decision needed

Support ordinary-user Windows sessions without asking applicants to run their CV workflow as administrator. Retain the existing strict deferral for replacement of an existing file when its required security properties cannot be assessed. Investigate a separately authorized, versioned new-file route as the ordinary-user default.

This route would leave the selected original file untouched and return a new, explicitly selected structured-facts file. It would not claim to copy or preserve unexamined audit metadata. The user must see the new destination and choose whether to use it as the next reusable profile. Application-only facts remain separately scoped.

## Observed blocker

The installed owner requires assessment of applicable audit and other security semantics before persistence. The current non-administrator token cannot inspect the file SACL and has no security privilege that could simply be enabled. Native replacement tests preserved content, backups and protected ordinary ACLs; those observations do not establish audit-ACE preservation. The current correct outcome is deferred persistence.

This does not block ordinary WordCraft authoring or saving application documents. It blocks confirmed profile persistence required by installed acceptance. No audit policy, privilege, existing file or owner contract has been changed to bypass it.

## Proposed upstream acceptance scope

1. Define a supported ordinary-user policy for creating a new version in an explicitly selected private directory. Identify the properties verified and any audit policy not assessed, without describing that as complete metadata preservation.
2. Require exact proposal and destination consent, an absent destination, stable original and parent identities, native writer exclusion, private access controls, exclusive creation and complete validated readback. Never overwrite or rename the original through this route.
3. Retain the original selected file and record the new file's provenance, content hash and confirmed selection. A new canonical selection must be explicit; a successful create must not silently redirect future applications.
4. Keep existing-file replacement deferred whenever its required policy cannot be verified. An approval flag, advisory lock or successful DACL-only probe must not turn that failure into success.
5. Exercise application-only and reusable choices independently, source conflicts, occupied destinations, interrupted creates and successful readback on an actual non-administrator Windows host. Verify the original bytes and assessed properties remain unchanged.
6. Review affected checkpoint and application consumers under their owning specifications. Rebuild the changed skill and repeat installed acceptance against the new artifact; do not reuse the current candidate's receipts as its acceptance.

Human approval would authorize upstream specification work on this scope. Requirements, design and tasks still need their normal review before implementation. The new-file route is a proposal to validate, not an already demonstrated security guarantee.

## Evidence boundaries

Microsoft documents that [SACL access requires the security privilege](https://learn.microsoft.com/en-us/windows/win32/secauthz/sacl-access-right), and [token adjustment cannot add an absent privilege](https://learn.microsoft.com/en-us/windows/win32/secbp/changing-privileges-in-a-token). The documented [ReplaceFileW preservation list](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-replacefilew) is insufficient evidence for a general SACL-preservation claim. These limits support the deferral; they do not prove that every Windows update needs elevation.
