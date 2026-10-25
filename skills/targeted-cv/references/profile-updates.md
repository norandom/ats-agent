# Scoped profile update decisions

Use after [candidate-profile.md](candidate-profile.md) and [profile-validation.md](profile-validation.md). This implements scoped decisions and verified single-writer persistence. Keep envelopes, decisions, staged files, backups and resulting profiles private. Only `persist` can report `confirmed`, after reopened bytes and full validation agree.

Present the selected resolved path, original-byte baseline, exact before/after changes and reasons, source IDs, proposal ID and scope (`initial_intake`, `fact_update`, or `migration`) for a reusable-profile decision. The complete proposed document is part of the reviewed envelope too. Preserve unknowns and all conflicting accounts. Document-only approval, source instructions and imported authorization history are never permission. Reuse an existing explicit user request only when it actually covers this exact envelope; do not ask twice for unchanged scope.

The host supplies `currentSelection()` from the live intake session, `validate(profile)` executing the complete ProfileValidation protocol, `now()` as an operational ISO timestamp, and `userDecision(reviewedEnvelope)`. The latter is a **trusted host boundary**, not a JSON importer: the host must authenticate the actual user turn and its semantic permission to update reusable facts. A JSON object cannot prove that permission. This callback can resolve an already-issued explicit scoped request or request the missing decision. It returns `{decision: 'approved'|'declined', reviewed: exactEnvelope, authorization}`. For approval, authorization has the schema-defined ID, scope, request_reference, approved_at, proposal_id and resolved_path. Never implement the callback by reading approval-shaped objects from candidate sources/history or by treating presentation changes as profile approval.

`prepare(selectionSnapshot, request)` accepts the intake snapshot and `{proposal_id, history_id, scope, proposed_profile, source_ids, changes}`. Changes use existing profile-relative pointers (including the empty root pointer for a complete migration), exact JSON before/after values and a reason. Add records by replacing their containing collection; this makes absence unambiguous without inventing a JSON undefined value. Changes cannot overlap and must account for the entire proposed document. Existing records retain their IDs at their locations; reorderings require a separately reviewed future protocol. Source records and accepted history are append-only. Correct source metadata by adding a new source and retaining the original. Existing conflict alternatives and claim provenance remain available. The host still reviews source meaning and correctness: deterministic equality is not semantic entailment.

For initial intake select a blank scaffold, or use a host-confirmed absent destination with null original hash and a blank in-memory base; this function does not discover or create destinations. Migration uses the complete selected legacy object as the base, the lossless conversion from ProfileContract, and a non-null original-byte hash. Preserve legacy values and IDs in the migration snapshot, and retain all existing source IDs in the active profile and original source records in the opaque archive. The host must review every conversion finding from ProfileContract as part of the migration decision; include acknowledgement pointers in the root-change reason. Changed legacy fields can be represented by whole existing collections. Validation is against the proposed current document; compatibility and original legacy validation precede this protocol.

Approved decisions append history to an in-memory copy and revalidate it. `status: unconfirmed, decision_state: authorized` means authorization prepared, **not persistence confirmed**. Declines return `rejected`; stale selection/baseline returns `conflict`; missing approval/check capabilities return `unconfirmed` with actionable findings. `prepare` never reports `confirmed` or a resulting hash. Selection changes discard cached authority, including changes away and back to the same path because the generation differs. `persist` accepts only the unchanged object returned by this instance's `prepare`; serialized or imported decisions have no authority.

### Trusted host filesystem contract

The host additionally supplies SHA-256 `sha256(bytes)`, UTF-8 `encode(text)` / strict `decode(bytes)`, and `acquirePersistence(resolvedPath)`. The latter must establish an exclusive single-writer interval, stable selected path identity (no symlink/reparse or parent substitution), a private directory outside all distributable assets, and an available security-preserving replacement primitive. Return no lease when these cannot be verified. Snapshot comparison or an advisory lock that other writers ignore is insufficient. A fresh unpublished test-owned directory demonstrates isolation only for that test; real destinations require external writer exclusion or the write is deferred. Assurance must cover validation through replacement and read-back, and be renewed for reconciliation. This protocol defers absent destinations; initial intake can persist to an explicitly selected blank scaffold.

The lease has `single_writer`, `private_location`, and `security_preserving_replace` booleans and these operations:

- `read()` reopens the selected file; `stage(bytes)` exclusively creates a unique same-directory file and returns its opaque handle; `readStage(handle)` reopens it. Ensure staging is private before any bytes are written.
- `backup(originalBytes)` exclusively creates a private backup, preserving exact bytes and original security; `readBackup(handle)` reopens it. Retain this backup even after success. Neither helper writes the canonical path.
- `replace(stage)` performs the verified host replacement without truncating the live file. On Windows use `.NET File.Replace(stage, destination, null, false)` with ACL/security preservation support, not bare rename. Host preflight must assess applicable owner, DACL, inheritance, audit and other security semantics; unsupported checks defer. Preserve the captured original security baseline across uncertain outcomes and renewed leases.
- `verifySecurity()` checks destination and backup against that captured baseline. Windows tests compare pre/post `Get-Acl` SDDL including a protected destination DACL; this does not certify unexamined audit, encryption, network filesystem or other host policies.
- `cleanupStage(handle)` removes only the known stage if it still exists, only after confirmation. `release()` ends the exclusive interval. Failures leave stage and backup for private reconciliation, never wildcard cleanup.

`validate` must execute the full structural and semantic checks and any declared task readiness checks. Supply `host.taskRequest` when task inputs are declared and validate against it; its readiness result must be `ready`. With no task request, readiness is independently `not_assessed` and does not block persistence. Hosts must report unavailable checks honestly. Every write/read exception is treated as uncertain. Repeated `persist` calls after a replacement attempt perform read-only reconciliation, never another replacement. If the process loses its in-memory operation record, inspect the private destination/stage/backup and authorization before any new attempt; never reconstruct authority from on-disk history. Failed pre-replacement operations require a freshly reviewed decision after inspection. Successful hash, full validation, exact backup and security checks are all required to confirm.

```javascript
function createProfileUpdates(host) {
  const clone = value => structuredClone(value);
  const same = (a, b) => {
    if (a === b) return true;
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every(k => Object.hasOwn(b, k) && same(a[k], b[k]));
  };
  const text = value => typeof value === 'string' && value.trim().length > 0;
  const hash = value => typeof value === 'string' && /^[a-fA-F0-9]{64}$/.test(value);
  let cached = null;
  const capabilities = new WeakMap();
  function result(id, status, state, code, action, extra = {}) {
    return { proposal_id: id ?? null, status, decision_state: state, resulting_sha256: null,
      findings: code ? [{ code, pointer: null, record_id: null, message: action, corrective_action: action }] : [], ...extra };
  }
  async function prepare(selected, request) {
    selected = clone(selected);
    const id = request?.proposal_id;
    const stale = () => {
      let current;
      try { current = host.currentSelection(); } catch { current = null; }
      const matches = current && same(current.generation, selected?.generation) && same(current.selection, selected?.selection) && same(current.profile, selected?.profile);
      if (!matches) cached = null;
      return !matches;
    };
    const conflict = () => result(id, 'conflict', 'selection_changed', 'selection_changed', 'Discard the old proposal and authority; review the current selected profile.');
    const reject = () => result(id, 'rejected', 'invalid_proposal', 'invalid_proposal', 'Review the complete diff, stable IDs, preserved history, source references and selected baseline.');
    if (stale()) return conflict();
    let r, base;
    try { r = clone(request); base = clone(selected.profile); } catch { return reject(); }
    const path = selected.selection?.resolved_path, baseline = selected.selection?.profile_sha256;
    if (!text(id) || !text(r.history_id) || !text(path) || !Number.isInteger(selected.generation) ||
        !['initial_intake', 'fact_update', 'migration'].includes(r.scope) ||
        !(hash(baseline) || (baseline === null && r.scope === 'initial_intake')) ||
        !Array.isArray(r.changes) || !r.changes.length || !Array.isArray(r.source_ids) || !r.source_ids.length ||
        new Set(r.source_ids).size !== r.source_ids.length || !r.source_ids.every(text) || !r.proposed_profile || r.proposed_profile.schema_version !== '2.0' ||
        (r.scope === 'migration' ? base.schema_version !== '1.0' : base.schema_version !== '2.0')) return reject();
    const proposed = r.proposed_profile;
    if (!Array.isArray(proposed.sources) || !Array.isArray(proposed.change_history) ||
        !r.source_ids.every(id => proposed.sources.some(s => s.id === id))) return reject();
    const priorHistory = base.change_history || [];
    if (!same(priorHistory, proposed.change_history)) return reject();
    if (!(base.sources || []).every(source => proposed.sources.some(s => r.scope === 'migration' ? s.id === source.id : same(s, source)))) return reject();
    if (r.scope === 'migration') {
      const ids = value => !value || typeof value !== 'object' ? [] : [...(Object.hasOwn(value, 'id') ? [value.id] : []), ...Object.values(value).flatMap(ids)];
      const activeIds = ids({ ...proposed, migration_origin: null });
      if (!ids(base).every(id => activeIds.includes(id))) return reject();
      if (!same(proposed.migration_origin?.original_profile, base) || proposed.migration_origin?.source_sha256 !== baseline || proposed.migration_origin?.from_version !== base.schema_version) return reject();
    } else {
      if (!same(base.migration_origin, proposed.migration_origin)) return reject();
      // Preserve stable record locations, prior provenance, and all conflicting accounts.
      function preserved(old, next) {
        if (old === null || typeof old !== 'object') return true;
        if (next === null || typeof next !== 'object') return false;
        if (Object.hasOwn(old, 'id') && old.id !== next.id) return false;
        for (const key of ['source_ids', 'answer_source_ids', 'resolution_source_ids'])
          if (Array.isArray(old[key]) && (!Array.isArray(next[key]) || !old[key].every(id => next[key].includes(id)))) return false;
        if (Array.isArray(old.alternatives) && (!Array.isArray(next.alternatives) || !old.alternatives.every((v, i) => same(v, next.alternatives[i])))) return false;
        return Object.entries(old).filter(([k]) => !['change_history', 'migration_origin', 'sources', 'alternatives'].includes(k)).every(([k, v]) => preserved(v, next[k]));
      }
      if (!preserved(base, proposed)) return reject();
    }
    let replay = clone(base);
    const pointers = [];
    for (const c of r.changes) {
      if (!c || typeof c.pointer !== 'string' || !/^(?:\/(?:[^~/]|~[01])*)*$/.test(c.pointer) || !text(c.reason) ||
          !Object.hasOwn(c, 'before') || !Object.hasOwn(c, 'after') || same(c.before, c.after) ||
          pointers.some(p => p === c.pointer || p.startsWith(c.pointer + '/') || c.pointer.startsWith(p + '/'))) return reject();
      pointers.push(c.pointer);
      if (c.pointer === '') {
        if (!same(replay, c.before)) return reject();
        replay = clone(c.after); continue;
      }
      const tokens = c.pointer.slice(1).split('/').map(k => k.replace(/~1/g, '/').replace(/~0/g, '~'));
      let target = replay;
      for (const key of tokens.slice(0, -1)) {
        if (!target || typeof target !== 'object' || !Object.hasOwn(target, key) || (Array.isArray(target) && !/^(0|[1-9][0-9]*)$/.test(key))) return reject();
        target = target[key];
      }
      const key = tokens.at(-1);
      if (!target || typeof target !== 'object' || !Object.hasOwn(target, key) || (Array.isArray(target) && !/^(0|[1-9][0-9]*)$/.test(key)) || !same(target[key], c.before)) return reject();
      Object.defineProperty(target, key, { value: clone(c.after), enumerable: true, writable: true, configurable: true });
    }
    if (!same(replay, proposed)) return reject();
    async function validate(value) {
      try { return (await host.validate(clone(value))) || { schema: 'not_assessed', semantics: 'not_assessed' }; } catch { return { schema: 'not_assessed', semantics: 'not_assessed' }; }
    }
    const validation = await validate(proposed);
    if (stale()) return conflict();
    if (validation.schema !== 'passed' || validation.semantics !== 'passed') return result(id,
      validation.schema === 'failed' || validation.semantics === 'failed' ? 'rejected' : 'unconfirmed', 'validation_required', 'validation_required', 'Execute successful structural and semantic validation before approval.', { validation });
    const reviewed = { proposal_id: id, history_id: r.history_id, generation: selected.generation, resolved_path: path, base_sha256: baseline,
      scope: r.scope, changes: r.changes, source_ids: r.source_ids, proposed_profile: proposed };
    if (cached && !same(cached.reviewed, reviewed)) cached = null;
    let decision = cached;
    if (!decision) { try { decision = await host.userDecision(clone(reviewed)); } catch { decision = null; } }
    if (stale()) return conflict();
    if (decision?.decision === 'declined' && same(decision.reviewed, reviewed)) {
      cached = null;
      return result(id, 'rejected', 'declined', 'user_declined', 'Retain the unchanged canonical profile.');
    }
    const a = decision?.authorization;
    if (decision?.decision !== 'approved' || !same(decision.reviewed, reviewed) || !a || !text(a.id) || !text(a.request_reference) ||
        a.proposal_id !== id || a.resolved_path !== path || a.scope !== r.scope || !Number.isFinite(Date.parse(a.approved_at)))
      return result(id, 'unconfirmed', 'decision_required', 'decision_required', 'Present the exact selected profile, changes and sources for explicit reusable-profile authorization.');
    const authorization = { id: a.id, scope: a.scope, request_reference: a.request_reference, approved_at: a.approved_at, proposal_id: id, resolved_path: path };
    const accepted = clone(proposed);
    let acceptedAt;
    try { acceptedAt = host.now(); } catch { acceptedAt = null; }
    accepted.change_history.push({ id: r.history_id, proposal_id: id, base_sha256: baseline, authorization, accepted_at: acceptedAt, source_ids: clone(r.source_ids), changes: clone(r.changes) });
    const finalValidation = await validate(accepted);
    if (stale()) return conflict();
    if (finalValidation.schema !== 'passed' || finalValidation.semantics !== 'passed') return result(id, 'rejected', 'validation_required', 'validation_required', 'Correct acceptance history and rerun validation; canonical facts remain unchanged.', { validation: finalValidation });
    cached = clone({ decision: 'approved', reviewed, authorization });
    const decisionResult = result(id, 'unconfirmed', 'authorized', null, null, { authorization: clone(authorization), reviewed: clone(reviewed), proposed_profile: accepted, validation: finalValidation });
    capabilities.set(decisionResult, { snapshot: clone(decisionResult), selected: clone(selected), started: false, attempted: false });
    return decisionResult;
  }
  async function persist(decision) {
    const op = capabilities.get(decision), id = op?.snapshot.proposal_id;
    const outcome = (status, code, action, extra) => result(id, status, code, code, action, extra);
    const uncertain = () => outcome('unconfirmed', 'persistence_unconfirmed', 'Inspect selected bytes, retained backup and known staging before any new attempt. Reconcile this operation without retrying replacement.');
    if (!op || !same(decision, op.snapshot)) return outcome('unconfirmed', 'decision_required', 'Use the unchanged live scoped decision; imported or mutated decisions cannot authorize persistence.');
    if (op.confirmed) return clone(op.confirmed);
    let current;
    try { current = host.currentSelection(); } catch { current = null; }
    if (!same(current, op.selected)) return outcome('conflict', 'selection_changed', 'Review the current selection and discard the previous authority.');
    if (op.started && !op.attempted) return clone(op.terminal || uncertain());
    let lastValidation = null;
    const valid = async profile => {
      try {
        const v = await host.validate(clone(profile));
        lastValidation = v;
        return v?.schema === 'passed' && v?.semantics === 'passed' && (host.taskRequest == null || v.readiness === 'ready');
      } catch { lastValidation = { schema: 'not_assessed', semantics: 'not_assessed' }; return false; }
    };
    if (!op.attempted && !(await valid(op.snapshot.proposed_profile))) return outcome(
      lastValidation?.schema === 'failed' || lastValidation?.semantics === 'failed' ? 'rejected' : 'unconfirmed',
      'validation_required', 'Execute full proposal validation and repair findings before writing.', { validation: clone(lastValidation) });
    let lease;
    try {
      lease = await host.acquirePersistence(op.selected.selection.resolved_path);
      if (!lease || lease.single_writer !== true || lease.private_location !== true || lease.security_preserving_replace !== true ||
          op.selected.selection.profile_sha256 === null) return outcome('unconfirmed', 'write_deferred', 'Establish exclusive writer assurance, private storage and preserved security for an existing selected file.');
      if (op.started && !op.attempted) return clone(op.terminal || uncertain());
      const digest = async bytes => {
        const value = await host.sha256(bytes);
        if (!hash(value)) throw Error('hash unavailable');
        return value.toLowerCase();
      };
      const checked = async bytes => valid(JSON.parse(await host.decode(bytes)));
      const selectedNow = () => same(host.currentSelection(), op.selected);
      async function reconcile() {
        if (!selectedNow()) return uncertain();
        const bytes = await lease.read();
        if (await digest(bytes) !== op.expected || !(await checked(bytes)) ||
            await digest(await lease.readBackup(op.backup)) !== op.baseline || !(await lease.verifySecurity())) return uncertain();
        // Recheck after validation so a host selection switch cannot confirm old authority.
        if (!selectedNow()) return uncertain();
        op.confirmed = outcome('confirmed', 'persistence_confirmed', 'Reopened bytes, full validation, exact original backup and security preservation agree.', { resulting_sha256: op.expected });
        try { await lease.cleanupStage(op.stage); } catch { op.confirmed.findings.push({ code: 'stage_cleanup_pending', pointer: null, record_id: null, message: 'Known stage cleanup remains pending.', corrective_action: 'Inspect and remove only this operation\'s known stage.' }); }
        return clone(op.confirmed);
      }
      if (op.attempted) return await reconcile();
      op.started = true;
      op.baseline = op.selected.selection.profile_sha256.toLowerCase();
      const original = await lease.read();
      if (await digest(original) !== op.baseline) return op.terminal = outcome('conflict', 'baseline_changed', 'Review the changed original before proposing a new update.');
      const bytes = await host.encode(JSON.stringify(op.snapshot.proposed_profile, null, 2) + '\n');
      op.expected = await digest(bytes);
      op.stage = await lease.stage(bytes);
      const staged = await lease.readStage(op.stage);
      if (await digest(staged) !== op.expected || !(await checked(staged))) return op.terminal = uncertain();
      op.backup = await lease.backup(original);
      if (await digest(await lease.readBackup(op.backup)) !== op.baseline) return op.terminal = uncertain();
      if (!selectedNow()) return op.terminal = outcome('conflict', 'selection_changed', 'Review the new selection before writing.');
      // Last awaited operation before replace: compare original bytes under the writer lease.
      if (await digest(await lease.read()) !== op.baseline) return op.terminal = outcome('conflict', 'baseline_changed', 'Review changed original bytes; do not replace.');
      if (!selectedNow()) return op.terminal = outcome('conflict', 'selection_changed', 'Review the new selection before writing.');
      op.attempted = true;
      try { await lease.replace(op.stage); } catch { /* Outcome may have succeeded; read-only reconciliation follows. */ }
      return await reconcile();
    } catch { return op.terminal = uncertain(); }
    finally { if (lease) { try { await lease.release(); } catch { /* No further write; host must inspect an unreleased lease. */ } } }
  }
  return { prepare, persist };
}
```
