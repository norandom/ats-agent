'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const foundation=require('./foundation.cjs');
const root=path.resolve(__dirname,'../..'),manifest=require('./manifest.json');
test('explicit closure and all 44 planned criteria validate without claiming live acceptance',()=>{
 const result=foundation.validateFoundation(root,manifest);assert.equal(result.status,'passed');assert.equal(result.core_count,31);assert.equal(result.criteria_count,44);assert.equal(result.installed_acceptance,'not_assessed');
 assert.ok(manifest.coverage.every(r=>r.status==='not_assessed'));assert.deepEqual(manifest.observation_classes,['actual','control','host_judgment']);
 assert.ok(manifest.regressions.some(r=>r.entrypoint==='tests/live-application-refinement/full-acceptance.cjs'&&r.required_inputs.length===3));
});
test('missing criterion or required core resource is rejected',()=>{
 for(const change of [m=>m.coverage.pop(),m=>m.core.pop(),m=>m.maintenance.pop()]){const m=structuredClone(manifest);change(m);assert.throws(()=>foundation.validateFoundation(root,m));}
});
test('private, absolute, traversal, duplicate and redirected closure assets are rejected',()=>{
 for(const value of ['private/facts.json','outputs/log.json','.env','C:/secrets.json','../outside','tests/portable-skill-release/../private.json',manifest.maintenance[0]]){
 const m=structuredClone(manifest);m.maintenance.push(value);assert.throws(()=>foundation.validateFoundation(root,m));if(value!==manifest.maintenance[0])assert.throws(()=>foundation.checkRegularFile(root,value));}
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'release-foundation-'));const target=path.join(temp,'target');fs.mkdirSync(target);const link=path.join(temp,'link');fs.symlinkSync(target,link,process.platform==='win32'?'junction':'dir');assert.throws(()=>foundation.checkRegularFile(temp,'link/file.cjs'),/redirect|link/i);
});
test('altered core bytes fail against the captured baseline',()=>{
 const m=structuredClone(manifest);m.core[0].sha256='0'.repeat(64);assert.throws(()=>foundation.validateFoundation(root,m),/core|hash/i);
});
test('prerequisite results separate actual availability from baseline compatibility',()=>{
 const run=(command,args)=> command==='node'?{status:0,stdout:'v24.22.1\n'}:(command==='pnpm'||command==='pnpm.exe')?{status:0,stdout:'10.18.3\n'}:command==='uvx'?{status:0,stdout:args.includes('--from')?'check-jsonschema, version 0.38.2\n':'uvx 0.13.5\n'}:{status:null,error:{code:'ENOENT'}};
 const report=foundation.probePrerequisites(run);assert.equal(report.observation_class,'actual');assert.equal(report.installed_acceptance,'not_assessed');
 assert.equal(report.checks.find(r=>r.id==='node').baseline_match,false);assert.equal(report.checks.find(r=>r.id==='pnpm').baseline_match,true);assert.equal(report.checks.find(r=>r.id==='validator').status,'passed');assert.equal(report.checks.find(r=>r.id==='zip').status,'not_assessed');
 assert.ok(report.checks.every(r=>!('stdout' in r)&&!('stderr' in r)));
});

