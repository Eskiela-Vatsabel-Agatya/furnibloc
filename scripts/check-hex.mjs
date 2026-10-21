// Fails if a hex color appears anywhere in src/ outside tokens.css (and the one allowed exception, src/lib/qr.ts).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = new URL('../src', import.meta.url).pathname;
const ALLOWED = new Set(['styles/tokens.css', 'lib/qr.ts']);
const EXT = /\.(astro|css|ts|js|mjs|svg|html)$/;
const HEX = /(^|[^\w&])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/;

let bad = 0;
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    const rel = relative(ROOT, p).split(sep).join('/');
    if (!EXT.test(name) || ALLOWED.has(rel)) continue;
    readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
      // skip in-page anchors like href="#cara-ar"
      if (HEX.test(line.replace(/(href|id|for|aria-controls|aria-labelledby)=["']#?[\w-]+["']/g, ''))) {
        console.error(`stray hex: src/${rel}:${i + 1}: ${line.trim()}`);
        bad++;
      }
    });
  }
})(ROOT);
if (bad) { console.error(`\n${bad} stray hex value(s). Move them to src/styles/tokens.css.`); process.exit(1); }
console.log('check-hex: ok (no hex outside tokens.css)');
