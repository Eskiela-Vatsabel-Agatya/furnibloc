import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// D1/D2: build-time framework only. Static output, no adapter, no SSR, no API routes.
// Sitemap excludes /dev/* (those pages are not built in production anyway) and the 404.
export default defineConfig({
  output: 'static',
  site: 'https://www.furnibloc.com',
  trailingSlash: 'never',
  integrations: [sitemap({ filter: (page) => !page.includes('/dev/') && !page.endsWith('/404') })],
  build: { format: 'file' },
});
