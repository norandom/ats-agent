# Project Structure

Updated: 2026-10-26

## Organization Philosophy

Separate reusable instructions and contracts from runtime candidate data, document sessions and generated applications. Preserve a clear distinction between the existing scorer and the planned portable skill; planned boundaries do not imply implemented modules.

## Existing Directory Patterns

- Root Python modules form the current CLI/scorer/parser application. Modules use snake_case names and direct local imports, such as `from ats_agent import ATSCVAgent`. This is a legacy pattern to retire, not the intended skill layout.
- `README.md` guides users through the intended application flow; it is not a development status report. `docs/` separates reusable candidate facts from per-application workflow and optional writing-skill setup. Link requirements and roadmap for technical detail and availability rather than duplicating them. Use COBESY composition for documentation structure and Humanizer for authored prose by default. Preserve technical identifiers, evidence limits and required Kiro templates. See `docs/writing-guide.md`.
- `skills/targeted-cv/schemas/` holds identity-free reusable data contracts: current `cv-facts.schema.json` and retained legacy `cv-facts-v1.schema.json`.
- `skills/targeted-cv/templates/` holds empty reusable inputs, such as `cv-facts.blank.json`. A blank scaffold is not a complete candidate profile.
- `skills/targeted-cv/references/application-strategy.md` routes the validated strategy workflow through its contract, evidence, editorial and review references. Private handoffs use `schemas/application-strategy.schema.json`; the final distributable entrypoint remains release work.
- `skills/targeted-cv/references/document-session.md` routes the validated host session through capability and operation references. `schemas/document-session.schema.json` defines private session records. JavaScript helpers are bounded checks; test drivers under `tests/wordcraft-document-session/` are not the runtime workflow.
- `private/` holds local candidate facts, offers, provenance and private reference analyses. `examples/` holds private supplied references. `outputs/` holds generated applications. All three are Git-ignored and excluded from release bundles.
- `.kiro/specs/` holds feature requirements, design, tasks and supporting decisions. `.kiro/steering/` holds durable cross-feature policies rather than a task catalog.

## Planned Skill Boundaries

Organize future instructions and assets around portable candidate intake, WordCraft document sessions, employer-oriented strategy, application documents, iterative refinement and standalone distribution. The authorized milestone split replaces the initial brief's provisional single-spec approach; detailed sequencing belongs in the roadmap and specifications.

Use a dedicated distributable skill subtree with `SKILL.md` and only approved supporting references, contracts and templates. The profile assets use `skills/targeted-cv/`; the final entrypoint and build layout remain release work. Do not imply that a release artifact already exists. Follow sibling `../Skills` conventions without modifying its catalog or requiring that checkout at runtime.

## Naming and Dependency Rules

- Use descriptive kebab-case feature/skill and reference names, following existing Kiro specifications; retain established schema/template filenames.
- Resolve reusable resources relative to the skill installation. Resolve candidate inputs from the explicit runtime path or documented workspace-relative default; never bake in developer-machine paths.
- Keep source IDs and claim IDs inside the private evidence workflow. Public templates may define structure, but must not include candidate history, contacts, metrics or qualifications.
- Keep canonical facts separate from per-application settings and live document state. WordCraft edits must preserve user changes and must not implicitly rewrite canonical facts.
- Keep operational details, methodology and diagnostic tables in private review material, not the employer-facing CV or letter.
- Write specification Markdown in `spec.json.language`; the originating migration specification uses English. Do not confuse specification language with document output language.

## Migration Discipline

Retain legacy files until replacement validation warrants removal. Update documentation when implemented behavior changes. Validate distribution from the packaged artifact, not merely from the development checkout, and keep roadmap/spec detail out of durable steering.
