const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { PassThrough } = require('node:stream');
const { McpClient, desktopArgs, requireTool, validateFixtures } = require('./foundation.cjs');
const path = require('node:path');
const {validateOutputDirectory} = require('./live-acceptance.cjs');

test('receipt paths distinguish parent traversal from repository dot-prefixed directories', () => {
  const root = path.resolve(__dirname, '../..');
  for (const relative of ['..receipts', '..receipts/nested', 'tests/receipts', '.']) {
    assert.throws(() => validateOutputDirectory(root, path.resolve(root, relative)), /Repository receipts/);
  }
  for (const relative of ['outputs/receipts', 'private/receipts', '../external-receipts', '..']) {
    const destination = path.resolve(root, relative);
    assert.equal(validateOutputDirectory(root, destination), destination);
  }
});

function transport() {
  const child = new EventEmitter();
  child.stdout = new PassThrough(); child.stderr = new PassThrough(); child.stdin = new PassThrough();
  child.killed = false; child.kill = () => { child.killed = true; };
  return child;
}
test('desktop connection is explicit, loopback-only and never headless', () => {
  assert.deepEqual(desktopArgs('127.0.0.1:7981'), ['mcp', '--connect', '127.0.0.1:7981']);
  for (const endpoint of [undefined, '', 'remote:7981', '127.0.0.1:0', '127.0.0.1:65536']) assert.throws(() => desktopArgs(endpoint));
});
test('missing tools block only dependent work', () => {
  assert.equal(requireTool([{name:'get_text'}], 'get_text').name, 'get_text');
  assert.throws(() => requireTool([], 'get_text'), /unavailable.*get_text/);
});
test('fixtures contain fictional CV and letter with unambiguous edits', () => {
  const fixtures = require('./fixtures.json');
  validateFixtures(fixtures);
  assert.throws(() => validateFixtures({...fixtures, fictional:false}));
  const duplicate = structuredClone(fixtures); duplicate.documents[0].text += duplicate.documents[0].edit.target;
  assert.throws(() => validateFixtures(duplicate), /unique/);
});
test('fragmented response resolves once, notifications ignored', async () => {
  const child = transport(); const client = new McpClient(child, {timeoutMs:100});
  const result = client.rpc('tools/list', {});
  child.stdout.write('{"jsonrpc":"2.0","method":"notice"}\n{"id":1,"res');
  child.stdout.write('ult":{"tools":[]}}\n');
  assert.deepEqual(await result, {tools:[]}); client.close(); assert.equal(child.killed, true);
});
test('timeout closes connection without replay', async () => {
  const child = transport(); let writes = 0; child.stdin.on('data', () => writes++);
  const client = new McpClient(child, {timeoutMs:15});
  await assert.rejects(client.rpc('tools/call', {}), /timeout/);
  assert.equal(writes, 1); assert.equal(child.killed, true);
});
test('exit and malformed or oversized output reject pending calls', async () => {
  for (const fault of ['exit', 'malformed', 'oversized']) {
    const child = transport(); const client = new McpClient(child, {timeoutMs:100, maxBytes:100});
    const pending = client.rpc('tools/list', {});
    if (fault === 'exit') child.emit('exit', 1);
    else child.stdout.write(fault === 'malformed' ? 'not-json\n' : 'x'.repeat(101));
    await assert.rejects(pending); assert.equal(child.killed, true);
  }
});
test('RPC errors reject without retry and concurrent calls are withheld', async () => {
  const child = transport(); const client = new McpClient(child, {timeoutMs:100});
  const pending = client.rpc('tools/list', {});
  await assert.rejects(client.rpc('tools/list', {}), /sequential/);
  child.stdout.write('{"id":1,"error":{"code":-32601,"message":"unavailable"}}\n');
  await assert.rejects(pending, /MCP error -32601/);
  client.close(); await assert.rejects(client.rpc('tools/list', {}), /closed/);
});
