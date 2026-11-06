'use strict';
// Read-only maintenance definition checks. This does not build or accept an artifact.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const formats=['portable-zip','skill-alias','plugin-zip'];
const core=[
 "skills/targeted-cv/SKILL.md",
 "skills/targeted-cv/references/application-documents.md",
 "skills/targeted-cv/references/application-refinement.md",
 "skills/targeted-cv/references/application-strategy.md",
 "skills/targeted-cv/references/candidate-profile.md",
 "skills/targeted-cv/references/document-presentation.md",
 "skills/targeted-cv/references/document-session.md",
 "skills/targeted-cv/references/document-verification.md",
 "skills/targeted-cv/references/germany-cover-letter.md",
 "skills/targeted-cv/references/profile-contract.md",
 "skills/targeted-cv/references/profile-updates.md",
 "skills/targeted-cv/references/profile-validation.md",
 "skills/targeted-cv/references/refinement-session.md",
 "skills/targeted-cv/references/strategy-contract.md",
 "skills/targeted-cv/references/strategy-editorial.md",
 "skills/targeted-cv/references/strategy-evidence.md",
 "skills/targeted-cv/references/strategy-review.md",
 "skills/targeted-cv/references/wordcraft-capabilities.md",
 "skills/targeted-cv/references/wordcraft-operations.md",
 "skills/targeted-cv/schemas/application-documents-v1.1.schema.json",
 "skills/targeted-cv/schemas/application-documents-v1.schema.json",
 "skills/targeted-cv/schemas/application-documents.schema.json",
 "skills/targeted-cv/schemas/application-strategy-v1.1.schema.json",
 "skills/targeted-cv/schemas/application-strategy-v1.schema.json",
 "skills/targeted-cv/schemas/application-strategy.schema.json",
 "skills/targeted-cv/schemas/cv-facts-application.schema.json",
 "skills/targeted-cv/schemas/cv-facts-v1.schema.json",
 "skills/targeted-cv/schemas/cv-facts.schema.json",
 "skills/targeted-cv/schemas/document-session.schema.json",
  "skills/targeted-cv/schemas/refinement-checkpoint-storage.schema.json",
  "skills/targeted-cv/schemas/refinement-session.schema.json",
 "skills/targeted-cv/templates/cv-facts.blank.json"
];
const extras=[['release/adopter-guide.md','README.md','guide'],['tests/portable-skill-release/fixtures/applicant-a.facts.json','examples/sample-facts.json','sample'],['LICENSE','LICENSE','license'],['THIRD_PARTY_NOTICES.md','THIRD_PARTY_NOTICES.md','notice']];
const generated=[
 {
  "role": "release-metadata",
  "generator": "release/package.cjs",
  "destinations": {
   "portable-zip": [
    "targeted-cv/RELEASE.json"
   ],
   "skill-alias": [
    "targeted-cv/RELEASE.json"
   ],
   "plugin-zip": [
    "RELEASE.json"
   ]
  }
 },
 {
  "role": "host-metadata",
  "generator": "release/candidate-definition.cjs#hostMetadata",
  "destinations": {
   "portable-zip": [],
   "skill-alias": [],
   "plugin-zip": [
    "plugin.json",
    ".codex-plugin/plugin.json",
    ".claude-plugin/plugin.json",
    ".gemini-plugin/plugin.json"
   ]
  }
 }
];
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const sorted=value=>Array.isArray(value)?value.map(sorted):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,sorted(value[k])])):value;
const equal=(a,b)=>JSON.stringify(sorted(a))===JSON.stringify(sorted(b));
function requireThat(condition,message){if(!condition)throw Error(message);}
function closed(value,keys){requireThat(value&&typeof value==='object'&&!Array.isArray(value)&&equal(Object.keys(value).sort(),[...keys].sort()),'Unknown or missing record field');}
function safePath(value){
 requireThat(typeof value==='string'&&value.length>0&&value.split('/').every(p=>/^[A-Za-z0-9_.-]+$/.test(p)&&p!=='.'&&p!=='..'&&!p.endsWith('.')&&!/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p)),'Unsafe asset path');return value;
}
function regular(root,relative){
 safePath(relative);let current=path.resolve(root);requireThat(!fs.lstatSync(current).isSymbolicLink(),'Redirected source root');
 for(const part of relative.split('/')){current=path.join(current,part);requireThat(!fs.lstatSync(current).isSymbolicLink(),'Redirected source asset');}
 requireThat(fs.lstatSync(current).isFile(),'Source asset must be a regular file');return current;
}
function expectedAssets(){
 const mapped=(source,relative,role)=>({source,destinations:Object.fromEntries(formats.map(f=>[f,[(f==='plugin-zip'?'skills/':'')+'targeted-cv/'+relative]])),role,rights_ref:source});
 return [...core.map(s=>mapped(s,s.slice('skills/targeted-cv/'.length),'core')),...extras.map(([s,d,r])=>{const a=mapped(s,d,r);if(['license','notice'].includes(r))a.destinations['plugin-zip'].push(d);return a;})];
}
function listCore(root,relative='skills/targeted-cv'){
 let result=[];for(const e of fs.readdirSync(path.join(root,relative),{withFileTypes:true})){
  const p=relative+'/'+e.name;safePath(p);requireThat(!fs.lstatSync(path.join(root,p)).isSymbolicLink(),'Redirected core resource');
  if(e.isDirectory())result.push(...listCore(root,p));else {regular(root,p);result.push(p);}
 }return result.sort();
}
/** Validate source definitions and hash-bound rights, without mutation or artifact-readiness claims.
 * @param {string} root Explicit repository root.
 * @param {{manifest?: object, rights?: object}} options Optional selected records for validation.
 * @returns {{status: string, value?: object, checks?: object[], issues?: object[]}}
 */
function checkDefinition(root,{manifest,rights}={}){
 let category='definition',scope='release-definition';try{
  const read=p=>JSON.parse(fs.readFileSync(regular(root,p),'utf8'));
  manifest??=read('release/manifest.json');rights??=read('release/rights.json');
  closed(manifest,['schema_version','kind','assets','generated']);
  requireThat(manifest.schema_version==='1.0'&&manifest.kind==='release-inventory','Unknown inventory contract');
  requireThat(Array.isArray(manifest.assets)&&equal(manifest.assets,expectedAssets()),'Incomplete, unexpected or altered asset mapping');
  requireThat(equal(manifest.generated,generated),'Unexpected generated metadata policy');
  scope='core-runtime';requireThat(equal(listCore(root),[...core].sort()),'Unexpected or omitted core resource');
  scope='candidate-identity';const version=fs.readFileSync(regular(root,'VERSION'),'utf8').trim(),pkg=read('package.json');
  requireThat(/^2\.0\.0-alpha\.[1-9][0-9]*$/.test(version)&&Number(version.split('.').at(-1))>=2&&pkg.version===version,'Candidate version mismatch');
  requireThat(pkg.license==='MIT','Project license mismatch');
  const declaration=read('release/candidate.json');
  requireThat(declaration.name==='targeted-cv'&&declaration.inventory_ref==='release/manifest.json'&&declaration.rights_ref==='release/rights.json'&&declaration.project_license==='MIT','Candidate inventory or rights declaration mismatch');
  category='rights';scope='project-license';closed(rights,['schema_version','kind','authorization','assets']);
  requireThat(rights.schema_version==='1.0'&&rights.kind==='asset-rights','Unknown rights contract');
  closed(rights.authorization,['id','basis','license_file','notice_file']);
  requireThat(rights.authorization.id==='owner-selected-MIT-project-content'&&typeof rights.authorization.basis==='string'&&rights.authorization.basis.length>30&&rights.authorization.license_file==='LICENSE'&&rights.authorization.notice_file==='THIRD_PARTY_NOTICES.md','Unresolved project authorization');
  requireThat(Array.isArray(rights.assets)&&rights.assets.length===manifest.assets.length&&new Set(rights.assets.map(r=>r.id)).size===manifest.assets.length,'Missing or duplicate per-asset rights');
  const bytes=new Map();
  for(const a of manifest.assets){
   scope=a.source;const r=rights.assets.find(r=>r.id===a.rights_ref);closed(r,['id','source','source_sha256','origin','origin_ref','license','authorization_ref','required_notices','review_status','review']);
   requireThat(r.source===a.source&&r.id===a.source&&r.origin==='project-authored'&&r.license==='MIT'&&r.authorization_ref===rights.authorization.id&&r.review_status==='reviewed','Unresolved asset rights');
   requireThat(typeof r.review==='string'&&r.review.length>=30,'Missing provenance review');
   requireThat(new RegExp('^git:[a-f0-9]{40}:'+a.source.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$').test(r.origin_ref)||(['license','notice'].includes(a.role)&&r.origin_ref==='owner-selected-license-and-notice:addition'),'Missing asset origin reference');
   requireThat(equal(r.required_notices,['LICENSE','THIRD_PARTY_NOTICES.md']),'Omitted required notices');
   const content=fs.readFileSync(regular(root,a.source));bytes.set(a.source,content);
   requireThat(/^[a-f0-9]{64}$/.test(r.source_sha256)&&hash(content)===r.source_sha256,'Changed asset bytes require renewed rights review');
   if(a.source.endsWith('.json'))JSON.parse(content.toString('utf8'));
  }
  requireThat(bytes.get('LICENSE').toString('utf8')==="MIT License\n\nCopyright (c) 2026 Targeted CV contributors\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n",'Missing or altered MIT terms');
  category='definition';
  for(const format of formats){
   scope=format;
   const installed=new Map();for(const a of manifest.assets)for(const destination of a.destinations[format]){safePath(destination);requireThat(!installed.has(destination.toLowerCase()),'Colliding package destinations');installed.set(destination.toLowerCase(),a);}
   for(const item of manifest.generated)for(const destination of item.destinations[format]){safePath(destination);requireThat(!installed.has(destination.toLowerCase()),'Colliding generated destination');installed.set(destination.toLowerCase(),item);}
   for(const a of manifest.assets)if(a.source.endsWith('.md'))for(const destination of a.destinations[format]){
    for(const [,link]of bytes.get(a.source).toString('utf8').matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)){
     if(/^[a-z][a-z0-9+.-]*:\/\//i.test(link))continue;
     requireThat(!link.startsWith('/')&&!link.includes('\\')&&!link.includes('%'),'Unsafe resource link');
     const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(destination),link));
     requireThat(!resolved.startsWith('../')&&installed.has(resolved.toLowerCase()),'Unpackaged local resource link');
    }
   }
  }
  requireThat(/^name: targeted-cv\r?$/m.test(bytes.get('skills/targeted-cv/SKILL.md').toString('utf8')),'Entrypoint identity mismatch');
  return {status:'passed',value:{version,core_count:core.length,asset_count:manifest.assets.length,artifact_ready:'not_assessed'},checks:[{method:'exact-source-inventory-and-hash-bound-rights',observation_class:'actual',status:'passed',limits:'Definition validation only; recorded rights depend on owner authorization and content review. Generated metadata, archives, privacy and installed acceptance require their separate gates.'}]};
 }catch{return {status:'failed',issues:[{category,scope,next_action:'Restore the approved exact inventory, safe regular source files, matching versions, reviewed source hashes and required license/notices. Revalidate before packaging.'}]};}
}
module.exports={checkDefinition};
if(require.main===module){const result=checkDefinition(path.resolve(__dirname,'..'));console.log(JSON.stringify(result,null,2));if(result.status!=='passed')process.exitCode=1;}
