'use strict';
const assert = require('node:assert/strict');
const {test,before} = require('node:test');
const {setup,load,sha256} = require('./manifest-fixture.cjs');
let foundation, inspect;
before(async () => { foundation = await setup(); inspect = load('application-documents.md',['inspectDocumentManifest']).inspectDocumentManifest; });
function fresh() { return {m:structuredClone(foundation.manifest),t:{...foundation.trusted, strategy:structuredClone(foundation.trusted.strategy), binding:structuredClone(foundation.trusted.binding),session:structuredClone(foundation.trusted.session),savedArtifacts:[],observations:[]}}; }
async function reject(change,code) { const {m,t}=fresh(); change(m,t); const findings=await inspect(m,t); assert.ok(findings.some(f=>f.code===code),JSON.stringify(findings)); assert.ok(findings.every(f=>Object.keys(f).sort().join(',')==='action,code,message,path')); }
test('exact shipped helper accepts fictional bilingual pairs without semantic approval',async()=>{const {m,t}=fresh(); assert.deepEqual(await inspect(m,t),[]);});
test('closed required schema rejects unknown fields and implicit missing values',async()=>{
  await reject(m=>{m.documents[0].surprise=true;},'schema_invalid');
  await reject(m=>{delete m.documents[0].session;},'schema_invalid');
});
test('independent binding and exact current snapshot reject cross-candidate and stale data',async()=>{
  await reject((m,t)=>{t.binding.canonical_sha256=sha256('another fictional candidate');},'binding_mismatch');
  await reject(m=>{m.strategy_sha256=sha256('old snapshot');},'strategy_mismatch');
  await reject(m=>{m.origin_strategy_sha256=sha256('invented origin');},'origin_mismatch');
  await reject((m,t)=>{t.strategy.settings.market='GB';},'strategy_mismatch');
  await reject((m,t)=>{delete t.binding;},'context_unavailable');
  await reject((m,t)=>{t.validate=async()=>({state:'not_assessed'});},'schema_unavailable');
});
test('requested members and private destinations are enforced',async()=>{
  await reject(m=>{m.documents[1].id=m.documents[0].id;},'duplicate_document');
  await reject(m=>{m.documents.push(structuredClone(m.documents[0]));m.documents.at(-1).id='another';},'duplicate_document');
  await reject(m=>{m.documents[0].market='GB';},'selection_mismatch');
  await reject(m=>{m.documents[0].destination='public/cv.docx';},'private_destination');
  await reject(m=>{m.documents.pop();},'missing_document');
  await reject((m,t)=>{t.strategy.settings.requested_documents=['cv'];t.strategy_sha256=t.fingerprint(t.strategy,t.sha256);m.strategy_sha256=t.strategy_sha256;},'selection_mismatch');
});
test('ranges use exact code points, remain disjoint, and preserve whole propositions',async()=>{
  await reject(m=>{m.documents[0].draft.sections[0].range.end++;},'range_mismatch');
  await reject(m=>{m.documents[1].draft.sections[0].range=structuredClone(m.documents[0].draft.sections[0].range);},'overlapping_range');
  await reject(m=>{const r=m.documents[0].draft.sections[0].range;r.start++;r.excerpt=Array.from(r.excerpt).slice(1).join('');},'partial_proposition');
  await reject(m=>{m.documents[0].draft.sha256=sha256('stale draft');},'draft_mismatch');
  await reject(m=>{m.documents[0].draft.language='de';},'draft_mismatch');
});
test('claim inventory and supported language are upstream authority',async()=>{
  await reject(m=>{m.documents[0].draft.sections[0].claims=[];},'claim_inventory');
  await reject(m=>{m.documents[0].draft.sections[0].claims[0].id='claim:invented';},'claim_inventory');
  await reject((m,t)=>{t.strategy.positioning.selected_claims[0].languages=['en'];t.strategy_sha256=t.fingerprint(t.strategy,t.sha256);m.strategy_sha256=t.strategy_sha256;},'unsupported_claim');
});
test('pending letter and unsupported language do not block another draft member',async()=>{
  const {m,t}=fresh(); const letter=m.documents[1]; letter.letter_inputs.recipient={value:null,confirmed:false,provenance:[],context_refs:[]};letter.letter_inputs.missing_required=['recipient'];letter.state='pending';letter.issues=['Recipient confirmation needed'];letter.draft=null;
  assert.deepEqual(await inspect(m,t),[]);
  letter.state='authored'; assert.ok((await inspect(m,t)).some(f=>f.code==='missing_inputs'));
  letter.state='pending';
  t.strategy.positioning.selected_claims[0].languages=['en'];
  t.strategy_sha256=t.fingerprint(t.strategy,t.sha256);m.strategy_sha256=t.strategy_sha256;
  for (const d of m.documents.filter(d=>d.language==='de')) {d.state='pending';d.issues=['German support pending'];d.draft=null;}
  assert.deepEqual(await inspect(m,t),[]);
});
test('unobserved saved artifacts and fabricated checked/delivered states fail closed',async()=>{
  await reject(m=>{m.documents[0].state='authored';},'session_unverified');
  await reject(m=>{m.documents[0].state='checked';},'checks_incomplete');
  await reject(m=>{m.documents[0].state='delivered';},'delivery_unverified');
  await reject(m=>{m.documents[0].session={document_id:'invented',connection_id:'fictional-connection',snapshot_id:'s1',snapshot_sha256:sha256('snapshot'),saved_path:m.documents[0].destination,saved_sha256:sha256('invented bytes')};},'session_unverified');
});
function observedMember(m,t) {
  // Synthetic observation inputs test identity comparison, not actual WordCraft acceptance.
  const d=m.documents[0], text=d.draft.sections[0].range.excerpt;
  d.session={document_id:d.id,connection_id:t.session.connection.id,snapshot_id:'fictional-snapshot',snapshot_sha256:sha256('fictional-snapshot'),saved_path:d.destination,saved_sha256:sha256('fictional-docx-bytes')};
  t.session.bindings=[{id:d.id,kind:d.kind,language:d.language,path:d.destination,connectionId:t.session.connection.id,currentSnapshotId:d.session.snapshot_id,nativeId:'fictional-native'}];
  t.session.snapshots=[{id:d.session.snapshot_id,documentId:d.id,connectionId:t.session.connection.id,fingerprint:d.session.snapshot_sha256,text,structure:[{part:'body',description:'Fictional body'}],selection:null,observedAt:'2026-01-03T12:00:00Z'}];
  t.savedArtifacts=[{...d.session,reopened:true,editable:true}];
  d.presentation.settings_sha256=sha256('fictional-applied-settings');
  d.anchors=[{section_id:d.draft.sections[0].id,part:'body',text,context:text,baseline_snapshot_id:d.session.snapshot_id,status:'mapped'}];
  d.checks=['content','reading_order','render','round_trip','pagination'].map(kind=>({id:'check-'+kind,kind,mandatory:true,scope:'whole_document',pages:[1],snapshot_sha256:d.session.snapshot_sha256,artifact_sha256:d.session.saved_sha256,status:'passed',producer:'fictional-observer',method:'Fictional identity test only',observed_at:'2026-01-03T12:00:00Z',evidence_reference:'fictional-private-evidence',reason:null}));
  t.observations=d.checks.map(check=>({document_id:d.id,check:structuredClone(check)}));
  return d;
}
test('observed states remain distinct and mandatory failures never deliver',async()=>{
  const {m,t}=fresh(), d=observedMember(m,t);
  for (const state of ['authored','checked','delivered']) {d.state=state;assert.deepEqual(await inspect(m,t),[]);}
  d.checks[0].status='failed';t.observations[0].check.status='failed';d.state='checked';assert.deepEqual(await inspect(m,t),[]);
  d.state='delivered';assert.ok((await inspect(m,t)).some(f=>f.code==='delivery_unverified'));
});
test('revision and anchors reject stale or forged observations',async()=>{
  for (const [change,code] of [
    [(d,t)=>{d.session.saved_sha256=sha256('forged bytes');},'saved_unverified'],
    [(d,t)=>{t.session.bindings[0].currentSnapshotId='new-snapshot';},'session_unverified'],
    [(d,t)=>{d.checks[0].artifact_sha256=sha256('old bytes');},'check_unverified'],
    [(d,t)=>{t.observations=[];},'check_unverified'],
    [(d,t)=>{d.anchors[0].baseline_snapshot_id='old-snapshot';},'anchor_stale'],
    [(d,t)=>{t.session.snapshots[0].text+='\n'+d.anchors[0].text;},'anchor_stale'],
    [(d,t)=>{d.anchors=[];},'delivery_unverified']
  ]) {const {m,t}=fresh(),d=observedMember(m,t);d.state='delivered';change(d,t);assert.ok((await inspect(m,t)).some(f=>f.code===code),code);}
});
test('CV-only selection is accepted and technical anchors cannot enter emitted text',async()=>{
  const {m,t}=fresh();t.strategy.settings.requested_documents=['cv'];t.strategy.binding.settings_sha256=t.fingerprint(t.strategy.settings,t.sha256);t.binding=structuredClone(t.strategy.binding);m.binding=structuredClone(t.binding);t.strategy_sha256=t.fingerprint(t.strategy,t.sha256);m.strategy_sha256=t.strategy_sha256;m.documents=m.documents.filter(d=>d.kind==='cv');
  const bound=await foundation.reselect(t.strategy.settings);assert.equal(bound.status,'ready');
  t.binding=bound.value.binding;t.strategy.binding=t.binding;t.strategy.dispositions.forEach(d=>d.binding=structuredClone(t.binding));m.binding=t.binding;t.strategy_sha256=t.fingerprint(t.strategy,t.sha256);m.strategy_sha256=t.strategy_sha256;
  assert.deepEqual(await inspect(m,t),[]);
  const d=observedMember(m,t);d.draft.sections[0].id=d.draft.sections[0].range.excerpt;d.anchors[0].section_id=d.draft.sections[0].id;
  assert.ok((await inspect(m,t)).some(f=>f.code==='anchor_leak'));
  await foundation.reselect();
});
test('astral characters use code-point offsets rather than UTF-16 positions',async()=>{
  const {m,t}=fresh(),version=t.strategy.draft.versions[0];version.text='📦 '+version.text;version.sha256=sha256(version.text);
  for (const span of version.claims[0].spans) {span.start+=2;span.end+=2;}
  t.strategy.claims[0].realizations[0].spans=structuredClone(version.claims[0].spans);
  t.strategy.findings[0].draft_span.span=structuredClone(version.claims[0].spans[0]);
  for (const d of m.documents.filter(d=>d.language===version.language)) {d.draft.sha256=version.sha256;d.draft.sections[0].range.start+=2;d.draft.sections[0].range.end+=2;}
  t.strategy_sha256=t.fingerprint(t.strategy,t.sha256);m.strategy_sha256=t.strategy_sha256;
  assert.deepEqual(await inspect(m,t),[]);
  m.documents[0].draft.sections[0].range.start++;
  assert.ok((await inspect(m,t)).some(f=>f.code==='range_mismatch'));
});
test('validated needs_revision scopes blocking findings to affected wording and language',async()=>{
  const {m,t}=fresh();
  const {inspectStrategy}=load('strategy-contract.md',['inspectStrategy']);
  t.strategy.state='needs_revision';
  t.strategy.positioning.selected_claims[0].languages=['en'];
  t.strategy.claims[0].realizations.find(r=>r.language==='de').semantic_state='unsupported';
  for (const d of m.documents.filter(d=>d.language==='de')) {d.state='pending';d.issues=['German wording needs revision'];d.draft=null;}
  const finding=t.strategy.findings[0];
  finding.severity='blocking';finding.status='failed';
  finding.draft_span={language:'de',span:structuredClone(t.strategy.draft.versions.find(v=>v.language==='de').claims[0].spans[0])};
  async function checkCurrent() {
    const upstream=await inspectStrategy(t.strategy,{...foundation.sources,profile:foundation.base.profile,binding:t.binding,sha256:t.sha256,validate:t.validate});
    assert.equal(upstream.schema,'passed');assert.equal(upstream.deterministic,'passed',JSON.stringify(upstream.findings));
    t.strategy_sha256=t.fingerprint(t.strategy,t.sha256);m.strategy_sha256=t.strategy_sha256;
    return inspect(m,t);
  }
  assert.deepEqual(await checkCurrent(),[],'German revision must not block supported English');
  finding.draft_span={language:'en',span:structuredClone(m.documents[0].draft.sections[0].range)};
  let findings=await checkCurrent();
  assert.deepEqual(findings.filter(f=>f.code==='upstream_not_ready').map(f=>f.path),['/documents/0/state'],'Exact English CV finding must not block the letter range');
  finding.draft_span=null;
  findings=await checkCurrent();
  assert.deepEqual(findings.filter(f=>f.code==='upstream_not_ready').map(f=>f.path),['/documents/0/state','/documents/1/state'],'Unscoped claim finding blocks both emitted occurrences');
  finding.claims=[];finding.criteria=[];
  findings=await checkCurrent();
  assert.deepEqual(findings.filter(f=>f.code==='upstream_not_ready').map(f=>f.path),['/documents/0/state','/documents/1/state'],'Whole-handoff blocking finding remains blocking');
  finding.status='passed';assert.deepEqual(await checkCurrent(),[]);
});
