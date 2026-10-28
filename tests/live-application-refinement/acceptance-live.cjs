'use strict';
// Catalog observation only. No document reads, UI actions or document mutations.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {McpClient,desktopArgs} = require('../wordcraft-document-session/foundation.cjs');
const {freshRun} = require('./foundation.cjs');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
async function observe(cli,endpoint) {
  desktopArgs(endpoint);
  if (!cli || !fs.statSync(cli).isFile()) throw Error('Explicit official WordCraft CLI required');
  const output = freshRun();
  const root = path.resolve(__dirname,'../..');
  const manifest = require('./acceptance-manifest.json');
  const assets = [...manifest.runtime,...manifest.tests].map(name => ({name,sha256:hash(fs.readFileSync(path.join(root,name)))}));
  const receipt = {kind:'actual_mcp_read_only',status:'pending',endpoint,startedAt:new Date().toISOString(),assets,calls:[],liveAuthoring:'not_assessed',documentIdentity:'not_assessed',foreground:'not_assessed',limits:['Catalog presence does not demonstrate tool effects.','No document content inspected or mutated.','Foreground action and selected document identification remain pending before authoring.','The catalog alone cannot establish whether a foreground command exists within execute; no missing-capability claim is inferred from tool names.']};
  let client;
  try {
    receipt.cli = {version:execFileSync(cli,['--version'],{encoding:'utf8',windowsHide:true,timeout:15000}).trim(),sha256:hash(fs.readFileSync(cli))};
    client = McpClient.connect(cli,endpoint);
    const init = await client.rpc('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'refinement-foundation-read-only',version:'1.0'}});
    receipt.calls.push({method:'initialize',observedAt:new Date().toISOString()});
    if (!init.instructions?.includes(`connected to the WordCraft app at ${endpoint}`)) throw Error('Selected desktop connection unconfirmed');
    receipt.server = init.serverInfo;
    client.notify('notifications/initialized');
    const catalog = await client.rpc('tools/list',{});
    receipt.calls.push({method:'tools/list',observedAt:new Date().toISOString()});
    if (catalog.nextCursor || !Array.isArray(catalog.tools)) throw Error('Incomplete tool catalog');
    receipt.tools = catalog.tools;
    receipt.status = 'observed';
  } catch (error) {
    receipt.status = 'unavailable'; receipt.reason = error.message;
  } finally {
    client?.close(); receipt.finishedAt = new Date().toISOString();
    fs.writeFileSync(path.join(output,'capability-observation.json'),JSON.stringify(receipt,null,2),{flag:'wx'});
  }
  return {output,receipt};
}
module.exports = {observe};
if(require.main===module) observe(...process.argv.slice(2)).then(({output,receipt}) => { console.log(JSON.stringify({output,status:receipt.status,reason:receipt.reason,toolCount:receipt.tools?.length})); if(receipt.status !== 'observed') process.exitCode=1; }).catch(error => {console.error(error.message);process.exitCode=1;});
