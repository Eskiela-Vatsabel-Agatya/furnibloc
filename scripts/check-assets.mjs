// npm run check:assets
// Scans src/data/products.ts for R2('…'), R2("…") and R2Model('…') and reports which files are missing from
// public/model/ or public/video/. WARNS only (exit 0): in production the files legitimately live only in R2.
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const src = readFileSync(new URL('src/data/products.ts', root), 'utf8')
  .split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n'); // strip comments // ignore commented-out lines

const files = new Set();
for (const m of src.matchAll(/R2Model\(\s*(['"])([^'"]+)\1\s*\)/g)) { files.add(`${m[2]}.glb`); files.add(`${m[2]}.usdz`); }
for (const m of src.matchAll(/\bR2\(\s*(['"])([^'"]+)\1\s*\)/g)) files.add(m[2]);

const folderOf = (f) => (/\.(glb|usdz)$/i.test(f) ? 'model' : 'video');
const missing = [];
for (const f of [...files].sort()) {
  const ok = existsSync(new URL(`public/${folderOf(f)}/${f}`, root));
  console.log(`${ok ? '  ok     ' : '  MISSING'}  public/${folderOf(f)}/${f}`);
  if (!ok) missing.push(f);
}
if (!files.size) console.log('No R2() references found in src/data/products.ts.');

if (missing.length) {
  console.warn('\nWarning: these files are not in public/ (fine in production if they are uploaded to R2).');
  console.warn('Products that would fall back to the photo locally:');
  const prods = src.split(/\n\s*\{\s*\n\s*slug:/).slice(1);
  for (const block of prods) {
    const slug = block.match(/^\s*'([^']+)'/)?.[1];
    const refs = [];
    for (const m of block.matchAll(/R2Model\(\s*(['"])([^'"]+)\1\s*\)/g)) refs.push(`${m[2]}.glb`, `${m[2]}.usdz`);
    for (const m of block.matchAll(/\bR2\(\s*(['"])([^'"]+)\1\s*\)/g)) refs.push(m[2]);
    const gone = refs.filter((r) => missing.includes(r));
    if (gone.length) console.warn(`  - ${slug}: missing ${gone.join(', ')}`);
  }
}
