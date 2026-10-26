const test=require('node:test'),assert=require('node:assert/strict');
const {checkReceipt}=require('./formatting-probe.cjs');
test('probe gate refuses command-only geometry, missing page coverage and static fields',()=>{
 const r={originalRestored:true,originalBytesUnchanged:true,stages:[{name:'single',pages:1,rendered:[1],fieldCodes:['PAGE','NUMPAGES'],textExact:true,reopened:true},{name:'multiple',pages:2,rendered:[1,2],fieldCodes:['PAGE','NUMPAGES'],textExact:true,reopened:true}],geometry:{status:'not_assessed',reason:'No region bounds'},visualReview:'not_assessed'};
 assert.equal(checkReceipt(r).status,'pending');
 r.geometry.status='passed'; r.visualReview='passed';assert.equal(checkReceipt(r).status,'passed');
 r.stages[1].rendered=[1];assert.equal(checkReceipt(r).status,'pending');r.stages[1].rendered=[1,2];
 r.stages[1].fieldCodes=[];assert.equal(checkReceipt(r).status,'pending');r.stages[1].fieldCodes=['PAGE','NUMPAGES'];
 r.originalBytesUnchanged=false;assert.equal(checkReceipt(r).status,'pending');
});
