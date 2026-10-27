'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const files=require('./manifest.json');assert.equal(new Set(files).size,files.length);
assert.match(fs.readFileSync('VERSION','utf8').trim(),/^\d+\.\d+\.\d+-alpha\.\d+$/);
assert.equal(require('../package.json').version,fs.readFileSync('VERSION','utf8').trim());
for(const file of files){
 assert.match(file,/^skills\/targeted-cv\/(SKILL\.md|references\/[\w-]+\.md|schemas\/[\w.-]+\.json|templates\/[\w.-]+\.json)$/);
 assert.ok(fs.lstatSync(file).isFile()&&!fs.lstatSync(file).isSymbolicLink());
 const text=fs.readFileSync(file,'utf8');if(file.endsWith('.json'))JSON.parse(text);
 if(file.endsWith('.md'))for(const [,link]of text.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)){
  if(link.includes('://'))continue;
  const resolved=path.relative(process.cwd(),path.resolve(path.dirname(file),link)).replaceAll('\\','/');
  assert.ok(files.includes(resolved),'Unpackaged skill link: '+file+' -> '+link);
 }
}
const actual=fs.readdirSync('skills/targeted-cv',{recursive:true}).filter(f=>fs.statSync(path.join('skills/targeted-cv',f)).isFile()).map(f=>'skills/targeted-cv/'+f.replaceAll('\\','/'));
assert.deepEqual(actual.sort(),[...files].sort(),'Unexpected or omitted skill file');
console.log('PASS alpha version, exact '+files.length+'-file allowlist, JSON and relative links.');
