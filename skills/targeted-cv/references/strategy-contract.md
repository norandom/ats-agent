# Private strategy contract

Use [the strategy 1.1 schema](../schemas/application-strategy.schema.json) for each immutable application snapshot. The unchanged [1.0 archive](../schemas/application-strategy-v1.schema.json) validates historical artifacts only. The current consumer rejects old and unknown versions. Rebuild from newly selected and validated sources; inserting defaults into an old ready handoff does not renew its review. Store instances only at the explicitly selected or already authorized private destination. The schema defines every field and permitted null. All fields are required; an empty collection means no retained records, while null means an explicitly optional or unknown value. Never place candidate instances beside these reusable assets.

## Application sources and shared eligibility

Application context stays outside reusable career facts. Its records retain one assertion each, provenance and optional confirmation. `application_context: null` supports canonical-only work; both application binding fields must then be null. A confirmed empty enclosure array explicitly means no attachments and remains addressable through `/value`. Other array pointers address existing elements only. Recipient addresses must contain at least one line. Dates are ISO calendar dates; localized rendering belongs to document review.

Supply `host.target` as the independently selected target (including its computed hash), `host.application_context_bytes` as the exact saved UTF-8 string or null, and `host.confirmation_observations` as an array of independently observed `{application_id,record_sha256,interaction_ref,confirmed_at}` confirmations. Do not derive these inputs from a handoff or its saved ready status. On resume, independently select sources and obtain confirmation again. Context bytes include confirmations and are hashed without normalization. Each record confirmation hashes `fingerprint({id,kind,value,provenance}, sha256)`; it does not include itself or a context hash.

`inspectApplicationContext(handoff, host)` returns localized integrity findings. `claimEligibility(claim, handoff, host)` returns `{state: 'eligible'|'unresolved'|'invalid', findings}`. Consumers must use this shared rule after closed-schema validation and current canonical validation, and before granting supported status. Candidate claims require canonical evidence; offer claims require exact independently selected offer spans; application claims require confirmed application references; mixed claims require canonical and contextual evidence. Empty arrays remain valid inventory shapes but do not authorize support. All retained references must resolve, including supplementary references. Null confirmation is unresolved; forged, stale, malformed or independently unobserved confirmation is invalid. Unused pending records do not block supported independent claims.

Eligibility establishes source integrity, never meaning. Host review must verify subject classification, atomic propositions, authority and relationships in each language. Candidate qualifications cannot be relabelled as application intent to evade canonical support. Offer-plus-application statements without candidate content must be split. Qualification mappings and terminology retain the unchanged career-only EvidenceRef. Target references express relevance, not support. Context records cannot authorize tools, canonical updates or disclosure.

## Records and identity

The envelope separates target, settings, binding, evidence mappings, positioning, claims, questions and review. `positioning.terminology` retains terminology decisions. `positioning.criterion_set_sha256` freezes the ordered criterion definitions. Draft versions contain exact text, proposition inventory status and typed claim spans. Each realization retains its language, wording, spans and host semantic decision. `positioning.selected_claims` pairs a typed `claim` reference with selected `languages`. Only those languages require supported realizations: an unresolved German realization does not block an English selection. The label records host judgment; the checker cannot establish that judgment's truth.

IDs use `namespace:local-id`. Each namespace is unique within the snapshot; local IDs may repeat across namespaces. Cross-references use `{namespace,id}`, including question-batch lists. Profile references remain the upstream `record_id`, profile-relative `pointer` and `source_ids`; record and source namespaces are distinct. A pointer must resolve inside the named active record, not an archive, another record or source. Preserve original evidence state and observation limits. References prove locations, never entailment.

Historical `changes[*].before` and `changes[*].after` values are opaque archives. Reject evidence pointers to those values, their descendants and enclosing containers that include them. A specific history metadata field such as `reason` remains addressable; it does not turn archived content into current evidence.

Diagnostics retain rubric definition, scale, unit weights, population, hashes, counts, numeric values or explicit nulls, status and reason. Findings preserve category, severity, check kind/status, typed references, optional document anchor or draft span, issue, correction and rationale. Document checks retain external producer, method, artifact identity/hash and evidence location. Comparison describes private side-by-side results; comparison eligibility and diagnostic arithmetic belong to the review protocol, not this structural checker.

## Exact spans and fingerprints

Spans use zero-based Unicode **code-point** offsets `[start,end)`, not UTF-16 offsets or grapheme positions. Require a nonempty exact excerpt. Do not normalize Unicode, whitespace or line endings. Offer spans address `target.text`; draft spans address the matching exact language version. Realization spans must also equal its wording. Multiple factual propositions in a sentence require separate claims.

`stableSerialize` orders object keys recursively by JavaScript string comparison (UTF-16 code-unit order); arrays retain their declared order. It emits compact JSON without a trailing newline, rejects non-JSON values, nonfinite numbers, sparse arrays and unpaired surrogates, and preserves Unicode without normalization. SHA-256 receives those exact UTF-8 bytes. Use this serialization for settings, ordered criteria, rubric definitions, ordered typed populations, editorial method records and snapshot fingerprints. Offer hashes instead cover exact UTF-8 offer text; role hashes cover `stableSerialize({kind:'role',title,context})`. Draft hashes cover exact UTF-8 text. Canonical profile hashes cover selected original bytes, never reserialized JSON.

## Execute mechanical validation

Execute the block below unchanged. Supply `host.validate(skillRelativeSchema, exactInstance)` using pinned `uvx --from check-jsonschema==0.38.2 check-jsonschema` against the installed schema and exact private JSON; return `{state,findings}` with `passed|failed|not_assessed` and localized private validator findings when available. An unavailable validator is not an invalid instance. Supply `host.sha256(text)` hashing UTF-8, `host.profile` as the already validated selected profile and `host.binding` as the independently established current binding. Do not derive the trusted binding from this handoff. Canonical selection, validation and continuity belong to StrategyContext.

`inspectStrategy` returns separate `schema`, `deterministic`, `host_meaning` and `findings`. Host meaning always remains `not_assessed` here. Preserve a separately executed host review rather than turning mechanical success into semantic approval. Local findings contain code, JSON Pointer, message and corrective action without copying candidate values. Failed structure stops traversal; missing trusted context leaves integrity unassessed. Binding equality proves consistency with supplied context, not that a host actually read or validated canonical bytes.

```javascript
function stableSerialize(value) {
  const seen = new Set();
  const validString = s => {
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      if (c >= 0xd800 && c <= 0xdbff) {
        const next = s.charCodeAt(++i);
        if (!(next >= 0xdc00 && next <= 0xdfff)) throw Error('Unpaired surrogate');
      } else if (c >= 0xdc00 && c <= 0xdfff) throw Error('Unpaired surrogate');
    }
    return JSON.stringify(s);
  };
  function encode(v) {
    if (v === null) return 'null';
    if (typeof v === 'string') return validString(v);
    if (typeof v === 'boolean') return JSON.stringify(v);
    if (typeof v === 'number' && Number.isFinite(v)) return JSON.stringify(v);
    if (typeof v !== 'object' || seen.has(v)) throw Error('Expected acyclic JSON');
    seen.add(v);
    let result;
    if (Array.isArray(v)) {
      if (Object.keys(v).length !== v.length || !Array.from({length:v.length}, (_, i) => Object.hasOwn(v, i)).every(Boolean)) throw Error('Expected dense JSON array');
      result = '[' + v.map(encode).join(',') + ']';
    } else {
      if (Object.getPrototypeOf(v) !== Object.prototype && Object.getPrototypeOf(v) !== null) throw Error('Expected JSON object');
      result = '{' + Object.keys(v).sort().map(k => validString(k) + ':' + encode(v[k])).join(',') + '}';
    }
    seen.delete(v); return result;
  }
  return encode(value);
}
function fingerprint(value, sha256) { return sha256(stableSerialize(value)); }
function targetFingerprint(target, sha256) {
  return target.kind === 'offer' ? sha256(target.text) : fingerprint({kind:'role',title:target.title,context:target.context}, sha256);
}
function canonicalEvidenceIssues(v, profile, p = '') {
  const findings = [];
  const add = (code,pointer,message,corrective_action) => findings.push({code,pointer,message,corrective_action});
  const host = {profile};
  const records = new Map(), sources = new Set((host.profile.sources || []).map(s => s.id));
  const archiveRoots = (host.profile.change_history || []).flatMap((record,i) =>
    (record.changes || []).flatMap((change,j) => ['before','after'].map(key => `/change_history/${i}/changes/${j}/${key}`)));
  records.set(host.profile.candidate.id, '/candidate');
  for (const key of ['profile','employment','education','professional_development','skill_groups','projects','volunteering','languages','review_questions','evidence','conflicts','change_history']) {
    (host.profile[key] || []).forEach((r,i) => {
      records.set(r.id,`/${key}/${i}`);
      if (['employment','skill_groups'].includes(key)) (r.claims || []).forEach((c,j) => records.set(c.id,`/${key}/${i}/claims/${j}`));
      if (key === 'change_history' && r.authorization) records.set(r.authorization.id,`/${key}/${i}/authorization`);
    });
  }
  function resolve(pointer) {
    return pointer.slice(1).split('/').reduce((v,k) => {
      k = k.replace(/~1/g,'/').replace(/~0/g,'~');
      return v && typeof v === 'object' && Object.hasOwn(v,k) ? v[k] : undefined;
    },host.profile);
  }

  const root = records.get(v.record_id);
  if (!root) add('profile_reference',p+'/record_id','Profile record reference does not resolve.','Use an active profile record ID, not a source ID.');
  else if (!(v.pointer === root || v.pointer.startsWith(root+'/')) || resolve(v.pointer) === undefined || [...records.entries()].some(([id,other]) => id !== v.record_id && other.startsWith(root+'/') && (v.pointer === other || v.pointer.startsWith(other+'/')))) add('profile_pointer',p+'/pointer','Pointer does not resolve inside the named record.','Translate the record-relative field pointer to its exact profile-relative location.');
  else if (archiveRoots.some(archive => v.pointer === archive || v.pointer.startsWith(archive+'/') || archive.startsWith(v.pointer+'/'))) add('profile_archive',p+'/pointer','Evidence pointer addresses or contains opaque historical values.','Reference a current active fact or a specific history metadata field; never use archived before or after values as current support.');
  v.source_ids.forEach((id,i) => { if (!sources.has(id)) add('source_reference',p+'/source_ids/'+i,'Source reference does not resolve.','Use an active source identifier.'); });
  return findings;
}

function inspectApplicationContext(h, host) {
  const findings = [];
  const add = (code,pointer) => findings.push({code,pointer,message:'Application source is not independently current and valid.',corrective_action:'Reselect exact sources and obtain current host-observed confirmation.'});
  const context = h.application_context;
  if (host.target && stableSerialize(host.target) !== stableSerialize(h.target)) add('target_binding','/target');
  if (context === null) {
    if (h.binding.application_id !== null || h.binding.application_context_sha256 !== null || (host.application_context_bytes !== undefined && host.application_context_bytes !== null)) add('context_binding','/application_context');
    return findings;
  }
  try {
    if (typeof host.application_context_bytes !== 'string' || !host.target || stableSerialize(JSON.parse(host.application_context_bytes)) !== stableSerialize(context) || host.sha256(host.application_context_bytes) !== h.binding.application_context_sha256 || context.application_id !== h.binding.application_id || context.target_sha256 !== targetFingerprint(host.target,host.sha256) || context.target_sha256 !== h.target.sha256) add('context_binding','/application_context');
    const ids = new Set();
    context.records.forEach((r,i) => {
      const p = '/application_context/records/'+i;
      if (ids.has(r.id)) add('duplicate_context_id',p+'/id');
      ids.add(r.id);
      if (r.provenance.kind === 'selected_offer' && !validOfferSpan(r.provenance.offer_span,host.target)) add('context_offer_span',p+'/provenance/offer_span');
      if (r.confirmation !== null) {
        const {id,kind,value,provenance} = r;
        if (r.confirmation.application_id !== context.application_id || r.confirmation.record_sha256 !== fingerprint({id,kind,value,provenance},host.sha256) || !(host.confirmation_observations || []).some(c => stableSerialize(c) === stableSerialize(r.confirmation))) add('context_confirmation',p+'/confirmation');
      }
    });
  } catch { add('context_binding','/application_context'); }
  return findings;
}
function validOfferSpan(s,target) {
  if (!s || target?.kind !== 'offer' || typeof target.text !== 'string') return false;
  const points = Array.from(target.text);
  return Number.isInteger(s.start) && Number.isInteger(s.end) && s.start >= 0 && s.start < s.end && s.end <= points.length && points.slice(s.start,s.end).join('') === s.excerpt;
}
function claimEligibility(claim,h,host) {
  const findings = inspectApplicationContext(h,host);
  const add = (code,pointer) => findings.push({code,pointer,message:'Claim evidence cannot resolve to its current source.',corrective_action:'Retain unresolved support or rebuild references from independently selected sources.'});
  if (!host.profile || !host.binding || stableSerialize(h.binding) !== stableSerialize(host.binding) || h.binding.validation_profile_sha256 !== h.binding.canonical_sha256) add('binding_mismatch','/binding');
  if (h.target.sha256 !== targetFingerprint(h.target,host.sha256) || h.binding.target_sha256 !== h.target.sha256) add('target_binding','/target');
  let canonical = 0, offer = 0, application = 0, pending = false;
  for (const [i,r] of (claim.evidence || []).entries()) {
    try {
      const errors = canonicalEvidenceIssues(r,host.profile,'/evidence/'+i);
      findings.push(...errors); if (!errors.length) canonical++;
    } catch { add('profile_reference','/evidence/'+i); }
  }
  for (const [i,r] of (claim.context_evidence || []).entries()) {
    const p = '/context_evidence/'+i;
    if (r.kind === 'offer') {
      if (!host.target || stableSerialize(host.target) !== stableSerialize(h.target) || r.target_sha256 !== targetFingerprint(host.target,host.sha256) || !validOfferSpan(r,host.target)) add('context_offer_reference',p);
      else offer++;
    } else if (r.kind === 'application') {
      const record = h.application_context?.records.find(x => x.id === r.record_id);
      const index = /^\/value\/(0|[1-9][0-9]*)$/.exec(r.pointer);
      if (!record || r.application_id !== h.binding.application_id || r.context_sha256 !== h.binding.application_context_sha256 || !(r.pointer === '/value' || (index && Array.isArray(record.value) && Number(index[1]) < record.value.length))) add('context_application_reference',p);
      else if (record.confirmation === null) pending = true;
      else application++;
    } else add('context_reference_kind',p);
  }
  const eligible = {candidate:canonical > 0,offer:offer > 0,application:application > 0,mixed:canonical > 0 && offer + application > 0}[claim.subject] === true;
  return {state:findings.length ? 'invalid' : eligible && !pending ? 'eligible' : 'unresolved',findings};
}
async function inspectStrategy(value, host = {}) {
  const report = {schema:'not_assessed',deterministic:'not_assessed',host_meaning:'not_assessed',findings:[]};
  function add(code, pointer, message, corrective_action) { report.findings.push({code,pointer,message,corrective_action}); }
  let checked;
  try { checked = await host.validate('schemas/application-strategy.schema.json', value); } catch { /* unavailable */ }
  if (!checked || !['passed','failed'].includes(checked.state)) {
    add('schema_unavailable','/','Structural validation was not completed.','Run the pinned schema validator on this exact private instance.'); return report;
  }
  report.schema = checked.state;
  if (checked.state === 'failed') {
    report.findings.push(...(checked.findings || []));
    if (!report.findings.length) add('schema_invalid','/','The schema validator rejected this instance.','Inspect private validator diagnostics and correct the affected field.');
    return report;
  }
  if (!host.profile || !host.binding || typeof host.sha256 !== 'function') {
    add('context_unavailable','/binding','Trusted profile, binding or hashing is unavailable.','Establish current context independently before checking integrity.'); return report;
  }
  const h = value, sha256 = host.sha256;
  const tables = new Map();
  const collections = {criterion:h.criteria,inferred_need:h.inferred_needs,claim:h.claims,question:h.questions,disposition:h.dispositions,guidance:h.guidance,editorial_method:h.editorial_methods,diagnostic:h.diagnostics,document_check:h.document_checks,finding:h.findings,terminology:h.positioning.terminology};
  const paths = {criterion:'criteria',inferred_need:'inferred_needs',claim:'claims',question:'questions',disposition:'dispositions',guidance:'guidance',editorial_method:'editorial_methods',diagnostic:'diagnostics',document_check:'document_checks',finding:'findings',terminology:'positioning/terminology'};
  for (const [ns, entries] of Object.entries(collections)) {
    const ids = new Map(); tables.set(ns,ids);
    entries.forEach((r,i) => {
      if (ids.has(r.id)) add('duplicate_id',`/${paths[ns]}/${i}/id`,'Identifier repeats within its namespace.','Assign a unique stable identifier and update references.');
      else ids.set(r.id,r);
    });
  }
  function walk(v,p,visit) {
    if (!v || typeof v !== 'object') return;
    visit(v,p);
    Object.entries(v).forEach(([k,c]) => walk(c,p+'/'+k.replace(/~/g,'~0').replace(/\//g,'~1'),visit));
  }
  walk(h,'',(v,p) => {
    if (Object.hasOwn(v,'namespace') && !tables.get(v.namespace)?.has(v.id)) add('broken_reference',p,'Typed reference does not resolve.','Select an existing identifier in the declared namespace.');
    if (Object.hasOwn(v,'record_id') && Object.hasOwn(v,'source_ids')) report.findings.push(...canonicalEvidenceIssues(v,host.profile,p));
  });
  report.findings.push(...inspectApplicationContext(h,host));
  h.claims.forEach((claim,i) => {
    const result = claimEligibility(claim,h,host);
    if (result.state === 'invalid') result.findings.forEach(f => add(f.code, '/claims/'+i+f.pointer, f.message, f.corrective_action));
    if (result.state !== 'eligible' && claim.realizations.some(r => r.semantic_state === 'supported')) add('claim_support_ineligible','/claims/'+i,'Supported realization lacks eligible sources.','Retain unresolved support or supply current valid evidence and review meaning.');
  });
  function hashCheck(actual, expected, p) {
    if (actual !== expected) add('fingerprint_mismatch',p,'Fingerprint differs from the exact current content.','Rebuild the affected snapshot from current inputs using the specified serialization.');
  }
  try {
    stableSerialize(h);
    for (const key of Object.keys(h.binding)) if (h.binding[key] !== host.binding[key]) add('binding_mismatch','/binding/'+key,'Binding differs from the independently supplied context.','Discard stale conclusions and establish current canonical context.');
    if (h.binding.validation_profile_sha256 !== h.binding.canonical_sha256) add('binding_mismatch','/binding/validation_profile_sha256','Validation identifies different canonical bytes.','Validate the exact selected bytes before producing a handoff.');
    hashCheck(h.target.sha256,targetFingerprint(h.target,sha256),'/target/sha256');
    hashCheck(h.binding.target_sha256,h.target.sha256,'/binding/target_sha256');
    hashCheck(h.binding.settings_sha256,fingerprint(h.settings,sha256),'/binding/settings_sha256');
    hashCheck(h.positioning.criterion_set_sha256,fingerprint(h.criteria,sha256),'/positioning/criterion_set_sha256');
    h.diagnostics.forEach((d,i) => { hashCheck(d.rubric_sha256,fingerprint(d.rubric,sha256),`/diagnostics/${i}/rubric_sha256`); hashCheck(d.population_sha256,fingerprint(d.population,sha256),`/diagnostics/${i}/population_sha256`); });
    h.dispositions.forEach((d,i) => { if (stableSerialize(d.binding) !== stableSerialize(h.binding)) add('binding_mismatch',`/dispositions/${i}/binding`,'Disposition has another binding.','Reevaluate dispositions through the current context continuity protocol.'); });
  } catch {
    add('serialization_invalid','/','Fingerprint input or hash computation is invalid.','Use well-formed JSON and a working UTF-8 SHA-256 adapter.');
  }
  const drafts = new Map();
  (h.draft?.versions || []).forEach((d,i) => {
    if (drafts.has(d.language)) add('duplicate_language',`/draft/versions/${i}/language`,'A draft language repeats.','Retain one exact version per language.');
    drafts.set(d.language,d);
    hashCheck(d.sha256,sha256(d.text),`/draft/versions/${i}/sha256`);
    d.claims.forEach((c,j) => c.spans.forEach((s,k) => span(s,d.text,`/draft/versions/${i}/claims/${j}/spans/${k}`)));
  });
  function span(s,text,p) {
    const points = typeof text === 'string' ? Array.from(text) : [];
    if (s.start >= s.end || s.end > points.length || points.slice(s.start,s.end).join('') !== s.excerpt) add('span_mismatch',p,'Span does not match the exact addressed text.','Recompute Unicode code-point offsets and retain the exact excerpt.');
  }
  h.criteria.forEach((c,i) => c.spans.forEach((s,j) => span(s,h.target.kind === 'offer' ? h.target.text : null,`/criteria/${i}/spans/${j}`)));
  h.inferred_needs.forEach((c,i) => c.spans.forEach((s,j) => span(s,h.target.kind === 'offer' ? h.target.text : null,`/inferred_needs/${i}/spans/${j}`)));
  h.claims.forEach((c,i) => {
    const seen = new Set();
    c.realizations.forEach((r,j) => {
      if (seen.has(r.language)) add('duplicate_language',`/claims/${i}/realizations/${j}/language`,'Claim realization language repeats.','Keep one reviewed realization per language.');
      seen.add(r.language);
      r.spans.forEach((s,k) => { span(s,drafts.get(r.language)?.text,`/claims/${i}/realizations/${j}/spans/${k}`); if (s.excerpt !== r.wording) add('span_mismatch',`/claims/${i}/realizations/${j}/wording`,'Realization differs from its draft excerpt.','Review the actual wording and update the exact span.'); });
    });
  });
  h.findings.forEach((f,i) => { if (f.draft_span) span(f.draft_span.span,drafts.get(f.draft_span.language)?.text,`/findings/${i}/draft_span`); });
  h.criteria.forEach((c,i) => { if (h.mappings.filter(m => m.criterion.id === c.id).length !== 1) add('mapping_cardinality',`/criteria/${i}`,'Criterion does not have exactly one mapping.','Retain one mapping for each explicit criterion.'); });
  h.positioning.selected_claims.forEach((r,i) => {
    const c = tables.get('claim').get(r.claim.id);
    if (r.languages.some(language => !h.settings.languages.includes(language))) add('selection_language',`/positioning/selected_claims/${i}/languages`,'Selection includes an unrequested language.','Select only requested application languages.');
    if (c && r.languages.some(language => !c.realizations.some(v => v.language === language && v.semantic_state === 'supported'))) add('selected_claim_unreviewed',`/positioning/selected_claims/${i}`,'Selected claim lacks a supported realization in a selected language.','Obtain host semantic review or remove that language from the claim selection.');
  });
  if (h.state === 'ready_for_document_draft' && h.findings.some(f => f.severity === 'blocking' && f.status !== 'passed')) add('invalid_handoff_state','/state','Blocking findings remain in a document-ready handoff.','Resolve the blocking findings or retain needs_revision.');
  report.deterministic = report.findings.length ? 'failed' : 'passed';
  return report;
}
```
