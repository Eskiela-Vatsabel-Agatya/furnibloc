/**
 * DEV ONLY. Never import this from a production page (only /dev/* uses it).
 * Four fake products covering design.md §8's four media states, plus a model that times out.
 * Needs public/model/fixture-cube.glb:  npm run fixtures:glb
 */
import { R2 } from '../lib/assets';
import type { Product } from './products';

const base = { code: 'FX', category: 'Furniture' as const, price: 250000, photoDir: '_fixture' };

export const fixtures: Product[] = [
  { ...base, slug: 'photo-model', code: 'FX-1', name: 'Fixture: 3D + foto', media: { photos: ['placeholder.png'], model: { glb: R2('fixture-cube.glb') } } },
  { ...base, slug: 'photo-only', code: 'FX-2', name: 'Fixture: foto saja', media: { photos: ['placeholder.png'] } },
  { ...base, slug: 'model-only', code: 'FX-3', name: 'Fixture: 3D saja', media: { photos: [], model: { glb: R2('fixture-cube.glb') } } },
  { ...base, slug: 'model-missing', code: 'FX-4', name: 'Fixture: model hilang (jatuh ke foto)', media: { photos: ['placeholder.png'], model: { glb: R2('fixture-missing.glb') } } },
  // Exercises the timeout path: the page sets a 1 ms timeout for this one (data-timeout-ms), so it "never loads in time".
  { ...base, slug: 'model-slow', code: 'FX-5', name: 'Fixture: model lambat (timeout)', media: { photos: ['placeholder.png'], model: { glb: R2('fixture-cube.glb') } } },
];
