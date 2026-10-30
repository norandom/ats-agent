# Independently verify installed evidence

This read-only maintenance helper checks selected bytes and review associations. A mechanical `passed` result retains `workflow_status: not_assessed` and `release_ready: false`. Full live acceptance, two-applicant coverage and readiness remain later gates. Deterministic tests use control records and do not establish live acceptance.

```javascript
const {verifyInstalledEvidence} = require('./release/installed-evidence.cjs');
const result = verifyInstalledEvidence(
  {archive: selectedArchive, expected: {artifact: selectedArtifactRecord,
    prepared: {root: trustedPreparedSource, sourceRevision, sourceEpoch}}},
  {installed_root: selectedInstallation},
  {root: privateEvidenceDirectory, index: 'index.json',
    expected_sha256: independentlySelectedIndexDigest},
  {path: 'review.json', expected_sha256: independentlySelectedReviewDigest}
);
```

Select the artifact, prepared source, index and review digests outside the index. The prepared source contains trusted executable maintenance code; the helper loads its archive verifier to support independently selected older artifacts. The archive must be the exact indexed file in the evidence directory. Equal payloads in different archive bytes do not share evidence. Installation inventories use the same portable/alias/plugin roots as installation and must match completely, including templates. No checkout owner algorithms run here.

The index is the closed `installed-evidence` contract in `candidate.schema.json`. Retain the observer's selected artifact, installation, before/after inventories, host, installed resource trace and isolated applicant selections. Select current prerequisite records, owner receipts, actual operation intents/results, editable outputs, every page render and underlying competent review notes. The complete index references actual owner records without changing their upstream contracts. An unchanged closed `installed-observation` is also accepted as input for inspection, but fails at `mandatory-owner-mcp-review-evidence` if incomplete. No fabricated review is necessary to report that incomplete boundary. Collection alone cannot become a complete index by changing its discriminator.

Keep the independently selected review outside the indexed references to avoid a digest cycle. The closed `installed-evidence-review` record requires:

Known closed `installed-transport-event` records recursively select their intent, request and response bytes. Include these nested files in `reviewed_files` as well. The helper requires linked recorded discovery, identity and call intent/result pairs. External MCP payload fields remain opaque; a response boolean grants no success. The source trace must include the installed profile, strategy, document-session, documents and refinement references associated with the five required owner findings.

- `schema_version: "1.0"`, `kind: "installed-evidence-review"`, the exact `index_sha256`, `artifact_sha256`, `installed_root` and `inventory`.
- An identified `reviewer`, a description of their `competence`, `observation_class: "host_judgment"`, and `reviewed_files`: the exact union of every indexed private reference except the archive. References have `path`, `size`, `sha256`; every byte is rehashed.
- `capabilities`: desktop-connection, tool-discovery, live-authoring, readback, render, save-reopen. The actual prerequisite finding must reference current discovery and observed capability records. A declaration of a tool name cannot prove it worked.
- `optional_skills`: one each for cobesy and humanizer, with explicit `choice` of use-existing, embedded-fallback or authorized-install and current decision/effect `references`. A declined installation uses the documented embedded fallback. Silence supplies no authorization; authorized-install requires the reviewer to inspect the exact actual applicant authorization and preservation of existing installations.
- `findings`, each containing `scope`, `observation_class`, `outcome`, exact `references` and an explanatory `observation` of what the competent reviewer actually inspected. Bare passed flags do not satisfy this contract.

Required findings are `standalone` (host_judgment), `prerequisites`, `cobesy`, `humanizer`, and `owner:profile`, `owner:strategy`, `owner:document-session`, `owner:documents`, `owner:refinement` (actual). Standalone and every owner finding reference every selected applicant facts/settings/state file. Each owner finding also references its current installed owner receipt and actual operation evidence. The reviewer must compare artifact, application/source identity and outcome inside that upstream record, reject stale/foreign receipts, source imports, expected prose and replay, and explain the observed owner execution. The verifier checks these associations; it cannot infer the truth of opaque owner records or prose.

For each saved output require `meaning:<relative output path>` and `visual:<relative output path>`, both host_judgment. Meaning references the current output and selected facts and explains claim/source comparisons. Visual references the current output and every indexed page render and explains actual all-page reading order, layout, automatic pagination and applicable letter geometry. Every page must be selected: the reviewer checks page completeness against actual read-back/save/reopen and render observations. Merely asserting an expected page count or success is insufficient competent review.

The operator authenticates the observer and competent reviewer and selects their original digests through a trusted channel. JSON has no self-authentication: recomputing a digest after editing an index or generating review-shaped assertions does not authenticate observations. This helper cannot detect a dishonest trusted reviewer. It checks immutable selected bytes, closed contracts, required associations and observation classes, while leaving semantic/visual truth and source-read completeness at that explicit human/host boundary. Trace checks are not an operating-system sandbox. Keep private evidence protected from external writers throughout verification; symlink/hardlink and identity checks do not replace that host guarantee.

Failures retain the installation and evidence. No helper path authorizes profile writes, MCP operations, installation, readiness, legacy retirement or publication.
