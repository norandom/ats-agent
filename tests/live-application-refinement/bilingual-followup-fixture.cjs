'use strict';
// Copies fixture shape only; existing DOCX baselines are opened/read through MCP.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
function fromRun(source){const old=JSON.parse(fs.readFileSync(path.join(source,'receipt.json'))),f=JSON.parse(fs.readFileSync(path.join(source,'input.json')));assert.ok(!old.error);assert.equal(old.stages.filter(s=>['cv-en','cv-de','letter-en','letter-de'].includes(s.id)).length,4);f.profile=JSON.parse(fs.readFileSync(old.profile.application.path));f.mixedScopeAcceptance=true;
 for(const d of f.documents){const stage=old.stages.find(s=>s.id===d.id),base=d.paragraphs,rows=stage.paragraphs.map((p,i)=>({kind:p.kind,text:p.text,id:d.kind==='cv'?(i===11?old.profile.promoted_ids[0]:i===12?old.profile.local_id:base[i<11?i:i-2].id):base[i].id}));d.paragraphs=rows;if(d.kind==='cover_letter'){d.letter.body=rows.filter(p=>p.kind==='body').map(p=>p.text);d.bodyEvidence={1:[['fact-achievement-one'],[old.profile.promoted_ids[0]],[old.profile.local_id],[old.profile.local_id,old.profile.promoted_ids[0]]]};}}
 return {old,f};}
module.exports={fromRun};
