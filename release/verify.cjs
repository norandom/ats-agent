'use strict';
// Maintenance only. Read actual ZIP bytes independently; no builder import or installation claim.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib'),{isDeepStrictEqual}=require('node:util');
const {verifyPreparedCandidate}=require('./prepare.cjs'),{readDeclaration,hostMetadata,validateRecord}=require('./candidate-definition.cjs');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),json=v=>Buffer.from(JSON.stringify(v,null,2)+'\n'),digest=v=>hash(Buffer.from(JSON.stringify(v)));
function demand(ok){if(!ok)throw Error('Verification precondition failed');}
const failure=(scope,status='failed')=>({status,issues:[{category:status==='not_assessed'?'evidence':scope==='extraction'?'destination':'integrity',scope,next_action:'Select matching trusted source and artifact records; inspect locally, preserve existing files and retry explicitly.'}]});
function safeAbsolute(value){demand(typeof value==='string'&&path.isAbsolute(value));const resolved=path.resolve(value);let cursor=path.parse(resolved).root;for(const part of resolved.slice(cursor.length).split(path.sep).filter(Boolean)){cursor=path.join(cursor,part);let st;try{st=fs.lstatSync(cursor);}catch(e){if(e.code!=='ENOENT')throw e;}if(st)demand(!st.isSymbolicLink());}return resolved;}
function nameSafe(name){demand(typeof name==='string'&&name.length&&!name.includes('\\')&&!/^[A-Za-z]:|^\//.test(name));for(const p of name.split('/'))demand(p&&p!=='.'&&p!=='..'&&!/[. ]$|[<>:"|?*\x00-\x1f\x7f]/.test(p)&&! /^(con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i.test(p));}
function crc(bytes){let n=0xffffffff;for(const byte of bytes){n^=byte;for(let i=0;i<8;i++)n=(n>>>1)^((n&1)?0xedb88320:0);}return (n^0xffffffff)>>>0;}
// zip -X emits no extra fields; reject hidden metadata and alternate-name overrides.
function extras(bytes){demand(bytes.length===0);}
/** Bounded subset emitted by the selected ZIP protocol: regular files, store/deflate, no descriptors/ZIP64/encryption. */
function inspectZip(bytes,expected){
 let phase='archive-structure';try{
 demand(bytes.length>=22);const end=bytes.length-22;demand(bytes.readUInt32LE(end)===0x06054b50&&bytes.readUInt16LE(end+20)===0&&bytes.readUInt16LE(end+4)===0&&bytes.readUInt16LE(end+6)===0);
 const count=bytes.readUInt16LE(end+10),size=bytes.readUInt32LE(end+12),start=bytes.readUInt32LE(end+16);demand(count!==65535&&count===bytes.readUInt16LE(end+8)&&start+size===end);phase='archive-inventory';demand(count===expected.size);
 let p=start,localEnd=0;const found=new Map(),collisions=new Set();
 for(let index=0;index<count;index++){
  phase=`entry-${index}-header`;
  demand(p+46<=end&&bytes.readUInt32LE(p)===0x02014b50);const flags=bytes.readUInt16LE(p+8),method=bytes.readUInt16LE(p+10),checksum=bytes.readUInt32LE(p+16),compressed=bytes.readUInt32LE(p+20),uncompressed=bytes.readUInt32LE(p+24),n=bytes.readUInt16LE(p+28),x=bytes.readUInt16LE(p+30),comment=bytes.readUInt16LE(p+32),offset=bytes.readUInt32LE(p+42),external=bytes.readUInt32LE(p+38),mode=external>>>16;
  demand((flags&~0x0806)===0&&(method===0||method===8)&&!(method===0&&(flags&6))&&bytes.readUInt16LE(p+6)<=20&&bytes.readUInt16LE(p+34)===0&&comment===0&&p+46+n+x<=end);
  phase=`entry-${index}-mode`;demand((bytes.readUInt16LE(p+4)>>>8)===3&&mode===0o100644&&(external&0xffff)===0);
  phase=`entry-${index}-path`;
  const rawName=bytes.subarray(p+46,p+46+n),name=new TextDecoder('utf-8',{fatal:true}).decode(rawName);demand(Buffer.from(name).equals(rawName));nameSafe(name);const key=name.normalize('NFC').toLowerCase();demand(!collisions.has(key));collisions.add(key);
  phase=`entry-${index}-inventory`;const wanted=expected.get(name);demand(wanted&&uncompressed===wanted.length&&compressed!==0xffffffff&&uncompressed!==0xffffffff&&offset===localEnd);extras(bytes.subarray(p+46+n,p+46+n+x));
  phase=`entry-${index}-local-header`;
  demand(offset+30<=start&&bytes.readUInt32LE(offset)===0x04034b50&&bytes.readUInt16LE(offset+4)===bytes.readUInt16LE(p+6)&&bytes.readUInt16LE(offset+6)===flags&&bytes.readUInt16LE(offset+8)===method&&bytes.readUInt32LE(offset+14)===checksum&&bytes.readUInt32LE(offset+18)===compressed&&bytes.readUInt32LE(offset+22)===uncompressed);
  demand(bytes.subarray(offset+10,offset+14).equals(bytes.subarray(p+12,p+16)));const ln=bytes.readUInt16LE(offset+26),lx=bytes.readUInt16LE(offset+28),dataStart=offset+30+ln+lx;demand(ln===n&&dataStart+compressed<=start&&bytes.subarray(offset+30,offset+30+ln).equals(rawName));extras(bytes.subarray(offset+30+ln,dataStart));
  phase=`entry-${index}-content`;const packed=bytes.subarray(dataStart,dataStart+compressed);let content;
  if(method===0){demand(compressed===uncompressed);content=packed;}else{const inflated=zlib.inflateRawSync(packed,{maxOutputLength:Math.max(1,wanted.length),info:true});demand(inflated.engine.bytesWritten===compressed);content=inflated.buffer;}
  demand(content.length===uncompressed&&crc(content)===checksum&&content.equals(wanted));found.set(name,content);localEnd=dataStart+compressed;p+=46+n+x;
 }
 phase='archive-structure';demand(p===end&&localEnd===start&&found.size===expected.size);return found;
 }catch{const error=Error('Archive verification failed');error.verificationScope=phase;throw error;}
}
function plan(prepared,snapshot,declaration,artifact){
 const format=artifact.format==='plugin-zip'?'plugin-zip':'portable-zip',inventory=JSON.parse(fs.readFileSync(path.join(prepared,'release/manifest.json'),'utf8')),entries=new Map();
 const add=(name,bytes)=>{nameSafe(name);demand(!entries.has(name));entries.set(name,bytes);};
 for(const asset of snapshot.assets){const bytes=fs.readFileSync(path.join(prepared,asset.source));for(const dest of asset.destinations[format])add(dest,bytes);}
 const views=hostMetadata(snapshot.name,snapshot.version);for(const dest of inventory.generated.find(g=>g.role==='host-metadata').destinations[format]){const view=dest==='plugin.json'?'generic':dest.startsWith('.codex-')?'codex':dest.startsWith('.claude-')?'claude':dest.startsWith('.gemini-')?'gemini':null;demand(view);add(dest,json(views[view]));}
 const files=[...entries].map(([path,bytes])=>({path,size:bytes.length,sha256:hash(bytes)})).sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0),payload_digest=digest(files),build_input_digest=digest(snapshot.build_inputs.map(({path,size,sha256})=>({path,size,sha256})));
 const metadata={schema_version:'1.0',kind:'release-metadata',name:snapshot.name,version:snapshot.version,source_revision:snapshot.source_revision,source_epoch:snapshot.source_epoch,development_snapshot:snapshot.development_snapshot,format:format==='portable-zip'?'portable':'plugin',scope:declaration.scope,contracts:declaration.contracts,prerequisites:declaration.prerequisites,targets:declaration.targets,files,payload_digest,build_input_digest,release_ready:false},metadataBytes=json(metadata),names=inventory.generated.find(g=>g.role==='release-metadata').destinations[format];demand(names.length===1);add(names[0],metadataBytes);
 demand(artifact.name===snapshot.name&&artifact.version===snapshot.version&&artifact.source_revision===snapshot.source_revision&&artifact.payload_digest===payload_digest&&artifact.build_input_digest===build_input_digest&&artifact.release_metadata_sha256===hash(metadataBytes));
 const filename=`${snapshot.name}-${snapshot.version}${format==='plugin-zip'?'-plugin':''}${artifact.format==='skill-alias'?'.skill':'.zip'}`;demand(artifact.filename===filename);
 return {entries,metadata,metaName:names[0]};
}
function privacyCheck(entries,context){
 const normalize=v=>String(v).normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim(),values=[];
 const facts=JSON.parse(fs.readFileSync(safeAbsolute(context.factsFile),'utf8').replace(/^\uFEFF/,''));
 function walk(v,key=''){if(typeof v==='string'&&/^(name|email|phone|employer)$/.test(key))values.push(v);else if(v&&typeof v==='object')for(const [k,item]of Object.entries(v))walk(item,k);}
 walk(facts.candidate);for(const job of facts.employment||[])if(job.employer)values.push(job.employer);
 if(context.extraIdentifiersFile){const extra=JSON.parse(fs.readFileSync(safeAbsolute(context.extraIdentifiersFile),'utf8').replace(/^\uFEFF/,''));demand(Array.isArray(extra)&&extra.every(v=>typeof v==='string'));values.push(...extra);}
 const terms=[...new Set(values.map(normalize).filter(v=>v.length>=4))];demand(terms.length);
 for(const [name,bytes]of entries){const texts=[normalize(name),normalize(bytes.toString('utf8'))];for(const term of terms)if(texts.some(s=>s.includes(term)||(/^\+?[\d\s().-]{8,}$/.test(term)&&s.replace(/\D/g,'').includes(term.replace(/\D/g,'')))))return false;}return true;
}
function extract(entries,destination){
 const target=safeAbsolute(destination);demand(!fs.existsSync(target));fs.mkdirSync(path.dirname(target),{recursive:true});safeAbsolute(target);fs.mkdirSync(target);
 for(const [name,bytes]of entries){const file=path.resolve(target,...name.split('/'));demand(file.startsWith(target+path.sep));safeAbsolute(file);fs.mkdirSync(path.dirname(file),{recursive:true});safeAbsolute(file);fs.writeFileSync(file,bytes,{flag:'wx',mode:0o644});}
 const actual=[];function list(relative=''){safeAbsolute(path.join(target,relative));for(const e of fs.readdirSync(path.join(target,relative),{withFileTypes:true})){const name=relative?relative+'/'+e.name:e.name;demand(!e.isSymbolicLink());if(e.isDirectory())list(name);else{demand(e.isFile()&&entries.has(name));const file=safeAbsolute(path.join(target,name)),bytes=fs.readFileSync(file);demand(bytes.equals(entries.get(name)));actual.push(name);}}}list();demand(isDeepStrictEqual(actual.sort(),[...entries.keys()].sort()));
}
/** expected={artifact:closed outer record,prepared:{root,sourceRevision,sourceEpoch},destination?:absent absolute dir}.
 * The caller independently selects the source and record. Optional host-only privacyContext={factsFile,extraIdentifiersFile?}.
 * Passing archive verification never grants release readiness, human privacy review or installed host acceptance.
 */
function verifyArtifact(archive,expected,privacyContext){let scope='selected-source';try{
 demand(expected&&isDeepStrictEqual(Object.keys(expected).sort(),expected.destination===undefined?['artifact','prepared']:['artifact','destination','prepared']));
 const {prepared,artifact}=expected;demand(prepared&&/^[a-f0-9]{40}$/.test(prepared.sourceRevision)&&Number.isSafeInteger(prepared.sourceEpoch));const root=safeAbsolute(prepared.root),verified=verifyPreparedCandidate(root,{sourceRevision:prepared.sourceRevision,sourceEpoch:prepared.sourceEpoch});if(verified.status!=='passed')return verified;
 // Verify the loaded verifier/validation closure against the caller-selected source as well.
 for(const relative of ['release/verify.cjs','release/prepare.cjs','release/candidate-definition.cjs','release/candidate.schema.json','release/check.cjs','tests/portable-skill-release/foundation.cjs']){const input=verified.value.snapshot.build_inputs.find(i=>i.path===relative);demand(input&&hash(fs.readFileSync(path.resolve(__dirname,'..',relative)))===input.sha256);}
 scope='outer-record';const valid=validateRecord(artifact);if(valid.status!=='passed')return failure(scope,valid.status);demand(artifact.kind==='artifact');const declaration=readDeclaration(root);if(declaration.status!=='passed')return declaration;
 const expectedPlan=plan(root,verified.value.snapshot,declaration.value.declaration,artifact);
 scope='actual-archive';const file=safeAbsolute(archive),stat=fs.lstatSync(file);demand(stat.isFile()&&stat.size===artifact.size);const maxSize=[...expectedPlan.entries].reduce((sum,[name,b])=>sum+b.length+Buffer.byteLength(name)*2+512,22);demand(stat.size<=maxSize);const bytes=fs.readFileSync(file);demand(bytes.length===artifact.size&&hash(bytes)===artifact.sha256);const entries=inspectZip(bytes,expectedPlan.entries);demand(isDeepStrictEqual(JSON.parse(entries.get(expectedPlan.metaName)),expectedPlan.metadata));
 let privacy='not_assessed';if(privacyContext!==undefined){scope='host-privacy';try{demand(isDeepStrictEqual(Object.keys(privacyContext).sort(),privacyContext.extraIdentifiersFile===undefined?['factsFile']:['extraIdentifiersFile','factsFile']));if(!privacyCheck(entries,privacyContext))return failure(scope);privacy='passed';}catch{return failure(scope,'not_assessed');}}
 if(expected.destination!==undefined){scope='extraction';const dest=safeAbsolute(expected.destination);demand(dest!==root&&!dest.startsWith(root+path.sep)&&!root.startsWith(dest+path.sep)&&!file.startsWith(dest+path.sep));extract(entries,dest);}
 return {status:'passed',value:{artifact,inventory:[...entries].map(([path,b])=>({path,size:b.length,sha256:hash(b)})),privacy,release_ready:false,installed_acceptance:'not_assessed'},checks:[{method:'independent-bounded-ZIP-entry-and-selected-source-verification',observation_class:'actual',status:'passed',limits:'Exact generic allowlist/content/metadata verified. Human privacy inspection remains required; optional private identifier scan is host-only. No WordCraft or installed-host evidence.'}]};
 }catch(error){return failure(/^archive-(structure|inventory)$|^entry-\d+-(header|mode|path|inventory|local-header|content)$/.test(error.verificationScope||'')?error.verificationScope:scope);}}
module.exports={verifyArtifact};
if(require.main===module){let result;try{const args=process.argv.slice(2),options={};for(let i=0;i<args.length;i+=2){demand(['--archive','--expected','--privacy-facts','--privacy-extra'].includes(args[i])&&!Object.hasOwn(options,args[i])&&args[i+1]);options[args[i]]=args[i+1];}demand(options['--archive']&&options['--expected']&&(!options['--privacy-extra']||options['--privacy-facts']));result=verifyArtifact(options['--archive'],JSON.parse(fs.readFileSync(options['--expected'],'utf8')),options['--privacy-facts']?{factsFile:options['--privacy-facts'],...(options['--privacy-extra']?{extraIdentifiersFile:options['--privacy-extra']}:{})}:undefined);}catch{result=failure('command-line');}console.log(JSON.stringify(result,null,2));if(result.status!=='passed')process.exitCode=1;}
