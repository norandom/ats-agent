'use strict';
// Test foundation only: no runtime coordinator and no candidate inputs.
const fs = require('node:fs'), path = require('node:path');
const {spawnSync} = require('node:child_process');
const {createHarness} = require('../targeted-application-strategy/foundation.cjs');
const {profile} = require('../targeted-application-strategy/fixtures.cjs');
const fixtures = require('./fixtures.json');
const root = path.resolve(__dirname,'../..');
function privateDestination(value) {
  const destination = path.resolve(root,value), relative = path.relative(root,destination);
  if (!relative.startsWith('outputs' + path.sep)) throw Error('Evidence must stay in ignored outputs');
  const ignored = spawnSync('git',['check-ignore','--quiet','--',relative],{cwd:root,windowsHide:true});
  if (ignored.status !== 0 && !require('./relocation.cjs').relocated(root,__filename)) throw Error('Evidence must stay in ignored outputs');
  // Resolve existing ancestors before any write; reject junction/symlink redirection.
  let ancestor = destination;
  while (!fs.existsSync(ancestor)) ancestor = path.dirname(ancestor);
  if (fs.realpathSync(ancestor).toLowerCase() !== ancestor.toLowerCase()) throw Error('Redirected private destination');
  return destination;
}
function freshRun() {
  const base = privateDestination('outputs/refinement-tests');
  fs.mkdirSync(base,{recursive:true});
  return fs.mkdtempSync(path.join(base,'foundation-'));
}
async function prepare() {
  const destination = freshRun(), harness = createHarness();
  const applicants = [];
  for (const input of fixtures.applicants) {
    const value = profile(input.factory,harness.blank);
    value.candidate.id = `candidate-refinement-${input.id}`;
    value.candidate.name = input.name;
    Object.assign(value.employment[0],{employer:input.employer,title:input.title});
    value.employment[0].claims[0].statement = input.claim;
    const validation = await harness.validate(value);
    const directory = path.join(destination,input.id);
    fs.mkdirSync(directory);
    fs.writeFileSync(path.join(directory,'reusable-profile.json'),JSON.stringify(value,null,2),{flag:'wx'});
    const members = input.requested_documents.flatMap(kind => input.languages.map(language => ({kind,language,status:'pending',destination:path.join(directory,`${kind}-${language}.docx`)})));
    applicants.push({application_id:`application-refinement-${input.id}`,profile:value,validation,selection:{role:input.role,languages:input.languages,target_country:input.target_country},members});
  }
  harness.saveEvidence();
  const result = {destination,fictional:true,applicants,embeddedContent:fixtures.embedded_content,liveAuthoring:'not_assessed'};
  fs.writeFileSync(path.join(destination,'fixtures.json'),JSON.stringify(result,null,2),{flag:'wx'});
  return result;
}
module.exports = {prepare,privateDestination,freshRun};
