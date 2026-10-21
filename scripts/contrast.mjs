// Usage: node scripts/contrast.mjs  — prints WCAG contrast ratios for the token pairs that matter.
// Reads tokens.css so the numbers always match what ships.
import { readFileSync } from 'node:fs';
const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const t = {};
for (const m of css.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) t[m[1]] = m[2];
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const checks = [
  ['body text ink-900 on surface', 'ink-900', 'surface', 4.5],
  ['secondary text ink-700 on surface', 'ink-700', 'surface', 4.5],
  ['muted text ink-500 on surface', 'ink-500', 'surface', 4.5],
  ['ink-900 on surface-raised', 'ink-900', 'surface-raised', 4.5],
  ['primary button text white on brand-700', 'white', 'brand-700', 4.5],
  ['(info) white on brand-600 — why primary uses 700', 'white', 'brand-600', 4.5, true],
  ['ink-700 on surface-sunken (inset wells; ink-500 is NOT allowed there)', 'ink-700', 'surface-sunken', 4.5],
  ['ink-900 on brand-100 (selected chip)', 'ink-900', 'brand-100', 4.5],
  ['brand-700 on brand-100 (selected chip text)', 'brand-700', 'brand-100', 4.5],
  ['price text brand-700 on surface', 'brand-700', 'surface', 4.5],
  ['AR pill text brand-700 on surface', 'brand-700', 'surface', 4.5],
  ['control border on surface', 'border-control', 'surface', 3],
  ['focus ring brand-600 on surface', 'brand-600', 'surface', 3],
  ['whatsapp button text white on whatsapp-strong', 'white', 'whatsapp-strong', 4.5],
  ['badge promo text on promo bg', 'promo-ink', 'promo-bg', 4.5],
  ['footer text on ink-900', 'footer-text', 'ink-900', 4.5],
  ['footer muted on ink-900', 'footer-muted', 'ink-900', 4.5],
];
t.white = '#FFFFFF';
let fail = 0;
for (const [label, fg, bg, min, infoOnly] of checks) {
  if (!t[fg] || !t[bg]) { console.log(`?? ${label}: missing token ${!t[fg] ? fg : bg}`); fail++; continue; }
  const r = ratio(t[fg], t[bg]);
  const ok = r >= min;
  if (!ok && !infoOnly) fail++;
  console.log(`${ok ? 'PASS' : infoOnly ? 'INFO' : 'FAIL'}  ${r.toFixed(2)}:1 (min ${min})  ${label}  [${t[fg]} on ${t[bg]}]`);
}
process.exit(fail ? 1 : 0);
