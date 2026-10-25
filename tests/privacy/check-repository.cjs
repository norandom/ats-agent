// Local deterministic check. No model calls, stored personal identifiers or content logging.
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const normalize = value => String(value).normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
function identifiers(facts, extra = []) {
  const values = [...extra];
  function walk(value, key = '') {
    if (typeof value === 'string' && /^(name|email|phone|employer)$/.test(key)) values.push(value);
    else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) walk(v, k);
  }
  walk(facts.candidate);
  for (const job of facts.employment || []) if (job.employer) values.push(job.employer);
  return [...new Set(values.map(normalize).filter(v => v.length >= 4))];
}
function containsIdentifier(text, terms) {
  const normalized = normalize(text);
  const digits = normalized.replace(/\D/g, '');
  return terms.some(term => normalized.includes(term) ||
    (/^\+?[\d\s().-]{8,}$/.test(term) && digits.includes(term.replace(/\D/g, ''))));
}
module.exports = {identifiers, containsIdentifier};
if (require.main === module) {
  try {
    const git = (...args) => execFileSync('git', args, {encoding: 'utf8', maxBuffer: 32 * 1024 * 1024});
    const root = git('rev-parse', '--show-toplevel').trim();
    const read = p => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
    if (!process.argv[2]) throw new Error('Missing input');
    const terms = identifiers(read(process.argv[2]), process.argv[3] ? read(process.argv[3]) : []);
    if (!terms.length) throw new Error('No identifiers');
    const files = [...new Set(git('ls-files', '--cached', '--others', '--exclude-standard', '-z').split('\0').filter(Boolean))];
    const staged = new Set(git('ls-files', '-z').split('\0').filter(Boolean));
    const failures = [];
    for (const file of files) {
      if (/^(private|outputs|examples)\//.test(file)) { failures.push(`${file} (private path is tracked)`); continue; }
      if (containsIdentifier(file, terms)) failures.push(`${file} (filename)`);
      const local = path.join(root, file);
      if (fs.existsSync(local) && containsIdentifier(fs.readFileSync(local).toString('utf8'), terms)) failures.push(`${file} (working tree)`);
      if (staged.has(file) && containsIdentifier(git('show', `:${file}`), terms)) failures.push(`${file} (index)`);
    }
    if (failures.length) {
      console.error('Privacy review required in:\n' + [...new Set(failures)].join('\n'));
      process.exitCode = 1;
    } else console.log(`PASS: ${files.length} shareable paths checked against runtime identifiers; working tree and index checked. Manual review still required.`);
  } catch {
    console.error('Privacy check incomplete. Verify input JSON and Git access locally. No input contents logged.');
    process.exitCode = 2;
  }
}
