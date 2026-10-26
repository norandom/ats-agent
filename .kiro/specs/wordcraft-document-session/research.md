# WordCraft Discovery and Design Gate

## Current decision: existing WordCraft MCP only

On 26 October 2026 the user confirmed live authoring and read-back through the existing WordCraft MCP and excluded other services. This decision supersedes the historical blanket blocker and custom-bridge proposal below. No bridge source was patched or built.

The installed 0.10.0 desktop was launched with --control 7981; the existing CLI connected with mcp --connect 127.0.0.1:7981. Fictional CV and cover-letter probes exercised new_document, type_text, select_text, get_text, save_document and open_document. Revised text was read back through MCP after save/reopen. The CV text came from the tracked fictional facts fixture. Raw plans and receipts remain in ignored outputs/live-mcp-check/. These small lifecycle examples do not establish finished styling, DIN compliance or full milestone acceptance.

Document verification uses MCP directly. Earlier UI observations were supplementary, not a runtime dependency. No other document service or UI automation is required. The transport replay observation remains valid, but the skill's responsibility is to inspect uncertain outcomes before initiating a retry, without claiming exactly-once transport delivery. Sequential before/after inspection is not a native lock against simultaneous typing.

Implementation and final validation completed on 26 October 2026. The accepted fictional run covers both document lifecycles, inspected preservation, conflict handling and lost-response recovery. Initial visibility combines explicit user confirmation with actual MCP page observations, retaining the false MCP focus flag. All 65 relocated tests passed. See [validation-report.md](validation-report.md); the historical investigation below does not override that scoped result.

## Historical discovery

The entries below preserve earlier investigation. Their blanket blocking conclusions and custom-bridge recommendations are superseded by the current decision above.


## Summary
- Feature: wordcraft-document-session; discovery scope: complex integration.
- Requirements approved by the user on 2026-10-25.
- Installed WordCraft CLI 0.10.0 exposes a working headless MCP server. A synthetic lifecycle probe succeeded.
- The installed-version GUI bridge internally retries I/O-failed requests without prior reconciliation. This conflicts with approved uncertain-write requirements 5.2–5.4.
- Design finalization is blocked for live GUI mutations. No design.md or design-generated approval is claimed while this conflict remains.

## Research Log
### Installed and exposed capabilities
The session's exposed tool inventory contains no WordCraft tool. Local discovery found the installed desktop and CLI; `wordcraft-cli --version` reports 0.10.0. The running desktop process had no observed TCP listener. These are local observations, not claims about other installations.

CLI help documents `wordcraft-cli mcp` over stdio, headless by default, or `--connect HOST:PORT` for a desktop bridge. Headless `--automation-read-root DIR` and `--automation-write-root DIR` restrict access; omitted roots grant no corresponding access. Those flags are incompatible with `--connect`.

A short-lived child MCP process was launched with read/write roots restricted to `private/wordcraft-probe/`. It negotiated protocol 2024-11-05 and identified server wordcraft 0.10.0. No persistent host configuration or existing GUI document was changed.

### Discovered MCP contracts
Actual tools/list returned these relevant tools:

| Tool | Observed arguments | Notes |
| --- | --- | --- |
| list_commands | query filter | Command-specific contracts must be discovered before execution |
| new_document | template optional | Blank/sample/letter/resume/report advertised |
| open_document | path required; password optional | Do not place passwords in logs or command lines |
| save_document | path optional | Extension determines export; omit path to save in place |
| type_text | text required; paragraphs optional | Replaces selection or inserts at caret |
| select_text | text required; occurrence optional, 1-based | Text may be ambiguous; not a durable anchor |
| get_text | no required args | Body text, tracked deletions omitted |
| inspect_document | no required args | Structure, formatting, parts, selection and pages |
| render_page | page optional, 1-based; scale optional | Returned PNG image content in probe |
| execute | command required; params optional | Must use discovered command schema |
| batch | command sequence | Non-transactional; see versioned source finding |

Additional desktop-only tools are screenshot, click, key and ui_inspect. The headless probe did not validate them. Tool/catalog mutation hints are not a sufficient safety classifier: file creation/open/save/export and undo can have effects despite catalog `mutates:false` values.

### Executed synthetic lifecycle
Through MCP tools/call, executed in order: new_document, type_text with three synthetic paragraphs, save_document to a new DOCX, inspect_document, select_text on the unique last sentence, type_text replacement, save_document in place, open_document, get_text, inspect_document, render_page.

All calls returned without an error. Read-back retained the unrelated sentence and showed the targeted replacement. The DOCX was 6,601 bytes. The returned PNG was saved and visually inspected: one page with the three expected text lines. This is a minimal text-edit/render proof, not validation of CV formatting, DIN layout or arbitrary document fidelity.

Raw tool schemas, synthetic call records, DOCX and PNG are in ignored `private/wordcraft-probe/`. No candidate data was used. Tools were called through a temporary stdio client because no host connector was exposed; the final skill should use a configured MCP connection, not a baked-in machine path.

### Identity and concurrency limits
inspect_document returned blocks, canRedo/canUndo, comments, pages, parts, properties, sections, selection, trackChanges and words. No stable document ID or expected-revision token was observed. A path plus process/session reference can identify the selected file but must not be represented as a native durable document identity guarantee. Unsaved-document identity, manual-edit detection and conflicting edits still require dedicated proof.

### Versioned official sources
Reviewed v0.10.0 tag, resolving to commit `9130181a5fdaee2293e67756fd5458c601489f3c`:
- [Control protocol](https://github.com/storytold/wordcraft/blob/v0.10.0/docs/control-protocol.md): launch desktop with `wordcraft --control PORT` or the process environment control-port setting; listener binds loopback. The CLI bridge obtains the control key from its environment/profile rather than requiring it printed.
- [Bridge backend](https://github.com/storytold/wordcraft/blob/v0.10.0/crates/mcp/src/backend.rs#L158): exchange retries once after I/O failure, including a failure after sending the request. The coordinator independently read this source region. There is no reconciliation before that replay.
- [MCP tools](https://github.com/storytold/wordcraft/blob/v0.10.0/crates/mcp/src/tools.rs#L194): batch runs sequentially; stopping on an error does not roll back earlier successful commands.
- [Desktop main](https://github.com/storytold/wordcraft/blob/v0.10.0/apps/wordcraft/src/main.rs), [recovery](https://github.com/storytold/wordcraft/blob/v0.10.0/docs/recovery.md), [control-key](https://github.com/storytold/wordcraft/blob/v0.10.0/crates/control-key/src/lib.rs): source supports an isolated child profile and disabled preferences/recovery for synthetic testing. Separate-instance behavior was not executed.
- [Cargo metadata](https://github.com/storytold/wordcraft/blob/v0.10.0/Cargo.toml): workspace declares MIT OR Apache-2.0. This is not a clearance of every bundled asset/dependency.

## Architecture Pattern Evaluation
| Option | Evidence | Decision |
| --- | --- | --- |
| Native headless MCP | Minimal lifecycle demonstrated | Suitable for bounded generation probes; not proof of live desktop editing |
| Installed 0.10.0 GUI bridge | Documented attachment; automatic replay found | Block live mutation use under current requirements |
| Direct desktop control instead of MCP | Different transport may avoid bridge retry | Not silently substituted for required MCP engine |
| Fixed compatible MCP bridge/version | Could preserve requested live workflow | Verify exact implementation and lost-reply behavior before adoption |

## Design Synthesis
One capability evidence record can describe every operation without separate engine-specific wrappers. Single selected document plus explicit pre/post snapshots is sufficient for ordinary sequencing, but snapshot comparison alone does not establish atomic preconditions or protect concurrent manual edits.

Adopt the actual WordCraft MCP contract rather than implementing a new document engine. Do not add a retry wrapper: a wrapper cannot stop replay already performed inside the installed bridge. A safe live design needs verified no-replay/idempotency behavior and either enforceable edit preconditions or a demonstrated exclusive editing window.

## Design Gate Finding
Requirements 5.2–5.4 require inspection before retrying an uncertain write. The installed GUI bridge replays internally first. Requirements 4.1–4.4 also need a verified approach to manual edits/concurrency; no native CAS/revision mechanism was found in the inspected contracts.

The core requirement is clear; the external implementation does not yet provide sufficient verified guarantees. Keep requirements approved, design generated=false, and implementation readiness=false. Do not weaken those requirements implicitly or invent native protections.

## Resolution and Next Evidence
1. Identify or obtain a compatible MCP bridge/version that does not automatically replay uncertain mutating requests, or implements demonstrated idempotency/reconciliation.
2. Verify desktop attachment in a separate synthetic session; leave the user's existing document untouched.
3. Establish document identity and an edit protocol that preserves manual changes. If no CAS exists, prove a workable exclusive-turn interaction and report its limits.
4. Fault-test a lost reply and confirm the target edit occurs once; test intervening conflicting/non-conflicting user edits and reconnect behavior.
5. Rerun the design review gate, then finalize design.md. No changes to external WordCraft source, installation or host configuration were made in this design turn.

## Installed-binary verification on 26 October 2026

The installed CLI remains 0.10.0 and exposes no retry-control switch in its help. The host tool inventory still exposes no direct WordCraft connector. A synthetic endpoint probe now reproduces the transport concern against that installed executable: one MCP `new_document` call produced two identical `engine.execute` / `file.new` deliveries after the endpoint recorded the first request and dropped its reply. The caller reported no error. The probe exited successfully; this result confirms a dependency defect scenario, not milestone acceptance.

The probe is `tests/wordcraft-document-session/bridge-replay-probe.cjs`. It uses a process-local synthetic key, records no authentication fields, and does not access the real desktop or candidate inputs. No installation or persistent configuration was changed.

Independent source discovery checked release 0.11.0 at `e31f2f06a5f8004ceaa88f68c00b47908e321aa4` and main at `6a2b520fa49aa0d0595cea36589aaf16ca371cd3`. Neither establishes no-replay behavior after a lost reply. Main excludes InvalidData failures, which does not resolve EOF or timeout ambiguity. Sources and a bounded proposed remedy are in [the resolution proposal](resolution-proposal.md).

Current main adds `list_documents` and optional `doc` targeting. Its [identity implementation](https://github.com/storytold/wordcraft/blob/6a2b520fa49aa0d0595cea36589aaf16ca371cd3/crates/engine/src/session/documents.rs) scopes IDs to the process and lifetime of an open document. This is useful new discovery, not proof of restart identity or public compare-and-swap. Dedicated live identity and manual-edit evidence remains pending.

Synthesis: retain the skill's narrow document-session boundary. A locally patched external bridge is a separate scope decision, not an invisible helper or a replacement document engine. The proposed next step is an isolated external-dependency fix with fault testing, followed by live session evidence and design review. The approved requirements are unchanged; design generation remains pending.

Kiro design discovery and synthesis guided this investigation. COBESY's reader/decision structure and Humanizer's plain technical prose guidance informed the resolution proposal; neither is treated as execution or safety evidence.

## Revised design synthesis

The existing-MCP design groups work into capability discovery, document operations and a session entry protocol, with one private record schema. It adopts the official MCP rather than a custom transport. Host reasoning performs semantic comparisons; deterministic tests validate records and scripted transitions, while real MCP receipts prove integration. An independent design gate passed all 39 criteria. Pending intent and baseline must be persisted before mutations so interrupted work can resume. The design is generated, not yet human-approved or implemented.
