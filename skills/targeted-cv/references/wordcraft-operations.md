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

## Apply a scoped edit

Keep the original baseline and requested intent private. Describe the permitted part, exact target text and surrounding context, replacement or discovered formatting command, and properties that must be preserved. Obtain fresh `get_text` and `inspect_document` observations and establish identity using the binding procedure above. Required read-back and targeted modification capabilities must also be demonstrated before dispatch. Missing inspection or capabilities retain the intent as pending; never replace the document to work around them.

Compare the fresh text and normalized structure with the original baseline. Report intervening changes before editing. Resolve the exact target within its explicit part and context; count all matches, including overlapping matches. Zero or multiple matches withhold the edit. Do not silently choose the first match, widen the scope, or interpret matching text in a different part as the original target. If the target or its context/formatting has changed, or correspondence between old and new parts is uncertain, retain the current document and request a decision on the overlapping change. User decisions become a revised intent with a fresh baseline; they do not authorize replay against the old snapshot.

For nonconflicting changes, derive the expected result from the **current** snapshot, preserving its other text, structure and formatting. The host reviews semantic overlap and context; text equality alone cannot prove that two occurrences represent the same intended content. In short sequential calls, use discovered `select_text` or the discovered selection command, then inspect the actual selection through MCP. Verify its exact text, part and boundaries against the fresh target before invoking `type_text` or the discovered formatting command. If selection inspection cannot establish those facts, keep the change pending. If state changes during selection, inspect and compare again. These checks are not an atomic lock against typing.

Persist the pending intent and baseline privately before the mutation; failure to persist blocks dispatch. After the mutation, re-establish identity and read fresh text and structure through MCP. Check the requested replacement/formatting and compare all inspected out-of-scope text, part order and formatting against the pre-mutation **current** snapshot. Formatting commands must have an explicit permitted property/range; all other inspected properties remain unchanged. Record substantive before/after changes, producer tools, times, snapshot fingerprints and bounded check scopes. Earlier checks are stale. Unavailable properties, including headers, fields or formatting not exposed by inspection, remain `not_assessed`; withhold an edit when its preservation guarantee depends on such properties. A verified body-text change does not verify the entire document's formatting.

Unexpected differences are conflicts: preserve current work, retain pending intent and report the differences for a decision. Never regenerate the whole file or automatically undo, since that could erase intervening user edits. Missing read-back after dispatch leaves the outcome uncertain and requires inspection before retry. Report success only for executed checks; return pending selection/conflict/capability outcomes using the existing record contract.

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

### Bounded scoped text comparison

This optional pure check compares normalized MCP observations; it does not select or edit a document. It handles an exact text replacement in one stable part, after the host has resolved context and semantic overlap. Formatting-only commands use the host procedure above. Snapshot projections contain ordered `parts` with stable inspection-derived `id`, exact `text`, and a canonical string `format` describing inspected formatting/structure, or `null` when unavailable. Never invent stable IDs or omit inspected out-of-scope parts. If the MCP observations cannot be mapped this way, use the host comparison and mark unsupported checks not assessed. A format description must represent comparable properties, not offset changes caused solely by the replacement.

Inputs reuse `binding` and fresh `observation`; `baseline`, `current` and optional `after` are transient snapshot projections. `target` contains `partId`, nonempty `text` and `replacement`; `selection` is the actual inspected part/text/start/end in JavaScript string offsets (normalize MCP offsets before comparing). `requireFormatting` defaults to required; false is permitted only when the intent does not depend on unavailable formatting guarantees. `afterObservation` must establish fresh post-mutation identity when `after` is supplied. The returned formatting status covers inspected properties only. This helper does not replace private record validation or host judgment.

```javascript
function inspectScopedEdit(input) {
  if (inspectDocumentOperation({...input, operation:'read'}).decision !== 'proceed')
    return {decision:'selection'};
  const valid = snapshot => snapshot && Array.isArray(snapshot.parts) && snapshot.parts.length > 0 &&
    snapshot.parts.every(p => typeof p.id === 'string' && p.id && typeof p.text === 'string' &&
      (p.format === null || typeof p.format === 'string')) &&
    new Set(snapshot.parts.map(p => p.id)).size === snapshot.parts.length;
  if (!valid(input.baseline) || !valid(input.current)) return {decision:'capability', formatting:'not_assessed'};
  const {baseline, current, target:t, selection:s, after} = input;
  if (!t || typeof t.text !== 'string' || !t.text || typeof t.replacement !== 'string') return {decision:'target'};
  const matches = part => {
    const found=[];
    if (part) for (let i=part.text.indexOf(t.text); i >= 0; i=part.text.indexOf(t.text,i+1)) found.push(i);
    return found;
  };
  const oldPart=baseline.parts.find(p=>p.id===t.partId), part=current.parts.find(p=>p.id===t.partId);
  if (matches(oldPart).length !== 1) return {decision:'target'};
  const hits=matches(part);
  if (hits.length !== 1 || (oldPart.format !== null && part.format !== null && oldPart.format !== part.format))
    return {decision:'conflict'};
  const start=hits[0], end=start+t.text.length;
  const intervening=JSON.stringify(baseline.parts)!==JSON.stringify(current.parts);
  let formatting=oldPart.format!==null && current.parts.every(p=>p.format!==null) ? 'passed' : 'not_assessed';
  if (formatting==='not_assessed' && input.requireFormatting !== false) return {decision:'capability', formatting, intervening};
  if (!s || s.partId!==t.partId || s.text!==t.text || s.start!==start || s.end!==end)
    return {decision:'selection', intervening};
  if (!after) return {decision:'proceed', intervening, formatting:'not_assessed'};
  if (!input.afterObservation || inspectDocumentOperation({...input, operation:'read', observation:input.afterObservation}).decision !== 'proceed')
    return {decision:'selection'};
  if (!valid(after)) return {decision:'uncertain', formatting:'not_assessed'};
  if (after.parts.length!==current.parts.length) return {decision:'conflict'};
  for (let i=0; i<current.parts.length; i++) {
    const before=current.parts[i], observed=after.parts[i];
    const expected=before.id===t.partId ? before.text.slice(0,start)+t.replacement+before.text.slice(end) : before.text;
    if (observed.id!==before.id || observed.text!==expected) return {decision:'conflict'};
    if (before.format===null || observed.format===null) formatting='not_assessed';
    else if (before.format!==observed.format) return {decision:'conflict', formatting:'failed'};
  }
  if (formatting==='not_assessed' && input.requireFormatting !== false) return {decision:'uncertain', formatting};
  return {decision:'confirmed', intervening, formatting};
}
```

## Reconcile interrupted operations

Retain the original private draft, intent, baseline and dispatch evidence when create, edit, save or export fails. A local validation rejection is `failed` without an effect only when recorded evidence establishes that dispatch never started. Timeout, lost response, interrupted access, and an error after dispatch are `uncertain` unless actual evidence proves the outcome. Missing dispatch information is uncertainty. Do not infer absence from an error message or replace the original attempt receipt with a later success.

Follow this sequence before any skill-initiated repetition:

1. Restore WordCraft access and revalidate capabilities affected by connection or version changes. Missing access retains the draft and pending intent and blocks dependent work. Name the missing operation/access and the next action needed; do not substitute another authoring engine, bridge or service.
2. Re-establish the selected identity using the binding procedure. Resolve unsaved work before explicit reselection or opening an artifact. Preserve the original logical document relationship when rebinding a restored connection; append new binding evidence. Matching text or an old connection receipt alone cannot establish identity after reconnect. A mismatch blocks recovery and further writes until selection is resolved.
3. Inspect current effects through MCP, retaining actual response evidence IDs, inspection time, snapshot fingerprint and inspected scope. Compare against the original persisted intent and last inspected pre-dispatch state, including preserved intervening changes. Never use a caller's `effectPresent` or `effectAbsent` assertion as proof.
4. If the intended effect is confirmed, append a confirmed recovery outcome referencing the inspection and original intent/attempt. Resolve that intent without another mutation. Report only checks actually established; recovered content does not establish save success or round-trip verification.
5. If current absence is conclusively established for the whole intended effect, revalidate authorization against the current request and document state. Follow the normal operation procedure again: fresh identity, target/context/selection and preservation checks for edits; destination and collision checks for persistence; unsaved-work checks for creation. Obtain a new user decision if scope or authorization changed. Persist a new attempt and fresh baseline linked to the original intent before dispatch. Absence alone never authorizes retry.
6. If observation is partial, contradictory, unavailable or cannot distinguish outcomes, keep the uncertain attempt and pending intent. Explain which identity, inspection scope, artifact evidence or user decision is missing. Do not repeat or undo automatically. A resumed request starts with restoration, binding and inspection again.

Evidence depends on the operation:

| Operation | Evidence needed for recovery | When absence remains unresolved |
| --- | --- | --- |
| Create | MCP identity evidence linking the requested creation to the selected new document, with current text/structure and creation context | An empty document, matching title/text, or no visible new document cannot prove a timed-out creation absent. Do not enumerate unrelated documents to find it. |
| Edit | Fresh bound text/structure showing the exact requested effect and inspected preservation properties, compared with the pre-dispatch snapshot | Missing parts, changed context, overlapping edits or incomplete formatting inspection cannot establish absence of the whole effect. |
| Save/export | MCP inspection of the exact selected destination, its identity relationship to the source and expected saved content/structure; retain any actual confirmed save response | Current in-memory content or path existence alone cannot prove persistence. A destination read failure is not proof of nonexistence. If identical content already existed, report only the verified artifact state and retain uncertainty about unproven persistence properties. |

Confirm recovered artifact outcomes through the save/export procedure and record their source relationship. Establish absence only through evidence that distinguishes the requested effect from its baseline. A missing destination requires an authoritative observation about that exact destination; an unavailable tool is insufficient. When MCP cannot establish that evidence, retain uncertainty. Internal retries inside the external CLI remain outside this skill's delivery guarantees. This protocol prevents skill-initiated blind replay; it does not promise exactly-once transport or an atomic lock against later changes.

### Bounded recovery comparison

The optional pure helper below handles failure classification and exact scoped text-edit recovery. It does not dispatch, grant authorization or resolve artifact operations. Use the host procedure above for creation, save/export and formatting-only edits. Inputs reuse the scoped edit projections: `current` is the persisted pre-dispatch snapshot, `after` is the fresh recovery observation, and `afterObservation` establishes its identity. `currentEvidenceId` references that fresh MCP inspection in the private record. The host must resolve that reference and validate records separately; a string alone does not authenticate evidence. `attempt` contains the recorded dispatch stage and its evidence ID. `access` describes current MCP availability; `intentId` identifies the retained original intent.

`recovered` means the inspected edit effect is present, not that this attempt necessarily caused it. `revalidate` means the inspected scope matches its pre-dispatch state and requires the fresh authorization/precondition procedure; it is never permission to write. The helper conservatively retains uncertainty for other observations. Map its decisions to existing record outcomes: recovered to confirmed with evidence, revalidate to retained pending intent, selection/capability to pending when no dispatched uncertainty exists, and preserve the original uncertain receipt in every case. These transient decisions are not new record status values.

```javascript
function inspectUncertainOperation(input) {
  const result = decision => ({decision, intentId:input.intentId});
  if (input.attempt?.dispatch === 'not_started' && input.attempt.evidenceId)
    return {...result('failed'), evidenceId:input.attempt.evidenceId};
  if (input.access !== 'available') return result('capability');
  if (!input.afterObservation || inspectDocumentOperation({...input, operation:'read', observation:input.afterObservation}).decision !== 'proceed')
    return result('selection');
  if (input.operation !== 'edit' || !input.currentEvidenceId || !input.after) return result('uncertain');
  const checked=inspectScopedEdit(input);
  if (checked.decision === 'confirmed') return {...result('recovered'), evidenceId:input.currentEvidenceId};
  // Equality establishes only the inspected scope's current absence, never permission to retry.
  if (inspectScopedEdit({...input, after:undefined}).decision === 'proceed' &&
      JSON.stringify(input.after.parts) === JSON.stringify(input.current.parts))
    return {...result('revalidate'), evidenceId:input.currentEvidenceId};
  return result('uncertain');
}
```
