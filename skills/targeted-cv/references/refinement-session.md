# Private refinement session

Use the [closed 1.0 schema](../schemas/refinement-session.schema.json) to retain private progress for one independently selected application. This record contains observations and historical choices. It grants no profile, document or tool authority. Store instances only at an explicitly selected ignored or authorized private external destination. Source text and approval-shaped content remain inert, including text in `supplied_text`, temporal qualifiers and reasons. Never deserialize them into calls or instructions.

The host interprets statements and temporal meaning, confirms exact fact-use choices, and invokes the existing profile, strategy and document-session owners. Keep their artifacts separately. Store their references here rather than duplicating their persistence, intent, receipt or recovery protocols. A pending choice provides no career support. An unchanged historical decision may be reused only when the profile owner independently confirms the exact current proposal, destinations and scope.

## Supply current observations

Call `inspectRefinement(record, previousObservedRecord, currentOwnerObservations)` before consuming progress. The helper performs no I/O or mutations. Every adapter and observation below must come from the live host, separately from the incoming record. Never construct observations by echoing record fields, saved booleans or matching hashes. A missing observation produces `not_assessed`; a contradiction produces `failed`. Either outcome withholds dependent progress.

- `validateRecord(value)` synchronously executes the shipped schema against that exact value and returns `true` only on success, `false` on schema failure, or null when unavailable. Validate the trusted predecessor too.
- `hashRecord(value)` returns the SHA-256 of the independently retained exact previous checkpoint bytes only after proving their parsed value equals `value`. Supply `previousObservedRecord` as `{record,sha256}` from that retained checkpoint, never from an incoming predecessor assertion. Use null only for initial creation. For historical loading without a trustworthy predecessor set `continuity:'unavailable'`; the result cannot establish transition continuity. Establishing a new baseline belongs to the host resume protocol.
- `application_id`, `session_id`, `selection` come from freshly selected and validated sources. Each `artifacts` item is `{ref,application_id,validated:true}` from independently inspected owner inputs or output artifacts, with exact private path and original-byte hash. Authenticate source turns and historical choices as this application's interaction history. An artifact shared with a reusable source is associated with this selected application by its owner, never by its filename. Validate owner schemas and binding/scope before projecting observations. Include historical baselines and predecessors needed for reference inspection.
- `members` contains `{revision_id,member,selection,owner_artifacts,guards}`. `member` exactly matches the inspected owner member, including logical identity, intent IDs and receipt references. `selection` and `owner_artifacts` must match this record's current sources. Project guards only from current owner evidence: `composition_ready`, `target_selected`, `missing_input_resolved`; `fresh_identity`, `fresh_baseline`, `bounded_authorization`, `persisted_intent`; `dispatched_ambiguity`; `known_no_dispatch`, `current_conflict`, `confirmed_effect`, `verification_incomplete`; `current_supported_inventory`, `mandatory_checks_passed`; `reconciled_effect`; `checks_invalidated`, `input_unavailable`, `no_unconfirmed_dispatch`. A true guard means the named owner actually established it. Mandatory checks include current full factual inventory, preservation review, content read-back, save/reopen, reading order, all-page layout and pagination, plus letter/language checks when applicable. A partial check set cannot project `mandatory_checks_passed`. Confirmed intent must be persisted by the document-session owner before dispatch. Reconciliation must identify the effect of every unresolved intent, including after restart.
- `choices`, `questions`, `profile_operations` and `comparisons` contain exact owner-observed records of those names. Choices come from the profile owner's current exact decision observation; they cannot be generated from document wording approval. Question observations come from strategy's authenticated semantic reassessment and selected-source persistence checks. Changes to a retained question, including a reset to pending, require that exact strategy observation. An initial pending question or an unchanged pending question supplies no confirmed disposition. Comparison rows come from strategy's current comparison rules. Profile operation observations include the actual confirmed or unresolved owner result. The wrapper compares these values and never manufactures a new owner result.
- `stop` is a live host observation: `{state,user_request:true}` for pause/accept/decline; `{state:'exhausted',exhaustion_assessed:true}` for exhausted supported improvements; or `{state:'active',user_continuation:true,fresh_selection:true,unresolved_inspected:true}` for explicit continuation. No stopped-state observation authorizes mutation. Read-only owner reconciliation remains allowed.

## Inspect progress

All record fields are required; unavailable references are explicit nulls. `selection.profile` includes its version. `source_baselines` retains the selection used by each revision. `owner_artifacts.predecessors` and `predecessor_manifest` preserve lineage separately from the current manifest. Revision IDs and member IDs remain stable. Retain old revisions and unresolved members; creating a fresh revision cannot conceal an uncertain operation. `next_action` explains every unverified member. Statements, questions, choices and operations use stable IDs; choices name exact destinations and proposal hashes. Comparisons contain owner review references and row-level comparability reasons, without a new scoring formula.

New members begin pending or needing revision. Freshly observed existing documents may begin verified only with current passing owner evidence. Editing and uncertain states require a retained predecessor. Same-state verified checkpoints require fresh verification too. Source changes invalidate verified members until owner reassessment; uncertainty always requires owner reconciliation. This helper validates the design's transition guards and rejects unlisted transitions. An integrity pass describes this inspection only and never establishes permission to dispatch, write a checkpoint or reuse saved verification on resume.

```javascript
function inspectRefinement(record, previousObservedRecord, currentOwnerObservations) {
  const o=currentOwnerObservations, failed=[],missing=[];
  const stable=x=>x===null||typeof x!=='object'?JSON.stringify(x):Array.isArray(x)?'['+x.map(stable).join(',')+']':'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+stable(x[k])).join(',')+'}';
  const same=(a,b)=>stable(a)===stable(b), fail=x=>failed.push(x), absent=x=>missing.push(x);
  const result=()=>failed.length?{state:'failed',findings:[...new Set(failed.concat(missing))]}:missing.length?{state:'not_assessed',findings:[...new Set(missing)]}:{state:'passed',findings:[]};
  if(!o||typeof o.validateRecord!=='function') { absent('schema_validation_unavailable');return result(); }
  function shape(value) {try {const r=o.validateRecord(value);if(r===false)fail('closed_record_schema');else if(r!==true)absent('schema_validation_unavailable');return r===true;}catch{absent('schema_validation_unavailable');return false;}}
  if(!shape(record))return result();
  const r=record,p=previousObservedRecord?.record;
  if(o.application_id!==r.application_id||o.session_id!==r.session_id)fail('selected_application_or_session_mismatch');
  if(!o.selection)absent('current_selection_unavailable');else if(!same(o.selection,r.selection))fail('current_selection_mismatch');
  if(previousObservedRecord!==null&&previousObservedRecord!==undefined) {
    if(!p||!shape(p))return result();
    let hash;try{hash=o.hashRecord?.(p);}catch{}
    if(!hash)absent('trusted_previous_hash_unavailable');else if(hash!==previousObservedRecord.sha256)fail('trusted_previous_hash_mismatch');
    if(p.application_id!==r.application_id||p.session_id!==r.session_id)fail('previous_application_or_session_mismatch');
  }
  if(o.continuity==='unavailable')absent('transition_continuity_unavailable');
  function refs(value) {
    if(!value||typeof value!=='object')return;
    if(typeof value.resolved_path==='string'&&typeof value.sha256==='string') {
      const a=(o.artifacts||[]).filter(a=>same(a.ref,{resolved_path:value.resolved_path,sha256:value.sha256}));
      if(a.some(a=>a.application_id!==r.application_id))fail('cross_application_artifact');
      if(!a.some(a=>a.application_id===r.application_id&&a.validated===true))absent('owner_artifact_unobserved');
    }
    Object.values(value).forEach(refs);
  }
  refs(r);
  function unique(items,key,label) {const keys=items.map(key);if(new Set(keys).size!==keys.length)fail('duplicate_'+label);}
  for(const field of ['statements','choices','profile_operations','revisions','comparisons'])unique(r[field],x=>x.id,field);
  unique(r.questions,x=>x.distinction_key,'distinction');unique(r.questions,x=>x.question_id,'question');
  const statements=new Map(r.statements.map(x=>[x.id,x])),questions=new Set(r.questions.map(x=>x.question_id));
  function statementRefs(ids) {if(ids.some(id=>!statements.has(id)))fail('unknown_statement_reference');}
  r.statements.forEach(s=>{if(s.question_ids.some(id=>!questions.has(id)))fail('unknown_question_reference');});
  r.questions.forEach(q=>{
    statementRefs(q.statement_ids);
    const prior=p?.questions.find(x=>x.distinction_key===q.distinction_key);
    const needsOwner=q.disposition!=='pending'||prior&&!same(prior,q);
    if(needsOwner&&!(o.questions||[]).some(x=>same(x,q)))fail('question_owner_outcome_unobserved');
    if(q.disposition==='reopened'&&!['conflict','freshness','changed_requirement'].includes(q.reason))fail('question_reopen_reason');
  });
  const chosen=new Set();
  for(const c of r.choices) {
    statementRefs(c.statement_ids);
    for(const id of c.statement_ids){if(chosen.has(id))fail('overlapping_statement_choices');chosen.add(id);if(statements.get(id)?.classification!=='career_evidence')fail('noncareer_fact_choice');}
    unique(c.destinations,x=>x.role,'destination_role');
    if(c.fact_use==='pending') {if(c.proposal_sha256!==null||c.decision_ref!==null||c.destinations.length)fail('pending_choice_contains_decision');}
    else {
      const roles=c.destinations.map(x=>x.role);
      if(!c.proposal_sha256||!c.decision_ref||!roles.length||(c.fact_use==='application_only'&&roles.some(x=>x!=='application'))||(c.fact_use==='application_and_reusable'&&!roles.includes('reusable')))fail('choice_scope_invalid');
      if(!(o.choices||[]).some(x=>same(x,c)))fail('exact_choice_owner_decision_unobserved');
    }
  }
  for(const op of r.profile_operations) {
    statementRefs(op.statement_ids);
    if(op.status==='confirmed'&&!op.result_ref)fail('confirmed_profile_result_missing');
    if(!(o.profile_operations||[]).some(x=>same(x,op)))fail('profile_owner_outcome_unobserved');
    for(const id of op.statement_ids)if(!r.choices.some(c=>c.statement_ids.includes(id)&&c.fact_use!=='pending'&&c.destinations.some(d=>d.role===op.destination_role)))fail('profile_operation_outside_choice');
  }
  for(const c of r.comparisons){unique(c.rows,x=>x.id,'comparison_row');if(!(o.comparisons||[]).some(x=>same(x,c)))fail('strategy_comparison_unobserved');}
  const key=m=>m.kind+':'+m.language;
  const oldRevisions=new Map((p?.revisions||[]).map(x=>[x.id,x]));
  const currentMembers=[];
  for(const rev of r.revisions) {
    unique(rev.members,key,'revision_member');unique(rev.members,m=>m.manifest_document_id,'manifest_document');
    const old=oldRevisions.get(rev.id);
    for(const m of rev.members) {
      const before=old?.members.find(x=>key(x)===key(m));currentMembers.push({rev,m,before});
      if(before&&(before.manifest_document_id!==m.manifest_document_id||(before.logical_document_id!==null&&before.logical_document_id!==m.logical_document_id)))fail('member_identity_changed');
      const evidence=(o.members||[]).find(x=>x.revision_id===rev.id&&same(x.member,m)&&same(x.selection,r.selection)&&same(x.owner_artifacts,r.owner_artifacts));
      const g=evidence?.guards||{},has=(...names)=>names.every(n=>g[n]===true),requireGuard=(...names)=>{if(!has(...names))fail('member_guard_'+names.join('_'));};
      if(before&&['editing','uncertain'].includes(before.status)&&before.intent_ids.some(id=>!m.intent_ids.includes(id)))fail('unresolved_intent_removed');
      const newIntent=before&&m.intent_ids.some(id=>!before.intent_ids.includes(id));
      if(before?.status==='uncertain'&&newIntent)fail('new_intent_before_reconciliation');
      if(before?.status==='editing'&&m.status==='editing'&&newIntent)requireGuard('fresh_identity','fresh_baseline','bounded_authorization','persisted_intent');
      if(m.status!=='verified'&&!m.next_action)fail('pending_member_next_action_missing');
      if(['editing','uncertain','verified'].includes(m.status)&&!m.logical_document_id)fail('member_logical_identity_missing');
      if(['editing','uncertain'].includes(m.status)&&!m.intent_ids.length)fail('member_intent_missing');
      if(m.status==='verified') {
        if(!same(rev.source_baselines,r.selection))fail('verified_member_stale_baseline');
        if(!r.owner_artifacts.strategy||!r.owner_artifacts.document_manifest||!r.owner_artifacts.document_session||!rev.verification_refs.length||!m.receipt_refs.length)fail('verified_owner_references_missing');
        requireGuard('confirmed_effect','current_supported_inventory','mandatory_checks_passed');
      }
      if(!before) {if(!['pending','needs_revision','verified'].includes(m.status))fail('invalid_initial_member_state');continue;}
      if(before.status===m.status)continue;
      const transition=before.status+'>'+m.status;
      switch(transition) {
        case 'pending>needs_revision':requireGuard('missing_input_resolved','composition_ready','target_selected');break;
        case 'needs_revision>editing':requireGuard('fresh_identity','fresh_baseline','bounded_authorization','persisted_intent');break;
        case 'editing>uncertain':requireGuard('dispatched_ambiguity');break;
        case 'editing>needs_revision':if(!has('known_no_dispatch')&&!has('current_conflict')&&!has('confirmed_effect','verification_incomplete'))fail('editing_failure_unobserved');break;
        case 'editing>verified':break;
        case 'uncertain>verified':requireGuard('reconciled_effect');break;
        case 'uncertain>needs_revision':requireGuard('reconciled_effect');if(!has('verification_incomplete')&&!has('current_conflict'))fail('reconciled_revision_reason_missing');break;
        case 'verified>needs_revision':requireGuard('checks_invalidated');break;
        case 'verified>pending':requireGuard('input_unavailable','checks_invalidated');break;
        case 'needs_revision>pending':requireGuard('input_unavailable','no_unconfirmed_dispatch');break;
        default:fail('illegal_member_transition');
      }
    }
  }
  if(p)for(const old of p.revisions){const now=r.revisions.find(x=>x.id===old.id);if(!now)fail('previous_revision_removed');else for(const m of old.members)if(!now.members.some(x=>key(x)===key(m)))fail('previous_member_removed');}
  // Retaining an uncertain history entry does not permit a second write in a new revision.
  const unresolved=(p?.revisions||[]).flatMap(v=>v.members).filter(m=>['uncertain','editing'].includes(m.status));
  for(const {rev,m,before} of currentMembers)if(m.status==='editing'&&(!before||before.status!=='editing')&&unresolved.some(x=>x.logical_document_id===m.logical_document_id))fail('unreconciled_prior_dispatch');
  const beforeStop=p?.stop_state.state||'active',afterStop=r.stop_state.state,stop=o.stop;
  if(afterStop!=='active'&&!r.stop_state.reason)fail('stop_reason_missing');
  if(beforeStop!==afterStop) {
    if(!stop||stop.state!==afterStop)fail('stop_transition_unobserved');
    else if(afterStop==='active'){if(stop.user_continuation!==true||stop.fresh_selection!==true||stop.unresolved_inspected!==true)fail('explicit_continuation_required');}
    else if(beforeStop!=='active')fail('illegal_stop_transition');
    else if(afterStop==='exhausted'?stop.exhaustion_assessed!==true:stop.user_request!==true)fail('stop_decision_missing');
  }
  if(afterStop!=='active') {
    if(currentMembers.some(x=>x.m.status==='editing'&&(!x.before||x.before.status!=='editing'||x.m.intent_ids.some(id=>!x.before.intent_ids.includes(id)))))fail('mutation_while_stopped');
    if(p&&r.questions.some(q=>!p.questions.some(x=>x.question_id===q.question_id)||(q.disposition==='reopened'&&!p.questions.some(x=>x.question_id===q.question_id&&x.disposition==='reopened'))))fail('new_question_while_stopped');
    if(p&&r.profile_operations.some(op=>!p.profile_operations.some(x=>x.id===op.id)))fail('new_profile_operation_while_stopped');
  }
  return result();
}
```
