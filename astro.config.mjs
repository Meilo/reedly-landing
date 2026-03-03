import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  // 'hybrid' = static pages by default, but allows server endpoints (like our contact API)
  output: 'hybrid',
  adapter: node({
    mode: 'standalone',
  }),
  // To deploy on Vercel, swap the adapter:
  //   import vercel from '@astrojs/vercel/serverless'
  //   adapter: vercel()
});
