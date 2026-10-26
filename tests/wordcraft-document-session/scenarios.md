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
