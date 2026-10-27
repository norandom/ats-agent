const fs = require('node:fs');
const {spawn} = require('node:child_process');
const path = require('node:path');
const root = path.dirname(path.resolve(process.argv[2]));
const child = spawn(process.env.WORDCRAFT_CLI || 'wordcraft-cli', ['mcp','--automation-read-root',root,'--automation-write-root',root], {windowsHide:true,stdio:['pipe','pipe','pipe']});
let id=0, buffer=''; const pending=new Map();
child.stdout.on('data',chunk=>{buffer+=chunk; let n; while((n=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,n);buffer=buffer.slice(n+1);if(!line.trim())continue;let msg;try{msg=JSON.parse(line);}catch{continue;}const p=pending.get(msg.id);if(p){pending.delete(msg.id);msg.error?p.reject(new Error(JSON.stringify(msg.error))):p.resolve(msg.result);}}});
child.stderr.on('data',x=>process.stderr.write(x));
function rpc(method,params){return new Promise((resolve,reject)=>{const i=++id;pending.set(i,{resolve,reject});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id:i,method,params})+'\n');});}
const timeout=setTimeout(()=>{child.kill();process.exitCode=1;console.error('MCP timeout; no automatic replay');},90000);
(async()=>{const log=[];try{await rpc('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'fictional-cv-demo',version:'1.0'}});child.stdin.write(JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'})+'\n');
const plan=JSON.parse(fs.readFileSync(process.argv[2],'utf8').replace(/^\uFEFF/,''));
for(const step of plan){const r=await rpc('tools/call',{name:step.tool,arguments:step.args||{}});if(r.isError)throw new Error(JSON.stringify(r));const safe=[];for(const c of r.content||[]){if(c.type==='image'){const dest=path.join(root,step.image||'preview.png');fs.writeFileSync(dest,Buffer.from(c.data,'base64'));safe.push({image:dest});}else safe.push(c);}log.push({tool:step.tool,result:safe});}
fs.writeFileSync(path.join(root,'verification.json'),JSON.stringify(log,null,2));console.log(JSON.stringify({steps:log.length,images:log.flatMap(x=>x.result.filter(c=>c.image))}));
}catch(e){console.error(e);process.exitCode=1;}finally{clearTimeout(timeout);child.stdin.end();child.kill();}})();
