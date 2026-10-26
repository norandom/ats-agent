'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const {createHarness,classifyCheck} = require('./foundation.cjs');
const {profile} = require('./fixtures.cjs');
const {handoff} = require('./contract-fixture.cjs');
const sha256 = text => crypto.createHash('sha256').update(text).digest('hex');
(async () => {
  const h = createHarness(), p = profile('operations',h.blank);
  const upstream = h.load('profile-validation.md',['activeRecords','pointerValue','assessReadiness']);
  const contract = {...h.load('strategy-contract.md',['fingerprint','targetFingerprint','inspectStrategy']),sha256};
  const {strategyEvidenceRef} = h.load('strategy-evidence.md',['strategyEvidenceRef']);
  const limit = 'User-reported historical work through 2025-12; no independent verification or present-day observation.';
  const convert = (id = p.evidence[0].id, observation = limit) => strategyEvidenceRef(p,id,observation,upstream);
  const converted = convert();
  assert.equal(converted.deterministic,'passed');
  assert.equal(converted.host_meaning,'not_assessed');
  assert.deepEqual(converted.reference,{record_id:'claim-operations',pointer:'/employment/0/claims/0/statement',source_ids:['source-operations'],original_state:'supported',observation_limit:limit});
  for (const status of ['supported','absent','uncertain','transferable','confirmed_gap']) {
    const q = structuredClone(p); q.evidence[0].status = status;
    const r = strategyEvidenceRef(q,q.evidence[0].id,limit,upstream);
    assert.equal(r.reference.original_state,status); assert.equal(r.host_meaning,'not_assessed');
  }
  const valid = await h.validate(p); assert.equal(valid.schema,'passed'); assert.equal(valid.semantics,'passed');
  // These are host-authored meaning reviews, never automatic semantic classifications.
  const cases = [
    ['exact','Reconcile parcel manifests','supported','Historical statement directly describes manifest reconciliation.','Reconciled parcel manifests.','No additional distinction required.'],
    ['transfer','Investigate routing causes','transferable','Reporting exceptions is relevant but does not establish investigation.','Reported routing exceptions.','Did you investigate causes, or report exceptions for others to investigate?'],
    ['absent','Approve spending','absent','No spending authority is recorded.','Describe manifest work without spending authority.','What spending approval authority, if any, was delegated to you?'],
    ['partial','Reconcile manifests independently','uncertain','Manifest work is supported; independence is unknown within this indivisible condition.','Reconciled manifests; independence remains unconfirmed.','Who reviewed or authorized your reconciliation decisions?'],
    ['historical','Current routing-tool proficiency','uncertain','Past tool use establishes a historical episode only; no current observation.','Used the fictional Parcel Loom tool during the recorded role.','When did you last use Parcel Loom, and for which tasks?'],
    ['synonym','Own dispatch contracts','transferable','Coordination and reporting do not mean contract ownership.','Coordinated dispatch reporting.','Did you hold contractual signing authority, or coordinate work under an owner?'],
    ['gap','Active fictional dispatch permit','confirmed_gap','Explicit sourced user statement says the permit is not held.','Omit the permit as a qualification.','No new question required for this confirmed gap.'],
    ['conflict','Authorize dispatch independently','uncertain','Two sourced accounts disagree about authorization; neither resolves the other.','Reconciled manifests; authorization remains unresolved.','Which account describes your actual authorization scope?']
  ];
  p.employment[0].claims.push({id:'claim-tool',statement:'Used fictional Parcel Loom in 2023.',source_ids:['source-operations']},{id:'claim-gap',statement:'I do not hold the fictional dispatch permit.',source_ids:['source-operations']},{id:'claim-conflict',statement:null,source_ids:['source-operations','source-second']});
  p.sources.push({...p.sources[0],id:'source-second',origin:'Second fictional user account'});
  p.evidence.push({id:'evidence-tool',record_id:'claim-tool',field_pointer:'/statement',status:'supported',source_ids:['source-operations'],rationale:'Historical use only.'},{id:'evidence-gap',record_id:'claim-gap',field_pointer:'/statement',status:'confirmed_gap',source_ids:['source-operations'],rationale:'Explicit fictional user confirmation.'},{id:'evidence-conflict',record_id:'claim-conflict',field_pointer:'/statement',status:'uncertain',source_ids:['source-operations','source-second'],rationale:'Unresolved authorization accounts.'});
  p.conflicts.push({id:'conflict-authority',record_id:'claim-conflict',field_pointer:'/statement',status:'open',alternatives:[{value:'Authorized independently.',source_ids:['source-operations']},{value:'Required supervisor authorization.',source_ids:['source-second']}],selected_alternative:null,resolution_source_ids:[]});
  const validation = await h.validate(p); assert.equal(validation.schema,'passed'); assert.equal(validation.semantics,'passed');
  const request = {task_id:'strategy-authority',required:[{record_id:'claim-conflict',pointer:'/employment/0/claims/3/statement',reason:'Resolve independent dispatch authorization.'}]};
  assert.equal(upstream.assessReadiness(p,request).state,'incomplete');
  const snapshot = handoff(p,contract);
  snapshot.target.text = cases.map(c => c[1]).join('\n'); snapshot.target.sha256 = sha256(snapshot.target.text); snapshot.binding.target_sha256 = snapshot.target.sha256;
  let offset = 0;
  snapshot.criteria = cases.map(([id,wording]) => {const start = offset;offset += Array.from(wording).length+1;return {id:'criterion:'+id,kind:'responsibility',priority:'required',wording,concept:wording,spans:[{start,end:offset-1,excerpt:wording}],grouping_rationale:'One fictional condition.'};});
  snapshot.mappings = cases.map(([id,,state,rationale]) => ({criterion:{namespace:'criterion',id:'criterion:'+id},state,evidence:id === 'absent' ? [] : [convert(id === 'gap' ? 'evidence-gap' : id === 'conflict' ? 'evidence-conflict' : id === 'historical' ? 'evidence-tool' : p.evidence[0].id).reference],rationale,limits:[limit]}));
  snapshot.positioning.criterion_set_sha256 = contract.fingerprint(snapshot.criteria,sha256);
  snapshot.positioning.selected_claims = []; snapshot.positioning.selections = []; snapshot.positioning.expertise_groups = [];
  snapshot.positioning.terminology = [{id:'terminology:coordination',original_term:'dispatch coordination',proposed_term:'dispatch contract ownership',relation:'related',evidence:[converted.reference],guidance:[{namespace:'guidance',id:'guidance:one'}],rationale:'Rejected as an equivalent replacement: coordination does not establish ownership.',limits:['Retain coordination wording; clarify actual contract authority.']}];
  snapshot.claims = []; snapshot.draft = null; snapshot.inferred_needs = []; snapshot.questions = []; snapshot.dispositions = []; snapshot.diagnostics = []; snapshot.findings = []; snapshot.comparison = null;
  snapshot.question_batch = {limit:3,selected_ids:[],deferred_ids:[],suppressed_ids:[]};
  snapshot.guidance[0].scope = 'Host mapping judgments; no external occupational source consulted.';
  snapshot.guidance[0].limits = ['Optional taxonomy unavailable in this fixture. No taxonomy-derived candidate proof or ATS claim.'];
  let sequence = 0;
  const validate = async (schema,instance) => {const file = path.join(h.workspace,`evidence-${++sequence}.json`);fs.writeFileSync(file,JSON.stringify(instance));return {state:classifyCheck(spawnSync('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(h.skillRoot,schema),file],{encoding:'utf8',windowsHide:true})),findings:[]};};
  const inspect = value => contract.inspectStrategy(value,{profile:p,binding:snapshot.binding,sha256,validate});
  const checked = await inspect(snapshot);assert.equal(checked.schema,'passed',JSON.stringify(checked));assert.equal(checked.deterministic,'passed',JSON.stringify(checked));assert.equal(checked.host_meaning,'not_assessed');
  for (const mutate of [s => s.mappings[0].evidence[0].record_id = 'source-operations',s => s.mappings[0].evidence[0].pointer = '/statement',s => s.mappings[0].evidence[0].source_ids = ['claim-operations'],s => s.mappings.pop(),s => s.mappings[0].state = 'equivalent']) {
    const bad = structuredClone(snapshot);mutate(bad);const r = await inspect(bad);assert.ok(r.schema === 'failed' || r.deterministic === 'failed');
  }
  for (const mutate of [q => q.evidence[0].field_pointer = '/missing',q => q.evidence[0].source_ids = ['claim-operations'],q => q.evidence[0].record_id = 'source-operations',q => q.evidence[0].field_pointer = '/claims/0/statement',q => q.evidence[0].status = 'verified']) {
    const q = structuredClone(p); mutate(q); const r = strategyEvidenceRef(q,q.evidence[0].id,limit,upstream); assert.equal(r.deterministic,'failed'); assert.equal(r.reference,undefined);
  }
  assert.equal(convert('missing').deterministic,'failed'); assert.equal(convert(p.evidence[0].id,'').deterministic,'failed');
  const archived = structuredClone(p); archived.change_history = [{id:'history-one',changes:[{before:{id:'archived-fact'},after:null}],authorization:{id:'auth-one'}}];
  for (const field_pointer of ['', '/changes', '/changes/0/before', '/changes/0/before/id']) {
    archived.evidence[0] = {...archived.evidence[0],record_id:'history-one',field_pointer};
    assert.equal(strategyEvidenceRef(archived,archived.evidence[0].id,limit,upstream).deterministic,'failed');
  }
  fs.writeFileSync(path.join(h.workspace,'evidence-observations.json'),JSON.stringify({cases,request,snapshot,checked,review:'Host-authored worked judgments; tests establish conversion and integrity, not arbitrary semantic comprehension.'},null,2));
  console.log('PASS: eight fictional meaning reviews, upstream validation/readiness, exact reference conversion, populated schema/integrity and negative references.');
})().catch(e => {console.error(e);process.exitCode = 1;});
