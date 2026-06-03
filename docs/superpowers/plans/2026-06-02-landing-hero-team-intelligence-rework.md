# Landing Hero & Team-Intelligence Rework — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Hero's solo-recording phone mockup and manager-only copy with a dual-persona "team loop → Hub" hero, plus a light consistency sweep, in full FR/EN parity.

**Architecture:** Static Astro site. Copy lives in a JS dictionary (`public/main.js`, `T.fr`/`T.en`) injected at runtime via `data-i18n`/`data-i18n-html` attributes. Hero structure lives in `src/components/Hero.astro`; styles in `src/styles/global.css` (theme-variable driven, dark + light). No unit-test framework — verification is `pnpm build` + grep + visual check on `/fr` and `/en`.

**Tech Stack:** Astro 6, vanilla CSS (theme variables), vanilla JS i18n, pnpm.

**Spec:** `docs/superpowers/specs/2026-06-02-landing-hero-team-intelligence-rework-design.md`

---

### Task 1: Branch + housekeeping

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Create a feature branch**

Run:
```bash
cd /Users/lel/www/reedly-landing
git checkout -b feat/hero-team-intelligence
```

- [ ] **Step 2: Ignore the brainstorm scratch dir**

Append to `.gitignore` (only if `.superpowers/` is not already ignored):
```
.superpowers/
```

- [ ] **Step 3: Commit the spec + plan + gitignore**

Run:
```bash
git add .gitignore docs/superpowers/specs/2026-06-02-landing-hero-team-intelligence-rework-design.md docs/superpowers/plans/2026-06-02-landing-hero-team-intelligence-rework.md
git commit -m "docs(landing): hero team-intelligence rework spec + plan"
```

---

### Task 2: i18n dictionary (`public/main.js`) — FR + EN

**Files:**
- Modify: `public/main.js` (the `T.fr` and `T.en` objects)

> Project rule: every key must change in BOTH `T.fr` and `T.en` in the same commit.

- [ ] **Step 1: Modify existing keys in `T.fr`**

Set these values:
```js
"hero.pill": "Mobile pour le terrain · Hub pour le pilotage",
"hero.title": "Ne perdez plus jamais<br /><em>ce qui se dit en rendez-vous client.</em>",
"hero.sub": "Vos commerciaux enregistrent leurs visites — Reedly les transforme en rapports structurés et fait remonter engagements, opportunités et risques dans un Hub centralisé. Zéro saisie pour le terrain, vision complète pour le pilotage.",
"demo.lead": "Du rendez-vous client au rapport structuré remonté dans le Hub, découvrez l'expérience complète en quelques secondes.",
```

- [ ] **Step 2: Add new keys to `T.fr`** (place near the other `hero.*` keys)

```js
"hero.cta_demo": "Voir une démo",
"hero.flow.capture_t": "Le commercial capte",
"hero.flow.capture_d": "Visite enregistrée, mains libres",
"hero.flow.tag_rep": "Commercial",
"hero.flow.report_t": "Rapport structuré",
"hero.flow.report_d": "11 sections · en moins de 2 min",
"hero.flow.hub_t": "Hub · Vue équipe",
"hero.flow.tag_mgr": "Manager",
"hero.hub.m1": "↑ 2 engagements",
"hero.hub.m2": "↑ opportunité",
"hero.hub.m3": "⚠ risque",
"hero.hub.m4": "1 relance",
"hero.definition": "Reedly est une solution d'intelligence commerciale pour les équipes de vente terrain B2B. Une application mobile iOS et Android enregistre les rendez-vous clients et génère automatiquement un rapport structuré en 11 sections en moins de 2 minutes (résumé, besoins, objections, engagements, prochaines étapes, opportunités, risques, recommandations). Les rapports de toute l'équipe remontent dans un Hub web où les managers consultent les synthèses territoriales et l'activité agrégée. L'audio est supprimé après génération du rapport.",
```

- [ ] **Step 3: Remove obsolete phone-mockup keys from `T.fr`**

Delete these lines: `hero.rec_label`, `hero.recording_status`, `hero.report_float`, `hero.float.s1`, `hero.float.s2`, `hero.float.s3`, `hero.float.s4`. (Keep `hero.offline`.)

- [ ] **Step 4: Mirror Steps 1–3 in `T.en`**

Modify:
```js
"hero.pill": "Mobile for the field · Hub for oversight",
"hero.title": "Never lose<br /><em>what's said in a client meeting.</em>",
"hero.sub": "Your reps record their visits — Reedly turns them into structured reports and surfaces commitments, opportunities and risks in a centralized Hub. Zero data entry for the field, full visibility for management.",
"demo.lead": "From client meeting to structured report in the Hub, see the full experience in seconds.",
```
Add:
```js
"hero.cta_demo": "Watch a demo",
"hero.flow.capture_t": "The rep captures",
"hero.flow.capture_d": "Meeting recorded, hands-free",
"hero.flow.tag_rep": "Rep",
"hero.flow.report_t": "Structured report",
"hero.flow.report_d": "11 sections · in under 2 min",
"hero.flow.hub_t": "Hub · Team view",
"hero.flow.tag_mgr": "Manager",
"hero.hub.m1": "↑ 2 commitments",
"hero.hub.m2": "↑ opportunity",
"hero.hub.m3": "⚠ risk",
"hero.hub.m4": "1 follow-up",
"hero.definition": "Reedly is a sales-intelligence solution for B2B field-sales teams. An iOS and Android mobile app records client meetings and automatically generates a structured 11-section report in under 2 minutes (summary, needs, objections, commitments, next steps, opportunities, risks, recommendations). Every team member's reports flow into a web Hub where managers review territory syntheses and aggregated activity. Audio is deleted after the report is generated.",
```
Remove the same obsolete keys from `T.en`.

- [ ] **Step 5: Verify both languages have the new keys and none of the old**

Run:
```bash
cd /Users/lel/www/reedly-landing
grep -c "hero.flow.hub_t" public/main.js          # expect 2 (fr + en)
grep -c "hero.definition" public/main.js          # expect 2
grep -c "hero.recording_status" public/main.js    # expect 0
grep -c "hero.float.s1" public/main.js            # expect 0
node -e "import('./public/main.js').catch(()=>{}); console.log('parse ok')" 2>/dev/null || node --check public/main.js && echo "syntax ok"
```
Expected: counts `2,2,0,0` and `syntax ok` (no JS syntax error).

- [ ] **Step 6: Commit**

```bash
git add public/main.js
git commit -m "feat(landing): hero + demo copy → team-intelligence angle (fr/en)"
```

---

### Task 3: Hero markup (`src/components/Hero.astro`)

**Files:**
- Modify: `src/components/Hero.astro` (CTA block ≈ lines 35–45; phone mockup block ≈ lines 51–141; sr-only definition ≈ lines 22–34)

- [ ] **Step 1: Add the secondary "Voir une démo" CTA**

Replace the `hero__actions` block:
```html
            <div class="hero__actions">
              <a
                class="btn btn--primary btn--lg"
                href="https://hub.reedly.ai"
                data-i18n="cta.try_free"
                data-track-id="hero_try_free"
                data-track-type="trial"
                data-track-section="hero"
                >Essayer gratuitement</a
              >
              <a
                class="btn btn--ghost btn--lg"
                href="#demo"
                data-i18n="hero.cta_demo"
                data-track-id="hero_watch_demo"
                data-track-section="hero"
                >Voir une démo</a
              >
            </div>
```

- [ ] **Step 2: Make the hidden SEO definition translatable**

Change the opening tag of the `hero__definition` paragraph from `<p class="hero__definition sr-only">` to:
```html
            <p class="hero__definition sr-only" data-i18n-html="hero.definition">
```
(Leave the existing FR text inside as a fallback; the runtime overwrites it.)

- [ ] **Step 3: Replace the phone mockup with the team-loop → Hub visual**

Delete the entire `<!-- Phone mockup -->` block (the `<div class="phone-wrap reveal">…</div>` including the floating report card, ≈ lines 51–141) and replace with:
```html
          <!-- Team loop → Hub visual -->
          <div class="hero-flow reveal">
            <div class="hero-flow__glow"></div>

            <div class="flow-chip">
              <div class="flow-chip__ic">🎙️</div>
              <div class="flow-chip__txt">
                <div class="flow-chip__t" data-i18n="hero.flow.capture_t">Le commercial capte</div>
                <div class="flow-chip__d" data-i18n="hero.flow.capture_d">Visite enregistrée, mains libres</div>
              </div>
              <span class="flow-tag flow-tag--rep" data-i18n="hero.flow.tag_rep">Commercial</span>
            </div>

            <div class="flow-arrow" aria-hidden="true">↓</div>

            <div class="flow-chip">
              <div class="flow-chip__ic">📄</div>
              <div class="flow-chip__txt">
                <div class="flow-chip__t" data-i18n="hero.flow.report_t">Rapport structuré</div>
                <div class="flow-chip__d" data-i18n="hero.flow.report_d">11 sections · en moins de 2 min</div>
              </div>
            </div>

            <div class="flow-arrow" aria-hidden="true">↓</div>

            <div class="flow-hub">
              <div class="flow-hub__head">
                <span class="flow-hub__vt" data-i18n="hero.flow.hub_t">Hub · Vue équipe</span>
                <span class="flow-tag flow-tag--mgr" data-i18n="hero.flow.tag_mgr">Manager</span>
              </div>
              <div class="flow-hub__cards">
                <div class="flow-hc"><div class="flow-hc__n">Agence Soleil</div><div class="flow-hc__m flow-hc__m--up" data-i18n="hero.hub.m1">↑ 2 engagements</div></div>
                <div class="flow-hc"><div class="flow-hc__n">TO Évasion</div><div class="flow-hc__m flow-hc__m--up" data-i18n="hero.hub.m2">↑ opportunité</div></div>
                <div class="flow-hc"><div class="flow-hc__n">Réceptif Sud</div><div class="flow-hc__m flow-hc__m--warn" data-i18n="hero.hub.m3">⚠ risque</div></div>
                <div class="flow-hc"><div class="flow-hc__n">Voyages Lina</div><div class="flow-hc__m flow-hc__m--neu" data-i18n="hero.hub.m4">1 relance</div></div>
              </div>
              <div class="flow-hub__bars" aria-hidden="true">
                <span style="height:45%"></span><span style="height:70%"></span><span style="height:55%"></span><span style="height:85%"></span><span style="height:65%"></span><span style="height:95%"></span><span style="height:72%"></span>
              </div>
            </div>
          </div>
```

- [ ] **Step 4: Confirm no phone-mockup markup remains**

Run:
```bash
cd /Users/lel/www/reedly-landing
grep -nE "phone|wave-bar|report-float" src/components/Hero.astro
```
Expected: **no output** (all phone markup removed).

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.astro
git commit -m "feat(landing): hero visual → team loop+hub, add demo CTA, i18n SEO definition"
```

---

### Task 4: Hero styles (`src/styles/global.css`)

**Files:**
- Modify: `src/styles/global.css` (remove phone CSS ≈ lines 521–798: `.phone-wrap`, `.phone*`, `.wave-bar`, `wave-anim`, `.phone__report-float*`, `.phone-glow`; add new hero-flow CSS)

- [ ] **Step 1: Delete the phone-mockup CSS block**

Remove all rules for: `.phone-wrap`, `.phone`, `.phone__notch`, `.phone__notch-pill`, `.phone__topbar`, `.phone__close-icon`, `.phone__topbar-title`, `.phone__topbar-spacer`, `.phone__body`, `.phone__recording-status`, `.phone__big-timer`, `.phone__waveform`, `.wave-bar`, `@keyframes wave-anim`, `.phone__controls`, `.phone__ctrl*`, `.phone__report-float*`, `.phone-glow` (the contiguous block ≈ lines 521–798). Leave `.hero`, `.hero__*`, and `.ticker*` untouched.

- [ ] **Step 2: Add the team-loop → Hub CSS** (insert where the phone CSS was, using theme variables so it works in dark + light)

```css
/* ── Hero team-loop → Hub visual ── */
.hero-flow { position: relative; display: flex; flex-direction: column; gap: 9px; justify-self: end; width: 100%; max-width: 380px; }
.hero-flow__glow { position: absolute; inset: -12% -18% auto auto; width: 280px; height: 280px; border-radius: 50%; background: radial-gradient(circle, var(--green-glow), transparent 70%); z-index: -1; pointer-events: none; }
.flow-chip { display: flex; align-items: center; gap: 11px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; }
.flow-chip__ic { width: 32px; height: 32px; border-radius: 8px; background: var(--surface2); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.flow-chip__t { font-size: 13.5px; color: var(--text); font-weight: 600; }
.flow-chip__d { font-size: 11.5px; color: var(--muted); margin-top: 1px; }
.flow-tag { margin-left: auto; font-size: 10px; font-weight: 600; letter-spacing: .03em; padding: 3px 9px; border-radius: 999px; white-space: nowrap; }
.flow-tag--rep { color: var(--green); background: var(--green-glow); }
.flow-tag--mgr { color: var(--info); background: rgba(66, 165, 245, .14); }
.flow-arrow { text-align: center; color: var(--faint); font-size: 14px; line-height: .7; }
.flow-hub { background: var(--surface); border: 1px solid var(--border-bright); border-radius: 13px; padding: 14px; box-shadow: 0 0 0 1px var(--green-glow); }
.flow-hub__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.flow-hub__vt { font-size: 10.5px; color: var(--muted); text-transform: uppercase; letter-spacing: .09em; }
.flow-hub__cards { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
.flow-hc { background: var(--bg); border: 1px solid var(--border); border-radius: 9px; padding: 8px 10px; }
.flow-hc__n { font-size: 11.5px; color: var(--text); font-weight: 600; }
.flow-hc__m { font-size: 10px; margin-top: 2px; }
.flow-hc__m--up { color: var(--green); }
.flow-hc__m--warn { color: var(--amber); }
.flow-hc__m--neu { color: var(--muted); }
.flow-hub__bars { display: flex; align-items: flex-end; gap: 5px; height: 32px; margin-top: 10px; }
.flow-hub__bars span { flex: 1; background: var(--green-dim); opacity: .5; border-radius: 2px 2px 0 0; }

@media (max-width: 720px) {
  .hero-flow { max-width: 420px; margin: 0 auto; justify-self: center; }
  .flow-hub__bars { display: none; }
}
```

- [ ] **Step 3: Confirm no phone CSS remains**

Run:
```bash
cd /Users/lel/www/reedly-landing
grep -nE "\.phone|wave-bar|wave-anim" src/styles/global.css
```
Expected: **no output**.

- [ ] **Step 4: Build to verify CSS/markup compile**

Run:
```bash
pnpm build
```
Expected: build succeeds, no errors.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css
git commit -m "style(landing): remove phone mockup CSS, add team loop+hub hero visual"
```

---

### Task 5: Visual QA (FR + EN, dark + light, responsive)

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run:
```bash
cd /Users/lel/www/reedly-landing
pnpm dev
```
Open http://localhost:4321/fr and http://localhost:4321/en.

- [ ] **Step 2: Hero checklist (both languages)**

Verify on `/fr` and `/en`:
- Pill, title, subtitle show the new copy in the right language.
- The phone mockup is gone; the team-loop → Hub visual shows `capture → report → Hub` with the **green "Commercial/Rep"** tag and **blue "Manager"** tag.
- The "Voir une démo / Watch a demo" button appears next to "Essayer gratuitement / Try for free" and scrolls to the demo section.
- No raw i18n keys leak (no literal `hero.flow.hub_t` text on screen).

- [ ] **Step 3: Theme + responsive**

- Toggle light/dark theme — the loop/Hub visual stays legible in both (it uses theme variables).
- Narrow the window to mobile width — the visual stacks/centers, the synthesis bars hide, no horizontal overflow.

- [ ] **Step 4: Final build + push**

Run:
```bash
pnpm build
git push -u origin feat/hero-team-intelligence
```

- [ ] **Step 5: Open PR (when ready)**

Create a PR from `feat/hero-team-intelligence` describing the hero rework and the team-intelligence repositioning.

---

## Self-review notes

- **Spec coverage:** Hero copy (§5.1) → Task 2 + 3; hero visual (§5.2/5.3) → Task 3 + 4; removed keys (§5.4) → Task 2.3/2.4; SEO definition (§5.5) → Task 2 + 3.2; Demo sweep (§6) → Task 2.1/2.4; "keep" sections → no task (intentional). Bilingual (§7) → Task 2 changes both `T.fr`/`T.en` in one commit. Verification (§8) → Task 5. ✓
- **Ticker:** spec §6 says reviewed, no change — intentionally no task.
- **`.btn--ghost`** already exists in `global.css` (line 417, with light-theme variant) — reused, not redefined.
- **`#demo` anchor** already exists on the Demo `<section id="demo">` — secondary CTA target valid.
