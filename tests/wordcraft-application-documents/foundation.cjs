'use strict';
// Test-only preparation: reuse shipped validation and the upstream fictional factories.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { createHarness, classifyCheck } = require('../targeted-application-strategy/foundation.cjs');
const { profile } = require('../targeted-application-strategy/fixtures.cjs');
const { handoff } = require('../targeted-application-strategy/contract-fixture.cjs');
const { requireTool } = require('../wordcraft-document-session/foundation.cjs');
const metadata = require('./fixtures.json');
const root = path.resolve(__dirname, '../..');
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
function privateDestination(output) {
  const destination = path.resolve(root, output);
  const relative = path.relative(root, destination);
  if (!relative.startsWith('outputs' + path.sep)) throw Error('Evidence must stay in ignored outputs');
  const check = spawnSync('git', ['check-ignore', '--quiet', '--', relative], {cwd:root, windowsHide:true});
  if (check.status !== 0) throw Error('Evidence must stay in ignored outputs');
  return destination;
}
function readOnlyTool(name, tools) {
  if (!['ui_inspect', 'inspect_document', 'get_text'].includes(name)) throw Error('Read-only inspection allowlist required');
  const tool = requireTool(tools, name);
  if (tool.inputSchema?.required?.length) throw Error('Inspection schema changed');
  return tool;
}
async function prepare() {
  const h = createHarness();
  const { fingerprint, targetFingerprint, inspectStrategy } = h.load('strategy-contract.md', ['fingerprint', 'targetFingerprint', 'inspectStrategy']);
  const p = profile('operations', h.blank);
  p.candidate.name = metadata.name;
  p.employment[0].employer = metadata.employer;
  const profileReport = await h.validate(p);
  const selected = h.select(p);
  const strategy = handoff(p, {sha256, fingerprint, targetFingerprint});
  strategy.settings.requested_documents = ['cv', 'cover_letter'];
  strategy.binding.settings_sha256 = fingerprint(strategy.settings, sha256);
  strategy.binding.resolved_path = selected.snapshot.selection.resolved_path;
  strategy.dispositions.forEach(d => { d.binding = structuredClone(strategy.binding); });
  let serial = 0;
  const validate = async (schema, value) => {
    const input = path.join(h.workspace, `document-foundation-${++serial}.json`);
    fs.writeFileSync(input, JSON.stringify(value));
    const result = spawnSync('uvx', ['--from', 'check-jsonschema==0.38.2', 'check-jsonschema', '--schemafile', path.join(h.skillRoot, schema), input], {encoding:'utf8', windowsHide:true, timeout:120000});
    return {state:classifyCheck(result), findings:[]};
  };
  const strategyReport = await inspectStrategy(strategy, {profile:p, binding:strategy.binding, sha256, validate});
  const longProfile = structuredClone(p);
  for (let i = 1; i <= 35; i++) {
    const entry = structuredClone(p.employment[0]);
    entry.id = `employment-pagination-${i}`;
    entry.employer = `Imaginary parcel workshop ${i}`;
    entry.claims[0].id = `claim-pagination-${i}`;
    entry.claims[0].statement = `For fictional workshop ${i}, reconciled parcel manifests, checked handover notes, recorded routing exceptions and prepared a written summary for the next dispatch shift.`;
    longProfile.employment.push(entry);
  }
  const longReport = await h.validate(longProfile);
  const session = {schema_version:'1.0',sessionId:'fictional-foundation',connection:{id:'fictional-connection',server:'fictional-wordcraft',version:null,mode:'desktop',environmentFingerprint:sha256('fictional environment')},capabilities:[],bindings:[],snapshots:[],intents:[],receipts:[],checks:[]};
  const sessionSchema = await validate('schemas/document-session.schema.json', session);
  if (sessionSchema.state !== 'passed') throw Error('Upstream session schema failed');
  const vm = require('node:vm'), host = vm.createContext({});
  const source = fs.readFileSync(path.join(h.skillRoot, 'references/document-session.md'), 'utf8');
  for (const block of source.matchAll(/```javascript\r?\n([\s\S]*?)```/g)) vm.runInContext(block[1], host);
  const sessionFindings = host.inspectSessionIntegrity(session);
  const destination = path.join(h.workspace, 'application-documents');
  fs.mkdirSync(destination);
  // Stress input only: repetition tests pagination, not editorial quality or semantic approval.
  const paginationText = Object.fromEntries(strategy.draft.versions.map(v => [v.language,
    Array.from({length:100}, (_, i) => `${v.language === 'de' ? 'Fiktiver Abschnitt' : 'Fictional section'} ${i + 1}\n${v.text}\n${v.text}`).join('\n\n')]));
  const result = {profile:p, strategy, longProfile, paginationText, metadata, profileReport, strategyReport, longReport, sessionFindings, destination};
  fs.writeFileSync(path.join(h.workspace, 'application-foundation.json'), JSON.stringify(result, null, 2));
  h.saveEvidence();
  return result;
}
module.exports = { prepare, privateDestination, readOnlyTool, sha256 };
