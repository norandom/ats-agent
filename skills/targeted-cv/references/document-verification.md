# Verify the saved application

Use this after [composition](application-documents.md) and the applicable [CV](document-presentation.md) or [letter](germany-cover-letter.md) presentation. The host operates the existing WordCraft session. The bounded check below only evaluates supplied observations; it cannot establish that an observation or a semantic judgment actually happened.

1. Validate the current manifest with `inspectDocumentManifest` and independently current upstream context. Retain its reviewed section text in emitted order, including explicit separators. Read exact body text through MCP. Compare without trimming, Unicode normalization or arbitrary whitespace removal. Presentation fields are separate identified parts, never text silently removed from the comparison. Review assembled factual meaning separately, including qualifiers, chronology and CV/letter consistency. Exact equality does not prove support.
2. Read structure as well as text. Trace identity/contact values, headings, employer/title/date groups and qualification labels to their associated details in extraction order. Record the reviewed associations privately. A screenshot or a paragraph count cannot establish these relationships. Keep unavailable structure or an absent host association review `not_assessed`.
3. Refresh fields in all parts, save and reopen through the session protocol. Inspect the actual footer parts for PAGE and NUMPAGES objects; body-only `get_text` and literal numbers are insufficient. Render every page of this saved revision, using one-based render indexes and the discovered scale. On every page, inspect spacing, balance, legibility, clipping, overlap, headings with following content and footer values. For a CV verify the localized label and current/total value on each page. Recheck after any pagination change.
4. For Germany letters, evaluate every applicable row of the versioned sourced checklist. Retain rule ID, URL, edition, publisher/project authority, expected value, measured result and evidence. Use observed paragraph/section geometry in points or pixel measurements with pixels-per-point and `72 / 25.4` conversion. Command arguments are intended settings, not measurements. Missing measurements stay `not_assessed`; measured violations fail. Only claim passage of the sourced project checklist, never full normative DIN conformity.
5. Hash actual saved DOCX bytes locally; do not parse or author DOCX locally. Bind inspection to the existing session identity (`document_id`, `connection_id`, `snapshot_id`, `snapshot_sha256`, `saved_path`, `saved_sha256`). Reinspect continuity and rehash bytes after inspection. Unsaved edits, identity changes, changed bytes or changed relevant structure invalidate affected checks. Preserve old records as historical. If the changed scope is uncertain, invalidate all checks. Repeated equal text alone does not prove unchanged layout.

Record check producer, method, observation time, private evidence reference, scope and pages using the existing manifest check shape. Preserve `passed`, `failed` and `not_assessed`; a missing page is not a passing visual check. Keep semantic/editorial review separate. Failed mandatory checks retain an editable draft, and unavailable checks retain their specific pending reason. Use the upstream session's recovery on ambiguous operations. Do not infer universal ATS compatibility from these observations.

## Bounded evidence gate

Run this block unchanged. `entry` is a validated manifest member. `observation` is independently collected host evidence, not copied manifest check flags. `before` and `after` use the existing session identity shape above; saved/reopened and editable observations must be explicit. The host hashes bytes before/after and supplies accessible evidence. Use upstream `stableSerialize` for identity comparison. No tool calls, new persisted schema or semantic inference occur here.

`reviewedText` is the exact assembled reviewed section text. `bodyText` and `structure` are MCP read-back. Reviews carry `status` and `reason`: `semanticReview` is separate; `readingOrder` also has inspected `associations`. `renders` contains one record per actual page with `page`, `evidence_reference`, `accessible`, `status` and observed `footerText`. `fields` contains inspected objects with `part` and `instr`. `letterRules` is the complete applicable sourced checklist with observed `measured` values and `measurement_method`. Unknown applicability must remain pending. Evidence remains private.

```javascript
function toStrategyDocumentChecks(currentArtifact, verifiedObservations) {
  const a=currentArtifact, text=x=>typeof x==='string'&&x.trim().length>0;
  const hash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
  if(!a||a.saved!==true||a.current!==true||!text(a.id)||!text(a.saved_path)||!hash(a.saved_sha256)||!hash(a.snapshot_sha256))return [];
  const out=[],ids=new Set();
  for(const c of verifiedObservations||[]){
    // The closed upstream schema cannot represent absent provenance. Keep such issues in the manifest.
    if(!text(c.producer)||!text(c.method)||!text(c.kind)||!text(c.reason)||!Number.isFinite(Date.parse(c.observed_at)))continue;
    const id=`document_check:${a.id}-${c.kind}`;
    if(!/^document_check:[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id)||ids.has(id))throw Error('Ambiguous document check identity');
    ids.add(id);
    const matched=c.artifact_sha256===a.saved_sha256&&c.snapshot_sha256===a.snapshot_sha256&&
      text(c.evidence_reference)&&a.accessibleEvidence?.includes(c.evidence_reference);
    const result=matched&&['passed','failed','not_assessed'].includes(c.status)?c.status:'not_assessed';
    out.push({id,producer:c.producer,method:c.method,artifact_id:a.id,artifact_sha256:a.saved_sha256,
      observed_at:c.observed_at,check:c.kind,result,evidence_reference:matched?c.evidence_reference:null,
      reason:matched?c.reason:'Current revision or accessible evidence unavailable; repeat this check.'});
  }
  return out;
}
function verifyObservedDocument(entry, o, stableSerialize) {
  if (!o || typeof stableSerialize !== 'function') throw Error('Independent observations and upstream stableSerialize required');
  const identityKeys = ['document_id','connection_id','snapshot_id','snapshot_sha256','saved_path','saved_sha256'];
  const identity = s => s && Object.fromEntries(identityKeys.map(k => [k,s[k]]));
  const hash = s => typeof s === 'string' && /^[a-f0-9]{64}$/.test(s);
  const complete = s => s && identityKeys.every(k => typeof s[k] === 'string' && s[k].length) && hash(s.snapshot_sha256) && hash(s.saved_sha256);
  const same = (a,b) => stableSerialize(a) === stableSerialize(b);
  const bound = complete(entry.session) && complete(o.before) && complete(o.after) &&
    same(identity(entry.session),identity(o.before)) && same(identity(o.before),identity(o.after)) &&
    o.bytesBefore === o.before.saved_sha256 && o.bytesAfter === o.after.saved_sha256 &&
    o.reopened === true && o.editable === true && o.continuity === true;
  const evidence = o.accessible === true && !!o.evidence_reference && !!o.producer && !!o.method && Number.isFinite(Date.parse(o.observed_at));
  const pages = Number.isInteger(o.pageCount) && o.pageCount > 0 ? Array.from({length:o.pageCount},(_,i)=>i+1) : [];
  const renders = Array.isArray(o.renders) ? o.renders : [];
  const allPages = pages.length > 0 && renders.length === pages.length && pages.every(p=>renders.filter(r=>r.page===p && r.accessible===true && r.evidence_reference).length===1);
  const review = r => r && ['passed','failed'].includes(r.status) && r.reason ? r.status : 'not_assessed';
  const checks = [];
  function add(kind,status,reason,scope='document',coverage=[]) {
    if (!bound || !evidence) { status='not_assessed'; reason='Current saved/reopened revision, continuity or accessible evidence unavailable; prior checks invalidated.'; }
    checks.push({id:`${entry.id}:${kind}`,kind,mandatory:true,scope,pages:[...new Set(coverage.filter(p=>Number.isInteger(p)&&p>0))],
      snapshot_sha256:bound?o.after.snapshot_sha256:null,artifact_sha256:bound?o.after.saved_sha256:null,
      status,producer:o.producer||null,method:o.method||null,observed_at:o.observed_at||null,
      evidence_reference:o.evidence_reference||null,reason});
  }
  add('round_trip',bound?'passed':'not_assessed','Saved bytes, reopened editable document and post-inspection continuity checked.');
  const textAvailable = typeof o.reviewedText==='string' && typeof o.bodyText==='string';
  add('content',textAvailable?(o.reviewedText===o.bodyText?'passed':'failed'):'not_assessed','Exact body comparison only; semantic review is separate.','body');
  add('reading_order',o.structure && textAvailable && o.readingOrder?.associations?.length ? review(o.readingOrder):'not_assessed',o.readingOrder?.reason||'Text, structure and reviewed associations required.','body');
  add('render',!allPages?'not_assessed':renders.some(r=>r.status==='failed')?'failed':renders.every(r=>r.status==='passed')?'passed':'not_assessed',allPages?'Every page requires an explicit visual review.':'Missing or inaccessible rendered pages.','all pages',renders.map(r=>r.page));
  if (entry.kind==='cv') {
    const fields = Array.isArray(o.fields)?o.fields:[];
    const actualFields = ['PAGE','NUMPAGES'].every(code=>fields.some(f=>f.instr===code && typeof f.part==='string' && f.part.startsWith('footer')));
    const label = entry.language==='de'?'Seite':'Page';
    const status = !actualFields || !allPages || renders.some(r=>typeof r.footerText!=='string') ? 'not_assessed' : renders.every(r=>r.footerText===`${label} ${r.page} / ${pages.length}`)?'passed':'failed';
    add('pagination',status,'Actual footer field objects and displayed localized values required on every page.','footer',renders.map(r=>r.page));
  }
  if (entry.kind==='cover_letter' && entry.market==='DE') {
    const rows = Array.isArray(o.letterRules)?o.letterRules:[];
    const completeRows = o.checklistComplete===true && rows.length>0 && rows.every(r=>r.rule_id && r.source_url && r.edition && ['publisher_guidance','project_choice'].includes(r.authority) && r.expected && r.evidence_reference && r.measured!=null && ['observed_points','render_pixels','observed_structure'].includes(r.measurement_method) && (r.measurement_method!=='render_pixels'||Number.isFinite(o.renderPixelsPerPoint)&&o.renderPixelsPerPoint>0));
    add('letter_layout',!completeRows?'not_assessed':rows.some(r=>r.status==='failed')?'failed':rows.every(r=>r.status==='passed')?'passed':'not_assessed','Sourced project checklist only; full DIN conformity not assessed.','applicable letter rules',pages);
  }
  return {checks,semanticReview:bound&&evidence?{status:review(o.semanticReview),reason:o.semanticReview?.reason||'Host semantic review unavailable.'}:{status:'not_assessed',reason:'Revision evidence invalidated.'}};
}
```

This gate checks completeness and consistency of supplied evidence. The host still owns actual observation, association review, visual judgment and truthful source applicability. Pass its check records to the existing manifest validator as independent observations; do not bypass current strategy, selection or manifest integrity checks. Consumer mapping is a separate handoff using the unchanged strategy contract.

## Return evidence to strategy and refinement

Call `toStrategyDocumentChecks(currentArtifact, verifiedObservations)` with the gate's check records, not incoming manifest flags. The transient `currentArtifact` carries `id`, `saved_path`, `saved_sha256`, `snapshot_sha256`, `saved`, `current` and `accessibleEvidence` (evidence locations the host has opened and checked). Obtain these from the selected saved artifact and the current session. Recheck bytes and session continuity after inspection. Set `current` only after validating identity, check scope, producer, method, observation time and evidence against the actual result. An archived receipt, matching bytes alone or replay-local IDs cannot establish this. Reconnect through the session's binding protocol; preserve unsaved or manual changes before any same-file reopen.

The adapter returns only the existing closed `DocumentCheck` shape. It preserves assessed failures and unavailable results, invalidates mismatched revisions and emits no checks for an unsaved or unavailable artifact. Missing producer, method or observation time cannot be invented to satisfy the upstream schema: retain those issues and their reasons in the manifest. An empty output means no usable observations. Check names and artifact IDs must form unique upstream IDs. Scope, pages, snapshot identity and evidence associations stay in the private manifest and linked evidence, since the upstream check shape has no fields for them.

For [strategy review](strategy-review.md), the host implements `observeDocumentArtifacts()` by independently inspecting current selected artifacts and returning `{binding, artifact_id, artifact_sha256, checks}` per artifact. Map this fresh observation through the adapter. Do not construct it from `value.document_checks`, or refresh timestamps on archived checks. Pass the proposed checks and this independent callback to the unchanged `reviewEditorial`; merge its normalized results and validate the complete strategy with the existing schema. The consumer retains `not_assessed` but may replace its reason with its own missing-observation explanation, so keep the original detailed reason in the document manifest. Editorial judgments and semantic support remain separate host reviews. Failed checks and unresolved issues remain visible; no document score is calculated.

Return refinement the saved editable DOCX location, honest check states, issues, and the manifest's `draft.sections` and `anchors` with their current session baseline and private claim associations. These mappings are host bookkeeping, not native selection authority. Resolve exact text/context uniquely against fresh WordCraft text and structure before an edit. Rebase manual changes through the session; ambiguous or stale mappings stay pending. Report delivery only after saved/reopened read-back, and retain an editable draft when a mandatory content or layout check fails.
