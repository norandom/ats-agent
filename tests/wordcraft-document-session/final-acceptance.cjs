// Test-only verifier. Historical live evidence is reviewed and pinned, never inferred from flags.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const assert=require('node:assert/strict');
const {acceptanceStatus,environmentIdentity,validateForegroundObservation}=require('./live-scenarios.cjs');
const manifest=require('./acceptance-manifest.json');
const {criteria,provenance}=manifest;
const runtime=['references/document-session.md','references/wordcraft-capabilities.md','references/wordcraft-operations.md','schemas/document-session.schema.json'];
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
function validateSuite(tap,names){
 const observed=[...tap.matchAll(/^ok \d+ - (.+)$/gm)].map(m=>m[1]);
 assert.deepEqual(observed.sort(),[...names].sort(),'Exact passing test membership');
 for(const [key,n] of Object.entries({tests:names.length,pass:names.length,fail:0,cancelled:0,skipped:0,todo:0})) assert.match(tap,new RegExp(`^# ${key} ${n}$`,'m'),`Suite ${key}`);
 assert.doesNotMatch(tap,/^not ok|# SKIP|# TODO/m);
}
function validateAssets(observed,current){
 assert.deepEqual(observed.map(a=>a.name).sort(),[...runtime].sort(),'Exact runtime asset membership');
 for(const a of observed)assert.equal(current[a.name],a.sha256,'Runtime drift: '+a.name);
}
function validateEvidence(reportBytes,sessionBytes,assets){
 assert.equal(hash(reportBytes),provenance.reportSha256,'Unreviewed live receipt bytes');
 assert.equal(hash(sessionBytes),provenance.sessionSha256,'Unreviewed session bytes');
 const r=JSON.parse(reportBytes),s=JSON.parse(sessionBytes);
 assert.equal(r.evidenceKind,'actual_mcp');assert.equal(r.mode,'desktop-connected');
 assert.equal(acceptanceStatus(r.scenarios,r),'passed');assert.equal(r.milestone,'passed');
 assert.equal(r.calls.length,120);const calls=r.calls.filter(c=>c.tool);assert.equal(calls.length,108);
 assert.equal(new Set(r.calls.map(c=>c.id)).size,120);
 validateAssets(r.assets,assets);
 const usedCommands=r.formatCommands.filter(c=>c.id==='para.style');assert.equal(usedCommands.length,1);
 const identity=environmentIdentity({server:r.serverInfo.name,version:r.serverInfo.version??null,mode:'desktop',...r.environment,tools:r.tools,commands:usedCommands});
 assert.equal(s.connection.environmentFingerprint,identity.fingerprint);assert.deepEqual(r.catalogPairs,identity.catalogPairs);
 const discovery=r.calls.find(c=>c.tool==='list_commands'&&c.args.query==='para.style');
 assert.ok(discovery);assert.deepEqual(JSON.parse(discovery.result.content.find(x=>x.type==='text').text),r.formatCommands);
 assert.ok(r.calls.indexOf(discovery)<r.calls.findIndex(c=>['new_document','save_document','execute','type_text'].includes(c.tool)),'Command discovery before any demonstration');
 assert.equal(s.connection.version,r.serverInfo.version);assert.equal(s.connection.mode,'desktop');
 const visibility=r.scenarios.find(c=>c.id==='visibility');
 if(visibility.evidenceKind==='actual_mcp_and_user_observation'){
  const original=s.bindings.find(b=>b.id==='original-fictional-letter');
  validateForegroundObservation(visibility.evidence.foregroundObservation,original.path,Date.parse(r.startedAt));
 }else assert.equal(r.initialUI.focused,true);
 assert.equal(visibility.evidence.initialFocused,r.initialUI.focused);
 const uiCalls=r.calls.filter(c=>c.documentId&&c.ui);assert.equal(uiCalls.length,6);assert.ok(uiCalls.every(c=>c.ui.pages?.length));
 for(const c of calls){assert.ok(r.tools.some(t=>t.name===c.tool));assert.ok(c.executedAt>=r.startedAt&&c.executedAt<=r.finishedAt);assert.equal(c.result.isError,false);assert.ok(Array.isArray(c.result.content));}
 // Read-only smoke is the executed initial selection inspection in the same hash-bound live run.
 assert.deepEqual(calls.slice(0,2).map(c=>c.tool),['get_text','inspect_document']);
 const body=c=>JSON.parse(c.result.content.find(x=>x.type==='text').text);
 assert.ok(body(calls[0]).text);assert.ok(body(calls[1]).blocks.length);
 for(const id of ['cv-lifecycle','letter-lifecycle']){
  const e=r.scenarios.find(x=>x.id===id).evidence;assert.notEqual(e.source,e.exported);
  assert.ok(s.snapshots.some(x=>x.id===e.snapshotId&&x.documentId===e.documentId));
  for(const operation of ['create','read','edit','save','reopen','export'])assert.ok(s.receipts.some(x=>x.documentId===e.documentId&&x.operation===operation&&x.outcome.status==='confirmed'));
  assert.ok(calls.some(c=>c.tool==='open_document'&&c.args.path===e.exported));
 }
 assert.equal(r.scenarios.find(x=>x.id==='lost-response').evidence.decision.decision,'recovered');
 assert.ok(calls.some(c=>c.actor!=='host'));
 return {report:r,session:s,actualToolCalls:calls.length,traceEntries:r.calls.length,smoke:'initial get_text and inspect_document from pinned actual desktop run'};
}
function invoke(command,args,options={}){
 const r=spawnSync(command,args,{encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024,...options});
 if(r.error)throw r.error;assert.equal(r.status,0,r.stdout+r.stderr);return r.stdout+r.stderr;
}
function main(){
 const [reportPath,sessionPath,outputPath]=process.argv.slice(2);
 assert.ok(reportPath&&sessionPath&&outputPath,'Explicit actual report, session and fresh external output required');
 const root=path.resolve(__dirname,'../..'),output=path.resolve(outputPath),relative=path.relative(root,output);
 assert.ok(relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative),'Final output must be outside checkout');
 assert.ok(!fs.existsSync(output),'Fresh output required');fs.mkdirSync(output,{recursive:true});
 const installed=path.join(output,'installed');fs.mkdirSync(installed);
 const runtimeAssets=Object.fromEntries(runtime.map(name=>[name,hash(fs.readFileSync(path.join(root,'skills/targeted-cv',name)))]));
 const evidence=validateEvidence(fs.readFileSync(reportPath),fs.readFileSync(sessionPath),runtimeAssets);
 const testAssets=['foundation.cjs','fixtures.json','live-acceptance.cjs','live-scenarios.cjs','final-acceptance.cjs','acceptance-manifest.json',...Object.keys(manifest.suites)];
 const allowlist=[...runtime.map(n=>'skills/targeted-cv/'+n),...testAssets.map(n=>'tests/wordcraft-document-session/'+n)];
 const copied=[];
 for(const name of allowlist){const source=path.join(root,name),dest=path.join(installed,name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(source,dest);copied.push({name,sha256:hash(fs.readFileSync(dest))});}
 const actual=fs.readdirSync(installed,{recursive:true,withFileTypes:true}).filter(d=>d.isFile()).map(d=>path.relative(installed,path.join(d.parentPath,d.name)).replaceAll('\\','/')).sort();assert.deepEqual(actual,[...allowlist].sort());
 // Minimal subprocess environment: no model credentials or candidate paths supplied.
 const env=Object.fromEntries(Object.entries(process.env).filter(([k])=>/^(PATH|PATHEXT|SYSTEMROOT|WINDIR|TEMP|TMP|USERPROFILE|LOCALAPPDATA|APPDATA|COMSPEC|PNPM_HOME|UV_CACHE_DIR)$/i.test(k)));
 const pnpm=(args,opts)=>{
  // Only fixed relative tool arguments are accepted by the Windows command shell.
  assert.ok(args.every(x=>/^[a-zA-Z0-9_./=-]+$/.test(x)));
  return process.platform==='win32'?invoke('cmd.exe',['/d','/c','pnpm '+args.join(' ')],opts):invoke('pnpm',args,opts);
 };
 const suites=[];
 for(const [name,names] of Object.entries(manifest.suites)){
  const tap=pnpm(['exec','node','--test','--test-reporter=tap','tests/wordcraft-document-session/'+name],{cwd:installed,env});
  fs.writeFileSync(path.join(output,name+'.tap'),tap);validateSuite(tap,names);suites.push({name,count:names.length,tests:names,status:'passed'});
 }
 const host=vm.createContext({});
 for(const name of runtime.filter(x=>x.endsWith('.md')))for(const b of fs.readFileSync(path.join(installed,'skills/targeted-cv',name),'utf8').matchAll(/```javascript\r?\n([\s\S]*?)```/g))vm.runInContext(b[1],host);
 assert.equal(host.inspectSessionIntegrity(evidence.session).length,0,'Actual session integrity');
 const schemaLog=invoke('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--schemafile',path.join(installed,'skills/targeted-cv/schemas/document-session.schema.json'),path.resolve(sessionPath)],{cwd:installed,env});fs.writeFileSync(path.join(output,'actual-schema.txt'),schemaLog);
 const ids=[5,7,5,4,6,5,7].flatMap((n,i)=>Array.from({length:n},(_,j)=>`${i+1}.${j+1}`));assert.deepEqual(criteria.map(c=>c.id),ids);
 for(const c of criteria){for(const ref of c.tests){const [file,name]=ref;assert.ok(manifest.suites[file]?.includes(name),'Unknown coverage test');}for(const id of c.live)assert.ok(evidence.report.scenarios.some(s=>s.id===id&&s.status==='passed'));}
 const result={status:'verified_for_review',verifiedAt:new Date().toISOString(),runtimeAssets,copiedAssets:copied,provenance,suites,totalTests:suites.reduce((n,s)=>n+s.count,0),actualSession:{schema:'passed',integrity:'passed'},live:{executedAt:evidence.report.finishedAt,actualToolCalls:108,traceEntries:120,scenarios:evidence.report.scenarios.map(({id,status,evidenceKind})=>({id,status,evidenceKind})),originalRestored:true,smoke:evidence.smoke},criteria,limits:manifest.limits};
 fs.writeFileSync(path.join(output,'verification.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({status:result.status,totalTests:result.totalTests,criteria:criteria.length,actualToolCalls:108}));
}
module.exports={validateSuite,validateAssets,validateEvidence,criteria,provenance,runtime};
if(require.main===module)try{main();}catch(e){console.error(e.message);process.exitCode=1;}
