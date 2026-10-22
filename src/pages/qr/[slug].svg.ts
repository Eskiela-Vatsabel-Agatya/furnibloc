/** /qr/<slug>.svg — downloadable, print-ready QR for every product (static, built from the data). */
import type { APIRoute } from 'astro';
import { getProducts, getProduct } from '../../lib/products';
import { productQr } from '../../lib/qr';

export function getStaticPaths() {
  return getProducts().map((p) => ({ params: { slug: p.slug } }));
}

export const GET: APIRoute = async ({ params }) => {
  const p = getProduct(params.slug!)!;
  return new Response(await productQr(p, 512), { headers: { 'Content-Type': 'image/svg+xml' } });
};
