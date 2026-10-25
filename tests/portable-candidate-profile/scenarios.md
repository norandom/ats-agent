# Portable profile verification

## Foundation (task 1)

Run `node tests/portable-candidate-profile/foundation.test.cjs` from the repository root. Node runs test-only host computation; it is not a candidate application or a distributed helper. No candidate path, source file, API key, model endpoint, WordCraft service or sibling checkout is used. Fixtures contain only synthetic probe values, not candidate information.

Each run creates a fresh `outputs/profile-tests/foundation-*` directory and retains `evidence.json`, local probe schemas, synthetic inputs, replacement output and original-byte backup there. `outputs/` is ignored. Evidence records command arguments and exit status without command output, host environment values or identifying absolute paths. Failed assertions still leave capability evidence for inspection. Do not copy private run evidence into distributable assets.

The approved installation base is `skills/targeted-cv/`. Resolve the current schema at `schemas/cv-facts.schema.json`, retained legacy schema at `schemas/cv-facts-v1.schema.json`, blank scaffold at `templates/cv-facts.blank.json` and protocols under `references/`, all relative to that installation base. Task 2 creates these assets; this foundation neither relocates the existing contract nor supplies a final `SKILL.md`. Test fixtures and evidence are not installation assets.

The executable probe uses these verified command forms within its isolated workspace:

```text
uv --version
uvx --version
uvx --from check-jsonschema==0.38.2 check-jsonschema --version
uvx --from check-jsonschema==0.38.2 check-jsonschema --schemafile probe.schema.json probe-valid.json
uvx --from check-jsonschema==0.38.2 check-jsonschema --schemafile probe.schema.json probe-invalid.json
```

The first run may need access to the package registry. The schema's reference resolves to a neighboring local definitions file; no remote profile schema, defaults or transformation options are used. The valid case must exit zero and the invalid referenced value must fail. A missing validator is exercised with an intentionally nonexistent executable inside the isolated workspace. The suite fails if required real capabilities are unavailable; a successful test of unavailable behavior does not make validation available.

| Scenario | Required observation | Scope |
| --- | --- | --- |
| Pinned local schema | Exact validator version; valid passes and invalid fails | 4.1 foundation only |
| Missing executable or interrupted command | `not_assessed`; no valid/ready assertion | 4.1 |
| Host computation and SHA-256 | Deterministic set result and known hash vector | 4.1 foundation only |
| Same-directory staging and backup | Staged bytes/hash/parse agree; original backup is byte-identical | 6.6 foundation only |
| Host rename replacement and read-back | Exact expected bytes/hash/parse after replacement | 6.6 synthetic primitive only |
| Unavailable single-writer/security assurance | Defer actual profile write | 6.6 |
| Missing read-back after attempted write | `unconfirmed`, never updated; inspect before retry | 6.6 |
| Isolation | Only fresh synthetic run files are written; no candidate file is accepted by the harness | 7.4, 7.5 |

Checks report `passed`, `failed` or `not_assessed`. Nonzero validator exit status is failure, not proof of a particular schema error by itself; the paired valid fixture establishes that the local reference works. Missing executables and interrupted processes are not assessed. The host computation probe is not the full semantic algorithm: `profile_semantics` remains `not_assessed` until later tasks execute that protocol.

The unique synthetic workspace establishes single-writer isolation only for these probes. A successful rename proves that primitive is available, not atomic compare-and-swap, authorization, full profile persistence or security preservation. Existing-destination permissions/ACL preservation is `not_assessed`, and `profile_write` remains `deferred`. Before a real write, the host must independently establish exclusive writing and security-preserving replacement, execute the update protocol, then reopen and validate. If capabilities are unavailable, retain the proposal privately without replacing the selected profile. If an attempted replacement or read-back is ambiguous, report `unconfirmed` and inspect the destination before retrying.

Later task scenarios extend this file with unrelated fictional candidates, requirement-linked actual observations, authorization decisions and failure injection. They must distinguish schema conformance, semantic validity, readiness and persistence. Task 1 does not claim those later acceptance criteria have passed.

## Integrated current-profile intake and correction (task 4.1)

Run `node tests/portable-candidate-profile/integration.test.cjs` on Windows with the verified Node, PowerShell and pinned uvx validator available. The test extracts the identical JavaScript blocks from all four references. Its host-reviewed source fixture is a recorded semantic interpretation, not an automatic prose extractor. It creates only fresh synthetic files under ignored `outputs/profile-tests/integration-*`; original backups and validation inputs remain there for inspection. No real private input is read.

| Requirements | Observed scenario assertions |
| --- | --- |
| 1.1, 2.4, 4.1 | Explicit blank selection, exact version dispatch, actual local schema validation and executable semantic checks on selected, proposed, staged and reopened JSON |
| 3.1 | Existing reviewed source spans produce intake; a new supplied user-answer span produces the correction through the same intake block |
| 4.4, 4.5 | Title pointer returns separate passed schema/semantics and incomplete readiness while the title conflict is open; the finding names the pointer and corrective action |
| 4.6, 5.4 | Private handoff retains unresolved conflict alternatives/questions; after sourced resolution the title task becomes ready while optional qualification date and CEFR remain null and the unrelated education question stays unresolved |
| 6.1, 6.3, 6.7 | Trusted synthetic user decisions bind exact intake/correction envelopes; repeating unchanged preparation reuses authority, with two decisions for two scopes; history retains both decisions and correction sources |
| 6.6 | Both writes report confirmed only after real .NET replacement, reopened hash/full validation, original-byte backup and protected destination/backup SDDL comparison; reselection supplies the updated baseline |
| 7.1 | All application settings remain in the separate session envelope and absent from persisted facts; unselected synthetic bytes stay unchanged |

The focused run passes 96 assertions with 18 actual schema-validator executions. Complementary regression commands are `node tests/portable-candidate-profile/intake.test.cjs`, `node tests/portable-candidate-profile/validation.test.cjs`, `node tests/portable-candidate-profile/evidence.test.cjs` and `node tests/portable-candidate-profile/updates.test.cjs`; the evidence suite covers all evidence-state distinctions. `persistence.test.cjs` separately owns write-failure injection. Task 4.1 does not exercise authorized legacy migration or claim complete feature acceptance.

Writer exclusion here is limited to the fresh unpublished test-owned directory. The Windows security observation covers the tested protected DACL/SDDL and backup, not unexamined audit, encryption or network filesystem policies. Actual destinations still require the full host assurance contract or a deferred write.

## Structural, semantic and readiness edge cases (task 5.1)

Canonical command: `node tests/portable-candidate-profile/edge-cases.test.cjs`.

Observed on 2026-10-25: **32 named outcomes passed, with 29 actual pinned check-jsonschema 0.38.2 executions**. The runner reuses the wholly fictional populated fixture and executes the unchanged blocks from `candidate-profile.md` and `profile-validation.md`. This closes the cross-layer evidence gap left by the focused semantic/evidence tests, whose schema-pass adapters isolate those algorithms. It adds no production helper or alternate semantic implementation.

Each run writes synthetic inputs, actual validator JSON diagnostics and `evidence.json` into a fresh ignored `outputs/profile-tests/edge-cases-*` directory. Evidence records case IDs, requirement numbers, expected and observed separate states, actionable findings, validator exit status and whether reference semantics executed. It is saved after each scenario, including a failing scenario; a failed or incomplete run is not acceptance evidence. The command fails if a required real validator is missing, interrupted or returns unexpected output. Raw diagnostics stay private; the summary contains no candidate facts or absolute paths.

In the table, `P`, `F`, and `NA` mean passed, failed and not assessed; the triple is **schema / semantics / readiness**. A readiness result applies only to the declared pointer, never to an entire application.

| Case IDs | Requirements | Observed result and evidence |
| --- | --- | --- |
| `valid`, `blank` | 2.1–2.3, 4.1, 4.4, 5.1 | P/P/ready for supplied name; P/P/incomplete plus `task_incomplete` for blank name |
| `malformed-json` | 4.1, 4.3 | Selection returns `parse_invalid`, repair action, no loaded profile; NA/NA/NA and validator never called |
| `unsupported-version` | 2.4, 2.5 | NA/NA/NA, `unsupported_version` with migration/recovery action; version 99.0 never reaches current validator |
| `malformed-record` | 4.1, 4.3 | F/NA/NA; actual validator rejects null candidate object and maps its diagnostic to `/candidate` |
| `duplicate-id`, `missing-source`, `wrong-kind` | 4.2, 4.3, 5.1 | P/F/NA; `duplicate_id` or `broken_reference` identifies affected ID/reference field and repair action |
| `invalid-calendar`, `impossible-chronology` | 3.4, 4.3 | P/F/NA; impossible leap day and disjoint reversed date intervals produce precise findings |
| `mixed-precision` | 3.4, 5.3 | P/P/ready for name with `ambiguous_chronology`; year/day precision remains unchanged, not guessed |
| `null-end` | 4.5, 5.3 | P/P/incomplete for required current state; both end and current remain null |
| `bounded-current`, `undated-current` | 4.5, 5.7 | P/P/ready for bounded historical assertion, versus P/P/incomplete when no observation date exists; both include `observation_limit` |
| `verification-upgrade` | 5.2 | P/F/NA; unsupported independent verification produces `verification_basis_required` |
| `evidence-supported`, `evidence-transferable` | 4.4, 4.5, 5.4 | P/P/ready; evidence view preserves supplied distinctions without offer-fit inference |
| `evidence-uncertain`, `evidence-absent`, `evidence-confirmed_gap` | 4.4, 4.5, 5.4 | P/P/incomplete for affected required name; evidence view retains each distinct state |
| `question-answered`, `question-skipped`, `question-not_applicable` | 5.5 | P/P/ready; sourced answer or nonblocking disposition and related IDs survive handoff; skipping is not a gap |
| `question-confirmed_gap` | 5.5 | P/P/incomplete for affected required record; user source and confirmed-gap disposition retained |
| `conflict-open`, `conflict-resolved`, `conflict-mismatch` | 3.3, 4.3, 4.5, 5.6 | Open required qualification P/P/incomplete; sourced equal resolution P/P/ready retaining both alternatives; mismatched canonical value P/F/NA |
| `required-missing`, `optional-unknown` | 2.3, 4.4–4.6 | Required email P/P/incomplete with pointer/action; required name P/P/ready while optional email, CEFR and education end remain null |
| `validator-unavailable` | 4.1, 4.4 | Actual nonexistent executable produces ENOENT and NA/NA/NA with `check_unavailable`; no schema-pass substitute |
| `semantics-unavailable`, `no-task` | 4.1, 4.4 | Injected semantic exception after actual schema success yields P/NA/NA; no task yields P/P/NA |

`bounded-current` deliberately uses an old observation year. Ready means the historical assertion is available with that recorded limit; the request contract has no evaluation-date field and does **not** establish present-day employment. Semantic unavailability is explicit fault injection, not an observation that host computation is unavailable in this environment. These tests validate supplied structure and recorded semantics; they do not authenticate source truth, interpret arbitrary prose or prove present-day freshness.

The complementary regression commands were also executed: `node tests/portable-candidate-profile/validation.test.cjs` (183 checks, three real schema executions), `node tests/portable-candidate-profile/evidence.test.cjs` (131 checks), `node tests/portable-candidate-profile/migration.test.cjs` (58 assertions, two real schema checks), and `node tests/portable-candidate-profile/intake.test.cjs` (53 assertions, two real schema checks). They retain detailed namespace, pointer, question-evidence, chronology and migration coverage without duplicating all permutations in this acceptance recorder. The unchanged 59-execution schema contract suite is not claimed as rerun for task 5.1. Candidate isolation, hostile-source scenarios, persistence-failure acceptance and complete feature acceptance remain tasks 5.2–5.4.
