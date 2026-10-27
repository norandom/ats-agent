// Deterministic local compositor. The host writes sourced bilingual editorial data.
// No model calls, personal defaults or candidate prose in this renderer.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const [factsFile,editorialFile,language,output]=process.argv.slice(2);
assert(factsFile&&editorialFile&&['en','de'].includes(language)&&output,'Expected FACTS EDITORIAL en|de OUTPUT');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const facts=read(factsFile),edit=read(editorialFile),records=new Map([['candidate',facts.candidate]]);
const factsHash=crypto.createHash('sha256').update(fs.readFileSync(factsFile)).digest('hex');
assert.equal(edit.facts_sha256,factsHash,'Facts changed: regenerate and review the editorial plan before rendering');
function index(x){if(!x||typeof x!=='object')return;if(x.id){assert(!records.has(x.id),'Duplicate record');records.set(x.id,x);}Object.values(x).forEach(index);}index(facts);
const blocks=edit.blocks.map(b=>{
 for(const id of b.sources)assert(records.has(id),'Unknown source record '+id);
 const raw=b[language]||b.template;assert(typeof raw==='string','Missing localized text');
 const text=raw.replace(/\{\{([^}]+)\}\}/g,(_,key)=>{const [id,...parts]=key.split('.');assert(b.sources.includes(id),'Unmapped binding');let v=records.get(id);for(const part of parts)v=v?.[part];assert(v!==undefined&&v!==null,'Missing binding '+key);if(['start','end'].includes(parts.at(-1))&&/^\d{4}-\d{2}$/.test(v)){const [year,month]=v.split('-');return `${month}/${year}`;}return String(v);});
 assert(!/[\u2013\u2014]/.test(text),'Disallowed dash');return {...b,text};
});
const out=path.resolve(output);fs.mkdirSync(out,{recursive:true});const plan=[];
const call=(tool,args={})=>plan.push({tool,args}),exec=(command,params={})=>call('execute',{command,params});
const batch=commands=>call('batch',{commands:commands.map(([command,params])=>({command,params:params||{}}))});
call('new_document',{template:'blank'});call('type_text',{text:blocks.map(b=>b.text).join('\n'),paragraphs:true});exec('select.all');
batch([['layout.size',{name:'A4'}],['layout.margins',{top:39,bottom:40,left:43,right:43}],['format.font',{name:'Calibri'}],['format.size',{size:11}],['format.color',{color:'202B3A'}],['para.spacing',{before:0,after:5}],['para.lineSpacing',{value:1.12}],['para.alignLeft'],['para.keepLines',{value:true}],['review.language',{lang:language==='de'?'de-DE':'en-GB',noProof:true}]]);
const styles={name:[['para.style',{style:'Title'}],['format.size',{size:28}],['format.bold',{value:true}],['format.color',{color:'174D78'}],['para.spacing',{after:3}]],headline:[['format.size',{size:12}],['format.bold',{value:true}],['format.color',{color:'174D78'}]],contact:[['format.size',{size:9}],['para.spacing',{after:8}]],summary:[['para.shading',{color:'EAF1F8'}],['para.spacing',{before:4,after:8}]],heading:[['para.heading1'],['format.size',{size:12}],['format.color',{color:'174D78'}],['format.bold',{value:true}],['para.spacing',{before:8,after:5}],['para.keepNext',{value:true}]],role:[['format.bold',{value:true}],['para.spacing',{before:6,after:2}],['para.keepNext',{value:true}]],bullet:[['para.bullets',{kind:'bullet'}],['para.indents',{left:10,firstLine:-10}],['para.spacing',{before:0,after:4}]]};
for(const b of blocks){if(styles[b.kind]||b.pageBreak){call('select_text',{text:b.text});if(styles[b.kind])batch(styles[b.kind]);if(b.pageBreak)exec('para.pageBreakBefore',{value:true});}}
exec('insert.createFooter');exec('para.alignRight');exec('format.size',{size:9});exec('format.color',{color:'617083'});exec('review.language',{lang:language==='de'?'de-DE':'en-GB',noProof:true});call('type_text',{text:language==='de'?'Seite ':'Page '});exec('insert.field',{instr:'PAGE'});call('type_text',{text:' / '});exec('insert.field',{instr:'NUMPAGES'});exec('insert.closeHeader');exec('references.updateFields',{all:true});
const dest=path.join(out,`cv-${language}.docx`);call('save_document',{path:dest});call('open_document',{path:dest});call('get_text');call('inspect_document');
for(let page=1;page<=edit.expected_pages;page++)plan.push({tool:'render_page',args:{page,scale:1.3},image:`page-${page}.png`});
fs.writeFileSync(path.join(out,'mcp-plan.json'),JSON.stringify(plan,null,2));fs.writeFileSync(path.join(out,'expected-text.json'),JSON.stringify(blocks.map(b=>b.text),null,2));
fs.writeFileSync(path.join(out,'claim-map.json'),JSON.stringify({facts_sha256:crypto.createHash('sha256').update(fs.readFileSync(factsFile)).digest('hex'),language,blocks:blocks.map(b=>({text:b.text,source_ids:b.sources}))},null,2));console.log(JSON.stringify({language,blocks:blocks.length,expected_pages:edit.expected_pages}));
