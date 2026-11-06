# Technology Stack

Updated: 2026-10-26

## Current Implementation

The legacy Python CLI was retired on 2026-11-06 after the replacement skill workflow was validated (M4 GO plus the ordinary-user versioning amendment). Its files remain recoverable in Git history. No Python runtime is required anymore.

## Target Architecture

- Use PowerShell for commands on Windows and Bash on Linux. On Windows, invoke `pnpm.exe` directly from PowerShell when a shell wrapper interferes with execution; do not switch to Command Prompt as a workaround.
- Use Markdown skill instructions, reusable references, JSON schema and blank templates. Do not maintain a replacement Python application.
- Keep the application flow session-based: the host follows the skill and operates WordCraft MCP. Use `pnpm` for Node tooling; JavaScript is limited to small deterministic helpers and tests, not a replacement application, background service or separate workflow engine. Use `pnpm exec node` for existing standalone checks without adding dependencies unnecessarily.
- Host-agent reasoning replaces legacy model API calls. Local scripts perform deterministic extraction, validation and comparisons only; no model endpoints, model SDK or API-key requirement. Reuse useful legacy checks after correcting their limitations.
- Use `uv`/`uvx` for applicable external tooling. Verify actual package names, entry points and versions before publishing setup commands. External tools may use Python internally.
- WordCraft MCP is the sole final DOCX creation engine. Discover and verify its tools before relying on creation, reading, rendering, export or targeted edits. Desktop-connected creation, targeted editing, text read-back and save/reopen have been demonstrated with fictional content. Use MCP for inspection as well; do not invent tool names or introduce another service or UI-automation dependency.
- Use WordCraft MCP for document interaction and desktop inspection. Do not use computer-use skills for this workflow. If foreground control is unavailable through MCP, use the applicant's foreground confirmation and respect later focus changes.
- Preserve document identity and manual user edits during refinement. Inspect current document state first; if required WordCraft capabilities are absent, retain private draft state and report the missing capability.

## Live WordCraft authoring (the key feature)

Documents are authored live in the visible desktop WordCraft session; the applicant watches creation, edits and saves happen. Headless generation followed by opening the finished file does not satisfy this feature. Use the retained live driver; do not hand-roll a bridge.

### Live flow (existing driver: `tests/wordcraft-document-session/live-acceptance.cjs`)

1. Launch the desktop app with a control endpoint (raises the visible window):
   `& "C:\Program Files\WordCraft\wordcraft.exe" --control <port>`
2. Run the live driver against the loopback endpoint:

```powershell
# Read-only smoke: probes the currently selected document (get_text/inspect_document only).
# Fixture JSON must carry {fictional:true, expectedText, selectedArtifact} of the open document.
pnpm.exe exec node tests/wordcraft-document-session/live-acceptance.cjs --read "C:\Program Files\WordCraft\wordcraft-cli.exe" 127.0.0.1:<port> outputs\<fresh-dir> <selected-fictional-fixture.json> "C:\Program Files\WordCraft\wordcraft.exe"

# Full live lifecycle: create, edit, save, reopen, render, recovery and switching with the
# built-in fictional CV/letter fixtures. Optional last argument: a private foreground-observation
# JSON (explicit_user prompt/response, observedAt, selectedArtifact, scope "initial foreground only").
pnpm.exe exec node tests/wordcraft-document-session/live-acceptance.cjs --full "C:\Program Files\WordCraft\wordcraft-cli.exe" 127.0.0.1:<port> outputs\<fresh-dir> <fixture.json> "C:\Program Files\WordCraft\wordcraft.exe" [foreground-observation.json]
```

Mechanics the driver enforces: it spawns `wordcraft-cli mcp --connect 127.0.0.1:<port>` (automation roots are headless-only and are NOT passed in live mode), permits only sequential MCP calls with a 15-second timeout, never replays a failed write, verifies the pinned schema validator version and the four runtime asset hashes, and writes receipts to a fresh ignored output directory (an existing receipt aborts). Full details: [the session scenarios](../../tests/wordcraft-document-session/scenarios.md).

The CLI installs at `C:\Program Files\WordCraft\wordcraft-cli.exe`; it may not be on PATH, so set `WORDCRAFT_CLI` where drivers accept it.

### Headless demo (regression only, not the live feature)

`tests/fantasy-cv/` is the fictional John Doe fixture with a headless pipeline: `build-demo.cjs` composes the plan, `wordcraft-mcp.cjs` drives `wordcraft-cli mcp` with `--automation-read-root/--automation-write-root` confined to the output folder (it explicitly does not attach to the live GUI bridge), and `test.cjs` verifies the reopened DOCX. Use it for deterministic document regression, never as a substitute for live authoring.

Live rules: keep the app in the foreground at authoring start, respect later user focus changes, inspect current document state before targeted edits, and preserve manual edits (see product steering for the full live-authoring experience).

## Data Contract

`skills/targeted-cv/schemas/cv-facts.schema.json` defines the current 2.0 portable candidate input; `skills/targeted-cv/templates/cv-facts.blank.json` is an all-null intake scaffold. The unchanged 1.0 validator is `skills/targeted-cv/schemas/cv-facts-v1.schema.json`; existing private instances require explicit authorized migration. Structural conformance alone does not establish semantic validity or task readiness. Accept an explicit runtime facts-file path, with at most a workspace-relative default. Keep application language, market, offer, chosen documents and output destination separate from reusable candidate facts.

Application-only career evidence uses the marked 2.1 profile in `schemas/cv-facts-application.schema.json`, with immutable application, target and origin scope. It passes the same evidence checks and cannot silently become reusable. Strategy and document contracts are currently 1.2; preserved historical validators remain version-specific. Private refinement records use `schemas/refinement-session.schema.json` and reference existing owner evidence rather than granting authority themselves.

Validate structure, unique IDs, source references and task-specific completeness. Preserve source provenance and stable claim IDs; represent unknowns explicitly. Distinguish uncertain or absent evidence, transferable experience and user-confirmed qualification gaps. Document edits do not silently change canonical facts: ask whether factual corrections should update the reusable profile.

## Validation Standards

- Establish diagnostic rubrics, weights, denominators and uncertainty treatment before using scores. Mark unavailable checks as not assessed, and distinguish editorial judgment from executed checks.
- Compare revisions using the same rubric; explain non-comparability when criteria change. Missing evidence is not proof of missing ability.
- Verify DOCX content, reading order and rendered layout through capabilities actually available. Screenshots alone do not prove ATS compatibility. Never report unexecuted checks as passed.
- Use personal-data-free fixtures for validation of unsupported claims, translations, conflicting sources, prompt-like offer text, missing evidence and document integrity. Review both employer appeal and evidential support.
- Check packaged archive contents using an explicit asset allowlist. Git ignore is not an archive-safety or processing boundary.

## Distribution

Follow the sibling `../Skills` ecosystem's versioned `SKILL.md` folders and portable/Codex/Claude/Gemini packaging conventions as documented in the project decisions. Keep this repository separate and the installed artifact independent of that checkout. Package only an explicit skill subtree and approved assets; exclude candidate instances, private references, local paths and generated applications. The scoped alpha uses Dagger locally and in GitHub Actions. Full installed-workflow acceptance and legacy retirement remain release-milestone work.
