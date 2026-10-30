'use strict';
// Read-only maintenance. No removal, restoration, Git write or MCP call.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process'),{isDeepStrictEqual:same}=require('node:util');
const {evaluateReadiness}=require('./readiness.cjs'),prepare=require('./prepare.cjs');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const approvedPlan=Object.freeze({schema_version:'1.1',kind:'retirement-declaration',remove:Object.freeze(['main.py','ats_agent.py','cv_parser.py','ats_industry_standards.py','german_cv_knowledge.py','example.py','requirements.txt','.env.example']),update:Object.freeze(['docs/README.md','docs/legacy-cli.md','.kiro/steering/product.md','.kiro/steering/tech.md','.kiro/steering/structure.md']),recovery_policy:'prior-revision-and-dedicated-diff-only',preserve_ignored:true,execution_task:'7.1'});
function demand(v){if(!v)throw Error('Retirement precondition failed');}
function closed(v,keys){demand(v&&typeof v==='object'&&!Array.isArray(v)&&same(Object.keys(v).sort(),keys.slice().sort()));}
const failed=scope=>({status:'failed',issues:[{category:'retirement',scope,next_action:'Retain legacy and private files; select current accepted evidence and the unchanged approved scope.'}]});
function validatePlan(plan){return same(plan,approvedPlan)?{status:'passed',value:structuredClone(plan),checks:[]}:failed('approved-plan');}
function absolute(file){demand(typeof file==='string'&&path.isAbsolute(file));let c=path.parse(file).root;for(const p of path.resolve(file).slice(c.length).split(path.sep).filter(Boolean)){c=path.join(c,p);demand(!fs.lstatSync(c).isSymbolicLink());}return c;}
function pinned(s){closed(s,['path','expected_sha256']);demand(/^[a-f0-9]{64}$/.test(s.expected_sha256));const file=absolute(s.path),stat=fs.lstatSync(file);demand(stat.isFile()&&stat.nlink===1);const bytes=fs.readFileSync(file);demand(hash(bytes)===s.expected_sha256);return {value:JSON.parse(bytes),bytes};}
function git(root,args){return execFileSync('git',args,{cwd:root,windowsHide:true,maxBuffer:64*1024*1024,stdio:['pipe','pipe','pipe']});}
function revision(root,r){demand(typeof r==='string'&&/^[a-f0-9]{40}$/.test(r));demand(git(root,['rev-parse','--verify',r+'^{commit}']).toString().trim()===r);}
function tree(root,r){return new Map(git(root,['ls-tree','-r','-z',r]).toString().split('\0').filter(Boolean).map(line=>{const [head,file]=line.split('\t'),[mode,type,id]=head.split(' ');return [file,{mode,type,id}];}));}
function blob(root,r,file){const t=tree(root,r).get(file);demand(t?.mode==='100644'&&t.type==='blob');return git(root,['cat-file','blob',t.id]);}
function sameCheckout(root,r,file,exact=false){const f=absolute(path.join(root,file)),s=fs.lstatSync(f);demand(s.isFile()&&s.nlink===1);const normal=b=>Buffer.from([...b].filter((x,i)=>x!==13||b[i+1]!==10));const raw=fs.readFileSync(f),selected=blob(root,r,file);demand(exact?raw.equals(selected):normal(raw).equals(normal(selected)));}
/** Git canonical path/size/hash identity excludes checkout_sha256 (EOL-only state). */
function verifySourceScope({root,currentRevision,acceptedRevision,buildInputs,payloadPaths=[],phase}){
 try{absolute(root);revision(root,currentRevision);revision(root,acceptedRevision);demand(['before-removal','after-removal'].includes(phase));demand(git(root,['rev-parse','HEAD']).toString().trim()===currentRevision);demand(Array.isArray(buildInputs));
  const current=tree(root,currentRevision),accepted=tree(root,acceptedRevision);git(root,['merge-base','--is-ancestor',acceptedRevision,currentRevision]);
  const generic=new Set(buildInputs.map(f=>f.path)),policyPaths=new Set([...approvedPlan.remove,...approvedPlan.update]);
  const changed=git(root,['diff','--name-only','--no-renames','-z',acceptedRevision,currentRevision,'--']).toString().split('\0').filter(Boolean);
  for(const file of changed){const metadata=/^\.kiro\/specs\/portable-skill-release\/[^/]+\.(?:md|json)$/.test(file);demand(generic.has(file)||policyPaths.has(file)||metadata);if(metadata&&current.has(file))demand(current.get(file).mode==='100644'&&current.get(file).type==='blob');}
  for(const f of buildInputs){demand(f&&typeof f.path==='string'&&!f.path.includes('..')&&!path.isAbsolute(f.path));const bytes=blob(root,currentRevision,f.path);demand(bytes.length===f.size&&hash(bytes)===f.sha256);sameCheckout(root,currentRevision,f.path,payloadPaths.includes(f.path));}
  for(const f of approvedPlan.remove){demand(accepted.has(f));if(phase==='before-removal'){demand(current.has(f)&&same(current.get(f),accepted.get(f)));sameCheckout(root,currentRevision,f);}else demand(!current.has(f)&&!fs.existsSync(path.join(root,f)));}
  // A conservative ownership screen, not a Python parser. Any legacy module-name
  // token in retained tracked Python (including comments/dynamic imports) requires
  // ownership review. This cannot silently approve an ambiguous surviving consumer.
  const names=approvedPlan.remove.filter(f=>f.endsWith('.py')).map(f=>f.slice(0,-3)).join('|'),references=new RegExp('\\b(?:'+names+')\\b');
  for(const [f,row]of current)if(f.endsWith('.py')&&!approvedPlan.remove.includes(f)){demand(row.mode==='100644');demand(!references.test(blob(root,currentRevision,f).toString('utf8')));}
  return {status:'passed',value:{current_revision:currentRevision,accepted_revision:acceptedRevision,phase},checks:[]};
 }catch{return failed('current-source-scope');}
}
function validateAttempt(a){closed(a,['schema_version','kind','phase','plan_sha256','source_a','recovery_revision','retirement_revision','source_b','dedicated_diff_sha256']);demand(a.schema_version==='1.1'&&a.kind==='retirement-attempt'&&['before-removal','after-removal'].includes(a.phase));demand(/^[a-f0-9]{64}$/.test(a.plan_sha256)&&/^[a-f0-9]{40}$/.test(a.source_a)&&/^[a-f0-9]{40}$/.test(a.recovery_revision));if(a.phase==='before-removal')demand(a.retirement_revision===null&&a.source_b===null&&a.dedicated_diff_sha256===null);else demand(/^[a-f0-9]{40}$/.test(a.retirement_revision)&&/^[a-f0-9]{40}$/.test(a.source_b)&&/^[a-f0-9]{64}$/.test(a.dedicated_diff_sha256));return a;}
function verifyDedicatedChange({root,recoveryRevision,retirementRevision,currentRevision,acceptedRevision,expectedDiffSha256}){
 try{for(const r of [recoveryRevision,retirementRevision,currentRevision,acceptedRevision])revision(root,r);demand(git(root,['rev-parse',retirementRevision+'^']).toString().trim()===recoveryRevision);git(root,['merge-base','--is-ancestor',retirementRevision,currentRevision]);
  for(const f of approvedPlan.remove)demand(blob(root,recoveryRevision,f).equals(blob(root,acceptedRevision,f)));
  const diff=git(root,['diff','--binary','--no-ext-diff',recoveryRevision,retirementRevision,'--']);demand(hash(diff)===expectedDiffSha256);
  const rows=git(root,['diff','--name-status','--no-renames',recoveryRevision,retirementRevision,'--']).toString().trim().split('\n').filter(Boolean).map(s=>s.split('\t'));demand(same(rows.map(r=>r[1]).sort(),[...approvedPlan.remove,...approvedPlan.update].sort()));for(const [status,file]of rows)demand(status===(approvedPlan.remove.includes(file)?'D':'M'));
  for(const file of approvedPlan.update)sameCheckout(root,currentRevision,file);return {status:'passed',value:{recovery_revision:recoveryRevision,retirement_revision:retirementRevision,diff_sha256:expectedDiffSha256},checks:[]};
 }catch{return failed('dedicated-retirement-diff');}
}
function readiness(s){closed(s,['candidate','verifiedArtifacts','installedEvidence','checks','rightsReview']);return evaluateReadiness(s.candidate,s.verifiedArtifacts,s.installedEvidence,s.checks,s.rightsReview);}
function verifyBLineage({root,currentRevision,sourceRevision,retirementRevision}){try{revision(root,currentRevision);revision(root,sourceRevision);revision(root,retirementRevision);demand(git(root,['rev-parse','HEAD']).toString().trim()===currentRevision);git(root,['merge-base','--is-ancestor',retirementRevision,sourceRevision]);git(root,['merge-base','--is-ancestor',sourceRevision,currentRevision]);return {status:'passed',checks:[]};}catch{return failed('candidate-b-lineage');}}
/** Independently selected readiness inputs, never a stored ready report. Operator
 * authentication of actual host observations/reviews and task authorization remains required.
 * @param {{path:string,expected_sha256:string}} plan
 * @param {{readiness:object,validation:{path:string,expected_sha256:string}}} acceptedCandidate
 * @param {{root:string,currentRevision:string,attempt:{path:string,expected_sha256:string},candidateB:object|null}} currentSource
 * @returns {{schema_version:string,kind:string,status:string,phase:string|null,accepted_a:object|null,candidate_b:object|null,recovery_revision:string|null,execution:string,mutation_authority:boolean,issues:object[],limits:string[]}}
 */
function checkRetirement(plan,acceptedCandidate,currentSource){
 let phase=null,recovery=null,a=null,b=null;const finish=(status,scope)=>({schema_version:'1.1',kind:'retirement-decision',status,phase,accepted_a:a?.candidate||null,candidate_b:b?.candidate||null,recovery_revision:recovery,execution:'not_assessed',mutation_authority:false,issues:scope?failed(scope).issues:[],limits:['Read-only checks do not authorize removal or authenticate a reviewer. The operator must verify actual observations and approved task scope.','Task 7.1 executes only after accepted A. Completion requires fresh accepted B. Retain prior revision and dedicated diff; never reset unrelated work or rewrite history.']});
 if(plan===undefined&&acceptedCandidate===undefined&&currentSource===undefined)return finish('not_assessed','missing-evidence');
 try{const p=pinned(plan);demand(validatePlan(p.value).status==='passed');closed(currentSource,['root','currentRevision','attempt','candidateB']);absolute(currentSource.root);revision(currentSource.root,currentSource.currentRevision);demand(path.resolve(plan.path)===path.join(path.resolve(currentSource.root),'release/retirement.json'));sameCheckout(currentSource.root,currentSource.currentRevision,'release/retirement.json');
  for(const file of approvedPlan.update)sameCheckout(currentSource.root,currentSource.currentRevision,file);
  const record=validateAttempt(pinned(currentSource.attempt).value);phase=record.phase;recovery=record.recovery_revision;demand(record.plan_sha256===plan.expected_sha256);closed(acceptedCandidate,['readiness','validation']);a=readiness(acceptedCandidate.readiness);demand(a.status==='ready'&&a.candidate.source_revision===record.source_a);
  const validator=require('../tests/portable-skill-release/full-acceptance.cjs');demand(validator.validateAcceptanceReport(pinned(acceptedCandidate.validation).value,acceptedCandidate.readiness,'candidate-a'));
  const snapshot=JSON.parse(fs.readFileSync(path.join(acceptedCandidate.readiness.candidate.prepared.root,prepare.descriptorName)));demand(snapshot.development_snapshot===false);
  if(phase==='before-removal'){demand(currentSource.candidateB===null&&recovery===currentSource.currentRevision);demand(verifySourceScope({root:currentSource.root,currentRevision:currentSource.currentRevision,acceptedRevision:record.source_a,buildInputs:snapshot.build_inputs,payloadPaths:snapshot.assets.map(x=>x.source),phase}).status==='passed');}
  else{demand(verifyDedicatedChange({root:currentSource.root,recoveryRevision:recovery,retirementRevision:record.retirement_revision,currentRevision:currentSource.currentRevision,acceptedRevision:record.source_a,expectedDiffSha256:record.dedicated_diff_sha256}).status==='passed');
   b=readiness(currentSource.candidateB);demand(b.status==='ready'&&b.candidate.source_revision===record.source_b&&record.source_b!==record.source_a);demand(verifyBLineage({root:currentSource.root,currentRevision:currentSource.currentRevision,sourceRevision:record.source_b,retirementRevision:record.retirement_revision}).status==='passed');demand(b.artifacts.every(x=>!a.artifacts.some(y=>x.sha256===y.sha256)));demand(!b.reviews.some(x=>a.reviews.some(y=>x.sha256===y.sha256)));demand(b.support.filter(x=>x.workflow_verified==='passed').every(x=>!a.support.some(y=>y.evidence_index?.sha256===x.evidence_index?.sha256)));
   const snapshotB=JSON.parse(fs.readFileSync(path.join(currentSource.candidateB.candidate.prepared.root,prepare.descriptorName)));demand(snapshotB.development_snapshot===false);demand(verifySourceScope({root:currentSource.root,currentRevision:currentSource.currentRevision,acceptedRevision:record.source_a,buildInputs:snapshotB.build_inputs,payloadPaths:snapshotB.assets.map(x=>x.source),phase}).status==='passed');
   const canonical=rows=>rows.filter(x=>!approvedPlan.update.includes(x.path)).map(({path,size,sha256})=>({path,size,sha256}));demand(same(canonical(snapshot.build_inputs),canonical(snapshotB.build_inputs)));
  }
  demand(git(currentSource.root,['rev-parse','HEAD']).toString().trim()===currentSource.currentRevision);for(const file of approvedPlan.update)sameCheckout(currentSource.root,currentSource.currentRevision,file);demand(hash(fs.readFileSync(absolute(acceptedCandidate.validation.path)))===acceptedCandidate.validation.expected_sha256);demand(hash(fs.readFileSync(absolute(plan.path)))===plan.expected_sha256&&hash(fs.readFileSync(absolute(currentSource.attempt.path)))===currentSource.attempt.expected_sha256);return finish('passed',null);
 }catch{return finish('failed','replacement-and-approved-scope');}
}
module.exports={approvedPlan,validatePlan,validateAttempt,verifySourceScope,verifyDedicatedChange,verifyBLineage,checkRetirement,hash};
if(require.main===module){let r;try{const args=process.argv.slice(2);demand(args.length===1);const o=JSON.parse(fs.readFileSync(args[0]));closed(o,['plan','acceptedCandidate','currentSource']);r=checkRetirement(o.plan,o.acceptedCandidate,o.currentSource);}catch{r=checkRetirement(null,null,null);}console.log(JSON.stringify(r,null,2));if(r.status!=='passed')process.exitCode=1;}
