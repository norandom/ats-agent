'use strict';
// Select files before passing a directory to Dagger. No private inputs enter CI.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),dest=path.resolve(process.argv[2]||'outputs/release-context');
assert.ok(dest.startsWith(path.join(root,'outputs')+path.sep),'Use a fresh ignored outputs destination');
assert.ok(!fs.existsSync(dest),'Destination exists; choose a fresh directory');
const m=require('../tests/wordcraft-application-documents/acceptance-manifest.json'),prefix='tests/wordcraft-application-documents/';
const files=[...m.runtime,...m.suites.map(f=>prefix+f),...m.support.map(f=>prefix+f),...m.upstream,prefix+'acceptance-manifest.json',prefix+'full-acceptance.cjs','VERSION','package.json','release/manifest.json','release/check.cjs','release/package.cjs'];
for(const file of new Set(files)){
 assert.ok(!path.isAbsolute(file)&&!file.split('/').includes('..')&&!/^(private|outputs|examples)\//.test(file));
 const source=path.join(root,file);assert.ok(fs.lstatSync(source).isFile()&&!fs.lstatSync(source).isSymbolicLink());
 const target=path.join(dest,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(source,target);
}
console.log('Prepared candidate-free Dagger context: '+new Set(files).size+' selected files.');
