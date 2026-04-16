# Automated Feature Landing Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate 22 SEO-optimized landing pages (11 features × FR/EN) under `/solutions/[slug]` using YAML structured data, a shared Astro template, and a Claude API content generation script.

**Architecture:** Feature content lives in per-language YAML files (`src/content/features/[lang]/[slug].yaml`). A central registry (`src/data/features.yaml`) maps feature IDs to FR/EN slug pairs. Dynamic Astro routes (`[...slug].astro`) read YAML and feed data to reusable section components (Hero, Problem, Solution, Benefits, UseCases, FAQ, Related). A Node script calls Claude API to generate YAML content for each feature. The existing `/solution` page becomes a hub linking to all feature pages.

**Tech Stack:** Astro 6 (static output), YAML data files, `@anthropic-ai/sdk` (already installed), existing CSS classes/animations, Vercel deployment.

**Spec:** `docs/superpowers/specs/2026-04-16-automated-feature-landing-pages-design.md`

---

### Task 1: Create the features registry

**Files:**
- Create: `src/data/features.yaml`

- [ ] **Step 1: Create the `src/data/` directory**

Run: `mkdir -p src/data`

- [ ] **Step 2: Write the features registry file**

```yaml
# src/data/features.yaml
# Central registry mapping feature IDs to FR/EN slug pairs.
# Each entry produces two pages: /fr/solutions/{slugFr} and /en/solutions/{slugEn}

features:
  - id: "voice-recording"
    slugs:
      fr: "enregistrement-vocal-rdv"
      en: "meeting-voice-recording"

  - id: "ai-transcription"
    slugs:
      fr: "transcription-ia"
      en: "ai-transcription"

  - id: "ai-report"
    slugs:
      fr: "rapport-ia"
      en: "ai-report"

  - id: "speaker-identification"
    slugs:
      fr: "identification-interlocuteurs"
      en: "speaker-identification"

  - id: "territory-syntheses"
    slugs:
      fr: "syntheses-territoriales"
      en: "territory-syntheses"

  - id: "manager-hub"
    slugs:
      fr: "hub-manager"
      en: "manager-hub"

  - id: "meeting-prep"
    slugs:
      fr: "preparation-rdv"
      en: "meeting-preparation"

  - id: "ai-assistant"
    slugs:
      fr: "assistant-ia-manager"
      en: "ai-manager-assistant"

  - id: "client-portfolio"
    slugs:
      fr: "portfolio-client"
      en: "client-portfolio"

  - id: "knowledge-base"
    slugs:
      fr: "base-de-connaissances"
      en: "knowledge-base"

  - id: "sales-directives"
    slugs:
      fr: "directives-commerciales"
      en: "sales-directives"
```

- [ ] **Step 3: Commit**

```bash
git add src/data/features.yaml
git commit -m "feat(seo): add features registry for landing pages"
```

---

### Task 2: Create the icon map component

**Files:**
- Create: `src/components/feature/FeatureIcon.astro`

The existing site uses inline SVG in each component. We'll centralize icons into a map so YAML content can reference them by name.

- [ ] **Step 1: Create the directory**

Run: `mkdir -p src/components/feature`

- [ ] **Step 2: Write the FeatureIcon component**

```astro
---
// src/components/feature/FeatureIcon.astro
// Renders an SVG icon from a predefined map. Used by feature landing page sections.
interface Props {
  name: string;
}
const { name } = Astro.props;

const icons: Record<string, string> = {
  microphone: '<path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />',
  document: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />',
  clock: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />',
  users: '<path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />',
  brain: '<path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />',
  globe: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />',
  building: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />',
  flask: '<path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />',
  chart: '<path stroke-linecap="round" stroke-linejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />',
  download: '<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />',
  shield: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />',
  search: '<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />',
  zap: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />',
  target: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 2a10 10 0 110 20 10 10 0 010-20zm0 4a6 6 0 100 12 6 6 0 000-12zm0 4a2 2 0 110 4 2 2 0 010-4z" />',
  layers: '<path stroke-linecap="round" stroke-linejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25L12 17.25 2.25 12l4.179-2.25m11.142 0l4.179 2.25L12 22.5 2.25 17.25l4.179-2.25" />',
  music: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />',
  alert: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />',
  shuffle: '<path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />',
  compass: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 2a10 10 0 110 20 10 10 0 010-20zm-2.5 7.5l7-2-2 7-7 2 2-7z" />',
  book: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />',
};

const svgPath = icons[name] || icons['document'];
---

<svg fill="none" viewBox="0 0 24 24" stroke-width="1.8">
  <Fragment set:html={svgPath} />
</svg>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/feature/FeatureIcon.astro
git commit -m "feat(seo): add icon map component for feature pages"
```

---

### Task 3: Create a YAML loader utility

**Files:**
- Create: `src/lib/load-features.ts`

Astro's Content Collections expect Markdown/MDX. Since we use plain YAML files, we need a simple loader that reads and parses them. This utility is used by the dynamic route pages.

- [ ] **Step 1: Create the `src/lib/` directory**

Run: `mkdir -p src/lib`

- [ ] **Step 2: Write the loader**

```typescript
// src/lib/load-features.ts
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'astro/virtual-modules/yaml'; // Astro re-exports js-yaml

// Re-export a tiny parse helper so we don't add a dependency.
// Astro ships js-yaml internally; if the import above fails at build,
// fall back to a manual import.
let parseYamlFn: (text: string) => unknown;
try {
  // Astro exposes yaml parsing via vite's built-in yaml plugin,
  // but for Node scripts we use a plain dynamic import.
  const jsYaml = await import('js-yaml');
  parseYamlFn = jsYaml.load as (text: string) => unknown;
} catch {
  // If js-yaml is unavailable, throw clear error
  throw new Error('js-yaml is required. Run: pnpm add -D js-yaml');
}

export interface FeatureRegistry {
  features: { id: string; slugs: { fr: string; en: string } }[];
}

export interface FeatureContent {
  seo: { title: string; description: string; keywords: string[] };
  hero: { eyebrow: string; title: string; lead: string; cta_label: string; cta_url: string };
  problem: {
    eyebrow: string; title: string; lead: string;
    cards: { title: string; text: string; icon: string }[];
  };
  solution: {
    eyebrow: string; title: string; lead: string;
    steps: { title: string; text: string }[];
  };
  benefits: {
    eyebrow: string; title: string;
    cards: { title: string; text: string; icon: string }[];
  };
  use_cases: {
    eyebrow: string; title: string;
    cards: { title: string; text: string; icon: string }[];
  };
  faq: { question: string; answer: string }[];
  related_features: { slug: string; label: string }[];
}

const DATA_DIR = path.resolve('src/data');
const CONTENT_DIR = path.resolve('src/content/features');

export function loadRegistry(): FeatureRegistry {
  const raw = fs.readFileSync(path.join(DATA_DIR, 'features.yaml'), 'utf-8');
  return parseYamlFn(raw) as FeatureRegistry;
}

export function loadFeatureContent(lang: 'fr' | 'en', slug: string): FeatureContent {
  const filePath = path.join(CONTENT_DIR, lang, `${slug}.yaml`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return parseYamlFn(raw) as FeatureContent;
}

export function getAllFeatureSlugs(lang: 'fr' | 'en'): string[] {
  const registry = loadRegistry();
  return registry.features.map((f) => f.slugs[lang]);
}

export function findMirrorSlug(lang: 'fr' | 'en', slug: string): string {
  const registry = loadRegistry();
  const otherLang = lang === 'fr' ? 'en' : 'fr';
  const feature = registry.features.find((f) => f.slugs[lang] === slug);
  if (!feature) throw new Error(`Feature not found for slug "${slug}" in lang "${lang}"`);
  return feature.slugs[otherLang];
}
```

Wait — Astro's static build runs these at build time via Vite which handles YAML natively. Let me simplify this. We should just install `js-yaml` as a dev dependency and use it directly.

- [ ] **Step 2 (revised): Install js-yaml**

Run: `pnpm add -D js-yaml @types/js-yaml`

- [ ] **Step 3: Write the loader**

```typescript
// src/lib/load-features.ts
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export interface FeatureRegistry {
  features: { id: string; slugs: { fr: string; en: string } }[];
}

export interface FeatureContent {
  seo: { title: string; description: string; keywords: string[] };
  hero: { eyebrow: string; title: string; lead: string; cta_label: string; cta_url: string };
  problem: {
    eyebrow: string; title: string; lead: string;
    cards: { title: string; text: string; icon: string }[];
  };
  solution: {
    eyebrow: string; title: string; lead: string;
    steps: { title: string; text: string }[];
  };
  benefits: {
    eyebrow: string; title: string;
    cards: { title: string; text: string; icon: string }[];
  };
  use_cases: {
    eyebrow: string; title: string;
    cards: { title: string; text: string; icon: string }[];
  };
  faq: { question: string; answer: string }[];
  related_features: { slug: string; label: string }[];
}

const DATA_DIR = path.resolve('src/data');
const CONTENT_DIR = path.resolve('src/content/features');

export function loadRegistry(): FeatureRegistry {
  const raw = fs.readFileSync(path.join(DATA_DIR, 'features.yaml'), 'utf-8');
  return yaml.load(raw) as FeatureRegistry;
}

export function loadFeatureContent(lang: 'fr' | 'en', slug: string): FeatureContent {
  const filePath = path.join(CONTENT_DIR, lang, `${slug}.yaml`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return yaml.load(raw) as FeatureContent;
}

export function getAllFeatureSlugs(lang: 'fr' | 'en'): string[] {
  const registry = loadRegistry();
  return registry.features.map((f) => f.slugs[lang]);
}

export function findMirrorSlug(lang: 'fr' | 'en', slug: string): string {
  const registry = loadRegistry();
  const otherLang = lang === 'fr' ? 'en' : 'fr';
  const feature = registry.features.find((f) => f.slugs[lang] === slug);
  if (!feature) throw new Error(`Feature not found for slug "${slug}" in lang "${lang}"`);
  return feature.slugs[otherLang];
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/load-features.ts
git commit -m "feat(seo): add YAML loader utility for feature content"
```

---

### Task 4: Create the feature section components

**Files:**
- Create: `src/components/feature/FeatureHero.astro`
- Create: `src/components/feature/FeatureProblem.astro`
- Create: `src/components/feature/FeatureSolution.astro`
- Create: `src/components/feature/FeatureBenefits.astro`
- Create: `src/components/feature/FeatureUseCases.astro`
- Create: `src/components/feature/FeatureFaq.astro`
- Create: `src/components/feature/FeatureRelated.astro`

Each component receives typed props from the YAML content and renders using the existing CSS classes.

- [ ] **Step 1: Write FeatureHero.astro**

```astro
---
// src/components/feature/FeatureHero.astro
interface Props {
  eyebrow: string;
  title: string;
  lead: string;
  cta_label: string;
  cta_url: string;
  breadcrumb: { home: string; solutions: string; solutionsHref: string; current: string };
}
const { eyebrow, title, lead, cta_label, cta_url, breadcrumb } = Astro.props;
---

<section class="comp-hero">
  <div class="inner">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href={breadcrumb.solutionsHref.replace('/solution', '')}>{breadcrumb.home}</a>
      <span>&rsaquo;</span>
      <a href={breadcrumb.solutionsHref}>{breadcrumb.solutions}</a>
      <span>&rsaquo;</span>
      <span>{breadcrumb.current}</span>
    </nav>
    <div class="reveal">
      <div class="section__eyebrow">{eyebrow}</div>
      <h1 set:html={title} />
      <p class="comp-hero__lead">{lead}</p>
      <div class="hero__actions">
        <a
          class="btn btn--primary btn--lg"
          href={cta_url}
          data-track-id="feature_hero_cta"
          data-track-type="trial"
          data-track-section="feature_hero"
        >{cta_label}</a>
      </div>
    </div>
  </div>
</section>

<style>
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--mono);
    font-size: 0.75rem;
    color: var(--muted);
    margin-bottom: 2rem;
  }
  .breadcrumb a {
    color: var(--muted);
    text-decoration: none;
  }
  .breadcrumb a:hover {
    color: var(--green);
  }
</style>
```

- [ ] **Step 2: Write FeatureProblem.astro**

```astro
---
// src/components/feature/FeatureProblem.astro
import FeatureIcon from './FeatureIcon.astro';

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
      <p class="section__lead">{lead}</p>
    </div>
    <div class="problem-grid">
      {cards.map((card, i) => (
        <article class={`problem-card reveal reveal-delay-${Math.min(i + 1, 3)}`}>
          <div class="problem-card__icon">
            <FeatureIcon name={card.icon} />
          </div>
          <h3>{card.title}</h3>
          <p>{card.text}</p>
        </article>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 3: Write FeatureSolution.astro**

```astro
---
// src/components/feature/FeatureSolution.astro
interface Props {
  eyebrow: string;
  title: string;
  lead: string;
  steps: { title: string; text: string }[];
}
const { eyebrow, title, lead, steps } = Astro.props;
---

<section class="section">
  <div class="inner">
    <div class="reveal">
      <div class="section__eyebrow">{eyebrow}</div>
      <h2 set:html={title} />
      <p class="section__lead">{lead}</p>
    </div>
    <div class="steps-layout">
      {steps.map((step, i) => (
        <article class={`step-card reveal reveal-delay-${Math.min(i + 1, 3)}`}>
          <div class="step-num">
            <div class="step-num__inner">{i + 1}</div>
          </div>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </article>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 4: Write FeatureBenefits.astro**

```astro
---
// src/components/feature/FeatureBenefits.astro
import FeatureIcon from './FeatureIcon.astro';

interface Props {
  eyebrow: string;
  title: string;
  cards: { title: string; text: string; icon: string }[];
}
const { eyebrow, title, cards } = Astro.props;
---

<section class="section section--alt">
  <div class="inner">
    <div class="reveal">
      <div class="section__eyebrow">{eyebrow}</div>
      <h2 set:html={title} />
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
```

- [ ] **Step 5: Write FeatureUseCases.astro**

```astro
---
// src/components/feature/FeatureUseCases.astro
import FeatureIcon from './FeatureIcon.astro';

interface Props {
  eyebrow: string;
  title: string;
  cards: { title: string; text: string; icon: string }[];
}
const { eyebrow, title, cards } = Astro.props;
---

<section class="section">
  <div class="inner">
    <div class="reveal">
      <div class="section__eyebrow">{eyebrow}</div>
      <h2 set:html={title} />
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
```

- [ ] **Step 6: Write FeatureFaq.astro**

```astro
---
// src/components/feature/FeatureFaq.astro
interface Props {
  faq: { question: string; answer: string }[];
  lang: 'fr' | 'en';
}
const { faq, lang } = Astro.props;
const faqTitle = lang === 'fr' ? 'Questions fréquentes' : 'Frequently asked questions';
---

<section class="section section--alt">
  <div class="inner">
    <div class="reveal">
      <div class="section__eyebrow">FAQ</div>
      <h2>{faqTitle}</h2>
    </div>
    <div class="faq-list">
      {faq.map((item, i) => (
        <article class={`faq-item reveal reveal-delay-${Math.min(i + 1, 3)}`} aria-expanded="false">
          <button class="faq-btn" type="button">
            <span>{item.question}</span>
            <div class="faq-btn__icon">+</div>
          </button>
          <div class="faq-panel">
            <p>{item.answer}</p>
          </div>
        </article>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 7: Write FeatureRelated.astro**

```astro
---
// src/components/feature/FeatureRelated.astro
interface Props {
  features: { slug: string; label: string }[];
  lang: 'fr' | 'en';
}
const { features, lang } = Astro.props;
const sectionTitle = lang === 'fr' ? 'Fonctionnalités liées' : 'Related features';
const prefix = `/${lang}/solutions`;
---

<section class="section">
  <div class="inner">
    <div class="reveal">
      <div class="section__eyebrow">{lang === 'fr' ? 'Découvrir aussi' : 'Discover also'}</div>
      <h2>{sectionTitle}</h2>
    </div>
    <div class="features-grid">
      {features.map((f, i) => (
        <a href={`${prefix}/${f.slug}`} class={`feature-card feature-card--link reveal reveal-delay-${Math.min(i + 1, 3)}`}>
          <h3>{f.label}</h3>
          <span class="feature-card__arrow">&rarr;</span>
        </a>
      ))}
    </div>
  </div>
</section>

<style>
  .feature-card--link {
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
  }
  .feature-card__arrow {
    font-size: 1.5rem;
    color: var(--green);
    transition: transform 0.2s;
  }
  .feature-card--link:hover .feature-card__arrow {
    transform: translateX(4px);
  }
</style>
```

- [ ] **Step 8: Commit**

```bash
git add src/components/feature/
git commit -m "feat(seo): add feature landing page section components"
```

---

### Task 5: Create the dynamic route pages

**Files:**
- Create: `src/pages/fr/solutions/[...slug].astro`
- Create: `src/pages/en/solutions/[...slug].astro`

- [ ] **Step 1: Create directories**

Run: `mkdir -p src/pages/fr/solutions src/pages/en/solutions`

- [ ] **Step 2: Write the FR dynamic route**

```astro
---
// src/pages/fr/solutions/[...slug].astro
import Layout from '@/layouts/Layout.astro';
import Nav from '@/components/Nav.astro';
import FeatureHero from '@/components/feature/FeatureHero.astro';
import FeatureProblem from '@/components/feature/FeatureProblem.astro';
import FeatureSolution from '@/components/feature/FeatureSolution.astro';
import FeatureBenefits from '@/components/feature/FeatureBenefits.astro';
import FeatureUseCases from '@/components/feature/FeatureUseCases.astro';
import FeatureFaq from '@/components/feature/FeatureFaq.astro';
import FeatureRelated from '@/components/feature/FeatureRelated.astro';
import FinalCta from '@/components/FinalCta.astro';
import Footer from '@/components/Footer.astro';
import { getAllFeatureSlugs, loadFeatureContent, findMirrorSlug } from '@/lib/load-features';

export function getStaticPaths() {
  const slugs = getAllFeatureSlugs('fr');
  return slugs.map((slug) => ({ params: { slug } }));
}

const { slug } = Astro.params;
const data = loadFeatureContent('fr', slug!);
const mirrorSlug = findMirrorSlug('fr', slug!);
const hreflangData = {
  fr: `/fr/solutions/${slug}`,
  en: `/en/solutions/${mirrorSlug}`,
};

const breadcrumbLD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://www.reedly.ai/fr" },
    { "@type": "ListItem", "position": 2, "name": "Solution", "item": "https://www.reedly.ai/fr/solution" },
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
    <FeatureHero
      eyebrow={data.hero.eyebrow}
      title={data.hero.title}
      lead={data.hero.lead}
      cta_label={data.hero.cta_label}
      cta_url={data.hero.cta_url}
      breadcrumb={{ home: "Accueil", solutions: "Solution", solutionsHref: "/fr/solution", current: data.hero.eyebrow }}
    />
    <FeatureProblem
      eyebrow={data.problem.eyebrow}
      title={data.problem.title}
      lead={data.problem.lead}
      cards={data.problem.cards}
    />
    <FeatureSolution
      eyebrow={data.solution.eyebrow}
      title={data.solution.title}
      lead={data.solution.lead}
      steps={data.solution.steps}
    />
    <FeatureBenefits
      eyebrow={data.benefits.eyebrow}
      title={data.benefits.title}
      cards={data.benefits.cards}
    />
    <FeatureUseCases
      eyebrow={data.use_cases.eyebrow}
      title={data.use_cases.title}
      cards={data.use_cases.cards}
    />
    <FeatureFaq faq={data.faq} lang="fr" />
    <FeatureRelated features={data.related_features} lang="fr" />
    <FinalCta />
  </main>

  <Footer />

  <script src="/main.js" is:inline></script>
</Layout>
```

- [ ] **Step 3: Write the EN dynamic route**

```astro
---
// src/pages/en/solutions/[...slug].astro
import Layout from '@/layouts/Layout.astro';
import Nav from '@/components/Nav.astro';
import FeatureHero from '@/components/feature/FeatureHero.astro';
import FeatureProblem from '@/components/feature/FeatureProblem.astro';
import FeatureSolution from '@/components/feature/FeatureSolution.astro';
import FeatureBenefits from '@/components/feature/FeatureBenefits.astro';
import FeatureUseCases from '@/components/feature/FeatureUseCases.astro';
import FeatureFaq from '@/components/feature/FeatureFaq.astro';
import FeatureRelated from '@/components/feature/FeatureRelated.astro';
import FinalCta from '@/components/FinalCta.astro';
import Footer from '@/components/Footer.astro';
import { getAllFeatureSlugs, loadFeatureContent, findMirrorSlug } from '@/lib/load-features';

export function getStaticPaths() {
  const slugs = getAllFeatureSlugs('en');
  return slugs.map((slug) => ({ params: { slug } }));
}

const { slug } = Astro.params;
const data = loadFeatureContent('en', slug!);
const mirrorSlug = findMirrorSlug('en', slug!);
const hreflangData = {
  fr: `/fr/solutions/${mirrorSlug}`,
  en: `/en/solutions/${slug}`,
};

const breadcrumbLD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.reedly.ai/en" },
    { "@type": "ListItem", "position": 2, "name": "Solution", "item": "https://www.reedly.ai/en/solution" },
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
    <FeatureHero
      eyebrow={data.hero.eyebrow}
      title={data.hero.title}
      lead={data.hero.lead}
      cta_label={data.hero.cta_label}
      cta_url={data.hero.cta_url}
      breadcrumb={{ home: "Home", solutions: "Solution", solutionsHref: "/en/solution", current: data.hero.eyebrow }}
    />
    <FeatureProblem
      eyebrow={data.problem.eyebrow}
      title={data.problem.title}
      lead={data.problem.lead}
      cards={data.problem.cards}
    />
    <FeatureSolution
      eyebrow={data.solution.eyebrow}
      title={data.solution.title}
      lead={data.solution.lead}
      steps={data.solution.steps}
    />
    <FeatureBenefits
      eyebrow={data.benefits.eyebrow}
      title={data.benefits.title}
      cards={data.benefits.cards}
    />
    <FeatureUseCases
      eyebrow={data.use_cases.eyebrow}
      title={data.use_cases.title}
      cards={data.use_cases.cards}
    />
    <FeatureFaq faq={data.faq} lang="en" />
    <FeatureRelated features={data.related_features} lang="en" />
    <FinalCta />
  </main>

  <Footer />

  <script src="/main.js" is:inline></script>
</Layout>
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/fr/solutions/ src/pages/en/solutions/
git commit -m "feat(seo): add dynamic route pages for feature landing pages"
```

---

### Task 6: Write the content generation script

**Files:**
- Create: `scripts/feature-config.mjs`
- Create: `scripts/generate-feature.mjs`

Follows the same pattern as the existing `generate-article.mjs` / `blog-config.mjs`.

- [ ] **Step 1: Write the feature config**

```javascript
// scripts/feature-config.mjs
export default {
  product: {
    name: 'Reedly',
    description:
      "Reedly est une application mobile iOS et Android d'enregistrement vocal destinée aux commerciaux terrain B2B. Elle enregistre les rendez-vous clients en arrière-plan, transcrit l'audio avec plus de 95% de précision, puis génère automatiquement un rapport structuré en 11 sections en moins de 2 minutes. Reedly propose également un Hub web pour les managers, permettant de centraliser les rapports de toute l'équipe et de générer des synthèses territoriales.",
    url: 'https://www.reedly.ai',
    audiences: ['commerciaux terrain B2B', 'directeurs commerciaux', 'sales managers'],
  },

  // Map feature IDs to their product context (used in Claude prompt)
  featureContext: {
    'voice-recording': {
      nameFr: 'Enregistrement vocal de RDV',
      nameEn: 'Meeting Voice Recording',
      descriptionFr: "Enregistrement audio en arrière-plan pendant les rendez-vous terrain. Un seul tap pour démarrer, batterie optimisée, fonctionne hors connexion. L'audio est supprimé après génération du rapport.",
      descriptionEn: 'Background audio recording during field meetings. One tap to start, battery optimized, works offline. Audio is deleted after report generation.',
      keywordsFr: ['enregistrement vocal réunion', 'application enregistrement rendez-vous client', 'enregistrement audio commercial terrain'],
      keywordsEn: ['meeting voice recording app', 'client meeting recording', 'field sales audio recording'],
      relatedIds: ['ai-transcription', 'ai-report', 'speaker-identification'],
    },
    'ai-transcription': {
      nameFr: 'Transcription IA',
      nameEn: 'AI Transcription',
      descriptionFr: "Transcription automatique de l'audio avec plus de 95% de précision. Fonctionne avec les accents, le vocabulaire métier sectoriel, et en environnement bruyant. Modèles Deepgram et Voxtral.",
      descriptionEn: 'Automatic audio transcription with 95%+ accuracy. Works with accents, sector-specific vocabulary, and noisy environments. Deepgram and Voxtral models.',
      keywordsFr: ['transcription automatique réunion', 'transcription IA rendez-vous commercial', 'transcription vocale professionnelle'],
      keywordsEn: ['automatic meeting transcription', 'AI business meeting transcription', 'professional voice transcription'],
      relatedIds: ['voice-recording', 'ai-report', 'speaker-identification'],
    },
    'ai-report': {
      nameFr: 'Rapport structuré IA',
      nameEn: 'AI Structured Report',
      descriptionFr: "Génération automatique d'un rapport structuré en 11 sections à partir de la transcription : résumé exécutif, profil client, besoins, objections, engagements, prochaines étapes, opportunités, risques, recommandations. Export PDF en 1 clic.",
      descriptionEn: 'Automatic generation of an 11-section structured report from the transcript: executive summary, client profile, needs, objections, commitments, next steps, opportunities, risks, recommendations. 1-click PDF export.',
      keywordsFr: ['rapport de visite client automatique', 'compte rendu réunion IA', 'rapport commercial automatisé'],
      keywordsEn: ['automatic client visit report', 'AI meeting report', 'automated sales report'],
      relatedIds: ['ai-transcription', 'voice-recording', 'territory-syntheses'],
    },
    'speaker-identification': {
      nameFr: 'Identification des interlocuteurs',
      nameEn: 'Speaker Identification',
      descriptionFr: "Diarisation : l'IA identifie qui parle dans la conversation et attribue les propos au bon interlocuteur. Distingue commercial et client pour une attribution précise dans le rapport.",
      descriptionEn: 'Diarization: the AI identifies who speaks and attributes statements to the right person. Distinguishes sales rep and client for precise report attribution.',
      keywordsFr: ['identification interlocuteurs réunion', 'diarisation conversation', 'qui parle dans une réunion IA'],
      keywordsEn: ['meeting speaker identification', 'conversation diarization', 'who spoke in a meeting AI'],
      relatedIds: ['ai-transcription', 'ai-report', 'voice-recording'],
    },
    'territory-syntheses': {
      nameFr: 'Synthèses territoriales',
      nameEn: 'Territory Syntheses',
      descriptionFr: "Agrégation automatique des rapports sur une période (semaine, mois, trimestre) en tendances, risques et opportunités priorisés. Vision stratégique du territoire en quelques secondes.",
      descriptionEn: 'Automatic aggregation of reports over a period (week, month, quarter) into prioritized trends, risks, and opportunities. Strategic territory view in seconds.',
      keywordsFr: ['synthèse activité commerciale terrain', 'analyse territoire commercial', 'agrégation rapports commerciaux'],
      keywordsEn: ['field sales activity synthesis', 'sales territory analysis', 'sales report aggregation'],
      relatedIds: ['ai-report', 'manager-hub', 'sales-directives'],
    },
    'manager-hub': {
      nameFr: 'Hub Manager',
      nameEn: 'Manager Hub',
      descriptionFr: "Interface web pour les directeurs commerciaux. Dashboard centralisé avec tous les rapports de l'équipe, synthèses stratégiques, statistiques membres, gestion d'équipe.",
      descriptionEn: "Web interface for sales directors. Centralized dashboard with all team reports, strategic syntheses, member stats, team management.",
      keywordsFr: ['tableau de bord manager commercial', 'hub directeur commercial', 'pilotage équipe vente terrain'],
      keywordsEn: ['sales manager dashboard', 'commercial director hub', 'field sales team management'],
      relatedIds: ['territory-syntheses', 'ai-assistant', 'sales-directives'],
    },
    'meeting-prep': {
      nameFr: 'Préparation de RDV',
      nameEn: 'Meeting Preparation',
      descriptionFr: "Préparation assistée par IA avant chaque rendez-vous client. L'IA compile l'historique des interactions, les engagements en cours, et les points de vigilance pour que le commercial arrive préparé.",
      descriptionEn: 'AI-assisted preparation before each client meeting. The AI compiles interaction history, ongoing commitments, and key points so the sales rep arrives prepared.',
      keywordsFr: ['préparation rendez-vous client B2B', 'briefing avant RDV commercial', 'préparation visite client IA'],
      keywordsEn: ['B2B client meeting preparation', 'pre-meeting sales briefing', 'AI client visit preparation'],
      relatedIds: ['client-portfolio', 'ai-report', 'voice-recording'],
    },
    'ai-assistant': {
      nameFr: 'Max — Assistant IA Manager',
      nameEn: 'Max — AI Manager Assistant',
      descriptionFr: "Assistant conversationnel IA pour les managers. Posez des questions sur l'activité de l'équipe, obtenez des analyses croisées, créez des directives, planifiez des actions — en langage naturel.",
      descriptionEn: 'AI conversational assistant for managers. Ask questions about team activity, get cross-analyses, create directives, plan actions — in natural language.',
      keywordsFr: ['assistant IA directeur commercial', 'chatbot manager vente', 'IA pilotage équipe commerciale'],
      keywordsEn: ['AI sales director assistant', 'sales manager chatbot', 'AI sales team management'],
      relatedIds: ['manager-hub', 'territory-syntheses', 'sales-directives'],
    },
    'client-portfolio': {
      nameFr: 'Portfolio Client',
      nameEn: 'Client Portfolio',
      descriptionFr: "Gestion du portefeuille client : entreprises, contacts, historique d'interactions. Fiche client auto-enrichie par l'IA à partir des rapports — timeline, besoins agrégés, score relationnel.",
      descriptionEn: 'Client portfolio management: companies, contacts, interaction history. AI-enriched client card from reports — timeline, aggregated needs, relationship score.',
      keywordsFr: ['gestion portefeuille client commercial', 'fiche client enrichie IA', 'suivi client terrain'],
      keywordsEn: ['sales client portfolio management', 'AI-enriched client card', 'field client tracking'],
      relatedIds: ['ai-report', 'meeting-prep', 'manager-hub'],
    },
    'knowledge-base': {
      nameFr: 'Base de connaissances',
      nameEn: 'Knowledge Base',
      descriptionFr: "Base de connaissances vectorielle pour l'organisation. Importez documents, sites web, liens — l'IA les utilise pour enrichir les rapports et répondre aux questions via Max.",
      descriptionEn: 'Vector knowledge base for the organization. Import documents, websites, links — the AI uses them to enrich reports and answer questions via Max.',
      keywordsFr: ['base de connaissances équipe commerciale', 'knowledge base vente B2B', 'documentation commerciale IA'],
      keywordsEn: ['sales team knowledge base', 'B2B sales knowledge base', 'AI sales documentation'],
      relatedIds: ['ai-assistant', 'ai-report', 'manager-hub'],
    },
    'sales-directives': {
      nameFr: 'Directives commerciales',
      nameEn: 'Sales Directives',
      descriptionFr: "Définissez des directives commerciales avec des checkpoints. L'IA évalue automatiquement chaque rapport par rapport aux directives actives et remonte un score de conformité.",
      descriptionEn: 'Define sales directives with checkpoints. The AI automatically evaluates each report against active directives and surfaces a compliance score.',
      keywordsFr: ['directives commerciales équipe', 'pilotage objectifs commerciaux', 'conformité rapports commerciaux IA'],
      keywordsEn: ['sales team directives', 'sales objective management', 'AI sales report compliance'],
      relatedIds: ['manager-hub', 'ai-assistant', 'territory-syntheses'],
    },
  },

  generation: {
    model: 'claude-sonnet-4-5-20250929',
    maxTokens: 8192,
  },

  // Existing site copy used as tone reference
  styleExamples: [
    'src/components/Hero.astro',
    'src/components/Problem.astro',
    'src/components/Features.astro',
  ],
};
```

- [ ] **Step 2: Write the generation script**

```javascript
// scripts/generate-feature.mjs
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import Anthropic from '@anthropic-ai/sdk';
import config from './feature-config.mjs';

const REGISTRY_PATH = path.resolve('src/data/features.yaml');
const CONTENT_DIR = path.resolve('src/content/features');
const ICON_NAMES = [
  'microphone', 'document', 'clock', 'users', 'brain', 'globe',
  'building', 'flask', 'chart', 'download', 'shield', 'search',
  'zap', 'target', 'layers', 'music', 'alert', 'shuffle', 'compass', 'book',
];

function loadRegistry() {
  return yaml.load(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
}

function loadStyleExamples() {
  return config.styleExamples
    .map((p) => {
      const full = path.resolve(p);
      if (!fs.existsSync(full)) return null;
      return fs.readFileSync(full, 'utf-8');
    })
    .filter(Boolean);
}

function buildPrompt(featureCtx, lang, examples, relatedFeatures) {
  const isEn = lang === 'en';
  const name = isEn ? featureCtx.nameEn : featureCtx.nameFr;
  const description = isEn ? featureCtx.descriptionEn : featureCtx.descriptionFr;
  const keywords = isEn ? featureCtx.keywordsEn : featureCtx.keywordsFr;

  const styleSnippets = examples
    .map((ex, i) => `--- Style example ${i + 1} ---\n${ex.slice(0, 1500)}`)
    .join('\n\n');

  const relatedList = relatedFeatures
    .map((r) => `- slug: "${r.slug}", label: "${r.label}"`)
    .join('\n');

  return `You are an expert SEO content writer and product marketer for B2B SaaS tools.

Product: ${config.product.name} — ${config.product.description}
Product URL: ${config.product.url}
Target audiences: ${config.product.audiences.join(', ')}

Feature to write about: "${name}"
Feature description: ${description}
Target keywords: ${keywords.join(', ')}

Here are style examples from the existing site (match this tone — direct, concrete, professional but accessible, no generic AI jargon):

${styleSnippets}

Write a COMPLETE YAML file for a feature landing page in ${isEn ? 'English' : 'French'}.
${isEn ? 'Write natively in English — do NOT translate from French.' : 'Écris nativement en français — ne traduis PAS de l\'anglais.'}

CRITICAL RULES:
- The H1 (hero.title) MUST contain the primary keyword. Use <br /> and <em> tags for emphasis like the existing site.
- seo.title must be max 60 characters and include "Reedly"
- seo.description must be max 155 characters
- problem.cards must have EXACTLY 3 items
- solution.steps must have EXACTLY 3 items
- benefits.cards must have 4-6 items
- use_cases.cards must have 3-4 items
- faq must have 4-6 items answering real "People Also Ask" questions
- All icon fields must use ONLY from this list: ${ICON_NAMES.join(', ')}
- NEVER invent features that Reedly doesn't have
- ${isEn ? 'hero.cta_url should be "/en#trial"' : 'hero.cta_url should be "/fr#trial"'}

Related features to link to:
${relatedList}

Output ONLY valid YAML (no markdown fences, no comments, no explanation). Start directly with "seo:".

YAML schema to fill:

seo:
  title: string
  description: string
  keywords: [string, string, string]
hero:
  eyebrow: string
  title: string
  lead: string
  cta_label: string
  cta_url: string
problem:
  eyebrow: string
  title: string
  lead: string
  cards:
    - title: string
      text: string
      icon: string
solution:
  eyebrow: string
  title: string
  lead: string
  steps:
    - title: string
      text: string
benefits:
  eyebrow: string
  title: string
  cards:
    - title: string
      text: string
      icon: string
use_cases:
  eyebrow: string
  title: string
  cards:
    - title: string
      text: string
      icon: string
faq:
  - question: string
    answer: string
related_features:
  - slug: string
    label: string`;
}

async function generateFeatureContent(featureId, lang) {
  const registry = loadRegistry();
  const feature = registry.features.find((f) => f.id === featureId);
  if (!feature) throw new Error(`Feature "${featureId}" not found in registry`);

  const featureCtx = config.featureContext[featureId];
  if (!featureCtx) throw new Error(`No context defined for feature "${featureId}" in feature-config.mjs`);

  const examples = loadStyleExamples();

  // Build related features list
  const relatedFeatures = (featureCtx.relatedIds || []).map((relId) => {
    const rel = registry.features.find((f) => f.id === relId);
    const relCtx = config.featureContext[relId];
    return {
      slug: rel.slugs[lang],
      label: lang === 'en' ? relCtx.nameEn : relCtx.nameFr,
    };
  });

  const prompt = buildPrompt(featureCtx, lang, examples, relatedFeatures);

  const client = new Anthropic();
  const response = await client.messages.create({
    model: config.generation.model,
    max_tokens: config.generation.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  let yamlText = response.content[0].text.trim();
  // Clean markdown fences if present
  yamlText = yamlText.replace(/^```(?:yaml)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

  // Validate by parsing
  const parsed = yaml.load(yamlText);
  if (!parsed?.seo || !parsed?.hero || !parsed?.problem || !parsed?.faq) {
    throw new Error(`Invalid YAML structure returned for ${featureId} (${lang})`);
  }

  // Write file
  const slug = feature.slugs[lang];
  const dir = path.join(CONTENT_DIR, lang);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${slug}.yaml`);
  fs.writeFileSync(filePath, yamlText, 'utf-8');

  console.log(`  ✓ ${lang.toUpperCase()} written: ${filePath}`);
  return { slug, filePath };
}

async function main() {
  const args = process.argv.slice(2);
  const isAll = args.includes('--all');
  const langFlag = args.find((a) => a.startsWith('--lang='));
  const langs = langFlag ? [langFlag.split('=')[1]] : ['fr', 'en'];

  const registry = loadRegistry();
  let featureIds;

  if (isAll) {
    featureIds = registry.features.map((f) => f.id);
  } else {
    const id = args.find((a) => !a.startsWith('--'));
    if (!id) {
      console.error('Usage: node scripts/generate-feature.mjs <feature-id> [--lang=fr|en]');
      console.error('       node scripts/generate-feature.mjs --all');
      console.error(`\nAvailable features: ${registry.features.map((f) => f.id).join(', ')}`);
      process.exit(1);
    }
    featureIds = [id];
  }

  console.log(`=== Generating feature landing page content ===\n`);

  for (const featureId of featureIds) {
    console.log(`Feature: ${featureId}`);
    for (const lang of langs) {
      await generateFeatureContent(featureId, lang);
    }
    console.log();
  }

  console.log('=== Done ===');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
```

- [ ] **Step 3: Add the pnpm scripts to package.json**

Add to `package.json` scripts:

```json
"generate:feature": "node scripts/generate-feature.mjs",
"generate:features": "node scripts/generate-feature.mjs --all"
```

- [ ] **Step 4: Commit**

```bash
git add scripts/feature-config.mjs scripts/generate-feature.mjs package.json
git commit -m "feat(seo): add Claude API content generation script for features"
```

---

### Task 7: Generate content for the first feature (smoke test)

- [ ] **Step 1: Generate content for `ai-report` (one feature, both languages)**

Run: `ANTHROPIC_API_KEY=<key> pnpm generate:feature ai-report`

Expected output:
```
=== Generating feature landing page content ===

Feature: ai-report
  ✓ FR written: src/content/features/fr/rapport-ia.yaml
  ✓ EN written: src/content/features/en/ai-report.yaml

=== Done ===
```

- [ ] **Step 2: Validate the generated YAML content**

Read both files and check:
- `seo.title` is under 60 chars and contains "Reedly"
- `problem.cards` has exactly 3 items
- `solution.steps` has exactly 3 items
- `faq` has 4-6 items
- All `icon` values are from the allowed list
- `related_features` slugs match the registry

- [ ] **Step 3: Build and preview**

Run: `pnpm build && pnpm preview`

Then visit:
- `http://localhost:4321/fr/solutions/rapport-ia`
- `http://localhost:4321/en/solutions/ai-report`

Verify: page renders correctly with all sections, animations work, breadcrumb is present, nav is correct.

- [ ] **Step 4: Commit the generated content**

```bash
git add src/content/features/
git commit -m "content: add AI report feature landing page (FR + EN)"
```

---

### Task 8: Generate all remaining feature content

- [ ] **Step 1: Generate all features**

Run: `ANTHROPIC_API_KEY=<key> pnpm generate:features --all`

This generates 20 more YAML files (10 features × 2 languages, `ai-report` already done).

- [ ] **Step 2: Build and spot-check 3-4 pages**

Run: `pnpm build && pnpm preview`

Visit several pages in both languages and verify rendering, animations, FAQ accordion, related features links.

- [ ] **Step 3: Commit all generated content**

```bash
git add src/content/features/
git commit -m "content: add all 11 feature landing pages (FR + EN)"
```

---

### Task 9: Update the `/solution` page to link to feature pages

**Files:**
- Modify: `src/components/Features.astro`

The feature cards on `/solution` become links to the dedicated feature pages.

- [ ] **Step 1: Update Features.astro**

Wrap each `<article class="feature-card">` in an `<a>` tag linking to the corresponding feature page. Add a "En savoir plus →" link at the bottom of each card.

The current cards are:
1. Enregistrement vocal en 1 tap → `/solutions/enregistrement-vocal-rdv`
2. Transcription fidèle → `/solutions/transcription-ia`
3. Rapport structuré en 11 sections → `/solutions/rapport-ia`
4. Expert sectoriel intégré → (no dedicated page — this is covered across multiple features)
5. Export PDF en 1 clic → (no dedicated page — included in rapport-ia)
6. Synthèses territoriales → `/solutions/syntheses-territoriales`

For cards 1, 2, 3, 6: wrap in `<a>` with the feature page link and add "En savoir plus →".
For cards 4, 5: keep as-is (no dedicated feature page).

Update `Features.astro` to accept a `lang` prop (read from the URL path) to generate correct links:

```astro
---
// src/components/Features.astro
const path = Astro.url.pathname.replace(/\/$/, '') || '/';
const lang = path.startsWith('/en') ? 'en' : 'fr';

const featureLinks: Record<number, { fr: string; en: string } | null> = {
  1: { fr: '/fr/solutions/enregistrement-vocal-rdv', en: '/en/solutions/meeting-voice-recording' },
  2: { fr: '/fr/solutions/transcription-ia', en: '/en/solutions/ai-transcription' },
  3: { fr: '/fr/solutions/rapport-ia', en: '/en/solutions/ai-report' },
  4: null, // expert sectoriel — no dedicated page
  5: null, // export PDF — covered in ai-report
  6: { fr: '/fr/solutions/syntheses-territoriales', en: '/en/solutions/territory-syntheses' },
};

const learnMore = lang === 'fr' ? 'En savoir plus →' : 'Learn more →';
---
```

Then for each card that has a link, wrap the `<article>` content and add the learn-more link. For cards 1-3 and 6, add at the bottom of the `<article>`:

```html
<a class="feature-card__link" href={featureLinks[N][lang]}>{learnMore}</a>
```

Add the CSS for the link:

```css
.feature-card__link {
  display: inline-block;
  margin-top: 0.75rem;
  font-family: var(--mono);
  font-size: 0.8rem;
  color: var(--green);
  text-decoration: none;
}
.feature-card__link:hover {
  text-decoration: underline;
}
```

- [ ] **Step 2: Build and verify**

Run: `pnpm build && pnpm preview`

Visit `/fr/solution` and `/en/solution`. Verify the "En savoir plus →" links appear on the correct cards and navigate to the right feature pages.

- [ ] **Step 3: Commit**

```bash
git add src/components/Features.astro src/styles/global.css
git commit -m "feat(seo): link solution page feature cards to dedicated landing pages"
```

---

### Task 10: Update sitemap and vercel.json

**Files:**
- Modify: `public/sitemap.xml`
- Modify: `vercel.json`

- [ ] **Step 1: Add all 22 feature URLs to the sitemap**

For each of the 11 features, add a FR `<url>` and an EN `<url>` entry with proper hreflang alternates. Insert them after the existing solution page entries and before the legal page entries. Use `<lastmod>2026-04-16</lastmod>` and `<priority>0.8</priority>`.

Example entry for one feature (rapport-ia / ai-report):

```xml
<url>
  <loc>https://www.reedly.ai/fr/solutions/rapport-ia</loc>
  <xhtml:link rel="alternate" hreflang="fr" href="https://www.reedly.ai/fr/solutions/rapport-ia" />
  <xhtml:link rel="alternate" hreflang="en" href="https://www.reedly.ai/en/solutions/ai-report" />
  <xhtml:link rel="alternate" hreflang="x-default" href="https://www.reedly.ai/en/solutions/ai-report" />
  <lastmod>2026-04-16</lastmod>
  <priority>0.8</priority>
</url>
```

Repeat for all 11 features × 2 languages (22 entries total). Use the slug pairs from `src/data/features.yaml`.

- [ ] **Step 2: Add redirects for `/solutions/[slug]` to vercel.json (optional, for consistency)**

No redirects needed — the pages are under `/{lang}/solutions/{slug}` already.

- [ ] **Step 3: Verify sitemap is valid XML**

Run: `xmllint --noout public/sitemap.xml` (if available) or open in browser.

- [ ] **Step 4: Commit**

```bash
git add public/sitemap.xml
git commit -m "feat(seo): add 22 feature landing page URLs to sitemap"
```

---

### Task 11: Update Nav component for solution sub-pages

**Files:**
- Modify: `src/components/Nav.astro`

The nav should highlight "Solution" as active when on any `/solutions/*` page, not just `/solution`.

- [ ] **Step 1: Update the `isSolution` check in Nav.astro**

Change line 6 from:
```javascript
const isSolution = path.endsWith('/solution');
```
to:
```javascript
const isSolution = path.endsWith('/solution') || path.includes('/solutions/');
```

- [ ] **Step 2: Build and verify**

Visit a feature page and confirm the "Solution" nav link is highlighted as active.

- [ ] **Step 3: Commit**

```bash
git add src/components/Nav.astro
git commit -m "fix(nav): highlight Solution link on feature sub-pages"
```

---

### Task 12: Final build verification

- [ ] **Step 1: Full build**

Run: `pnpm build`

Expected: Build succeeds with 22 new pages generated under `dist/fr/solutions/` and `dist/en/solutions/`.

- [ ] **Step 2: Count generated pages**

Run: `ls dist/fr/solutions/ | wc -l && ls dist/en/solutions/ | wc -l`

Expected: 11 directories in each.

- [ ] **Step 3: Preview and verify end-to-end**

Run: `pnpm preview`

Check:
- [ ] Feature page renders with all sections (hero, problem, solution, benefits, use cases, FAQ, related, CTA)
- [ ] Breadcrumb shows: Accueil > Solution > [Feature]
- [ ] FAQ accordion works (click to expand/collapse)
- [ ] Reveal animations trigger on scroll
- [ ] Related features links navigate correctly
- [ ] Language toggle switches between FR/EN versions
- [ ] "Solution" nav link is active
- [ ] View page source: Schema.org JSON-LD is present (BreadcrumbList + FAQPage)
- [ ] View page source: hreflang tags are correct
- [ ] "En savoir plus →" links on `/solution` page work

- [ ] **Step 4: Commit any final fixes**

```bash
git add -A
git commit -m "feat(seo): complete feature landing pages system — 22 new pages"
```
