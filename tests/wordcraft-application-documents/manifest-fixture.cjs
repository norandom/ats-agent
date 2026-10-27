'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {extractBlock, classifyCheck} = require('../targeted-application-strategy/foundation.cjs');
const {prepare, sha256} = require('./foundation.cjs');
const skillRoot = path.resolve(__dirname, '../../skills/targeted-cv');
const load = (name, exports) => extractBlock(fs.readFileSync(path.join(skillRoot, 'references', name), 'utf8'), exports);
async function setup() {
  const base = await prepare();
  const {fingerprint, stableSerialize, inspectStrategy} = load('strategy-contract.md', ['fingerprint','stableSerialize','inspectStrategy']);
  let serial = 0;
  const validate = async (schema, value) => {
    const file = path.join(base.destination, `manifest-${++serial}.json`);
    fs.writeFileSync(file, JSON.stringify(value));
    const result = spawnSync('uvx', ['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(skillRoot,schema),file], {encoding:'utf8',windowsHide:true,timeout:120000});
    return {state:classifyCheck(result), findings:[]};
  };
  const strategy = structuredClone(base.strategy);
  const records=[['organization','recipient_organization','Fictional Dispatch House'],['address','recipient_address',['Imaginary Lane 7','12345 Musterstadt']],['date','application_date','2026-01-03'],['salutation-en','salutation','Dear hiring team,'],['salutation-de','salutation','Sehr geehrte Damen und Herren,'],['enclosures','enclosure',[]]].map(([id,kind,value])=>{
    const r={id:'context:'+id,kind,value,provenance:{kind:'user_input',reference:'fictional-input',observed_at:'2026-01-03T10:00:00Z',offer_span:null}};
    return {...r,confirmation:{application_id:'fictional-documents',record_sha256:fingerprint(r,sha256),interaction_ref:'fictional-confirmation-'+id,confirmed_at:'2026-01-03T10:01:00Z'}};
  });
  const application_context={application_id:'fictional-documents',target_sha256:strategy.target.sha256,records};
  const sources={target:structuredClone(strategy.target),application_context_bytes:JSON.stringify(application_context),confirmation_observations:records.map(r=>r.confirmation)};
  const h=require('../targeted-application-strategy/foundation.cjs').createHarness();h.select(base.profile);
  const modules=load('strategy-contract.md',['fingerprint','stableSerialize','targetFingerprint','inspectStrategy','inspectApplicationContext']);
  const context=load('application-strategy.md',['createStrategyContext']).createStrategyContext({session:'fictional-documents',currentSelection:()=>h.intake.snapshot(),currentApplicationSelection:()=>structuredClone(sources),readBytes:fs.readFileSync,decodeUtf8:b=>new TextDecoder('utf-8',{fatal:true}).decode(b),sha256,...load('profile-contract.md',['dispatchVersion']),...load('profile-validation.md',['evidenceView']),validateProfile:p=>h.validate(p)},modules);
  const bound=await context.bindStrategy({snapshot:h.intake.snapshot(),target:strategy.target,settings:strategy.settings,evaluation_date:'2026-01-03'});
  if(bound.status!=='ready')throw Error(JSON.stringify(bound));
  strategy.binding=bound.value.binding;strategy.application_context=application_context;strategy.dispositions.forEach(d=>d.binding=structuredClone(strategy.binding));
  // One composite per language, with two exact occurrences of the same reviewed proposition.
  for (const version of strategy.draft.versions) {
    const text = version.text, end = Array.from(text).length;
    version.text = text + '\n\n' + text;
    version.sha256 = sha256(version.text);
    const spans = [{start:0,end,excerpt:text},{start:end+2,end:2*end+2,excerpt:text}];
    version.claims[0].spans = spans;
    strategy.claims[0].realizations.find(r => r.language === version.language).spans = structuredClone(spans);
  }
  const report = await inspectStrategy(strategy,{...sources,profile:base.profile,binding:strategy.binding,sha256,validate});
  if (report.schema !== 'passed' || report.deterministic !== 'passed') throw Error('Fictional upstream strategy invalid');
  const trusted = {strategy, strategy_sha256:fingerprint(strategy,sha256), binding:structuredClone(strategy.binding), sha256, fingerprint, stableSerialize, validate,inspectStrategy,current:context.current,
    privateDestinations:[], session:{sessionId:'fictional-documents',connection:{id:'fictional-connection'},bindings:[],snapshots:[]}, savedArtifacts:[], observations:[]};
  trusted.origin_strategy_sha256=trusted.strategy_sha256;
  const field=(value,...ids)=>({value,confirmed:true,provenance:['fictional-confirmation'],context_refs:ids.map(id=>({kind:'application',application_id:strategy.binding.application_id,context_sha256:strategy.binding.application_context_sha256,record_id:'context:'+id,pointer:'/value'}))});
  const documents = strategy.draft.versions.flatMap(version => ['cv','cover_letter'].map((kind,i) => {
    const id = `${kind}-${version.language}`, destination = path.join(base.destination,id+'.docx');
    trusted.privateDestinations.push(destination);
    return {id,kind,language:version.language,market:'DE',destination,
      draft:{language:version.language,sha256:version.sha256,sections:[{id:'section-'+id,kind:'evidence',range:structuredClone(version.claims[0].spans[i]),claims:[{namespace:'claim',id:'claim:one'}]}]},
      letter_inputs:kind==='cv'?null:{recipient:field('Fictional Dispatch House\nImaginary Lane 7\n12345 Musterstadt','organization','address'),date:field(version.language==='de'?'3. Januar 2026':'3 January 2026','date'),salutation:field(version.language==='de'?'Sehr geehrte Damen und Herren,':'Dear hiring team,','salutation-'+version.language),enclosures:field([],'enclosures'),missing_required:[]},
      presentation:{profile:kind==='cv'?'cv-blue-1':'de-letter-b-1',settings_sha256:null},session:null,anchors:[],checks:[],state:'draft',issues:[]};
  }));
  const manifest = {schema_version:'1.1',origin_strategy_sha256:trusted.strategy_sha256,strategy_sha256:trusted.strategy_sha256,binding:structuredClone(trusted.binding),documents};
  const reselect=async(settings=strategy.settings)=>context.bindStrategy({snapshot:h.intake.snapshot(),target:sources.target,settings,evaluation_date:'2026-01-03'});
  return {manifest,trusted,validate,base,sources,context,reselect};
}
module.exports = {setup,load,sha256};
