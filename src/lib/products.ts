import { products, type Category, type Product } from '../data/products';
import { isR2Url, photoFilesOnDisk } from './assets';

const SLUG_OK = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Build-time validation. A bad data entry must break the build, not the live site. */
export function validateProducts(list: Product[]): void {
  const errors: string[] = [];
  const slugs = new Set<string>();
  const codes = new Set<string>();

  list.forEach((p, i) => {
    const at = `products[${i}] (${p.slug ?? '?'})`;
    if (!p.slug || !SLUG_OK.test(p.slug)) errors.push(`${at}: slug must be lowercase kebab-case (it ends up in public URLs and printed QR codes)`);
    if (slugs.has(p.slug)) errors.push(`${at}: duplicate slug`);
    slugs.add(p.slug);
    if (!p.code) errors.push(`${at}: code is required`);
    if (codes.has(p.code)) errors.push(`${at}: duplicate code "${p.code}"`);
    codes.add(p.code);
    if (!p.name) errors.push(`${at}: name is required`);
    if (!Number.isInteger(p.price) || p.price < 0) errors.push(`${at}: price must be a non-negative integer (IDR)`);
    const d = p.discountPercent;
    if (d !== undefined && (typeof d !== 'number' || d < 0 || d > 100)) errors.push(`${at}: discountPercent must be between 0 and 100`);

    const onDisk = new Set(photoFilesOnDisk(p.slug));
    for (const f of p.media.photos) {
      if (!onDisk.has(f)) errors.push(`${at}: photo "${f}" not found in src/assets/products/${p.slug}/`);
    }

    const m = p.media.model;
    if (m) {
      if (!m.glb) errors.push(`${at}: model needs a glb`);
      else if (!isR2Url(m.glb, 'glb')) errors.push(`${at}: model.glb must be an R2('x.glb') result, got "${m.glb}"`);
      if (m.usdz && !isR2Url(m.usdz, 'usdz')) errors.push(`${at}: model.usdz must be an R2('x.usdz') result, got "${m.usdz}"`);
    }
    const v = p.media.video;
    if (v) {
      if (!v.src || !isR2Url(v.src, 'video')) errors.push(`${at}: video.src must be an R2('x.mp4') result, got "${v?.src}"`);
    }
  });

  if (errors.length) throw new Error(`Product data is invalid:\n  - ${errors.join('\n  - ')}`);
}

validateProducts(products);

export function getProducts(): Product[] {
  return products;
}
export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
/** Only categories that actually have products. */
export function getCategories(): Category[] {
  return [...new Set(products.map((p) => p.category))];
}
export const hasModel = (p: Product): boolean => Boolean(p.media.model?.glb);
export const hasVideo = (p: Product): boolean => Boolean(p.media.video?.src);
