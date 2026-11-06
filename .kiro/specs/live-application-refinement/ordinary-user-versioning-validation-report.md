# Ordinary-user versioning validation (refinement amendment)

## Validation Report

- DECISION: GO
- SCOPE: Refinement ordinary-user versioning amendment (tasks 8.1, 8.2, 9.1, 9.2, 10.1, 10.2) on the assessed ordinary-user Windows host. Installed acceptance, publication and legacy retirement remain M5 work; a fresh candidate rebuild is required before M5 tasks 6.1-6.4.
- MECHANICAL_RESULTS:
  - Integration regression at HEAD: five test areas, 199 reported tests, 197 pass, 0 fail, 2 skipped. The two skips are the documented live-evidence tests in `tests/live-application-refinement/recovery-evidence.test.cjs` that require retained private recovery artifacts through explicit environment selection; offline fixtures cannot supply them.
  - Versioned checkpoint suites: `checkpoint-storage.test.cjs` (closed wrapper, strict canonical decoding, independent outer/payload digests, live witnesses, legacy predecessors, write-free rejections) and `checkpoint-create.test.cjs` (write-free prepare, one-attempt create, read-only reconciliation, injected interruption controls, real ordinary-user native lease with `ordinary_user` true, protected-while-leased destination, occupied-destination conflict) all pass.
  - Versioned acceptance suite: `versioned-acceptance.test.cjs` passes; the closed current index/review contracts (`evidence-index.schema.json`) validate, chain links are exact, decoded-payload references close within selected roots, and changed, foreign, missing, cyclic, substituted and renamed evidence is rejected.
  - Semantic acceptance replay: after an explicitly reviewed re-record, all 14 integrated replays pass with real upstream and handoff validation. Observed decisions are identical to the prior reviewed record; only the SHA-256 hashes of the five assets changed by this amendment (`application-strategy.md`, `candidate-profile.md`, `profile-updates.md`, `refinement-session.md`, `refinement-checkpoint-storage.schema.json`) differ. The re-record is a reviewed acceptance run, not an automatic fix.
  - Release definition: `release/check.cjs` checkDefinition passes with 32 core resources and 36 assets; `refinement_checkpoint_storage: ["1.0"]` is declared in candidate.json, candidate.schema.json and candidate-definition.cjs; rights hashes and per-asset git provenance match current bytes.
  - Release test foundation: `tests/portable-skill-release/foundation.cjs` passes with the synced core inventory and maintenance closure.
  - Privacy: `tests/privacy/check-repository.cjs` passes across 487 shareable paths, working tree and index. No candidate data or machine-specific paths entered shareable assets.
- INTEGRATION:
  - The versioned checkpoint factory composes with the unchanged raw 1.0 record validator and legacy checkpoint factory; the single executable block invariant is preserved.
  - Strategy recognizes an owned source-to-successor selection only through a directly observed chain (exact prior binding, distinct confirmed destination, generation+1 live adoption, unchanged application identity and immutable 2.1 scope); without it a successor selection is a fresh non-comparable baseline with no invented delta.
  - The versioned acceptance verifier dispatches explicitly on index kind; historical filename-based verification is retained unchanged and no current file was renamed to satisfy it.
  - Historical schemas, validators and baseline validation report remain preserved; the earlier M4 GO remains valid for its scope.
- COVERAGE: Requirements 8.1, 8.2 and 8.3 are covered by the new suites and the updated acceptance integration: 8.1 by scoped successor integration (`strategy-continuity.test.cjs`) and versioned acceptance selections; 8.2 by checkpoint storage observation and create/reconcile/resume suites; 8.3 by stop/uncertainty guards exercised across storage changes and failed creates in `checkpoint-create.test.cjs` and the retained recovery suites. Baseline criteria 1.1-7.9 remain covered by the unchanged acceptance manifest mapping.
- DESIGN: Architecture and dependency direction align with the approved revision and file plan; no new service, model endpoint or document engine was introduced.
- OWNERSHIP: LOCAL
- UPSTREAM_SPEC: portable-candidate-profile (ordinary-user versioning, validated GO; its contracts are consumed unchanged)
- BLOCKED_TASKS: None.
- REMEDIATION: None required.

## Limits and next session

The scoped WordCraft smoke was not executed in this validation environment: no desktop WordCraft MCP connection is available here, so live document behavior remains covered by the earlier retained M4 receipts and the unchanged document-session suites, and no live claim is made. Actual ordinary-user checkpoint observations (native lease, protected destination, one-attempt create, read-only reconciliation) are retained privately under ignored `outputs/`.

Release archive, installation and reproducibility suites require `zip`/`unzip` tooling absent from this host; they were failing before this amendment and remain unassessed here. Installed acceptance remains M5 work.

Rebuild a fresh candidate from the current source and resume portable-skill-release group 6 (tasks 6.1-6.4) with fresh source-bound evidence. Do not transfer earlier candidate receipts to the new build. Legacy retirement, remote publication and sibling catalog changes remain outside authorized scope.
