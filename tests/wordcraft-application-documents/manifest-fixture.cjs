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
  // One composite per language, with two exact occurrences of the same reviewed proposition.
  for (const version of strategy.draft.versions) {
    const text = version.text, end = Array.from(text).length;
    version.text = text + '\n\n' + text;
    version.sha256 = sha256(version.text);
    const spans = [{start:0,end,excerpt:text},{start:end+2,end:2*end+2,excerpt:text}];
    version.claims[0].spans = spans;
    strategy.claims[0].realizations.find(r => r.language === version.language).spans = structuredClone(spans);
  }
  const report = await inspectStrategy(strategy,{profile:base.profile,binding:base.strategy.binding,sha256,validate});
  if (report.schema !== 'passed' || report.deterministic !== 'passed') throw Error('Fictional upstream strategy invalid');
  const trusted = {strategy, strategy_sha256:fingerprint(strategy,sha256), binding:structuredClone(strategy.binding), sha256, fingerprint, stableSerialize, validate,
    privateDestinations:[], session:{sessionId:'fictional-documents',connection:{id:'fictional-connection'},bindings:[],snapshots:[]}, savedArtifacts:[], observations:[]};
  trusted.origin_strategy_sha256=trusted.strategy_sha256;
  const documents = strategy.draft.versions.flatMap(version => ['cv','cover_letter'].map((kind,i) => {
    const id = `${kind}-${version.language}`, destination = path.join(base.destination,id+'.docx');
    trusted.privateDestinations.push(destination);
    return {id,kind,language:version.language,market:'DE',destination,
      draft:{language:version.language,sha256:version.sha256,sections:[{id:'section-'+id,kind:'evidence',range:structuredClone(version.claims[0].spans[i]),claims:[{namespace:'claim',id:'claim:one'}]}]},
      letter_inputs:kind==='cv'?null:{recipient:{value:'Fictional Dispatch House, Imaginary Lane 7',confirmed:true,provenance:['fictional-confirmation']},date:{value:'2026-01-03',confirmed:true,provenance:['fictional-confirmation']},salutation:{value:'Dear hiring team',confirmed:true,provenance:['fictional-review']},enclosures:{value:[],confirmed:true,provenance:['fictional-confirmation']},missing_required:[]},
      presentation:{profile:kind==='cv'?'cv-blue-1':'de-letter-b-1',settings_sha256:null},session:null,anchors:[],checks:[],state:'draft',issues:[]};
  }));
  const manifest = {schema_version:'1.0',origin_strategy_sha256:trusted.strategy_sha256,strategy_sha256:trusted.strategy_sha256,binding:structuredClone(trusted.binding),documents};
  return {manifest,trusted,validate,base};
}
module.exports = {setup,load,sha256};
