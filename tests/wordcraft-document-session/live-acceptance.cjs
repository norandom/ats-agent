// Task 1 read-only smoke. Later lifecycle acceptance remains pending.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {McpClient, desktopArgs, requireTool, validateFixtures} = require('./foundation.cjs');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function validateOutputDirectory(root, output) {
  const destination = path.resolve(output);
  const relative = path.relative(root, destination);
  const outside = relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative);
  if (!outside && !/^(outputs|private)([\\/]|$)/.test(relative)) throw new Error('Repository receipts must stay in ignored outputs or private');
  return destination;
}
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0]?.startsWith('--') ? args.shift() : '--read';
  if (!['--read','--full'].includes(mode)) throw new Error('Use --read or --full');
  const [executable, endpoint, output, fixturePath, desktopExecutable, foregroundObservationPath] = args;
  if(!desktopExecutable) throw new Error('Explicit selected desktop executable required as final argument');
  if (mode === '--full') {
    const result = await require('./live-scenarios.cjs').run(executable, endpoint, output, fixturePath, desktopExecutable, foregroundObservationPath);
    if (result.milestone !== 'passed') process.exitCode = 1;
    return;
  }
  if (!executable || !output || !fixturePath) throw new Error('Usage: live-acceptance.cjs CLI LOOPBACK_ENDPOINT PRIVATE_OUTPUT_DIRECTORY SELECTED_FICTIONAL_FIXTURE_JSON SELECTED_DESKTOP_EXECUTABLE');
  desktopArgs(endpoint);
  validateFixtures(require('./fixtures.json'));
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8').replace(/^\uFEFF/, ''));
  if (fixture.fictional !== true || typeof fixture.expectedText !== 'string' || !fixture.expectedText || !fixture.selectedArtifact) throw new Error('Selected fictional fixture requires expectedText and selectedArtifact');
  const root = path.resolve(__dirname, '../..');
  const destination = validateOutputDirectory(root, output);
  fs.mkdirSync(destination, {recursive:true});
  const receiptPath = path.join(destination, 'smoke-receipt.json');
  if (fs.existsSync(receiptPath)) throw new Error('Receipt already exists; select a fresh output directory');
  const cliVersion = execFileSync(executable, ['--version'], {encoding:'utf8', timeout:15000, windowsHide:true}).trim();
  const validatorVersion = execFileSync('uvx', ['--from','check-jsonschema==0.38.2','check-jsonschema','--version'], {encoding:'utf8', timeout:60000, windowsHide:true}).trim();
  if (validatorVersion !== 'check-jsonschema, version 0.38.2') throw new Error('Unexpected schema validator version');
  const assets = ['references/document-session.md', 'references/wordcraft-capabilities.md', 'references/wordcraft-operations.md', 'schemas/document-session.schema.json'].map(name => {
    const file = path.join(root, 'skills/targeted-cv', name);
    return {name, sha256:fs.existsSync(file) ? hash(fs.readFileSync(file)) : null, status:fs.existsSync(file) ? 'present' : 'pending'};
  });
  const receipt = {evidenceKind:'actual_mcp', scenario:'read-only-smoke', startedAt:new Date().toISOString(), mode:'desktop-connected', endpoint, selectedArtifact:fixture.selectedArtifact, selectionEvidence:'Explicit operator-selected displayed synthetic document; text match alone is not native identity proof', environment:{node:process.version, cliVersion, validatorVersion, cliExecutableSha256:hash(fs.readFileSync(executable)),desktopExecutableSha256:hash(fs.readFileSync(desktopExecutable))}, assets, milestone:'pending', visibility:'not_assessed', calls:[]};
  const client = McpClient.connect(executable, endpoint);
  try {
    const initialization = await client.rpc('initialize', {protocolVersion:'2024-11-05', capabilities:{}, clientInfo:{name:'document-session-smoke', version:'1.0'}});
    receipt.serverInfo = initialization.serverInfo;
    if (!initialization.instructions?.includes(`connected to the WordCraft app at ${endpoint}`)) throw new Error('Server did not confirm selected desktop connection');
    client.notify('notifications/initialized');
    const catalog = await client.rpc('tools/list', {});
    receipt.tools = catalog.tools;
    if (catalog.nextCursor) throw new Error('Incomplete tool catalog; discovery blocked');
    const identity=require('./live-scenarios.cjs').environmentIdentity({server:initialization.serverInfo.name,version:initialization.serverInfo.version??null,mode:'desktop',...receipt.environment,tools:catalog.tools});
    receipt.catalogPairs=identity.catalogPairs;receipt.environmentFingerprint=identity.fingerprint;
    for (const name of ['get_text','inspect_document']) {
      const tool = requireTool(catalog.tools, name);
      if (tool.inputSchema?.required?.length) throw new Error('Inspection contract changed; required arguments need review');
      const result = await client.rpc('tools/call', {name, arguments:{}});
      if (result.isError) throw new Error(`Inspection failed: ${name}`);
      receipt.calls.push({tool:name, executedAt:new Date().toISOString(), result});
      if (name === 'get_text') {
        const text = result.content.filter(item => item.type === 'text').map(item => { try { return JSON.parse(item.text).text ?? item.text; } catch { return item.text; } }).join('\n');
        if (text !== fixture.expectedText) throw new Error('Selected synthetic text mismatch; no mutation performed');
        receipt.snapshotSha256 = hash(text);
      }
    }
    receipt.status = 'passed';
  } catch (error) { receipt.status = 'blocked'; receipt.reason = error.message; throw error; }
  finally {
    client.close(); receipt.finishedAt = new Date().toISOString();
    fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2), {flag:'wx'});
  }
  console.log('Read-only desktop smoke passed; lifecycle acceptance remains pending.');
}
module.exports = {validateOutputDirectory};
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
