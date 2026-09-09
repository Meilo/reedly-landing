# CLAUDE.md

Reedly's bilingual (FR/EN) marketing site. Reedly is the field intelligence platform for B2B tourism: sales reps who cover a network of travel agencies run their meeting, the mobile app transcribes it, and an 11-section structured report lands in the Manager Hub for sales leadership.

## Stack

- **Astro 6** in `output: 'static'` with the `@astrojs/vercel` adapter — static-first, with a few endpoints server-rendered via `export const prerender = false`.
- **Node 20+**, **pnpm 10** (declared in `packageManager`). Use `pnpm`, not npm.
- **TypeScript strict** (`astro/tsconfigs/strict`) with `@/*` → `src/*` path alias.
- **Resend** for the contact form and booking emails.
- **PostHog** for analytics (snippet in `src/components/PostHog.astro`).
- **No CSS framework** — vanilla CSS in `src/styles/global.css`.
- **Light theme only.** There is no theme switcher and no dark palette on the marketing site; `/docs` (Starlight) keeps its own dark surface, which is unrelated.

Common commands:

```bash
pnpm dev      # http://localhost:4321
pnpm build    # → dist/
pnpm preview
pnpm test     # vitest (booking slot logic)
```

## Architecture

### Routing — bilingual mirror

Every public page exists under both `/en/...` and `/fr/...`. Root `/` redirects to `/en` (see `vercel.json`). Trailing slashes are stripped (`trailingSlash: 'never'`).

The whole site is 12 pages:

| | FR | EN |
| --- | --- | --- |
| Home | `/fr` | `/en` |
| AI transcription | `/fr/features/transcription-ia` | `/en/features/ai-transcription` |
| Manager Hub | `/fr/features/hub-manager` | `/en/features/manager-hub` |
| Legal notice | `/fr/mentions-legales` | `/en/legal-notice` |
| Privacy | `/fr/confidentialite` | `/en/privacy-policy` |
| Cookies | `/fr/cookies` | `/en/cookie-policy` |
| Terms | `/fr/cgu` | `/en/terms-of-service` |

Plus `/docs/*` (Starlight, English only) and the API endpoints.

There is **no blog, no pricing page, no alternatives/comparison pages** — pricing lives in the home's `#pricing` section. `vercel.json` holds 301s from every legacy path (`/blog/*`, `/tarifs`, `/pricing`, `/alternatives/*`, `/comparatif`…). Keep redirects there, not in Astro.

When adding a page, **add both language halves** and the redirect pair in `vercel.json` if a legacy URL needs preserving.

### Home sections

`src/pages/{fr,en}/index.astro` composes, in order: `Nav`, `Hero`, `Demo`, `Hub`, `Compliance`, `Pricing`, `Testimonials`, `BookDemo`, `Faq`, `FinalCta`, `Footer`.

Copy for all of these lives server-side in `src/lib/i18n.ts` (`t(lang, key)`). Nothing in `public/main.js` renders copy — it only drives behaviour.

### Product (feature) pages

Not an Astro content collection: loaded manually from YAML.

- Registry: `src/data/features.yaml` maps `feature.id` → `{ slugs: { fr, en } }`. **Slugs differ per language.**
- Content: `src/content/features/{fr,en}/{slug}.yaml` — `seo`, `hero`, `problem`, `solution`, `benefits`, `use_cases`, `faq`.
- Loader: `src/lib/load-features.ts`.
- Photography: `src/lib/feature-media.ts` maps a feature id to its hero image and supplies the four use-case photos (keyed by id so both languages show the same visuals).
- Routed by `src/pages/{fr,en}/features/[...slug].astro` via `getStaticPaths` from the registry.

`problem.cards` and `benefits.cards` carry an `icon` naming an entry in the icon registry (below). `use_cases.cards` carry no icon, and the section has two shapes, chosen by `use_cases.variant`:

- default (AI transcription) — `FeatureUseCases.astro`: an accordion whose selected row swaps the photo beside it.
- `variant: roles` (Manager Hub) — `FeatureRoles.astro`: role tabs over a darkened photo, each revealing a card with a heading, a paragraph and three bullets. Those cards also carry `heading` (two-line, with `<br />`) and `bullets`.

Both pages end with `FeatureStickyCta.astro`, a bottom bar that slides in past the scroll threshold, labelled with `hero.eyebrow`.

There is no "related features" section: the canvas has none, so the pages cross-link only through the footer.

### Icons

`src/components/Icon.astro` is the single icon registry, lifted verbatim from the design canvas (solid style, 24×24 viewBox). Paths carry no fill or size of their own: they inherit `currentColor` and the `size` prop.

**Use this registry for every icon.** Don't hand-write new SVG paths in components — add the entry to `Icon.astro` instead, taken from the design canvas.

The only exceptions live in `src/components/icons/` (country flags) and `Footer.astro` (App Store / Google Play / LinkedIn / Instagram marks), which are brand assets rather than UI icons.

### Interactivity

`public/main.js` (loaded with `<script src="/main.js" is:inline>`) owns the global behaviours: analytics helpers + `window.reedlyTrackEvent`, scroll reveal (`.reveal` → `.is-visible`), the nav's compact pill and its light-ink flip over `[data-nav-dark]` sections, the language dropdown, the FAQ accordion, the pricing billing toggle, and the testimonial carousel. It also mirrors the scroll threshold onto `<html class="is-scrolled">`, which is what reveals the product pages' sticky CTA.

Three behaviours are component-scoped inline scripts instead, because they are local to one block: the booking flow in `BookDemo.astro`, the use-case accordion in `FeatureUseCases.astro`, and the role tabs in `FeatureRoles.astro`.

### API endpoints (server-rendered)

- `src/pages/api/contact.ts` — `POST /api/contact`, validates and sends via Resend.
- `src/pages/api/notify.ts` — similar pattern.
- `src/pages/api/availability.ts` and `src/pages/api/book.ts` — the native demo booking (below).
- All set `prerender = false`.

### Native demo booking

The "Réserver une démo" section (`BookDemo.astro`, `#rdv`) is a self-hosted, Calendly-like flow: the qualifying form (email, role, sector, team size) reveals a 15-minute slot picker. Availability = Mon–Fri 09:00–18:00 Europe/Paris minus the host calendar's Google FreeBusy; booking creates a Google Meet event and invites the visitor. No database — the calendar is the source of truth. Pure logic (`generateSlots`, `isSlotBookable`) lives in `src/lib/booking/*` and is unit-tested with vitest; the Google client is `src/lib/booking/google.ts`; parameters are in `src/lib/booking/config.ts`.

The inline script reads its UI strings from a `<script type="application/json" id="bd-i18n">` island rendered from `src/lib/i18n.ts`, so there is no second dictionary to keep in sync.

## Conventions

- **Imports**: always `@/...` (e.g. `import Nav from '@/components/Nav.astro'`), not relative `../`.
- **Astro frontmatter** uses single-quoted strings, semicolons, 2-space indent.
- **Section headings** are two lines: the first plain, the second wrapped in `<em>` (rendered in slate, or green on dark sections). Titles carry literal `<br />` and `<em>` and are rendered with `set:html`.
- **Bilingual symmetry is mandatory.** Any new page, redirect or feature needs both `fr` and `en` versions.
- **SEO**: every page sets `title` ≤ 60 chars including "Reedly", `description` ≤ 155 chars, canonical URL, hreflang. Home and feature pages emit JSON-LD; only one `FAQPage` per page (emitted by whichever FAQ component renders).
- **Comments**: existing code has minimal comments — don't add commentary unless non-obvious.
- **Don't fabricate product claims.** Verify against existing copy (`src/lib/i18n.ts`, `src/content/features/`) before writing marketing text.

## Design system

`src/styles/global.css` is the whole system, ported from the design canvas:

- Surfaces `#f8fafc` (default), `#ffffff` (`.section--white`), `#0f172a` (`.section--dark`, which also flips the nav via `data-nav-dark`).
- Ink `#0f172a` / muted `#475569` / faint `#64748b`; brand green `#16a34a`, light `#4ade80`.
- Display font **Lanterosy** (`public/fonts/Lanterosy.ttf`, self-hosted), body font **Inter**.
- Container 1240px, section padding `clamp(80px, 9vw, 140px)`, radius 24px.
- Utility classes: `.section`, `.inner`, `.display` (`--xl` / `--lg`), `.lead`, `.btn` (`--primary` / `--ink` / `--ghost` / `--onDark` / `--block`), `.frame`, `.reveal`, `.center-mobile`.

## Product facts (canonical)

- Mobile app (iOS + Android) for B2B field sales reps; Manager Hub on the web for managers.
- **Transcribes** the meeting in the background — in real time during the conversation, or the rep dictates the report right afterwards. **95%+ transcription accuracy**, then an **11-section structured report in under 2 minutes**.
- Sections: executive summary, client profile, needs, objections, commitments, next steps, opportunities, risks, recommendations.
- **The voice is neither recorded nor stored** — only the transcript is used to generate the report. Never write copy framed as "audio is recorded then deleted"; that was the old positioning and was removed site-wide.
- Works offline: the app holds with no network; transcription and the report generate as soon as the connection is back.
- Vertical: B2B tourism — tour operators, travel wholesalers, DMC / inbound, MICE, transport, cruise, hospitality, leisure. Audiences: field sales reps covering a network of travel agencies, and the sales directors who run that network.
- Pricing: Team at 49 €/rep/month (42 € billed annually), from 3 reps. Enterprise on quote, 16+ reps. There is no free plan, only a trial.

## Environment

Required env (`.env`):

- `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` — contact form and booking emails.
- `PUBLIC_POSTHOG_KEY`, `PUBLIC_POSTHOG_HOST`, `PUBLIC_POSTHOG_DEFAULTS` — analytics (the `PUBLIC_` prefix exposes them to the client).
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID` (default `primary`) — native demo booking. Generate the refresh token once with `node scripts/google-oauth.mjs`.

## Deployment

Deployed to Vercel. `astro.config.mjs` uses `output: 'static'` + `@astrojs/vercel` — the server endpoints are emitted as Vercel Functions because of `prerender = false`. Don't switch to `output: 'hybrid'` unless intentionally.

## Gotchas

- The README is partly out of date. Treat the code as source of truth.
- `vercel.json` legacy redirect `/solutions/:slug` → `/features/:slug` — the product pages live at `/features/...`, not `/solutions/...`.
- `Layout.astro` defaults to **French** title/description if none provided — always pass `lang` and explicit `title`/`description` for English pages.
- `hero.cta_label` / `hero.cta_url` still exist in the feature YAMLs but are no longer rendered; the hero CTAs point at the home `#rdv` anchor.
- The layout was verified against the canvas by loading each maquette in a same-origin iframe and diffing computed geometry at a 1440px viewport. If you change spacing or an icon size, re-check against the canvas rather than eyeballing it: several values there are deliberate oddities (a 70px icon tile around a 60px glyph, `min-height` on only two rows of the booking form, a 52px benefits gap against a 56px problem gap).
- `public/video/*.mp4` are left over from a removed section and are currently unreferenced.
