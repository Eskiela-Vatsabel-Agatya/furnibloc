import site from '../data/site';

/** Absolute canonical URL of a product page. Never localhost, never a preview host. */
export function productUrl(slug: string): string {
  return `${site.url}/produk/${slug}`;
}
