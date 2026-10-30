'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{execFileSync}=require('node:child_process');
const preparation=require('../../release/prepare.cjs');
const root=path.resolve(__dirname,'../..');
function fixture(t){
 const base=fs.mkdtempSync(path.join(os.tmpdir(),'m5-preparation-')),repo=path.join(base,'source');fs.mkdirSync(repo);
 t.after(()=>{assert.ok(path.resolve(base).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(base,{recursive:true,force:true});});
 for(const file of preparation.genericInputs(root)){const target=path.join(repo,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,file),target);}
 const git=(...args)=>execFileSync('git',args,{cwd:repo,encoding:'utf8',windowsHide:true});
 git('init','--quiet');git('config','core.autocrlf','false');git('add','--',...preparation.genericInputs(repo));git('-c','commit.gpgsign=false','-c','user.name=Fictional fixture','-c','user.email=fixture@example.invalid','commit','--quiet','-m','Fictional generic snapshot');
 const sourceRevision=git('rev-parse','HEAD').trim(),sourceEpoch=Number(git('show','-s','--format=%ct','HEAD'));
 return {base,repo,git,sourceRevision,sourceEpoch,capture:()=>preparation.captureSourceSnapshot({root:repo,sourceRevision,sourceEpoch})};
}
test('module import is side-effect-free and snapshot stages exact closed generic inventory without Git',t=>{
 const f=fixture(t),captured=f.capture();assert.equal(captured.status,'passed');const snapshot=captured.value;
 assert.equal(snapshot.source_revision,f.sourceRevision);assert.equal(snapshot.assets.length,35);assert.equal(snapshot.development_snapshot,false);
 const externalSnapshot=path.join(f.base,'snapshot.json');
 const cli=JSON.parse(execFileSync(process.execPath,[path.join(root,'release/prepare.cjs'),'capture','--root',f.repo,'--source-revision',f.sourceRevision,'--source-epoch',String(f.sourceEpoch),'--snapshot',externalSnapshot],{encoding:'utf8',windowsHide:true}));assert.equal(cli.status,'passed');assert.deepEqual(JSON.parse(fs.readFileSync(externalSnapshot,'utf8')),snapshot);
 const destination=path.join(f.base,'prepared');const result=preparation.prepareCandidate({root:f.repo,snapshot},destination);assert.equal(result.status,'passed');
 assert.ok(!fs.existsSync(path.join(destination,'.git')));assert.ok(!fs.existsSync(path.join(destination,'private')));
 assert.equal(preparation.verifyPreparedCandidate(destination,{sourceRevision:f.sourceRevision,sourceEpoch:f.sourceEpoch}).status,'passed');
 assert.equal(preparation.verifyPreparedCandidate(destination,{sourceRevision:'f'.repeat(40)}).status,'failed');
 assert.equal(preparation.verifyPreparedCandidate(destination,{sourceEpoch:f.sourceEpoch+1}).status,'failed');
 fs.appendFileSync(path.join(destination,'VERSION'),'changed');assert.equal(preparation.verifyPreparedCandidate(destination).status,'failed');
});
test('binary maintenance differences cannot collapse through UTF-8 decoding into clean EOL transport',t=>{
 const f=fixture(t),file=path.join(f.repo,'release/README.md');fs.writeFileSync(file,Buffer.from([0x80,13,10]));f.git('add','--','release/README.md');f.git('-c','commit.gpgsign=false','-c','user.name=Fictional fixture','-c','user.email=fixture@example.invalid','commit','--quiet','-m','Fictional binary control');
 const sourceRevision=f.git('rev-parse','HEAD').trim(),sourceEpoch=Number(f.git('show','-s','--format=%ct','HEAD'));fs.writeFileSync(file,Buffer.from([0x81,10]));
 assert.equal(preparation.captureSourceSnapshot({root:f.repo,sourceRevision,sourceEpoch}).status,'failed');const result=preparation.captureSourceSnapshot({root:f.repo,sourceRevision,sourceEpoch,allowDevelopment:true});assert.equal(result.status,'passed');assert.equal(result.value.development_snapshot,true);
});
test('wrong full revision, epoch, absent sources and changed inputs fail before destination writes',t=>{
 const f=fixture(t);for(const options of [{sourceRevision:'HEAD'},{sourceRevision:'0'.repeat(40)},{sourceEpoch:f.sourceEpoch+1}])assert.equal(preparation.captureSourceSnapshot({...f,root:f.repo,...options}).status,'failed');
 const snapshot=f.capture().value,destination=path.join(f.base,'never-created');fs.appendFileSync(path.join(f.repo,'package.json'),' ');
 assert.equal(preparation.prepareCandidate({root:f.repo,snapshot},destination).status,'failed');assert.ok(!fs.existsSync(destination));
 fs.unlinkSync(path.join(f.repo,'VERSION'));assert.equal(f.capture().status,'failed');
});
test('existing destinations and redirected source/destination ancestors preserve files',t=>{
 const f=fixture(t),snapshot=f.capture().value,destination=path.join(f.base,'existing');fs.mkdirSync(destination);fs.writeFileSync(path.join(destination,'keep'),'unchanged');
 assert.equal(preparation.prepareCandidate({root:f.repo,snapshot},destination).status,'failed');assert.equal(fs.readFileSync(path.join(destination,'keep'),'utf8'),'unchanged');
 const redirect=path.join(f.base,'redirect');fs.symlinkSync(destination,redirect,process.platform==='win32'?'junction':'dir');
 assert.equal(preparation.prepareCandidate({root:f.repo,snapshot},path.join(redirect,'child')).status,'failed');assert.ok(!fs.existsSync(path.join(destination,'child')));
 fs.renameSync(path.join(f.repo,'release'),path.join(f.repo,'release-real'));fs.symlinkSync(path.join(f.repo,'release-real'),path.join(f.repo,'release'),process.platform==='win32'?'junction':'dir');assert.equal(f.capture().status,'failed');
});
test('maintenance checkout EOL transport uses selected blob bytes; payload changes always fail',t=>{
 const f=fixture(t),file=path.join(f.repo,'release/check.cjs'),blob=f.git('show',f.sourceRevision+':release/check.cjs');fs.writeFileSync(file,blob.replace(/\r?\n/g,'\r\n'));
 const captured=f.capture();assert.equal(captured.status,'passed');const destination=path.join(f.base,'eol');assert.equal(preparation.prepareCandidate({root:f.repo,snapshot:captured.value},destination).status,'passed');assert.deepEqual(fs.readFileSync(path.join(destination,'release/check.cjs')),Buffer.from(blob));
 fs.appendFileSync(path.join(f.repo,'skills/targeted-cv/SKILL.md'),'changed');assert.equal(f.capture().status,'failed');assert.equal(preparation.captureSourceSnapshot({root:f.repo,sourceRevision:f.sourceRevision,sourceEpoch:f.sourceEpoch,allowDevelopment:true}).status,'failed');
});
test('dirty generic maintenance requires explicit development mode and cannot claim release readiness',t=>{
 const f=fixture(t);fs.appendFileSync(path.join(f.repo,'release/check.cjs'),'\n// fictional development change\n');assert.equal(f.capture().status,'failed');
 const captured=preparation.captureSourceSnapshot({root:f.repo,sourceRevision:f.sourceRevision,sourceEpoch:f.sourceEpoch,allowDevelopment:true});assert.equal(captured.status,'passed');assert.equal(captured.value.development_snapshot,true);
 const destination=path.join(f.base,'development');assert.equal(preparation.prepareCandidate({root:f.repo,snapshot:captured.value},destination).status,'passed');assert.equal(preparation.verifyPreparedCandidate(destination).value.release_ready,false);
});
