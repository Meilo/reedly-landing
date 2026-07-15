import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  // Canonical origin — required for sitemap generation and absolute URLs.
  site: 'https://www.reedly.ai',
  // 'static' = static pages by default, but allows server endpoints (like our contact API)
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'never',
  integrations: [
    // Developer docs at /docs. Content sits in src/content/docs/docs/ so Starlight
    // only claims the `/docs/*` routes — the marketing pages keep `/`, `/fr/*`
    // and `/en/*`. See https://starlight.astro.build/manual-setup/ ("subpath").
    starlight({
      title: 'Reedly Docs',
      description: 'Integrate with Reedly — field meeting intelligence for B2B sales teams.',
      // The real mark. Both must be set explicitly: Starlight's favicon defaults
      // to `/favicon.svg`, and public/ happens to contain one — a stray
      // placeholder drawing an "R" in monospace text, not the Reedly logo. So the
      // docs were silently serving a different icon from the rest of the domain.
      //
      // logo.src points at a 64px copy rather than public/favicon.png: Starlight
      // renders the logo through a plain <img> at its intrinsic size, so the
      // 1023x1023 original shipped 778 KB to draw a 28px mark.
      logo: { src: './src/assets/logo.png', alt: 'Reedly' },
      favicon: '/favicon.png',
      customCss: ['./src/styles/starlight.css'],
      // Starlight renders through its own layout, so it never inherits the font
      // <link> from Layout.astro. Mirror it here or the docs fall back to a
      // system font while the rest of reedly.ai is in Geist.
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true } },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Geist:wght@400..800&display=swap',
          },
        },
      ],
      // Starlight injects a site-wide `/404` route. The marketing site has no 404
      // of its own, so leaving this on would serve a docs-styled page for every
      // wrong URL on reedly.ai — not just under /docs.
      disable404Route: true,
      // English-only. The marketing site keeps its own /fr + /en split, which is
      // unrelated to Starlight's i18n.
      defaultLocale: 'root',
      locales: { root: { label: 'English', lang: 'en' } },
      sidebar: [{ label: 'Integrations', items: [{ label: 'Webhooks', slug: 'docs/webhooks' }] }],
      pagination: false,
      components: {
        // reedly.ai is dark-only; these two force the docs to match instead of
        // following the OS preference. See the files for the full reasoning.
        ThemeProvider: './src/components/starlight/ThemeProvider.astro',
        ThemeSelect: './src/components/starlight/ThemeSelect.astro',
      },
      expressiveCode: {
        // Pin the code-block theme too — Expressive Code switches on `data-theme`
        // independently of our CSS variables, which is exactly what left light
        // code blocks sitting on the navy shell.
        themes: ['night-owl'],
      },
    }),
    // Needed to use Starlight's components (Tabs) inside docs content. Must come
    // after starlight() so Starlight's own markdown config is applied first.
    // Pinned to 5.x: 7.x requires astro ^7 and we are on 6.1.1.
    mdx(),
    // Auto-generates a complete sitemap on every build (no more stale static file).
    // hreflang is emitted per-page in the <head> (Layout.astro), so a flat sitemap is fine.
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
  ],
});
