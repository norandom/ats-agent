'use strict';
// Acceptance orchestration only. All behavioral assertions remain in their owning suites.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const hash=b=>require('node:crypto').createHash('sha256').update(b).digest('hex');
const root=path.resolve(__dirname,'../..'),prefix='tests/targeted-application-strategy/';
const suites=['foundation','contracts','context','application-context','host-context','context-review','offer','evidence','questions','composition','methods','diagnostics','editorial-review','comparison','integration','semantic-acceptance','full-acceptance'].map(s=>s+'.test.cjs').concat(['context','contracts','composition','languages','consumer','integration','acceptance'].map(s=>'../wordcraft-application-documents/'+s+'.test.cjs'));
const runtime=['references/candidate-profile.md','references/profile-contract.md','references/profile-validation.md','references/profile-updates.md','references/strategy-contract.md','references/application-strategy.md','references/strategy-evidence.md','references/strategy-editorial.md','references/strategy-review.md','schemas/cv-facts.schema.json','schemas/cv-facts-v1.schema.json','schemas/application-strategy.schema.json','templates/cv-facts.blank.json','SKILL.md','schemas/application-strategy-v1.schema.json','schemas/application-documents.schema.json','schemas/application-documents-v1.schema.json','schemas/document-session.schema.json','references/application-documents.md','references/document-presentation.md','references/document-verification.md','references/germany-cover-letter.md','references/document-session.md','references/wordcraft-operations.md','references/wordcraft-capabilities.md'];
const support=['foundation.cjs','fixtures.cjs','contract-fixture.cjs','contract-fixture-v1.cjs','offer-cases.cjs','persistence-adapter.cjs','full-acceptance.cjs','acceptance-coverage.json','semantic-cases/run.cjs','semantic-cases/inputs.json','semantic-cases/context-review-v1.1.md','semantic-cases/host-review-v1.1.json','semantic-cases/observed-v1.1.json'];
const upstream=['foundation.cjs','persistence.test.cjs','acceptance-evidence.cjs','fixtures/populated.cjs'];
const documents=['foundation.cjs','fixtures.json','manifest-fixture.cjs','composition-cases.json','language-pair-cases.json','integration-fixture.cjs','acceptance-check.cjs','acceptance-upstream.cjs','acceptance-fixture.cjs','letter-check.cjs','letter-fixture.cjs'];
const allowlist=[...runtime.map(p=>'skills/targeted-cv/'+p),...suites.map(p=>prefix+p),...support.map(p=>prefix+p),...upstream.map(p=>'tests/portable-candidate-profile/'+p),...documents.map(p=>'tests/wordcraft-application-documents/'+p),'tests/wordcraft-document-session/foundation.cjs'].map(p=>p.replace('targeted-application-strategy/../',''));
const coverage=require('./acceptance-coverage.json');
function verifyManifest(directory,manifest){for(const [file,digest] of Object.entries(manifest)){assert.ok(fs.existsSync(path.join(directory,file)),`missing asset ${file}`);assert.equal(hash(fs.readFileSync(path.join(directory,file))),digest,`hash mismatch ${file}`);}}
function checkResults(results,mode){
 assert.ok(mode==='full'||mode==='smoke','explicit full or smoke mode required');
 const expected=mode==='full'?suites:['integration.test.cjs'];
 const actual=results.map(r=>r.suite);
 assert.equal(new Set(actual).size,actual.length,'duplicate suite result');
 assert.deepEqual([...actual].sort(),[...expected].sort(),'missing or unexpected suite result');
 for(const r of results)assert.equal(r.exit_code,0,`failed suite ${r.suite}`);
}
function checkCoverage(rows,results){const expected=[8,5,7,6,5,8,4,5].flatMap((n,i)=>Array.from({length:n},(_,j)=>`${i+1}.${j+1}`));assert.deepEqual(rows.map(r=>r.requirement).sort(),expected.sort(),'coverage omission or duplicate');for(const r of rows){assert.ok(suites.includes(r.suite),'coverage suite absent');assert.ok(r.assertion&&r.property,'coverage needs actual assertion and property');const source=fs.readFileSync(path.join(__dirname,r.assertion_file||r.suite),'utf8');assert.ok(source.includes(r.assertion),`coverage assertion missing: ${r.requirement}`);if(r.correction){assert.ok(suites.includes(r.correction.suite),'correction suite absent');assert.ok(fs.readFileSync(path.join(__dirname,r.correction.suite),'utf8').includes(r.correction.assertion),'correction assertion missing');if(results)assert.ok(results.some(x=>x.suite===r.correction.suite&&x.exit_code===0),'correction suite unexecuted');}if(r.host_observations){const inputs=require('./semantic-cases/inputs.json');for(const id of r.host_observations)assert.ok(inputs.some(x=>x.id===id),'unknown host observation');if(results)assert.ok(results.some(x=>x.suite==='semantic-acceptance.test.cjs'&&x.exit_code===0),'semantic observations unexecuted');}if(results)assert.ok(results.some(x=>x.suite===r.suite&&x.exit_code===0),`coverage suite unexecuted: ${r.requirement}`);}}
function inspectDependencies(directory){const imports=new Set();for(const file of allowlist.filter(f=>/\.(cjs|md)$/.test(f))){const source=fs.readFileSync(path.join(directory,file),'utf8');if(file.endsWith('.md')&&!source.includes('```javascript'))continue;const code=file.endsWith('.md')?[...source.matchAll(/```javascript\r?\n([\s\S]*?)```/g)].map(m=>m[1]).join('\n'):source;assert.ok(!/\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(|https?\.request\s*\(|api\.(?:openai|anthropic)\.com/.test(code),`unexpected network helper ${file}`);for(const m of code.matchAll(/require\(['"]([^'"]+)['"]\)/g)){imports.add(m[1]);assert.ok(m[1].startsWith('node:')||m[1].startsWith('.'),`external helper dependency ${m[1]}`);}}return [...imports].sort();}
function environment(directory){const env={};for(const [key,value] of Object.entries(process.env))if(/^(PATH|PATHEXT|SYSTEMROOT|WINDIR|COMSPEC|TEMP|TMP|USERPROFILE|LOCALAPPDATA|APPDATA|UV_CACHE_DIR)$/i.test(key))env[key]=value;env.STRATEGY_ACCEPTANCE_ROOT=directory;return env;}
function runSuite(directory,suite){return new Promise(resolve=>{const child=spawn(process.execPath,[prefix+suite],{cwd:directory,env:environment(directory),windowsHide:true});let output='';child.stdout.on('data',x=>output+=x);child.stderr.on('data',x=>output+=x);const timer=setTimeout(()=>child.kill(),600000);child.on('error',error=>{clearTimeout(timer);resolve({suite,exit_code:null,error:error.code});});child.on('close',(code,signal)=>{clearTimeout(timer);fs.mkdirSync(path.join(directory,'logs'),{recursive:true});fs.writeFileSync(path.join(directory,'logs',suite.replaceAll('../','').replaceAll('/','-')+'.txt'),output);resolve({suite,command:`node ${prefix}${suite}`,exit_code:code,signal});});});}
async function run({smoke=false}={}){
 checkCoverage(coverage);
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'strategy-acceptance-'));
 assert.ok(!directory.startsWith(root+path.sep));
 const manifest={};for(const file of allowlist){const from=path.join(root,file),to=path.join(directory,file);assert.ok(fs.statSync(from).isFile());fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to,fs.constants.COPYFILE_EXCL);manifest[file]=hash(fs.readFileSync(from));}
 verifyManifest(directory,manifest);
 fs.writeFileSync(path.join(directory,'.strategy-acceptance.json'),JSON.stringify({kind:'synthetic-relocation',manifest}));
 const dependencies=inspectDependencies(directory);
 const results=[];
 // Integration exercises the first usable workflow, real upstream validation and canonical update.
 const queue=smoke?['integration.test.cjs']:suites;
 let next=0;await Promise.all(Array.from({length:smoke?1:3},async()=>{while(next<queue.length){const suite=queue[next++];const result=await runSuite(directory,suite);results.push(result);console.log(`${suite}: exit ${result.exit_code}`);}}));
 verifyManifest(directory,manifest);verifyManifest(root,manifest);
 const report={contract_version:'1.1',relocated_directory:directory,scope:smoke?'relocated first usable workflow smoke':'relocated strategy acceptance',runtime_hashes:Object.fromEntries(Object.entries(manifest).filter(([p])=>p.startsWith('skills/'))),test_hashes:Object.fromEntries(Object.entries(manifest).filter(([p])=>p.startsWith('tests/'))),commands:results,coverage:smoke?[]:coverage,dependencies,limits:['Host meaning replays the separately recorded task 11 bilingual judgments; execution does not comprehend prose. Independent task review remains a separate gate.','Windows persistence assurance applies only to fresh synthetic test destinations.','Dependency inspection is static and allowlisted execution removes model credentials; this is not an OS access sandbox.','Exact working bytes are bound; changed checkout/package bytes require revalidation.','No WordCraft authoring, package release, ATS acceptance or legacy retirement claim.']};
 fs.mkdirSync(path.join(root,'outputs/context-validation'),{recursive:true});
 const reportPath=path.join(root,'outputs/context-validation',smoke?'smoke-acceptance.json':'full-acceptance.json');fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
 checkResults(results,smoke?'smoke':'full');if(!smoke)checkCoverage(coverage,results);
 console.log(`PASS ${results.length} relocated suites; exact runtime/test hashes recorded in outputs/context-validation/${path.basename(reportPath)}`);
 return report;
}
module.exports={environment,hash,verifyManifest,checkResults,checkCoverage,coverage,run};
if(require.main===module)run({smoke:process.argv.includes('--smoke')}).catch(e=>{console.error(e);process.exitCode=1;});
