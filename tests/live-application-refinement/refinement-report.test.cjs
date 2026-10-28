'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load,sha256}=require('../wordcraft-application-documents/manifest-fixture.cjs');
const {reportRefinement}=load('application-refinement.md',['reportRefinement']);
const ref=n=>({resolved_path:'/fictional/'+n,sha256:sha256(n)}),clone=structuredClone;
function fixture(){
 const selection={profile:{...ref('profile'),schema_version:'2.1'},target_sha256:sha256('target'),settings_sha256:sha256('settings'),reusable_base:ref('base'),context:null};
 const member={kind:'cv',language:'en',manifest_document_id:'cv-en',logical_document_id:'live-cv',status:'verified',next_action:null,intent_ids:[],receipt_refs:[ref('receipt')]};
 const record={application_id:'fictional',selection,owner_artifacts:{strategy:ref('strategy')},revisions:[{id:'revision-2',source_baselines:clone(selection),members:[member]}],profile_operations:[],stop_state:{state:'active',reason:null,pending_operation_refs:[],last_confirmed_deliverables:[]}};
 const diagnostic={id:'diagnostic:support-en',dimension:'claim_support',scope:{language:'en',priority:null},status:'assessed',value:100,check_kind:'deterministic',rubric:{version:'existing/1',definition:'Existing owner method',scale:{unit:'percent'},weights:[],unknown_treatment:'Unknown remains unresolved.'},numerator:1,denominator:1,reason:'Supported current inventory.'};
 const strategy={binding:{application_id:record.application_id,resolved_path:selection.profile.resolved_path,canonical_sha256:selection.profile.sha256,target_sha256:selection.target_sha256,settings_sha256:selection.settings_sha256},diagnostics:[diagnostic],comparison:{status:'comparable',reasons:['Unchanged assessments.'],dimensions:[{dimension:diagnostic.dimension,current:{id:diagnostic.id,namespace:'diagnostic'},previous_value:100,current_value:100,delta:0,reasons:[]}]},document_checks:[]};
 const observations={record:clone(record),revision_id:'revision-2',integrity:{state:'passed'},strategy,member_results:[{member_id:'cv-en',status:'verified',artifact:ref('cv-en.docx'),checks:[{check:'all mandatory checks',result:'passed',method:'current owner receipt'}],next_action:null}],profile_results:[{destination_role:'reusable',status:'unchanged',reason:'Exact reusable bytes unchanged.'}],changes:[{kind:'new_evidence',references:['fact-1'],reason:'Current selected persistence supports the added fact.'},{kind:'editorial',references:['claim-1'],reason:'Shorter supported wording.'}],issues:[],last_confirmed_deliverables:[{member_id:'cv-en',ref:ref('cv-en.docx'),availability:'current_bytes_observed',verification:'last_confirmed_then'}],checkpoint_status:'confirmed'};
 return {record,observations};
}
test('report carries current owner methods and zero/lower/null deltas without inventing improvements',()=>{
 const {record,observations:o}=fixture();
 let report=reportRefinement(record,o);assert.equal(report.state,'reported');assert.equal(report.members[0].status,'verified');assert.equal(report.application_complete,true);
 assert.equal(report.diagnostics[0].comparison.delta,0);assert.equal(report.diagnostics[0].outcome,'unchanged');assert.deepEqual(report.diagnostics[0].rubric,o.strategy.diagnostics[0].rubric);assert.deepEqual(report.changes.map(c=>c.kind),['new_evidence','editorial']);
 o.strategy.comparison.dimensions[0].delta=-25;o.strategy.comparison.dimensions[0].current_value=75;o.strategy.diagnostics[0].value=75;o.strategy.diagnostics[0].reason='New review finds an unsupported proposition.';
 report=reportRefinement(record,o);assert.equal(report.diagnostics[0].outcome,'lower');assert.match(report.diagnostics[0].reason,/unsupported/);
 o.strategy.comparison.status='not_comparable';Object.assign(o.strategy.comparison.dimensions[0],{delta:null,reasons:['Population changed.']});
 report=reportRefinement(record,o);assert.equal(report.diagnostics[0].outcome,'not_comparable');assert.equal(report.diagnostics[0].comparison.delta,null);assert.deepEqual(report.diagnostics[0].comparison.reasons,['Population changed.']);
 o.strategy.diagnostics[0].status='not_assessed';o.strategy.diagnostics[0].value=null;
 report=reportRefinement(record,o);assert.equal(report.diagnostics[0].outcome,'not_assessed');assert.equal(report.diagnostics[0].value,null);
 assert.match(report.limits.join(' '),/missing ability|inability/);assert.match(report.limits.join(' '),/hiring probability/);
});
test('partial writes, member/language inconsistency and unassessed checks remain actionable',()=>{
 const {record:r,observations:o}=fixture();const de={...clone(r.revisions[0].members[0]),manifest_document_id:'cv-de',language:'de',status:'needs_revision',next_action:'Translate corrected responsibility.'};r.revisions[0].members.push(de);o.record=clone(r);
 o.member_results.push({member_id:'cv-de',status:'needs_revision',artifact:null,checks:[{check:'language consistency',result:'not_assessed',method:'competent language review unavailable'}],next_action:de.next_action});
 o.profile_results=[{destination_role:'reusable',status:'confirmed',reason:'Selected correction persisted.'},{destination_role:'application',status:'uncertain',reason:'Replacement response lost.',next_action:'Profile owner recovery; inspect destination without replay.'}];o.issues=['German version still states the earlier responsibility.'];
 const report=reportRefinement(r,o);assert.equal(report.application_complete,false);assert.equal(report.reusable_profile_changed,'yes');assert.equal(report.members[1].status,'needs_revision');assert.equal(report.profile_results[1].status,'uncertain');assert.equal(report.members[1].checks[0].result,'not_assessed');assert.deepEqual(report.issues,o.issues);
 // A stored verified flag cannot override current missing member observations.
 o.member_results=[];const withheld=reportRefinement(r,o);assert.ok(withheld.members.every(m=>m.status==='not_assessed'));assert.equal(withheld.application_complete,false);
});
test('an earlier revision uncertainty cannot disappear behind a selected verified revision',()=>{
 const {record:r,observations:o}=fixture(),earlier=clone(r.revisions[0]);earlier.id='earlier';earlier.members[0].status='uncertain';earlier.members[0].intent_ids=['original-intent'];earlier.members[0].next_action='Read-only owner recovery.';r.revisions.unshift(earlier);o.record=clone(r);
 const report=reportRefinement(r,o);assert.equal(report.members[0].status,'verified');assert.equal(report.application_complete,false);assert.deepEqual(report.pending_operations.documents[0].intent_ids,['original-intent']);assert.equal(report.pending_operations.documents[0].revision_id,'earlier');
});
test('reports bind exact revision/selection and retain stopped uncertainty and historical files',()=>{
 const {record:r,observations:o}=fixture();r.stop_state={state:'accepted',reason:'Fictional applicant accepts current scope.',pending_operation_refs:[ref('unresolved-intent')],last_confirmed_deliverables:[ref('earlier.docx')]};o.record=clone(r);o.checkpoint_status='unconfirmed';o.member_results[0].status='uncertain';o.member_results[0].next_action='Document owner recovery; inspect original intent.';o.profile_results=[{destination_role:'reusable',status:'uncertain',reason:'No current byte observation.'}];
 const report=reportRefinement(r,o);assert.equal(report.application_complete,false);assert.equal(report.reusable_profile_changed,'unknown');assert.deepEqual(report.pending_operation_refs,r.stop_state.pending_operation_refs);assert.equal(report.checkpoint_status,'unconfirmed');assert.equal(report.last_confirmed_deliverables[0].verification,'last_confirmed_then');
 o.record.selection.target_sha256=sha256('other');assert.equal(reportRefinement(r,o).state,'not_assessed');o.record=clone(r);o.strategy.binding.canonical_sha256=sha256('stale');assert.equal(reportRefinement(r,o).state,'not_assessed');
});
module.exports={fixture};
