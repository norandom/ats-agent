# WordCraft capability discovery

Prepare a private session record using [the record contract](document-session.md) and its schema. Discover the selected WordCraft MCP connection before dependent authoring. Report all nine operations below individually. Catalog presence establishes a possible call, never demonstrated behavior.

## Connect the desktop

The observed product is WordCraft desktop with the official `wordcraft-cli`, version 0.10.0. Setup sources are the installed CLI's `--help` and `--version`, MCP initialization and catalog, and the versioned [official control protocol](https://github.com/storytold/wordcraft/blob/v0.10.0/docs/control-protocol.md). Resolve both executables locally through the host's executable discovery or an explicitly selected installation; never embed installation paths or guess an installer/package-manager name. Record the observed version, server identity and executable hashes privately. Installation prerequisites, other versions/platforms and licensing conditions beyond verified sources remain unverified.

Use the documented desktop launch `wordcraft --control <port>` with a selected available loopback port, then the official CLI `wordcraft-cli mcp --connect 127.0.0.1:<port>` as the session's MCP connection. These are command shapes; substitute locally resolved executables and the selected port. Let the official CLI handle authentication. Do not print/store its key, edit persistent host configuration, add a custom bridge or substitute another document service. Plain `wordcraft-cli mcp` is headless and cannot satisfy live authoring. If the host cannot attach the desktop MCP connection, retain private draft state and report unavailable access.

At initial authoring, launch visibly or use a discovered launch/MCP capability to raise the selected desktop instance. Establish visibility through executed MCP evidence where available or explicit user confirmation. A successful connection does not prove foreground visibility. If a minimized instance cannot be raised through those controls, request a one-time user action to bring WordCraft forward; leave visibility unverified until confirmed. Do not use UI automation. Respect later minimize/focus changes. On document/language switches, identify the intended document in the host response and select it through discovered MCP capabilities after resolving unsaved work. Never enumerate unrelated documents.

## Discover and verify each operation

Capture `tools/list` names and exact input schemas and MCP initialization identity/version; use null when version is unavailable. The observed 0.10.0 catalog gives these mappings, which must be rediscovered for the current session:

| Contract operation | Observed tools and input contract | Evidence needed |
| --- | --- | --- |
| `create` | `new_document`, optional `template` string | Executed new-document result plus fresh read/identity binding |
| `open_select` | `open_document`, required `path` string, optional password | Confirm selected path and current document; omit passwords from records |
| `read` | `get_text` and `inspect_document`, empty objects | Current body text and inspected structure/selection |
| `edit` | `select_text` with required `text`, optional 1-based `occurrence`; `type_text` with required `text`, optional boolean `paragraphs` | Unique target, inspected selection, replacement and read-back; primary receipt tool is `type_text` |
| `save` | `save_document`, optional `path`; omission saves in place | Confirmed destination and saved-document relationship |
| `reopen` | `open_document`, required `path` | Reopened selected saved file, identity and fresh read-back |
| `export` | `save_document` with explicit selected `.docx` path | Confirmed DOCX artifact with export relationship; format follows extension, no invented format argument |
| `render` | `render_page`, optional numeric `page` (1-based), `scale` | Executed image for the selected state; visual evidence only |
| `extraction` | `get_text`, empty object | Executed body-text extraction; tracked deletions omitted, other parts/parser compatibility not inferred |

For command-based formatting, discover parameters with `list_commands` before `execute`; include that command schema in catalog identity and retain its observed contract privately. The table covers ordinary targeted text editing, not blanket support for every command. Never infer effects from tool annotations or transactional semantics from `batch`.

Use `demonstrated` only for confirmed executed receipts matching operation, tool, schema fingerprint, format and current immutable connection. Record `failed_or_unsupported` for observed failure or explicit unsupported behavior, with private failure evidence/reason. Use `unavailable` for missing required tools or inaccessible connection. Use `unverified` when tools exist but have not been exercised, or prior evidence became stale. An uncertain call remains unverified with its uncertain receipt; it is not demonstrated failure or success. Keep all statuses separate. Synthetic probing may exercise unverified operations to establish support, under explicit selected fictional inputs and destinations; it does not authorize candidate work.

For `inputSchemaFingerprint`, SHA-256 the exact UTF-8 schema representation captured at discovery; preserve that same representation for comparison, including key order. Compute `environmentFingerprint` as SHA-256 of UTF-8 JSON serialization of `[server, version, mode, desktopExecutableSha256, cliExecutableSha256, catalogPairs]`, where `catalogPairs` are sorted by tool name and contain `[name, inputSchemaFingerprint]` for the entire catalog. Include command-specific schema identities when used. Do not include personal executable paths or authentication material. An unresolved executable identity leaves dependent demonstration unverified. On any executable, catalog, version, mode change or reconnect, allocate a new connection ID and archive the previous connection as specified in the record contract; never rewrite old receipt bindings to make them current.

Before presenting a validated report, run pinned schema validation and `inspectSessionIntegrity` from the record reference, then this unchanged deterministic check. `observation` is transient host input: `{connection, tools}`, with a freshly observed contract-shaped connection and a map of actual tool names to computed schema fingerprints. Do not persist this extra object in the closed record. The checker validates consistency, not whether observations are true, visibility, selection, or semantic preservation. A report with errors must be corrected before use. Its blocked list applies only to those operations; preserve private pending work and explain which required operation prevents the requested work. Reading can remain usable when rendering is unavailable. No alternative final authoring engine is permitted.

```javascript
function inspectCapabilityReport(record, observation) {
  const required = {
    create:['new_document'], open_select:['open_document'],
    read:['get_text','inspect_document'],
    edit:['type_text','select_text','inspect_document','get_text'],
    save:['save_document'], reopen:['open_document','get_text'],
    export:['save_document'], render:['render_page'], extraction:['get_text']
  };
  const errors = inspectSessionIntegrity(record);
  const integrityFailed = errors.length > 0;
  const same = ['id','server','version','mode','environmentFingerprint']
    .every(key => record.connection[key] === observation.connection[key]);
  const desktop = observation.connection.mode === 'desktop';
  if (!same) errors.push('environment_changed');
  if (!desktop) errors.push('desktop_required');
  const blocked = [];
  for (const [operation, tools] of Object.entries(required)) {
    const capability = record.capabilities.find(value => value.operation === operation);
    if (!capability) { errors.push('missing:' + operation); blocked.push(operation); continue; }
    const missing = tools.some(tool => !Object.hasOwn(observation.tools, tool));
    const mapped = capability.tool === tools[0];
    const schemaMatches = mapped && capability.inputSchemaFingerprint === observation.tools[capability.tool];
    if (capability.status !== 'unavailable' && (missing || !mapped || !schemaMatches)) errors.push('catalog_mismatch:' + operation);
    if (integrityFailed || !same || !desktop || missing || !schemaMatches || capability.status !== 'demonstrated') blocked.push(operation);
  }
  return {errors, blocked};
}
```

Present each operation with its contract status, tested format, observed tool/schema, environment/version and receipt references. Keep raw records private. Historical 0.10.0 lifecycle observations motivate these mappings but do not populate a new session's evidence. Read-only smoke proves only the calls actually executed; missing render, export or failure-path scenarios remain pending. Tests with fictional receipts prove this protocol's rejection behavior, not desktop integration or milestone acceptance.
