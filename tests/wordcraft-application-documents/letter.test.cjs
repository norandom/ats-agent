const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
test('portable letter recipe states required inputs, sourced limits and measured verification',()=>{
 const s=fs.readFileSync(path.join(__dirname,'../../skills/targeted-cv/references/germany-cover-letter.md'),'utf8');
 for(const phrase of ['de-letter-b-1','17.7','27.3','62.7','publisher_guidance','project_choice','2020-03','2020-07','missing_required','not_assessed','save/reopen','Dear Hiring Team','Sehr geehrte Damen und Herren'])assert.ok(s.includes(phrase),phrase);
});
test('live acceptance requires an explicit receipt and fictional pairs keep identity stable',()=>{
 const {verify}=require('./letter-check.cjs'),{fixture}=require('./letter-fixture.cjs');
 assert.throws(()=>verify(),/Explicit live receipt/);
 const en=fixture('en'),de=fixture('de');assert.deepEqual(en.sender,de.sender);assert.deepEqual(en.recipient,de.recipient);assert.equal(en.date,de.date);
 assert.equal(en.signatureImage,null);assert.equal(de.namedAddressee,null);
 assert.ok(en.body.every(p=>!/[\u2013\u2014]/u.test(p)));assert.ok(de.body.every(p=>!/[\u2013\u2014]/u.test(p)));
});
