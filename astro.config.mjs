import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  // 'hybrid' = static pages by default, but allows server endpoints (like our contact API)
  output: 'hybrid',
  adapter: vercel(),
});
