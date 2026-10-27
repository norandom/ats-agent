'use strict';
// Test orchestration only. No authoring, receipt rewriting or candidate discovery.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const manifest=require('./acceptance-manifest.json'),suites=manifest.suites;
const root=path.resolve(__dirname,'../..'),prefix='tests/wordcraft-application-documents/';
const hash=x=>require('node:crypto').createHash('sha256').update(x).digest('hex');
const allowlist=[...manifest.runtime,...suites.map(x=>prefix+x),...manifest.support.map(x=>prefix+x),...manifest.upstream,prefix+'full-acceptance.cjs',prefix+'acceptance-manifest.json',prefix+'scenarios.md'].filter((x,i,a)=>a.indexOf(x)===i);
function verifyManifest(directory,hashes,expected=allowlist){
 assert.deepEqual(Object.keys(hashes).sort(),[...expected].sort(),'incomplete manifest membership');
 for(const [file,digest]of Object.entries(hashes)){assert.ok(fs.existsSync(path.join(directory,file)),`missing asset ${file}`);assert.equal(hash(fs.readFileSync(path.join(directory,file))),digest,`hash mismatch ${file}`);}
}
function checkResults(results,mode){
 assert.ok(['full','smoke'].includes(mode),'explicit full or smoke mode required');
 const expected=mode==='full'?suites:['integration.test.cjs'];
 assert.deepEqual(results.map(x=>x.suite).sort(),[...expected].sort(),'missing, duplicate or unexpected suites');
 for(const r of results){assert.equal(r.exit_code,0,`failed suite ${r.suite}`);assert.equal(r.skipped,0,`skipped mandatory tests ${r.suite}`);}
}
function checkCoverage(rows,results){
 assert.deepEqual(rows.map(r=>r.requirement).sort(),Array.from({length:42},(_,i)=>`${Math.floor(i/6)+1}.${i%6+1}`).sort(),'missing or duplicate criteria');
 for(const r of rows){assert.ok(suites.includes(r.suite));assert.ok(fs.readFileSync(path.join(__dirname,r.suite),'utf8').includes(r.assertion),'missing actual assertion');assert.ok(fs.readFileSync(path.join(__dirname,'acceptance-check.cjs'),'utf8').includes(r.actual_assertion),'missing live assertion');assert.ok(r.host_review);if(results)assert.ok(results.some(x=>x.suite===r.suite&&x.exit_code===0));}
}
function checkActual(receipt,review){
 assert.ok(receipt,'Explicit actual receipt required');assert.ok(review,'Explicit independent review required');
 const result=require('./acceptance-check.cjs').verify(receipt,review);assert.equal(result.status,'passed',JSON.stringify(result.issues));
 const r=JSON.parse(fs.readFileSync(receipt)),v=JSON.parse(fs.readFileSync(review));
 assert.deepEqual(Object.keys(r.runtimeHashes).sort(),manifest.runtime.filter(x=>!x.includes('/templates/')).map(x=>x.replace('skills/targeted-cv/','')).sort(),'actual runtime inventory');
 assert.equal(v.provenance.recordedCalls,r.calls.length);assert.equal(v.provenance.allCallsReturned,true);assert.ok(r.calls.every(x=>x.outcome==='returned'),'actual call provenance');
 for(const id of ['cv-en','letter-en','cv-de','letter-de'])assert.ok(r.intents.some(x=>x.label===`Switch to ${id}`&&x.status==='observed'),'actual document switches');
 for(const s of r.stages.filter(x=>x.kind==='cv')){
  assert.ok(s.structure.sections.every(x=>x.props.columns.count===1),'single column');
  for(const p of s.paragraphs){const {paragraph,resolved}=p.observed;
   assert.equal(paragraph.text,p.text);assert.equal(resolved.align,'left');assert.equal(paragraph.mark.font,'Arial');
   assert.equal(paragraph.mark.size,p.kind==='name'?22:['headline','heading'].includes(p.kind)?12:11,'readable typography');
   if(p.kind==='heading'){assert.equal(paragraph.mark.bold,true);assert.deepEqual(paragraph.mark.color.Rgb,[31,78,121]);assert.equal(resolved.keepNext,true);}
   if(p.kind==='summary')assert.ok(resolved.shading);if(p.kind==='bullet')assert.ok(resolved.numbering);
  }
 }
 return {...result,provenance:'recorded calls and switches checked',presentation:'actual paragraph properties checked'};
}
function environment(directory){
 const env={};for(const [k,v]of Object.entries(process.env))if(/^(PATH|PATHEXT|SYSTEMROOT|WINDIR|COMSPEC|TEMP|TMP|USERPROFILE|LOCALAPPDATA|APPDATA|UV_CACHE_DIR)$/i.test(k))env[k]=v;
 env.STRATEGY_ACCEPTANCE_ROOT=directory;return env;
}
function runSuite(directory,suite){return new Promise(resolve=>{
 const child=spawn(process.execPath,[prefix+suite],{cwd:directory,env:environment(directory),windowsHide:true});let output='';
 child.stdout.on('data',x=>output+=x);child.stderr.on('data',x=>output+=x);const timer=setTimeout(()=>child.kill(),600000);
 child.on('error',error=>{clearTimeout(timer);resolve({suite,exit_code:null,skipped:null,error:error.code});});
 child.on('close',(code,signal)=>{clearTimeout(timer);fs.mkdirSync(path.join(directory,'logs'),{recursive:true});fs.writeFileSync(path.join(directory,'logs',suite+'.txt'),output);resolve({suite,command:`node ${prefix}${suite}`,exit_code:code,signal,skipped:Number(output.match(/(?:#|ℹ) skipped (\d+)/)?.[1]??NaN)});});
});}
async function run({smoke=false,receipt,review}={}){
 assert.ok(receipt&&review,'Explicit actual receipt and independent review paths required');receipt=path.resolve(receipt);review=path.resolve(review);
 const actual=checkActual(receipt,review);checkCoverage(manifest.coverage);
 assert.deepEqual(fs.readdirSync(__dirname).filter(x=>x.endsWith('.test.cjs')).sort(),[...suites].sort(),'test inventory changed');
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'documents-acceptance-'));assert.ok(!directory.startsWith(root+path.sep));
 const hashes={};for(const file of allowlist){const from=path.join(root,file),to=path.join(directory,file);fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to,fs.constants.COPYFILE_EXCL);hashes[file]=hash(fs.readFileSync(from));}
 verifyManifest(directory,hashes);fs.writeFileSync(path.join(directory,'.strategy-acceptance.json'),JSON.stringify({kind:'synthetic-relocation',manifest:hashes}));
 // Preserve exact original receipt bytes and absolute evidence paths. These are selected
 // fictional external test inputs, never runtime dependencies or rewritten provenance.
 const evidenceHashes={};const record=p=>{evidenceHashes[p]=hash(fs.readFileSync(p));};record(receipt);record(review);
 const r=JSON.parse(fs.readFileSync(receipt));for(const s of r.stages){record(s.artifact);for(const page of s.renders)record(page.path);}for(const name of ['strategy','manifest','sources','profile'])record(r.upstream[name].path);
 const evidenceDir=path.join(directory,'selected-evidence');fs.mkdirSync(evidenceDir);fs.copyFileSync(receipt,path.join(evidenceDir,'receipt.json'));fs.copyFileSync(review,path.join(evidenceDir,'review.json'));
 const relocatedCheck=require(path.join(directory,prefix,'acceptance-check.cjs')).verify(path.join(evidenceDir,'receipt.json'),path.join(evidenceDir,'review.json'));assert.equal(relocatedCheck.status,'passed',JSON.stringify(relocatedCheck.issues));
 const queue=smoke?['integration.test.cjs']:suites,results=[];let next=0;
 await Promise.all(Array.from({length:smoke?1:3},async()=>{while(next<queue.length){const s=queue[next++],result=await runSuite(directory,s);results.push(result);console.log(`${s}: exit ${result.exit_code}; skipped ${result.skipped}`);}}));
 verifyManifest(directory,hashes);verifyManifest(root,hashes);for(const [file,digest]of Object.entries(evidenceHashes))assert.equal(hash(fs.readFileSync(file)),digest,'changed selected evidence');
 checkActual(receipt,review);
 const report={mode:smoke?'smoke':'full',relocated_directory:directory,hashes,commands:results,coverage:smoke?[]:manifest.coverage,actual,relocated_actual:relocatedCheck,evidence_hashes:evidenceHashes,limits:['Actual authoring is the independently reviewed selected receipt, freshly replayed against current runtime hashes; this run does not reauthor documents.','Absolute paths in original receipt remain explicit external fictional evidence inputs. No source checkout code or sibling repository is imported from them.','Historical optional receipt formats are replaced by current comprehensive bilingual acceptance; scenario equivalence and host judgment scope are in scenarios.md.','Allowlisted environment removes model credentials but is not an OS sandbox.','Runtime desktop liveness, privacy scan and independent final review are separate gates. No release or refinement completion claim.']};
 const output=path.join(root,'outputs/documents-validation');fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,smoke?'smoke-acceptance.json':'full-acceptance.json'),JSON.stringify(report,null,2)+'\n');
 checkResults(results,smoke?'smoke':'full');if(!smoke)checkCoverage(manifest.coverage,results);console.log(`PASS ${results.length} relocated suites and current actual receipt replay`);return report;
}
module.exports={manifest,suites,allowlist,hash,verifyManifest,checkResults,checkCoverage,checkActual,environment,run};
if(require.main===module){const args=process.argv.slice(2),smoke=args.includes('--smoke'),paths=args.filter(x=>x!=='--smoke');run({smoke,receipt:paths[0],review:paths[1]}).catch(e=>{console.error(e);process.exitCode=1;});}
