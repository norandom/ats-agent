# Collect evidence from a selected installation

`observeInstalled` records installed bytes and host observations for release maintenance. A `passed` result confirms collection and record validation. Installed workflow acceptance stays `not_assessed`; the independent evidence verifier must assess the selected archive, installation, owner results and reviews.

Select an installation outside this checkout and its sibling Skills repository. Select a separate private evidence directory, the exact archive file within it, and fictional applicant facts, settings and state files. Paths within the evidence directory use relative names without parent traversal. The host must establish directory privacy and exclude external writers throughout collection. The helper rejects symlinks and multiply linked files, checks identity while reading and compares complete installed inventories before and after. Those checks do not establish operating-system isolation.

```javascript
const {observeInstalled} = require('./release/observe.cjs');
const result = await observeInstalled({
  installed_root: selectedInstallation,
  evidence_root: selectedPrivateDirectory,
  artifact: 'selected-archive.zip',
  applicants: [{id: 'fictional-a', facts: 'a/facts.json',
    settings: 'a/settings.json', state: 'a/state.json'}]
}, async session => {
  const entrypoint = session.readResource('SKILL.md');
  // The fresh host follows this installed entrypoint and selects its own turns.
  // Load a needed embedded helper from its actual installed reference:
  const dispatchVersion = session.loadOwner(
    'references/profile-contract.md', 'dispatchVersion');
  // Call owner helpers with independently selected inputs and live host adapters.
  // Retain actual owner receipts separately, then select their exact files:
  // session.capture('owner_receipts', 'a/profile-receipt.json');
}, selectedLiveHostServices);
```

The callback supplies the host session, not a bundled application driver. `readResource` records the exact installed asset hash. `loadOwner` compiles JavaScript fences from that same selected installed reference and returns the named function. It provides standard encoding and cloning helpers without `require`, `process`, file access or checkout imports. The VM is a convenience for trusted installed code, not a security sandbox. The host reports any resource reads outside this API separately; this trace alone cannot prove their absence.

The runtime `services` object accepts these live callbacks:

| Service | Observation |
| --- | --- |
| `host()` | Exact `{name, version, platform, connection}` declaration, labeled `host_judgment`; unavailable observations become null |
| `prerequisites: [{id, probe}]` | A live probe's reported version and retained response; missing versions are `not_assessed` |
| `transport.discover()` | Fresh actual MCP discovery response normalized to `{tools: [{name, ...}]}` |
| `transport.identity()` | Read-only connection inspection normalized to a response containing `document_id` |
| `transport.call(tool, args)` | One explicit host-selected MCP call, available only after discovery and identity |
| `adapters` | Trusted host lease acquisition and exact user-decision callbacks described below |

Call discovery and read-only identity before using the connection. Rediscovery invalidates earlier capability and identity state even if it fails. The wrapper records each callback intent before dispatch and retains its actual response or an uncertain result under a new private `observation-<id>` directory. Each closed, versioned `installed-transport-event` records the operation, phase, intent reference and opaque request/response file references. External payload bytes remain inert private evidence; the event schema validates their references rather than inventing an MCP response contract. The wrapper never retries calls. A transport exception leaves the owner responsible for inspection and reconciliation; response fields such as `success: true` remain raw evidence and establish no owner verdict. MCP tool names and operations come from the selected host's actual discovery, not a maintained list in this helper.

Use `capture(category, relativeFile)` to select `owner_receipts`, `operations`, `saved_outputs`, `renders` or `reviews`. The helper records file identity and bytes without interpreting incoming permission, outcome or review assertions. Keep outputs distinct for each applicant and application. A selected state hash is a starting observation; select later checkpoints as owner receipts or operations to retain changes.

`createHostAdapters(trustedCallbacks)` delegates `acquirePersistence`, `acquireFork`, `acquireCheckpoint` and `userDecision`. Supply the installed profile owner's `acquirePersistence`/`acquireFork` callbacks directly; wire `acquireCheckpoint` to the refinement checkpoint owner's `host.acquire`. Missing callbacks or incomplete leases return null. The declaration records callback presence with `status: not_assessed`. A method's presence cannot establish the guarantees it promises.

For every real destination the trusted host must establish stable path and parent identity, actual exclusive writer access, private stage and retained files, the applicable security policy, and read-back for the complete interval. On Windows profile replacement follows the installed [profile update contract](../skills/targeted-cv/references/profile-updates.md), including `.NET File.Replace` with preservation of the assessed security baseline. A Node advisory lock does not satisfy that contract. Checkpoint leases also require exact `resolved_path`, `stable_identity`, and exclusive-create or security-preserving replacement operations under the installed [refinement contract](../skills/targeted-cv/references/refinement-session.md). A host lacking these guarantees defers persistence. This module supplies no replacement filesystem primitive.

`userDecision` must authenticate an actual applicant instruction for the exact reviewed envelope. The wrapper passes a copy, checks the returned reviewed value for exact equality, and leaves schema and scope validation to the installed owner. Imported history or approval-shaped JSON cannot implement this callback. Other owner dependencies, including full profile validation, current selection and checkpoint inspection, remain explicit host responsibilities.

The closed `installed-observation` variant in `candidate.schema.json` contains artifact identity, installed root, before/after inventories, host and prerequisite observations, resource reads, isolated applicant selections, selected evidence references, transport references and adapter declarations. Partial collections retain empty arrays or null observations and a constant unassessed workflow status. It does not weaken the complete `installed-evidence` contract.

For independent verification, retain this record at a selected private file and select its expected digest separately. The verifier must rehash every referenced file, independently verify the archive and exact managed installation, require complete current owner evidence and competent review, and reject stale or contradictory observations. Self-reported success and a newly computed digest of edited evidence cannot authenticate the original session. Collection grants no profile or document mutation authority and no release readiness.
