'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const preparation=require('../../release/prepare.cjs'),root=path.resolve(__dirname,'../..');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function fixture(t,alternateBuilder=false){
 const base=fs.mkdtempSync(path.join(os.tmpdir(),'m5-archive-')),repo=path.join(base,'source');fs.mkdirSync(repo);
 t.after(()=>{assert.ok(base.startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(base,{recursive:true,force:true});});
 for(const file of preparation.genericInputs(root)){const target=path.join(repo,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,file),target);fs.chmodSync(target,0o644);}
 if(alternateBuilder)fs.appendFileSync(path.join(repo,'release/package.cjs'),'\n// Fictional alternate generator identity.\n');
 const git=(...args)=>execFileSync('git',args,{cwd:repo,encoding:'utf8'});git('init','--quiet');git('config','core.autocrlf','false');git('add','.');git('-c','commit.gpgsign=false','-c','user.name=Fictional fixture','-c','user.email=fixture@example.invalid','commit','--quiet','-m','Generic fixture');
 const sourceRevision=git('rev-parse','HEAD').trim(),sourceEpoch=Number(git('show','-s','--format=%ct','HEAD')),snapshot=preparation.captureSourceSnapshot({root:repo,sourceRevision,sourceEpoch});assert.equal(snapshot.status,'passed');
 const prepared=path.join(base,'prepared');assert.equal(preparation.prepareCandidate({root:repo,snapshot:snapshot.value},prepared).status,'passed');
 return {base,prepared,sourceRevision,sourceEpoch,snapshot:snapshot.value,builder:require(path.join(prepared,'release/package.cjs'))};
}
test('builder imports without writes and produces exact portable, alias and plugin bytes',t=>{
 const f=fixture(t),output={stage:path.join(f.base,'stage'),archives:path.join(f.base,'dist')};
 const result=f.builder.buildArtifacts({root:f.prepared,sourceRevision:f.sourceRevision,sourceEpoch:f.sourceEpoch},output);assert.equal(result.status,'passed',JSON.stringify(result));assert.equal(result.value.release_ready,false);
 assert.equal(result.value.artifacts.length,3);
 for(const artifact of result.value.artifacts){
  const archive=path.join(output.archives,artifact.filename),bytes=fs.readFileSync(archive);assert.equal(bytes.length,artifact.size);assert.equal(hash(bytes),artifact.sha256);
  const names=execFileSync('unzip',['-Z1',archive],{encoding:'utf8'}).trim().split('\n');assert.equal(names.length,artifact.format==='plugin-zip'?42:36);assert.deepEqual(names,[...names].sort());assert.ok(!names.some(n=>/marketplace|private|tests\//.test(n)));
  const read=n=>execFileSync('unzip',['-p',archive,n]),format=artifact.format==='plugin-zip'?'plugin-zip':'portable-zip',metaName=format==='plugin-zip'?'RELEASE.json':'targeted-cv/RELEASE.json',meta=JSON.parse(read(metaName));
  assert.equal(hash(read(metaName)),artifact.release_metadata_sha256);assert.equal(meta.source_revision,f.sourceRevision);assert.equal(meta.source_epoch,f.sourceEpoch);assert.equal(meta.format,format==='portable-zip'?'portable':'plugin');assert.ok(meta.scope.includes('refinement'));assert.equal(meta.files.length,names.length-1);assert.ok(meta.targets.every(x=>x.workflow_verified==='not_assessed'&&x.host_load_verified==='not_assessed'));
  for(const asset of f.snapshot.assets)for(const dest of asset.destinations[format])assert.deepEqual(read(dest),fs.readFileSync(path.join(f.prepared,asset.source)));
  if(format==='plugin-zip'){assert.equal(JSON.parse(read('.codex-plugin/plugin.json')).skills,'./skills/');assert.deepEqual(JSON.parse(read('.gemini-plugin/plugin.json')).skills,['./skills/']);assert.deepEqual(Object.keys(JSON.parse(read('.claude-plugin/plugin.json'))).sort(),['name','version']);}
 }
 const [portable,alias]=result.value.artifacts;assert.deepEqual(fs.readFileSync(path.join(output.archives,portable.filename)),fs.readFileSync(path.join(output.archives,alias.filename)));
 assert.equal(result.value.artifacts[0].build_input_digest,hash(Buffer.from(JSON.stringify(f.snapshot.build_inputs.map(({path,size,sha256})=>({path,size,sha256}))))));
 assert.match(fs.readFileSync(path.join(output.archives,'SHA256SUMS'),'utf8'),/\.skill/);
});
test('source mismatch and existing or overlapping destinations fail before writes and preserve files',t=>{
 const f=fixture(t),build=f.builder.buildArtifacts;
 for(const output of [{stage:path.join(f.base,'same'),archives:path.join(f.base,'same')},{stage:path.join(f.prepared,'stage'),archives:path.join(f.base,'dist')}]){assert.equal(build({root:f.prepared,sourceRevision:f.sourceRevision,sourceEpoch:f.sourceEpoch},output).status,'failed');assert.ok(!fs.existsSync(output.stage));}
 const output={stage:path.join(f.base,'stage'),archives:path.join(f.base,'dist')};assert.equal(build({root:f.prepared,sourceRevision:'f'.repeat(40),sourceEpoch:f.sourceEpoch},output).status,'failed');assert.ok(!fs.existsSync(output.stage));
 fs.mkdirSync(output.archives);fs.writeFileSync(path.join(output.archives,'keep'),'retain');assert.equal(build({root:f.prepared,sourceRevision:f.sourceRevision,sourceEpoch:f.sourceEpoch},output).status,'failed');assert.equal(fs.readFileSync(path.join(output.archives,'keep'),'utf8'),'retain');assert.ok(!fs.existsSync(output.stage));
});
test('loaded builder mismatch and unavailable prerequisites cannot create or approve output',t=>{
 const f=fixture(t,true),output={stage:path.join(f.base,'stage'),archives:path.join(f.base,'dist')};
 const args={root:f.prepared,sourceRevision:f.sourceRevision,sourceEpoch:f.sourceEpoch};
 assert.equal(require('../../release/package.cjs').buildArtifacts(args,output).status,'failed');assert.ok(!fs.existsSync(output.stage));
 const previous=process.env.PATH;try{process.env.PATH='';const result=f.builder.buildArtifacts(args,output);assert.equal(result.status,'not_assessed');assert.ok(!fs.existsSync(output.stage));}finally{process.env.PATH=previous;}
});
