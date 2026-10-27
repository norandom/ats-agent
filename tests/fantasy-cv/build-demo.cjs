// Test fixture compositor, not the distributable skill or a replacement app.
// Reads candidate facts and offer independently; WordCraft MCP authors the DOCX.
const fs = require('node:fs');
const path = require('node:path');
const [factsPath, offerPath, outputDir] = process.argv.slice(2);
const twoPages = process.argv.includes('--two-pages');
if (!outputDir) throw new Error('Usage: node build-demo.cjs FACTS OFFER OUTPUT_DIR');
const facts = JSON.parse(fs.readFileSync(factsPath,'utf8').replace(/^\uFEFF/,''));
const offer = JSON.parse(fs.readFileSync(offerPath,'utf8').replace(/^\uFEFF/,''));
const out=path.resolve(outputDir); fs.mkdirSync(out,{recursive:true});
const paras=[], headings=[], roles=[], bullets=[], provenance=[];
function add(text,ids=[]){paras.push(text);if(ids.length)provenance.push({text,fact_ids:ids});return text;}
function heading(text){headings.push(add(text));}
const name=add(facts.candidate.name);
const target=add(offer.title);
const contact=add(`${facts.candidate.location.city}, ${facts.candidate.location.country}  |  ${facts.candidate.phone}  |  ${facts.candidate.email}`);
const summary=add(facts.profile[0].statement,[facts.profile[0].id]);
heading('Professional Experience');
function date(value){if(!value)return '';const [y,m]=value.split('-');return m?`${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(m)-1]} ${y}`:y;}
for(const job of facts.employment){
  const when=job.current?'Present':date(job.end);
  roles.push(add(`${job.title}  |  ${job.employer}  |  ${date(job.start)} to ${when}`,[job.id]));
  for(const claim of job.claims) bullets.push(add(claim.statement,[claim.id]));
}
heading('Expertise');
for(const group of facts.skill_groups)for(const claim of group.claims)bullets.push(add(claim.statement,[claim.id]));
if(facts.projects.length){heading('Selected Projects');for(const p of facts.projects)bullets.push(add(`${p.statement} (${date(p.start)} to ${date(p.end)}).`,[p.id]));}
heading('Education and Professional Development');
for(const e of facts.education)add(`${e.qualification}  |  ${e.institution}${e.completion_status==='in_progress'?', in progress':''}`,[e.id]);
for(const c of facts.professional_development)add(`${c.name}  |  ${c.organization}${c.valid_until?`, valid through ${date(c.valid_until)}`:''}`,[c.id]);
if(facts.volunteering.length){heading('Volunteering');for(const v of facts.volunteering)add(`${v.statement} (since ${v.since})`,[v.id]);}
const languages=add('Languages: '+facts.languages.map(l=>`${l.language}: ${l.proficiency}`).join('  |  '),facts.languages.map(l=>l.id));
const note=add('FICTIONAL DEMONSTRATION • Invented candidate, experience and credentials. Not a real application.');
const plan=[]; const call=(tool,args)=>plan.push({tool,args});
const exec=(command,params={})=>call('execute',{command,params});
const batch=commands=>call('batch',{commands:commands.map(([command,params])=>({command,params:params||{}}))});
const select=text=>call('select_text',{text});
call('new_document',{template:'blank'});
call('type_text',{text:paras.join('\n'),paragraphs:true});
exec('select.all');
batch([['layout.size',{name:'A4'}],['layout.margins',{top:36,bottom:36,left:43,right:43}],['format.font',{name:'Calibri'}],['format.size',{size:10.5}],['format.color',{color:'202B3A'}],['para.spacing',{before:0,after:4}],['para.lineSpacing',{value:1.04}],['para.alignLeft'],['para.keepLines',{value:true}]]);
if(twoPages)batch([['layout.margins',{top:43,bottom:43,left:50,right:50}],['format.size',{size:11}],['para.lineSpacing',{value:1.1}]]);
select(name);batch([['para.style',{style:'Title'}],['format.size',{size:30}],['format.bold',{value:true}],['format.color',{color:'174D78'}],['para.spacing',{before:0,after:2}]]);
select(target);batch([['format.size',{size:13}],['format.bold',{value:true}],['format.color',{color:'174D78'}]]);
select(contact);batch([['format.size',{size:9}],['para.spacing',{after:9}]]);
select(summary);batch([['para.shading',{color:'EAF1F8'}],['para.spacing',{before:5,after:9}],['format.size',{size:11}]]);
for(const h of headings){select(h);batch([['para.heading1'],['format.size',{size:12}],['format.color',{color:'174D78'}],['format.bold',{value:true}],['para.spacing',{before:8,after:5}],['para.keepNext',{value:true}]]);}
if(twoPages){select('Expertise');exec('para.pageBreakBefore',{value:true});}
for(const r of roles){select(r);batch([['format.bold',{value:true}],['format.size',{size:10.5}],['para.spacing',{before:5,after:3}],['para.keepNext',{value:true}]]);}
for(const b of bullets){select(b);batch([['para.bullets',{kind:'bullet'}],['para.indents',{left:10,firstLine:-10}],['para.spacing',{before:0,after:3}]]);}
select(languages);batch([['para.spacing',{before:5,after:4}],['format.size',{size:10}]]);
select(note);batch([['format.size',{size:8}],['format.color',{color:'617083'}],['para.spacing',{before:8,after:0}]]);
exec('insert.createFooter');
exec('para.alignRight');
exec('format.size',{size:9});
exec('format.color',{color:'617083'});
call('type_text',{text:offer.language==='de'?'Seite ':'Page '});
exec('insert.field',{instr:'PAGE'});
call('type_text',{text:' / '});
exec('insert.field',{instr:'NUMPAGES'});
exec('insert.closeHeader');
exec('references.updateFields',{all:true});
call('save_document',{path:path.join(out,'john-doe-cv.docx')});
call('open_document',{path:path.join(out,'john-doe-cv.docx')});
call('get_text',{});call('inspect_document',{});
plan.push({tool:'render_page',args:{page:1,scale:1.5},image:'page-1.png'});
fs.writeFileSync(path.join(out,'mcp-plan.json'),JSON.stringify(plan,null,2));
fs.writeFileSync(path.join(out,'claim-map.json'),JSON.stringify(provenance,null,2));
fs.writeFileSync(path.join(out,'expected-text.json'),JSON.stringify(paras,null,2));
const allIds=new Set(provenance.flatMap(p=>p.fact_ids));
const assessed=offer.requirements.map(r=>({...r,status:r.evidence.length && r.evidence.every(id=>allIds.has(id))?'supported':'unanswered'}));
const coverage={kind:'Fixture evidence coverage, not an ATS or hiring score',requirements:assessed,questions:facts.review_questions.filter(q=>assessed.some(r=>r.status==='unanswered'&&r.question_id===q.id)),required:{supported:assessed.filter(r=>r.importance==='required'&&r.status==='supported').length,total:assessed.filter(r=>r.importance==='required').length},preferred:{supported:assessed.filter(r=>r.importance==='preferred'&&r.status==='supported').length,total:assessed.filter(r=>r.importance==='preferred').length}};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(coverage,null,2));
console.log(JSON.stringify({paragraphs:paras.length,words:paras.join(' ').split(/\s+/).length,steps:plan.length}));
