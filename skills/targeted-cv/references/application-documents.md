# Private application documents

Keep manifest instances, exact excerpts and observations at an explicitly authorized private destination. The [closed 1.0 schema](../schemas/application-documents.schema.json) requires every field; null records an unknown or not-yet-observed value. Preserve the original strategy hash for audit. The current hash identifies the exact validated strategy snapshot. Do not update either from a manifest's own assertions.

At creation, the origin equals the trusted current snapshot hash. For an existing manifest, supply `trusted.origin_strategy_sha256` from the independently retained origin record. This checker does not authorize a strategy rebind or decide whether a change is check-only.

Run the following block unchanged with the upstream `stableSerialize` and `fingerprint` functions from [strategy-contract.md](strategy-contract.md). `trusted` supplies the already validated current `strategy`, its independently calculated `strategy_sha256`, current independently observed `binding`, `sha256`, `stableSerialize`, `fingerprint`, and `validate(schema, exactInstance)`. The validation adapter uses `uvx --from check-jsonschema==0.38.2 check-jsonschema` on the installed schema and exact private instance, returning `{state,findings}`. Keep the upstream strategy schema beside this schema for its binding reference.

The host also supplies `privateDestinations` after confirming those exact paths are authorized private locations, the current validated upstream `session`, `savedArtifacts`, and `observations`. Saved observations have `document_id`, `connection_id`, `snapshot_id`, `snapshot_sha256`, `saved_path`, `saved_sha256`, `reopened` and `editable`. Establish these from current session inspection and actual saved bytes, never from this manifest. Each check observation is `{document_id, check}`, where `check` is the exact independently observed check record. The helper compares records; it neither creates evidence nor establishes that a host actually observed it. Missing observations cannot pass.

An empty finding list means only mechanical consistency with the supplied trusted context. It does not approve meaning, prove rendering, or authorize editing. Reviewed upstream spans can still form a misleading assembled document; the host must review that meaning separately. Anchors remain private bookkeeping and never constitute native selection authority. Resolve current text/context uniquely through the session before editing. Pending members retain their own issues without changing supported members' states. Authored means observed text exists; checked means mandatory checks ran, including failures; delivered requires saved/reopened editable content and passing mandatory checks. Keep a failed document available as a draft.

`needs_revision` retains unsupported private proposals without rejecting independently supported languages. Unresolved blocking findings apply to their exact language/range when supplied, otherwise to referenced emitted claims or their target criteria. A blocking finding without those scopes applies to the whole handoff. Selected language realizations must still be supported.

```javascript
async function inspectDocumentManifest(manifest, trusted = {}) {
  const findings = [];
  const add = (code,path,message,action='Refresh the affected private mapping from current trusted inputs.') => findings.push({code,path,message,action});
  let schema;
  try { schema = await trusted.validate('schemas/application-documents.schema.json',manifest); } catch { /* unavailable */ }
  if (!schema || !['passed','failed'].includes(schema.state)) {
    add('schema_unavailable','/','Structural validation was not completed.','Run the pinned validator against this exact instance.'); return findings;
  }
  if (schema.state === 'failed') { add('schema_invalid','/','The manifest does not satisfy the closed schema.','Inspect private validator diagnostics.'); return findings; }
  const t = trusted, s = t.strategy;
  if (!s || !t.binding || !t.strategy_sha256 || !t.session || !Array.isArray(t.privateDestinations) || !Array.isArray(t.savedArtifacts) || !Array.isArray(t.observations) ||
      !['sha256','stableSerialize','fingerprint'].every(k=>typeof t[k]==='function')) {
    add('context_unavailable','/','Independent current context is incomplete.','Establish current upstream selection and session observations independently.'); return findings;
  }
  const equal = (a,b) => t.stableSerialize(a) === t.stableSerialize(b);
  try {
    t.stableSerialize(manifest);
    if (t.fingerprint(s,t.sha256)!==t.strategy_sha256 || manifest.strategy_sha256!==t.strategy_sha256) add('strategy_mismatch','/strategy_sha256','Current strategy snapshot hash differs.');
    if (manifest.origin_strategy_sha256!==(t.origin_strategy_sha256||t.strategy_sha256)) add('origin_mismatch','/origin_strategy_sha256','Original strategy snapshot differs from independently retained origin.');
    if (!equal(manifest.binding,t.binding) || !equal(s.binding,t.binding)) add('binding_mismatch','/binding','Binding differs from independently selected current context.');
  } catch { add('context_unavailable','/','Current context cannot be serialized or fingerprinted.'); return findings; }
  if (findings.length) return findings;
  const ids=new Set(), pairs=new Set(), destinations=new Set(), ranges=new Map();
  for (const [i,d] of manifest.documents.entries()) {
    const p='/documents/'+i, pair=d.kind+':'+d.language;
    if (ids.has(d.id)||pairs.has(pair)) add('duplicate_document',p,'Document identity or kind/language pair repeats.');
    ids.add(d.id); pairs.add(pair);
    if (!s.settings.requested_documents.includes(d.kind)||!s.settings.languages.includes(d.language)||d.market!==s.settings.market) add('selection_mismatch',p,'Document differs from the requested application settings.');
    if (!t.privateDestinations.includes(d.destination)||destinations.has(d.destination)) add('private_destination',p+'/destination','Destination is not a distinct independently authorized private path.');
    destinations.add(d.destination);
    if (d.state==='pending'&&!d.issues.length) add('missing_issue',p+'/issues','Pending work requires a specific unresolved issue.');
    const emitted=d.draft?.sections||[], emittedClaims=new Set(emitted.flatMap(section=>section.claims.map(ref=>ref.id)));
    const blocked=s.findings.some(f=>{
      if (f.severity!=='blocking'||f.status==='passed') return false;
      if (f.draft_span) return f.draft_span.language===d.language&&emitted.some(section=>section.range.start<f.draft_span.span.end&&f.draft_span.span.start<section.range.end);
      if (f.claims.length) return f.claims.some(ref=>emittedClaims.has(ref.id));
      if (f.criteria.length) return s.claims.some(claim=>emittedClaims.has(claim.id)&&claim.target_references.some(ref=>f.criteria.some(criterion=>ref.namespace===criterion.namespace&&ref.id===criterion.id)));
      return true;
    });
    if (blocked&&d.state!=='pending') add('upstream_not_ready',p+'/state','An unresolved upstream blocking finding affects this wording.');
    if (!d.draft && d.state!=='pending') add('draft_missing',p+'/draft','Nonpending work requires reviewed draft ranges.');
    if (d.kind==='cv'&&d.letter_inputs!==null) add('letter_inputs',p+'/letter_inputs','CV entries do not carry letter inputs.');
    if (d.kind==='cover_letter') {
      const input=d.letter_inputs;
      if (!input) add('letter_inputs',p+'/letter_inputs','Letter inputs must explicitly record unknown values.');
      else {
        const missing=['recipient','date','salutation','enclosures'].filter(k=>input[k].value===null||!input[k].confirmed||!input[k].provenance.length);
        if (missing.some(k=>!input.missing_required.includes(k))) add('missing_inputs',p+'/letter_inputs','Unconfirmed letter inputs are missing from the unresolved list.');
        if ((missing.length||input.missing_required.length)&&d.state!=='pending') add('missing_inputs',p+'/state','Required letter inputs remain unresolved.');
      }
    }
    const version=s.draft?.versions.find(v=>v.language===d.language);
    const sections=new Map();
    if (d.draft) {
      if (!version||d.draft.language!==d.language||d.draft.sha256!==version.sha256||t.sha256(version.text)!==version.sha256) add('draft_mismatch',p+'/draft','Draft does not identify the exact current language text.');
      else {
        const points=Array.from(version.text), used=ranges.get(d.language)||[]; ranges.set(d.language,used);
        if (version.inventory_status!=='complete') add('claim_inventory',p+'/draft','Current draft factual inventory is incomplete.');
        for (const [j,section] of d.draft.sections.entries()) {
          const q=p+'/draft/sections/'+j, r=section.range;
          if (sections.has(section.id)) add('duplicate_section',q,'Section identifier repeats.');
          sections.set(section.id,section);
          if (r.start>=r.end||r.end>points.length||points.slice(r.start,r.end).join('')!==r.excerpt) add('range_mismatch',q+'/range','Range differs from the exact Unicode code-point excerpt.');
          if (used.some(other=>r.start<other.end&&other.start<r.end)) add('overlapping_range',q+'/range','Emitted ranges overlap within the composite language draft.');
          used.push(r);
          const expected=new Set();
          for (const inventory of version.claims) for (const span of inventory.spans) {
            if (r.start<span.end&&span.start<r.end) {
              expected.add(inventory.claim.id);
              if (span.start<r.start||span.end>r.end) add('partial_proposition',q+'/range','Section cuts a factual proposition or its qualifier.');
            }
          }
          const actual=new Set(section.claims.map(c=>c.id));
          if (actual.size!==expected.size||[...expected].some(id=>!actual.has(id))) add('claim_inventory',q+'/claims','Section claims differ from the complete intersecting upstream inventory.');
          for (const ref of section.claims) {
            const claim=s.claims.find(c=>c.id===ref.id), selected=s.positioning.selected_claims.find(c=>c.claim.id===ref.id);
            const realization=claim?.realizations.find(v=>v.language===d.language);
            if (!selected?.languages.includes(d.language)||realization?.semantic_state!=='supported'||!realization.spans.some(span=>r.start<=span.start&&span.end<=r.end)) add('unsupported_claim',q+'/claims','Claim lacks a selected supported realization in this language range.');
          }
        }
      }
    }
    const observed=d.session;
    let snapshot=null, saved=null;
    if (observed) {
      const binding=t.session.bindings.find(b=>b.id===observed.document_id);
      snapshot=t.session.snapshots.find(x=>x.id===observed.snapshot_id&&x.documentId===observed.document_id);
      if (!binding||binding.kind!==d.kind||binding.language!==d.language||binding.connectionId!==t.session.connection.id||observed.connection_id!==t.session.connection.id||binding.currentSnapshotId!==observed.snapshot_id||!snapshot||snapshot.connectionId!==observed.connection_id||snapshot.fingerprint!==observed.snapshot_sha256) add('session_unverified',p+'/session','Session identity does not match a current independent observation.');
      saved=t.savedArtifacts.find(a=>['document_id','connection_id','snapshot_id','snapshot_sha256','saved_path','saved_sha256'].every(k=>a[k]===observed[k]));
      if ((observed.saved_path!==null||observed.saved_sha256!==null)&&(!saved||observed.saved_path!==d.destination||!observed.saved_sha256)) add('saved_unverified',p+'/session','Saved identity or exact artifact bytes have not been independently verified.');
    }
    if (['authored','checked','delivered'].includes(d.state)&&(!observed||!snapshot)) add('session_unverified',p+'/state','Authored state requires a current observed document snapshot.');
    const anchorIds=new Set();
    for (const [j,a] of d.anchors.entries()) {
      const q=p+'/anchors/'+j, section=sections.get(a.section_id);
      if (!section||anchorIds.has(a.section_id)||a.text!==section.range.excerpt) add('anchor_mismatch',q,'Anchor must identify one emitted section with exact text.');
      anchorIds.add(a.section_id);
      const context=a.context||a.text;
      if (a.status==='mapped'&&(!snapshot||a.baseline_snapshot_id!==snapshot.id||!context.includes(a.text)||snapshot.text.split(context).length!==2||(a.part!==null&&!snapshot.structure.some(part=>part.part===a.part)))) add('anchor_stale',q,'Mapped anchor does not resolve uniquely in the current snapshot and observed part.');
      if (d.draft?.sections.some(x=>x.range.excerpt.includes(a.section_id))) add('anchor_leak',q,'Private technical section identifier appears in emitted text.');
    }
    const checkIds=new Set();
    for (const [j,c] of d.checks.entries()) {
      const q=p+'/checks/'+j;
      if (checkIds.has(c.id)) add('duplicate_check',q,'Check identifier repeats.'); checkIds.add(c.id);
      if (c.status==='not_assessed') { if (!c.reason) add('check_unverified',q,'Unassessed check requires a reason.'); continue; }
      if (!observed||!saved||c.snapshot_sha256!==observed.snapshot_sha256||c.artifact_sha256!==observed.saved_sha256||!c.method||!c.producer||!c.observed_at||!c.evidence_reference||!t.observations.some(o=>o.document_id===observed.document_id&&equal(o.check,c))) add('check_unverified',q,'Check is not bound to independently observed current snapshot and saved bytes.');
    }
    const mandatory=['content','reading_order','render','round_trip',...(d.kind==='cv'?['pagination']:d.market==='DE'?['letter_layout']:[])];
    const executed=mandatory.every(kind=>d.checks.some(c=>c.kind===kind&&c.mandatory&&c.status!=='not_assessed'));
    if (['checked','delivered'].includes(d.state)&&!executed) add('checks_incomplete',p+'/state','Required document checks have not all executed.');
    if (d.state==='delivered'&&(!saved?.reopened||!saved.editable||!d.presentation.settings_sha256||d.issues.length||anchorIds.size!==sections.size||d.anchors.some(a=>a.status!=='mapped')||d.checks.some(c=>c.mandatory&&c.status!=='passed')||!executed)) add('delivery_unverified',p+'/state','Delivery requires current saved/reopened editable content and passing mandatory checks.');
  }
  for (const language of s.settings.languages) for (const kind of s.settings.requested_documents) if (!pairs.has(kind+':'+language)) add('missing_document','/documents','Requested member must be retained, including pending work.');
  return findings;
}
```
