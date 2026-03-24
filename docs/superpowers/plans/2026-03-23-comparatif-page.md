# Comparatif Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/comparatif` SEO comparison page on the Astro landing site comparing Reedly to 6 competitors.

**Architecture:** Single Astro page (`comparatif.astro`) importing `Comparatif.astro` (4 sections: hero, table, differentiators, price bars) + existing `FinalCta.astro` (CTA + notify modal). Scoped CSS in the component reusing global design tokens. i18n keys added to the existing `T` dictionary in `public/main.js`.

**Tech Stack:** Astro 5, CSS custom properties, vanilla JS i18n (`data-i18n` / `data-i18n-html` attributes)

**Spec:** `docs/superpowers/specs/2026-03-23-comparatif-page-design.md`

**Important:** `main.js` binds event listeners to `#notify-modal` elements on page load without null guards. If these elements are missing, the script crashes and breaks i18n/animations. That's why we import `FinalCta.astro` on the comparatif page — it provides both the CTA and the required modal markup.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/pages/comparatif.astro` | Page shell — imports Layout, Nav, Comparatif, FinalCta, Footer |
| Create | `src/components/Comparatif.astro` | 4 sections (hero, table, differentiators, price bars) with scoped CSS |
| Modify | `public/main.js` | Add FR+EN i18n keys (`comparatif.*`) to `T` dictionary |
| Modify | `src/components/Footer.astro` | Add "Comparatif" link |

---

### Task 1: Add i18n keys to main.js

**Files:**
- Modify: `public/main.js`

- [ ] **Step 1: Add FR keys**

Search for `"hub.dash.nav": "Tableau de bord",` in the `fr:` block. Insert these lines immediately after it (before the closing `},` of the `fr:` block):

```js
    // ── Comparatif page ──
    "comparatif.hero.eyebrow": "Comparatif",
    "comparatif.hero.title": "Pourquoi les commerciaux terrain<br><em>choisissent Reedly.</em>",
    "comparatif.hero.lead": "Les autres transcrivent vos réunions. Reedly les comprend — rapports structurés en 11 sections, vocabulaire métier, synthèses stratégiques. Le tout à un prix qui a du sens.",
    "comparatif.table.eyebrow": "Comparaison",
    "comparatif.table.title": "Reedly face aux <em>alternatives.</em>",
    "comparatif.table.lead": "Transcription, rapports, terrain, management — voici comment Reedly se positionne face aux principaux outils du marché.",
    "comparatif.table.row1": "Conçu pour le terrain",
    "comparatif.table.row2": "Rapports structurés (11 sections)",
    "comparatif.table.row3": "Distinction vocale",
    "comparatif.table.row4": "Vocabulaire métier",
    "comparatif.table.row5": "Synthèses stratégiques",
    "comparatif.table.row6": "Hub management",
    "comparatif.table.row7": "Prix / utilisateur / mois",
    "comparatif.why.eyebrow": "Pourquoi Reedly",
    "comparatif.why.title": "Ce que les autres <em>ne font pas.</em>",
    "comparatif.why.lead": "Reedly n'est pas un outil de transcription reconverti. C'est un agent IA conçu dès le départ pour les commerciaux de terrain.",
    "comparatif.why.card1.title": "Conçu pour le terrain",
    "comparatif.why.card1.text": "Pas une app de visio reconvertie. Enregistrement via le micro du téléphone, mode hors-ligne, rapport généré automatiquement dès le retour en zone réseau.",
    "comparatif.why.card2.title": "Rapports experts, pas des notes",
    "comparatif.why.card2.text": "11 sections structurées par secteur : résumé exécutif, besoins client, objections, engagements, prochaines étapes. L'IA raisonne comme un consultant métier.",
    "comparatif.why.card3.title": "Qui dit quoi",
    "comparatif.why.card3.text": "La diarisation identifie automatiquement commercial vs client. Les besoins exprimés par le client sont distingués des arguments du commercial dans le rapport.",
    "comparatif.why.card4.title": "Synthèses stratégiques",
    "comparatif.why.card4.text": "Agrégez une semaine ou un trimestre de rendez-vous en tendances, risques et opportunités priorisées. De l'intelligence commerciale, pas juste de la documentation.",
    "comparatif.price.eyebrow": "Tarifs",
    "comparatif.price.title": "Plus complet. <em>Moins cher.</em>",
    "comparatif.price.lead": "Prix par utilisateur par mois, plans équipe.",
    "comparatif.price.note": "Fireflies et Otter sont moins chers mais ne font que de la transcription — pas de rapports structurés, pas de terrain, pas de synthèses.",
    "footer.comparatif": "Comparatif",
```

- [ ] **Step 2: Add EN keys**

Search for `"hub.dash.nav": "Dashboard",` in the `en:` block (NOTE: line numbers have shifted after Step 1 — search by text, not line number). Insert these lines immediately after it:

```js
    // ── Comparatif page ──
    "comparatif.hero.eyebrow": "Compare",
    "comparatif.hero.title": "Why field sales reps<br><em>choose Reedly.</em>",
    "comparatif.hero.lead": "Others transcribe your meetings. Reedly understands them — structured reports in 11 sections, industry vocabulary, strategic syntheses. All at a price that makes sense.",
    "comparatif.table.eyebrow": "Comparison",
    "comparatif.table.title": "Reedly vs the <em>alternatives.</em>",
    "comparatif.table.lead": "Transcription, reports, field work, management — here's how Reedly compares to the main tools on the market.",
    "comparatif.table.row1": "Built for the field",
    "comparatif.table.row2": "Structured reports (11 sections)",
    "comparatif.table.row3": "Speaker identification",
    "comparatif.table.row4": "Industry vocabulary",
    "comparatif.table.row5": "Strategic syntheses",
    "comparatif.table.row6": "Management hub",
    "comparatif.table.row7": "Price / user / month",
    "comparatif.why.eyebrow": "Why Reedly",
    "comparatif.why.title": "What the others <em>don't do.</em>",
    "comparatif.why.lead": "Reedly isn't a repurposed transcription tool. It's an AI agent built from day one for field sales reps.",
    "comparatif.why.card1.title": "Built for the field",
    "comparatif.why.card1.text": "Not a video call app repurposed. Records via the phone microphone, works offline, generates the report automatically when back in network.",
    "comparatif.why.card2.title": "Expert reports, not notes",
    "comparatif.why.card2.text": "11 sections structured by industry: executive summary, client needs, objections, commitments, next steps. The AI reasons like an industry consultant.",
    "comparatif.why.card3.title": "Who said what",
    "comparatif.why.card3.text": "Diarization automatically identifies sales rep vs client. Client-expressed needs are distinguished from the rep's arguments in the report.",
    "comparatif.why.card4.title": "Strategic syntheses",
    "comparatif.why.card4.text": "Aggregate a week or a quarter of meetings into prioritized trends, risks, and opportunities. Business intelligence, not just documentation.",
    "comparatif.price.eyebrow": "Pricing",
    "comparatif.price.title": "More complete. <em>Less expensive.</em>",
    "comparatif.price.lead": "Price per user per month, team plans.",
    "comparatif.price.note": "Fireflies and Otter are cheaper but only do transcription — no structured reports, no field support, no syntheses.",
    "footer.comparatif": "Compare",
```

- [ ] **Step 3: Verify main.js is valid**

Run: `cd /Users/lel/www/reedly-landing && node -c public/main.js`
Expected: no syntax error

- [ ] **Step 4: Commit**

```bash
cd /Users/lel/www/reedly-landing && git add public/main.js && git commit -m "feat(comparatif): add FR+EN i18n keys for comparison page"
```

---

### Task 2: Create the Comparatif component

**Files:**
- Create: `src/components/Comparatif.astro`

Create the file with the following exact content. The component contains 4 sections (hero, comparison table, differentiators, price bars). The CTA section is handled by the existing `FinalCta.astro` imported in the page.

```astro
---
// Comparatif — SEO comparison page (4 sections)
---

<!-- ── Hero ── -->
<section class="comp-hero">
  <div class="inner">
    <div class="reveal">
      <div class="section__eyebrow" data-i18n="comparatif.hero.eyebrow">Comparatif</div>
      <h1 data-i18n-html="comparatif.hero.title">
        Pourquoi les commerciaux terrain<br /><em>choisissent Reedly.</em>
      </h1>
      <p class="comp-hero__lead" data-i18n="comparatif.hero.lead">
        Les autres transcrivent vos réunions. Reedly les comprend — rapports structurés en 11 sections,
        vocabulaire métier, synthèses stratégiques. Le tout à un prix qui a du sens.
      </p>
    </div>
  </div>
</section>

<!-- ── Comparison Table ── -->
<section class="section" id="comparaison">
  <div class="inner">
    <div class="reveal">
      <div class="section__eyebrow" data-i18n="comparatif.table.eyebrow">Comparaison</div>
      <h2 data-i18n-html="comparatif.table.title">
        Reedly face aux <em>alternatives.</em>
      </h2>
      <p class="section__lead" data-i18n="comparatif.table.lead">
        Transcription, rapports, terrain, management — voici comment Reedly se positionne face aux principaux outils du marché.
      </p>
    </div>
    <div class="comp-table-wrap reveal">
      <table class="comp-table">
        <thead>
          <tr>
            <th></th>
            <th class="hl">Reedly</th>
            <th>Noota</th>
            <th>Leexi</th>
            <th>Modjo</th>
            <th>Gong</th>
            <th>Fireflies</th>
            <th>Otter</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td data-i18n="comparatif.table.row1">Conçu pour le terrain</td>
            <td class="hl"><span class="comp-yes">&#10003;</span></td>
            <td><span class="comp-partial">~</span></td>
            <td><span class="comp-no">&#10005;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
          </tr>
          <tr>
            <td data-i18n="comparatif.table.row2">Rapports structurés (11 sections)</td>
            <td class="hl"><span class="comp-yes">&#10003;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
          </tr>
          <tr>
            <td data-i18n="comparatif.table.row3">Distinction vocale</td>
            <td class="hl"><span class="comp-yes">&#10003;</span></td>
            <td><span class="comp-yes">&#10003;</span></td>
            <td><span class="comp-yes">&#10003;</span></td>
            <td><span class="comp-yes">&#10003;</span></td>
            <td><span class="comp-yes">&#10003;</span></td>
            <td><span class="comp-yes">&#10003;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
          </tr>
          <tr>
            <td data-i18n="comparatif.table.row4">Vocabulaire métier</td>
            <td class="hl"><span class="comp-yes">&#10003;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
            <td><span class="comp-partial">~</span></td>
            <td><span class="comp-partial">~</span></td>
            <td><span class="comp-no">&#10005;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
          </tr>
          <tr>
            <td data-i18n="comparatif.table.row5">Synthèses stratégiques</td>
            <td class="hl"><span class="comp-yes">&#10003;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
            <td><span class="comp-partial">~</span></td>
            <td><span class="comp-yes">&#10003;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
          </tr>
          <tr>
            <td data-i18n="comparatif.table.row6">Hub management</td>
            <td class="hl"><span class="comp-yes">&#10003;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
            <td><span class="comp-partial">~</span></td>
            <td><span class="comp-yes">&#10003;</span></td>
            <td><span class="comp-yes">&#10003;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
            <td><span class="comp-no">&#10005;</span></td>
          </tr>
          <tr>
            <td data-i18n="comparatif.table.row7">Prix / utilisateur / mois</td>
            <td class="hl"><span class="comp-price comp-price--green">69 EUR</span></td>
            <td><span class="comp-price">19–49 EUR</span></td>
            <td><span class="comp-price">23–65 EUR</span></td>
            <td><span class="comp-price">~99 EUR</span></td>
            <td><span class="comp-price comp-price--red">108–250 USD</span></td>
            <td><span class="comp-price">10–29 USD</span></td>
            <td><span class="comp-price">8–20 USD</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

<!-- ── Why Different ── -->
<section class="section">
  <div class="inner">
    <div class="reveal">
      <div class="section__eyebrow" data-i18n="comparatif.why.eyebrow">Pourquoi Reedly</div>
      <h2 data-i18n-html="comparatif.why.title">
        Ce que les autres <em>ne font pas.</em>
      </h2>
      <p class="section__lead" data-i18n="comparatif.why.lead">
        Reedly n'est pas un outil de transcription reconverti. C'est un agent IA conçu dès le départ pour les commerciaux de terrain.
      </p>
    </div>
    <div class="comp-diff-grid">
      <article class="comp-diff-card reveal reveal-delay-1">
        <div class="comp-diff-card__icon">
          <svg fill="none" viewBox="0 0 24 24" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
        </div>
        <h3 data-i18n="comparatif.why.card1.title">Conçu pour le terrain</h3>
        <p data-i18n="comparatif.why.card1.text">
          Pas une app de visio reconvertie. Enregistrement via le micro du téléphone, mode hors-ligne, rapport généré automatiquement dès le retour en zone réseau.
        </p>
      </article>
      <article class="comp-diff-card reveal reveal-delay-1">
        <div class="comp-diff-card__icon">
          <svg fill="none" viewBox="0 0 24 24" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 data-i18n="comparatif.why.card2.title">Rapports experts, pas des notes</h3>
        <p data-i18n="comparatif.why.card2.text">
          11 sections structurées par secteur : résumé exécutif, besoins client, objections, engagements, prochaines étapes. L'IA raisonne comme un consultant métier.
        </p>
      </article>
      <article class="comp-diff-card reveal reveal-delay-2">
        <div class="comp-diff-card__icon">
          <svg fill="none" viewBox="0 0 24 24" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <h3 data-i18n="comparatif.why.card3.title">Qui dit quoi</h3>
        <p data-i18n="comparatif.why.card3.text">
          La diarisation identifie automatiquement commercial vs client. Les besoins exprimés par le client sont distingués des arguments du commercial dans le rapport.
        </p>
      </article>
      <article class="comp-diff-card reveal reveal-delay-2">
        <div class="comp-diff-card__icon">
          <svg fill="none" viewBox="0 0 24 24" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <h3 data-i18n="comparatif.why.card4.title">Synthèses stratégiques</h3>
        <p data-i18n="comparatif.why.card4.text">
          Agrégez une semaine ou un trimestre de rendez-vous en tendances, risques et opportunités priorisées. De l'intelligence commerciale, pas juste de la documentation.
        </p>
      </article>
    </div>
  </div>
</section>

<!-- ── Price Comparison ── -->
<section class="section">
  <div class="inner" style="text-align: center">
    <div class="reveal">
      <div class="section__eyebrow" data-i18n="comparatif.price.eyebrow">Tarifs</div>
      <h2 data-i18n-html="comparatif.price.title">
        Plus complet. <em>Moins cher.</em>
      </h2>
      <p class="section__lead" style="margin: 14px auto 0" data-i18n="comparatif.price.lead">
        Prix par utilisateur par mois, plans équipe.
      </p>
    </div>
    <div class="comp-price-visual reveal">
      <div class="comp-price-row comp-price-row--gong">
        <div class="comp-price-row__label">Gong</div>
        <div class="comp-price-row__bar"><div class="comp-price-row__fill">108–250 USD</div></div>
      </div>
      <div class="comp-price-row comp-price-row--modjo">
        <div class="comp-price-row__label">Modjo</div>
        <div class="comp-price-row__bar"><div class="comp-price-row__fill">~99 EUR</div></div>
      </div>
      <div class="comp-price-row comp-price-row--reedly">
        <div class="comp-price-row__label">Reedly</div>
        <div class="comp-price-row__bar"><div class="comp-price-row__fill">69 EUR</div></div>
      </div>
      <div class="comp-price-row comp-price-row--leexi">
        <div class="comp-price-row__label">Leexi</div>
        <div class="comp-price-row__bar"><div class="comp-price-row__fill">23–65 EUR</div></div>
      </div>
      <div class="comp-price-row comp-price-row--noota">
        <div class="comp-price-row__label">Noota</div>
        <div class="comp-price-row__bar"><div class="comp-price-row__fill">19–49 EUR</div></div>
      </div>
      <div class="comp-price-row comp-price-row--fireflies">
        <div class="comp-price-row__label">Fireflies</div>
        <div class="comp-price-row__bar"><div class="comp-price-row__fill">10–29 USD</div></div>
      </div>
      <div class="comp-price-row comp-price-row--otter">
        <div class="comp-price-row__label">Otter</div>
        <div class="comp-price-row__bar"><div class="comp-price-row__fill">8–20 USD</div></div>
      </div>
    </div>
    <p class="comp-price-note" data-i18n="comparatif.price.note">
      Fireflies et Otter sont moins chers mais ne font que de la transcription — pas de rapports structurés, pas de terrain, pas de synthèses.
    </p>
  </div>
</section>

<style>
  /* ── Hero ── */
  .comp-hero { padding: 80px 0 60px; text-align: center; }
  .comp-hero h1 {
    font-family: var(--display);
    font-size: clamp(2.4rem, 5vw, 3.8rem);
    line-height: 1.08;
    font-weight: 400;
  }
  .comp-hero h1 em { font-style: italic; color: var(--green); }
  .comp-hero__lead {
    color: var(--muted);
    font-size: 1.1rem;
    line-height: 1.7;
    max-width: 58ch;
    margin: 18px auto 0;
  }

  /* ── Comparison Table ── */
  .comp-table-wrap {
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: 16px;
    background: var(--surface);
    margin-top: 32px;
  }
  .comp-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    min-width: 820px;
  }
  .comp-table thead th {
    background: var(--bg2);
    padding: 16px 14px;
    text-align: center;
    font-weight: 700;
    font-family: var(--sans);
    font-size: 0.82rem;
    border-bottom: 1px solid var(--border);
    color: var(--muted);
  }
  .comp-table thead th:first-child { text-align: left; padding-left: 20px; }
  .comp-table thead th.hl {
    background: rgba(22, 163, 74, 0.1);
    color: var(--green);
    border-left: 2px solid rgba(34, 197, 94, 0.25);
    border-right: 2px solid rgba(34, 197, 94, 0.25);
    border-top: 2px solid rgba(34, 197, 94, 0.25);
  }
  .comp-table tbody td {
    padding: 14px;
    text-align: center;
    border-bottom: 1px solid rgba(30, 41, 59, 0.4);
    color: var(--muted);
  }
  .comp-table tbody td:first-child {
    text-align: left;
    color: var(--text);
    font-weight: 600;
    font-size: 0.88rem;
    padding-left: 20px;
  }
  .comp-table tbody td.hl {
    background: rgba(22, 163, 74, 0.04);
    border-left: 2px solid rgba(34, 197, 94, 0.25);
    border-right: 2px solid rgba(34, 197, 94, 0.25);
  }
  .comp-table tbody tr:last-child td { border-bottom: none; }
  .comp-table tbody tr:last-child td.hl {
    border-bottom: 2px solid rgba(34, 197, 94, 0.25);
  }
  .comp-yes, .comp-no, .comp-partial {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-size: 14px;
  }
  .comp-yes { background: rgba(22, 163, 74, 0.15); color: var(--green); }
  .comp-no { background: rgba(239, 68, 68, 0.08); color: rgba(239, 68, 68, 0.5); }
  .comp-partial {
    background: rgba(251, 191, 36, 0.1);
    color: var(--amber);
    font-size: 11px;
    font-family: var(--mono);
  }
  .comp-price {
    font-family: var(--mono);
    font-weight: 500;
    font-size: 0.8rem;
  }
  .comp-price--green { color: var(--green); }
  .comp-price--red { color: var(--red); }

  /* ── Differentiators Grid ── */
  .comp-diff-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 32px;
  }
  .comp-diff-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
  }
  .comp-diff-card__icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(22, 163, 74, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.15);
    display: grid;
    place-items: center;
    margin-bottom: 18px;
  }
  .comp-diff-card__icon svg {
    width: 22px;
    height: 22px;
    stroke: var(--green);
  }
  .comp-diff-card h3 {
    font-family: var(--sans);
    font-size: 1.05rem;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .comp-diff-card p {
    color: var(--muted);
    font-size: 0.92rem;
    line-height: 1.65;
  }

  /* ── Price Bars ── */
  .comp-price-visual {
    max-width: 680px;
    margin: 32px auto 0;
  }
  .comp-price-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
  }
  .comp-price-row__label {
    width: 90px;
    text-align: right;
    font-family: var(--mono);
    font-size: 0.78rem;
    font-weight: 500;
    flex-shrink: 0;
    color: var(--muted);
  }
  .comp-price-row__bar {
    flex: 1;
    height: 34px;
    background: rgba(30, 41, 59, 0.4);
    border-radius: 8px;
    overflow: hidden;
  }
  .comp-price-row__fill {
    height: 100%;
    border-radius: 8px;
    display: flex;
    align-items: center;
    padding-left: 12px;
    font-family: var(--mono);
    font-size: 0.75rem;
    font-weight: 500;
  }
  /* Bar widths are arbitrary visual proportions for impact */
  .comp-price-row--reedly .comp-price-row__label { color: var(--green); font-weight: 700; }
  .comp-price-row--reedly .comp-price-row__fill {
    background: rgba(22, 163, 74, 0.25);
    width: 28%;
    color: var(--green);
    border: 1px solid rgba(34, 197, 94, 0.3);
  }
  .comp-price-row--gong .comp-price-row__fill { background: rgba(239, 68, 68, 0.12); width: 100%; color: rgba(239, 68, 68, 0.7); }
  .comp-price-row--modjo .comp-price-row__fill { background: rgba(148, 163, 184, 0.1); width: 40%; color: var(--muted); }
  .comp-price-row--leexi .comp-price-row__fill { background: rgba(148, 163, 184, 0.1); width: 26%; color: var(--muted); }
  .comp-price-row--noota .comp-price-row__fill { background: rgba(148, 163, 184, 0.1); width: 20%; color: var(--muted); }
  .comp-price-row--fireflies .comp-price-row__fill { background: rgba(148, 163, 184, 0.1); width: 12%; color: var(--muted); }
  .comp-price-row--otter .comp-price-row__fill { background: rgba(148, 163, 184, 0.1); width: 8%; color: var(--muted); }

  .comp-price-note {
    text-align: center;
    color: var(--faint);
    font-size: 0.82rem;
    margin-top: 20px;
    font-family: var(--mono);
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .comp-hero h1 { font-size: 2rem; }
    .comp-diff-grid { grid-template-columns: 1fr; }
    .comp-price-row__label { width: 65px; font-size: 0.68rem; }
  }
</style>
```

- [ ] **Step 1: Write the file**

Create `src/components/Comparatif.astro` with the exact content above.

- [ ] **Step 2: Commit**

```bash
cd /Users/lel/www/reedly-landing && git add src/components/Comparatif.astro && git commit -m "feat(comparatif): add Comparatif component with 4 sections"
```

---

### Task 3: Create the page and update Footer

**Files:**
- Create: `src/pages/comparatif.astro`
- Modify: `src/components/Footer.astro`

- [ ] **Step 1: Create the page**

Create `src/pages/comparatif.astro` with the exact content below. Note: `FinalCta` is imported to provide the CTA section AND the notify modal markup (required by main.js).

```astro
---
import Layout from '@/layouts/Layout.astro';
import Nav from '@/components/Nav.astro';
import Comparatif from '@/components/Comparatif.astro';
import FinalCta from '@/components/FinalCta.astro';
import Footer from '@/components/Footer.astro';
---

<Layout
  title="Reedly vs Gong, Noota, Modjo — Comparatif outils compte-rendu terrain"
  description="Comparez Reedly aux alternatives : Gong, Noota, Leexi, Modjo, Fireflies, Otter. Rapports structurés, vocabulaire métier, diarisation, synthèses. À partir de 69 €/mois."
>
  <div id="cursor-glow"></div>

  <Nav />

  <main class="z1">
    <Comparatif />
    <FinalCta />
  </main>

  <Footer />

  <script src="/main.js" is:inline></script>
</Layout>
```

- [ ] **Step 2: Add Comparatif link to Footer**

In `src/components/Footer.astro`, insert this line before the Contact link (before `<a href={contactHref} data-i18n="footer.contact">Contact</a>`):

```astro
      <a href="/comparatif" data-i18n="footer.comparatif" data-link-fr="/comparatif" data-link-en="/comparatif">Comparatif</a>
```

- [ ] **Step 3: Verify the page**

Run: `cd /Users/lel/www/reedly-landing && pnpm dev`
Check:
1. `http://localhost:4321/comparatif` — all 4 sections + FinalCta render
2. Language toggle (EN/FR) — all texts switch correctly
3. Mobile viewport — table scrolls, cards stack
4. Footer — "Comparatif" link appears
5. Store badges in FinalCta — clicking opens notify modal (no JS crash)
Stop the dev server.

- [ ] **Step 4: Commit**

```bash
cd /Users/lel/www/reedly-landing && git add src/pages/comparatif.astro src/components/Footer.astro && git commit -m "feat(comparatif): add /comparatif page and footer link"
```

---

### Task 4: Build verification

**Files:** None (verification only)

- [ ] **Step 1: Run production build**

Run: `cd /Users/lel/www/reedly-landing && pnpm build`
Expected: Build succeeds, `dist/comparatif/index.html` exists.

- [ ] **Step 2: Preview production build**

Run: `pnpm preview`
Check: `http://localhost:4321/comparatif` — renders correctly with production assets.
Stop the preview server.

- [ ] **Step 3: Final commit if fixes needed**

```bash
cd /Users/lel/www/reedly-landing && git add -A && git commit -m "fix(comparatif): fix build issues"
```
