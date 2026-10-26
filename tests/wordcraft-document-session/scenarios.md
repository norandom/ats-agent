# Document session verification

Run deterministic foundation checks with `pnpm exec node --test tests/wordcraft-document-session/foundation.test.cjs`. These use simulated transport responses and do not establish live WordCraft support. The fixtures contain only invented CV and letter content. No runtime feature flag applies: these helpers are test-only, outside the shipped skill.

For the read-only smoke, explicitly select a fictional document already displayed in WordCraft and a fresh private output directory. Prepare a private JSON file containing `fictional: true`, `selectedArtifact` (the selected document path) and `expectedText` (its exact expected text). Never select candidate input. Invoke:

```text
pnpm exec node tests/wordcraft-document-session/live-acceptance.cjs <CLI-executable> <127.0.0.1:port> <private-output-directory> <selected-fictional-fixture.json>
```

Resolve the official installation locally. The design's desktop launch is `wordcraft --control <port>`; the harness invokes the supplied CLI with `mcp --connect 127.0.0.1:<port>`. CLI `--version`, initialized server identity, desktop connection confirmation, catalog input schemas and pinned `uvx --from check-jsonschema==0.38.2 check-jsonschema --version` are recorded from execution. Licensing and installation prerequisites beyond these checks remain unverified. Plain headless MCP is never a fallback.

The probe reads only `get_text` and `inspect_document` on the currently selected document. It does not open documents, edit, save, activate windows or modify configuration. Text mismatch blocks further inspection; text equality alone is not proof of native identity. Receipts stay private, contain actual MCP results, and include hashes or explicit absence of the shipped references/schema. Missing tools block dependent work. Unexecuted lifecycle, preservation, recovery, export and foreground checks remain pending; this smoke never accepts the milestone.

Each RPC has a timeout and bounded response buffer. Calls are sequential and are never retried. Cleanup ends and terminates only the CLI process started by the test, leaving the desktop, its documents and persistent configuration intact. Logs are retained for review; delete only the explicitly selected test output directory after review. No automatic document cleanup is performed.

Run the repository boundary check before staging: `pnpm exec node tests/privacy/check-repository.cjs private/cv-facts.json`. This checker alone reads the selected private facts and reports paths; the smoke does not read facts. Human review must also check synthetic fixtures and private receipt placement.

## Full live acceptance

Use the same selected fictional JSON and a fresh private directory. The default invocation above and explicit `--read` remain read-only. The full run changes only the selected fictional test documents, creates two fixture documents, and restores the selected original afterward:

```text
pnpm exec node tests/wordcraft-document-session/live-acceptance.cjs --full <CLI-executable> <127.0.0.1:port> <fresh-private-output-directory> <selected-fictional-fixture.json>
pnpm exec node --test tests/wordcraft-document-session/live-scenarios.test.cjs
```

`live-scenarios.cjs` is a test driver, not a shipped coordinator. It loads the unchanged JavaScript checks from all three shipped references. Every create, edit, save and export first persists a closed-schema session record, validates it with the pinned validator and `inspectSessionIntegrity`, and reads the file back. Each operation appends actual MCP text/structure receipts. The acceptance report binds the four runtime asset hashes, executable hash, CLI/server versions and discovered tool input schemas. Initial calls are capability-verification probes; catalog presence alone never establishes demonstrated support.

For each fixture, the driver creates paragraph content, saves the source, sets an unrelated paragraph style through discovered `para.style`, and verifies the resulting style identifier through MCP. A separately labeled MCP test actor changes protected text. The host compares the earlier baseline with fresh inspection, resolves the exact body-block selection, changes the requested target and checks all inspected block text and formatting. The actor then changes the target itself; the host records a conflict and withholds its pending change. This is sequential intervening-edit evidence, not simultaneous-human-typing protection. Formatting conclusions cover inspected block properties, not every possible Word feature.

The letter edit deliberately withholds a successful tool response from the host outcome path. The test observer retains the actual response; the host persists uncertainty, reads the actual document and runs the shipped recovery check. A recovered receipt links the uncertain attempt to the fresh read without another mutation. This proves host inspect-before-retry behavior, not exactly-once CLI delivery. Missing-inspection and missing-tool controls are explicitly marked `simulated_control`; they cannot substitute for actual lifecycle, preservation or recovery receipts.

Both sources are saved and reopened, explicitly exported through `save_document` to distinct collision-free DOCX paths, then reopened and checked through MCP. Export receipts retain the source logical document relationship. Initial `ui_inspect` must report focus and page rectangles; per-document UI observations are captured during creation, editing and switching. Later focus changes are respected. UI evidence supports the observed desktop state only. No external UI automation, other document service, generated bridge, or headless fallback is used.

The private `acceptance-report.json` lists every mandatory scenario as passed or pending and retains any execution error. Any missing mandatory success leaves acceptance pending and the full runner requests a nonzero exit status. The private `session.json` retains pending, uncertain and confirmed history. Review both artifacts, including original-document restoration, before accepting the run. No DIN compliance, finished styling, ATS compatibility, semantic quality or unexecuted rendering check follows from this lifecycle test.
