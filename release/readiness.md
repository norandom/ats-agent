# Evaluate exact-artifact readiness

Use `release/readiness.cjs` to review a selected candidate without changing it. The
helper reports every mandatory gate separately and returns `ready`, `blocked` or
`not_assessed`. A report carries no installation, publication or retirement
authority. Keep legacy files until the separate retirement procedure accepts its
prerequisites.

## Select evidence independently

The maintainer selects trusted prepared maintenance code, archives, evidence
indexes and review digests outside the records being reviewed. Keep observations
and reviews in an ignored private output directory or an explicitly selected
external workspace. Use wholly fictional applicants for release acceptance.
Never derive an expected digest from an untrusted index and call that independent
selection. Operate with exclusive access to immutable selected files; this helper
is not an OS sandbox or an observer-authentication mechanism.

Call the API from a maintenance session:

```javascript
const {evaluateReadiness} = require('./release/readiness.cjs');
const report = evaluateReadiness(
  candidate, verifiedArtifacts, installedEvidence, checks, rightsReview
);
```

| Argument | Closed selection |
| --- | --- |
| `candidate` | `{prepared: {root, sourceRevision, sourceEpoch}}` |
| `verifiedArtifacts` | Three `{archive, expected: {artifact, prepared}}` selections, one per declared format |
| `installedEvidence` | `{target, artifact, install, evidence, review}` selections using the installed-evidence verifier's existing four arguments |
| `checks` | `{reproducibility: {left, right}, review: {path, expected_sha256}}`; sides use the pipeline comparison's existing `{prepared, dist}` records |
| `rightsReview` | Independently selected `{path, expected_sha256}` |

Paths in selections are absolute. `checks.review` may be `null` to leave private
review unassessed. An absent rights review also remains unassessed. Supply an
empty installed selection array when no actual host acceptance exists. A missing
mandatory input cannot produce `ready`; malformed, stale or failed selected input
produces `blocked`. Unknown fields, including incoming `ready` or `passed` flags,
are rejected.

The CLI accepts one explicitly selected JSON file containing these five argument
names. On Windows use `pnpm.exe exec node release/readiness.cjs <selection.json>`;
on Linux use `pnpm exec node release/readiness.cjs <selection.json>`. It prints a
report and exits zero only for `ready`. The CLI reads the selected file; the
operator remains responsible for independently authenticating its selections.

## Review the current source and archive

The helper rechecks the prepared snapshot, candidate declaration, exact runtime
inventory, hash-bound rights and all three actual archives. The candidate's
prepared readiness implementation must match the calling implementation. It
re-runs the selected pipeline's two-build comparison. Payload content must match;
unexplained archive-byte differences block readiness. A separately pinned
`archive_variability` review can explain exact differing layers without claiming
byte-identical builds. Each entry binds `format`, `left_archive_sha256`,
`right_archive_sha256`, `run_ids` and `toolchains` to the actual comparison and
provides a substantive bounded `reason`. No other mismatch or omitted differing
layer is accepted. A control explanation stays operationally unassessed. The
report retains `archive_bytes: false` and the limited reproducibility claim.

Both private review records bind `source_revision`, `build_input_digest` and the
ordered three archive SHA-256 values in `artifacts`. Equal content, equal version,
an old checkout receipt or another host's success cannot transfer acceptance.

`readiness-rights-review` contains `schema_version: "1.0"`, `kind`, the identity
fields above, `observation_class`, `reviewer`, `outcome` and a substantive `reason`.
Review current ownership, redistribution authorization and included notices;
recording MIT in a JSON field does not establish those facts.

`readiness-review` has the same identity, reviewer and observation-class fields,
plus `archive_variability` (an empty array for byte-identical builds), `privacy`,
`core`, `regressions` and `installed`. `privacy` and `core` each
contain `outcome` and `reason`. Inspect the exact archive for private material and
review preservation of the existing owners. Neither hashes nor generic CI can
make these semantic judgments.

Every declared affected regression has one row with `entrypoint`, `tests`,
`failed`, `skipped`, `reason` and an independently pinned `report` selection.
The selected `readiness-regression-result` records the same candidate/artifact
identity, entrypoint, counts, executed `command` array and `observation_class`.
The helper reads and hashes those report bytes and matches identities/counts.
All five existing version-specific validators must be represented, with nonzero
tests, zero failures and zero skips. A competent reviewer must inspect execution
logs, required private inputs and version coverage. This aggregate does not run
an application or substitute counters for that review. The complete 44-criterion
runner belongs to the later final-validation gate.

## Authenticate actual installed acceptance

The helper re-runs `verifyInstalledEvidence` for each selected target. Mechanical
success still says `workflow_status: "not_assessed"`; it cannot grant operational
acceptance. The separately pinned readiness review must authenticate the exact
archive, index and competent-review digests and the index's exact host identity,
version, platform and connection.

Each `installed` review row contains `target`, `artifact_sha256`, `index_sha256`,
`review_sha256`, `host`, `scope`, `outcome: "passed"` and a substantive `reason`.
The six required scope entries are `two-applicants`, `bilingual-documents`,
`intake`, `fact-scopes`, `manual-preservation` and `pending-recovery-stop`.
These are review obligations: the reviewer must inspect actual current owner,
MCP, source, language, document, every-page, recovery and stopping observations.
Before operational acceptance, the index must also contain at least two distinct
applicant IDs, six distinct saved outputs and six distinct renders. These minimums
reject obvious scope contradictions; they cannot establish source, language,
member or recovery semantics. An enumeration cannot prove that the real workflow
happened. Authenticate the
observer and the reviewer's competence independently before selecting their
review digest. See [installed evidence](installed-evidence.md).

`observation_class: "control"` keeps privacy, rights, regression, core and workflow
acceptance unassessed even when all mechanical shapes pass. Deterministic
fixtures must retain that classification. `actual` and `host_judgment` labels
require independent authentication; changing a label does not create evidence.
Regression execution reports used for operational acceptance must be `actual`.
The Windows filesystem primary target is mandatory. Other formats retain
separate layout, host-load and workflow labels; an unobserved secondary workflow
may remain unassessed without blocking the primary claim.

## Read the decision and retain evidence

The closed `readiness-report` keeps source/artifact identity, eight named gates,
support rows, pinned review references and separate payload/archive reproduction
results. Historical `readiness` records retain their original schema. Reports
are records to inspect, never input approval tokens. `readinessStatus` is a pure
combination policy used by the aggregator; a unit test of eight passing gate
labels does not verify any release evidence. `hasMinimumWorkflowEvidence` checks
only the minimum distinct resource counts; it confers no workflow acceptance.

A failed mandatory gate returns `blocked`; otherwise any unassessed mandatory
gate returns `not_assessed`. Only eight passing mandatory gates return `ready`.
Retain failed evidence and existing private files. No result performs profile or
document mutation, installation, legacy deletion, publication, tagging, registry
writes or sibling-catalog changes. The later retirement gate must evaluate its
own approved scope and fresh accepted candidate.
