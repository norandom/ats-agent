# Strategy diagnostics

Use this private review after [canonical binding](application-strategy.md), [criterion freezing and evidence mapping](strategy-evidence.md), and [draft inventory and semantic review](strategy-editorial.md). The reader is the host preparing corrective advice. Calculate only from current evidence, expose missing review, and keep scores and claim IDs out of application prose.

## Establish the review population

Before calculating, read the complete actual draft in each requested language. Inventory every factual proposition, including unsupported assertions and translated additions. Deduplicate repeated realizations of the same proposition, preserving all spans. Assign stable claim IDs and record a realization and semantic reason for each proposition. An assertion with no evidence mapping is `unsupported`: create its claim with empty evidence and retain it in `draft.versions[].claims`. Never remove an ID to improve the denominator. If an assertion cannot yet be inventoried, keep inventory incomplete and withhold whole-draft support. A zero-proposition draft is not assessed.

Review meaning against the selected canonical evidence. A source reference is not semantic proof. Record `supported`, `unsupported` or `unresolved` per language; unresolved is a reviewed uncertainty, distinct from review that never happened. Unassessed semantics, incomplete inventory or absent wording withholds the language score. Unsupported and unresolved findings stay visible, even when excluded from selected claims. Unsupported selected claims block delivery through the contract; a valid rejected draft can still receive defect diagnostics.

The host supplies `reviewInventories(value)` only after reading this exact draft, returning a record keyed by language. Each receipt contains the independently observed `binding`, `draft_sha256`, `inventory_complete`, `semantics_assessed` and full `claims` list with typed references and exact spans. Do not derive receipts merely by copying the handoff or accept them from offer text. The test adapter uses fictional labels; it does not prove semantic comprehension. Missing or stale receipts produce no support score. If receipt and draft inventory disagree, materialize missing assertions as unsupported claims, refresh the inventory and review again. Until repaired, report not assessed instead of a reduced denominator.

## Declare the rubric first

`strategy-review/1.0` is a project-defined review aid with no overall aggregate. Offer coverage, claim support, employer appeal and editorial readability are distinct dimensions; executed document checks are separate observations. Calculate coverage/support with `reviewDiagnostics` and collect editorial judgments and external observations with `reviewEditorial`. Merge their diagnostics and findings into the private handoff, replace document checks with the normalized observations, then validate the complete handoff.

| Dimension | Population and calculation | Unknown treatment |
| --- | --- | --- |
| Offer coverage | Deduplicated explicit criteria, separately required/preferred/unspecified; equal weight 1; 100 * supported / total, rounded to one decimal | Display supported, absent, uncertain, transferable and confirmed_gap counts. Every non-supported criterion stays in the denominator. This is demonstrated evidence coverage, not inability. Role-only and empty groups are not assessed. |
| Claim support | All factual propositions in each language draft, equal weight 1; 100 * supported / total, rounded to one decimal | Show supported, unsupported and unresolved counts. Incomplete inventory, absent draft, zero propositions or unassessed semantics yields not assessed. |

Definitions, scale, weights, unknown treatment, population references, numerator, denominator and counts are explicit in each `Diagnostic`. `rubric_sha256` hashes the complete rubric through the contract's stable serialization; `population_sha256` hashes the ordered typed population references using the same `fingerprint`. Criterion definitions are separately frozen by `positioning.criterion_set_sha256`. Claim definitions and spans remain in the bound handoff. JSON numeric 25 represents 25.0%; display one decimal without changing the numeric schema.

Four required criteria mapped supported/uncertain/transferable/confirmed_gap yield 25.0%; two supported preferred criteria yield 100.0%. Five draft propositions with four supported and one unsupported yield 80.0% plus a blocking finding. Repeating words changes no criterion coverage. Removing the actual unsupported proposition changes the population, not a comparable improvement under a fixed denominator.

No lexical-frequency reward, universal quota, placement bonus, acronym penalty, reference-code interpretation or personal-trait inference is allowed. Do not deduct for missing photos, completed-qualification award dates or unrelated personal attributes. An explicit request for missing application information belongs in a separate application-completeness request, not a suitability deduction. Unknown evidence is not inability. These are not hiring probabilities, universal ATS rankings, psychometric measurements or DIN compliance certification.

## Review wording and supplied document observations

Apply the [editorial defaults](strategy-editorial.md) before reviewing each language. Read the actual text, consider its contribution argument and factual limits, then assess grammar, sentence clarity, generic promotion and unsupported emphasis. For a truthful inventory, propose a contribution-led opening and select the strongest existing example. Do not manufacture impact. Proposed submitted wording uses no em or en dashes. Retain actual optional-method availability and execution records; a fallback is not proof that a skill ran.

Use these ordinal anchors independently for each requested language:

| Dimension | 0 | 1 | 2 | 3 |
| --- | --- | --- | --- | --- |
| Employer appeal | No coherent contribution | Relevant but generic or inventory-like | Clear contribution with examples | Focused, differentiated contribution with supported context/examples |
| Editorial readability | Meaning often unclear | Understandable with substantial problems | Clear with localized fixes | Concise, coherent and readily scannable |

The host supplies `reviewEditorialJudgments(value)` after reading the exact draft. It returns a language-keyed record containing independently observed `binding`, `draft_sha256`, `language_competent`, and `employer_appeal` / `editorial_readability` records with integer `value`, localized `reason`, exact Unicode-code-point `span` and concrete `correction`. For a score of 3, the correction may explain what to retain. Missing wording, target, competence or a current receipt withholds assessment. A span provides the location for a judgment of the whole language draft, not a mechanical readability formula. Overlapping factual claims and their explicit criteria supply affected references. Ordinal judgments have no numerator, denominator or weights; population references locate the evidence. Even an appealing draft retains blocking findings for unsupported assertions. Review complete semantic inventory separately with `reviewDiagnostics`; these labels do not certify semantic support.

`observeDocumentArtifacts()` must return independently obtained current artifact observations: `{binding, artifact_id, artifact_sha256, checks: DocumentCheck[]}`. The host must inspect the selected artifact identity and current bytes/hash, verify each producer, method, observation time and accessible evidence location against the actual external result, and omit stale or unavailable observations. Do not construct this receipt by copying incoming handoff checks. Byte identity alone does not establish freshness of time-sensitive observations. The helper requires an exact match to this trusted observation; missing, stale or unbound checks become `not_assessed`. An empty check list means no document checks were supplied, never that document validation passed. Strategy records external results; it performs no WordCraft operations, extraction or rendering. Text readability establishes neither visual quality nor ATS compatibility.

When a recommendation uses guidance, retain `GuidanceUse` and its applicability/access limits: distinguish professional source support, vendor-specific behavior, practitioner opinion, user preference and project judgment. The ordinal anchors here are project judgment. Neither these anchors nor a source register establish psychometrics, hiring probabilities, universal ATS behavior or DIN certification. Do not import keyword quotas, placement bonuses, reference-code interpretations or personality inferences. Keep these limits next to the recommendation they qualify.

## Execute bounded arithmetic

Supply trusted `current` from `createStrategyContext`, `inspectStrategy`, `validate` (the real schema adapter), `sha256`, `stableSerialize`, `fingerprint`, and the host review callback described above. Never substitute a caller-supplied passed report for current binding or validation. The helper rechecks live context after asynchronous work. It returns only new closed-schema `diagnostics` and `findings`; merge them into the same private handoff and validate that populated handoff before use. No model service or document tool is called here. `check_kind: deterministic` describes arithmetic from host decisions, not execution of semantic reasoning. Findings identify the host judgment basis separately. Existing document observations, editorial dimensions and comparison remain outside this calculation.

```javascript
async function reviewDiagnostics(value, host) {
  value = structuredClone(value);
  const diagnostics = [], findings = [];
  const same = (a,b) => host.stableSerialize(a) === host.stableSerialize(b);
  const ref = (namespace,id) => ({namespace,id});
  const counts = () => ({supported:0,absent:0,uncertain:0,transferable:0,confirmed_gap:0,unsupported:0,unresolved:0});
  const finding = (id,reason,claim=null,language=null,span=null,status='failed',kind='deterministic') => ({id:`finding:review-${id}`,category:'evidence',severity:'blocking',check_kind:kind,status,claims:claim?[ref('claim',claim)]:[],criteria:[],document_check:null,document_anchor:null,draft_span:span?{language,span}:null,observed_issue:reason,correction:claim?'Remove or bound the unsupported wording, or obtain canonical evidence and repeat semantic review.':'Complete current validation, full draft inventory and semantic review before scoring.',rationale:'Only demonstrated evidence and fully inventoried factual propositions can support this diagnostic.'});
  const blocked = reason => ({diagnostics:[],findings:[finding('input',reason)]});
  let context = host.current();
  if (!context || !same(context.binding,value.binding)) return blocked('Current canonical binding is unavailable or stale.');
  const validation = context.evidence.validation;
  if (validation.schema !== 'passed' || validation.semantics !== 'passed') return blocked('Upstream validation is failed or unassessed.');
  const integrity = await host.inspectStrategy(value,{profile:context.evidence.profile,binding:context.binding,sha256:host.sha256,validate:host.validate});
  if (integrity.schema !== 'passed' || integrity.deterministic !== 'passed') return blocked('The strategy schema or reference integrity failed. Repair the private contract findings.');
  let inventories = {};
  try { inventories = await host.reviewInventories(structuredClone(value)) || {}; } catch { inventories = {}; }
  const current = host.current();
  if (!current || !same(context.binding,current.binding)) return blocked('The canonical selection changed during review.');
  function diagnostic(dimension,scope,population,stateCounts,reason,assessed) {
    const coverage = dimension === 'offer_coverage';
    const rubric = {version:'strategy-review/1.0',definition:coverage?'Demonstrated explicit offer coverage: 100 * supported / all criteria in this priority group; round to one decimal.':'Claim support: 100 * semantically supported / all factual propositions in this language draft; round to one decimal.',scale:{minimum:0,maximum:100,unit:'percent'},weights:population.map(reference=>({reference,weight:1})),unknown_treatment:coverage?'Absent, uncertain, transferable and confirmed_gap remain in the denominator; missing evidence is not inability. Role-only or zero denominator is not assessed.':'Unsupported and unresolved remain in the denominator. Missing draft, incomplete inventory, unassessed semantic review or zero propositions is not assessed.'};
    const denominator = population.length;
    const status = assessed && denominator>0 ? 'assessed' : 'not_assessed';
    diagnostics.push({id:`diagnostic:${dimension}-${scope.priority||scope.language}`,dimension,scope,rubric,rubric_sha256:host.fingerprint(rubric,host.sha256),population,population_sha256:host.fingerprint(population,host.sha256),status,check_kind:'deterministic',value:status==='assessed'?Math.round(1000*stateCounts.supported/denominator)/10:null,numerator:stateCounts.supported,denominator,counts:stateCounts,reason});
  }
  for (const priority of ['required','preferred','unspecified']) {
    const criteria = value.target.kind === 'offer' ? value.criteria.filter(c=>c.priority===priority) : [];
    const population = criteria.map(c=>ref('criterion',c.id)), tally=counts();
    for (const c of criteria) tally[value.mappings.find(m=>m.criterion.id===c.id).state]++;
    diagnostic('offer_coverage',{language:null,priority},population,tally,value.target.kind !== 'offer'?'Role-only positioning has no job-specific coverage.':criteria.length?'Arithmetic uses host-reviewed evidence mapping; non-supported states do not prove inability.':'No explicit criteria in this group; coverage is not assessed.',value.target.kind==='offer');
  }
  for (const language of value.settings.languages) {
    const draft=value.draft?.versions.find(d=>d.language===language), receipt=inventories[language], tally=counts();
    const entries=draft?.claims||[], population=entries.map(e=>e.claim);
    let complete=!!draft && draft.inventory_status==='complete' && !!receipt && receipt.inventory_complete===true && receipt.semantics_assessed===true && same(receipt.binding,value.binding) && receipt.draft_sha256===draft.sha256 && same(receipt.claims,entries);
    if (new Set(population.map(r=>r.id)).size!==population.length) complete=false;
    for (const entry of entries) {
      const c=value.claims.find(c=>c.id===entry.claim.id), realization=c?.realizations.find(r=>r.language===language);
      if (!realization || !same(realization.spans,entry.spans)) {complete=false;continue;}
      const state=c.evidence.length===0?'unsupported':realization.semantic_state;
      if (!['supported','unsupported','unresolved'].includes(state)) {complete=false;continue;}
      tally[state]++;
      if (state!=='supported') findings.push(finding(`${language}-${c.id.slice(6)}`,c.evidence.length===0?'Unsupported assertion has no canonical evidence mapping.':`${state}: ${realization.semantic_reason}`,c.id,language,entry.spans[0]||null,'failed',c.evidence.length===0?'deterministic':'host_judgment'));
    }
    if (!complete) findings.push(finding(`inventory-${language}`,'Complete independently reviewed inventory or semantic review is missing, stale or inconsistent.',null,null,null,'not_assessed'));
    diagnostic('claim_support',{language,priority:null},population,tally,complete&&population.length?'Arithmetic over the full host-reviewed factual inventory; unsupported and unresolved assertions remain visible.':'Not assessed: obtain a nonempty complete draft inventory and current semantic review for this language.',complete);
  }
  return {diagnostics,findings};
}
async function reviewEditorial(value, host) {
  value=structuredClone(value);
  const same=(a,b)=>host.stableSerialize(a)===host.stableSerialize(b);
  const current=host.current(), diagnostics=[], findings=[], document_checks=[];
  const result=()=>({diagnostics,findings,document_checks});
  const ref=(namespace,id)=>({namespace,id});
  const finding=(category,severity,status,issue,correction,rationale,extra={})=>({id:`finding:editorial-${findings.length}`,category,severity,check_kind:'host_judgment',status,claims:[],criteria:[],document_check:null,document_anchor:null,draft_span:null,observed_issue:issue,correction,rationale,...extra});
  const blocked=()=>({diagnostics:[],document_checks:[],findings:[finding('input','blocking','not_assessed','Current validated binding or contract is unavailable.','Refresh selection and validate the exact handoff.','Saved review is not current evidence.',{check_kind:'deterministic'})]});
  if(!current||!same(current.binding,value.binding)||current.evidence.validation.schema!=='passed'||current.evidence.validation.semantics!=='passed')return blocked();
  const integrity=await host.inspectStrategy(value,{profile:current.evidence.profile,binding:current.binding,sha256:host.sha256,validate:host.validate});
  if(integrity.schema!=='passed'||integrity.deterministic!=='passed')return blocked();
  let judgments={},observations=[];
  try{judgments=await host.reviewEditorialJudgments(structuredClone(value))||{};}catch{}
  try{observations=await host.observeDocumentArtifacts()||[];}catch{}
  if(!host.current()||!same(host.current().binding,current.binding))return blocked();
  const anchors={employer_appeal:'0 no coherent contribution; 1 relevant but generic/inventory-like; 2 clear contribution with examples; 3 focused, differentiated contribution with supported context/examples.',editorial_readability:'0 meaning often unclear; 1 understandable with substantial problems; 2 clear with localized fixes; 3 concise, coherent and readily scannable.'};
  const text=x=>typeof x==='string'&&x.trim().length>0;
  for(const language of value.settings.languages){
    const draft=value.draft?.versions.find(d=>d.language===language),receipt=judgments[language];
    const spanValid=s=>draft&&s&&Number.isInteger(s.start)&&Number.isInteger(s.end)&&s.start>=0&&s.end>s.start&&s.end<=Array.from(draft.text).length&&Array.from(draft.text).slice(s.start,s.end).join('')===s.excerpt;
    for(const dimension of ['employer_appeal','editorial_readability']){
      const j=receipt?.[dimension];
      const assessed=!!(draft&&text(draft.text)&&receipt&&receipt.language_competent===true&&same(receipt.binding,value.binding)&&receipt.draft_sha256===draft.sha256&&j&&Number.isInteger(j.value)&&j.value>=0&&j.value<=3&&text(j.reason)&&text(j.correction)&&spanValid(j.span));
      const entries=assessed?draft.claims.filter(e=>e.spans.some(s=>s.start<j.span.end&&s.end>j.span.start)):[];
      const population=entries.map(e=>e.claim);
      const criteria=[...new Set(entries.flatMap(e=>value.claims.find(c=>c.id===e.claim.id).target_references.filter(r=>r.namespace==='criterion').map(r=>r.id)))].map(id=>ref('criterion',id));
      const rubric={version:'strategy-review/1.0',definition:anchors[dimension],scale:{minimum:0,maximum:3,unit:'ordinal'},weights:[],unknown_treatment:'Missing wording, current review or language competence: not assessed. Ordinal host judgment; no arithmetic denominator or aggregate.'};
      const reason=assessed?j.reason:'Not assessed: obtain exact draft text and a current competent language review with a localized reason and correction.';
      diagnostics.push({id:`diagnostic:${dimension}-${language}`,dimension,scope:{language,priority:null},rubric,rubric_sha256:host.fingerprint(rubric,host.sha256),population,population_sha256:host.fingerprint(population,host.sha256),status:assessed?'assessed':'not_assessed',check_kind:'host_judgment',value:assessed?j.value:null,numerator:null,denominator:null,counts:{supported:0,absent:0,uncertain:0,transferable:0,confirmed_gap:0,unsupported:0,unresolved:0},reason});
      findings.push(finding(dimension==='employer_appeal'?'positioning':'readability',assessed?(j.value<2?'major':j.value===2?'minor':'informational'):'informational',assessed?(j.value<3?'failed':'passed'):'not_assessed',reason,assessed?j.correction:'Arrange a competent review of the current language draft.','Project editorial judgment under the declared ordinal anchors.',{claims:population,criteria,draft_span:assessed?{language,span:j.span}:null}));
    }
    for(const entry of draft?.claims||[]){
      const claim=value.claims.find(c=>c.id===entry.claim.id),r=claim.realizations.find(r=>r.language===language);
      if(!claim.evidence.length||r?.semantic_state!=='supported')findings.push(finding('evidence','blocking','failed',r?.semantic_reason||'The assertion lacks demonstrated canonical support.','Remove or bound the assertion, or obtain canonical evidence and repeat semantic review.','Appealing language cannot compensate for unsupported or unresolved claims.',{claims:[entry.claim],criteria:claim.target_references.filter(r=>r.namespace==='criterion'),draft_span:entry.spans[0]?{language,span:entry.spans[0]}:null}));
    }
  }
  for(const check of value.document_checks){
    const observed=Array.isArray(observations)&&observations.find(o=>same(o.binding,value.binding)&&o.artifact_id===check.artifact_id&&o.artifact_sha256===check.artifact_sha256&&Array.isArray(o.checks)&&o.checks.some(c=>same(c,check)));
    const verified=!!observed&&text(check.evidence_reference)&&Number.isFinite(Date.parse(check.observed_at))&&check.result!=='not_assessed';
    const normalized={...check,result:verified?check.result:'not_assessed',reason:verified?check.reason:'Not assessed: obtain the current artifact observation, matching producer, method, time and accessible evidence location.'};
    document_checks.push(normalized);
    findings.push(finding('document',normalized.result==='failed'?'major':'informational',normalized.result,normalized.reason,verified?(normalized.result==='failed'?'Ask the document capability to correct the observed issue and repeat this check.':'Retain the observation and recheck after artifact changes.'):'Request a current external document observation.','This supplied observation is separate from wording review; strategy performs no extraction or rendering.',{check_kind:'external_observation',document_check:ref('document_check',check.id),document_anchor:verified?check.evidence_reference:null}));
  }
  const populated={...value,diagnostics,findings,document_checks,comparison:null};
  const checked=await host.inspectStrategy(populated,{profile:current.evidence.profile,binding:current.binding,sha256:host.sha256,validate:host.validate});
  if(checked.schema!=='passed'||checked.deterministic!=='passed'||!host.current()||!same(host.current().binding,current.binding))return blocked();
  return result();
}
```
