'use strict';
// Wholly fictional snapshots; host callbacks simulate observations, never semantic reasoning.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const {createHarness,classifyCheck}=require('./foundation.cjs');
const {profile}=require('./fixtures.cjs'),{handoff}=require('./contract-fixture.cjs');
const sha256=x=>require('node:crypto').createHash('sha256').update(x).digest('hex');
(async()=>{
 const h=createHarness(),p=profile('operations',h.blank);
 const c=h.load('strategy-contract.md',['stableSerialize','fingerprint','targetFingerprint','inspectStrategy']);
 const {compareRevisions}=h.load('strategy-review.md',['compareRevisions']);
 const s=handoff(p,{...c,sha256});s.comparison=null;
 const base=structuredClone(s.diagnostics[0]);
 for(const dimension of ['claim_support','employer_appeal','editorial_readability']){
  const d=structuredClone(base);d.id=`diagnostic:${dimension}`;d.dimension=dimension;d.scope={language:'en',priority:null};d.population=[{namespace:'claim',id:'claim:one'}];d.population_sha256=c.fingerprint(d.population,sha256);d.rubric.weights=[{reference:d.population[0],weight:1}];d.rubric_sha256=c.fingerprint(d.rubric,sha256);s.diagnostics.push(d);
 }
 let seq=0,live={binding:s.binding,evidence:{profile:p,validation:{schema:'passed',semantics:'passed'}}};
 const validate=async(schema,value)=>{const f=path.join(h.workspace,`compare-${++seq}.json`);fs.writeFileSync(f,JSON.stringify(value));return {state:classifyCheck(spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(h.skillRoot,schema),f],{encoding:'utf8',windowsHide:true})),findings:[]};};
 const host={...c,sha256,validate,current:()=>structuredClone(live)};
 const run=async(a=s,b=s,extra={})=>{live.binding=b.binding;return compareRevisions(a,b,{...host,...extra});};
 const row=(r,dim)=>r.dimensions.find(d=>d.dimension===dim);
 const baseline=await run();assert.equal(baseline.status,'comparable');assert.ok(baseline.dimensions.every(d=>d.delta===0));
 assert.equal((await validate('schemas/application-strategy.schema.json',{...s,comparison:baseline})).state,'passed');
 for(const [dimension,mutate] of [
  ['offer_coverage',x=>{x.diagnostics[0].value=99;}],
  ['offer_coverage',x=>{x.diagnostics[0].counts.supported=0;x.diagnostics[0].counts.unsupported=1;x.diagnostics[0].numerator=0;x.diagnostics[0].value=0;}],
  ['offer_coverage',x=>{x.mappings[0].state='uncertain';}],
  ['claim_support',x=>{x.claims[0].realizations[0].semantic_state='unsupported';x.positioning.selected_claims=[];}],
  ['claim_support',x=>{x.diagnostics[1].counts.supported=0;x.diagnostics[1].counts.unsupported=1;x.diagnostics[1].numerator=0;x.diagnostics[1].value=0;}]
 ]){
  const invalid=structuredClone(s);mutate(invalid);
  for(const [a,b] of [[s,invalid],[invalid,s]]){const r=await run(a,b);assert.equal(row(r,dimension).delta,null);assert.match(row(r,dimension).reasons.join(' '),/inconsistent|arithmetic/);}
 }
 const truthfulChange=structuredClone(s);truthfulChange.mappings[0].state='uncertain';truthfulChange.diagnostics[0].counts.supported=0;truthfulChange.diagnostics[0].counts.uncertain=1;truthfulChange.diagnostics[0].numerator=0;truthfulChange.diagnostics[0].value=0;
 assert.equal(row(await run(s,truthfulChange),'offer_coverage').delta,-100);
 const wording=structuredClone(s);wording.draft.versions[0].text+=' Clear handover.';wording.draft.versions[0].sha256=sha256(wording.draft.versions[0].text);
 assert.equal((await run(s,wording)).status,'comparable');
 for(const mutate of [x=>x.claims[0].proposition='Directed a fictional fleet.',x=>{x.diagnostics[1].population=[];x.diagnostics[1].population_sha256=c.fingerprint([],sha256);}]){
  const x=structuredClone(s);mutate(x);const r=await run(s,x);assert.equal(row(r,'claim_support').delta,null);assert.match(row(r,'claim_support').reasons.join(' '),/population|proposition/);assert.equal(row(r,'offer_coverage').delta,0);
 }
 for(const mutate of [x=>{x.diagnostics[0].rubric.definition='Different rubric';x.diagnostics[0].rubric_sha256=c.fingerprint(x.diagnostics[0].rubric,sha256);},x=>{x.criteria[0].concept='different concept';x.positioning.criterion_set_sha256=c.fingerprint(x.criteria,sha256);}]){
  const x=structuredClone(s);mutate(x);assert.equal(row(await run(s,x),'offer_coverage').delta,null);
 }
 for(const mutate of [x=>x.editorial_methods[0].version='2.0',x=>{x.settings.market='GB';x.binding.settings_sha256=c.fingerprint(x.settings,sha256);},x=>x.diagnostics[2].scope.language='de']){
  const x=structuredClone(s);mutate(x);const r=await run(s,x);assert.equal(row(r,'employer_appeal').delta,null);
 }
 const unavailable=structuredClone(s);unavailable.diagnostics[0].status='not_assessed';unavailable.diagnostics[0].value=null;assert.equal(row(await run(s,unavailable),'offer_coverage').delta,null);
 const replaced=structuredClone(s);replaced.binding.generation++;replaced.dispositions.forEach(d=>d.binding=replaced.binding);
 assert.equal((await run(s,replaced)).status,'not_comparable');
 assert.equal((await run(s,replaced,{continuity:{confirmed:true}})).status,'not_comparable');
 const updated=structuredClone(replaced);updated.binding.canonical_sha256=sha256('fictional changed canonical bytes');updated.binding.validation_profile_sha256=updated.binding.canonical_sha256;updated.dispositions.forEach(d=>d.binding=updated.binding);
 const receipt={previous_binding:s.binding,current_binding:updated.binding,previous_profile:p,changed_fields:['/employment/0/claims/0/statement']};
 const r=await run(s,updated,{observeConfirmedUpdate:async()=>receipt});assert.equal(r.status,'evidence_update');assert.match(r.reasons.join(' '),/employment\/0\/claims\/0\/statement/);assert.equal(row(r,'claim_support').delta,0);
 assert.equal((await run(s,updated,{observeConfirmedUpdate:async()=>({...receipt,changed_fields:[]})})).status,'not_comparable');
 const mismatch=await run(s,updated,{observeConfirmedUpdate:async()=>({...receipt,current_binding:s.binding})});assert.equal(mismatch.status,'not_comparable');
 const drift=structuredClone(updated);drift.claims[0].proposition='Changed fictional responsibility.';
 const driftResult=await run(s,drift,{observeConfirmedUpdate:async()=>receipt});assert.equal(driftResult.status,'evidence_update');assert.equal(row(driftResult,'claim_support').delta,null);
 const changedTarget=structuredClone(s);changedTarget.target.text+=' Carefully.';changedTarget.target.sha256=c.targetFingerprint(changedTarget.target,sha256);changedTarget.binding.target_sha256=changedTarget.target.sha256;changedTarget.dispositions.forEach(d=>d.binding=changedTarget.binding);
 const targetResult=await run(s,changedTarget);assert.ok(targetResult.dimensions.every(d=>d.delta===null));assert.match(targetResult.reasons.concat(targetResult.dimensions.flatMap(d=>d.reasons)).join(' '),/Target changed/);
 const doc=structuredClone(s);doc.document_checks[0].artifact_sha256=sha256('fictional revised artifact');doc.document_checks[0].method='Different fictional observation';const docs=await run(s,doc);assert.match(docs.reasons.join(' '),/artifact|document/i);assert.equal(docs.dimensions.length,4);
 const stale=await run(s,s,{current:()=>null});assert.equal(stale.status,'not_comparable');assert.ok(stale.dimensions.every(d=>d.delta===null));
 const race=await run(s,s,{inspectStrategy:async(...args)=>{const result=await c.inspectStrategy(...args);live=null;return result;}});assert.equal(race.status,'not_comparable');
 console.log('PASS comparison: wording, propositions, populations, rubrics, scope, methods, continuity authority, unavailable checks, closed schema and stale context.');
})().catch(e=>{console.error(e);process.exitCode=1;});
