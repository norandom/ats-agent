'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {setup,load,sha256} = require('./manifest-fixture.cjs');
const {createHarness} = require('../targeted-application-strategy/foundation.cjs');
const {inspectDocumentManifest,proposeCheckOnlyRefresh} = load('application-documents.md',['inspectDocumentManifest','proposeCheckOnlyRefresh']);
const {inspectStrategy} = load('strategy-contract.md',['inspectStrategy']);
let fixture;
async function fresh() { fixture ||= await setup(); return {manifest:structuredClone(fixture.manifest),strategy:structuredClone(fixture.trusted.strategy)}; }
function trustedFor(strategy) { return {...fixture.trusted,strategy,strategy_sha256:fixture.trusted.fingerprint(strategy,sha256)}; }
function rebind(manifest,strategy) { const t=trustedFor(strategy); manifest.strategy_sha256=manifest.origin_strategy_sha256=t.strategy_sha256; t.origin_strategy_sha256=t.strategy_sha256; return t; }
async function assemble(strategy) {
  const h=createHarness();
  const modules=Object.assign({},...[
    ['strategy-contract.md',['stableSerialize','fingerprint','targetFingerprint','inspectStrategy']],
    ['profile-contract.md',['dispatchVersion']],['profile-validation.md',['evidenceView']],
    ['profile-updates.md',['createProfileUpdates']],['strategy-evidence.md',['createQuestionPlanner','freezeOfferAnalysis']],
    ['strategy-editorial.md',['inspectComposition','applyEditorialMethods']],
    ['strategy-review.md',['reviewDiagnostics','reviewEditorial','compareRevisions']]
  ].map(([file,names])=>load(file,names)));
  const selected=h.select(fixture.base.profile);
  const host={session:'fictional-languages',intake:h.intake,readBytes:fs.readFileSync,decodeUtf8:b=>new TextDecoder('utf-8',{fatal:true}).decode(b),sha256,
    validateProfile:(p,t)=>h.validate(p,{taskRequest:t}),validate:fixture.validate,
    reviewInventories:async value=>Object.fromEntries(value.draft.versions.map(v=>[v.language,{binding:value.binding,draft_sha256:v.sha256,inventory_complete:true,semantics_assessed:true,claims:v.claims}])),
    reviewEditorialJudgments:async()=>({}),observeDocumentArtifacts:async()=>[]};
  const {createStrategyWorkflow}=load('application-strategy.md',['createStrategyWorkflow']);
  const workflow=createStrategyWorkflow(host,modules);
  workflow.select({workspace_root:h.workspace,facts_path:selected.snapshot.selection.resolved_path});
  assert.equal((await workflow.bind({target:strategy.target,settings:strategy.settings,evaluation_date:'2026-01-03',task_request:{task_id:'languages',required:[]}})).status,'ready');
  strategy.binding=workflow.current().binding;
  strategy.dispositions.forEach(d=>{d.binding=structuredClone(strategy.binding);});
  const result=await workflow.assemble(strategy);
  return {result,workflow};
}

test('real upstream assembly keeps English usable when German support and letter inputs are pending',async()=>{
  const {manifest,strategy}=await fresh();
  strategy.claims[0].realizations.find(r=>r.language==='de').semantic_state='unsupported';
  strategy.positioning.selected_claims[0].languages=['en'];
  const {result}=await assemble(strategy);
  assert.equal(result.status,'ready',JSON.stringify(result));
  const value=result.value;
  assert.equal(value.draft.versions.length,2);
  assert.equal(value.state,'needs_revision');
  manifest.binding=structuredClone(value.binding);
  for(const d of manifest.documents) {
    if(d.language==='de') { d.state='pending';d.draft=null;d.issues=['German wording requires upstream support review.']; }
    if(d.kind==='cover_letter'&&d.language==='en') {
      d.letter_inputs.recipient={value:null,confirmed:false,provenance:[]};d.letter_inputs.missing_required=['recipient'];
      d.state='pending';d.issues=['Confirm recipient address.'];
    }
  }
  const t=rebind(manifest,value); t.binding=value.binding;
  assert.deepEqual(await inspectDocumentManifest(manifest,t),[]);
  assert.equal(manifest.documents.find(d=>d.kind==='cv'&&d.language==='en').state,'draft');
  const letter=manifest.documents.find(d=>d.kind==='cover_letter'&&d.language==='en'); letter.state='draft';
  assert.ok((await inspectDocumentManifest(manifest,t)).some(f=>f.code==='missing_inputs'));
});

let refreshBaseline;
async function refreshFixture() {
  if(refreshBaseline) return {...refreshBaseline,manifest:structuredClone(refreshBaseline.manifest),previous:structuredClone(refreshBaseline.previous),trusted:{...refreshBaseline.trusted,strategy:structuredClone(refreshBaseline.trusted.strategy)}};
  const {manifest,strategy}=await fresh();
  const {result,workflow}=await assemble(strategy);
  assert.equal(result.status,'ready');
  const previous=result.value;
  manifest.binding=structuredClone(previous.binding);
  rebind(manifest,previous);
  const next=structuredClone(previous);
  const bytes=Buffer.from('Fictional saved artifact bytes for observation identity only.');
  const artifactPath=require('node:path').join(fixture.base.destination,'refresh-observation.bin');fs.writeFileSync(artifactPath,bytes);
  const check=next.document_checks[0];
  Object.assign(check,{artifact_sha256:sha256(fs.readFileSync(artifactPath)),producer:'Fictional test observer',method:'Fixture byte observation',observed_at:'2026-01-03T13:00:00Z',result:'passed',evidence_reference:artifactPath,reason:'Deterministic fixture observation, not WordCraft acceptance.'});
  const observations=[{binding:structuredClone(next.binding),artifact_id:check.artifact_id,artifact_sha256:check.artifact_sha256,checks:[structuredClone(check)]}];
  const trusted={...trustedFor(next),origin_strategy_sha256:manifest.origin_strategy_sha256,binding:next.binding,current:()=>workflow.current(),inspectStrategy,documentArtifacts:observations};
  refreshBaseline={manifest:structuredClone(manifest),previous:structuredClone(previous),trusted};
  return {manifest,previous,trusted};
}
test('check-only proposal preserves origin, full manifest and inputs after real upstream assembly',async()=>{
  const {manifest,previous,trusted}=await refreshFixture(), before=structuredClone({manifest,previous,strategy:trusted.strategy});
  const report=await proposeCheckOnlyRefresh(manifest,previous,trusted);
  assert.equal(report.decision,'refresh',JSON.stringify(report));
  assert.deepEqual(report.proposal,{...manifest,strategy_sha256:trusted.strategy_sha256});
  assert.deepEqual(report.transition,{origin_strategy_sha256:manifest.origin_strategy_sha256,previous_strategy_sha256:manifest.strategy_sha256,strategy_sha256:trusted.strategy_sha256});
  assert.deepEqual({manifest,previous,strategy:trusted.strategy},before);
  assert.deepEqual(await inspectDocumentManifest(report.proposal,trusted),[]);
});
test('complete snapshot comparison rejects non-check changes even when draft text is identical',async()=>{
  const f=await refreshFixture();
  for(const mutate of [s=>s.claims[0].limits.push('Changed limit'),s=>s.findings[0].rationale='Changed judgment',s=>s.positioning.audience='Different audience',s=>s.settings.question_limit=4,s=>s.binding.canonical_sha256=sha256('changed facts'),s=>s.editorial_methods[0].version='2']) {
    const t={...f.trusted,strategy:structuredClone(f.trusted.strategy)}; mutate(t.strategy);t.strategy_sha256=t.fingerprint(t.strategy,sha256);
    assert.equal((await proposeCheckOnlyRefresh(f.manifest,f.previous,t)).decision,'revalidate');
  }
});
test('refresh refuses stale context, missing independent observations, invalid snapshots and manifest tampering',async()=>{
  const f=await refreshFixture();
  for(const t of [ {...f.trusted,documentArtifacts:[]}, {...f.trusted,current:()=>null}, {...f.trusted,strategy_sha256:sha256('stale')}, {...f.trusted,current:()=>({...f.trusted.current(),binding:{...f.trusted.binding,settings_sha256:sha256('new settings')}})} ])
    assert.equal((await proposeCheckOnlyRefresh(f.manifest,f.previous,t)).decision,'revalidate');
  for(const mutate of [m=>m.origin_strategy_sha256=sha256('forged origin'),m=>m.documents[0].draft.sections[0].range.excerpt='altered',m=>m.documents[0].state='delivered']) {
    const m=structuredClone(f.manifest);mutate(m);assert.equal((await proposeCheckOnlyRefresh(m,f.previous,f.trusted)).decision,'revalidate');
  }
  const previous=structuredClone(f.previous);previous.claims[0].id='claim:broken';
  assert.equal((await proposeCheckOnlyRefresh(f.manifest,previous,f.trusted)).decision,'revalidate');
});
test('pair cases are review inputs, never automated semantic approvals',()=>{
  const cases=require('./language-pair-cases.json');
  assert.equal(cases.length,2);
  for(const c of cases) for(const key of ['facts','target','cv_en','letter_en','cv_de','letter_de','review_focus']) assert.ok(c[key]);
});

test('CV-only settings retain exactly one composite version per requested language and no letter',async()=>{
  const {manifest,strategy}=await fresh();
  strategy.settings.requested_documents=['cv'];
  strategy.binding.settings_sha256=fixture.trusted.fingerprint(strategy.settings,sha256);
  strategy.dispositions.forEach(d=>{d.binding=structuredClone(strategy.binding);});
  const report=await inspectStrategy(strategy,{profile:fixture.base.profile,binding:strategy.binding,sha256,validate:fixture.validate});
  assert.equal(report.schema,'passed');assert.equal(report.deterministic,'passed');
  manifest.binding=structuredClone(strategy.binding);
  manifest.documents=manifest.documents.filter(d=>d.kind==='cv');
  const t=rebind(manifest,strategy);t.binding=strategy.binding;
  assert.deepEqual(await inspectDocumentManifest(manifest,t),[]);
  assert.equal(manifest.documents.length,2);
  const duplicate=structuredClone(strategy);duplicate.draft.versions.push(structuredClone(duplicate.draft.versions[0]));
  assert.equal((await inspectStrategy(duplicate,{profile:fixture.base.profile,binding:strategy.binding,sha256,validate:fixture.validate})).deterministic,'failed');
});
