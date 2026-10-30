'use strict';
// Fixed dispatch into the existing version-specific validators. No application logic.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {parseTap,checkResults}=require('./full-acceptance.cjs');
const root=path.resolve(__dirname,'../..');
const owners=['tests/portable-candidate-profile/full-acceptance.cjs','tests/targeted-application-strategy/full-acceptance.cjs','tests/wordcraft-document-session/final-acceptance.cjs','tests/wordcraft-application-documents/full-acceptance.cjs','tests/live-application-refinement/full-acceptance.cjs'];
async function run(index,selection){
 if(!Number.isInteger(index)||index<0||index>=owners.length)throw Error('Unknown validator');
 const file=owners[index],suites=[],measure=(suite,log)=>{const counts=parseTap(fs.readFileSync(log,'utf8'));suites.push({suite,exit_code:0,...counts});};
 if(index===0){
  // This owner emits the freshly executed TAP for every fixed profile suite.
  let output='';const write=process.stdout.write;process.stdout.write=function(chunk,...args){output+=String(chunk);return write.call(this,chunk,...args);};
  try{await require(path.join(root,file)).run();}finally{process.stdout.write=write;}
  const segments=output.split(/(?=TAP version 13\r?\n)/).filter(x=>x.startsWith('TAP version 13'));
  const expected=['contract','foundation','validation','evidence','migration','intake','updates','integration','edge-cases','isolation','persistence-acceptance'];
  if(segments.length!==expected.length)throw Error('Profile TAP inventory mismatch');
  for(let i=0;i<expected.length;i++)suites.push({suite:'tests/portable-candidate-profile/'+expected[i]+'.test.cjs',exit_code:0,...parseTap(segments[i])});
 }else if(index===1){const r=await require(path.join(root,file)).run();for(const c of r.commands){if(c.exit_code!==0)throw Error('Failed strategy suite');measure(c.suite,path.join(r.relocated_directory,'logs',c.suite.replaceAll('../','').replaceAll('/','-')+'.txt'));}}
 else if(index===2){const s=selection.session,r=spawnSync(process.execPath,[file,s.report.path,s.session.path,s.output],{cwd:root,windowsHide:true,shell:false,timeout:1800000,maxBuffer:128*1024*1024,encoding:'utf8'});process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');if(r.status!==0)throw Error('Session validator failed');const report=JSON.parse(fs.readFileSync(path.join(s.output,'verification.json')));for(const row of report.suites){if(row.status!=='passed')throw Error('Session suite failed');measure(row.name,path.join(s.output,row.name+'.tap'));}if(suites.reduce((n,s)=>n+s.tests,0)!==report.totalTests)throw Error('Session count mismatch');}
 else if(index===3){const s=selection.documents,r=await require(path.join(root,file)).run({receipt:s.receipt.path,review:s.review.path});for(const c of r.commands){if(c.exit_code!==0)throw Error('Documents suite failed');measure(c.suite,path.join(r.relocated_directory,'logs',c.suite+'.txt'));}}
 else{const s=selection.refinement,r=await require(path.join(root,file)).run(s.index.path,s.digest,{reviewFile:s.review.path});for(const c of r.results){if(c.exit_code!==0)throw Error('Refinement suite failed');measure(c.suite,path.join(r.directory,'logs',c.suite.replaceAll('/','_')+'.txt'));}}
 checkResults(suites,suites.map(s=>s.suite));return {entrypoint:file,suites};
}
module.exports={run};
if(require.main===module){(async()=>{try{if(process.argv.length!==4||!/^\d$/.test(process.argv[2]))throw Error('Explicit owner ID and selection required');const result=await run(Number(process.argv[2]),JSON.parse(fs.readFileSync(process.argv[3])));console.log('OWNER_RESULT '+JSON.stringify(result));}catch{console.error('Version-specific owner validator failed; inspect private execution output.');process.exitCode=1;}})();}
