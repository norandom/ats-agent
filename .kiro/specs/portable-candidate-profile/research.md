# Research and Design Decisions

## Summary
- Feature: portable-candidate-profile.
- Discovery scope: new skill capability with existing preliminary data assets; full discovery.
- Requirements approved by the user on 2026-10-25. No implementation or private-profile migration authorized by design generation alone.
- The current schema validates its blank template but lacks the complete approved provenance, uncertainty and correction model.
- Use a versioned local schema, a verified external validator and executable host-tool protocols. No replacement Python application is needed.

## Research Log
### Existing contract
Reviewed only the generic 1.0 schema and empty template. Existing collection names are reusable. Inconsistent nullability, unrestricted status strings, missing conflict/update history and unvalidated record references require a new major contract. The existing candidate instance was not read for this design.

### Structural validation
Official sources reviewed: [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12), [validation specification](https://json-schema.org/draft/2020-12/json-schema-validation), [check-jsonschema usage](https://check-jsonschema.readthedocs.io/en/latest/usage.html), [uv tools](https://docs.astral.sh/uv/guides/tools/).

Historical command results on 2026-10-25 (paths below record the original execution, not current setup commands). The 1.0 schema is now retained at `skills/targeted-cv/schemas/cv-facts-v1.schema.json`; the original blank was replaced by the 2.0 scaffold at `skills/targeted-cv/templates/cv-facts.blank.json`:
- `uvx check-jsonschema==0.38.2 --version` reported 0.38.2.
- `uvx check-jsonschema==0.38.2 --check-metaschema schemas/cv-facts.schema.json` exited 0.
- `uvx check-jsonschema==0.38.2 --schemafile schemas/cv-facts.schema.json --output-format JSON templates/cv-facts.blank.json` exited 0 with no errors.

These checks establish compatibility with the existing 1.0 scaffold, not implementation of the future 2.0 contract. Use installed local schemas with internal references, no transformations or defaults. Whole-object array uniqueness does not validate uniqueness of an ID field across records; a semantic pass remains necessary.

### Skill and host conventions
Consulted Kiro design discovery, principles, synthesis and review rules, plus the skill-creator guidance already read in this session. References implement protocol responsibilities; release owns the entrypoint. External uvx tools may use Python internally without creating a maintained project Python program. File-tool availability and write guarantees vary by host and must be checked rather than assumed.

## Architecture Pattern Evaluation
| Option | Benefit | Cost or limitation | Decision |
| --- | --- | --- | --- |
| Skill protocol plus adopted CLI | Minimal distributable instructions and data assets | Host must execute semantic checks and safe file operations | Selected |
| Maintained JavaScript helper | Repeatable validation/update mechanics | Extra runtime and maintained code before a demonstrated need | Deferred |
| Replacement Python application | Familiar legacy stack | Conflicts with migration direction and adds application maintenance | Rejected |

## Design Decisions
### Version 2.0 and explicit migration
Preserve existing collection names and identifiers, but add nullability and evidence/conflict/history contracts. Keep the 1.0 schema only as the legacy validator; do not silently accept it as current. Migration is a reviewed, scoped update and preserves original bytes and sources.

### One validation pipeline
Sequential synthesis identified the same pipeline behind load, intake, correction and migration: select -> validate -> report or propose -> authorize -> stage -> verify. Reuse it rather than creating separate persistence behavior per input route.

### Adopt structure validation, specify semantic execution
Adopt check-jsonschema through uvx. Define deterministic ID/reference/date/state checks to run through host computation. An agent's visual reading is not execution evidence. No database, service API, plugin registry or generic storage adapter is necessary.

### Separate observation from receipt
Preserve supplied precision and observation dates. Intake receipt time is operational metadata; it does not extend an employment assertion into the present. Transferability against a job remains strategy-owned.

### Bound updates to a file and proposal
Reuse existing explicit authorization when it covers the selected destination and changes. A snapshot/diff plus same-directory staging and read-back provides a verifiable workflow; it does not establish universal atomic concurrency control. Require a single writer or defer mutation.

## Risks and Mitigations
- Host cannot run semantic checks or verify replacement: return not assessed/unconfirmed, never valid/updated.
- Schema migration loses original wording: preserve legacy bytes and sourced alternatives; block silent losses.
- Reference files become a second application: keep components as bounded protocols; add helper code only if implementation evidence justifies it.
- Personal facts leak into fixtures: use unrelated synthetic profiles and audit the packaged subtree in the release milestone.
