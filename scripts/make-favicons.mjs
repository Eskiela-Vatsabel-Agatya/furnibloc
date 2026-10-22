// npm run favicons
// Reads src/assets/brand/favicon.svg and writes public/favicon.svg (self-contained: CSS vars resolved, explicit size)
// plus favicon-32.png and apple-touch-icon.png. Needed because browsers render an SVG favicon in isolation:
// no page CSS variables, and width/height="100%" gives it no intrinsic size.
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const src = new URL('../src/assets/brand/favicon.svg', import.meta.url);
const pub = (f) => new URL(`../public/${f}`, import.meta.url);
let svg = readFileSync(src, 'utf8');
svg = svg.replace(/var\(--[\w-]+,\s*(#[0-9a-fA-F]{3,8})\s*\)/g, '$1');            // resolve var(--x, #fallback)
const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
if (!vb) throw new Error('favicon.svg needs a viewBox="0 0 W H"');
svg = svg.replace(/(<svg[^>]*?)\swidth="[^"]*"/, '$1').replace(/(<svg[^>]*?)\sheight="[^"]*"/, '$1')
  .replace('<svg ', `<svg width="${vb[1]}" height="${vb[2]}" `);
writeFileSync(pub('favicon.svg'), svg);
const buf = Buffer.from(svg);
await sharp(buf, { density: 384 }).resize(32, 32).png().toFile(pub('favicon-32.png').pathname);
await sharp(buf, { density: 384 }).resize(180, 180).png().toFile(pub('apple-touch-icon.png').pathname);
console.log('favicons written: favicon.svg, favicon-32.png, apple-touch-icon.png');
