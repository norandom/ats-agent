'use strict';
// Test-only integration input. Every assertion comes from selected fictional facts.
const fs=require('node:fs');
const {setup,load,sha256}=require('./manifest-fixture.cjs');
const {createHarness}=require('../targeted-application-strategy/foundation.cjs');
async function prepareIntegration(){
 const f=await setup(),h=createHarness(),s=structuredClone(f.base.strategy),p=f.base.profile;
 const modules=Object.assign({},...[
  ['strategy-contract.md',['stableSerialize','fingerprint','targetFingerprint','inspectStrategy','inspectApplicationContext','claimEligibility']],
  ['profile-contract.md',['dispatchVersion']],['profile-validation.md',['evidenceView']],
  ['profile-updates.md',['createProfileUpdates']],['strategy-evidence.md',['createQuestionPlanner','freezeOfferAnalysis']],
  ['strategy-editorial.md',['inspectComposition','applyEditorialMethods']],
  ['strategy-review.md',['reviewedClaimState','reviewDiagnostics','reviewEditorial','compareRevisions']]
 ].map(([file,names])=>load(file,names)));
 const selected=h.select(p),factsPath=selected.snapshot.selection.resolved_path;
 const host={session:'fictional-entry-integration',intake:h.intake,readBytes:fs.readFileSync,decodeUtf8:b=>new TextDecoder('utf-8',{fatal:true}).decode(b),sha256,
  validateProfile:(value,task)=>h.validate(value,{taskRequest:task}),validate:f.validate,currentApplicationSelection:()=>({target:s.target,application_context_bytes:null,confirmation_observations:[]}),
  // Deterministic control callback; actual host meaning review is recorded separately.
  reviewInventories:async value=>Object.fromEntries(value.draft.versions.map(v=>[v.language,{binding:value.binding,draft_sha256:v.sha256,inventory_complete:true,semantics_assessed:true,claims:v.claims}])),
  reviewEditorialJudgments:async()=>({}),observeDocumentArtifacts:async()=>[]};
 const {createStrategyWorkflow}=load('application-strategy.md',['createStrategyWorkflow']);
 const workflow=createStrategyWorkflow(host,modules);
 workflow.select({workspace_root:h.workspace,facts_path:factsPath});
 s.settings.languages=['en'];s.settings.requested_documents=['cv'];
 const bound=await workflow.bind({target:s.target,settings:s.settings,evaluation_date:'2026-01-03',task_request:{task_id:'document-integration',required:[]}});
 if(bound.status!=='ready')throw Error('Selected fictional facts not ready');
 s.binding=workflow.current().binding;s.dispositions.forEach(d=>d.binding=structuredClone(s.binding));
 s.claims[0].realizations=s.claims[0].realizations.filter(r=>r.language==='en');
 s.positioning.selected_claims[0].languages=['en'];
 const employment=p.employment[0];
 const paragraphs=[['name',p.candidate.name],['headline',employment.title],['heading','Relevant experience'],['label',employment.employer],['date','2022 - December 2025'],['body',s.claims[0].realizations[0].wording]];
 const text=paragraphs.map(([,text])=>text).join('\n'),span=excerpt=>({start:Array.from(text.slice(0,text.indexOf(excerpt))).length,end:Array.from(text.slice(0,text.indexOf(excerpt)+excerpt.length)).length,excerpt});
 s.claims[0].realizations[0].spans=[span(s.claims[0].realizations[0].wording)];
 const claims=[{claim:{namespace:'claim',id:'claim:one'},spans:s.claims[0].realizations[0].spans}];
 for(const [id,wording,record_id,pointer] of [
  ['identity',p.candidate.name,p.candidate.id,'/candidate/name'],
  ['title',employment.title,employment.id,'/employment/0/title'],
  ['employer',employment.employer,employment.id,'/employment/0/employer'],
  ['dates','2022 - December 2025',employment.id,'/employment/0']]){
  const ref={namespace:'claim',id:'claim:'+id};
  s.claims.push({subject:'candidate',context_evidence:[],id:ref.id,proposition:wording,evidence:[{record_id,pointer,source_ids:['source-operations'],original_state:'supported',observation_limit:'Wholly fictional selected input.'}],target_references:[],limits:[],realizations:[{language:'en',wording,spans:[span(wording)],semantic_state:'supported',semantic_reason:'Exact selected fictional field or faithful date localization; host review remains separately recorded.'}]});
  s.positioning.selected_claims.push({claim:ref,languages:['en']});s.positioning.selections.push({claim:ref,decision:'include',rationale:'CV identity and employment context.'});claims.push({claim:ref,spans:[span(wording)]});
 }
 s.draft.versions=[{language:'en',text,sha256:sha256(text),inventory_status:'complete',claims}];s.findings=[];s.document_checks=[];s.comparison=null;
 const assembled=await workflow.assemble(s);if(assembled.status!=='ready')throw Error(JSON.stringify(assembled));
 const strategy=assembled.value,manifest=structuredClone(f.manifest);manifest.documents=[manifest.documents[0]];
 const doc=manifest.documents[0];doc.draft={language:'en',sha256:sha256(text),sections:[{id:'cv-evidence',kind:'evidence',range:{start:0,end:Array.from(text).length,excerpt:text},claims:claims.map(c=>c.claim)}]};
 manifest.binding=structuredClone(strategy.binding);manifest.origin_strategy_sha256=manifest.strategy_sha256=modules.fingerprint(strategy,sha256);
 const trusted={...f.trusted,current:workflow.current,strategy,binding:strategy.binding,strategy_sha256:manifest.strategy_sha256,origin_strategy_sha256:manifest.origin_strategy_sha256};
 return {...f,manifest,trusted,strategy,workflow,modules,host,paragraphs,text,factsPath,factsHash:sha256(fs.readFileSync(factsPath))};
}
module.exports={prepareIntegration};
