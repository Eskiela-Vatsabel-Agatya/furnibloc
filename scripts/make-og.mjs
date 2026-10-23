// npm run og — TEMP social card (1200x630): brand logo on the surface colour with the tagline.
// // TEMP: replace public/og-default.png with a designed card (a product photo shot) when the client supplies one.
// Colours are read from tokens.css so no hex value lives in this script.
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const token = (n) => css.match(new RegExp(`--${n}:\\s*(#[0-9A-Fa-f]{6})`))[1];
const bg = token('surface'), ink = token('ink-900'), sub = token('ink-700'), brand = token('brand-700');

let logo = readFileSync(new URL('../src/assets/brand/logo.svg', import.meta.url), 'utf8');
logo = logo.replace(/var\(--[\w-]+,\s*(#[0-9a-fA-F]{3,8})\s*\)/g, '$1');
logo = logo.replace(/&(?!(amp|lt|gt|quot|apos|#\d+);)/g, '&amp;');   // the supplied logo has a raw "&" (fine in HTML, invalid as XML)
const vb = logo.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
const lw = 520, lh = Math.round((lw * vb[2]) / vb[1]);
logo = logo.replace(/(<svg[^>]*?)\swidth="[^"]*"/, '$1').replace(/(<svg[^>]*?)\sheight="[^"]*"/, '$1').replace('<svg ', `<svg width="${lw}" height="${lh}" `);
const logoPng = await sharp(Buffer.from(logo), { density: 192 }).resize(lw, lh, { fit: 'inside' }).png().toBuffer();
const meta = await sharp(logoPng).metadata();

const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect x="80" y="404" width="96" height="6" rx="3" fill="${brand}"/>
  <text x="80" y="470" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="44" font-weight="700" fill="${ink}">Showroom furnitur &amp; dekorasi di Solo</text>
  <text x="80" y="520" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="30" fill="${sub}">Lihat dalam 3D, coba di ruanganmu dengan AR</text>
</svg>`);

await sharp({ create: { width: 1200, height: 630, channels: 3, background: bg } })
  .composite([{ input: logoPng, left: 80, top: Math.max(60, 330 - (meta.height ?? 0)) }, { input: text, left: 0, top: 0 }])
  .png({ compressionLevel: 9 }).toFile(new URL('../public/og-default.png', import.meta.url).pathname);
console.log('wrote public/og-default.png (TEMP card)');
