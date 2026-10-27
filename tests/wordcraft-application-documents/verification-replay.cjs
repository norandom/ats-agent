'use strict';
// Archived actual evidence replay. No WordCraft calls or fabricated current session IDs.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {sha256}=require('./foundation.cjs'),{checklist}=require('./letter-check.cjs');
function replay(cvPath,letterPath){
 if(!cvPath||!letterPath)throw Error('Both actual receipt paths required; offline tests are not actual acceptance');
 const documents=[];let renderedPages=0,checklistRows=0;
 for(const [filename,kind] of [[cvPath,'cv'],[letterPath,'cover_letter']]){
  const receiptBytes=fs.readFileSync(filename),r=JSON.parse(receiptBytes),root=path.dirname(filename);
  assert.equal(r.kind,kind==='cv'?'actual_desktop_cv_presentation':'actual_desktop_germany_letters');assert.ok(!r.error);
  assert.equal(r.stages.length,kind==='cv'?3:2);
  for(const s of r.stages){
   const artifactHash=sha256(fs.readFileSync(s.artifact));assert.equal(artifactHash,s.sha256);assert.equal(s.reopened,true);assert.equal(s.artifactStable,true);
   const snap=kind==='cv'?JSON.parse(fs.readFileSync(path.join(root,s.name+'.json'))):{text:s.text,structure:s.structure,paragraphs:s.paragraphs};
   assert.equal(sha256(JSON.stringify(snap)),s.snapshotSha256);
   const expected=kind==='cv'?s.source.paragraphs.map(p=>p.text).join('\n'):s.expected;
   assert.equal(snap.text.text,expected);
   const count=kind==='cv'?s.pages:s.structure.pages;
   const renders=kind==='cv'?s.rendered.map(page=>({page,path:path.join(root,`${s.name}-${page}.png`),sha256:s.renderHashes[page]})):s.rendered;
   assert.deepEqual(renders.map(p=>p.page),Array.from({length:count},(_,i)=>i+1));
   for(const page of renders)assert.equal(sha256(fs.readFileSync(page.path)),page.sha256);
   assert.equal(s.visualReview,'passed');assert.ok(kind==='cv'?s.visualObservation?.findings:s.visualReviewDetail);
   if(kind==='cv'){
    assert.deepEqual(snap.footerFields.map(f=>f.instr),['PAGE','NUMPAGES']);
    assert.ok(snap.footerFields.every(f=>Number.isInteger(f.pos?.story?.part)));
    assert.deepEqual(s.paragraphs.map(p=>p.paragraph.text),s.source.paragraphs.map(p=>p.text));
   }
   const rows=kind==='cover_letter'?checklist(s):[];
   assert.ok(rows.every(row=>row.status==='passed'&&row.measured!=null&&row.source_url&&row.edition));
   if(kind==='cover_letter')assert.equal(rows.length,7);
   const checks=[];
   const add=(check,status,reason,pages=[])=>checks.push({id:`${s.name||s.language}:${check}`,kind:check,mandatory:true,scope:'archived receipt',pages,snapshot_sha256:s.snapshotSha256,artifact_sha256:artifactHash,status,producer:'actual WordCraft receipt replay',method:'read recorded observations; rehash current artifact and evidence bytes',observed_at:r.finishedAt,evidence_reference:filename,reason});
   add('content','passed','Exact recorded body compared with selected composition.');
   add('render','passed','All hash-matched pages have the recorded visual review.',renders.map(p=>p.page));
   add('reading_order','not_assessed','Recorded paragraph sequence available; complete semantic association review is not recorded separately.');
   if(kind==='cv')add('pagination','not_assessed','Actual footer field objects and qualitative visual review retained; explicit per-page displayed-value records unavailable.',renders.map(p=>p.page));
   else add('letter_layout','passed','All seven measured sourced project rows pass; full DIN conformity not assessed.',[1]);
   documents.push({artifact:s.artifact,artifact_sha256:artifactHash,receipt_sha256:sha256(receiptBytes),checks,currentRevision:'not_assessed',reason:'Archived evidence does not supply a fresh post-inspection session snapshot. No current-session identity invented.'});
   renderedPages+=count;checklistRows+=rows.length;
   assert.equal(sha256(fs.readFileSync(s.artifact)),artifactHash);
  }
 }
 return {mode:'actual-evidence-replay',documents,renderedPages,checklistRows};
}
module.exports={replay};
function replayCurrent(filename){
 if(!filename)throw Error('Fresh current-session receipt required');
 const {load}=require('./manifest-fixture.cjs'),{stableSerialize}=load('strategy-contract.md',['stableSerialize']);
 const {verifyObservedDocument}=load('document-verification.md',['verifyObservedDocument']);
 const r=JSON.parse(fs.readFileSync(filename)),review=JSON.parse(fs.readFileSync(path.join(path.dirname(filename),'review.json')));
 assert.equal(r.status,'passed');assert.equal(review.receipt_sha256,sha256(fs.readFileSync(filename)));
 assert.equal(r.openReceipt.path,r.artifact);assert.equal(r.finalUI.dirty,false);
 assert.equal(stableSerialize(r.before),stableSerialize(r.after));assert.equal(r.snapshotSha256,sha256(stableSerialize(r.after)));
 assert.equal(r.bytesBefore,r.bytesAfter);assert.equal(sha256(fs.readFileSync(r.artifact)),r.bytesAfter);
 const opened=r.calls.findIndex(c=>c.name==='open_document');assert.ok(opened>=0);
 assert.ok(r.calls.slice(opened+1).every(c=>['get_text','inspect_document','render_page','ui_inspect'].includes(c.name)));
 const session={document_id:'host-letter-de-verification',connection_id:'host-verification-connection',snapshot_id:'host-verification-snapshot',snapshot_sha256:r.snapshotSha256,saved_path:r.artifact,saved_sha256:r.bytesAfter};
 const entry={id:'letter-de',kind:'cover_letter',language:'de',market:'DE',session};
 const renders=r.renders.map(p=>{assert.equal(sha256(fs.readFileSync(p.path)),p.sha256);return {page:p.page,accessible:true,evidence_reference:p.path,status:review.visual.status};});
 return verifyObservedDocument(entry,{before:session,after:session,bytesBefore:r.bytesBefore,bytesAfter:r.bytesAfter,reopened:true,editable:r.after.structure.blocks.every(b=>b.type==='paragraph'),continuity:true,accessible:true,evidence_reference:filename,producer:'host read-only WordCraft verification',method:'confirmed reopen; exact MCP text/structure before and after all-page render; byte hashing',observed_at:r.finishedAt,reviewedText:review.reviewedText,bodyText:r.after.text.text,structure:r.after.structure,readingOrder:review.readingOrder,pageCount:r.after.structure.pages,renders,semanticReview:review.semanticReview},stableSerialize);
}
module.exports.replayCurrent=replayCurrent;
if(require.main===module){try{const result=replay(process.argv[2],process.argv[3]);if(process.argv[4])fs.writeFileSync(process.argv[4],JSON.stringify(result,null,2));console.log(JSON.stringify({mode:result.mode,documents:result.documents.length,renderedPages:result.renderedPages,checklistRows:result.checklistRows,currentSessionVerification:'not_assessed'}));}catch(e){console.error(e.message);process.exitCode=1;}}
