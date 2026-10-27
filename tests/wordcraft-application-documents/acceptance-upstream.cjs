'use strict';
// Test-only assembly of the wholly fictional live acceptance inputs through shipped owners.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const {fixture}=require('./acceptance-fixture.cjs'),{load,sha256}=require('./manifest-fixture.cjs');
const {createHarness,classifyCheck}=require('../targeted-application-strategy/foundation.cjs');
const {handoff}=require('../targeted-application-strategy/contract-fixture.cjs');
async function prepareAcceptance(output){
 const f=fixture(),h=createHarness(),modules=Object.assign({},...[
  ['strategy-contract.md',['stableSerialize','fingerprint','targetFingerprint','inspectStrategy','inspectApplicationContext','claimEligibility']],
  ['profile-contract.md',['dispatchVersion']],['profile-validation.md',['evidenceView']],['profile-updates.md',['createProfileUpdates']],
  ['strategy-evidence.md',['createQuestionPlanner','freezeOfferAnalysis']],['strategy-editorial.md',['inspectComposition','applyEditorialMethods']],
  ['strategy-review.md',['reviewedClaimState','reviewDiagnostics','reviewEditorial','compareRevisions']]
 ].map(([file,names])=>load(file,names)));
 // The seed contributes only contract scaffolding; all candidate claims and evidence are replaced below.
 const seedProfile=require('../targeted-application-strategy/fixtures.cjs').profile('operations',h.blank);
 const s=handoff(seedProfile,{...modules,sha256});
 s.settings={...s.settings,languages:['en','de'],requested_documents:['cv','cover_letter'],market:'DE'};
 s.target={...s.target,text:f.offer};s.target.sha256=modules.targetFingerprint(s.target,sha256);
 const records=[];
 const record=(id,kind,value)=>{const r={id:'context:'+id,kind,value,provenance:{kind:'user_input',reference:'fictional-acceptance-input',observed_at:'2026-10-27T06:00:00Z',offer_span:null}};r.confirmation={application_id:'fictional-acceptance',record_sha256:modules.fingerprint(r,sha256),interaction_ref:'fictional-acceptance-confirmation-'+id,confirmed_at:'2026-10-27T06:01:00Z'};records.push(r);};
 record('organization','recipient_organization',f.metadata.recipient[0]);record('address','recipient_address',f.metadata.recipient.slice(1));record('date','application_date',f.metadata.date);record('enclosures','enclosure',f.metadata.enclosures);record('intent','application_intent',f.intent);
 for(const d of f.documents.filter(d=>d.kind==='cover_letter')){record('salutation-'+d.language,'salutation',d.letter.salutation);record('subject-'+d.language,'application_intent',d.letter.subject);}
 s.application_context={application_id:'fictional-acceptance',target_sha256:s.target.sha256,records};
 const sources={target:structuredClone(s.target),application_context_bytes:JSON.stringify(s.application_context),confirmation_observations:records.map(r=>structuredClone(r.confirmation))};
 h.select(f.profile);let serial=0;
 const validate=async(schema,value)=>{const file=path.join(h.workspace,'acceptance-'+(++serial)+'.json');fs.writeFileSync(file,JSON.stringify(value));return {state:classifyCheck(spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(h.skillRoot,schema),file],{encoding:'utf8',windowsHide:true,timeout:120000})),findings:[]};};
 const host={session:'fictional-acceptance',intake:h.intake,readBytes:fs.readFileSync,decodeUtf8:b=>new TextDecoder('utf-8',{fatal:true}).decode(b),sha256,validate,validateProfile:p=>h.validate(p),currentApplicationSelection:()=>structuredClone(sources),reviewInventories:async value=>Object.fromEntries(value.draft.versions.map(v=>[v.language,{binding:value.binding,draft_sha256:v.sha256,inventory_complete:true,semantics_assessed:true,claims:v.claims}])),reviewEditorialJudgments:async()=>({}),observeDocumentArtifacts:async()=>[]};
 const workflow=load('application-strategy.md',['createStrategyWorkflow']).createStrategyWorkflow(host,modules);
 const bound=await workflow.bind({target:s.target,settings:s.settings,evaluation_date:'2026-10-27'});assert.equal(bound.status,'ready',JSON.stringify(bound));s.binding=bound.value.binding;
 s.criteria=[];s.inferred_needs=[];s.mappings=[];s.questions=[];s.dispositions=[];s.question_batch={limit:s.settings.question_limit,selected_ids:[],deferred_ids:[],suppressed_ids:[]};s.claims=[];s.findings=[];s.diagnostics=[];s.document_checks=[];s.comparison=null;
 s.positioning={...s.positioning,selected_claims:[],selections:[],expertise_groups:[],terminology:[],criterion_set_sha256:modules.fingerprint([],sha256),contribution_thesis:'Clear dispatch records and practical handovers grounded in the fictional work history.'};
 const ref=id=>({namespace:'claim',id}),app=id=>({kind:'application',application_id:s.binding.application_id,context_sha256:s.binding.application_context_sha256,record_id:'context:'+id,pointer:'/value'});
 const canonical=id=>{const index=f.profile.profile.findIndex(r=>r.id==='fact-'+id);assert.ok(index>=0,id);return {record_id:'fact-'+id,pointer:'/profile/'+index+'/statement',source_ids:['source-acceptance'],original_state:'supported',observation_limit:'Wholly fictional selected source.'};};
 const identity={record_id:f.profile.candidate.id,pointer:'/candidate',source_ids:['source-acceptance'],original_state:'supported',observation_limit:'Wholly fictional selected identity and address.'};
 const offer={kind:'offer',target_sha256:s.target.sha256,start:0,end:Array.from(f.offer).length,excerpt:f.offer};
 const documents=[];s.draft.versions=[];
 for(const language of ['en','de']){
  let text='',inventory=[];
  for(const d of f.documents.filter(d=>d.language===language)){
   if(text)text+='\n\n';const start=Array.from(text).length;const sections=[];
   for(const [index,row] of d.paragraphs.entries()){
    if(index)text+='\n';const offset=Array.from(text).length;text+=row.text;
    const units=[];
    if(d.kind==='cv'&&row.kind!=='heading')units.push({text:row.text,subject:'candidate',evidence:[canonical(row.id)],context:[]});
    if(d.kind==='cover_letter'){
     if(['sender','return','signer'].includes(row.kind))units.push({text:row.text,subject:'candidate',evidence:[identity],context:[]});
     else if(['recipient','date','salutation','subject','enclosures'].includes(row.kind))units.push({text:row.text,subject:'application',evidence:[],context:[app(row.kind==='recipient'?(row.text===f.metadata.recipient[0]?'organization':'address'):row.kind==='salutation'||row.kind==='subject'?row.kind+'-'+language:row.kind)]});
     else if(row.kind==='body'){
      const bodyIndex=d.letter.body.indexOf(row.text),sentences=row.text.match(/[^.!?]+[.!?]+(?:\s|$)/g).map(t=>t.trim());
      sentences.forEach((wording,j)=>{
       const ids=bodyIndex===0?['scope-one']:bodyIndex===1?(j===0?['achievement-one']:['project-one-detail','scope-one']):['scope-two'];
       const subject=bodyIndex===0&&j===0?'offer':j===sentences.length-1?'mixed':'candidate';
       units.push({text:wording,subject,evidence:subject==='offer'?[]:ids.map(canonical),context:subject==='offer'?[offer]:subject==='mixed'?[app('intent')]:[]});
      });
     }
    }
    const claims=[];
    for(const [j,u]of units.entries()){
     const id='claim:'+d.id+'-'+index+'-'+j,local=Array.from(row.text.slice(0,row.text.indexOf(u.text))).length,span={start:offset+local,end:offset+local+Array.from(u.text).length,excerpt:u.text};
     s.claims.push({id,subject:u.subject,proposition:u.text,evidence:u.evidence,context_evidence:u.context,target_references:[],limits:[],realizations:[{language,wording:u.text,spans:[span],semantic_state:'supported',semantic_reason:'Host-reviewed fictional fixture: exact metadata or faithful localized evidence; bounded relevance and intent claim no new authority, qualification or guaranteed outcome.'}]});
     s.positioning.selected_claims.push({claim:ref(id),languages:[language]});s.positioning.selections.push({claim:ref(id),decision:'include',rationale:'Reviewed fictional application assertion.'});inventory.push({claim:ref(id),spans:[span]});claims.push(ref(id));
    }
    sections.push({id:'section-'+d.id+'-'+index,kind:row.kind,range:{start:offset,end:offset+Array.from(row.text).length,excerpt:row.text},claims});
   }
   const field=(value,...ids)=>({value,confirmed:true,provenance:['fictional-acceptance-confirmation'],context_refs:ids.map(app)});
   documents.push({id:d.id,kind:d.kind,language,market:'DE',destination:path.resolve(output,d.id+'.docx'),draft:{language,sha256:null,sections},letter_inputs:d.kind==='cv'?null:{recipient:field(f.metadata.recipient.join('\n'),'organization','address'),date:field(d.letter.displayDate,'date'),salutation:field(d.letter.salutation,'salutation-'+language),enclosures:field(f.metadata.enclosures,'enclosures'),missing_required:[]},presentation:{profile:d.kind==='cv'?'cv-blue-1':'de-letter-b-1',settings_sha256:null},session:null,anchors:[],checks:[],state:'draft',issues:[]});
  }
  const hash=sha256(text);s.draft.versions.push({language,text,sha256:hash,inventory_status:'complete',claims:inventory});for(const d of documents.filter(d=>d.language===language))d.draft.sha256=hash;
 }
 const assembled=await workflow.assemble(s);assert.equal(assembled.status,'ready',JSON.stringify(assembled));
 const strategy=assembled.value,hash=modules.fingerprint(strategy,sha256),manifest={schema_version:'1.1',origin_strategy_sha256:hash,strategy_sha256:hash,binding:strategy.binding,documents};
 const trusted={...modules,sha256,validate,current:workflow.current,strategy,strategy_sha256:hash,origin_strategy_sha256:hash,binding:strategy.binding,privateDestinations:documents.map(d=>d.destination),session:{connection:{id:'fictional-unopened'},bindings:[],snapshots:[]},savedArtifacts:[],observations:[]};
 assert.deepEqual(await load('application-documents.md',['inspectDocumentManifest']).inspectDocumentManifest(manifest,trusted),[]);
 return {fixture:f,strategy,manifest,workflow,trusted,sources,checks:assembled.checks};
}
module.exports={prepareAcceptance};
