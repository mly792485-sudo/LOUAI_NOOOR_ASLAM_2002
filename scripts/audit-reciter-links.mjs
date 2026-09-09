import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/data/quran_reciters.ts', import.meta.url), 'utf8');
const targets = [];
const blocks = source.split(/\n\s*\},/);
for (const block of blocks) {
  const id = block.match(/id:\s*['"]([^'"]+)/)?.[1];
  const primary = block.match(/url:\s*['"]([^'"]+)/)?.[1];
  const fallback = block.match(/fallbackUrl:\s*['"]([^'"]+)/)?.[1];
  if (!id || !primary) continue;
  targets.push({ id, kind: 'primary', url: `${primary}001.mp3` });
  if (fallback) targets.push({ id, kind: 'fallback', url: `${fallback}001.mp3` });
}
const results = [];
for (const target of targets) {
  try {
    const response = await fetch(target.url, { method: 'HEAD', redirect: 'follow' });
    results.push({ ...target, status: response.status, ok: response.ok, finalUrl: response.url });
  } catch (error) {
    results.push({ ...target, status: 0, ok: false, error: String(error) });
  }
}
fs.writeFileSync('reciter-link-audit.json', JSON.stringify(results, null, 2));
for (const result of results) console.log(`${result.ok ? 'OK' : 'FAIL'} ${result.status} ${result.kind} ${result.id} ${result.url}`);
const failures = results.filter((result) => !result.ok);
console.log(`Checked ${results.length}; failures ${failures.length}`);
process.exitCode = failures.length ? 1 : 0;
