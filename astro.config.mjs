import { defineConfig } from 'astro/config';

// D1/D2: build-time framework only. Static output, no adapter, no SSR, no API routes.
// Phase 3 adds @astrojs/sitemap.
export default defineConfig({
  output: 'static',
  site: 'https://www.furnibloc.com',
  trailingSlash: 'never',
  build: { format: 'file' },
});
