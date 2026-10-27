# Private application documents

## Enter the live document session

Use this entry after the [skill](../SKILL.md) has selected private facts and the [strategy workflow](application-strategy.md) has bound the current application. This is a host procedure using the existing owners, not another coordinator or executable authoring service.

1. Read `current()` from the selected strategy workflow and validate its exact handoff with `inspectStrategy`. Confirm the facts hash, target, application settings and requested private destinations independently of the incoming manifest. Refresh upstream selection and `assemble()` when facts, settings or wording changed. Retain affected drafts privately until their support is current. A `needs_revision` state withholds affected wording; it need not block an independently supported language.
2. Apply the composition and language rules below. Keep one manifest entry per requested kind/language, including pending members. Resolve confirmed letter metadata only for requested letters. Missing required letter inputs return a specific question to the host; optional named addressee or signature images do not become requirements. Run `inspectDocumentManifest` against current trusted inputs and review assembled meaning before authoring.
3. Enter [document-session](document-session.md) and discover current [WordCraft capabilities](wordcraft-capabilities.md). Use its visibility procedure, identify the active kind and language, and preserve unsaved work before switching. Allocate bindings from actual open/create/save receipts in the current connection. Private anchors identify evidence associations; resolve actual current text and parts through [WordCraft operations](wordcraft-operations.md) before editing.
4. Author each ready requested member live through that session, using [CV presentation](document-presentation.md) or the [Germany letter convention](germany-cover-letter.md) as applicable. Persist pending intent and baseline before mutations. If inspection, save, selection or an operation outcome is uncertain, retain the private draft and use the existing recovery procedure. Do not replay actions or substitute document tools. Keep these outcomes scoped to the affected member.
5. Inspect intervening manual changes before any targeted edit. Preserve unrelated text and inspected formatting, rebase against the current document, and withhold overlapping or ambiguous changes. Reconcile the manifest's ranges, anchors and source associations with the observed result. Preserved manual prose still needs semantic support review; neither an old anchor nor a successful edit grants it. Route factual corrections to profile only with the user's confirmation, then refresh strategy. This document flow never writes canonical facts.
6. Follow [document verification](document-verification.md) for exact read-back, reading order, all-page rendering, pagination or letter checks, and save/reopen continuity. Hash the actual saved bytes and bind every result to the inspected revision. Invalidate affected checks after edits. Return the DOCX location even for a draft, clearly identifying failed or unassessed mandatory checks; reserve `delivered` for the manifest's verified delivery conditions.
7. Pass executed observations through `toStrategyDocumentChecks` and the unchanged `reviewEditorial`, supplying independently current `observeDocumentArtifacts()` evidence. Keep editorial judgments and unresolved issues separate. A check-only strategy hash change may use `proposeCheckOnlyRefresh` below; any other change returns to normal support review. Return private section/anchor mappings and the current session baseline for later bounded edits, without claiming an unfinished conversational refinement loop.

## Compose the selected CV

Start from the current validated handoff in [application-strategy.md](application-strategy.md). Use its target role, contribution thesis and selected language-supported claims to decide what the employer should understand first. Select distinct evidence for that argument; do not copy every profile field. Keep the full canonical profile unchanged. If the argument needs a new fact or wording, return it to the upstream composition and semantic review in [strategy-editorial.md](strategy-editorial.md) before selecting it for the document. Composition does not repeat offer analysis or grant support locally.

Keep employers, actual employment titles, role dates and progression in reverse chronology. A functional target headline stays separate from historical titles. For senior roles, write a short scope paragraph followed by selected achievement bullets. Three to five bullets is a starting point for editorial review, not a quota or an ATS rule. Review longer lists for relevance and repetition; do not combine unrelated claims into oversized bullets to meet a count. Give each selected project a title, readable month/year range and short evidence paragraph. Experience, projects and expertise should each add distinct relevant evidence. Omit a repeated project detail rather than manufacture a new outcome to differentiate it.

Lead expertise with supported capabilities and decisions, then relevant tools and methods. Preserve authority, scale, timing and certainty: advice is not ownership, organizational revenue is not personal achievement, and historical tool use is not current proficiency. Keep a qualifier with the action it limits, including in a headline or summary. Preserve qualification names and status. Omit completed degree and certification award dates by default while retaining known dates privately. Label ongoing study and show relevant expiry or renewal information; omission of an award date cannot imply an expired or unverified credential is active.

Apply the strategy's COBESY composition and Humanizer defaults, or its recorded embedded fallback, through [strategy-editorial.md](strategy-editorial.md). Use the contribution argument to cut repetition, then run the draft, factual audit and rewrite internally. Preserve proper names and credential meaning. Use concise sentences, standard bullets and readable date ranges using words. Employer-facing text contains no em dashes, internal scores, claim IDs, evidence notes, technical anchors or drafting placeholders. Method execution and evidence limits remain private.

## Keep languages and pairs consistent

Confirm the selected languages and document kinds from current upstream settings. A CV-only request produces no letter. Write natural German or English from the independently supported selections for that language, preserving names and credential meaning. Localize headings, prose, date labels, greetings and page labels consistently; the target market remains separate. German wording need not mirror English sentence structure. Return every new or reworded factual proposition to upstream semantic review and `assemble()` before finalizing it.

For each requested pair, read the complete CV and letter together against the current facts and target. Check shared identity, employer and role, chronology, qualification status, authority and factual claims. Build the letter around the employer's need and selected contribution examples, rather than retelling the CV chronology. Do not infer motivation or employer facts. Record this host judgment privately with the exact language draft hash and affected sections; mechanical checks do not establish consistency of meaning.

Keep an unsupported language or incomplete letter pending with its specific missing item while independently supported members proceed. Retain unsupported proposals privately outside emitted ranges. For a pending language with no supported composition, keep its document entry with `draft: null`; do not invent a second draft version or weaken support checks. Confirm required sender/recipient addresses, date, salutation and actual enclosures. A named recipient and signature image are optional; a reviewed neutral salutation may be used. Unknown required metadata remains explicit and unresolved, including missing sender inputs in `missing_required`; ask through the host instead of fabricating them. A pending letter does not block its CV.

## Map and review the assembled text

Use one composite upstream draft per language for the requested documents. Map each editable section or entry to a non-overlapping exact range, excluding separators and private review material. Use zero-based Unicode code-point spans, not UTF-16 offsets. Select complete factual propositions with their qualifiers; do not trim a reviewed sentence into a stronger claim. Inventory all factual assertions, including contacts, factual headings and metadata-derived wording. Ordinary section labels and generated page fields are presentation content. Repeated identical wording uses multiple spans of the same realization. Different wording requires separate upstream claim records and semantic review because the current contract has only one wording per language per claim. Refresh hashes and spans after a wording change.

Before authoring, the host reads each complete assembled document against the evidence and target. Check whether adjacent supported passages imply unsupported causality, authority, scale or current proficiency. Check that chronology, qualifications and contacts stay attached to the right entries, and that the selected evidence makes the contribution understandable. Matching references alone cannot pass this review. Route rewording or uncertain meaning back to strategy; retain unsupported proposals only in private pending work. Keep the private section associations for later targeted edits, and reconcile actual observed document text with this composition for omissions, additions, broken characters and altered meaning. Record mechanical comparisons separately from host semantic judgment. WordCraft authoring and observed document checks are subsequent work, not established by a valid draft mapping.

## Context metadata and compatibility

New manifests and strategy handoffs must both be version 1.1. Validate historical manifests only with application-documents-v1.schema.json and its pinned strategy 1.0 binding. Unknown versions are rejected. Rebuild old applications from freshly selected inputs and reviewed claims; never insert defaults into old ready artifacts.

Every letter field carries ordered context_refs to whole /value records in the current strategy application context. Recipient combines optional recipient_name, optional recipient_organization and required recipient_address records in output order, joining their lines with newlines. Date uses one application_date record, rendering ISO dates as “3 January 2026” in English or “3. Januar 2026” in German. Salutation uses one confirmed salutation record in the chosen language, without implicit translation. Enclosures uses one enclosure record and preserves its array order, including an explicitly confirmed empty array. Missing references or confirmation belong in missing_required and leave only the letter pending. A confirmed boolean or arbitrary provenance cannot authorize metadata. All factual metadata wording in emitted ranges also remains in the upstream reviewed claim inventory. Strategy owns source and claim eligibility; documents only checks metadata linkage and formatting.

Supply current() from the live strategy workflow and the actual upstream inspectStrategy helper. Its source_observations bind independent current bytes and confirmations; never reconstruct them from the manifest. Context or confirmation changes require rebuilding and reviewing affected composition, even if text is identical, and cannot use check-only refresh.

## Manifest integrity

Keep manifest instances, exact excerpts and observations at an explicitly authorized private destination. The [closed 1.1 schema](../schemas/application-documents.schema.json) requires every field; null records an unknown or not-yet-observed value. Preserve the original strategy hash for audit. The current hash identifies the exact validated strategy snapshot. Do not update either from a manifest's own assertions.

At creation, the origin equals the trusted current snapshot hash. For an existing manifest, supply `trusted.origin_strategy_sha256` from the independently retained origin record. `inspectDocumentManifest` does not authorize a strategy rebind.

For a check-only refresh, call `proposeCheckOnlyRefresh(manifest, previousStrategy, trusted)` with both retained complete snapshots. In addition to the context below, supply upstream `inspectStrategy`, the existing strategy workflow's `current()` and independently current `documentArtifacts` in the upstream observer shape `{binding, artifact_id, artifact_sha256, checks}`. Establish these from the actual saved artifact and inspection evidence, never by copying incoming manifest or strategy flags. The helper validates both snapshots against current validated profile/binding, compares their complete stable serialization after removing only top-level `document_checks`, and checks manifest integrity before and after the proposed hash change. It returns a proposal and old/new transition for private retention, with no writes or reauthoring. Preserve the origin hash. Any other change, including facts, settings, metadata, findings, claim decisions or wording, requires normal composition/support revalidation even when draft text is unchanged. Retain revision-specific observations as historical after an edit; obtain new current evidence before refresh.

Run the following block unchanged with the upstream `stableSerialize` and `fingerprint` functions from [strategy-contract.md](strategy-contract.md). `trusted` supplies the already validated current `strategy`, its independently calculated `strategy_sha256`, current independently observed `binding`, `sha256`, `stableSerialize`, `fingerprint`, and `validate(schema, exactInstance)`. The validation adapter uses `uvx --from check-jsonschema==0.38.2 check-jsonschema` on the installed schema and exact private instance, returning `{state,findings}`. Keep the upstream strategy schema beside this schema for its binding reference.

The host also supplies `privateDestinations` after confirming those exact paths are authorized private locations, the current validated upstream `session`, `savedArtifacts`, and `observations`. Saved observations have `document_id`, `connection_id`, `snapshot_id`, `snapshot_sha256`, `saved_path`, `saved_sha256`, `reopened` and `editable`. Establish these from current session inspection and actual saved bytes, never from this manifest. Each check observation is `{document_id, check}`, where `check` is the exact independently observed check record. The helper compares records; it neither creates evidence nor establishes that a host actually observed it. Missing observations cannot pass.

An empty finding list means only mechanical consistency with the supplied trusted context. It does not approve meaning, prove rendering, or authorize editing. Reviewed upstream spans can still form a misleading assembled document; the host must review that meaning separately. Anchors remain private bookkeeping and never constitute native selection authority. Resolve current text/context uniquely through the session before editing. Pending members retain their own issues without changing supported members' states. Authored means observed text exists; checked means mandatory checks ran, including failures; delivered requires saved/reopened editable content and passing mandatory checks. Keep a failed document available as a draft.

`needs_revision` retains unsupported private proposals without rejecting independently supported languages. Unresolved blocking findings apply to their exact language/range when supplied, otherwise to referenced emitted claims or their target criteria. A blocking finding without those scopes applies to the whole handoff. Selected language realizations must still be supported.

```javascript
async function proposeCheckOnlyRefresh(manifest, previousStrategy, trusted = {}) {
  const reject = reason => ({decision:'revalidate',reason,proposal:null,transition:null});
  const t=trusted;
  if (!['current','inspectStrategy','validate','stableSerialize','fingerprint','sha256'].every(k=>typeof t[k]==='function') || !t.origin_strategy_sha256 || !Array.isArray(t.documentArtifacts)) return reject('Independent refresh context is incomplete.');
  try {
    const equal=(a,b)=>t.stableSerialize(a)===t.stableSerialize(b);
    const context=t.current();
    if (!context || context.evidence?.validation?.schema!=='passed' || context.evidence?.validation?.semantics!=='passed' || !equal(context.binding,t.binding)) return reject('Current validated canonical context is unavailable or changed.');
    for (const strategy of [previousStrategy,t.strategy]) {
      const report=await t.inspectStrategy(strategy,{...context.source_observations,profile:context.evidence.profile,binding:context.binding,sha256:t.sha256,validate:t.validate});
      if (report.schema!=='passed'||report.deterministic!=='passed') return reject('A strategy snapshot is invalid or stale against current inputs.');
    }
    if (t.fingerprint(previousStrategy,t.sha256)!==manifest.strategy_sha256 || t.fingerprint(t.strategy,t.sha256)!==t.strategy_sha256) return reject('Snapshot hashes differ from the retained snapshots.');
    const withoutChecks=value=>Object.fromEntries(Object.entries(value).filter(([key])=>key!=='document_checks'));
    if (!equal(withoutChecks(previousStrategy),withoutChecks(t.strategy))) return reject('Non-check strategy content changed; repeat composition and support review.');
    for (const check of t.strategy.document_checks) {
      if (!t.documentArtifacts.some(o=>equal(o.binding,context.binding)&&o.artifact_id===check.artifact_id&&o.artifact_sha256===check.artifact_sha256&&Array.isArray(o.checks)&&o.checks.some(c=>equal(c,check)))) return reject('A document check lacks an independently current artifact observation.');
      if (check.result!=='not_assessed'&&(!check.evidence_reference||!Number.isFinite(Date.parse(check.observed_at)))) return reject('An executed check lacks current evidence.');
    }
    const before=await inspectDocumentManifest(manifest,{...t,strategy:previousStrategy,strategy_sha256:manifest.strategy_sha256});
    if (before.length) return reject('The retained manifest fails integrity validation.');
    const proposal=JSON.parse(JSON.stringify(manifest));
    proposal.strategy_sha256=t.strategy_sha256;
    if ((await inspectDocumentManifest(proposal,t)).length) return reject('The proposed manifest fails integrity validation.');
    const now=t.current();
    if (!now||!equal(now.binding,context.binding)||!equal(now.source_observations,context.source_observations)||now.evidence?.validation?.schema!=='passed'||now.evidence?.validation?.semantics!=='passed') return reject('Canonical context changed during validation.');
    return {decision:'refresh',reason:'Only document checks changed and supplied current observations match.',proposal,transition:{origin_strategy_sha256:manifest.origin_strategy_sha256,previous_strategy_sha256:manifest.strategy_sha256,strategy_sha256:t.strategy_sha256}};
  } catch { return reject('Refresh validation could not be completed.'); }
}

async function inspectDocumentManifest(manifest, trusted = {}) {
  const findings = [];
  const add = (code,path,message,action='Refresh the affected private mapping from current trusted inputs.') => findings.push({code,path,message,action});
  if (manifest?.schema_version!=='1.1' || trusted.strategy?.schema_version!=='1.1') { add('unsupported_version','/schema_version','Rebuild from current selected sources under version 1.1; historical ready status is not reusable.'); return findings; }
  let schema;
  try { schema = await trusted.validate('schemas/application-documents.schema.json',manifest); } catch { /* unavailable */ }
  if (!schema || !['passed','failed'].includes(schema.state)) {
    add('schema_unavailable','/','Structural validation was not completed.','Run the pinned validator against this exact instance.'); return findings;
  }
  if (schema.state === 'failed') { add('schema_invalid','/','The manifest does not satisfy the closed schema.','Inspect private validator diagnostics.'); return findings; }
  const t = trusted, s = t.strategy;
  if (!s || !t.binding || !t.strategy_sha256 || !t.session || !Array.isArray(t.privateDestinations) || !Array.isArray(t.savedArtifacts) || !Array.isArray(t.observations) ||
      !['sha256','stableSerialize','fingerprint','inspectStrategy','current'].every(k=>typeof t[k]==='function')) {
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
  const context=t.current();
  if (!context || context.evidence?.validation?.schema!=='passed' || context.evidence?.validation?.semantics!=='passed' || !equal(context.binding,t.binding)) { add('context_unavailable','/','Current upstream selection is unavailable.'); return findings; }
  const upstream=await t.inspectStrategy(s,{...context.source_observations,profile:context.evidence.profile,binding:context.binding,sha256:t.sha256,validate:t.validate});
  if (upstream.schema!=='passed'||upstream.deterministic!=='passed') add('upstream_invalid','/','Strategy failed current upstream integrity validation.');
  const stillCurrent=()=>{const now=t.current();return now&&equal(now.binding,context.binding)&&equal(now.source_observations,context.source_observations);};
  if (!stillCurrent()) { add('context_unavailable','/','Source selection changed during validation.');return findings; }
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
        const missing=[];
        const kinds={recipient:['recipient_name','recipient_organization','recipient_address'],date:['application_date'],salutation:['salutation'],enclosures:['enclosure']};
        for (const key of Object.keys(kinds)) {
          const field=input[key], refs=field.context_refs, records=[];
          if (!refs.length || field.value===null || !field.confirmed || !field.provenance.length) {missing.push(key);continue;}
          let valid=true;
          for (const ref of refs) {
            const record=s.application_context?.records.find(r=>r.id===ref.record_id);
            if (!record || ref.application_id!==s.binding.application_id || ref.context_sha256!==s.binding.application_context_sha256 || ref.pointer!=='/value' || !kinds[key].includes(record.kind)) {valid=false;continue;}
            records.push(record);
          }
          if (!valid || (key!=='recipient'&&records.length!==1) || (key==='recipient'&&(!records.some(r=>r.kind==='recipient_address')||new Set(records.map(r=>r.kind)).size!==records.length))) {add('context_metadata',p+'/letter_inputs/'+key,'Metadata references have the wrong source kind, identity or cardinality.');continue;}
          if (records.some(r=>r.confirmation===null)) {missing.push(key);continue;}
          let expected;
          if (key==='recipient') expected=records.flatMap(r=>Array.isArray(r.value)?r.value:[r.value]).join('\n');
          else if (key==='date') {
            const [year,month,day]=records[0].value.split('-').map(Number);
            const months=d.language==='de'?['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']:['January','February','March','April','May','June','July','August','September','October','November','December'];
            expected=day+(d.language==='de'?'. ':' ')+months[month-1]+' '+year;
          } else expected=records[0].value;
          if (!equal(field.value,expected)) add('context_metadata',p+'/letter_inputs/'+key,'Metadata value differs from the ordered confirmed context values and declared language formatting.');
        }
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
  if (!stillCurrent()) add('context_unavailable','/','Current input selection changed before consumption.');
  return findings;
}
```
