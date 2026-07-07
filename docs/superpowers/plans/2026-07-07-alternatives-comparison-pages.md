# Alternative Pages ("Alternative à X") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a reusable, bilingual SEO template for competitor-comparison pages ("Alternative à X"), with the first page — Noota — live at `/fr/alternatives/noota` and `/en/alternatives/noota`.

**Architecture:** Mirror the existing *features* pattern exactly — a YAML registry (`src/data/alternatives.yaml`) + per-language content YAML (`src/content/alternatives/{fr,en}/noota.yaml`) + a loader (`src/lib/load-alternatives.ts`) + two `[...slug].astro` routes that render a set of section components (`src/components/alternative/*.astro`). The comparison table is the only genuinely new component; everything else reuses established classes (`.section`, `.feature-card`, `.features-grid`, `.comp-hero`, `.btn`). Pages are server-rendered per language (static build) — no client `main.js` i18n dictionary.

**Tech Stack:** Astro 6 (`output: 'static'` + `@astrojs/vercel`), TypeScript strict, `js-yaml` (already a dep), vanilla CSS in `src/styles/global.css`, pnpm 10.

## Global Constraints

Every task's requirements implicitly include these (copied verbatim from `docs/superpowers/specs/2026-07-07-alternatives-comparison-pages-design.md` + `CLAUDE.md`):

- **No test framework exists in this repo.** Verification = `pnpm build` succeeds (catches TS/import/YAML errors) + inspect built HTML in `dist/` + visual render in a browser for the final task. Do NOT introduce jest/vitest — features have no tests either.
- **Value, never price.** Zero tariff line, zero "free plan" / "plan gratuit", zero price comparison anywhere on the page or in the FAQ.
- **Reedly wins, honestly.** Each table row favors Reedly while describing what Noota genuinely does. No parity rows (FR/EU), no row that could make Reedly look disadvantaged (audio retention framed only as a Reedly promise).
- **Claims à TUER — never write:** "le seul à enregistrer le présentiel / mains libres / hors-ligne"; "Noota n'a pas de mémoire client"; "Noota ne fait qu'une note" (Noota produces a *structured* note). Frame memory as "archive de comptes-rendus à consulter" vs "mémoire centrée client", and output as "restitue la réunion" vs "analyse commerciale décisionnelle".
- **Trial = 7 days, no free plan.** Use "Essayer 7 jours" / "Start 7-day trial". Do NOT copy the stale "14 jours" from old feature YAMLs.
- **Bilingual symmetry is mandatory.** Every FR change has its EN mirror in the same task.
- **Imports:** always `@/...`, never relative `../`. **File names:** kebab-case. **Language of code/comments:** English.
- **HTML in copy:** titles and comparison cells contain literal `<em>` / `<strong>` tags rendered with `set:html` (YAML can't do markdown).
- **Icons** must be one of `FeatureIcon.astro`'s `ICON_NAMES`: `microphone, document, clock, users, brain, globe, building, flask, chart, download, shield, search, zap, target, layers, music, alert, shuffle, compass, book`.
- **Worktree has no `.env`** — copy it from the main checkout before the first build (Task 1, Step 0).
- CSS tokens available: `--bg --border --green --mono --muted --sans --surface --text`.

---

## File Structure

**Create:**
- `src/data/alternatives.yaml` — registry (id + competitor + fr/en slugs)
- `src/lib/load-alternatives.ts` — loader + `AlternativeContent` interface
- `src/content/alternatives/fr/noota.yaml` — FR page content
- `src/content/alternatives/en/noota.yaml` — EN page content
- `src/pages/fr/alternatives/[...slug].astro` — FR route
- `src/pages/en/alternatives/[...slug].astro` — EN route
- `src/components/alternative/AltHero.astro`
- `src/components/alternative/AltVerdict.astro`
- `src/components/alternative/AltComparison.astro` (new centerpiece)
- `src/components/alternative/AltValueBlocks.astro`
- `src/components/alternative/AltPrivacy.astro`
- `src/components/alternative/AltFair.astro`
- `src/components/alternative/AltRelated.astro`

**Modify:**
- `src/components/Footer.astro` — one discreet link (both langs)

**Reuse unchanged:** `Layout.astro`, `Nav.astro`, `FinalCta.astro`, `FeatureFaq.astro`, `FeatureIcon.astro`, `src/styles/global.css`.

---

## Task 1: Data layer + foundational route (Hero renders end-to-end)

Delivers `/fr/alternatives/noota` + `/en/alternatives/noota` building and rendering the hero, verdict-through-related sections added in later tasks. This locks in the loader, the full `AlternativeContent` type, both routes, and both content files (full copy written now; consumed section-by-section later).

**Files:**
- Create: `src/data/alternatives.yaml`, `src/lib/load-alternatives.ts`, `src/content/alternatives/fr/noota.yaml`, `src/content/alternatives/en/noota.yaml`, `src/components/alternative/AltHero.astro`, `src/pages/fr/alternatives/[...slug].astro`, `src/pages/en/alternatives/[...slug].astro`

**Interfaces:**
- Produces: `loadAlternativeContent(lang: 'fr'|'en', slug: string): AlternativeContent`, `getAllAlternativeSlugs(lang): string[]`, `findMirrorSlug(lang, slug): string`, and the `AlternativeContent` type (all sections). Both routes call these in `getStaticPaths` + frontmatter. `AltHero` consumes `{ eyebrow, title, lead, cta_label, cta_url }`.

- [ ] **Step 0: Copy `.env` into the worktree** (build reads `PUBLIC_POSTHOG_*`; without it PostHog no-ops but copying avoids surprises)

```bash
cp /Users/lel/projects/perso/reedly-landing/.env /Users/lel/projects/perso/reedly-landing-worktrees/alternative-pages/.env 2>/dev/null || echo "no .env in main — continuing (static build tolerates it)"
```

- [ ] **Step 1: Create the registry** `src/data/alternatives.yaml`

```yaml
# Central registry mapping alternative IDs to competitor + FR/EN slug pairs.
# Each entry produces two pages: /fr/alternatives/{slugFr} and /en/alternatives/{slugEn}.
# Slugs are identical across languages (competitor names don't translate),
# so the generic language-toggle fallback in public/main.js handles switching —
# no mirror-meta and no main.js change needed.

alternatives:
  - id: "noota"
    competitor: "Noota"
    slugs:
      fr: "noota"
      en: "noota"
```

- [ ] **Step 2: Create the loader** `src/lib/load-alternatives.ts`

```typescript
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export interface AlternativeRegistry {
  alternatives: { id: string; competitor: string; slugs: { fr: string; en: string } }[];
}

export interface AlternativeContent {
  seo: { title: string; description: string; keywords: string[] };
  hero: { eyebrow: string; title: string; lead: string; cta_label: string; cta_url: string };
  verdict: { title: string; text: string };
  comparison: {
    eyebrow: string;
    title: string;
    lead: string;
    columns: { reedly: string; competitor: string };
    rows: { need: string; reedly: string; competitor: string }[];
  };
  value_blocks: {
    eyebrow: string;
    title: string;
    blocks: { title: string; tagline?: string; text: string; icon: string; items?: string[] }[];
  };
  privacy: { text: string };
  fair: {
    eyebrow: string;
    title: string;
    lead: string;
    cards: { title: string; text: string; icon: string }[];
  };
  faq: { question: string; answer: string }[];
  related: { href: string; label: string }[];
}

const DATA_DIR = path.resolve('src/data');
const CONTENT_DIR = path.resolve('src/content/alternatives');

export function loadAlternativeRegistry(): AlternativeRegistry {
  const raw = fs.readFileSync(path.join(DATA_DIR, 'alternatives.yaml'), 'utf-8');
  return yaml.load(raw) as AlternativeRegistry;
}

export function loadAlternativeContent(lang: 'fr' | 'en', slug: string): AlternativeContent {
  const filePath = path.join(CONTENT_DIR, lang, `${slug}.yaml`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return yaml.load(raw) as AlternativeContent;
}

export function getAllAlternativeSlugs(lang: 'fr' | 'en'): string[] {
  const registry = loadAlternativeRegistry();
  return registry.alternatives
    .map((a) => a.slugs[lang])
    .filter((slug) => fs.existsSync(path.join(CONTENT_DIR, lang, `${slug}.yaml`)));
}

export function findMirrorSlug(lang: 'fr' | 'en', slug: string): string {
  const registry = loadAlternativeRegistry();
  const otherLang = lang === 'fr' ? 'en' : 'fr';
  const alt = registry.alternatives.find((a) => a.slugs[lang] === slug);
  if (!alt) throw new Error(`Alternative not found for slug "${slug}" in lang "${lang}"`);
  return alt.slugs[otherLang];
}
```

- [ ] **Step 3: Create the FR content file** `src/content/alternatives/fr/noota.yaml` (full copy — later tasks only consume it)

```yaml
seo:
  title: "Alternative à Noota pour la vente terrain | Reedly"
  description: "Reedly, l'alternative à Noota pensée pour les commerciaux terrain : rapport commercial décisionnel, mémoire client, actions suivies. Essai 7 jours."
  keywords:
    - "alternative Noota"
    - "Noota alternative vente terrain"
    - "Noota vs Reedly"
hero:
  eyebrow: "Alternative à Noota"
  title: "L'alternative à Noota <em>pensée pour la vente terrain.</em>"
  lead: "Noota est un excellent notetaker pour vos réunions en ligne. Mais si vos commerciaux vendent sur le terrain, Reedly transforme chaque visite en rapport commercial décisionnel, enrichit une mémoire de chaque client, et n'oublie jamais un engagement. Mains libres, même hors-ligne."
  cta_label: "Essayer 7 jours"
  cta_url: "/fr#trial"
verdict:
  title: "Deux outils, <em>deux métiers.</em>"
  text: "Noota capture et résume vos réunions — visio comme présentiel — et sert aussi au recrutement. Reedly est conçu pour un seul métier : la vente terrain B2B. Il ne se contente pas de noter le rendez-vous : il en tire une analyse commerciale, la relie à l'historique du client, et pilote la suite."
comparison:
  eyebrow: "Comparaison"
  title: "Reedly face à Noota, <em>du point de vue du terrain.</em>"
  lead: "Six besoins concrets d'un commercial terrain, et ce que chaque outil apporte vraiment."
  columns:
    reedly: "Reedly"
    competitor: "Noota"
  rows:
    - need: "Le compte-rendu"
      reedly: "<strong>Rapport commercial décisionnel</strong> — au-delà du résumé : objections <em>et</em> réponses, concurrents, engagements, opportunités, <strong>risques</strong>, <strong>recommandations</strong>, structuré <strong>par secteur</strong> ; il alimente la mémoire client, les actions et les synthèses."
      competitor: "<strong>Note de réunion structurée</strong> — résumé fidèle et organisé de l'échange (sections, templates, action items)."
    - need: "Des actions qui ne tombent pas aux oubliettes"
      reedly: "Actions <strong>datées et priorisées par l'IA</strong>, <strong>rappel automatique si en retard</strong>, alerte si le client devient dormant."
      competitor: "Une liste d'action items dans la note."
    - need: "Se souvenir de chaque client"
      reedly: "<strong>Fiche client auto-enrichie</strong> dont l'historique <strong>nourrit le rapport suivant</strong>."
      competitor: "Des comptes-rendus à consulter un par un."
    - need: "Arriver préparé au prochain RDV"
      reedly: "<strong>Briefing IA</strong> avant chaque visite (engagements, points de vigilance)."
      competitor: "Un historique à relire manuellement."
    - need: "Une IA qui comprend mon métier"
      reedly: "<strong>Expert sectoriel</strong> : jargon et structure par secteur."
      competitor: "Une IA généraliste."
    - need: "Que le manager voie le terrain"
      reedly: "<strong>Synthèses territoriales</strong> + directives + Max."
      competitor: "Un pilotage terrain limité."
value_blocks:
  eyebrow: "Pourquoi Reedly"
  title: "Ce qu'un notetaker ne fait pas."
  blocks:
    - title: "Un rapport qui décide, pas seulement qui résume"
      tagline: "Noota restitue ce qui s'est dit. Reedly en tire ce qu'il faut décider."
      text: "Chaque rendez-vous devient un rapport commercial structuré — pas un transcript, pas des notes génériques."
      icon: "layers"
      items:
        - "Résumé exécutif"
        - "Profil client"
        - "Besoins exprimés"
        - "Objections et réponses"
        - "Produits et services discutés"
        - "Concurrents mentionnés"
        - "Engagements mutuels"
        - "Prochaines étapes et échéances"
        - "Opportunités"
        - "Risques"
        - "Recommandations"
    - title: "Vos engagements ne s'oublient plus"
      text: "Les actions sont extraites du rapport, datées et priorisées par l'IA selon leur importance ; l'app vous alerte quand une action est en retard et quand un client devient dormant. Reedly agit, il ne se contente pas de noter."
      icon: "target"
    - title: "Une mémoire du client, pas une pile de comptes-rendus"
      tagline: "Une relation, pas des rendez-vous isolés."
      text: "Une fiche client auto-enrichie (timeline, besoins agrégés, contacts, score de relation) ; chaque nouveau rapport part de l'historique et briefe la visite suivante."
      icon: "brain"
    - title: "Pensé pour le terrain"
      text: "Captation en 1 tap, mains libres, en arrière-plan, hors-ligne (synchro ensuite). L'IA comprend le vocabulaire de votre métier."
      icon: "zap"
    - title: "Le manager voit enfin le terrain"
      text: "Synthèses territoriales (tendances, risques et opportunités priorisés), directives avec scoring de conformité, et l'assistant Max."
      icon: "chart"
privacy:
  text: "Vos conversations client ne sont jamais conservées : l'audio est automatiquement supprimé après la génération du rapport. Vos données sont hébergées en Europe."
fair:
  eyebrow: "En toute honnêteté"
  title: "Quand Noota est le bon choix."
  lead: "Noota est un très bon outil. Il sera plus adapté que Reedly si…"
  cards:
    - title: "Vos réunions sont surtout en visio ou au téléphone"
      text: "Noota est né pour la réunion en ligne : c'est son terrain de jeu."
      icon: "globe"
    - title: "Vous avez un besoin recrutement"
      text: "Noota couvre l'entretien candidat et s'intègre aux outils ATS."
      icon: "users"
    - title: "Vous cherchez un notetaker généraliste"
      text: "Pour prendre des notes sur tout type de réunion, au-delà de la vente terrain."
      icon: "document"
faq:
  - question: "Reedly est-il une vraie alternative à Noota ?"
    answer: "Pour une équipe de vente terrain B2B, oui. Noota est un notetaker de réunion (visio et recrutement) ; Reedly produit un rapport commercial décisionnel, entretient une mémoire de chaque client et donne au manager une vision du terrain."
  - question: "Quelle est la vraie différence entre Reedly et Noota ?"
    answer: "Noota restitue fidèlement la réunion dans une note structurée. Reedly en tire une analyse commerciale (objections et réponses, risques, recommandations) qui alimente ensuite la mémoire client, les actions suivies et les synthèses territoriales."
  - question: "Noota enregistre-t-il les rendez-vous physiques ?"
    answer: "Oui, Noota a ajouté le présentiel. Reedly est conçu autour du terrain (mains libres, arrière-plan, hors-ligne) et en tire un rapport commercial, pas seulement des notes de réunion."
  - question: "Peut-on passer de Noota à Reedly facilement ?"
    answer: "Oui : il suffit de commencer à enregistrer vos rendez-vous. La mémoire client s'enrichit dès les premières visites, sans configuration."
  - question: "Mes données restent-elles en Europe ?"
    answer: "Oui, vos données sont hébergées en Europe, et l'audio est supprimé après la génération du rapport."
related:
  - href: "/fr/features/rapport-ia"
    label: "Rapport structuré IA"
  - href: "/fr/features/portfolio-client"
    label: "Portfolio Client"
  - href: "/fr/features/preparation-rdv"
    label: "Préparation de RDV"
```

- [ ] **Step 4: Create the EN content file** `src/content/alternatives/en/noota.yaml`

```yaml
seo:
  title: "Noota Alternative for Field Sales | Reedly"
  description: "Reedly is the Noota alternative built for field sales reps: decision-ready sales reports, client memory, tracked actions. 7-day free trial."
  keywords:
    - "Noota alternative"
    - "Noota alternative field sales"
    - "Noota vs Reedly"
hero:
  eyebrow: "Noota alternative"
  title: "The Noota alternative <em>built for field sales.</em>"
  lead: "Noota is a great notetaker for your online meetings. But if your reps sell in the field, Reedly turns every visit into a decision-ready sales report, builds a memory of every client, and never forgets a commitment. Hands-free, even offline."
  cta_label: "Start 7-day trial"
  cta_url: "/en#trial"
verdict:
  title: "Two tools, <em>two jobs.</em>"
  text: "Noota captures and summarizes your meetings — online and in person — and also serves recruitment. Reedly is built for one job: B2B field sales. It doesn't just take notes on the meeting: it turns it into a commercial analysis, ties it to the client's history, and drives what happens next."
comparison:
  eyebrow: "Comparison"
  title: "Reedly vs Noota, <em>from the field's point of view.</em>"
  lead: "Six concrete needs of a field sales rep, and what each tool actually delivers."
  columns:
    reedly: "Reedly"
    competitor: "Noota"
  rows:
    - need: "The meeting write-up"
      reedly: "<strong>Decision-ready sales report</strong> — beyond the summary: objections <em>and</em> responses, competitors, commitments, opportunities, <strong>risks</strong>, <strong>recommendations</strong>, structured <strong>by industry</strong>; it feeds client memory, actions and syntheses."
      competitor: "<strong>Structured meeting note</strong> — a faithful, organized record of the conversation (sections, templates, action items)."
    - need: "Actions that don't fall through the cracks"
      reedly: "Actions <strong>dated and prioritized by AI</strong>, <strong>auto-reminder when overdue</strong>, alert when the client goes dormant."
      competitor: "A list of action items in the note."
    - need: "Remember every client"
      reedly: "<strong>Auto-enriched client card</strong> whose history <strong>feeds the next report</strong>."
      competitor: "Meeting notes to review one by one."
    - need: "Walk in prepared for the next meeting"
      reedly: "<strong>AI briefing</strong> before every visit (commitments, watch-outs)."
      competitor: "History to re-read manually."
    - need: "An AI that understands my industry"
      reedly: "<strong>Industry expert</strong>: jargon and structure by sector."
      competitor: "A general-purpose AI."
    - need: "Let managers see the field"
      reedly: "<strong>Territory syntheses</strong> + directives + Max."
      competitor: "Limited field oversight."
value_blocks:
  eyebrow: "Why Reedly"
  title: "What a notetaker doesn't do."
  blocks:
    - title: "A report that decides, not just records"
      tagline: "Noota records what was said. Reedly draws out what to decide."
      text: "Every meeting becomes a structured commercial report — not a transcript, not generic notes."
      icon: "layers"
      items:
        - "Executive summary"
        - "Client profile"
        - "Expressed needs"
        - "Objections and responses"
        - "Products and services discussed"
        - "Competitors mentioned"
        - "Mutual commitments"
        - "Next steps and deadlines"
        - "Opportunities"
        - "Risks"
        - "Recommendations"
    - title: "Your commitments never slip"
      text: "Actions are extracted from the report, dated and prioritized by AI by importance; the app alerts you when an action is overdue and when a client goes dormant. Reedly acts, it doesn't just take notes."
      icon: "target"
    - title: "A memory of the client, not a pile of write-ups"
      tagline: "A relationship, not isolated meetings."
      text: "An auto-enriched client card (timeline, aggregated needs, contacts, relationship score); every new report starts from the history and briefs the next visit."
      icon: "brain"
    - title: "Built for the field"
      text: "One-tap capture, hands-free, in the background, offline (syncs later). The AI understands your industry vocabulary."
      icon: "zap"
    - title: "Managers finally see the field"
      text: "Territory syntheses (prioritized trends, risks and opportunities), directives with compliance scoring, and the Max assistant."
      icon: "chart"
privacy:
  text: "Your client conversations are never kept: audio is automatically deleted after the report is generated. Your data is hosted in Europe."
fair:
  eyebrow: "In all honesty"
  title: "When Noota is the right choice."
  lead: "Noota is a very good tool. It will fit better than Reedly if…"
  cards:
    - title: "Your meetings are mostly video or phone"
      text: "Noota was born for the online meeting: that's its home turf."
      icon: "globe"
    - title: "You have a recruitment need"
      text: "Noota covers candidate interviews and integrates with ATS tools."
      icon: "users"
    - title: "You want a general-purpose notetaker"
      text: "To take notes on any kind of meeting, beyond field sales."
      icon: "document"
faq:
  - question: "Is Reedly a real Noota alternative?"
    answer: "For a B2B field sales team, yes. Noota is a meeting notetaker (video and recruitment); Reedly produces a decision-ready sales report, keeps a memory of every client, and gives managers a view of the field."
  - question: "What's the real difference between Reedly and Noota?"
    answer: "Noota faithfully records the meeting in a structured note. Reedly turns it into a commercial analysis (objections and responses, risks, recommendations) that then feeds client memory, tracked actions and territory syntheses."
  - question: "Does Noota record in-person meetings?"
    answer: "Yes, Noota added in-person recording. Reedly is built around the field (hands-free, background, offline) and turns it into a sales report, not just meeting notes."
  - question: "Can I switch from Noota to Reedly easily?"
    answer: "Yes: just start recording your meetings. The client memory builds up from the very first visits, with no setup."
  - question: "Is my data kept in Europe?"
    answer: "Yes, your data is hosted in Europe, and audio is deleted after the report is generated."
related:
  - href: "/en/features/ai-report"
    label: "AI Report"
  - href: "/en/features/client-portfolio"
    label: "Client Portfolio"
  - href: "/en/features/meeting-preparation"
    label: "Meeting Preparation"
```

- [ ] **Step 5: Create `src/components/alternative/AltHero.astro`**

```astro
---
interface Props {
  eyebrow: string;
  title: string;
  lead: string;
  cta_label: string;
  cta_url: string;
}
const { eyebrow, title, lead, cta_label, cta_url } = Astro.props;
---

<section class="comp-hero">
  <div class="inner">
    <div class="reveal">
      <div class="section__eyebrow">{eyebrow}</div>
      <h1 set:html={title} />
      <p class="comp-hero__lead">{lead}</p>
      <div class="hero__actions">
        <a
          class="btn btn--primary btn--lg"
          href={cta_url}
          data-track-id="alt_hero_cta"
          data-track-type="trial"
          data-track-section="alt_hero"
        >{cta_label}</a>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 6: Create the FR route** `src/pages/fr/alternatives/[...slug].astro`

```astro
---
import Layout from '@/layouts/Layout.astro';
import Nav from '@/components/Nav.astro';
import AltHero from '@/components/alternative/AltHero.astro';
import FinalCta from '@/components/FinalCta.astro';
import Footer from '@/components/Footer.astro';
import { getAllAlternativeSlugs, loadAlternativeContent, findMirrorSlug } from '@/lib/load-alternatives';

export function getStaticPaths() {
  return getAllAlternativeSlugs('fr').map((slug) => ({ params: { slug } }));
}

const { slug } = Astro.params;
const data = loadAlternativeContent('fr', slug!);
const mirrorSlug = findMirrorSlug('fr', slug!);
const hreflangData = {
  fr: `/fr/alternatives/${slug}`,
  en: `/en/alternatives/${mirrorSlug}`,
};

const breadcrumbLD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://www.reedly.ai/fr" },
    { "@type": "ListItem", "position": 2, "name": "Alternatives", "item": "https://www.reedly.ai/fr" },
    { "@type": "ListItem", "position": 3, "name": data.hero.eyebrow },
  ],
};

const faqLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": data.faq.map((item) => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": { "@type": "Answer", "text": item.answer },
  })),
};
---

<Layout
  title={data.seo.title}
  description={data.seo.description}
  lang="fr"
  hreflang={hreflangData}
>
  <script slot="head" type="application/ld+json" set:html={JSON.stringify(breadcrumbLD)} />
  <script slot="head" type="application/ld+json" set:html={JSON.stringify(faqLD)} />

  <div id="cursor-glow"></div>

  <Nav />

  <main class="z1">
    <AltHero
      eyebrow={data.hero.eyebrow}
      title={data.hero.title}
      lead={data.hero.lead}
      cta_label={data.hero.cta_label}
      cta_url={data.hero.cta_url}
    />
    <FinalCta />
  </main>

  <Footer />

  <script src="/main.js" is:inline></script>
</Layout>
```

- [ ] **Step 7: Create the EN route** `src/pages/en/alternatives/[...slug].astro`

Identical to the FR route except: `getAllAlternativeSlugs('en')`, `loadAlternativeContent('en', slug!)`, `findMirrorSlug('en', slug!)`, `lang="en"`, `hreflangData = { fr: '/fr/alternatives/' + mirrorSlug, en: '/en/alternatives/' + slug }`, and breadcrumb names in English (`"Home"`, `"Alternatives"`, `data.hero.eyebrow`) with `item` URLs under `https://www.reedly.ai/en`.

```astro
---
import Layout from '@/layouts/Layout.astro';
import Nav from '@/components/Nav.astro';
import AltHero from '@/components/alternative/AltHero.astro';
import FinalCta from '@/components/FinalCta.astro';
import Footer from '@/components/Footer.astro';
import { getAllAlternativeSlugs, loadAlternativeContent, findMirrorSlug } from '@/lib/load-alternatives';

export function getStaticPaths() {
  return getAllAlternativeSlugs('en').map((slug) => ({ params: { slug } }));
}

const { slug } = Astro.params;
const data = loadAlternativeContent('en', slug!);
const mirrorSlug = findMirrorSlug('en', slug!);
const hreflangData = {
  fr: `/fr/alternatives/${mirrorSlug}`,
  en: `/en/alternatives/${slug}`,
};

const breadcrumbLD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.reedly.ai/en" },
    { "@type": "ListItem", "position": 2, "name": "Alternatives", "item": "https://www.reedly.ai/en" },
    { "@type": "ListItem", "position": 3, "name": data.hero.eyebrow },
  ],
};

const faqLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": data.faq.map((item) => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": { "@type": "Answer", "text": item.answer },
  })),
};
---

<Layout
  title={data.seo.title}
  description={data.seo.description}
  lang="en"
  hreflang={hreflangData}
>
  <script slot="head" type="application/ld+json" set:html={JSON.stringify(breadcrumbLD)} />
  <script slot="head" type="application/ld+json" set:html={JSON.stringify(faqLD)} />

  <div id="cursor-glow"></div>

  <Nav />

  <main class="z1">
    <AltHero
      eyebrow={data.hero.eyebrow}
      title={data.hero.title}
      lead={data.hero.lead}
      cta_label={data.hero.cta_label}
      cta_url={data.hero.cta_url}
    />
    <FinalCta />
  </main>

  <Footer />

  <script src="/main.js" is:inline></script>
</Layout>
```

- [ ] **Step 8: Build and verify both pages render the hero**

```bash
cd /Users/lel/projects/perso/reedly-landing-worktrees/alternative-pages && pnpm build
```
Expected: build succeeds. Then confirm both pages exist and contain the H1:
```bash
find dist -path '*alternatives*noota*' -name '*.html'
grep -l "pensée pour la vente terrain" dist/fr/alternatives/noota*.html dist/fr/alternatives/noota/index.html 2>/dev/null
grep -l "built for field sales" dist/en/alternatives/noota*.html dist/en/alternatives/noota/index.html 2>/dev/null
```
Expected: two HTML files found, each grep matches.

- [ ] **Step 9: Commit**

```bash
git add src/data/alternatives.yaml src/lib/load-alternatives.ts src/content/alternatives src/components/alternative/AltHero.astro src/pages/fr/alternatives src/pages/en/alternatives
git commit -m "feat(landing): alternatives template + Noota page hero (data layer + routes)"
```

---

## Task 2: Verdict section

**Files:**
- Create: `src/components/alternative/AltVerdict.astro`
- Modify: `src/pages/fr/alternatives/[...slug].astro`, `src/pages/en/alternatives/[...slug].astro`

**Interfaces:**
- Consumes: `data.verdict = { title: string; text: string }` (defined in Task 1's `AlternativeContent`).
- Produces: `AltVerdict` component consuming `{ title, text }`.

- [ ] **Step 1: Create `src/components/alternative/AltVerdict.astro`**

```astro
---
interface Props {
  title: string;
  text: string;
}
const { title, text } = Astro.props;
---

<section class="section">
  <div class="inner">
    <div class="alt-verdict reveal">
      <h2 set:html={title} />
      <p>{text}</p>
    </div>
  </div>
</section>

<style>
  .alt-verdict {
    max-width: 760px;
    margin: 0 auto;
    text-align: center;
  }
  .alt-verdict p {
    color: var(--muted);
    font-size: 1.1rem;
    line-height: 1.7;
    margin-top: 14px;
  }
</style>
```

- [ ] **Step 2: Wire into the FR route** — add the import after the `AltHero` import line, and place `<AltVerdict>` between `<AltHero .../>` and `<FinalCta />`:

Import line (add under `import AltHero ...`):
```astro
import AltVerdict from '@/components/alternative/AltVerdict.astro';
```
Placement (after the `<AltHero ... />` block):
```astro
    <AltVerdict title={data.verdict.title} text={data.verdict.text} />
```

- [ ] **Step 3: Wire into the EN route** — identical import + placement as Step 2.

- [ ] **Step 4: Build and verify**

```bash
pnpm build
grep -l "deux métiers" dist/fr/alternatives/noota*.html dist/fr/alternatives/noota/index.html 2>/dev/null
grep -l "two jobs" dist/en/alternatives/noota*.html dist/en/alternatives/noota/index.html 2>/dev/null
```
Expected: build succeeds, both greps match.

- [ ] **Step 5: Commit**

```bash
git add src/components/alternative/AltVerdict.astro src/pages/fr/alternatives src/pages/en/alternatives
git commit -m "feat(landing): Noota page — honest verdict section"
```

---

## Task 3: Comparison table (new centerpiece)

**Files:**
- Create: `src/components/alternative/AltComparison.astro`
- Modify: both route files

**Interfaces:**
- Consumes: `data.comparison = { eyebrow, title, lead, columns: { reedly, competitor }, rows: { need, reedly, competitor }[] }`.
- Produces: `AltComparison` consuming those props. Cells `reedly`/`competitor` contain HTML → rendered with `set:html`.

- [ ] **Step 1: Create `src/components/alternative/AltComparison.astro`**

```astro
---
interface Row {
  need: string;
  reedly: string;
  competitor: string;
}
interface Props {
  eyebrow: string;
  title: string;
  lead: string;
  columns: { reedly: string; competitor: string };
  rows: Row[];
}
const { eyebrow, title, lead, columns, rows } = Astro.props;
---

<section class="section section--alt">
  <div class="inner">
    <div class="reveal">
      <div class="section__eyebrow">{eyebrow}</div>
      <h2 set:html={title} />
      <p class="alt-cmp__lead">{lead}</p>
    </div>
    <div class="alt-cmp__wrap reveal">
      <table class="alt-cmp__table">
        <thead>
          <tr>
            <th class="alt-cmp__need"><span class="sr-only">Besoin</span></th>
            <th class="alt-cmp__reedly">{columns.reedly}</th>
            <th class="alt-cmp__comp">{columns.competitor}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr>
              <td class="alt-cmp__need">{row.need}</td>
              <td class="alt-cmp__reedly" set:html={row.reedly} />
              <td class="alt-cmp__comp" set:html={row.competitor} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</section>

<style>
  .alt-cmp__lead {
    color: var(--muted);
    max-width: 640px;
    margin-top: 10px;
  }
  .alt-cmp__wrap {
    overflow-x: auto;
    margin-top: 32px;
    border: 1px solid var(--border);
    border-radius: 14px;
  }
  .alt-cmp__table {
    width: 100%;
    border-collapse: collapse;
    min-width: 760px;
  }
  .alt-cmp__table th,
  .alt-cmp__table td {
    padding: 18px 20px;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid var(--border);
    font-size: 0.95rem;
    line-height: 1.55;
  }
  .alt-cmp__table tbody tr:last-child td {
    border-bottom: none;
  }
  .alt-cmp__need {
    width: 26%;
    font-weight: 600;
    color: var(--text);
  }
  .alt-cmp__reedly {
    color: var(--text);
    background: color-mix(in srgb, var(--green) 9%, transparent);
  }
  .alt-cmp__comp {
    width: 30%;
    color: var(--muted);
  }
  thead .alt-cmp__reedly {
    color: var(--green);
  }
  thead .alt-cmp__reedly,
  thead .alt-cmp__comp {
    font-family: var(--mono);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 0.8rem;
    font-weight: 700;
  }
  .alt-cmp__reedly :global(strong) {
    color: var(--green);
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
```

- [ ] **Step 2: Wire into the FR route** — import after `AltVerdict`:
```astro
import AltComparison from '@/components/alternative/AltComparison.astro';
```
Placement (after `<AltVerdict ... />`):
```astro
    <AltComparison
      eyebrow={data.comparison.eyebrow}
      title={data.comparison.title}
      lead={data.comparison.lead}
      columns={data.comparison.columns}
      rows={data.comparison.rows}
    />
```

- [ ] **Step 3: Wire into the EN route** — identical import + placement.

- [ ] **Step 4: Build and verify**

```bash
pnpm build
grep -l "du point de vue du terrain" dist/fr/alternatives/noota*.html dist/fr/alternatives/noota/index.html 2>/dev/null
grep -o "alt-cmp__reedly" dist/fr/alternatives/noota*.html dist/fr/alternatives/noota/index.html 2>/dev/null | head -1
```
Expected: build succeeds; the title and the `alt-cmp__reedly` class appear in the built HTML.

- [ ] **Step 5: Commit**

```bash
git add src/components/alternative/AltComparison.astro src/pages/fr/alternatives src/pages/en/alternatives
git commit -m "feat(landing): Noota page — outcome-driven comparison table"
```

---

## Task 4: Value blocks section

**Files:**
- Create: `src/components/alternative/AltValueBlocks.astro`
- Modify: both route files

**Interfaces:**
- Consumes: `data.value_blocks = { eyebrow, title, blocks: { title, tagline?, text, icon, items?: string[] }[] }`.
- Produces: `AltValueBlocks` consuming those props; renders `FeatureIcon`, optional tagline, optional bullet list.

- [ ] **Step 1: Create `src/components/alternative/AltValueBlocks.astro`**

```astro
---
import FeatureIcon from '@/components/feature/FeatureIcon.astro';

interface Block {
  title: string;
  tagline?: string;
  text: string;
  icon: string;
  items?: string[];
}
interface Props {
  eyebrow: string;
  title: string;
  blocks: Block[];
}
const { eyebrow, title, blocks } = Astro.props;
---

<section class="section">
  <div class="inner">
    <div class="reveal">
      <div class="section__eyebrow">{eyebrow}</div>
      <h2 set:html={title} />
    </div>
    <div class="features-grid">
      {blocks.map((block, i) => (
        <article class={`feature-card reveal reveal-delay-${Math.min(i + 1, 3)}`}>
          <div class="feature-card__icon">
            <FeatureIcon name={block.icon} />
          </div>
          <h3>{block.title}</h3>
          {block.tagline && <p class="alt-block__tagline">{block.tagline}</p>}
          <p>{block.text}</p>
          {block.items && (
            <ul class="alt-block__items">
              {block.items.map((item) => <li>{item}</li>)}
            </ul>
          )}
        </article>
      ))}
    </div>
  </div>
</section>

<style>
  .alt-block__tagline {
    color: var(--green);
    font-style: italic;
    font-weight: 600;
    margin-bottom: 6px;
  }
  .alt-block__items {
    margin: 12px 0 0;
    padding-left: 18px;
    color: var(--muted);
    font-size: 0.9rem;
    line-height: 1.6;
  }
  .alt-block__items li {
    margin-bottom: 2px;
  }
</style>
```

- [ ] **Step 2: Wire into the FR route** — import after `AltComparison`:
```astro
import AltValueBlocks from '@/components/alternative/AltValueBlocks.astro';
```
Placement (after `<AltComparison ... />`):
```astro
    <AltValueBlocks
      eyebrow={data.value_blocks.eyebrow}
      title={data.value_blocks.title}
      blocks={data.value_blocks.blocks}
    />
```

- [ ] **Step 3: Wire into the EN route** — identical import + placement.

- [ ] **Step 4: Build and verify**

```bash
pnpm build
grep -l "Ce qu'un notetaker ne fait pas" dist/fr/alternatives/noota*.html dist/fr/alternatives/noota/index.html 2>/dev/null
grep -o "alt-block__items" dist/en/alternatives/noota*.html dist/en/alternatives/noota/index.html 2>/dev/null | head -1
```
Expected: build succeeds; the FR title and the bullet-list class both appear.

- [ ] **Step 5: Commit**

```bash
git add src/components/alternative/AltValueBlocks.astro src/pages/fr/alternatives src/pages/en/alternatives
git commit -m "feat(landing): Noota page — value blocks (report sections, actions, memory)"
```

---

## Task 5: Privacy reassurance + "When Noota is the right choice"

**Files:**
- Create: `src/components/alternative/AltPrivacy.astro`, `src/components/alternative/AltFair.astro`
- Modify: both route files

**Interfaces:**
- Consumes: `data.privacy = { text }`; `data.fair = { eyebrow, title, lead, cards: { title, text, icon }[] }`.
- Produces: `AltPrivacy` consuming `{ text }`; `AltFair` consuming `{ eyebrow, title, lead, cards }`.

- [ ] **Step 1: Create `src/components/alternative/AltPrivacy.astro`**

```astro
---
interface Props {
  text: string;
}
const { text } = Astro.props;
---

<section class="section">
  <div class="inner">
    <div class="alt-privacy reveal">
      <p>{text}</p>
    </div>
  </div>
</section>

<style>
  .alt-privacy {
    max-width: 720px;
    margin: 0 auto;
    text-align: center;
    padding: 28px 32px;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: var(--surface);
  }
  .alt-privacy p {
    color: var(--muted);
    font-size: 0.98rem;
    line-height: 1.7;
    margin: 0;
  }
</style>
```

- [ ] **Step 2: Create `src/components/alternative/AltFair.astro`**

```astro
---
import FeatureIcon from '@/components/feature/FeatureIcon.astro';

interface Props {
  eyebrow: string;
  title: string;
  lead: string;
  cards: { title: string; text: string; icon: string }[];
}
const { eyebrow, title, lead, cards } = Astro.props;
---

<section class="section section--alt">
  <div class="inner">
    <div class="reveal">
      <div class="section__eyebrow">{eyebrow}</div>
      <h2 set:html={title} />
      <p class="alt-fair__lead">{lead}</p>
    </div>
    <div class="features-grid">
      {cards.map((card, i) => (
        <article class={`feature-card reveal reveal-delay-${Math.min(i + 1, 3)}`}>
          <div class="feature-card__icon">
            <FeatureIcon name={card.icon} />
          </div>
          <h3>{card.title}</h3>
          <p>{card.text}</p>
        </article>
      ))}
    </div>
  </div>
</section>

<style>
  .alt-fair__lead {
    color: var(--muted);
    max-width: 640px;
    margin-top: 10px;
  }
</style>
```

- [ ] **Step 3: Wire into the FR route** — imports after `AltValueBlocks`:
```astro
import AltPrivacy from '@/components/alternative/AltPrivacy.astro';
import AltFair from '@/components/alternative/AltFair.astro';
```
Placement (after `<AltValueBlocks ... />`):
```astro
    <AltPrivacy text={data.privacy.text} />
    <AltFair
      eyebrow={data.fair.eyebrow}
      title={data.fair.title}
      lead={data.fair.lead}
      cards={data.fair.cards}
    />
```

- [ ] **Step 4: Wire into the EN route** — identical imports + placement.

- [ ] **Step 5: Build and verify**

```bash
pnpm build
grep -l "Quand Noota est le bon choix" dist/fr/alternatives/noota*.html dist/fr/alternatives/noota/index.html 2>/dev/null
grep -l "never kept" dist/en/alternatives/noota*.html dist/en/alternatives/noota/index.html 2>/dev/null
```
Expected: build succeeds; both greps match.

- [ ] **Step 6: Commit**

```bash
git add src/components/alternative/AltPrivacy.astro src/components/alternative/AltFair.astro src/pages/fr/alternatives src/pages/en/alternatives
git commit -m "feat(landing): Noota page — privacy promise + fair 'when Noota fits' section"
```

---

## Task 6: FAQ (reused) + Related links

**Files:**
- Create: `src/components/alternative/AltRelated.astro`
- Modify: both route files

**Interfaces:**
- Consumes: `data.faq` (via reused `FeatureFaq`), `data.related = { href, label }[]`.
- Produces: `AltRelated` consuming `{ related: { href, label }[], lang }`.

- [ ] **Step 1: Create `src/components/alternative/AltRelated.astro`**

```astro
---
interface Props {
  related: { href: string; label: string }[];
  lang: 'fr' | 'en';
}
const { related, lang } = Astro.props;
const seeAlso = lang === 'fr' ? 'Voir aussi :' : 'See also:';
---

<div class="related-links">
  <span class="related-links__label">{seeAlso}</span>
  {related.map((r, i) => (
    <>
      {i > 0 && <span class="related-links__sep">·</span>}
      <a href={r.href} class="related-links__link">{r.label}</a>
    </>
  ))}
</div>

<style>
  .related-links {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 6px;
    padding: 24px 32px;
    font-size: 0.85rem;
  }
  .related-links__label {
    color: var(--muted);
    font-family: var(--mono);
    font-size: 0.75rem;
  }
  .related-links__sep {
    color: var(--muted);
  }
  .related-links__link {
    color: var(--green);
    text-decoration: none;
    font-family: var(--sans);
    font-weight: 600;
  }
  .related-links__link:hover {
    text-decoration: underline;
  }
</style>
```

- [ ] **Step 2: Wire into the FR route** — imports after `AltFair`:
```astro
import FeatureFaq from '@/components/feature/FeatureFaq.astro';
import AltRelated from '@/components/alternative/AltRelated.astro';
```
Placement (after `<AltFair ... />`, before `<FinalCta />`):
```astro
    <FeatureFaq faq={data.faq} lang="fr" />
    <AltRelated related={data.related} lang="fr" />
```

- [ ] **Step 3: Wire into the EN route** — same imports; placement uses `lang="en"` on both.

- [ ] **Step 4: Build and verify**

```bash
pnpm build
grep -o "faq-item" dist/fr/alternatives/noota*.html dist/fr/alternatives/noota/index.html 2>/dev/null | head -1
grep -o "related-links__link" dist/en/alternatives/noota*.html dist/en/alternatives/noota/index.html 2>/dev/null | head -1
grep -o "FAQPage" dist/fr/alternatives/noota*.html dist/fr/alternatives/noota/index.html 2>/dev/null | head -1
```
Expected: build succeeds; FAQ items, related links, and the `FAQPage` JSON-LD all present.

- [ ] **Step 5: Commit**

```bash
git add src/components/alternative/AltRelated.astro src/pages/fr/alternatives src/pages/en/alternatives
git commit -m "feat(landing): Noota page — FAQ + related feature links"
```

---

## Task 7: Footer link + final full verification

**Files:**
- Modify: `src/components/Footer.astro`

**Interfaces:**
- Consumes nothing new. Adds a discreet footer link (both langs) to `/…/alternatives/noota` that the existing `main.js` language toggle updates via `data-link-fr`/`data-link-en`.

- [ ] **Step 1: Add the link to `src/components/Footer.astro`** — inside the "Produit / Product" column (the `<div class="footer__col">` containing the pricing + blog links), add as the last `<a>` before the column closes:

```astro
      <a
        href={lang === 'fr' ? '/fr/alternatives/noota' : '/en/alternatives/noota'}
        data-link-fr="/fr/alternatives/noota"
        data-link-en="/en/alternatives/noota"
      >{lang === 'fr' ? 'Alternative à Noota' : 'Noota alternative'}</a>
```

- [ ] **Step 2: Build**

```bash
pnpm build
```
Expected: build succeeds.

- [ ] **Step 3: Visual + SEO verification in a real browser** (per the "verify real render before merge" rule)

```bash
pnpm preview &
```
Then drive the preview (Playwright MCP or manual) and confirm, for BOTH `/fr/alternatives/noota` and `/en/alternatives/noota`:
- Hero H1 renders the `<em>` emphasis; CTA button visible.
- Comparison table: Reedly column tinted green, `<strong>` inside Reedly cells green, table scrolls horizontally on a narrow viewport (resize to ~375px).
- Value blocks: the 11 report sections render as a bullet list in block 1; taglines are green italic.
- Privacy card, fair section (3 cards), FAQ accordion opens on click, related links point to `/…/features/…`.
- Footer "Alternative à Noota" / "Noota alternative" link present and navigates correctly.
- Language toggle in the nav switches `/fr/alternatives/noota ↔ /en/alternatives/noota`.
- View source: `<title>` and meta description match the YAML; `<link rel="canonical">` and three `hreflang` tags present; two `application/ld+json` blocks (BreadcrumbList + FAQPage) parse as valid JSON.

- [ ] **Step 4: Validate the JSON-LD blocks parse**

```bash
node -e "const fs=require('fs');const g=require('child_process').execSync('find dist -path \"*alternatives/noota*\" -name \"*.html\"').toString().trim().split('\n');for(const f of g){const h=fs.readFileSync(f,'utf8');const m=[...h.matchAll(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g)];m.forEach((x,i)=>{JSON.parse(x[1]);});console.log(f,'->',m.length,'JSON-LD blocks OK');}"
```
Expected: each Noota HTML file reports its JSON-LD blocks parse without throwing (Layout's global graph + BreadcrumbList + FAQPage).

- [ ] **Step 5: Commit + push + open PR**

```bash
git add src/components/Footer.astro
git commit -m "feat(landing): footer link to the Noota alternative page"
git push -u origin feat/landing-alternative-pages
gh pr create --title "feat(landing): pages « alternative à X » (première : Noota)" --body "$(cat <<'EOF'
## Summary
Reusable, bilingual SEO template for competitor-comparison pages ("Alternative à X"), mirroring the features pattern (registry + per-lang YAML + [...slug] routes + section components). First page: **Noota**, at `/fr/alternatives/noota` + `/en/alternatives/noota`.

Value-led (no price comparison), Reedly-forward but honest — every claim verified against the product and the 2026-07-07 positioning doc. Spec: `docs/superpowers/specs/2026-07-07-alternatives-comparison-pages-design.md`.

## Test plan
- `pnpm build` green; both pages render FR + EN.
- Comparison table, value blocks (11 report sections), privacy promise, fair section, FAQ, related links verified in browser.
- JSON-LD (BreadcrumbList + FAQPage) + hreflang + canonical validated.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review

**1. Spec coverage** — every spec section maps to a task:
- §3 architecture (registry, loader, routes, URL, no main.js change) → Task 1.
- §4 content model (`AlternativeContent`) → Task 1 loader interface.
- §5.1 hero → Task 1; §5.2 verdict → Task 2; §5.3 comparison table → Task 3; §5.4 value blocks (11 sections, actions, memory, field, manager) → Task 4; §5.5 privacy → Task 5; §5.6 fair → Task 5; §5.7 FAQ + §5.8 FinalCta → Task 6 (+ Task 1 for FinalCta); §5.9 related → Task 6.
- §6 SEO (title/description/keywords/canonical/hreflang/JSON-LD/sitemap-auto/footer link, no vercel.json change) → Task 1 (meta + JSON-LD + hreflang) & Task 7 (footer). Sitemap is automatic (`@astrojs/sitemap`), no task needed.
- §7 product consistency (7-day trial, verified claims) → Global Constraints + content in Task 1.
- §8 out of scope respected (no Gong/Modjo, no /comparatif hub, no nav link, no price).

**2. Placeholder scan** — no TBD/TODO; all component and route code is complete; the EN route is shown in full (not "similar to FR"); content YAML is full for both languages.

**3. Type consistency** — `AlternativeContent` field names (`hero.cta_label`, `hero.cta_url`, `comparison.columns.reedly`, `value_blocks.blocks[].tagline?`, `value_blocks.blocks[].items?`, `fair.cards`, `related[].href`) match every component's `Props` and every route's usage. Loader function names (`getAllAlternativeSlugs`, `loadAlternativeContent`, `findMirrorSlug`) are used identically in both routes.

**Note on verification method:** this repo has no unit-test harness (no test script in `package.json`, features are untested). Per Global Constraints, each task verifies via `pnpm build` + a targeted `grep` of the built `dist/` HTML, with a full browser pass in Task 7 — the correct, established verification loop for this static Astro site rather than introducing a test framework (YAGNI).
