'use strict';
// Entirely invented application. Never a runtime default or a real candidate analogue.
const blank=require('../../skills/targeted-cv/templates/cv-facts.blank.json');
const {paragraphs:letterParagraphs}=require('./letter-fixture.cjs');
function fixture(){
 const rows=[];
 const add=(id,kind,en,de)=>rows.push({id,kind,en,de});
 add('name','name','Mira Reedhaven','Mira Reedhaven');
 add('headline','headline','Operations coordination | Clear dispatch handovers','Betriebskoordination | Klare Versandübergaben');
 add('contact','body','mira@example.invalid | Musterstadt','mira@example.invalid | Musterstadt');
 add('profile-heading','heading','Profile','Profil');
 add('summary','summary','Operations coordinator with experience in dispatch records and shift handovers. Connects order lists, open questions and practical instructions so the next shift can continue the work.','Betriebskoordinatorin mit Erfahrung in Versanddokumentation und Schichtübergaben. Verbindet Auftragslisten, offene Fragen und verständliche Anleitungen, damit die nächste Schicht weiterarbeiten kann.');
 add('experience-heading','heading','Experience','Berufserfahrung');
 add('role-one','label','Operations coordinator | Paper Lantern Workshop','Betriebskoordinatorin | Paper Lantern Workshop');
 add('date-one','date','March 2022 - present','März 2022 - heute');
 add('scope-one','scope','Coordinates dispatch records and shift handovers for a craft workshop. Works with packing colleagues and the workshop manager. Production planning and staffing decisions remain with the manager.','Koordiniert Versandunterlagen und Schichtübergaben einer Handwerkswerkstatt. Arbeitet mit dem Verpackungsteam und der Werkstattleitung zusammen. Produktionsplanung und Personalentscheidungen liegen bei der Werkstattleitung.');
 add('achievement-one','bullet','Introduced a shared exception log so unresolved parcel questions have a named contact.','Führte eine gemeinsame Liste für Versandprobleme mit einer benannten Ansprechperson je offenem Fall ein.');
 add('achievement-two','bullet','Wrote a handover checklist covering outstanding orders and damaged packaging.','Schrieb eine Übergabecheckliste für offene Aufträge und beschädigte Verpackungen.');
 const baselineCount=rows.length;
 add('role-two','label','Dispatch assistant | Willow Paper Studio','Versandassistentin | Willow Paper Studio');
 add('date-two','date','January 2018 - February 2022','Januar 2018 - Februar 2022');
 add('scope-two','scope','Prepared dispatch records for handmade paper products. Clarified incomplete order details with customer service and prepared questions for the daily meeting.','Bearbeitete Versandunterlagen für handgefertigte Papierwaren. Stimmte unvollständige Auftragsangaben mit dem Kundendienst ab und bereitete Rückfragen für die tägliche Besprechung vor.');
 add('achievement-three','bullet','Compiled recurring address errors and explained the information customer service needed to resolve them.','Erstellte eine Übersicht wiederkehrender Adressfehler und erläuterte dem Kundendienst die nötigen Angaben.');
 add('achievement-four','bullet','Recorded damaged deliveries with order numbers and packaging condition for further review.','Dokumentierte beschädigte Lieferungen mit Auftragsnummer und Verpackungszustand für die weitere Prüfung.');
 add('role-three','label','Office assistant | Meadow Bookbinders','Büroassistentin | Meadow Bookbinders');
 add('date-three','date','August 2014 - December 2017','August 2014 - Dezember 2017');
 add('scope-three','scope','Supported order administration at a small bookbindery. Maintained customer enquiries and prepared workshop paperwork; the workshop manager retained production planning responsibility.','Unterstützte die Auftragsverwaltung einer kleinen Buchbinderei. Pflegte Kundenanfragen und bereitete Unterlagen für die Werkstatt vor; die Produktionsplanung lag bei der Werkstattleitung.');
 add('achievement-five','bullet','Combined confirmed format, material and delivery details in an order sheet and flagged missing approvals before work began.','Fasste bestätigte Angaben zu Format, Material und Liefertermin in einem Auftragsblatt zusammen und kennzeichnete fehlende Freigaben vor Arbeitsbeginn.');
 add('projects-heading','heading','Selected projects','Ausgewählte Projekte');
 add('project-one','project','Dispatch handover guide | April 2023 - June 2023','Leitfaden für Versandübergaben | April 2023 - Juni 2023');
 add('project-one-detail','body','Compared the notes used by two shifts and drafted a common guide. Colleagues tested the instructions during routine dispatch work; their questions informed the revised examples.','Verglich die Notizen zweier Schichten und erstellte einen gemeinsamen Leitfaden. Das Team erprobte die Anleitung im laufenden Versand; seine Rückfragen flossen in die überarbeiteten Beispiele ein.');
 add('project-two','project','Traceable returns | May 2020 - September 2020','Rücksendungen nachvollziehbar bearbeiten | Mai 2020 - September 2020');
 add('project-two-detail','body','Collected recurring queries from dispatch work and drafted a simple status list linking returns to their original orders. Customer service reviewed the labels before both teams used the list in daily work.','Sammelte typische Rückfragen aus der Versandpraxis und entwarf eine einfache Statusliste, die Rücksendungen den ursprünglichen Aufträgen zuordnete. Der Kundendienst prüfte die Bezeichnungen, bevor beide Teams die Liste im Alltag nutzten.');
 add('expertise-heading','heading','Expertise','Fachkenntnisse');
 add('expertise','body','Dispatch documentation and exception tracking: makes open items and responsibility visible. Work instructions: tests wording with colleagues before handover. Uses spreadsheets to reconcile order lists.','Versanddokumentation und Nachverfolgung offener Fragen: macht offene Punkte und Zuständigkeiten sichtbar. Arbeitsanleitungen: erprobt Formulierungen mit dem Team vor der Übergabe. Nutzt Tabellenkalkulation zur Abstimmung von Auftragslisten.');
 add('education-heading','heading','Education and training','Ausbildung und Weiterbildung');
 add('education','label','Diploma in business administration | Example Learning College','Diploma in business administration | Example Learning College');
 add('education-status','body','Completed qualification.','Abgeschlossene Qualifikation.');
 add('training','body','Certificate of completion: practical work instructions | Fictional Workshop Academy.','Abschlusszertifikat: Praktische Arbeitsanleitungen | Fictional Workshop Academy.');
 add('languages-heading','heading','Languages','Sprachen');
 add('languages','body','English: fluent. German: working proficiency.','Englisch: fließend. Deutsch: berufliche Arbeitskenntnisse.');
 const p=structuredClone(blank),source='source-acceptance';
 p.candidate={...p.candidate,id:'candidate-acceptance',name:'Mira Reedhaven',email:'mira@example.invalid',postal_address:'Musterstraße 8\n12345 Musterstadt',location:{city:'Musterstadt',country:'Germany'},source_ids:[source]};
 p.sources=[{id:source,type:'user_answer',origin:'Wholly fictional acceptance source; every identity, organization, address and event is invented.',locator:null,received_at:'2026-10-27',as_of:'2026-10-27',verification:'user_reported',verification_basis:null}];
 p.employment=[['one','Paper Lantern Workshop','Operations coordinator','2022-03',null],['two','Willow Paper Studio','Dispatch assistant','2018-01','2022-02'],['three','Meadow Bookbinders','Office assistant','2014-08','2017-12']].map(([id,employer,title,start,end])=>({id:'employment-'+id,employer,title,location:null,start,end,current:end===null,as_of:'2026-10-27',claims:[],source_ids:[source]}));
 p.education=[{id:'education-one',qualification:'Diploma in business administration',institution:'Example Learning College',start:'2012',end:'2014',completion_status:'completed',source_ids:[source]}];
 p.professional_development=[{id:'training-one',name:'Certificate of completion: practical work instructions',organization:'Fictional Workshop Academy',since:'2023',valid_until:null,source_ids:[source]}];
 p.languages=[['English','fluent'],['German','working proficiency']].map(([language,proficiency],i)=>({id:'language-'+i,language,proficiency,cefr:null,source_ids:[source]}));
 // Explicit factual source statements also cover composites and their localized review units.
 p.profile=rows.filter(r=>r.kind!=='heading').map(r=>({id:'fact-'+r.id,statement:r.en,source_ids:[source]}));
 const metadata={recipient:['Fictional Cloud Courier','Beispielweg 9','12345 Musterstadt'],date:'2026-10-27',requested_documents:['cv','cover_letter'],languages:['en','de'],market:'DE',namedAddressee:null,signatureImage:null,enclosures:['cv'],confirmed:true};
 const offer='Fictional Cloud Courier seeks a dispatch coordinator in Germany. The role requires clear shift handovers, accurate dispatch records and practical work instructions. The coordinator tracks open issues with packing and customer service; the dispatch manager retains staffing and route approval.';
 const intent='Mira confirms that she wants to apply her dispatch documentation and handover experience to this role and discuss her approach in an interview.';
 const docs=[];
 for(const language of ['en','de']){
  const de=language==='de',cv=rows.map(r=>({id:r.id,kind:r.kind,text:r[language],source:r.kind==='heading'?null:{record_id:'fact-'+r.id,pointer:'/profile/'+p.profile.findIndex(x=>x.id==='fact-'+r.id)+'/statement',source_ids:[source]}}));
  const letter={...metadata,language,sender:[p.candidate.name,'Musterstraße 8','12345 Musterstadt',p.candidate.email],displayDate:de?'27. Oktober 2026':'27 October 2026',subject:de?'Bewerbung als Dispositionskoordinatorin':'Application for dispatch coordinator',salutation:de?'Sehr geehrte Damen und Herren,':'Dear Hiring Team,',body:de?[
   'Ihre ausgeschriebene Stelle erfordert klare Schichtübergaben, sorgfältige Versandunterlagen und praktische Arbeitsanleitungen. Bei Paper Lantern Workshop koordiniere ich Versandunterlagen und Übergaben mit dem Verpackungsteam. Diese Erfahrung möchte ich bei Fictional Cloud Courier einbringen.',
   'Mit einer gemeinsamen Liste für Versandprobleme habe ich offene Fragen und die jeweilige Ansprechperson sichtbar gemacht. Für einen Übergabeleitfaden verglich ich die Notizen zweier Schichten und überarbeitete die Beispiele nach Rückfragen aus der Praxis. So kann ich Ihr Team bei nachvollziehbaren Unterlagen und verständlichen Übergaben unterstützen.',
   'Aus meiner früheren Tätigkeit bei Willow Paper Studio kenne ich die Abstimmung unvollständiger Auftragsangaben mit dem Kundendienst. Gern erläutere ich Ihnen im Gespräch, wie ich offene Punkte dokumentiere und mit den beteiligten Teams kläre.'
  ]:[
   'Your dispatch coordinator role calls for clear shift handovers, accurate dispatch records and practical work instructions. At Paper Lantern Workshop, I coordinate dispatch records and handovers with packing colleagues. I would bring that experience to Fictional Cloud Courier.',
   'I introduced a shared exception log that makes open questions and their contacts visible. For a handover guide, I compared the notes used by two shifts and revised the examples after colleagues tested them. This experience would help me support your team with traceable records and clear handovers.',
   'My earlier work at Willow Paper Studio included clarifying incomplete order details with customer service. I would welcome a conversation about how I document open items and resolve questions with the teams involved.'
  ],closing:de?'Mit freundlichen Grüßen':'Kind regards,',enclosureLabel:de?'Anlage: Lebenslauf':'Enclosure: CV'};
  docs.push({id:'cv-'+language,kind:'cv',language,paragraphs:cv,baselineCount},{id:'letter-'+language,kind:'cover_letter',language,paragraphs:letterParagraphs(letter),letter});
 }
 return {profile:p,metadata,offer,intent,documents:docs};
}
module.exports={fixture};



