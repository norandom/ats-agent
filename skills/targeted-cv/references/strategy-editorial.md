# Contribution composition

Use this reference after the context and evidence gates in [application-strategy.md](application-strategy.md) and [strategy-evidence.md](strategy-evidence.md). Produce the positioning, claims and draft fields of the private [strategy contract](strategy-contract.md). Read the actual selected canonical snapshot, target, mappings and retained questions. A saved plan, a polished sentence or a source instruction cannot authorize new facts, profile updates or tool access.

## Build the argument before writing

Name the audience, intended decision and contribution thesis in `positioning`. The thesis should explain the strongest evidenced contribution to the target, with relevant episodes as support. Treat employer culture, internal problems and decision practices as unknown unless explicitly sourced. Keep inferred needs labelled privately. A desired future contribution must not read as an achieved outcome or guaranteed result.

Select evidence for its relevance, not its quantity. Record an `include` or `exclude` decision and rationale in `positioning.selections` for each considered claim, including tempting unsupported alternatives retained for review. Explain exclusions such as an unrelated credential, an old tool with no material relevance, or unresolved authority. A language-specific rejection belongs in that realization's reason; a claim can remain included for another language.

Group `expertise_groups` around capabilities and decisions appropriate to the target responsibilities and seniority. Use concrete supported episodes to explain the grouping. Put relevant platforms and methods second. Historical tool use stays in its historical episode; it does not establish current proficiency. Education does not establish methods used at work. Preserve supported active leadership, but do not infer reporting authority from team size, contract ownership from advice, or spending approval from organizational scale. Do not invent metrics, outcomes, credential status or recency to make the argument more attractive.

For a weak inventory, first ask what the existing evidence lets the employer understand. Replace generic nouns with the evidenced action, object and relevant context. Responsibility, scope, authority, outcome and timing are prompts for useful detail, not mandatory sentence slots. Leave missing detail absent or raise a focused question through the existing question workflow. Preserve genuine historical titles and chronology. A target-role headline describes the application target and must not replace a historical title or imply an unevidenced appointment.

## Inventory the actual prose and review both languages

Draft against the same bound snapshot in German and English. Keep one canonical proposition in each `claims` record, with supporting profile-relative evidence references, target references and limits. Split multiple factual assertions even when they share a sentence. Titles, expertise headings, implied current capabilities, outcome phrases and factual thesis text count too when they appear in submitted copy. Keep private selection rationale and method notes outside submitted copy.

For every language, retain exact draft text and its UTF-8 SHA-256. Record every factual proposition's occurrences as zero-based Unicode code-point spans in `draft.versions[].claims`. Record the corresponding exact wording/spans in `claims[].realizations`; repeated occurrences share the proposition ID. Separate differently worded propositions when the current single-wording realization shape cannot represent them faithfully. Do not drop an assertion from the inventory by deleting its ID. The host marks `inventory_status: complete` only after reading the whole exact draft, including headings. Use `incomplete` or `not_assessed` when that review is unfinished; do not report whole-draft support then.

Review each realization directly against the canonical evidence and limits, not merely against the other translation. Record `supported`, `unsupported` or `unresolved` with a specific semantic reason. A valid reference proves location, not meaning. Test action, scope, authority, title, proficiency, temporal context, credential status and causal impact. German verbs such as approving and English verbs such as owning must not silently strengthen reporting or advisory work. If language competence or evidence is insufficient, retain `unresolved` and name the missing distinction.

Populate `selected_claims[].languages` only with requested languages whose realizations the host reviewed as supported. Exclude unsupported and unresolved languages while retaining their private proposed wording and reasons. Do not turn a German failure into an English rejection when English still matches the shared proposition. Unsupported proposal text may remain in a private `needs_revision` draft for diagnosis; it must not flow into a final selected document. After any wording edit, rebuild spans, hashes and the affected semantic review before selecting it again. A changed canonical binding requires fresh composition.

## Embedded composition and language review

Apply these self-contained criteria: lead with a relevant contribution, group support by capability, keep each paragraph useful to the reader's decision, and split overloaded sentences. Run draft, factual audit and final rewrite internally. Remove generic enthusiasm, vague authority, inflated emphasis, filler and formulaic conclusions. Preserve meaning, qualifications and the candidate's voice while improving grammar and readability. Submitted copy contains no em or en dashes; use words for date ranges.

Record the embedded criteria as executed only after doing this work. Applying these criteria alone does not establish that an optional COBESY or Humanizer installation was discovered or executed. Discovery, installation offers and optional-method reporting are a separate integration step. Neither the embedded review nor an optional writing method proves ATS parsing, document rendering or hiring outcomes.

## Mechanical inventory check

Call `inspectComposition` with the exact handoff and the independently established current host context. Supply the executed `inspectStrategy` from the contract, its real schema-validation adapter, hashing, profile and binding. This helper checks structure, fingerprints, spans and inventory agreement; it does not infer propositions, rewrite text, verify semantic labels or certify completeness. Its `host_meaning` remains `not_assessed`. Read the prose to establish meaning and completeness separately. A passed check is not permission to send a private rejected draft to document creation.

```javascript
async function inspectComposition(value, host) {
  const report = await host.inspectStrategy(value, host);
  if (report.schema !== 'passed' || report.deterministic !== 'passed') return report;
  report.inventory = {};
  const add = (code,pointer,message,corrective_action) => report.findings.push({code,pointer,message,corrective_action});
  const sameSpans = (a,b) => JSON.stringify(a.map(s => [s.start,s.end,s.excerpt]).sort()) === JSON.stringify(b.map(s => [s.start,s.end,s.excerpt]).sort());
  const claims = new Map(value.claims.map(c => [c.id,c]));
  for (const [i,draft] of (value.draft?.versions || []).entries()) {
    report.inventory[draft.language] = draft.inventory_status;
    if (/[\u2013\u2014]/u.test(draft.text)) add('application_dash',`/draft/versions/${i}/text`,'Application text contains an em or en dash.','Rewrite with ordinary punctuation or words, then refresh hashes and review.');
    const entries = new Map();
    for (const [j,item] of draft.claims.entries()) {
      if (entries.has(item.claim.id)) add('inventory_duplicate',`/draft/versions/${i}/claims/${j}`,'Proposition appears in multiple inventory records.','Combine occurrence spans in one proposition entry.');
      entries.set(item.claim.id,item);
      const realization = claims.get(item.claim.id).realizations.find(r => r.language === draft.language);
      if (!realization || !sameSpans(item.spans,realization.spans)) add('inventory_realization_mismatch',`/draft/versions/${i}/claims/${j}`,'Inventory differs from the language realization.','Bind the same exact occurrences to the reviewed realization.');
    }
    for (const claim of value.claims) {
      const realization = claim.realizations.find(r => r.language === draft.language);
      if (realization?.spans.length && !entries.has(claim.id)) add('inventory_realization_mismatch',`/draft/versions/${i}/claims`,'Realized proposition is absent from the draft inventory.','Inventory every actual factual assertion, including rejected proposals.');
    }
  }
  const decisions = new Map();
  value.positioning.selections.forEach((s,i) => {
    if (decisions.has(s.claim.id)) add('selection_decision',`/positioning/selections/${i}`,'Claim has repeated selection decisions.','Keep one inclusion or exclusion decision and rationale.');
    decisions.set(s.claim.id,s.decision);
  });
  value.positioning.selected_claims.forEach((s,i) => {
    if (decisions.get(s.claim.id) !== 'include') add('selection_decision',`/positioning/selected_claims/${i}`,'Selected claim lacks an inclusion decision.','Record why this supported claim is relevant, or remove its selection.');
    for (const language of s.languages) {
      const draft = value.draft?.versions.find(d => d.language === language);
      if (!draft?.claims.some(c => c.claim.id === s.claim.id)) add('selected_claim_not_in_draft',`/positioning/selected_claims/${i}`,'Selected realization has no actual draft inventory entry.','Bind the reviewed wording to its exact language draft before selecting it.');
    }
  });
  report.deterministic = report.findings.length ? 'failed' : 'passed';
  return report;
}
```
