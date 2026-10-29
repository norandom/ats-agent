'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {checkRecoveryEvidence,checkControlsEvidence}=require('./recovery-evidence.cjs');
test('actual recovery evidence is mandatory, with no fixture fallback',()=>{
 for(const r of [null,{}, {kind:'simulated-recovery'}, {kind:'actual-interrupted-refinement',calls:[]}])assert.throws(()=>checkRecoveryEvidence(r));
});
test('selected actual interruption receipt passes the current evidence gate',{skip:!process.env.M4_RECOVERY_RECEIPT&&'Set M4_RECOVERY_RECEIPT; fixture checks cannot supply actual interruption evidence.'},()=>{
 const file=process.env.M4_RECOVERY_RECEIPT;
 const r=JSON.parse(require('node:fs').readFileSync(file));
 assert.equal(checkRecoveryEvidence(r).state,'passed');
 for(const mutate of [x=>x.interruption.cliExited=false,x=>x.interruption.acknowledged=true,x=>x.recovery.decision='uncertain',x=>x.calls.push({...x.calls.find(c=>c.name==='type_text'),phase:'recovery'}),x=>x.runtimeHashes['SKILL.md']='0'.repeat(64),x=>x.blocked.splice(0),x=>x.stop.questionsAfter=1,x=>x.intent.sha256='0'.repeat(64),x=>x.checkpoints.splice(1,1),x=>x.recoveryInput.current.parts[0].text='different source']){const copy=structuredClone(r);mutate(copy);assert.throws(()=>checkRecoveryEvidence(copy));}
});
test('adverse controls retain their separate labels and required owner outcomes',{skip:!process.env.M4_RECOVERY_CONTROLS&&'Set M4_RECOVERY_CONTROLS; deterministic controls are a separate receipt.'},()=>{
 const t=JSON.parse(require('node:fs').readFileSync(process.env.M4_RECOVERY_CONTROLS));assert.equal(checkControlsEvidence(t).state,'passed');
 for(const mutate of [x=>x.kind='actual-interrupted-refinement',x=>x.controls.splice(0,1),x=>x.controls.find(c=>c.name==='absent whole inspected effect').permission_to_retry=true,x=>x.controls.find(c=>c.name==='other application').dispatches=1]){const copy=structuredClone(t);mutate(copy);assert.throws(()=>checkControlsEvidence(copy));}
});
