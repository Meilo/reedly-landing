import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Canonical origin — required for sitemap generation and absolute URLs.
  site: 'https://www.reedly.ai',
  // 'static' = static pages by default, but allows server endpoints (like our contact API)
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'never',
  integrations: [
    // Auto-generates a complete sitemap on every build (no more stale static file).
    // hreflang is emitted per-page in the <head> (Layout.astro), so a flat sitemap is fine.
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
  ],
});
