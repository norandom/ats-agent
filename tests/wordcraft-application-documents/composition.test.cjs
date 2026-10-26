'use strict';
// Mechanical integration over fictional, host-reviewed inputs. No semantic classifier.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {setup,load,sha256} = require('./manifest-fixture.cjs');
const {createHarness} = require('../targeted-application-strategy/foundation.cjs');
const cases = require('./composition-cases.json');
const {inspectDocumentManifest} = load('application-documents.md',['inspectDocumentManifest']);
const {inspectStrategy} = load('strategy-contract.md',['inspectStrategy']);
const {inspectComposition} = load('strategy-editorial.md',['inspectComposition']);
const ref = id => ({namespace:'claim',id});
const span = (text,start=0) => ({start,end:start+Array.from(text).length,excerpt:text});
let fixture;
const fresh = async () => structuredClone((fixture ||= await setup()).manifest);
async function checkUpstream(strategy) {
  const report = await inspectComposition(strategy,{profile:fixture.base.profile,binding:fixture.trusted.binding,sha256,validate:fixture.validate,inspectStrategy});
  assert.equal(report.schema,'passed',JSON.stringify(report));
  assert.equal(report.deterministic,'passed',JSON.stringify(report));
  assert.equal(report.host_meaning,'not_assessed');
}
function rebind(manifest,strategy) {
  const trusted = {...fixture.trusted,strategy,strategy_sha256:fixture.trusted.fingerprint(strategy,sha256)};
  trusted.origin_strategy_sha256 = trusted.strategy_sha256;
  manifest.origin_strategy_sha256 = manifest.strategy_sha256 = trusted.strategy_sha256;
  for (const doc of manifest.documents) doc.draft.sha256 = strategy.draft.versions.find(v=>v.language===doc.language).sha256;
  return trusted;
}
test('same reviewed wording uses multiple spans across CV and letter',async()=>{
  const manifest = await fresh();
  await checkUpstream(fixture.trusted.strategy);
  assert.equal(fixture.trusted.strategy.draft.versions.length,2);
  assert.equal(fixture.trusted.strategy.claims[0].realizations[0].spans.length,2);
  assert.deepEqual(await inspectDocumentManifest(manifest,fixture.trusted),[]);
});
test('different wording requires a separate reviewed claim; a reused realization fails upstream',async()=>{
  const manifest = await fresh(), strategy = structuredClone(fixture.trusted.strategy);
  const version = strategy.draft.versions.find(v=>v.language==='en');
  const wording = 'Checked parcel manifests against one another.';
  const first = version.claims[0].spans[0];
  version.text = first.excerpt+'\n\n'+wording;
  version.sha256 = sha256(version.text);
  const second = span(wording,first.end+2);
  version.claims[0].spans[1] = second;
  strategy.claims[0].realizations.find(r=>r.language==='en').spans[1] = second;
  const rejected = await inspectComposition(strategy,{profile:fixture.base.profile,binding:fixture.trusted.binding,sha256,validate:fixture.validate,inspectStrategy});
  assert.equal(rejected.deterministic,'failed');
  const separate = structuredClone(strategy.claims[0]);
  separate.id = 'claim:letter';
  separate.realizations = [{language:'en',wording,spans:[second],semantic_state:'supported',semantic_reason:'Fictional host review: checking manifests against each other preserves reconciliation, with no new outcome or authority.'}];
  strategy.claims.push(separate);
  version.claims[0].spans = [first];
  strategy.claims[0].realizations.find(r=>r.language==='en').spans = [first];
  version.claims.push({claim:ref(separate.id),spans:[second]});
  strategy.positioning.selected_claims.push({claim:ref(separate.id),languages:['en']});
  strategy.positioning.selections.push({claim:ref(separate.id),decision:'include',rationale:'Letter realization of the same bounded evidence.'});
  const letter = manifest.documents.find(d=>d.kind==='cover_letter'&&d.language==='en');
  letter.draft.sections[0].range = second;
  letter.draft.sections[0].claims = [ref(separate.id)];
  await checkUpstream(strategy);
  assert.deepEqual(await inspectDocumentManifest(manifest,rebind(manifest,strategy)),[]);
});
test('code-point slices preserve the entire factual proposition and qualifier',async()=>{
  const manifest = await fresh(), strategy = structuredClone(fixture.trusted.strategy);
  const version = strategy.draft.versions[0], wording = 'Reconciled parcel manifests during the 2022 to December 2025 dispatch role.';
  // A supplementary Unicode character precedes the proposition; UTF-16 indices are wrong here.
  version.text = '📦\n'+wording+'\n\n'+wording;
  version.sha256 = sha256(version.text);
  const spans = [span(wording,2),span(wording,2+Array.from(wording).length+2)];
  version.claims[0].spans = spans;
  Object.assign(strategy.claims[0].realizations.find(r=>r.language===version.language),{wording,spans,semantic_reason:'Fictional host review: the employment record bounds this historical action; no current proficiency is claimed.'});
  for (const field of ['start','end']) strategy.claims[0].evidence.push({record_id:'employment-operations',pointer:'/employment/0/'+field,source_ids:['source-operations'],original_state:'supported',observation_limit:'Fictional user-reported employment dates.'});
  strategy.findings[0].draft_span.span = structuredClone(spans[0]);
  const docs = manifest.documents.filter(d=>d.language===version.language);
  docs.forEach((d,i)=>{d.draft.sections[0].range=structuredClone(spans[i]);});
  await checkUpstream(strategy);
  const trusted = rebind(manifest,strategy);
  assert.deepEqual(await inspectDocumentManifest(manifest,trusted),[]);
  const range = docs[0].draft.sections[0].range;
  range.excerpt = 'Reconciled parcel manifests';
  range.end = range.start + Array.from(range.excerpt).length;
  assert.ok((await inspectDocumentManifest(manifest,trusted)).some(f=>f.code==='partial_proposition'));
});
test('private review material remains outside emitted ranges, even with a scoped blocking finding',async()=>{
  const manifest = await fresh(), strategy = structuredClone(fixture.trusted.strategy);
  const version = strategy.draft.versions[0], note = '\n\nPrivate review: claim:one; score 2/3; investigate authority.';
  const start = Array.from(version.text).length;
  version.text += note; version.sha256=sha256(version.text);
  strategy.state = 'needs_revision';
  strategy.findings.push({...structuredClone(strategy.findings[0]),id:'finding:private',severity:'blocking',status:'failed',draft_span:{language:version.language,span:span(note,start)}});
  await checkUpstream(strategy);
  assert.deepEqual(await inspectDocumentManifest(manifest,rebind(manifest,strategy)),[]);
  const emitted = manifest.documents.flatMap(d=>d.draft.sections.map(s=>s.range.excerpt)).join('\n');
  assert.ok(!emitted.includes('Private review:'));
  assert.ok(!emitted.includes('claim:one'));
});
test('actual upstream assembly and review receipts feed the document mapping',async()=>{
  const manifest = await fresh(), strategy = structuredClone(fixture.trusted.strategy), h = createHarness();
  const modules = Object.assign({},...[
    ['strategy-contract.md',['stableSerialize','fingerprint','targetFingerprint','inspectStrategy']],
    ['profile-contract.md',['dispatchVersion']],['profile-validation.md',['evidenceView']],
    ['profile-updates.md',['createProfileUpdates']],['strategy-evidence.md',['createQuestionPlanner','freezeOfferAnalysis']],
    ['strategy-editorial.md',['inspectComposition','applyEditorialMethods']],
    ['strategy-review.md',['reviewDiagnostics','reviewEditorial','compareRevisions']]
  ].map(([file,names])=>load(file,names)));
  const selected=h.select(fixture.base.profile);
  const host={session:'fictional-composition',intake:h.intake,readBytes:fs.readFileSync,decodeUtf8:b=>new TextDecoder('utf-8',{fatal:true}).decode(b),sha256,
    validateProfile:(p,t)=>h.validate(p,{taskRequest:t}),validate:fixture.validate,
    reviewInventories:async value=>Object.fromEntries(value.draft.versions.map(v=>[v.language,{binding:value.binding,draft_sha256:v.sha256,inventory_complete:true,semantics_assessed:true,claims:v.claims}])),
    reviewEditorialJudgments:async()=>({}),observeDocumentArtifacts:async()=>[]};
  const {createStrategyWorkflow}=load('application-strategy.md',['createStrategyWorkflow']);
  const workflow=createStrategyWorkflow(host,modules);
  workflow.select({workspace_root:h.workspace,facts_path:selected.snapshot.selection.resolved_path});
  assert.equal((await workflow.bind({target:strategy.target,settings:strategy.settings,evaluation_date:'2026-01-03',task_request:{task_id:'composition',required:[]}})).status,'ready');
  strategy.binding=workflow.current().binding;
  strategy.dispositions.forEach(d=>{d.binding=structuredClone(strategy.binding);});
  const assembled=await workflow.assemble(strategy);
  assert.equal(assembled.status,'ready',JSON.stringify(assembled));
  assert.equal(assembled.checks.host_meaning,'not_assessed');
  manifest.binding=structuredClone(assembled.value.binding);
  const trusted=rebind(manifest,assembled.value);trusted.binding=manifest.binding;
  assert.deepEqual(await inspectDocumentManifest(manifest,trusted),[]);
});
test('fictional semantic review cards are available for independent host assessment',()=>{
  // Shape only. Passing cannot approve the drafts or the stated reasons.
  assert.equal(cases.length,6);
  for(const item of cases) for(const key of ['source_facts','target','intended_draft','rejected_alternative','reason']) assert.ok(item[key]?.length,key);
});
