'use strict';
// Maintenance checks only. No candidate discovery, application flow or document operations.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const own=["release/adopter-guide.md","tests/portable-skill-release/adopter-guide.test.cjs","tests/portable-skill-release/fixtures.test.cjs","tests/portable-skill-release/fixtures/applicant-a.facts.json","tests/portable-skill-release/fixtures/applicant-a.offer.json","tests/portable-skill-release/fixtures/applicant-a.settings.json","tests/portable-skill-release/fixtures/applicant-a.source.json","tests/portable-skill-release/fixtures/applicant-a.turns.json","tests/portable-skill-release/fixtures/applicant-b.facts.json","tests/portable-skill-release/fixtures/applicant-b.offer.json","tests/portable-skill-release/fixtures/applicant-b.settings.json","tests/portable-skill-release/fixtures/applicant-b.source.json","tests/portable-skill-release/fixtures/applicant-b.turns.json","release/candidate.json","release/candidate.schema.json","release/candidate-definition.cjs","tests/portable-skill-release/contracts.test.cjs",'tests/portable-skill-release/foundation.cjs','tests/portable-skill-release/foundation.test.cjs','tests/portable-skill-release/manifest.json','tests/portable-skill-release/scenarios.md'];
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function checkRegularFile(root,relative){
 if(typeof relative!=='string'||!relative||relative.includes('\\')||relative.startsWith('/')||/^[A-Za-z]:/.test(relative)||relative.split('/').some(p=>!p||p==='.'||p==='..')||/^(private|outputs|examples|\.git|\.agents|\.codex)(\/|$)/i.test(relative)||/(^|\/)(\.env(?:\..*)?|credentials?)(\/|$)/i.test(relative))throw Error('Forbidden closure path');
 let current=path.resolve(root);for(const part of relative.split('/')){current=path.join(current,part);const stat=fs.lstatSync(current);if(stat.isSymbolicLink())throw Error('Redirected closure link');}
 if(!fs.statSync(current).isFile())throw Error('Closure asset must be a regular file');return current;
}
function validateFoundation(root,manifest){
 if(manifest.schema_version!=='1.0'||manifest.kind!=='release-test-foundation')throw Error('Unknown foundation contract');
 const prior=JSON.parse(fs.readFileSync(path.join(root,'tests/live-application-refinement/acceptance-manifest.json')));
 const expectedCore=[...prior.runtime].sort(),actualCore=manifest.core.map(a=>a.path).sort();
 if(JSON.stringify(actualCore)!==JSON.stringify(expectedCore)||actualCore.length!==31)throw Error('Incomplete core inventory');
 const expectedMaintenance=[...prior.tests,...own].sort();
 if(JSON.stringify([...manifest.maintenance].sort())!==JSON.stringify(expectedMaintenance))throw Error('Incomplete or unexpected maintenance inventory');
 const all=[...actualCore,...manifest.maintenance];if(new Set(all).size!==all.length)throw Error('Duplicate closure asset');
 for(const file of all)checkRegularFile(root,file);
 for(const asset of manifest.core){if(!/^[a-f0-9]{64}$/.test(asset.sha256)||hash(fs.readFileSync(path.join(root,asset.path)))!==asset.sha256)throw Error('Changed core hash: '+asset.path);}
 const expected=[6,7,6,8,5,6,6].flatMap((n,g)=>Array.from({length:n},(_,i)=>`${g+1}.${i+1}`)).sort();
 if(JSON.stringify(manifest.coverage.map(r=>r.requirement).sort())!==JSON.stringify(expected))throw Error('Incomplete criterion map');
 const classes=['actual','control','host_judgment'];if(JSON.stringify(manifest.observation_classes)!==JSON.stringify(classes))throw Error('Invalid observation classes');
 for(const row of manifest.coverage)if(row.status!=='not_assessed'||!row.tasks.length||row.tasks.some(t=>!/^\d+(\.\d+)?$/.test(t))||!row.observation_classes.length||row.observation_classes.some(c=>!classes.includes(c)))throw Error('Invalid planned criterion');
 for(const regression of manifest.regressions){checkRegularFile(root,regression.entrypoint);if(!Array.isArray(regression.required_inputs))throw Error('Missing regression input declaration');}
 return {status:'passed',core_count:actualCore.length,criteria_count:expected.length,closure_count:all.length,installed_acceptance:'not_assessed'};
}
function probePrerequisites(run=(command,args)=>spawnSync(command,args,{encoding:'utf8',windowsHide:true,timeout:30000,shell:false})){
 const declarations=[['node','maintenance or selected host','node',['--version'],'22'],['pnpm','maintenance or selected host','pnpm',['--version'],'10.18.3'],['uvx','applicant validator launcher','uvx',['--version'],'0.9.8'],['validator','applicant','uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--version'],'0.38.2'],['zip','maintenance','zip',['-v'],null],['unzip','maintenance','unzip',['-v'],null],['dagger','maintenance','dagger',['version'],'0.21.8']];
 const checks=declarations.map(([id,role,command,args,baseline])=>{let result;try{result=run(command==='pnpm'&&process.platform==='win32'?'pnpm.exe':command,args);}catch{result={status:null};}const version=String(result.stdout||'').match(/(?:^|[^\d])(\d+\.\d+(?:\.\d+)?)/)?.[1]??null;const available=result.status===0&&version!==null;return {id,role,status:available?'passed':'not_assessed',version,baseline,baseline_match:available&&baseline!==null?(id==='node'?version.split('.')[0]===baseline:version===baseline):null};});
 return {observation_class:'actual',checks,installed_acceptance:'not_assessed',limits:['Availability is not installed-workflow acceptance.','Baselines are declared build targets; a different host version is reported without claiming compatibility.','Run the same probes inside the selected Linux build environment separately.']};
}
module.exports={checkRegularFile,validateFoundation,probePrerequisites};
if(require.main===module){if(process.argv[2]==='--probe'){console.log(JSON.stringify(probePrerequisites(),null,2));}else{try{console.log(JSON.stringify(validateFoundation(path.resolve(__dirname,'../..'),require('./manifest.json')),null,2));}catch(error){console.error(error.message);process.exitCode=1;}}}
