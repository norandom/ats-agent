# Bind, inspect and persist WordCraft documents

The host follows this protocol through the existing desktop MCP connection. First validate the private [session record](document-session.md) and required [capabilities](wordcraft-capabilities.md). These instructions do not launch a separate workflow service. Keep content, paths, snapshots and raw receipts private; use no implicit candidate defaults.

## Establish the selected document

Accept an explicit existing document path or an explicit new-document request with kind and language. At initial CV or letter authoring, follow the capability reference's foreground procedure. Report the active kind, language and selected document on each switch; respect subsequent user focus changes.

Before opening or creating, inspect the current document through `get_text` and `inspect_document`. Resolve unsaved work first: save the current selected document and confirm the outcome, or obtain an explicit user decision to discard it. Unknown dirty state counts as unsaved. Never reopen or create over potentially unsaved work merely to resolve identity. A confirmed save only clears unsaved status for the state it saved; inspect again before switching if intervening changes may have occurred.

For existing selection call discovered `open_document` with the selected `path`; retain its confirmed response and inspect the resulting current text/structure. For creation call discovered `new_document`, retain its confirmed response and inspect the new current state. Allocate a host logical binding ID and record kind, language, connection ID, current path and native ID only when observed. Return that binding reference to the caller. A logical ID or content fingerprint is not a native document identifier. An unsaved new document has `path:null` and is bound only to the creation receipt, uninterrupted connection and observed active state; save it early to the selected unique private destination.

Require fresh inspection before each mutation. Prefer observed native ID/path evidence. Any contradictory path or native ID blocks changes even when the text matches. When inspection exposes neither, require the confirmed open/create/save receipt together with uninterrupted connection and current-state continuity. A title or matching text alone cannot distinguish identical files. State continuity requires evidence that no intervening selection occurred; do not assert it simply because two reads match. Reconnects, unexplained switches or unresolved evidence require explicit reselection after unsaved-work resolution. Report selection as pending and withhold mutations until identity is established.

## Inspect and report the current state

Use `get_text` for readable body content and `inspect_document` for available structure, selection and parts. Preserve exact text, normalize the relevant structure into snapshot descriptions and compute the record fingerprint as described in the record reference. Report current content and whether it belongs to the selected binding. A successful read with ambiguous identity remains an unbound observation, not permission to edit.

Record each executed check with document ID, snapshot ID/fingerprint, tool, time, scope and evidence IDs. Mark unsupported or unexecuted rendering, extraction of other parts and reading-order checks `not_assessed`; do not infer them from a body-text read. Use only available WordCraft MCP inspection tools. After any mutation, mark earlier checks stale and inspect again. An earlier render or extraction cannot verify the newer state; visual checks do not establish ATS compatibility.

## Save and export

Persist the pending intent and baseline privately before dispatch. If that write fails, withhold the MCP mutation. For an ordinary saved document use `save_document` in place, with its confirmed bound path or the discovered omission-of-path contract. A first save requires an explicitly selected unique destination. Resolve path equivalence using the host's filesystem semantics; never assume two different strings denote different files.

Check only the selected destination for a collision. Use available MCP destination information, or a host existence check limited to that explicit path; this is not document-content inspection. If existence is unknown or an unrelated file exists, withhold the write and request a new destination or an explicit overwrite decision for that exact file. Never overwrite an unrelated file merely because a name was supplied. Ordinary save must preserve the source path. Explicit DOCX export uses `save_document` with a distinct selected `.docx` path, without inventing a `format` argument. Do not infer PDF support. After an authorized overwrite decision the host must retain that decision as private intent context; the conservative helper below still requests destination resolution and is not an overwrite executor.

Confirm tool success and the resulting destination from the actual response. Associate a confirmed ordinary save with artifact `{documentId, destination, format:'docx', relationship:'saved_document'}` and an export with `relationship:'export'`, both referencing the selected source logical document. Export does not silently create an unrelated binding. Save-as behavior may change the desktop's active path: inspect it, record the observed path change under the same logical binding while retaining the source snapshot and export receipt, and explicitly rebind before any further authoring. Do not claim the old path is still active. Unknown active identity blocks subsequent mutations.

When round-trip verification is requested, resolve unsaved work, open the confirmed destination through MCP, then read and inspect it. Confirm the open path, uninterrupted connection and content/structure continuity with the saved source snapshot. For an exported file report both its destination identity and its source relationship; it may be selected as an artifact verification step without becoming a new source document. Record a separate `round_trip` check. A failed reopen leaves a confirmed save/export intact but makes round-trip verification failed; an unexecuted reopen remains `not_assessed`.

Known rejection before dispatch is failed without an effect. Timeout, missing response, wrong/missing returned destination or dispatched error without proof of no effect is uncertain: retain the intent, do not report an artifact as confirmed, and inspect before considering another attempt. Never automatically replay a save/export. Report the actual outcome, confirmed destination when available, source relationship, and separate verification limitations.

## Bounded decision check

This pure helper checks host-supplied observations; it neither calls MCP nor proves the observations true. Run schema validation and `inspectSessionIntegrity` on persisted records separately. Its transient input is not an additional schema object. `binding` uses the record binding fields; `observation` supplies fresh native path/ID when exposed, connection ID, fresh-inspection status, receipt confirmation and continuity judgments. Paths must already be canonicalized. `destinationState` is `source`, `absent`, `exists` or `unknown`; `unsaved` is `yes`, `no` or `unknown`. Use `operation` read/save/export; opening and creation must first resolve switches, then establish the binding above. `result`, when present, is a normalized actual save/export response, never an inferred success. `roundTrip` is the separately observed check status.

```javascript
function inspectDocumentOperation(input) {
  const {binding:b, observation:o, operation:op} = input;
  const mismatch = (b.path && o.path && b.path !== o.path) ||
    (b.nativeId && o.nativeId && b.nativeId !== o.nativeId);
  const nativeMatch = (b.path && o.path === b.path) ||
    (b.nativeId && o.nativeId === b.nativeId);
  const continuity = o.confirmedBindingReceipt === true &&
    o.uninterrupted === true && o.stateContinuity === true;
  if (mismatch || b.connectionId !== o.connectionId ||
      o.freshInspection !== true || (!nativeMatch && !continuity)) return {decision:'selection'};
  if (input.switching && input.unsaved !== 'no' && input.discardAuthorized !== true)
    return {decision:'unsaved_work'};
  if (!['read','save','export'].includes(op)) return {decision:'selection'};
  if (op === 'read') return {decision:'proceed'};
  const destination = input.destination;
  const inPlace = op === 'save' && b.path && destination === b.path && input.destinationState === 'source';
  const firstSave = op === 'save' && !b.path && input.destinationState === 'absent';
  const exporting = op === 'export' && destination !== b.path && input.destinationState === 'absent';
  if (typeof destination !== 'string' || !/\.docx$/i.test(destination) ||
      !(inPlace || firstSave || exporting)) return {decision:'destination'};
  if (!input.result) return {decision:'proceed'};
  if (input.result.status === 'rejected_before_dispatch') return {decision:'failed'};
  if (input.result.status !== 'success' || input.result.path !== destination) return {decision:'uncertain'};
  return {decision:'confirmed', artifact:{documentId:b.id, destination, format:'docx',
    relationship:op === 'export' ? 'export' : 'saved_document'},
    roundTrip:['passed','failed'].includes(input.roundTrip) ? input.roundTrip : 'not_assessed'};
}
```
