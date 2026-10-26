// Test-only transport. Never used by the shipped skill runtime.
const { spawn } = require('node:child_process');
function desktopArgs(endpoint) {
  const match = /^127\.0\.0\.1:(\d+)$/.exec(endpoint || '');
  if (!match || +match[1] < 1 || +match[1] > 65535) throw new Error('Explicit loopback desktop endpoint required');
  return ['mcp', '--connect', endpoint];
}
function requireTool(tools, name) {
  const tool = tools.find(item => item.name === name);
  if (!tool) throw new Error(`Capability unavailable: ${name}; dependent work blocked`);
  return tool;
}
function validateFixtures(value) {
  if (value.fictional !== true || value.documents?.length !== 2) throw new Error('Explicit fictional fixtures required');
  for (const kind of ['cv', 'letter']) {
    const doc = value.documents.find(item => item.kind === kind);
    if (!doc || !doc.text || !doc.edit?.target || !doc.edit.replacement) throw new Error('CV and letter fixtures required');
    if (doc.text.split(doc.edit.target).length !== 2) throw new Error('Edit target must be unique');
  }
  return value;
}
class McpClient {
  constructor(child, {timeoutMs = 15000, maxBytes = 4 * 1024 * 1024} = {}) {
    this.child = child; this.timeoutMs = timeoutMs; this.maxBytes = maxBytes;
    this.pending = new Map(); this.id = 0; this.buffer = ''; this.closed = false;
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', chunk => {
      this.buffer += chunk;
      if (Buffer.byteLength(this.buffer) > maxBytes) return this.close(new Error('MCP output limit exceeded'));
      let index;
      while ((index = this.buffer.indexOf('\n')) >= 0) {
        const line = this.buffer.slice(0, index); this.buffer = this.buffer.slice(index + 1);
        if (!line.trim()) continue;
        let message;
        try { message = JSON.parse(line); } catch { return this.close(new Error('Malformed MCP response')); }
        if (!message || typeof message !== 'object') return this.close(new Error('Malformed MCP response'));
        const request = this.pending.get(message.id);
        if (!request) continue;
        this.pending.delete(message.id); clearTimeout(request.timer);
        if (message.error) request.reject(new Error(`MCP error ${message.error.code ?? 'unknown'}`));
        else request.resolve(message.result);
      }
    });
    // Drain diagnostics without persisting potential authentication material.
    child.stderr.on('data', () => {});
    child.on('error', () => this.close(new Error('MCP process failed')));
    child.on('exit', () => this.close(new Error('MCP process exited')));
    child.stdin.on('error', () => this.close(new Error('MCP input failed')));
  }
  static connect(executable, endpoint) {
    if (!executable) throw new Error('Explicit CLI executable required');
    return new McpClient(spawn(executable, desktopArgs(endpoint), {windowsHide:true, stdio:['pipe','pipe','pipe']}));
  }
  rpc(method, params) {
    if (this.closed) return Promise.reject(new Error('MCP connection closed'));
    if (this.pending.size) return Promise.reject(new Error('Only sequential MCP calls permitted'));
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      const timer = setTimeout(() => this.close(new Error('MCP timeout; no automatic replay')), this.timeoutMs);
      this.pending.set(id, {resolve, reject, timer});
      this.child.stdin.write(JSON.stringify({jsonrpc:'2.0', id, method, params}) + '\n');
    });
  }
  notify(method) { this.child.stdin.write(JSON.stringify({jsonrpc:'2.0', method}) + '\n'); }
  close(error = new Error('MCP connection closed')) {
    if (this.closed) return;
    this.closed = true;
    for (const item of this.pending.values()) { clearTimeout(item.timer); item.reject(error); }
    this.pending.clear(); this.child.stdin.end(); this.child.kill();
  }
}
module.exports = {McpClient, desktopArgs, requireTool, validateFixtures};
