# Document session

## Handle one request in the host session

This is the entry protocol for the application and refinement workflows. The host follows these instructions directly, using [capability discovery](wordcraft-capabilities.md) and [document operations](wordcraft-operations.md). There is no background process or executable session coordinator. Keep one request in flight at a time, including its read-back and private persistence.

1. Accept the caller's explicit document selection, kind (CV or cover letter), language, requested operation/content scope and selected destination where needed. Keep private draft content with the application. Never fill missing content from a previous applicant, host identity or candidate defaults. Return factual corrections to the owning application workflow for an explicit canonical-profile decision; this session never reads or writes the facts file to apply a correction. Styling, semantic review and question sequencing remain upstream.
2. Select an ignored private record location or an explicitly selected private location outside the checkout. Load an existing record only as intent and historical evidence. Validate its closed schema and run `inspectSessionIntegrity` below. Invalid records or unavailable validation block writes; retain the original private file and explain the missing validation. Do not silently repair references or promote old evidence.
3. Discover/revalidate the current desktop connection and its capabilities. At initial authoring, show the desktop through available launch/MCP controls, or request the one-time user foreground action described in the capability reference. Record only observed visibility. Respect subsequent focus changes. For a document or language switch, identify the requested kind, language and document to the user, resolve the current document's unsaved work, then explicitly select the intended document through MCP. A language switch selects a distinct binding; changing a label is not translation or selection. Never reuse the old document's targets or receipts for the new binding.
4. Route the requested operation using the table below. Resolve capability blockers only for its dependencies. Bind and inspect fresh state using the operation reference; withhold work on ambiguous identity, missing read-back or unknown edit preconditions. Retain the requested change privately, including its original baseline and a precise next action. If unavailable access prevents a new baseline, preserve the existing intent/draft; do not invent an edit baseline to make a record validate.
5. Before **every** create/edit/save/export dispatch, append a new intent and the inspected pre-dispatch baseline to the private record. Retain the original baseline as well when rebasing; use a new attempt ID and identify its predecessor in private intent context. For creation reserve an unbound logical binding first; only initial creation may lack an inspected baseline. Validate schema and integrity, write the record completely to the selected private location, and read it back to confirm the exact record. Use a temporary sibling and atomic replacement when host storage supports it, preserving the last good record on failure. A failed write/read-back or mismatching persisted record means **no MCP mutation**. Preserve the in-session draft, report the persistence failure and stop. A successful in-memory assignment is not persistence.
6. Immediately before dispatch, recheck current identity, target/selection, scope, authorization and any destination collision. If those observations changed, update the baseline/intent and persist again. Invoke only the discovered MCP operation. Any dispatched mutation invalidates the binding's current snapshot and makes previous checks stale, even if its response is lost. Read back through MCP, append new snapshots and the operation outcome, then validate and persist the resulting record. Retain earlier pending/uncertain receipts as history; a later confirmation does not rewrite them. If outcome persistence fails after dispatch, report that limitation and retain in-session evidence; on resume treat the saved intent without a definitive completion as potentially dispatched and reconcile before writing. Never claim a durably completed operation from an unwritten result.
7. Return the outcome and document kind/language/logical identity to the caller, plus confirmed artifact relationship/destination, current snapshot, check scopes and freshness, capability blockers and the next action for pending/uncertain work. Report unavailable or unexecuted checks as `not_assessed`; old checks remain stale. Save confirmation is separate from round-trip, rendering and reading-order checks. No result implies ATS compatibility or semantic accuracy.

| Request | Required demonstrated operations | Host procedure |
| --- | --- | --- |
| Create | create, read | Resolve unsaved work; reserve logical binding; persist intent; create, bind and inspect |
| Select/switch | open_select, read | Resolve unsaved work; open selected document, bind and inspect |
| Inspect | read; render/extraction only when requested | Inspect selected state; record each requested check independently |
| Edit | read, edit | Compare baseline/current state, verify exact selection, persist intent, scoped edit and read-back |
| Save | read, save | Establish identity/destination, persist intent, save and confirm artifact |
| Export DOCX | read, export | Establish identity and distinct destination/collision decision, persist intent, export and rebind |
| Reopen/round trip | reopen, read | Resolve unsaved work; reopen exact artifact and inspect its source relationship |
| Resume/recover | read plus operations required by the recovery inspection | Restore access, rebind, inspect effects; follow reconciliation before any new attempt |

Pending outcomes use `selection`, `conflict` or `capability` with the retained intent ID. Known pre-dispatch persistence/validation failures use `failed` and explicitly state no dispatch. Dispatched ambiguity uses `uncertain`, never a successful or absent result. Read-only requests without an intent report a failed capability/selection outcome and next action in its message instead of manufacturing a mutation intent. The schema and integrity helper validate every outcome before storage, including receipt/intent operation agreement.

## Resume without replay

On resume or restored access, first validate the stored record, rediscover the connection and rebind through fresh MCP selection/identity and inspection. Renew the connection and evidence as specified below. Stored snapshots never establish current state. An intent without a definitive completion is not proof that dispatch never occurred: use the [reconciliation procedure](wordcraft-operations.md#reconcile-interrupted-operations), including the known pre-dispatch versus uncertain distinction. Inspect even when the last stored receipt says pending, since a crash may have occurred between dispatch and outcome persistence.

Confirm a recovered effect without another mutation, linking the new confirmation's evidence to the original attempt and fresh inspection. Unresolved effects retain the uncertain receipt and block further writes on that document. Conclusively absent effects require renewed authorization and all current preconditions, followed by a new intent/baseline persistence. Never replay a stored tool call. A recovered/completed intent is consumed, not submitted again. Other documents may continue only after safe switching and independent binding.

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

## Optional dispatch guard

After schema validation, this small pure helper checks the final mutation boundary. Load the unchanged integrity, capability and operation helpers from these references. `operationDecision` is the result of the applicable fresh operation procedure (including host semantic/authorization checks), never a cached decision. `persistedRecord` is the exact record read back from successful private storage, or null on failure. Request document/language must match the selected binding. This helper neither persists nor dispatches, and cannot prove host observations or storage durability. For resumed pending intents, the host must complete reconciliation above before invoking it. A retained uncertain receipt requires reconciliation; a confirmed recovery references that receipt in `evidenceIds`. Reattempt after proven absence uses the host procedure, retaining the uncertainty and its absence evidence, rather than overriding this conservative guard.

```javascript
function inspectSessionDispatch(input) {
  const {record, observation, persistedRecord} = input;
  const intent = record.intents.find(value => value.id === input.intentId);
  const binding = intent && record.bindings.find(value => value.id === intent.documentId);
  if (!binding || binding.id !== input.requestDocumentId || binding.language !== input.requestLanguage)
    return {decision:'selection'};
  const report = inspectCapabilityReport(record, observation);
  const blocked = [intent.operation, 'read'].filter(operation => report.blocked.includes(operation));
  if (blocked.length) return {decision:'capability', blocked};
  for (const receipt of record.receipts.filter(value => value.documentId === binding.id && value.outcome.status === 'uncertain')) {
    const recovered = record.receipts.some(value => value.documentId === binding.id &&
      value.outcome.status === 'confirmed' && value.outcome.evidenceIds.includes(receipt.id));
    if (!recovered) return {decision:'reconcile'};
    if (receipt.outcome.intentId === intent.id) return {decision:'completed'};
  }
  if (input.operationDecision !== 'proceed') return {decision:input.operationDecision || 'selection'};
  if (intent.operation !== 'create' && !intent.baselineSnapshotId) return {decision:'selection'};
  if (!persistedRecord || JSON.stringify(record) !== JSON.stringify(persistedRecord)) return {decision:'persist'};
  return {decision:'dispatch'};
}
```

