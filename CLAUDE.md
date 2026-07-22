Now I have enough context to write a useful CLAUDE.md.

```markdown
# CLAUDE.md

Reedly's bilingual (FR/EN) marketing landing site. Reedly is a B2B field-sales voice-recording iOS/Android app that auto-generates structured client meeting reports.

## Stack

- **Astro 6** in `output: 'static'` with the `@astrojs/vercel` adapter — static-first, but a few endpoints are server-rendered via `export const prerender = false`.
- **Node 20+**, **pnpm 10** (declared in `packageManager`). Use `pnpm`, not npm.
- **TypeScript strict** (`astro/tsconfigs/strict`) with `@/*` → `src/*` path alias.
- **Resend** for the contact form email.
- **@anthropic-ai/sdk** for content generation scripts (not runtime).
- **PostHog** for analytics (snippet in `src/components/PostHog.astro`).
- **No CSS framework** — vanilla CSS in `src/styles/global.css` (+ `blog.css`). Dark theme by default via `data-theme` on `<html>`.

Common commands:
```bash
pnpm dev                    # http://localhost:4321
pnpm build                  # → dist/
pnpm preview
pnpm generate:feature       # one feature page (interactive)
pnpm generate:features      # all features (uses ANTHROPIC_API_KEY)
node scripts/generate-blog.mjs   # weekly blog cron entrypoint
```

## Architecture

### Routing — bilingual mirror
Every public page exists under both `/en/...` and `/fr/...`. Root `/` and `/solution` redirect to `/en` (see `vercel.json`). Trailing slashes are stripped (`trailingSlash: 'never'`).

- `src/pages/index.astro` — JS-side redirect to `/fr` or `/en` based on `navigator.language`.
- `src/pages/en/` and `src/pages/fr/` — symmetric trees: `index.astro`, `pricing.astro`/`tarifs.astro`, `comparison.astro`/`comparatif.astro`, `privacy-policy.astro`/`confidentialite.astro`, `terms-of-service.astro`/`cgu.astro`, plus `blog/` and `features/`.
- French slugs differ from English (e.g. `pricing` ↔ `tarifs`, `comparison` ↔ `comparatif`). When adding a new page, **add both halves and add the redirect pair to `vercel.json`** if there's a non-prefixed legacy URL to preserve.
- `vercel.json` is the source of truth for permanent redirects (legacy paths like `/blog`, `/pricing`, `/tarifs` → `/en/...` or `/fr/...`). Keep redirects there, not in Astro.

### Content collections

**Blog** (`src/content/blog/*.md`, schema in `src/content.config.ts`):
- One markdown file per article. Frontmatter requires `title`, `description`, `date`, `lang` (`'fr' | 'en'`), `mirror` (slug of the article in the other language), `keywords[]`, `readingTime`, `author` (`'laura' | 'ludovic'`).
- Routed by `src/pages/{en,fr}/blog/[...slug].astro`, filtering the collection on `lang`.
- Posts are auto-generated weekly by `.github/workflows/*.yml` → `scripts/generate-blog.mjs` (uses Anthropic API).

**Features** (NOT an Astro content collection — loaded manually via YAML):
- Registry: `src/data/features.yaml` maps `feature.id` → `{ slugs: { fr, en } }`. **Slugs are different per language.**
- Content: `src/content/features/{fr,en}/{slug}.yaml` — full page structure (seo, hero, problem, solution, benefits, use_cases, faq, related_features).
- Loader: `src/lib/load-features.ts` — `loadFeatureContent`, `getAllFeatureSlugs`, `findMirrorSlug`, `findFeatureId`.
- Routed by `src/pages/{en,fr}/features/[...slug].astro` using `getStaticPaths` from the registry.
- Generation: `scripts/generate-feature.mjs` + `scripts/feature-config.mjs` call Anthropic to produce a YAML file. The config in `feature-config.mjs` is the **canonical product description** — see "Product facts" below.

### Components

- `src/components/*.astro` — one component per home-page section (Hero, Problem, Features, How, Demo, Proof, Integrations, Pricing, Contact, Faq, FinalCta, Footer, Nav, LegalPage, PostHog…).
- `src/components/feature/*.astro` — section components for the feature template page.
- `src/layouts/Layout.astro` — HTML shell, meta/OG/Twitter tags, hreflang, canonical URL, theme bootstrap, PostHog. Accepts `title`, `description`, `lang`, `hreflang`, `ogType`, `articleMeta`.

### Interactivity
Most interactive behavior (i18n toggle, FAQ accordion, pricing toggle, animations, ticker, cursor glow) lives in **`public/main.js`**, loaded with `<script src="/main.js" is:inline>`. Inline component scripts are rare — prefer adding to `main.js` if the behavior is global, otherwise keep it scoped in the `.astro` file.

### API endpoints (server-rendered)
- `src/pages/api/contact.ts` — `POST /api/contact`. Validates fields (special-cases `subject === 'trial'`: requires `role` + numeric `users_count`, message optional). Sends via Resend. Sets `prerender = false`.
- `src/pages/api/notify.ts` — similar pattern.
- Both rely on `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`.

## Conventions

- **Imports**: always `@/...` (e.g. `import Nav from '@/components/Nav.astro'`), not relative `../`.
- **Astro frontmatter** uses single-quoted strings, semicolons, 2-space indent.
- **HTML in headers**: feature/hero titles use literal `<br />` and `<em>` tags in YAML — preserved as-is by `set:html`.
- **Bilingual symmetry is mandatory.** Any new page, redirect, feature, or blog post needs both `fr` and `en` versions. For features, also add the entry to `src/data/features.yaml` (both slugs) before generating.
- **SEO**: every page sets `title` ≤ 60 chars including "Reedly", `description` ≤ 155 chars, canonical URL, hreflang. Feature/blog pages emit JSON-LD (`BreadcrumbList`, `FAQPage`, `Article`).
- **Comments**: existing code has minimal comments — don't add commentary unless non-obvious.
- **Don't fabricate product claims.** See `MEMORY.md` → `feedback_verify_content.md`: verify against existing copy (`src/content/`, `scripts/feature-config.mjs` `product.description`) before writing marketing text.

## Product facts (canonical)
From `scripts/feature-config.mjs`:
- Mobile app (iOS + Android) for B2B field sales reps; Hub web for managers.
- Records meetings in the background, **95%+ transcription accuracy** (Deepgram + Voxtral), generates an **11-section structured report in under 2 minutes**.
- Sections: executive summary, client profile, needs, objections, commitments, next steps, opportunities, risks, recommendations.
- Audio is deleted after report generation.
- Audiences: commerciaux terrain B2B, directeurs commerciaux, sales managers.

## Environment

Required env (`.env`):
- `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` — contact form.
- `PUBLIC_POSTHOG_KEY`, `PUBLIC_POSTHOG_HOST`, `PUBLIC_POSTHOG_DEFAULTS` — analytics (the `PUBLIC_` prefix exposes them to the client).
- `ANTHROPIC_API_KEY` — only needed for `scripts/generate-*.mjs`, not the site itself.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID` (default `primary`) — native demo booking. Generate the refresh token once with `node scripts/google-oauth.mjs`.

### Native demo booking

The "Réserver une démo" section (`BookDemo.astro`, `#rdv`) hosts a self-hosted, Calendly-like flow: after the qualifying form it reveals a 15-min slot picker. Availability = Mon–Fri 09:00–18:00 Europe/Paris minus the host calendar's Google FreeBusy; booking creates a Google Meet event and invites the visitor. No database — the calendar is the source of truth. Pure logic (`generateSlots`, `isSlotBookable`) lives in `src/lib/booking/*` and is unit-tested with vitest (`pnpm test`); the Google client is `src/lib/booking/google.ts`; endpoints are `/api/availability` and `/api/book` (both `prerender = false`). Booking parameters are in `src/lib/booking/config.ts`.

## Deployment

Deployed to Vercel. `astro.config.mjs` uses `output: 'static'` + `@astrojs/vercel` — server endpoints (contact, notify) are emitted as Vercel Functions because of `prerender = false`. Don't switch to `output: 'hybrid'` unless intentionally — current setup is what's in prod. The README has stale instructions about swapping adapters; ignore them.

## Gotchas

- The README is partly out-of-date (mentions `@astrojs/node`, lists fewer components than exist). Treat code as source of truth.
- `vercel.json` legacy redirects: `/solutions/:slug` → `/features/:slug` — the feature pages live at `/features/...`, not `/solutions/...`. Components and links should target `/features/`.
- When adding a feature: 1) add to `src/data/features.yaml`, 2) create both `src/content/features/fr/{slug}.yaml` and `src/content/features/en/{slug}.yaml` (or run `pnpm generate:feature`), 3) the page is generated automatically from the registry.
- The `mirror:` field in blog frontmatter must point to the **slug of the article in the other language** — not a path. The pair is used for hreflang.
- Icon names in feature YAMLs are constrained to the list in `scripts/generate-feature.mjs` (`ICON_NAMES`). The feature components map these strings to SVGs in `FeatureIcon.astro`.
- `Layout.astro` defaults to **French** title/description if none provided — always pass `lang` and explicit `title`/`description` for English pages.
```
