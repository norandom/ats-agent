'use strict';
// Test-only receipt verification, not a runtime document engine.
const fs=require('node:fs'),path=require('node:path'),{sha256}=require('./foundation.cjs');
const mm=n=>n*72/25.4,near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<0.15;
const sources={K:{source_url:'https://www.klett.de/inhalt/media_fast_path/32/DO01_3-12-007172_Onlinematerialien_DIN5008.pdf',edition:'2020 guidance referring to DIN 5008:2020-03; full standard/corrigendum 2020-07 not inspected',authority:'publisher_guidance'},W:{source_url:'https://c.wgr.de/d/25aef4740c0c03f859bd05b3db0a3c333bcf16cdf9baef604a1e104b803a5b35.pdf/978-3-8045-4780-3_28.pdf',edition:'Extract edition not established',authority:'publisher_guidance'},P:{source_url:'skills/targeted-cv/references/germany-cover-letter.md',edition:'de-letter-b-1',authority:'project_choice'}};
function checklist(s){
 const p=s.paragraphs||[],find=k=>p.find(x=>x.kind===k),rec=p.filter(x=>x.kind==='recipient'),ret=find('return'),sec=s.structure?.sections?.[0]?.props,rows=[];
 const add=(rule_id,source,expected,pass,measured)=>rows.push({rule_id,...sources[source],expected,status:pass?'passed':'failed',measured,evidence_reference:`receipt.json#/stages/${s.language==='en'?0:1}/paragraphs`,artifact_sha256:s.sha256,snapshot_sha256:s.snapshotSha256});
 if(!sec||!ret||rec.length!==3||!find('enclosures'))return [{rule_id:'observations',status:'not_assessed',reason:'Required observed structure missing'}];
 add('page','K','A4; margins left25/right20 mm; sender above45 mm',near(sec.pageW,mm(210))&&near(sec.pageH,mm(297))&&near(sec.marginLeft,mm(25))&&near(sec.marginRight,mm(20))&&p.filter(x=>x.kind==='sender').every(x=>x.end.y+x.end.h<mm(45)),{section:sec,senderBottom:p[3].end.y+p[3].end.h});
 add('field','W','Conceptual field x20/y45/w85/h45 mm, textx25; observed text contained',near(ret.start.y,mm(45))&&[ret,...rec].every(x=>near(x.start.x,mm(25))&&x.end.x<=mm(105)&&x.end.page===0&&near(x.start.y,x.end.y)),{conceptualMm:[20,45,85,45],text:[ret,...rec].map(x=>({start:x.start,end:x.end}))});
 add('zones','K','Supplemental17.7/recipient27.3 mm; recipient contiguous within62.7..90 mm',ret.end.y+ret.end.h<=mm(62.7)&&near(rec[0].start.y,mm(62.7))&&rec.at(-1).end.y+rec.at(-1).end.h<=mm(90)&&rec.slice(1).every((x,i)=>near(x.start.y,rec[i].end.y+rec[i].end.h)),{supplementalEnd:ret.end.y+ret.end.h,recipientEnd:rec.at(-1).end.y+rec.at(-1).end.h});
 add('return','K','One line 8pt',near(ret.start.y,ret.end.y)&&ret.observed.paragraph.runs.every(x=>x.props.size===8),ret.observed.paragraph.runs);
 const gaps=p.map((x,i)=>({kind:x.kind,gap:i?x.start.y-p[i-1].end.y-p[i-1].end.h:0}));
 add('spacing','K','Two line gaps after subject; one after greeting/between body/before closing; enclosures after signer',gaps.filter(x=>['salutation','body','closing'].includes(x.kind)).every(x=>near(x.gap,s.lineHeight*(x.kind==='salutation'?2:1)))&&p.findIndex(x=>x.kind==='enclosures')>p.findIndex(x=>x.kind==='signer'),gaps);
 add('typography','P','Arial11 body, single spacing, bottom20, blue sender, no photo, three-line signature gap',near(sec.marginBottom,mm(20))&&p.every(x=>x.observed.resolved.lineSpacing.value===1&&x.observed.paragraph.runs.every(run=>run.props.font==='Arial'&&run.props.size===(x.kind==='return'?8:11)))&&JSON.stringify(p[0].observed.paragraph.runs[0].props.color.Rgb)==='[31,78,121]'&&near(gaps.find(x=>x.kind==='signer').gap,3*s.lineHeight)&&s.visualReview==='passed', {bottom:sec.marginBottom,signatureGap:gaps.find(x=>x.kind==='signer').gap,visualReview:s.visualReview});
 add('placement','P','Sender10/date95/subject105 mm; subject bold',near(p[0].start.y,mm(10))&&near(find('date').start.y,mm(95))&&near(find('subject').start.y,mm(105))&&find('subject').observed.paragraph.runs.every(x=>x.props.bold===true),{sender:p[0].start,date:find('date').start,subject:find('subject').start});
 return rows;
}
function verify(receipt){
 if(!receipt)throw Error('Explicit live receipt path required; offline tests are not live acceptance');
 const r=JSON.parse(fs.readFileSync(receipt,'utf8')),issues=[];
 if(r.kind!=='actual_desktop_germany_letters'||r.error||r.stages.length!==2)issues.push('Incomplete live run');
 for(const lang of ['en','de']){const s=r.stages.find(x=>x.language===lang);if(!s){issues.push(lang+' missing');continue;}
 if(!s.reopened||!s.textExact||s.text.text!==s.expected||!s.artifactStable||sha256(fs.readFileSync(s.artifact))!==s.sha256)issues.push(lang+' revision/text/persistence');
 if(s.snapshotSha256!==sha256(JSON.stringify({text:s.text,structure:s.structure,paragraphs:s.paragraphs})))issues.push(lang+' snapshot');
 if(s.visualReview!=='passed'||s.rendered.length!==s.structure.pages||!s.rendered.every((v,i)=>v.page===i+1&&sha256(fs.readFileSync(v.path))===v.sha256))issues.push(lang+' all-page review');
 s.checklist=checklist(s);if(s.checklist.some(x=>x.status!=='passed'))issues.push(lang+' checklist '+s.checklist.filter(x=>x.status!=='passed').map(x=>x.rule_id));
 }
 const result={status:issues.length?'failed':'passed',issues,claim:issues.length?'Draft: checks incomplete':'Passed the sourced project checklist; full DIN conformity not assessed',receipt_sha256:sha256(fs.readFileSync(receipt)),documents:r.stages.map(s=>({language:s.language,artifact:s.artifact,sha256:s.sha256,checklist:s.checklist}))};
 fs.writeFileSync(path.join(path.dirname(receipt),'checklist.json'),JSON.stringify(result,null,2));return result;
}
module.exports={checklist,verify};
if(require.main===module){try{const r=verify(process.argv[2]);console.log(JSON.stringify({status:r.status,issues:r.issues,claim:r.claim}));if(r.status!=='passed')process.exitCode=1;}catch(e){console.error(e.message);process.exitCode=1;}}
