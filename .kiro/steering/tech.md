# Technology Stack

Updated: 2026-10-26

## Current Implementation

The legacy application is a flat Python 3.10+ CLI. `main.py` calls `ATSCVAgent`; `cv_parser.py` extracts PDF/DOCX text and detects language. OpenAI provides model-assisted analysis; PyMuPDF, python-docx and langdetect support extraction and language handling. Environment configuration uses python-dotenv. The code defaults to `gpt-4o`, overridable by configuration. The user-facing README describes the intended skill workflow; legacy CLI instructions are separate.

These describe existing code, not the target skill's runtime contract. No vendor-specific ranking behavior is established by legacy heuristics.

## Target Architecture

- Use PowerShell for commands on Windows and Bash on Linux. On Windows, invoke `pnpm.exe` directly from PowerShell when a shell wrapper interferes with execution; do not switch to Command Prompt as a workaround.
- Use Markdown skill instructions, reusable references, JSON schema and blank templates. Do not maintain a replacement Python application.
- Keep the application flow session-based: the host follows the skill and operates WordCraft MCP. Use `pnpm` for Node tooling; JavaScript is limited to small deterministic helpers and tests, not a replacement application, background service or separate workflow engine. Use `pnpm exec node` for existing standalone checks without adding dependencies unnecessarily.
- Host-agent reasoning replaces legacy model API calls. Local scripts perform deterministic extraction, validation and comparisons only; no model endpoints, model SDK or API-key requirement. Reuse useful legacy checks after correcting their limitations.
- Use `uv`/`uvx` for applicable external tooling. Verify actual package names, entry points and versions before publishing setup commands. External tools may use Python internally.
- WordCraft MCP is the sole final DOCX creation engine. Discover and verify its tools before relying on creation, reading, rendering, export or targeted edits. Desktop-connected creation, targeted editing, text read-back and save/reopen have been demonstrated with fictional content. Use MCP for inspection as well; do not invent tool names or introduce another service or UI-automation dependency.
- Preserve document identity and manual user edits during refinement. Inspect current document state first; if required WordCraft capabilities are absent, retain private draft state and report the missing capability.

## Data Contract

`skills/targeted-cv/schemas/cv-facts.schema.json` defines the current 2.0 portable candidate input; `skills/targeted-cv/templates/cv-facts.blank.json` is an all-null intake scaffold. The unchanged 1.0 validator is `skills/targeted-cv/schemas/cv-facts-v1.schema.json`; existing private instances require explicit authorized migration. Structural conformance alone does not establish semantic validity or task readiness. Accept an explicit runtime facts-file path, with at most a workspace-relative default. Keep application language, market, offer, chosen documents and output destination separate from reusable candidate facts.

Validate structure, unique IDs, source references and task-specific completeness. Preserve source provenance and stable claim IDs; represent unknowns explicitly. Distinguish uncertain or absent evidence, transferable experience and user-confirmed qualification gaps. Document edits do not silently change canonical facts: ask whether factual corrections should update the reusable profile.

## Validation Standards

- Establish diagnostic rubrics, weights, denominators and uncertainty treatment before using scores. Mark unavailable checks as not assessed, and distinguish editorial judgment from executed checks.
- Compare revisions using the same rubric; explain non-comparability when criteria change. Missing evidence is not proof of missing ability.
- Verify DOCX content, reading order and rendered layout through capabilities actually available. Screenshots alone do not prove ATS compatibility. Never report unexecuted checks as passed.
- Use personal-data-free fixtures for validation of unsupported claims, translations, conflicting sources, prompt-like offer text, missing evidence and document integrity. Review both employer appeal and evidential support.
- Check packaged archive contents using an explicit asset allowlist. Git ignore is not an archive-safety or processing boundary.

## Distribution

Follow the sibling `../Skills` ecosystem's versioned `SKILL.md` folders and portable/Codex/Claude/Gemini packaging conventions as documented in the project decisions. Keep this repository separate and the installed artifact independent of that checkout. Package only an explicit skill subtree and approved assets; exclude candidate instances, private references, local paths and generated applications. Build integration remains to be designed and verified.
