# Private document session record

## Contract integrity

Validate the exact private record against `../schemas/document-session.schema.json` using pinned `uvx --from check-jsonschema==0.38.2 check-jsonschema` before running this block. Run the block unchanged in host computation; it only validates references and evidence consistency. It is not an operation coordinator. Do not run it on structurally invalid input. Keep records and findings private. Missing schema tooling leaves validation not assessed.

```javascript
function inspectSessionIntegrity(record) {
  const errors = [];
  const reject = code => errors.push(code);
  const groups = {connections:[record.connection,...(record.previousConnections || [])],
    bindings:record.bindings,snapshots:record.snapshots,intents:record.intents,receipts:record.receipts,checks:record.checks};
  const ids = new Set([record.sessionId]);
  const maps = {};
  for (const [name, values] of Object.entries(groups)) {
    maps[name] = new Map();
    for (const value of values) {
      if (ids.has(value.id)) reject('duplicate_id');
      ids.add(value.id); maps[name].set(value.id,value);
    }
  }
  function ref(group,id) {
    const value = maps[group].get(id);
    if (!value) reject('unresolved_' + group);
    return value;
  }
  function state(id,documentId) {
    const snapshot = ref('snapshots',id);
    if (snapshot && snapshot.documentId !== documentId) reject('snapshot_document_mismatch');
    return snapshot;
  }
  function evidence(ids, documentId) {
    return ids.map(id => {
      const receipt = ref('receipts',id);
      if (receipt && documentId && receipt.documentId !== documentId) reject('evidence_document_mismatch');
      return receipt;
    }).filter(Boolean);
  }
  for (const binding of record.bindings) {
    ref('connections',binding.connectionId);
    if (binding.currentSnapshotId) {
      const snapshot = state(binding.currentSnapshotId,binding.id);
      if (snapshot && snapshot.connectionId !== binding.connectionId) reject('binding_connection_mismatch');
    }
  }
  for (const snapshot of record.snapshots) {
    ref('bindings',snapshot.documentId); ref('connections',snapshot.connectionId);
  }
  for (const intent of record.intents) {
    ref('bindings',intent.documentId);
    if (intent.baselineSnapshotId) state(intent.baselineSnapshotId,intent.documentId);
  }
  for (const receipt of record.receipts) {
    ref('bindings',receipt.documentId); ref('connections',receipt.connectionId);
    const outcome = receipt.outcome;
    evidence(outcome.evidenceIds || [],receipt.documentId);
    if (outcome.intentId) {
      const intent = ref('intents',outcome.intentId);
      if (intent && (intent.documentId !== receipt.documentId || intent.operation !== receipt.operation)) reject('intent_receipt_mismatch');
    }
    if (outcome.status === 'confirmed') {
      if (!receipt.executedAt || !receipt.tool || !receipt.inputSchemaFingerprint) reject('unexecuted_confirmation');
      if (outcome.value.documentId !== receipt.documentId) reject('outcome_document_mismatch');
      if (outcome.value.snapshotId) {
        const snapshot = state(outcome.value.snapshotId,receipt.documentId);
        if (snapshot && snapshot.connectionId !== receipt.connectionId) reject('receipt_state_connection_mismatch');
      }
      const artifact = outcome.value.artifact;
      if (['save','export'].includes(receipt.operation) && !artifact) reject('missing_artifact');
      if (artifact && (artifact.documentId !== receipt.documentId || artifact.format !== receipt.format ||
          artifact.relationship !== (receipt.operation === 'export' ? 'export' : 'saved_document') ||
          !['save','export'].includes(receipt.operation))) reject('artifact_relationship_mismatch');
    }
  }
  const operations = new Set();
  for (const capability of record.capabilities) {
    if (operations.has(capability.operation)) reject('duplicate_capability');
    operations.add(capability.operation); ref('connections',capability.connectionId);
    const receipts = evidence(capability.evidenceIds);
    if (capability.connectionId !== record.connection.id) reject('stale_capability_connection');
    if (capability.status === 'demonstrated' && !receipts.some(receipt =>
      receipt.outcome.status === 'confirmed' && receipt.executedAt &&
      receipt.connectionId === capability.connectionId && receipt.operation === capability.operation &&
      receipt.tool === capability.tool && receipt.inputSchemaFingerprint === capability.inputSchemaFingerprint &&
      receipt.format === capability.format)) reject('unsupported_demonstration');
  }
  for (const check of record.checks) {
    const binding = ref('bindings',check.documentId);
    const snapshot = state(check.snapshotId,check.documentId);
    if (snapshot && snapshot.fingerprint !== check.snapshotFingerprint) reject('check_fingerprint_mismatch');
    const current = binding && binding.currentSnapshotId === check.snapshotId &&
      binding.connectionId === record.connection.id;
    if (check.freshness !== (current ? 'current' : 'stale')) reject('check_freshness_mismatch');
    const receipts = evidence(check.evidenceIds,check.documentId);
    if (!['content','structure','render','extraction','reading_order','round_trip','preservation'].includes(check.kind)) reject('unsupported_check_claim');
    const allowedOperations = {render:['render'],extraction:['extraction'],reading_order:['read','extraction'],
      content:['read','extraction'],structure:['read'],round_trip:['reopen','read'],preservation:['read']};
    if (check.status !== 'not_assessed' && !receipts.some(receipt =>
      (allowedOperations[check.kind] || []).includes(receipt.operation) &&
      receipt.tool === check.producerTool && receipt.executedAt === check.executedAt &&
      receipt.outcome.status === 'confirmed' && receipt.outcome.value.snapshotId === check.snapshotId)) reject('check_execution_mismatch');
  }
  return errors;
}
```

IDs are globally unique within a record. References never resolve outside it. A connection ID binds an immutable server/version, mode and environment fingerprint (including installed executable and catalog identity, never its personal path). On reconnect or environment/schema change, move the old connection into `previousConnections`, allocate a fresh connection ID and revalidate capabilities. Retain old receipts and snapshots; mark their checks stale. Refresh bindings only after MCP identity and state inspection. A record cannot itself prove that these observations occurred.

Use SHA-256 of the exact UTF-8 tool input schema for `inputSchemaFingerprint`. For snapshot fingerprints, hash the JSON serialization of `[text, structure, selection]` with structure in observed order; the host must compute and compare these with fresh MCP observations. The helper checks attribution and consistency, not cryptographic truth or semantic accuracy. Do not reuse a snapshot ID after any mutation, even if visible text appears unchanged. Invalidate the binding's `currentSnapshotId` (set null) until fresh inspection and mark previous checks stale. Unknown or unexecuted checks stay `not_assessed`, with a reason; never fill evidence from assumptions.

Receipts record actual tool names and dispatched input-schema fingerprints, not invented tools. A confirmed save/export includes the selected destination, tested format and relationship to the document; save confirmation does not imply a successful round trip. Persist a pending intent before dispatching create/edit/save/export, and record uncertain outcomes after ambiguous dispatch without treating them as absent or successful. For create, reserve a logical binding with null native ID, path and current snapshot before dispatch; it proves no native identity. An intent's baseline may be null only when no baseline exists (for example initial creation). Formatting requests retain their discovered command and arguments as private descriptive scope/context until the operation protocol verifies them; this contract does not authorize any command.

Never persist authentication keys, tokens, credentials or raw transport envelopes in this record. Closed objects reject undeclared secret fields; the host must also omit secrets from permitted text fields and fingerprints' source material. Store only selected private document data, with wholly fictional examples in reusable assets. No field permits a canonical-profile update.

Every check conclusion is limited to its recorded scope and observed document state. A render or screenshot can support visual inspection only; it cannot establish parser/ATS compatibility. Reading-order and extraction checks need their own executed MCP evidence. Host semantic and presentation review remain separate from structural and integrity validation.
