# Landing → Hub Signup Conversion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Augmenter les comptes créés sur `hub.reedly.ai` depuis la landing en (1) renforçant le CTA et le contenu qui convainc, et (2) rendant le funnel landing → inscription mesurable.

**Architecture:** Landing Astro statique. On réaffiche des composants déjà codés (`Problem`, `How`, `Faq`), on ajoute une ligne de réassurance + un CTA secondaire au hero, une bande de confiance factuelle, et on partage l'ID anonyme PostHog entre `www.reedly.ai` et `hub.reedly.ai` (`cross_subdomain_cookie` + fallback `?ph_id=`). L'instrumentation du Hub (autre repo) est livrée sous forme de spec `.md`.

**Tech Stack:** Astro 6 (static), vanilla CSS (`src/styles/global.css`), i18n maison via dictionnaire dans `public/main.js`, PostHog (snippet `src/components/PostHog.astro`), pnpm.

## Testing approach (lire avant de commencer)

Ce repo **n'a aucune suite de tests automatisés**. Pour chaque tâche, le « test » est :
1. `pnpm build` se termine sans erreur.
2. Greps ciblés vérifiant la présence/forme du changement.
3. QA visuel final sur `pnpm dev` (http://localhost:4321), en basculant FR/EN et clair/sombre.

Ne pas inventer de framework de test. Suivre exactement les commandes de vérification de chaque tâche.

## Global Constraints

- **Parité bilingue FR/EN obligatoire** : tout changement de page/clé i18n doit exister dans les deux langues.
- **Aucun claim produit inventé** : n'utiliser que des affirmations déjà présentes dans la copy existante.
- **Imports en alias `@/...`** (jamais de relatif `../`).
- **Frontmatter Astro** : chaînes en quotes simples, point-virgules, indentation 2 espaces.
- **Ne pas casser le tracking existant** (`landing_cta_clicked`, `landing_section_viewed`, etc.).
- **pnpm** uniquement (pas npm).
- CTA primaire `trial` pointe vers `https://hub.reedly.ai` (parcours web self-serve — choix produit validé).
- `TRACKABLE_SECTIONS` contient déjà `problem`, `how`, `faq`, `contact` → **ne pas y toucher**.

---

### Task 1: Partage de l'ID anonyme PostHog entre sous-domaines

**Files:**
- Modify: `src/components/PostHog.astro` (appel `posthog.init`, ~lignes 64-69)

**Interfaces:**
- Produces: cookie d'ID anonyme PostHog posé sur `.reedly.ai` (consommé par le Hub, voir Task 6).

- [ ] **Step 1: Ajouter l'option `cross_subdomain_cookie`**

Dans `src/components/PostHog.astro`, remplacer l'appel `posthog.init(...)` :

```js
        posthog.init(posthogKey, {
          api_host: posthogHost,
          defaults: posthogDefaults,
          autocapture: false,
          capture_pageview: false,
          cross_subdomain_cookie: true,
        });
```

- [ ] **Step 2: Vérifier la présence**

Run: `grep -n "cross_subdomain_cookie" src/components/PostHog.astro`
Expected: 1 ligne affichée avec `cross_subdomain_cookie: true,`

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: build OK, aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add src/components/PostHog.astro
git commit -m "feat(analytics): share PostHog anon id across reedly.ai subdomains"
```

---

### Task 2: Transmettre le `distinct_id` au Hub via query-param (fallback cookies bloqués)

**Files:**
- Modify: `public/main.js` (handler `[data-track-id]`, ~lignes 1293-1308)

**Interfaces:**
- Consumes: `window.posthog.get_distinct_id()`.
- Produces: les liens CTA `trial` vers `hub.reedly.ai` portent `?ph_id=<distinct_id>` au moment du clic.

- [ ] **Step 1: Modifier le handler de clic CTA**

Dans `public/main.js`, remplacer le bloc `// ── CTA click tracking ──` existant par :

```js
// ── CTA click tracking ──
document.querySelectorAll("[data-track-id]").forEach((el) => {
  el.addEventListener("click", () => {
    const href = el.getAttribute("href") || "";
    let targetKind = "unknown";
    if (href.startsWith("#")) targetKind = "anchor";
    else if (href.startsWith("mailto:")) targetKind = "mailto";
    else if (href.startsWith("http")) targetKind = "external";

    // Cross-domain identity fallback: carry the PostHog distinct_id to the Hub
    try {
      const ph = window.posthog;
      if (
        el.dataset.trackType === "trial" &&
        href.indexOf("hub.reedly.ai") !== -1 &&
        href.indexOf("ph_id=") === -1 &&
        ph &&
        typeof ph.get_distinct_id === "function"
      ) {
        const did = ph.get_distinct_id();
        if (did) {
          const sep = href.indexOf("?") === -1 ? "?" : "&";
          el.setAttribute("href", href + sep + "ph_id=" + encodeURIComponent(did));
        }
      }
    } catch (e) {}

    trackEvent("landing_cta_clicked", {
      cta_id: el.dataset.trackId || "unknown",
      cta_type: el.dataset.trackType || "unknown",
      section_id: el.dataset.trackSection || "unknown",
      target_kind: targetKind,
    });
  });
});
```

- [ ] **Step 2: Vérifier la présence**

Run: `grep -n "ph_id=" public/main.js`
Expected: au moins 2 lignes (la condition `indexOf("ph_id=")` et la construction du lien).

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: build OK.

- [ ] **Step 4: Vérification manuelle (navigateur)**

Run: `pnpm dev` puis ouvrir http://localhost:4321/fr
Survoler/cliquer (clic droit → inspecter) le bouton « Essayer gratuitement » : après un clic, l'attribut `href` doit devenir `https://hub.reedly.ai?ph_id=...`.
Expected: `ph_id` présent dans le href du CTA trial.

- [ ] **Step 5: Commit**

```bash
git add public/main.js
git commit -m "feat(analytics): pass PostHog distinct_id to Hub on trial CTA click"
```

---

### Task 3: Hero — ligne de réassurance + CTA secondaire « Voir la démo »

**Files:**
- Modify: `src/components/Hero.astro` (bloc `hero__actions`, ~lignes 28-38)
- Modify: `public/main.js` (dictionnaire i18n FR et EN — ajout clé `hero.see_demo`)

**Interfaces:**
- Consumes: clés i18n existantes `cta.try_free`, `hero.trust1/2/3` ; classes CSS existantes `.btn--ghost`, `.hero__trust`, `.hero__trust-sep` ; section `#demo` (existe dans `Demo.astro`).
- Produces: nouvelle clé i18n `hero.see_demo` (FR + EN) ; CTA `data-track-id="hero_see_demo"` / `data-track-type="demo"`.

- [ ] **Step 1: Remplacer le bloc `hero__actions` dans `Hero.astro`**

Remplacer le `<div class="hero__actions">…</div>` existant par :

```astro
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
                data-i18n="hero.see_demo"
                data-track-id="hero_see_demo"
                data-track-type="demo"
                data-track-section="hero"
                >Voir la démo</a
              >
            </div>
            <div class="hero__trust">
              <span data-i18n="hero.trust1">Plan gratuit disponible</span>
              <span class="hero__trust-sep"></span>
              <span data-i18n="hero.trust2">Essai 7 jours sur les plans payants</span>
              <span class="hero__trust-sep"></span>
              <span data-i18n="hero.trust3">Sans engagement</span>
            </div>
```

- [ ] **Step 2: Ajouter la clé i18n FR**

Dans `public/main.js`, juste après la ligne `"hero.trust3": "Sans engagement",` (bloc FR), ajouter :

```js
    "hero.see_demo": "Voir la démo",
```

- [ ] **Step 3: Ajouter la clé i18n EN**

Dans `public/main.js`, juste après la ligne `"hero.trust3": "No commitment",` (bloc EN), ajouter :

```js
    "hero.see_demo": "Watch the demo",
```

- [ ] **Step 4: Vérifier**

Run: `grep -n "hero.see_demo" public/main.js`
Expected: 2 lignes (FR + EN).
Run: `pnpm build`
Expected: build OK.

- [ ] **Step 5: QA visuel**

Run: `pnpm dev` → http://localhost:4321/fr puis /en. Le hero montre 2 boutons (« Essayer gratuitement » plein + « Voir la démo » ghost) et une ligne de réassurance en 3 items. Cliquer « Voir la démo » scrolle vers la section démo.
Expected: rendu correct FR **et** EN.

- [ ] **Step 6: Commit**

```bash
git add src/components/Hero.astro public/main.js
git commit -m "feat(landing): add reassurance line and secondary demo CTA to hero"
```

---

### Task 4: Composant `TrustBar` — bande de confiance factuelle

**Files:**
- Create: `src/components/TrustBar.astro`
- Modify: `public/main.js` (i18n FR + EN — 4 clés `trustbar.*`)

**Interfaces:**
- Produces: composant `TrustBar` (importable via `@/components/TrustBar.astro`) ; clés i18n `trustbar.platforms`, `trustbar.accuracy`, `trustbar.privacy`, `trustbar.report` (FR + EN). Wiring dans les pages = Task 5.

- [ ] **Step 1: Créer `src/components/TrustBar.astro`**

```astro
---
// Trust bar — badges factuels (aucun claim inventé : tout est déjà dans la copy)
---

<section class="trustbar" aria-label="Points clés Reedly">
  <div class="inner trustbar__inner">
    <span class="trustbar__item" data-i18n="trustbar.platforms">iOS &amp; Android</span>
    <span class="trustbar__sep"></span>
    <span class="trustbar__item" data-i18n="trustbar.accuracy">Transcription +95 %</span>
    <span class="trustbar__sep"></span>
    <span class="trustbar__item" data-i18n="trustbar.privacy">Audio supprimé après génération</span>
    <span class="trustbar__sep"></span>
    <span class="trustbar__item" data-i18n="trustbar.report">Rapport en 11 sections · &lt; 2 min</span>
  </div>
</section>

<style>
  .trustbar {
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  .trustbar__inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding-top: 18px;
    padding-bottom: 18px;
  }
  .trustbar__item {
    font-family: var(--mono);
    font-size: 0.8rem;
    letter-spacing: 0.03em;
    color: var(--muted);
    white-space: nowrap;
  }
  .trustbar__sep {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--faint);
  }
  @media (max-width: 640px) {
    .trustbar__sep { display: none; }
    .trustbar__inner { gap: 10px 18px; }
  }
</style>
```

- [ ] **Step 2: Ajouter les clés i18n FR**

Dans `public/main.js`, juste après la ligne `"hero.see_demo": "Voir la démo",` (bloc FR), ajouter :

```js
    "trustbar.platforms": "iOS & Android",
    "trustbar.accuracy": "Transcription +95 %",
    "trustbar.privacy": "Audio supprimé après génération",
    "trustbar.report": "Rapport en 11 sections · < 2 min",
```

- [ ] **Step 3: Ajouter les clés i18n EN**

Dans `public/main.js`, juste après la ligne `"hero.see_demo": "Watch the demo",` (bloc EN), ajouter :

```js
    "trustbar.platforms": "iOS & Android",
    "trustbar.accuracy": "95%+ transcription accuracy",
    "trustbar.privacy": "Audio deleted after generation",
    "trustbar.report": "11-section report · under 2 min",
```

- [ ] **Step 4: Vérifier**

Run: `grep -cn "trustbar\." public/main.js`
Expected: 8 (4 FR + 4 EN).
Run: `pnpm build`
Expected: build OK.

- [ ] **Step 5: Commit**

```bash
git add src/components/TrustBar.astro public/main.js
git commit -m "feat(landing): add factual trust bar component + i18n"
```

---

### Task 5: Assembler les pages d'accueil (FR + EN) — ordre final + sections réaffichées

**Files:**
- Modify: `src/pages/fr/index.astro`
- Modify: `src/pages/en/index.astro`

**Interfaces:**
- Consumes: `TrustBar` (Task 4), composants existants `Problem`, `How`, `Faq`, `Demo`, `Proof`, `Integrations`, `Pricing`, `Contact`, `FinalCta`.

- [ ] **Step 1: Mettre à jour `src/pages/fr/index.astro`**

Ajouter l'import `TrustBar` et supprimer l'import inutilisé `Features`. La liste d'imports devient (remplacer le bloc d'imports existant) :

```astro
---
import Layout from '@/layouts/Layout.astro';
import Nav from '@/components/Nav.astro';
import Hero from '@/components/Hero.astro';
import TrustBar from '@/components/TrustBar.astro';
import Problem from '@/components/Problem.astro';
import How from '@/components/How.astro';
import Demo from '@/components/Demo.astro';
import Proof from '@/components/Proof.astro';
import Integrations from '@/components/Integrations.astro';
import Pricing from '@/components/Pricing.astro';
import Contact from '@/components/Contact.astro';
import Faq from '@/components/Faq.astro';
import FinalCta from '@/components/FinalCta.astro';
import Footer from '@/components/Footer.astro';
---
```

Puis remplacer le `<main class="z1">…</main>` par :

```astro
  <main class="z1">
    <Hero />
    <TrustBar />
    <Problem />
    <How />
    <Demo />
    <Proof />
    <Integrations />
    <Pricing />
    <Faq />
    <Contact />
    <FinalCta />
  </main>
```

- [ ] **Step 2: Mettre à jour `src/pages/en/index.astro`**

Appliquer exactement les mêmes deux changements (mêmes imports, même `<main>`) que pour la page FR. **Ne pas** modifier les props du `<Layout ...>` (title/description/lang EN restent inchangés).

- [ ] **Step 3: Vérifier la parité**

Run: `grep -nE "<TrustBar|<Problem|<How|<Faq" src/pages/fr/index.astro src/pages/en/index.astro`
Expected: les 4 composants présents dans **les deux** fichiers.
Run: `grep -n "import Features" src/pages/fr/index.astro src/pages/en/index.astro`
Expected: aucune ligne (import retiré).

- [ ] **Step 4: Build**

Run: `pnpm build`
Expected: build OK.

- [ ] **Step 5: QA visuel FR + EN**

Run: `pnpm dev` → parcourir http://localhost:4321/fr et /en de haut en bas.
Expected: ordre `Hero → TrustBar → Problème → Comment ça marche → Démo → Résultats → Intégrations → Tarifs → FAQ → Contact → CTA final`. FAQ : l'accordéon s'ouvre/ferme au clic.

- [ ] **Step 6: Commit**

```bash
git add src/pages/fr/index.astro src/pages/en/index.astro
git commit -m "feat(landing): restore Problem/How/FAQ + trust bar in conversion-optimized order"
```

---

### Task 6: Livrable — spec d'instrumentation PostHog du Hub

**Files:**
- Create: `docs/hub-posthog-instrumentation.md`

**Interfaces:**
- Consumes: `cross_subdomain_cookie` (Task 1) et `?ph_id=` (Task 2) côté landing.
- Produces: document à remettre au dev du Hub. Aucun code de ce repo.

- [ ] **Step 1: Créer `docs/hub-posthog-instrumentation.md`**

```markdown
# Instrumentation PostHog du Hub (hub.reedly.ai)

But : rendre mesurable le funnel `landing → inscription`, en reliant le visiteur
anonyme de la landing à son inscription sur le Hub.

Funnel cible (même projet PostHog que la landing) :
`landing_page_viewed → landing_cta_clicked (cta_type=trial) → signup_started → signup_completed`

## 1. Initialisation posthog-js

Utiliser **la même clé projet** et le même host que la landing (`PUBLIC_POSTHOG_KEY`,
`PUBLIC_POSTHOG_HOST`). Points impératifs :

- `cross_subdomain_cookie: true` → partage du cookie d'ID anonyme sur `.reedly.ai`
  (la landing pose déjà ce cookie). Sans ça, l'identité ne se relie pas.
- **Ne pas** appeler `posthog.reset()` au chargement de la page (cela couperait
  le lien avec l'anonyme venu de la landing).

```js
posthog.init(POSTHOG_KEY, {
  api_host: POSTHOG_HOST,
  cross_subdomain_cookie: true,
  // autocapture / capture_pageview : selon votre préférence
});
```

## 2. Filet de sécurité `?ph_id=` (cookies tiers bloqués)

La landing ajoute `?ph_id=<distinct_id>` au lien vers le Hub. Au chargement,
si ce paramètre est présent et diffère de l'ID courant, rattacher l'identité :

```js
const params = new URLSearchParams(window.location.search);
const phId = params.get("ph_id");
if (phId && posthog.get_distinct_id() !== phId) {
  posthog.identify(phId);
}
```

## 3. Événements à émettre

- `signup_started` — affichage de la page/formulaire d'inscription.
  Propriétés suggérées : `{ method_options: ["google","email",...], $referrer }`.
- `signup_completed` — compte créé avec succès. Puis identifier l'utilisateur :

```js
posthog.capture("signup_started", { method_options: methods });
// ... après création réussie du compte :
posthog.capture("signup_completed", { auth_method: method, plan: planId });
posthog.identify(user.id, { email: user.email });
```

- (optionnel) `signup_failed` avec `{ reason }`.

## 4. Vérification

Dans PostHog, créer un funnel sur les 4 étapes ci-dessus et confirmer que des
sessions passent de `landing_cta_clicked (cta_type=trial)` à `signup_started`
(même `distinct_id`).
```

- [ ] **Step 2: Vérifier**

Run: `test -f docs/hub-posthog-instrumentation.md && echo OK`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add docs/hub-posthog-instrumentation.md
git commit -m "docs: PostHog instrumentation spec for the Hub signup funnel"
```

---

### Task 7: QA finale + build de production

**Files:** aucun (vérification).

- [ ] **Step 1: Build propre**

Run: `pnpm build`
Expected: build OK, aucun warning bloquant.

- [ ] **Step 2: Parité FR/EN finale**

Run: `grep -cE "<TrustBar|<Problem|<How|<Faq" src/pages/fr/index.astro` puis idem pour `en`.
Expected: même nombre (4) dans les deux.

- [ ] **Step 3: QA visuel clair/sombre, FR/EN**

Run: `pnpm dev`. Vérifier sur /fr et /en, thèmes clair et sombre :
- hero : 2 CTA + ligne de réassurance ;
- TrustBar lisible (les séparateurs disparaissent en mobile <640px) ;
- ordre des sections correct ; FAQ fonctionnelle.
Expected: aucun défaut visuel, pas de texte non traduit (pas de clé brute affichée).

- [ ] **Step 4: (post-merge, hors repo) créer le funnel PostHog**

Une fois la spec Hub implémentée par le dev, créer dans PostHog un funnel
`landing_page_viewed → landing_cta_clicked (cta_type=trial) → signup_started → signup_completed`
pour suivre la métrique nord.

---

## Self-review (couverture spec)

- Spec §4.1 CTA + réassurance → Task 3. ✓
- Spec §4.2 réafficher Problem/How/FAQ + ordre → Task 5. ✓
- Spec §4.3 bande de confiance factuelle → Task 4 (+ wiring Task 5). ✓
- Spec §4.4 `cross_subdomain_cookie` → Task 1 ; `?ph_id=` → Task 2. ✓
- Spec §5 spec Hub → Task 6. ✓
- Spec §6 plan de mesure → Task 7 Step 4. ✓
- Spec §7 critères d'acceptation → couverts (faq déjà dans TRACKABLE_SECTIONS, donc pas de tâche dédiée). ✓
- Spec §8 incohérence copy FAQ a5 ↔ parcours Hub → **non traité ici** (décision copy laissée à l'arbitrage produit ; ne bloque pas la livraison). À trancher séparément.
