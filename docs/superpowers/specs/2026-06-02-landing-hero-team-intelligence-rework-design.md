# Landing rework — Hero & team-intelligence repositioning

**Date:** 2026-06-02
**Project:** `reedly-landing` (Astro 6, bilingual FR/EN)
**Status:** Design approved — pending spec review

---

## 1. Context & problem

A competitive review against **Plaud** (an app-first AI note-taker, ~19–35€/mo, no team layer) showed that Reedly must **not** compete on the transcription/recording layer — that is now a cheap commodity Plaud does well. Reedly's only durable moat is the **team dimension**: structured field reports aggregated into a **manager cockpit (Hub)** with CRM push. The landing must therefore present Reedly as **"the system of intelligence for a field-sales team" — not a note-taker**.

Audit of the current homepage found it is **already ~80% aligned** to the team/manager angle (Proof, Integrations, Pricing, FinalCta, Ticker all lean team/Hub). The single real contradiction is the **Hero**:

- The **pill** (`hero.pill`) addressed managers only (*"Pour les directions commerciales"*) — excludes the rep.
- The **visual** is a phone mockup of a **solo recording in progress** — exactly the "individual note-taker" framing we must leave behind, and it contradicts the manager-oriented copy beside it.
- The **title** was manager-POV (*"Voyez ce qui se passe sur le terrain"*).

## 2. Goals

1. Rework the Hero so it speaks to **both personas (field rep + manager) as one team tool**, with no persona feeling surveilled or sidelined.
2. Replace the solo-recording phone mockup with a visual that **proves the collective value** (the rep→report→Hub loop) — the thing Plaud has not got.
3. Keep transcription/recording as **invisible plumbing**, never a headline argument.
4. Light consistency sweep on the rest of the page (no rewriting what already works).
5. Maintain **full FR/EN symmetry**.

## 3. Non-goals

- No visual redesign of the site's design language (reuse existing dark theme + forest green `#16A34A`).
- No rewrite of already-aligned sections (Proof, Integrations, Pricing, Contact, FinalCta) — reviewed and kept.
- No new pricing/competitor/comparison content in this pass.
- The individual/solo use case is **not** a target — no copy defending it.

## 4. Key copywriting principle (locked)

**The title carries the PROMISE, the subtitle carries the MECHANISM.**
The chosen title deliberately does not say what the tool *does* — a rep projects onto it ("my meetings"), a manager projects onto it ("the info I want back"), without naming either. The subtitle then explains the *how* and absorbs the concrete dual-persona gains ("zero data entry / full visibility").

## 5. Hero design (the core change)

### 5.1 Copy (locked) — FR + EN

| Key | FR | EN |
|---|---|---|
| `hero.pill` | `Mobile pour le terrain · Hub pour le pilotage` | `Mobile for the field · Hub for oversight` |
| `hero.title` | `Ne perdez plus jamais<br /><em>ce qui se dit en rendez-vous client.</em>` | `Never lose<br /><em>what's said in a client meeting.</em>` |
| `hero.sub` | `Vos commerciaux enregistrent leurs visites — Reedly les transforme en rapports structurés et fait remonter engagements, opportunités et risques dans un Hub centralisé. Zéro saisie pour le terrain, vision complète pour le pilotage.` | `Your reps record their visits — Reedly turns them into structured reports and surfaces commitments, opportunities and risks in a centralized Hub. Zero data entry for the field, full visibility for management.` |
| `cta.try_free` (existing — **unchanged**, keep current FR/EN values) | `Essayer gratuitement` | _(existing value)_ |
| `hero.cta_demo` (new) | `Voir une démo` | `Watch a demo` (anchors to `#demo`) |

### 5.2 Visual — replace phone mockup with the "team loop → Hub"

Right column of the hero grid. Vertical flow, top→bottom, that ends in a Hub preview (the payoff). Each end tagged so both personas are visible:

```
┌─────────────────────────────────────┐
│ 🎙️  Le commercial capte    [Commercial]│  ← green tag (rep)
│     Visite enregistrée, mains libres │
│              ↓                        │
│ 📄  Rapport structuré                 │
│     11 sections · en moins de 2 min   │
│              ↓                        │
│ ┌── Hub · Vue équipe ──── [Manager]──┐│  ← blue tag (manager)
│ │ Agence Soleil   ↑ 2 engagements    ││
│ │ TO Évasion      ↑ opportunité      ││
│ │ Réceptif Sud    ⚠ risque           ││
│ │ Voyages Lina    1 relance          ││
│ │ ▁▃▂▅▃▆▄  (synthèse)                ││
│ └────────────────────────────────────┘│
└─────────────────────────────────────┘
```

Validated as mockup in the brainstorm session (`.superpowers/brainstorm/.../hero-final-v1.html`).

### 5.3 New i18n keys for the visual — FR + EN

| Key | FR | EN |
|---|---|---|
| `hero.flow.capture_t` | `Le commercial capte` | `The rep captures` |
| `hero.flow.capture_d` | `Visite enregistrée, mains libres` | `Meeting recorded, hands-free` |
| `hero.flow.tag_rep` | `Commercial` | `Rep` |
| `hero.flow.report_t` | `Rapport structuré` | `Structured report` |
| `hero.flow.report_d` | `11 sections · en moins de 2 min` | `11 sections · in under 2 min` |
| `hero.flow.hub_t` | `Hub · Vue équipe` | `Hub · Team view` |
| `hero.flow.tag_mgr` | `Manager` | `Manager` |
| `hero.hub.m1` | `↑ 2 engagements` | `↑ 2 commitments` |
| `hero.hub.m2` | `↑ opportunité` | `↑ opportunity` |
| `hero.hub.m3` | `⚠ risque` | `⚠ risk` |
| `hero.hub.m4` | `1 relance` | `1 follow-up` |

Client card names (`Agence Soleil`, `TO Évasion`, `Réceptif Sud`, `Voyages Lina`) are illustrative proper nouns — hardcoded, identical in both languages (tourism MVP flavor).

### 5.4 i18n keys to REMOVE (obsolete phone mockup)

`hero.rec_label`, `hero.recording_status`, `hero.report_float`, `hero.float.s1`, `hero.float.s2`, `hero.float.s3`, `hero.float.s4` — in both `T.fr` and `T.en`. Keep `hero.offline` (offline banner is independent).

### 5.5 Hidden SEO/a11y definition

The `sr-only` `hero__definition` block in `Hero.astro` is currently **literal FR text** (no i18n) describing Reedly as *"application mobile … d'enregistrement vocal"*. Convert it to `data-i18n-html="hero.definition"` and add a FR + EN value that keeps SEO depth but leads with the **team/Hub** framing:

- FR: `Reedly est une solution d'intelligence commerciale pour les équipes de vente terrain B2B. Une application mobile iOS et Android enregistre les rendez-vous clients et génère automatiquement un rapport structuré en 11 sections en moins de 2 minutes (résumé, besoins, objections, engagements, prochaines étapes, opportunités, risques, recommandations). Les rapports de toute l'équipe remontent dans un Hub web où les managers consultent les synthèses territoriales et l'activité agrégée. L'audio est supprimé après génération du rapport.`
- EN: `Reedly is a sales-intelligence solution for B2B field-sales teams. An iOS and Android mobile app records client meetings and automatically generates a structured 11-section report in under 2 minutes (summary, needs, objections, commitments, next steps, opportunities, risks, recommendations). Every team member's reports flow into a web Hub where managers review territory syntheses and aggregated activity. Audio is deleted after the report is generated.`

## 6. Light sweep on the rest (FR + EN)

| Section | Change | New FR (key) |
|---|---|---|
| **Demo** | De-headline "enregistrement" in `demo.lead` | `Du rendez-vous client au rapport structuré remonté dans le Hub, découvrez l'expérience complète en quelques secondes.` (EN: `From client meeting to structured report in the Hub, see the full experience in seconds.`) |
| **Ticker** | Reviewed `ticker.1`–`ticker.8` — already team/Hub aligned. **No change** (avoid busywork). | — |
| **Proof / Integrations / Pricing / Contact / FinalCta** | Reviewed — already on-message. **No change.** | — |

## 7. Implementation surface

- **`src/components/Hero.astro`** — replace the phone-mockup block (≈ lines 51–141) with the team-loop→Hub markup using `data-i18n` keys; update the pill; add secondary "Voir une démo" CTA; convert `hero__definition` to `data-i18n-html`.
- **`src/styles/global.css`** — remove phone-mockup CSS (≈ lines 521–798: `.phone*`, `.wave-bar`, `.phone-glow`, `.phone__report-float*`); add `.hero-flow`, `.flow-chip`, `.flow-hub`, tags, synthesis bars CSS, reusing existing theme variables and `#16A34A`. Keep `.hero`, `.hero__*`, `.ticker*` intact (right-column content swap only).
- **`public/main.js`** — in `T.fr` and `T.en`: modify `hero.pill`/`hero.title`/`hero.sub`/`demo.lead`; add the new `hero.flow.*`, `hero.hub.*`, `hero.cta_demo`, `hero.definition` keys; remove obsolete `hero.rec_label`/`hero.recording_status`/`hero.report_float`/`hero.float.*`.
- **EN parity** — `en/index.astro` and `fr/index.astro` render the same components in the same order; all changes are driven by the shared `main.js` dictionary + the shared `Hero.astro`, so EN follows automatically. Verify EN renders post-change.

## 8. Verification

1. `pnpm dev` (http://localhost:4321) — visually check `/fr` and `/en` heroes: new visual, no phone mockup, both persona tags visible, pill/title/sub correct per language.
2. Toggle language — confirm every new/changed key resolves in both FR and EN (no raw `hero.flow.*` keys leaking, no missing-key fallbacks).
3. Confirm no orphaned references to removed keys remain in `Hero.astro`.
4. `pnpm build` succeeds.
5. Quick responsive check (the right-column visual must stack/degrade gracefully on mobile like the phone mockup did).

## 9. Risks / watch-outs

- **Flicage (surveillance) tone** — the manager framing must read as "team clarity," never "spy on reps." The hero copy uses *"votre équipe"* / *"le pilotage"*, not *"surveillez vos commerciaux"*. Keep this guardrail in any future copy.
- **Bilingual drift** — every key touched must be changed in BOTH `T.fr` and `T.en` in the same commit (project rule).
- **Mobile layout** — the loop→Hub visual is taller than wide; verify it doesn't blow up the mobile hero height; consider hiding the Hub card detail (keep the 3-step flow) below a breakpoint if needed.
