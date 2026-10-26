'use strict';
// Replays the host's recorded decisions. This program does not comprehend prose.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const {createHarness,classifyCheck}=require('../foundation.cjs');
const {profile}=require('../fixtures.cjs'),{handoff}=require('../contract-fixture.cjs');
const sha256=b=>require('node:crypto').createHash('sha256').update(b).digest('hex');
const span=text=>({start:0,end:Array.from(text).length,excerpt:text});
const ref=(namespace,id)=>({namespace,id:`${namespace}:${id}`});
async function run(inputs,reviews){
 const h=createHarness();let serial=0;
 const modules={...h.load('strategy-contract.md',['stableSerialize','fingerprint','targetFingerprint','inspectStrategy']),...h.load('profile-contract.md',['dispatchVersion']),...h.load('profile-validation.md',['evidenceView']),...h.load('profile-updates.md',['createProfileUpdates']),...h.load('strategy-evidence.md',['createQuestionPlanner','freezeOfferAnalysis']),...h.load('strategy-editorial.md',['inspectComposition','applyEditorialMethods']),...h.load('strategy-review.md',['reviewDiagnostics','reviewEditorial','compareRevisions'])};
 const {createStrategyWorkflow}=h.load('application-strategy.md',['createStrategyWorkflow']);
 const results=[];
 const runs=inputs.flatMap(input=>{const review=reviews.find(r=>r.id===input.id);return [{input,review},...(review.correction?[{input:{...input,id:input.id+'-revision'},review:{...review,...review.correction,en_state:'supported',de_state:'supported',reason:'The revised action is stated in the fictional source; no outcome, authority or unsupervised scope is added.',finding:'Supported revision replaces the rejected assertion while retaining the original evidence limits.',appeal:2,correction:null}}]:[])];});
 for(const {input,review} of runs){
  const p=profile(input.profile_kind,h.blank);
  p.employment[0].claims[0].statement=input.source_statement;
  if(input.id==='old-tools')p.employment[0].start='2012';
  const selected=h.select(p);let receiptDraft;
  const host={session:`semantic-${input.id}`,intake:h.intake,readBytes:fs.readFileSync,decodeUtf8:b=>new TextDecoder('utf-8',{fatal:true}).decode(b),sha256,
   validateProfile:(v,t)=>h.validate(v,{taskRequest:t}),
   validate:async(schema,v)=>{const file=path.join(h.workspace,`semantic-${++serial}.json`);fs.writeFileSync(file,JSON.stringify(v));const r=spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(h.skillRoot,schema),file],{encoding:'utf8',windowsHide:true});return {state:classifyCheck(r),findings:[]};},
   // Receipts below replay the separate, host-reviewed exact prose artifact.
   reviewInventories:async value=>Object.fromEntries(receiptDraft.map(d=>{assert.equal(value.draft.versions.find(v=>v.language===d.language).text,d.text);return [d.language,{binding:value.binding,draft_sha256:sha256(d.text),inventory_complete:true,semantics_assessed:true,claims:d.claims}];})),
   reviewEditorialJudgments:async value=>Object.fromEntries(receiptDraft.map(d=>[d.language,{binding:value.binding,draft_sha256:sha256(d.text),language_competent:true,employer_appeal:{value:review.appeal,reason:review.finding,span:span(d.text),correction:review.correction?.[d.language]||'Retain this bounded action and its source limits.'},editorial_readability:{value:review.readability,reason:'One short sentence with a concrete action and object; readability does not establish factual support.',span:span(d.text),correction:'Retain the concise sentence structure.'}}])),
   observeDocumentArtifacts:async()=>[]};
  const w=createStrategyWorkflow(host,modules);
  w.select({workspace_root:h.workspace,facts_path:selected.snapshot.selection.resolved_path});
  const settings={languages:['en','de'],market:'DE',requested_documents:['cv'],question_limit:3};
  assert.equal((await w.bind({target:{kind:'offer',text:input.offer},settings,evaluation_date:'2026-10-26',task_request:{task_id:'semantic-acceptance',required:[]}})).status,'ready');
  const v=handoff(p,{...modules,sha256}),context=w.current();
  v.binding=context.binding;v.target=context.target;v.settings=context.settings;v.inferred_needs=[];v.diagnostics=[];v.findings=[];v.comparison=null;v.document_checks=[];v.dispositions=[];v.questions=[];
  const sentences=input.offer.split('. ').slice(0,['conflicting-priorities','weak-inventory'].includes(input.id)?2:1);
  v.criteria=sentences.map((text,i)=>{const start=Array.from(input.offer.slice(0,input.offer.indexOf(text))).length;return {id:`criterion:c${i}`,kind:/permit|training|proficiency/.test(text)?'qualification':/Reduce/.test(text)?'outcome':'responsibility',priority:input.id==='omitted-dates-photo'?'preferred':i?'unspecified':/required/.test(text)?'required':'unspecified',wording:text,concept:text.replace(/ is required| is optional| is preferred/g,''),spans:[{start,end:start+Array.from(text).length,excerpt:text}],grouping_rationale:i&&input.id==='conflicting-priorities'?'Conflicting optional condition retained, not silently resolved.':'One explicit condition; source commands and completeness requests excluded.'};});
  const evidence={record_id:`claim-${input.profile_kind}`,pointer:'/employment/0/claims/0/statement',source_ids:[`source-${input.profile_kind}`],original_state:'supported',observation_limit:'Fictional user-reported statement, observed through 2025-12; not independently verified.'};
  v.mappings=v.criteria.map(c=>({criterion:{namespace:'criterion',id:c.id},state:review.mapping,evidence:[evidence],rationale:review.reason,limits:['No independent verification; unknown details remain unknown.']}));
  v.claims=[{id:'claim:one',proposition:review.en,evidence:[evidence],target_references:v.criteria.map(c=>({namespace:'criterion',id:c.id})),limits:[review.reason],realizations:['en','de'].map(language=>({language,wording:review[language],spans:[span(review[language])],semantic_state:review[`${language}_state`],semantic_reason:review.reason}))}];
  v.draft={artifact_id:`fictional-${input.id}`,versions:['en','de'].map(language=>({language,text:review[language],sha256:sha256(review[language]),inventory_status:'complete',claims:[{claim:ref('claim','one'),spans:[span(review[language])]}]}))};
  receiptDraft=structuredClone(v.draft.versions);
  v.positioning={audience:input.profile_kind==='operations'?'Dispatch hiring team':'Laboratory hiring team',intended_decision:'Discuss the evidenced contribution and unresolved qualification limits',contribution_thesis:review.correction?.en||review.en,selected_claims:[{claim:ref('claim','one'),languages:['en','de']}],selections:[{claim:ref('claim','one'),decision:'include',rationale:review.finding}],expertise_groups:[{name:input.profile_kind==='operations'?'Dispatch records':'Laboratory preparation',claims:[ref('claim','one')],rationale:'Group the actual work, not tools or assumed seniority.'}],terminology:[],criterion_set_sha256:modules.fingerprint(v.criteria,sha256)};
  v.guidance=[{id:'guidance:judgment',authority_class:'project_judgment',source:'Fresh fictional host acceptance review',url:null,version:'1',accessed_at:'2026-10-26',consulted_passage:review.finding,scope:'Fictional wording and evidence assessment',limits:['No external occupational source consulted. No vendor ATS, hiring, personality or DIN inference.']}];
  v.editorial_methods=[{id:'editorial_method:cobesy',name:'COBESY',source:'https://github.com/norandom/Skills/tree/main/cobesy',version:'1.3.0',available:true,executed:true,fallback:false,fallback_reason:null},{id:'editorial_method:humanizer',name:'Humanizer',source:'https://github.com/blader/humanizer',version:'2.9.1',available:true,executed:true,fallback:false,fallback_reason:null}];
  if(review.question){v.questions=[{id:'question:one',distinction_key:input.id==='skipped-answer'?'recency':input.id,affected:[ref('criterion',input.id==='weak-inventory'?'c1':'c0')],text:review.question,rationale:review.reason,expected_effect:review.finding,missing_distinction:review.question,priority:input.id==='conflicting-priorities'?1:/weak-inventory|unsupported-appeal/.test(input.id)?3:2,offer_order:0,disposition:'open',reopen_reason:null}];}
  if(input.interaction)v.dispositions=[{id:'disposition:one',binding:v.binding,distinction_key:'recency',status:'skipped',answer:null,evidence:[],reopen_reason:null}];
  v.question_batch={limit:3,selected_ids:[],deferred_ids:[],suppressed_ids:[]};
  const built=await w.assemble(v);assert.equal(built.status,'ready',`${input.id}: ${JSON.stringify(built)}`);
  assert.equal(built.checks.schema,'passed');assert.equal(built.checks.host_meaning,'not_assessed');
  assert.ok(built.value.positioning.selected_claims.every(c=>c.languages.every(l=>review[`${l}_state`]==='supported')));
  assert.ok(built.value.question_batch.selected_ids.length<=3);
  if(input.interaction){assert.equal(built.value.question_batch.selected_ids.length,0);assert.equal(built.value.mappings[0].state,'uncertain');}
  assert.ok(!/[\u2013\u2014]/u.test(review.en+review.de));
  const result={id:input.id,canonical_profile_sha256:sha256(JSON.stringify(p)),checks:built.checks,state:built.value.state,criteria:built.value.criteria,mappings:built.value.mappings,claims:built.value.claims,selected_claims:built.value.positioning.selected_claims,questions:built.value.questions,question_batch:built.value.question_batch,diagnostics:built.value.diagnostics,findings:built.value.findings};
  results.push(result);
 }
 const assets={};for(const dir of ['references','schemas'])for(const name of fs.readdirSync(path.join(h.skillRoot,dir)).sort())assets[`${dir}/${name}`]=sha256(fs.readFileSync(path.join(h.skillRoot,dir,name)));
 assets['templates/cv-facts.blank.json']=sha256(fs.readFileSync(path.join(h.skillRoot,'templates/cv-facts.blank.json')));
 const observed={execution_kind:'Executed shipped integrated helpers over separately recorded host judgments; replay is not fresh semantic reasoning.',runtime_assets:assets,results};
 const output=path.join(__dirname,'observed.json');
 if(process.argv.includes('--record'))fs.writeFileSync(output,JSON.stringify(observed,null,2)+'\n');
 else assert.deepEqual(observed,JSON.parse(fs.readFileSync(output,'utf8')),'Observed decisions/arithmetic or runtime assets changed: fresh review is required.');
 console.log(`PASS ${results.length} integrated semantic-case replays with real upstream and handoff validation; host meaning remains separately reviewed.`);
}
module.exports={run};
