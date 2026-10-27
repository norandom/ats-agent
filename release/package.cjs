'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process'),{createHash}=require('node:crypto');
require('./check.cjs');
const files=require('./manifest.json'),version=fs.readFileSync('VERSION','utf8').trim();
const hash=b=>createHash('sha256').update(b).digest('hex'),stage='outputs/package-stage';
assert.ok(!fs.existsSync(stage),'Fresh package stage required');const entries={};
for(const file of files){const name=file.replace(/^skills\//,''),target=path.join(stage,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(file,target);entries[name]=hash(fs.readFileSync(file));}
const meta='targeted-cv/RELEASE.json';fs.writeFileSync(path.join(stage,meta),JSON.stringify({version,channel:'alpha',wordcraft:'desktop MCP required; tested 0.10.0',scope:'M1-M3; conversational refinement and full distribution acceptance remain pending',files:entries},null,2)+'\n');
const names=[...Object.keys(entries),meta].sort();
for(const name of names){fs.chmodSync(path.join(stage,name),0o644);fs.utimesSync(path.join(stage,name),new Date('2000-01-01T00:00:00Z'),new Date('2000-01-01T00:00:00Z'));}
fs.mkdirSync('dist',{recursive:true});const zip=path.resolve('dist',`targeted-cv-${version}.zip`);
execFileSync('zip',['-X','-q',zip,...names],{cwd:stage});
assert.deepEqual(execFileSync('unzip',['-Z1',zip],{encoding:'utf8'}).trim().split('\n'),names);
for(const name of names)assert.equal(hash(execFileSync('unzip',['-p',zip,name])),hash(fs.readFileSync(path.join(stage,name))),'Archive content mismatch');
const skill=zip.replace(/\.zip$/,'.skill');fs.copyFileSync(zip,skill);
fs.writeFileSync('dist/SHA256SUMS',[zip,skill].map(f=>hash(fs.readFileSync(f))+'  '+path.basename(f)).join('\n')+'\n');
console.log('PASS inspected ZIP/.skill: '+names.length+' entries; no inputs, tests, generated applications or legacy Python.');
