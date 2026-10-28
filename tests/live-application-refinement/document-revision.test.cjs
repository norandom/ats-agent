
'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {setup,load}=require('../wordcraft-application-documents/manifest-fixture.cjs');
const {proposeDocumentRevision,inspectDocumentManifest}=load('application-documents.md',['proposeDocumentRevision','inspectDocumentManifest']);
async function fixture(){
 const f=await setup(),previous=structuredClone(f.manifest),next=structuredClone(f.manifest),t=f.trusted;
 const d=previous.documents[0],snapshot={id:'fresh-snapshot',documentId:'logical-cv',connectionId:t.session.connection.id,fingerprint:t.sha256('fresh snapshot'),text:d.draft.sections[0].range.excerpt,structure:[{part:'body'}]};
 d.session={document_id:snapshot.documentId,connection_id:snapshot.connectionId,snapshot_id:'previous-snapshot',snapshot_sha256:t.sha256('previous snapshot'),saved_path:d.destination,saved_sha256:t.sha256('previous bytes')};d.state='authored';
 t.session.bindings=[{id:snapshot.documentId,kind:d.kind,language:d.language,path:d.destination,connectionId:snapshot.connectionId,currentSnapshotId:snapshot.id}];t.session.snapshots=[snapshot];
 return {previous,next,t:{...t,previousManifest:previous,previous_manifest_sha256:t.fingerprint(previous,t.sha256)}};
}
test('current supported revision preserves identity and resets checks',async()=>{
 const {previous,next,t}=await fixture();const result=await proposeDocumentRevision(previous,next,t);
 assert.equal(result.decision,'revise',result.reason);
 assert.equal(result.proposal.documents[0].session.document_id,'logical-cv');
 assert.equal(result.proposal.documents[0].destination,previous.documents[0].destination);
 assert.deepEqual(result.proposal.documents[0].checks,[]);
 assert.equal(result.proposal.predecessor_manifest_sha256,t.previous_manifest_sha256);
 assert.deepEqual(await inspectDocumentManifest(result.proposal,t),[]);
 for(const change of [v=>v.documents[0].destination+='-other',v=>v.documents[0].draft.sha256=t.sha256('stale')]){
  const bad=structuredClone(next);change(bad);assert.equal((await proposeDocumentRevision(previous,bad,t)).decision,'blocked');
 }

 const original=structuredClone(previous),forged=structuredClone(previous);forged.origin_strategy_sha256=t.sha256('forged');
 assert.equal((await proposeDocumentRevision(forged,next,t)).decision,'blocked');
 assert.deepEqual(previous,original,'predecessor remains unchanged');
 const stale=structuredClone(result.proposal);stale.documents[0].session.document_id='another-document';
 assert.ok((await inspectDocumentManifest(stale,t)).some(f=>f.code==='revision_identity'));
 const pending=structuredClone(next);pending.documents[1].draft=null;pending.documents[1].issues=['Letter metadata and manual factual support await review'];
 const partial=await proposeDocumentRevision(previous,pending,t);assert.equal(partial.decision,'revise',partial.reason);assert.equal(partial.proposal.documents[1].state,'pending');assert.equal(partial.proposal.documents[0].state,'draft');
 const oldCheck={id:'old-check',kind:'content',mandatory:true,scope:'whole_document',pages:[1],snapshot_sha256:t.sha256('old'),artifact_sha256:t.sha256('old'),status:'passed',producer:'fictional',method:'old inspection',observed_at:'2026-01-03T12:00:00Z',evidence_reference:'fictional-old',reason:null};
 previous.documents[0].checks=[oldCheck];t.previous_manifest_sha256=t.fingerprint(previous,t.sha256);const copied=await proposeDocumentRevision(previous,next,t);assert.equal(copied.decision,'revise');assert.deepEqual(copied.proposal.documents[0].checks,[]);copied.proposal.documents[0].checks=[oldCheck];assert.ok((await inspectDocumentManifest(copied.proposal,t)).some(f=>f.code==='copied_check'));
 const manual=structuredClone(result.proposal);manual.documents[0].state='delivered';t.session.snapshots[0].text+='\nUnsupported fictional authority claim';
 // Other delivery guards also fail; this assertion specifically proves preserved manual text cannot escape the reviewed inventory.
 t.previous_manifest_sha256=manual.predecessor_manifest_sha256;t.previousManifest=original;
 assert.ok((await inspectDocumentManifest(manual,t)).some(f=>f.code==='preserved_content_unmapped'));
 t.previousManifest=previous;t.previous_manifest_sha256=t.fingerprint(previous,t.sha256);
 const other=structuredClone(previous);other.binding.application_id='other-fictional-application';const otherTrusted={...t,previousManifest:other,previous_manifest_sha256:t.fingerprint(other,t.sha256)};assert.equal((await proposeDocumentRevision(other,next,otherTrusted)).decision,'blocked');
 const foreignConsumer=structuredClone(result.proposal);foreignConsumer.predecessor_manifest_sha256=otherTrusted.previous_manifest_sha256;
 assert.ok((await inspectDocumentManifest(foreignConsumer,otherTrusted)).some(f=>f.code==='predecessor_application'),'direct consumer must reject an independently retained foreign-application predecessor');
 t.session.snapshots=[];assert.equal((await proposeDocumentRevision(previous,next,t)).decision,'blocked');
});
