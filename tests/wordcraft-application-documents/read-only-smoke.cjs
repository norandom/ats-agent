'use strict';
// Explicit operator-selected fictional artifact only. No document mutation or renderer.
const fs = require('node:fs'), path = require('node:path');
const {execFileSync} = require('node:child_process');
const {McpClient} = require('../wordcraft-document-session/foundation.cjs');
const {environmentIdentity} = require('../wordcraft-document-session/live-scenarios.cjs');
const {privateDestination, readOnlyTool, sha256} = require('./foundation.cjs');
const body = r => JSON.parse(r.content.find(x => x.type === 'text').text);
async function run(cli, endpoint, output, desktop, expectedFile, artifact) {
  if (![cli,endpoint,output,desktop,expectedFile,artifact].every(Boolean)) throw Error('Explicit CLI, endpoint, private output, desktop executable, fictional expected-text JSON and selected artifact required');
  output = privateDestination(output);
  fs.mkdirSync(output); // Fresh run only; never overwrite evidence.
  const expected = JSON.parse(fs.readFileSync(expectedFile, 'utf8'));
  if (typeof expected !== 'string' || !expected) throw Error('Explicit fictional expected text must be a nonempty JSON string');
  const version = (exe,args) => execFileSync(exe,args,{encoding:'utf8',windowsHide:true,timeout:60000}).trim();
  const receipt = {kind:'actual_mcp_read_only',status:'pending',startedAt:new Date().toISOString(),outputDestination:output,endpoint,calls:[],formatting:'not_assessed',nativeIdentity:'not_exposed',selectedArtifact:path.resolve(artifact),selectedArtifactSha256:sha256(fs.readFileSync(artifact)),environment:{node:process.version,nodeExecutable:process.execPath,nodeSha256:sha256(fs.readFileSync(process.execPath)),cli,desktop,cliVersion:version(cli,['--version']),cliExecutableSha256:sha256(fs.readFileSync(cli)),desktopExecutableSha256:sha256(fs.readFileSync(desktop)),pnpmVersion:version('powershell.exe',['-NoProfile','-Command','pnpm --version']),validatorVersion:version('uvx',['--from','check-jsonschema==0.38.2','check-jsonschema','--version'])}};
  const client = McpClient.connect(cli,endpoint);
  try {
    receipt.environment.uvxVersion = version('uvx',['--version']);
    receipt.environment.executableIdentities = Object.fromEntries(['uvx','pnpm'].map(name => {
      const files = version('where.exe',[name]).split(/\r?\n/).filter(Boolean);
      return [name, files.map(file => ({path:file,sha256:sha256(fs.readFileSync(file))}))];
    }));
    if (!receipt.environment.validatorVersion.includes('0.38.2')) throw Error('Unexpected validator version');
    const init = await client.rpc('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'application-document-foundation',version:'1.0'}});
    if (!init.instructions?.includes(`connected to the WordCraft app at ${endpoint}`)) throw Error('Selected desktop endpoint unconfirmed');
    receipt.server = init.serverInfo;
    client.notify('notifications/initialized');
    const catalog = await client.rpc('tools/list',{});
    if (catalog.nextCursor) throw Error('Incomplete catalog');
    receipt.identity = environmentIdentity({server:init.serverInfo.name,version:init.serverInfo.version,mode:'desktop',...receipt.environment,tools:catalog.tools});
    for (const name of ['ui_inspect','get_text','inspect_document','ui_inspect']) {
      readOnlyTool(name,catalog.tools);
      const result = await client.rpc('tools/call',{name,arguments:{}});
      if(result.isError) throw Error('Inspection failed: '+name);
      const observed = body(result);
      // Omit unrelated recent documents and application settings.
      const observation = name === 'ui_inspect' ? {title:observed.title,dirty:observed.dirty,focused:observed.focused,pages:observed.pages} : observed;
      receipt.calls.push({tool:name,observedAt:new Date().toISOString(),observation});
      if (name === 'get_text' && observed.text !== expected) throw Error('Selected fictional text mismatch');
      if (name === 'inspect_document') receipt.snapshotSha256 = sha256(JSON.stringify(observed));
    }
    const initial = receipt.calls[0].observation, final = receipt.calls.at(-1).observation;
    if (initial.title !== path.basename(artifact,'.docx') || JSON.stringify(initial) !== JSON.stringify(final)) throw Error('Selected UI identity changed or mismatched');
    if(receipt.selectedArtifactSha256 !== sha256(fs.readFileSync(artifact))) throw Error('Selected saved bytes changed');
    receipt.selectionEvidence = 'Exact observed body equals explicitly selected fictional expected text; observed title corroborates selected saved path. Path is operator-selected, not native identity proof.';
    receipt.status = 'passed';
  } catch(e) {receipt.status='blocked';receipt.reason=e.message;throw e;}
  finally {client.close();receipt.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(output,'receipt.json'),JSON.stringify(receipt,null,2),{flag:'wx'});}
  console.log('Read-only selected fictional document smoke passed; formatting not assessed.');
}
module.exports = {run};
if(require.main===module) run(...process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
