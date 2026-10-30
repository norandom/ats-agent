'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{execFileSync}=require('node:child_process');
const gate=require('../../release/retirement.cjs');
const root=path.resolve(__dirname,'../..');
test('approved retirement plan names exactly eight tracked legacy files and bounded documentation updates',()=>{
 const plan=JSON.parse(fs.readFileSync(path.join(root,'release/retirement.json')));assert.equal(gate.validatePlan(plan).status,'passed');assert.equal(plan.remove.length,8);assert.equal(plan.update.length,5);
 for(const mutate of [p=>p.approved=true,p=>p.remove.push('private/facts.json'),p=>p.remove.push('.env'),p=>p.update.push('README.md'),p=>p.recovery_policy='reset-hard',p=>p.accepted_a={status:'ready'}]){const p=structuredClone(plan);mutate(p);assert.equal(gate.validatePlan(p).status,'failed');}
});
test('retirement never accepts imported ready reports or bare approval flags and has no mutation authority',()=>{
 for(const accepted of [undefined,{status:'ready'},{approved:true},{candidate:{prepared:{root}},ready:true}]){const r=gate.checkRetirement(undefined,accepted,undefined);assert.notEqual(r.status,'passed');assert.equal(r.mutation_authority,false);assert.equal(r.execution,'not_assessed');}
});
function fixture(t,retainedSource){const repo=fs.mkdtempSync(path.join(os.tmpdir(),'retirement-control-'));t.after(()=>{assert.ok(repo.startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(repo,{recursive:true,force:true});});const git=(...a)=>execFileSync('git',a,{cwd:repo,encoding:'utf8',stdio:['pipe','pipe','pipe']}).trim();git('init','--quiet');git('config','core.autocrlf','false');const put=(f,s)=>{fs.mkdirSync(path.dirname(path.join(repo,f)),{recursive:true});fs.writeFileSync(path.join(repo,f),s);};for(const f of gate.approvedPlan.remove)put(f,'# Wholly fictional legacy fixture\n');for(const f of gate.approvedPlan.update)put(f,'Legacy fixture documentation\n');put('release/retirement.json',JSON.stringify(gate.approvedPlan,null,2)+'\n');put('generic.cjs','// Generic fixture\n');const commit=()=>{git('add','.');git('-c','commit.gpgsign=false','-c','user.name=Fictional fixture','-c','user.email=fixture@example.invalid','commit','--quiet','-m','Fictional control');return git('rev-parse','HEAD');};if(retainedSource!==undefined)put('retained.py',retainedSource);const a=commit();assert.equal(gate.approvedPlan.remove.length,8);assert.equal(git('ls-files','--',...gate.approvedPlan.remove).split('\n').length,8);return {repo,git,put,commit,a};}
test('source policy permits report-only commits after A but rejects changed generic or legacy ownership',t=>{
 const f=fixture(t),selected=[{path:'generic.cjs',size:19,sha256:gate.hash(Buffer.from('// Generic fixture\n'))}];
 assert.equal(gate.verifySourceScope({root:f.repo,currentRevision:f.a,acceptedRevision:f.a,buildInputs:selected,phase:'before-removal'}).status,'passed');
 f.put('.kiro/specs/portable-skill-release/group-6-validation.md','Report only\n');const next=f.commit();assert.notEqual(next,f.a);assert.equal(gate.verifySourceScope({root:f.repo,currentRevision:next,acceptedRevision:f.a,buildInputs:selected,phase:'before-removal'}).status,'passed');
 f.put('generic.cjs','// Changed generic fixture\n');const changed=f.commit();assert.equal(gate.verifySourceScope({root:f.repo,currentRevision:changed,acceptedRevision:f.a,buildInputs:selected,phase:'before-removal'}).status,'failed');
});
test('source policy rejects untracked/changed legacy files and consumers outside the removal inventory',t=>{
 const f=fixture(t);f.put('consumer.py','import ats_agent\n');const rev=f.commit();assert.equal(gate.verifySourceScope({root:f.repo,currentRevision:rev,acceptedRevision:f.a,buildInputs:[],phase:'before-removal'}).status,'failed');
});
test('conservative ownership screen rejects comma, multiline and dynamic legacy references',async t=>{
 for(const source of ['import os, ats_agent\n','from cv_parser import (\n    CVParser\n)\n','module = __import__("ats_agent")\n','# An ambiguous ats_agent ownership mention needs review.\n'])await t.test(source.startsWith('#')?'ambiguous mention':source.split('\n')[0],child=>{const f=fixture(child,source);const revision=f.a;assert.equal(gate.verifySourceScope({root:f.repo,currentRevision:revision,acceptedRevision:f.a,buildInputs:[],phase:'before-removal'}).status,'failed');});
});
test('payload checkout bytes are exact while maintenance CRLF transport remains permitted',t=>{
 const f=fixture(t),bytes=Buffer.from('// Generic fixture\n'),buildInputs=[{path:'generic.cjs',size:bytes.length,sha256:gate.hash(bytes)}];f.put('generic.cjs','// Generic fixture\r\n');
 const options={root:f.repo,currentRevision:f.a,acceptedRevision:f.a,buildInputs,phase:'before-removal'};assert.equal(gate.verifySourceScope(options).status,'passed');assert.equal(gate.verifySourceScope({...options,payloadPaths:['generic.cjs']}).status,'failed');
});
test('intervening new code outside the approved generic closure cannot masquerade as a report-only commit',t=>{
 const f=fixture(t);f.put('new-tool.cjs','// A new unreviewed legacy caller outside the accepted generic closure.\n');const currentRevision=f.commit();assert.equal(gate.verifySourceScope({root:f.repo,currentRevision,acceptedRevision:f.a,buildInputs:[],phase:'before-removal'}).status,'failed');
});
test('retirement completion requires exact dedicated diff, fresh B and pre-removal recovery revision',()=>{
 assert.throws(()=>gate.validateAttempt({schema_version:'1.1',kind:'retirement-attempt',approved:true}));
 const r=gate.checkRetirement({path:path.join(root,'release/retirement.json'),expected_sha256:gate.hash(fs.readFileSync(path.join(root,'release/retirement.json')))},undefined,{root,currentRevision:'a'.repeat(40),attempt:{}});assert.notEqual(r.status,'passed');assert.equal(r.mutation_authority,false);
});
test('dedicated retirement diff accepts only eight deletions and all five active documentation changes',t=>{
 const f=fixture(t);for(const file of gate.approvedPlan.remove)fs.unlinkSync(path.join(f.repo,file));for(const file of gate.approvedPlan.update)f.put(file,'Supported skill workflow. Historical recovery remains traceable.\n');const b=f.commit(),digest=gate.hash(execFileSync('git',['diff','--binary','--no-ext-diff',f.a,b,'--'],{cwd:f.repo})),options={root:f.repo,recoveryRevision:f.a,retirementRevision:b,currentRevision:b,acceptedRevision:f.a,expectedDiffSha256:digest};assert.equal(gate.verifyDedicatedChange(options).status,'passed');assert.equal(gate.verifySourceScope({root:f.repo,currentRevision:b,acceptedRevision:f.a,buildInputs:[],phase:'after-removal'}).status,'passed');
 assert.equal(gate.verifyDedicatedChange({...options,expectedDiffSha256:'f'.repeat(64)}).status,'failed');f.put('docs/legacy-cli.md','Uncommitted overwrite hazard\n');assert.equal(gate.verifyDedicatedChange(options).status,'failed');
});
test('scope expansion and omitted documentation changes cannot pass dedicated retirement controls',t=>{
 const f=fixture(t);for(const file of gate.approvedPlan.remove)fs.unlinkSync(path.join(f.repo,file));for(const file of gate.approvedPlan.update.slice(1))f.put(file,'Updated fictional documentation\n');f.put('extra.cjs','// Expanded scope\n');const b=f.commit(),digest=gate.hash(execFileSync('git',['diff','--binary','--no-ext-diff',f.a,b,'--'],{cwd:f.repo}));assert.equal(gate.verifyDedicatedChange({root:f.repo,recoveryRevision:f.a,retirementRevision:b,currentRevision:b,acceptedRevision:f.a,expectedDiffSha256:digest}).status,'failed');
});
test('frozen B lineage permits only current descendant metadata HEAD with exact current generic bytes',t=>{
 const f=fixture(t);for(const file of gate.approvedPlan.remove)fs.unlinkSync(path.join(f.repo,file));for(const file of gate.approvedPlan.update)f.put(file,'Supported workflow with retained recovery reference.\n');const b=f.commit(),bytes=Buffer.from('// Generic fixture\n'),buildInputs=[{path:'generic.cjs',size:bytes.length,sha256:gate.hash(bytes)}];
 f.put('.kiro/specs/portable-skill-release/group-7-validation.md','Later completion metadata only.\n');const current=f.commit();assert.notEqual(current,b);assert.equal(gate.verifyBLineage({root:f.repo,currentRevision:current,sourceRevision:b,retirementRevision:b}).status,'passed');assert.equal(gate.verifySourceScope({root:f.repo,currentRevision:current,acceptedRevision:f.a,buildInputs,phase:'after-removal'}).status,'passed');
 assert.equal(gate.verifyBLineage({root:f.repo,currentRevision:current,sourceRevision:f.a,retirementRevision:b}).status,'failed');assert.equal(gate.verifyBLineage({root:f.repo,currentRevision:b,sourceRevision:current,retirementRevision:b}).status,'failed');assert.equal(gate.verifyBLineage({root:f.repo,currentRevision:current,sourceRevision:'f'.repeat(40),retirementRevision:b}).status,'failed');f.put('generic.cjs','// Unrelated changed generic code\n');const changed=f.commit();assert.equal(gate.verifySourceScope({root:f.repo,currentRevision:changed,acceptedRevision:f.a,buildInputs,phase:'after-removal'}).status,'failed');
});
