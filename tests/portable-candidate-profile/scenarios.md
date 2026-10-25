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
