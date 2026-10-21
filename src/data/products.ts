import { R2Model } from '../lib/assets';

export type Category = 'Furniture' | 'Home Decoration' | 'Craft';

export interface Product {
  slug: string;                 // URL stem AND asset key stem. PERMANENT once a QR may be printed.
  code: string;                 // legacy "No. Produk"
  name: string;
  category: Category;
  tenant?: string;              // legacy tenant code
  description?: string;
  material?: string;
  dimensions?: { w: number; d: number; h: number; unit: 'cm' };
  color?: string;
  price: number;                // IDR integer
  discountPercent?: number;     // 0–100
  featured?: boolean;           // pinned first; hero candidate
  isNew?: boolean;
  media: {
    photos: string[];           // file names inside src/assets/products/<slug>/
    model?: { glb: string; usdz?: string };   // full URLs: write R2('x.glb') / R2Model('x')
    video?: { src: string; poster?: string }; // full URL: write R2('x.mp4')
  };
}

export const products: Product[] = [
  {
    slug: 'bed-side-panel',
    code: 'MAM0031FBB1',
    name: 'Bed Side Panel',
    category: 'Furniture',            // VERIFY: assumed Furniture
    tenant: 'MAM',
    material: 'Mahogany',
    dimensions: { w: 35, d: 31, h: 65, unit: 'cm' }, // VERIFY: unit and axis order assumed
    // Team decision: the legacy record says RED, but the photo and the team say white.
    color: 'Putih',
    price: 400000,
    discountPercent: 0,
    media: {
      // TEMP: photo.png is a placeholder. Replace with the real 1792576466604_image.png
      // (about 300px wide, use as is) in src/assets/products/bed-side-panel/ and rename here.
      photos: ['photo.png'],
      // Files live in public/model/ locally (git-ignored) and in R2 in production.
      model: R2Model('bed-side-panel'),
      // video: { src: R2('bed-side-panel.mp4') },  // add when a video exists; the Video tab appears automatically
    },
  },
];
