import QRCode from 'qrcode';
import site from '../data/site';
import { productUrl } from './url';

// The ONLY hex values outside tokens.css (plan 2.4a): a QR is pure black on pure white, and the string-based
// SVG cannot read CSS variables. Scan reliability beats style.
export const QR_DARK = '#000000';
export const QR_LIGHT = '#FFFFFF';

/**
 * Inline SVG for a QR code. Error correction Q, quiet zone of 4 modules, crisp edges.
 * `size` is the rendered px size (0 = no fixed size, the CSS decides).
 */
export async function qrSvg(url: string, opts: { label: string; size?: number }): Promise<string> {
  const raw = await QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'Q',
    margin: 4,
    color: { dark: QR_DARK, light: QR_LIGHT },
  });
  const sized = opts.size ? ` width="${opts.size}" height="${opts.size}"` : '';
  const label = opts.label.replace(/"/g, '&quot;');
  return raw.replace('<svg ', `<svg role="img" aria-label="${label}"${sized} `).replace(/shape-rendering="[^"]*"/, '').replace('<svg ', '<svg shape-rendering="crispEdges" ');
}

/** QR for a product page: always the absolute canonical URL (never localhost, never a preview host). */
export function productQr(p: { slug: string; name: string }, size = 0): Promise<string> {
  return qrSvg(productUrl(p.slug), { label: `Kode QR untuk membuka ${p.name}`, size });
}

export const QR_HOST_LABEL = site.url.replace(/^https?:\/\/(www\.)?/, ''); // "furnibloc.com"
