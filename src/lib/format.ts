import type { Product } from '../data/products';

const NBSP = '\u00A0';

/** formatRupiah(400000) -> "Rp 400.000" (non-breaking space) */
export function formatRupiah(n: number): string {
  const digits = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp${NBSP}${digits}`;
}

/** Final price after discount, rounded to whole Rupiah. */
export function priceAfterDiscount(p: Pick<Product, 'price' | 'discountPercent'>): number {
  const d = p.discountPercent ?? 0;
  return Math.round(p.price * (1 - d / 100));
}
