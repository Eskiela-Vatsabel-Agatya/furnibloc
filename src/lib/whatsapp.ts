import site from '../data/site';
import type { Product } from '../data/products';
import { formatRupiah, priceAfterDiscount } from './format';
import { productUrl } from './url';

const DEFAULT_MESSAGE = 'Halo FurniBLOC, saya ingin bertanya tentang showroom dan produknya.';

/**
 * waLink({})                   -> generic enquiry
 * waLink({ product })          -> pre-filled with name, code, price, page URL
 * waLink({ product, pageUrl }) -> same, with an explicit page URL
 * waLink({ topic })            -> generic enquiry about a topic (used by FAQ answers)
 */
export function waLink({ product, pageUrl, topic }: { product?: Product; pageUrl?: string; topic?: string } = {}): string {
  let text = topic ? `Halo FurniBLOC, saya ingin bertanya soal: ${topic}` : DEFAULT_MESSAGE;
  if (product) {
    const url = pageUrl ?? productUrl(product.slug);
    text = `Halo FurniBLOC, saya tertarik dengan ${product.name} (${product.code}) seharga ${formatRupiah(priceAfterDiscount(product))}. Apakah masih tersedia? Link: ${url}`;
  }
  // encodeURIComponent leaves ' unescaped; escape it too so the URL is safe in any context.
  const encoded = encodeURIComponent(text).replace(/'/g, '%27');
  return `https://wa.me/${site.whatsapp.number}?text=${encoded}`;
}
