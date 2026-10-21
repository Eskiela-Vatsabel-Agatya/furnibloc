import type { ImageMetadata } from 'astro';

const BASE = (import.meta.env.PUBLIC_ASSET_BASE ?? '').replace(/\/$/, '');
const FOLDER: Record<string, 'model' | 'video'> = {
  glb: 'model', usdz: 'model', mp4: 'video', webm: 'video',
};
const NAME_OK = /^[a-z0-9][a-z0-9._-]*$/i; // same rule the Worker enforces

/**
 * R2('Chair.glb') -> https://ar.furnibloc.com/model/Chair.glb   (dev: /model/Chair.glb)
 * Write the FILE NAME only. Never a full link, never a *.r2.dev URL.
 * Object names are case-sensitive in R2: keep them lowercase.
 */
export function R2(file: string): string {
  const ext = file.split('.').pop()?.toLowerCase() ?? '';
  const folder = FOLDER[ext];
  if (!folder) throw new Error(`R2("${file}"): extension must be one of ${Object.keys(FOLDER).join(', ')}`);
  if (!NAME_OK.test(file)) throw new Error(`R2("${file}"): letters, digits, dot, dash, underscore only (no spaces, no slashes)`);
  return `${BASE}/${folder}/${file}`;
}

/** R2Model('chair') -> { glb: R2('chair.glb'), usdz: R2('chair.usdz') } */
export function R2Model(name: string) {
  return { glb: R2(`${name}.glb`), usdz: R2(`${name}.usdz`) };
}

/** Folder + extension a URL must have to count as an R2() result. Used by the validator. */
export function isR2Url(url: string, kind: 'glb' | 'usdz' | 'video'): boolean {
  const exts = kind === 'video' ? ['mp4', 'webm'] : [kind];
  const folder = kind === 'video' ? 'video' : 'model';
  const re = new RegExp(`^${BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/${folder}/[a-z0-9][a-z0-9._-]*\\.(${exts.join('|')})$`, 'i');
  return re.test(url) && NAME_OK.test(url.split('/').pop() ?? '');
}

// ---- Product photos: Astro-optimized, never upscaled beyond natural size --------------------------
const photoModules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/products/*/*.{png,jpg,jpeg,webp,avif}',
  { eager: true },
);

/** All photo file names present for a product folder. */
export function photoFilesOnDisk(slug: string): string[] {
  const prefix = `/src/assets/products/${slug}/`;
  return Object.keys(photoModules).filter((k) => k.startsWith(prefix)).map((k) => k.slice(prefix.length));
}

/** productPhotos('bed-side-panel', ['photo.png']) -> ImageMetadata[] in the given order. */
export function productPhotos(slug: string, files: string[]): ImageMetadata[] {
  return files.map((f) => photoModules[`/src/assets/products/${slug}/${f}`]?.default).filter(Boolean);
}
