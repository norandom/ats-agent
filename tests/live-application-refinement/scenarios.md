# Refinement tests

Deterministic suites plus the retained acceptance runner. All fixture applicants are wholly fictional; no suite authors real documents or reads candidate inputs.

## Run

```powershell
pnpm.exe exec node --test tests/live-application-refinement/checkpoint-storage.test.cjs
pnpm.exe exec node --test tests/live-application-refinement/checkpoint-create.test.cjs
pnpm.exe exec node --test tests/live-application-refinement/versioned-acceptance.test.cjs
pnpm.exe exec node --test tests/live-application-refinement/full-acceptance.test.cjs
```

The final runner checks selected actual bilingual refinement and interruption receipts, then runs the declared suites from an unrelated temporary directory. It reads retained evidence and never authors documents. Supply the explicit private evidence index, its independently trusted normalized SHA-256 digest and the host selection review; the runner never creates an index as a fallback.

```powershell
pnpm.exe exec node tests/live-application-refinement/full-acceptance.cjs <private-index.json> <trusted-index-sha256> <private-index-review.json> [--smoke]
```

## Versioned checkpoint storage (deterministic)

| Suite | Verified behavior |
| --- | --- |
| checkpoint-storage.test.cjs | Closed wrapper schema; strict canonical base64 and UTF-8 decoding; independent outer and payload digests; live nonserializable witnesses with a private registry (mutation, cloning and foreign factories fail); legacy raw 1.0 predecessors with coincident hashes; mutated, malformed, incorrectly hashed or foreign predecessors fail without file writes |
| checkpoint-create.test.cjs | Write-free prepare (authorized workspace, trusted predecessor or passed baseline inspection); one-attempt create through the verified create/inspect lease; read-only reconciliation; injected interruption (lost response without receipt stays unconfirmed with no replay); conflicts, policy and capability tampering rejected; real ordinary-user native Windows lease with protected destination and exact previous binding |
| versioned-acceptance.test.cjs | Closed versioned evidence index and selection review contracts; explicit ordered checkpoint chain with exact previous links (legacy raw only as the oldest terminal baseline); decoded-payload reference closure within selected roots; changed, foreign, missing, cyclic, substituted and renamed evidence rejected; current versus historical verifier dispatch |

## Retained acceptance scenarios

| Scenario | Retained observations and controls | Criteria |
| --- | --- | --- |
| Mixed fact choices and bilingual refinement | Actual application-only correction, exclusive fork, selective promotion, chronology and unrelated manual prose/format preservation; four separate editable members | 3.4 through 3.12, 4.1 through 4.6, 5.1 through 5.6 |
| Current checkpointed follow-up | Actual pre-write checkpoints, application-only follow-up, restored answered disposition and suppressed repeat question; deliberate pending German letter then current verified members | 1.3, 2.1, 2.2, 3.5, 4.8, 5.4 |
| Interrupted edit | Actual unacknowledged edit, reconnect, inspected effect, owner reconciliation, zero replay and save only after reconciliation | 4.7, 7.1 through 7.4 |
| Isolation and stopping | Thirty separately labeled deterministic controls; actual stopped trace has no later MCP calls | 2.5, 2.6, 3.13, 4.9, 7.2 through 7.9 |
| Role-only and diagnostic limits | Contract/control assertions retain unassessed coverage, unchanged/lower/null comparisons and source-bound reporting | 1.2, 1.6, 6.1 through 6.6 |

The acceptance manifest maps the 56 baseline criteria to executed suites and concrete source assertions; the amendment criteria (8.1 through 8.3) are covered by the versioned suites above and recorded in the amendment validation report. The versioned acceptance verifier dispatches explicitly on index kind: the current `m4-versioned-evidence-index` selects exact versioned files and their decoded reference closure, while the historical `m4-evidence-index` path is retained unchanged. No current file is renamed to satisfy historical verifiers.

Current scenarios require profile 2.1 and strategy/document contracts 1.2. Historical profile 1.0 and strategy/document 1.0/1.1 validators remain distinct retained assets. No historical fixture is migrated merely to make a test pass.

Run the repository privacy checker separately against the explicitly selected private facts file. Machine paths and actual reports stay private under ignored outputs. Live observations establish supported document revisions and safe recovery within their recorded bounds; no hiring probability, universal ATS prediction, numerical score gain or full normative DIN conformity is asserted.
