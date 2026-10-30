'use strict';
// Fixed dispatch into the existing version-specific validators. No application logic.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {parseTap,checkResults}=require('./full-acceptance.cjs');
const root=path.resolve(__dirname,'../..');
const owners=['tests/portable-candidate-profile/full-acceptance.cjs','tests/targeted-application-strategy/full-acceptance.cjs','tests/wordcraft-document-session/final-acceptance.cjs','tests/wordcraft-application-documents/full-acceptance.cjs','tests/live-application-refinement/full-acceptance.cjs'];
const childProcess=require('node:child_process'),nativeSpawn=childProcess.spawn,nativeSpawnSync=childProcess.spawnSync;
let launchContext=null;
function nativeLaunch(command,args,options){
 if(!launchContext||command!==process.execPath||!Array.isArray(args))return null;
 const script=args.find(a=>typeof a==='string'&&a.endsWith('.test.cjs'));if(!script)return null;
 if(args.some(a=>a.startsWith('--test-reporter')))throw Error('Unexpected owner reporter override');
 const env={...(options?.env||process.env)};delete env.NODE_TEST_CONTEXT;
 return {args:['--test','--test-reporter=tap',...args.filter(a=>a!=='--test')],options:{...options,env},file:path.resolve(options?.cwd||process.cwd(),script),executions:launchContext};
}
function observedSpawnSync(command,args,options){const launch=nativeLaunch(command,args,options);if(!launch)return nativeSpawnSync(command,args,options);const r=nativeSpawnSync(command,launch.args,launch.options);launch.executions.push({file:launch.file,exit_code:r.status,output:String(r.stdout||'')+String(r.stderr||'')});return r;}
function observedSpawn(command,args,options){const launch=nativeLaunch(command,args,options);if(!launch)return nativeSpawn(command,args,options);const r=nativeSpawn(command,launch.args,launch.options);let output='';r.stdout?.on('data',b=>output+=String(b));r.stderr?.on('data',b=>output+=String(b));r.on('close',code=>launch.executions.push({file:launch.file,exit_code:code,output}));return r;}
// Maintenance-only execution adapter. Existing owners retain all assertions,
// relocation, evidence membership and coverage checks. Each suite itself runs
// under native Node testing; an imperative script has one native file test.
async function withNativeTestLaunches(operation){
 if(launchContext)throw Error('Concurrent owner adapters are unsupported');const executions=[];launchContext=executions;childProcess.spawnSync=observedSpawnSync;childProcess.spawn=observedSpawn;
 try{return {value:await operation(),executions};}finally{launchContext=null;childProcess.spawnSync=nativeSpawnSync;childProcess.spawn=nativeSpawn;}
}
function validateNativeTap(output){
 const text=String(output);if(/[\x00-\x08\x0b\x0c\x0e-\x1f\ufffd]/.test(text))throw Error('Uninspectable nested test protocol');const counts=parseTap(text);checkResults([{suite:'native-owner-suite',exit_code:0,...counts}],['native-owner-suite']);
 // Native Node prefixes child stdout with comments. Check nested summaries and
 // directives too: a successful outer file must not conceal an internal skip.
 if(/(?:^|\n)(?:# *)*[ \t]*1\.\.0(?:[ \t\r]|$)/m.test(text)||/#\s+(?:SKIP|TODO)\b/.test(text)||/(?:^|\n)(?:#\s*)+(?:fail|cancelled|skipped|todo)\s+[1-9]\d*\b/m.test(text)||/(?:^|\n)(?:#\s*)*not ok\s+\d/m.test(text))throw Error('Failed or skipped internal owner test');
 return counts;
}
async function run(index,selection){
 if(!Number.isInteger(index)||index<0||index>=owners.length)throw Error('Unknown validator');
 const file=owners[index],suites=[],measure=(suite,log)=>{const counts=validateNativeTap(fs.readFileSync(log,'utf8'));suites.push({suite,exit_code:0,...counts});};
 if(index===0){
  const executed=await withNativeTestLaunches(()=>require(path.join(root,file)).run());
  const expected=['contract','foundation','validation','evidence','migration','intake','updates','integration','edge-cases','isolation','persistence-acceptance'];
  if(executed.executions.length!==expected.length)throw Error('Profile native execution inventory mismatch');
  for(const name of expected){const rows=executed.executions.filter(r=>r.file.endsWith(path.join('tests','portable-candidate-profile',name+'.test.cjs')));if(rows.length!==1||rows[0].exit_code!==0)throw Error('Missing or failed native profile suite');suites.push({suite:'tests/portable-candidate-profile/'+name+'.test.cjs',exit_code:rows[0].exit_code,...validateNativeTap(rows[0].output)});}
 }else if(index===1){const {value:r}=await withNativeTestLaunches(()=>require(path.join(root,file)).run());for(const c of r.commands){if(c.exit_code!==0)throw Error('Failed strategy suite');measure(c.suite,path.join(r.relocated_directory,'logs',c.suite.replaceAll('../','').replaceAll('/','-')+'.txt'));}}
 else if(index===2){const s=selection.session,r=spawnSync(process.execPath,[file,s.report.path,s.session.path,s.output],{cwd:root,windowsHide:true,shell:false,timeout:1800000,maxBuffer:128*1024*1024,encoding:'utf8'});process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');if(r.status!==0)throw Error('Session validator failed');const report=JSON.parse(fs.readFileSync(path.join(s.output,'verification.json')));for(const row of report.suites){if(row.status!=='passed')throw Error('Session suite failed');measure(row.name,path.join(s.output,row.name+'.tap'));}if(suites.reduce((n,s)=>n+s.tests,0)!==report.totalTests)throw Error('Session count mismatch');}
 else if(index===3){const s=selection.documents,{value:r}=await withNativeTestLaunches(()=>require(path.join(root,file)).run({receipt:s.receipt.path,review:s.review.path}));for(const c of r.commands){if(c.exit_code!==0)throw Error('Documents suite failed');measure(c.suite,path.join(r.relocated_directory,'logs',c.suite+'.txt'));}}
 else{const s=selection.refinement,r=await require(path.join(root,file)).run(s.index.path,s.digest,{reviewFile:s.review.path});for(const c of r.results){if(c.exit_code!==0)throw Error('Refinement suite failed');measure(c.suite,path.join(r.directory,'logs',c.suite.replaceAll('/','_')+'.txt'));}}
 checkResults(suites,suites.map(s=>s.suite));return {entrypoint:file,suites};
}
module.exports={run,withNativeTestLaunches,validateNativeTap};
if(require.main===module){(async()=>{try{if(process.argv.length!==4||!/^\d$/.test(process.argv[2]))throw Error('Explicit owner ID and selection required');const result=await run(Number(process.argv[2]),JSON.parse(fs.readFileSync(process.argv[3])));console.log('OWNER_RESULT '+JSON.stringify(result));}catch{console.error('Version-specific owner validator failed; inspect private execution output.');process.exitCode=1;}})();}
