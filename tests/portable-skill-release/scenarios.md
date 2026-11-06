# Release maintenance tests

Six deterministic suites covering the minimal packaging path. All fixtures are wholly fictional; no suite builds a real candidate or claims installed acceptance.

| Suite | Verified behavior |
| --- | --- |
| contracts.test.cjs | Candidate declaration, prepared-candidate and artifact records validate against the closed packaging schema; unknown nested fields, version conflicts and nonserializable inputs fail closed |
| foundation.test.cjs | The declared test/release closure validates: core inventory matches the refinement acceptance manifest, every core hash matches current bytes, all planned criteria are mapped, and private, absolute, traversal, duplicate or redirected closure assets are rejected |
| inventory-rights.test.cjs | Exact inventory, reviewed rights and format destinations validate; changed bytes, missing or extra assets, unsafe paths and unresolved rights fail closed |
| preparation.test.cjs | Source snapshots stage the exact closed generic inventory from selected Git blobs without a checkout; prepared candidates verify without Git |
| fixtures.test.cjs | Packaged sample fixtures stay identity-free and schema-valid |
| adopter-guide.test.cjs | The adopter guide documents the actual packaging flow and links only to packaged resources |

```powershell
pnpm.exe release:test
node release/check.cjs
node tests/portable-skill-release/foundation.cjs
```

Definition checks and archive bytes establish neither installed-workflow acceptance nor host privacy review; both remain separate manual steps recorded outside these suites.
