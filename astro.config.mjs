import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // 'static' = static pages by default, but allows server endpoints (like our contact API)
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'never',
});
