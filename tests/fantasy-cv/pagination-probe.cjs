// Isolated two-page extension: never alters the CV being viewed.
const fs=require('node:fs'), path=require('node:path');
const source=path.resolve(process.argv[2]);
const out=path.resolve(process.argv[3]);fs.mkdirSync(out,{recursive:true});
const doc=path.join(out,'pagination-test.docx');fs.copyFileSync(source,doc);
const plan=[
 {tool:'open_document',args:{path:doc}},
 {tool:'execute',args:{command:'caret.docEnd'}},
 {tool:'execute',args:{command:'text.pageBreak'}},
 {tool:'type_text',args:{text:'Pagination regression test — synthetic second page.'}},
 {tool:'execute',args:{command:'references.updateFields',params:{all:true}}},
 {tool:'save_document',args:{path:doc}},
 {tool:'open_document',args:{path:doc}},
 {tool:'inspect_document'},
 {tool:'render_page',args:{page:1,scale:1},image:'page-1.png'},
 {tool:'render_page',args:{page:2,scale:1},image:'page-2.png'}
];
fs.writeFileSync(path.join(out,'mcp-plan.json'),JSON.stringify(plan,null,2));
