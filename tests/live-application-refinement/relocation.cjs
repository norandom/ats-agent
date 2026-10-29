'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
function relocated(root,file){if(!process.env.M4_ACCEPTANCE_ROOT)return false;assert.equal(path.resolve(process.env.M4_ACCEPTANCE_ROOT),root);assert.ok(!fs.existsSync(path.join(root,'.git')));const marker=JSON.parse(fs.readFileSync(path.join(root,'.strategy-acceptance.json')));assert.equal(marker.kind,'synthetic-relocation');const relative=path.relative(root,file).split(path.sep).join('/');assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),marker.manifest[relative]);return true;}
module.exports={relocated};
