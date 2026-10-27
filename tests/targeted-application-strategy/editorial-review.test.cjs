'use strict';
// Invented facts and host-authored semantic labels test arithmetic, not comprehension.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const crypto = require('node:crypto');
const {createHarness,classifyCheck} = require('./foundation.cjs');
const {profile} = require('./fixtures.cjs');
const {handoff} = require('./contract-fixture.cjs');
const sha256 = x => crypto.createHash('sha256').update(x).digest('hex');
(async () => {
  const h = createHarness(), p = profile('operations',h.blank);
  const contracts = h.load('strategy-contract.md',['stableSerialize','fingerprint','targetFingerprint','inspectStrategy','inspectApplicationContext']);
  const {createStrategyContext} = h.load('application-strategy.md',['createStrategyContext']);
  const {dispatchVersion} = h.load('profile-contract.md',['dispatchVersion']);
  const {evidenceView} = h.load('profile-validation.md',['evidenceView']);
  const {reviewDiagnostics,reviewEditorial} = h.load('strategy-review.md',['reviewDiagnostics','reviewEditorial']);
  h.select(p);
  const context = createStrategyContext({currentApplicationSelection:()=>({target:structuredClone(s.target),application_context_bytes:null,confirmation_observations:[]}),session:'fictional-diagnostics',currentSelection:()=>h.intake.snapshot(),readBytes:fs.readFileSync,decodeUtf8:b=>new TextDecoder('utf-8',{fatal:true}).decode(b),sha256,validateProfile:(p,t)=>h.validate(p,{taskRequest:t}),dispatchVersion,evidenceView},contracts);
  const s = handoff(p,{...contracts,sha256});
  const bound = await context.bindStrategy({snapshot:h.intake.snapshot(),target:s.target,settings:s.settings,evaluation_date:'2026-01-03',task_request:{task_id:'review',required:[]}});
  assert.equal(bound.status,'ready');
  s.binding = bound.value.binding;
  s.questions=[];s.dispositions=[];s.question_batch={limit:3,selected_ids:[],deferred_ids:[],suppressed_ids:[]};
  s.inferred_needs=[];s.positioning.terminology=[];s.positioning.selected_claims=[];s.positioning.selections=[];s.positioning.expertise_groups=[];
  s.diagnostics=[];s.findings=[];s.comparison=null;
  const baseCriterion=s.criteria[0],baseMapping=s.mappings[0],baseClaim=s.claims[0];
  const states=['supported','uncertain','transferable','confirmed_gap','supported','supported'];
  s.criteria=states.map((_,i)=>({...structuredClone(baseCriterion),id:`criterion:c${i}`,priority:i<4?'required':'preferred',wording:`Fictional criterion ${i}`,concept:`fictional concept ${i}`}));
  s.mappings=states.map((state,i)=>({...structuredClone(baseMapping),criterion:{namespace:'criterion',id:s.criteria[i].id},state}));
  s.positioning.criterion_set_sha256=contracts.fingerprint(s.criteria,sha256);
  s.claims=Array.from({length:5},(_,i)=>({...structuredClone(baseClaim),id:`claim:p${i}`,proposition:`Fictional proposition ${i}.`,target_references:[],realizations:[]}));
  s.draft.versions=['en','de'].map(language=>{
    const words=s.claims.map((_,i)=>`Fictional ${language} assertion ${i}.`),text=words.join(' ');
    const claims=s.claims.map((c,i)=>{const start=text.indexOf(words[i]),spans=[{start,end:start+words[i].length,excerpt:words[i]}];c.realizations.push({language,wording:words[i],spans,semantic_state:i===4?'unsupported':'supported',semantic_reason:'Fictional host judgment; arithmetic test only.'});return {claim:{namespace:'claim',id:c.id},spans};});
    return {language,text,sha256:sha256(text),inventory_status:'complete',claims};
  });
  let seq=0;
  const validate=async(schema,instance)=>{const file=path.join(h.workspace,`diagnostics-${++seq}.json`);fs.writeFileSync(file,JSON.stringify(instance));const r=spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(h.skillRoot,schema),file],{encoding:'utf8',windowsHide:true});return {state:classifyCheck(r),findings:[]};};
  const receipts = value => Object.fromEntries((value.draft?.versions||[]).map(d=>[d.language,{binding:structuredClone(value.binding),draft_sha256:d.sha256,inventory_complete:true,semantics_assessed:true,claims:structuredClone(d.claims)}]));
  const host={current:context.current,sha256,...contracts,validate,reviewInventories:async value=>receipts(value)};
  const run=(value=s,extra={})=>reviewDiagnostics(value,{...host,...extra});
  const judgments=v=>Object.fromEntries(v.draft.versions.map(d=>[d.language,{binding:v.binding,draft_sha256:d.sha256,language_competent:true,
    employer_appeal:{value:1,reason:'Relevant but inventory-like.',span:d.claims[0].spans[0],correction:'Lead with the supported contribution to dispatch.'},
    editorial_readability:{value:2,reason:d.language==='de'?'Wiederholte Satzanfänge.':'Repeated sentence openings.',span:d.claims[0].spans[0],correction:d.language==='de'?'Satzanfänge kürzen; sachliche Grenzen erhalten.':'Shorten repeated openings; preserve factual limits.'}}]));
  const check={...s.document_checks[0],result:'passed',evidence_reference:'private:page-1'};
  s.document_checks=[check];
  const observation={binding:s.binding,artifact_id:check.artifact_id,artifact_sha256:check.artifact_sha256,checks:[check]};
  const eh={...host,reviewEditorialJudgments:async v=>judgments(v),observeDocumentArtifacts:async()=>[structuredClone(observation)]};
  const review=(v=s,extra={})=>reviewEditorial(v,{...eh,...extra});
  const get=(r,dimension,language)=>r.diagnostics.find(d=>d.dimension===dimension&&d.scope.language===language);
  const result=await review();
  assert.equal(get(result,'employer_appeal','en').value,1);
  assert.equal(get(result,'editorial_readability','de').value,2);
  assert.equal(result.document_checks[0].result,'passed');
  assert.ok(result.findings.some(f=>f.category==='evidence'&&f.severity==='blocking'&&f.claims[0]?.id==='claim:p4'));
  assert.ok(result.findings.some(f=>f.category==='readability'&&f.draft_span.language==='de'&&f.correction.includes('Satzanfänge')));
  assert.equal((await contracts.inspectStrategy({...structuredClone(s),...result},{profile:p,binding:context.current().binding,sha256,validate})).deterministic,'passed');
  for(const change of [o=>o.artifact_sha256=sha256('changed'),o=>o.checks[0].observed_at='2025-01-01T00:00:00Z',o=>o.checks[0].producer='Other',o=>o.checks[0].evidence_reference=null,o=>o.binding.generation++]){
    const o=structuredClone(observation);change(o);
    assert.equal((await review(s,{observeDocumentArtifacts:async()=>[o]})).document_checks[0].result,'not_assessed');
  }
  assert.equal((await review(s,{observeDocumentArtifacts:async()=>[]})).document_checks[0].result,'not_assessed');
  for(const change of [j=>j.de.language_competent=false,j=>j.de.draft_sha256=sha256('old'),j=>j.de.editorial_readability.span.excerpt='wrong']){
    const r=await review(s,{reviewEditorialJudgments:async v=>{const j=judgments(v);change(j);return j;}});
    assert.equal(get(r,'editorial_readability','de').value,null);
    assert.equal(get(r,'editorial_readability','en').value,2);
  }
  const strong=await review(s,{reviewEditorialJudgments:async v=>{const j=judgments(v);j.en.employer_appeal.value=3;return j;}});
  assert.equal(get(strong,'employer_appeal','en').value,3);
  assert.ok(strong.findings.some(f=>f.category==='evidence'&&f.severity==='blocking'));
  const noText=structuredClone(s);noText.draft=null;noText.claims=[];
  assert.ok((await review(noText,{reviewEditorialJudgments:async()=>({})})).diagnostics.every(d=>d.value===null));
  h.saveEvidence();console.log('PASS editorial review: actual schema/binding, localized EN/DE judgments, unsupported blockers, fresh/stale/missing observations.');
})().catch(error=>{console.error(error);process.exitCode=1;});

