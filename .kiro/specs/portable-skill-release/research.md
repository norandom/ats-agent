# Research and design decisions

Date: 2026-10-29. Requirements are approved; this log records integration-focused extension discovery and proposed design decisions, not completed implementation or installed acceptance.

## Summary

- Feature: portable-skill-release.
- Discovery scope: extension of existing release tooling, with explicit installed-host acceptance.
- Current build/archive mechanisms are reusable; they require complete current asset selection, source identity and independent installed evidence.
- No new external library or host API is selected. Ecosystem metadata is a locally observed layout convention, not a claim of current official host support.
- The user selected MIT for project-owned code and skill content during design. Third-party authorization remains a separate per-asset check.

## Research Log

### Reuse the existing release tooling

The scoped alpha already has explicit file selection, staging, normalized archive metadata, ZIP and skill artifacts, checksums and archive-content verification. See `release/package.cjs`, `release/prepare.cjs` and `release/check.cjs`. The existing Dagger and GitHub release paths provide maintenance entrypoints; they do not establish installed workflow acceptance.

The release manifest currently lists 25 runtime files, while the current skill has 31. It omits the two refinement references, the application-scoped profile and refinement schemas, and the retained strategy/document 1.1 schemas. Release preparation and Dagger checks still use the earlier document milestone's acceptance scope. Package metadata and historical alpha notes explicitly describe that earlier scope. New candidate metadata must describe the selected current scope without rewriting historical claims.

### Distinguish packaging support from desktop support

Existing adopter instructions install one skill folder and keep its references, schemas and templates together. WordCraft MCP supplies the document engine; the host supplies reasoning. The documented exercised desktop connection is Windows-local. Neither Linux build execution nor a sibling ecosystem's catalog proves this skill works in every host/platform combination.

The sibling Skills ecosystem provides canonical skill folders, entrypoint versions and generated Codex, Claude and Gemini package/catalog conventions. M5 can follow those conventions while keeping this repository independent. The supported target list and installation evidence must be declared for this skill. No sibling catalog change or runtime checkout dependency is authorized.

### Resolve rights before release readiness

Repository discovery found no root project license or notice declaration, no package license field and no license asset in the current release inventory. The user subsequently selected MIT for project-owned code and skill content. That resolves the project license choice, not ownership or redistribution rights for every third-party asset; those remain explicit checks before readiness. Optional writing skills already have user-choice and fallback instructions; a setup link does not authorize bundling their content.

### Gate legacy removal

The maintained legacy scorer, parser, industry and German guidance modules, entrypoint, example, requirements and model-environment example remain tracked. Active legacy instructions also remain linked. Removal must follow installed replacement acceptance and preserve ignored user files. No Git-history rewrite or recursive deletion of private example folders is implied.

### Requirements composition

The reader is an adopter installing a package or a maintainer deciding whether it can replace the old application. The governing question is whether the exact distributed artifact works independently and can be shared. Requirements therefore cover identifiable installation, package privacy, prerequisites, installed acceptance, adopter guidance, rights/local readiness and conditional retirement. Packaging layout, exact host adapters, version increments and file-removal lists belong in design and tasks.

### Installed runtime prerequisites

The approved profile, strategy and document references require exact pinned schema validation through uvx. This is not merely a build dependency. The host must also execute the embedded JavaScript checks with trusted filesystem adapters. Dagger and checkout test harnesses are maintenance-only; a supported host that uses external Node/pnpm for those adapters must declare that runtime need explicitly. Missing execution or schema validation remains unassessed, never a semantic pass.

### Source and artifact identity

The existing package has no selected source revision, and synthetic Git initialization inside staging cannot reconstruct it. Capture source provenance before staging. Bind installed evidence to exact archive bytes and the entire installed inventory, including templates and package extras. M4's exclusion of templates from its runtime hash map cannot become the release inventory rule.

### Version and ecosystem observations

`VERSION` and `package.json` already hold the alpha release version. The current entrypoint has name/description but no version field. Preserve that validated core instead of adding a redundant field solely to mimic another skill. Generated plugin metadata takes identity from the release definition. Local sibling plugin layouts contain generic, Codex, Claude and Gemini metadata beside a skills directory; their local conformance and actual host loading are separate evidence classes.

## Architecture Pattern Evaluation

| Approach | Decision | Reason |
| --- | --- | --- |
| Extend existing release scripts and normalized archives | Selected | Reuses working tooling; add source identity, independent verification and current scope |
| Add an installer service or new document bridge | Rejected | Not needed for filesystem installation or existing MCP; expands runtime ownership |
| Copy M4's relocated checkout and call it installation acceptance | Rejected | Executes a test closure rather than a fresh installed host workflow |
| Fresh sessions over an extracted artifact, with external observation/verifier tools | Selected | Exercises actual installed instructions and owners; keeps test orchestration outside the package |
| Rewrite core runtime for release-only setup and samples | Rejected unless a demonstrated portability defect requires it | Package-only extras satisfy onboarding without invalidating validated core behavior unnecessarily |

## Design Decisions

### Generalization: one artifact identity across release gates

Package integrity, installed acceptance, rights and retirement all need the same selected identity. Use a release definition, exact archive references and an independently selected evidence digest rather than unrelated pass flags. Separate declarations, actual observations, deterministic controls and host judgments. These are closed maintenance records, not a new application state engine.

### Adopt the existing mechanisms

Reuse Node built-ins, pinned schema tooling, ZIP normalization, existing Dagger/CI entrypoints and the official WordCraft MCP. No new dependency is selected. No external API contract is introduced. Record and verify baseline tool versions during implementation; do not present them as latest versions.

### Simplify the package boundary

Preserve the 31 validated core assets. Add an explicitly mapped package README, fictional current sample, MIT text, notices and generated release metadata as package extras. Keep their sources in release/fixture/license locations rather than changing the runtime solely to add packaging. M5 binds every installed file; M4's original core evidence remains historical or current only within its actual unchanged scope. If core content changes, revalidate through its owning boundary instead of editing old evidence.

### Keep support claims narrow

The first operational target is an explicitly selected Windows-local filesystem installation with the actual host and WordCraft connection recorded during acceptance. Portable archives and ecosystem wrapper layouts can be checked independently. A generated wrapper cannot advertise desktop operation until its host/platform workflow has been exercised. No sibling catalog is changed.

### Use two accepted source revisions for retirement

Accept candidate A while legacy remains. Apply only the approved tracked retirement diff, then build candidate B with its new source identity. Validate B before declaring retirement complete. Do not create a circular prerequisite that demands retirement before authorizing it, and do not reuse A's receipt as evidence for B. A prior revision and dedicated diff provide recovery without destructive reset or history rewriting.

### Close discovered integration details

Follow-up codebase checks identified four local draft issues. Portable ZIP/skill and plugin ZIP need distinct archive roots and explicit extra-asset destinations. Dagger's new provenance arguments must be supplied by both local and CI callers. The prepared build context must include the independent verifier, current declarations and M5 maintenance assets. Archive outputs must be fresh because ZIP otherwise updates an existing destination. The design now states these boundaries explicitly.

The installed profile persistence adapter must preserve the full upstream guarantees: stable identity, single-writer assurance, security-preserving stage/backup/replacement, exact read-back and authenticated decision scope. A fictional acceptance profile does not justify weakening those contracts.

## Risks and Mitigations

- An installed host could read checkout helpers accidentally. Retain resource-use observations, provide only raw selected fixtures, and fail acceptance on checkout/sibling application-code use; do not claim an OS sandbox.
- A CI build cannot by itself exercise the local desktop. Separate deterministic/archive results from the connected host's current artifact-bound observations.
- Equal payloads can have different archive bytes. Measure byte and content reproducibility separately, record tool identities, and bind acceptance to the actual selected archive.
- MIT does not settle third-party ownership. Record source-specific rights and notices; link optional skills and source publications without bundling them.
- Legacy removal could affect private material if treated as a directory cleanup. Restrict it to named tracked paths, preserve ignored directories and retain a recovery revision.

## References and consulted guidance

- Local primary sources: `release/check.cjs`, `release/prepare.cjs`, `release/package.cjs`, `release/manifest.json`, `.dagger/src/index.ts`, `.github/workflows/release.yml`, `VERSION`, `package.json`.
- Runtime and prior acceptance: `skills/targeted-cv/`, `tests/live-application-refinement/full-acceptance.cjs`, `acceptance-check.cjs` and `relocation.cjs`.
- Adopter setup: `docs/wordcraft-setup.md`, `docs/writing-skills.md` and `docs/your-facts.md`.
- Sibling discovery only: canonical skill folders and generated plugin metadata in the locally selected Skills repository. No runtime dependency is proposed.
- Kiro design principles, extension discovery, synthesis and design-review gate supplied the boundary, interface, traceability and pre-write review structure.
- Skill-creator guidance favored a concise entrypoint, progressive loading, necessary package-local documentation and fresh host evaluation without an intended output.
- COBESY and Humanizer, through `docs/writing-guide.md`, informed outcome-first structure and plain prose. They do not establish source truth or readiness.
