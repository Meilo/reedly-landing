# Design — Conversion de la landing vers l'inscription Hub (Approche A)

**Date :** 2026-06-22
**Auteur :** Ludovic + Claude
**Statut :** En attente de revue

## 1. Contexte & objectif

« Conversion » = **création d'un compte sur la plateforme web `hub.reedly.ai`** (self-serve), pas l'abonnement. On veut qu'un maximum de visiteurs de la landing aillent jusqu'à créer leur compte.

**Métrique nord — le funnel complet (à rendre mesurable) :**

```
landing_page_viewed → landing_cta_clicked (cta_type=trial) → signup_started → signup_completed
```

Les deux dernières étapes n'existent pas encore (le Hub n'est pas instrumenté). La métrique actionnable **dès maintenant** : le taux de clic sur le CTA trial.

## 2. Diagnostic (PostHog, 90 derniers jours)

| Étape | Utilisateurs uniques |
|---|---|
| Visiteurs landing (`landing_page_viewed`) | 591 |
| Clic CTA « Essayer gratuitement » (`cta_type=trial`) | 12 (~2 %) |
| `auth_prompt_opened` (100 % **mobile**) | 47 |
| 1er enregistrement | 11 |
| 1er rapport généré | 9 |

Constats clés :
1. **Le Hub web n'envoie AUCUN événement à PostHog** (hôtes vus : `www.reedly.ai` 3341, `localhost`/preview 341, mobile 19 323, `hub.reedly.ai` **0**). La conversion qu'on veut améliorer est un angle mort total.
2. **CTA principal à ~2 %** : 12 clics / 591 visiteurs sur 6 emplacements de CTA.
3. **Le message parle au manager**, mais c'est l'utilisateur qui doit s'inscrire ; aucune réassurance près du CTA.
4. **Le milieu « qui convainc » est absent** : `Problem`, `How`, `Faq` sont codés mais **non affichés** dans `index.astro`.
5. **Trafic faible** (~6,5 visites/j, bcp de « direct » interne) → **pas d'A/B test** ; on mise sur des paris qualitatifs + session recordings.
6. **`PostHog.astro` n'a pas `cross_subdomain_cookie`** → l'ID anonyme n'est pas partagé entre `www.reedly.ai` et `hub.reedly.ai` ; impossible de relier un clic à une inscription, même après instrumentation du Hub.

## 3. Périmètre

**Dans le scope (cette session) :**
- Piste 1 — modifications de la landing (ce repo).
- Piste 2 — **spec** d'instrumentation du Hub (livrable `.md` à passer au dev ; le Hub est un autre codebase).

**Hors scope :**
- Refonte du hero / repositionnement (= approche B, éventuel 2e temps).
- Toute modification de l'app mobile.
- A/B testing (trafic insuffisant).
- Implémentation effective dans le repo du Hub.

## 4. Piste 1 — Landing (ce repo)

### 4.1 CTA + micro-réassurance (`Hero.astro`, `public/main.js`)
- **Conserver** le CTA primaire vers `https://hub.reedly.ai` (parcours web self-serve, choix validé).
- **Ajouter sous le CTA** une ligne de réassurance en **réutilisant les clés i18n existantes** `hero.trust1/2/3` (« Plan gratuit disponible · Essai 7 jours sur les plans payants · Sans engagement ») — déjà traduites FR/EN, factuelles.
- **Ajouter un CTA secondaire discret** « Voir la démo » (style ghost) qui scrolle vers `#demo`, avec `data-track-id="hero_see_demo"`, `data-track-type="demo"`, `data-track-section="hero"`. Chemin à faible engagement + mesuré.
- Vérifier que les clés EN correspondantes existent (`hero.trust1/2/3`, et une clé pour « Voir la démo » / « Watch demo »).

### 4.2 Réafficher le milieu qui convainc (`src/pages/fr/index.astro` + `src/pages/en/index.astro`)
Nouvel ordre du `<main>` (symétrie FR/EN obligatoire) :

```
Hero → Problem → How → Demo → Proof → Integrations → Pricing → Faq → Contact → FinalCta
```

- N'ajoute que des composants **déjà codés** (`Problem`, `How`, `Faq`) — i18n et section-tracking déjà câblés (`TRACKABLE_SECTIONS` contient déjà `problem`, `how` ; **vérifier que `faq` y est**, l'ajouter sinon).
- Raison de l'ordre : Problem crée la tension, How montre le mécanisme, Demo le prouve en vidéo, Proof chiffre, Pricing, FAQ tue les objections juste avant le CTA final.

### 4.3 Bande de confiance — badges factuels uniquement
- Décision : **pas de note de store** (2–4 avis = trop mince, contre-productif), **pas de logos/témoignages** (rien de public pour l'instant).
- Badges vrais, déjà sourcés dans la copy : `iOS & Android` · `+95 % de précision` · `Audio supprimé après génération` · `11 sections · < 2 min`.
- Prévoir un emplacement propre (composant ou bloc) pour brancher la **vraie preuve sociale plus tard** (logos / nb d'utilisateurs / note quand elle sera solide).
- Implémentation : soit intégrer ces badges dans/sous le hero, soit un petit composant `TrustBar.astro` réutilisable. À trancher au moment du plan.

### 4.4 Instrumentation côté landing (`src/components/PostHog.astro`, `public/main.js`)
- Ajouter `cross_subdomain_cookie: true` à `posthog.init(...)` → cookie d'ID anonyme posé sur `.reedly.ai`, **partagé avec le Hub**. C'est le chaînon qui reliera clic landing ↔ inscription Hub.
- **Filet de sécurité cookies bloqués** : au clic sur un CTA `trial`, appendre l'ID distinct en query-param au lien Hub (`https://hub.reedly.ai?ph_id=<distinct_id>`), à consommer côté Hub (voir spec). Implémentation dans le handler `[data-track-id]` de `main.js` (récupérer `posthog.get_distinct_id()`).
- `landing_cta_clicked` (déjà émis avec `cta_id`/`cta_type`/`section_id`/`target_kind`) : conservé tel quel.

## 5. Piste 2 — Spec d'instrumentation Hub (livrable, autre repo)

Document court à remettre au dev du Hub. Contenu :

1. **Init posthog-js** sur `hub.reedly.ai` avec **la même clé projet** (`PUBLIC_POSTHOG_KEY`) et le même `api_host`, plus :
   - `cross_subdomain_cookie: true` (impératif — sinon l'identité ne se stitch pas) ;
   - **ne pas** appeler `posthog.reset()` au chargement (ça casserait le lien avec l'anonyme venu de la landing).
2. **Consommer `?ph_id=`** : si présent dans l'URL d'entrée et différent de l'ID courant, utiliser `posthog.identify(ph_id)` / alias en filet de sécurité.
3. **Émettre 2 événements** :
   - `signup_started` — page/formulaire d'inscription affiché (props : `method_options`, `$referrer`).
   - `signup_completed` — compte créé avec succès (props : `auth_method`, `plan`, `is_invited`). Puis `posthog.identify(userId, { email })` pour fusionner anonyme → connu.
   - (option) `signup_failed` avec raison.
4. **Résultat** : funnel PostHog `landing_page_viewed → landing_cta_clicked(trial) → signup_started → signup_completed` → vrai taux de conversion mesuré.

## 6. Plan de mesure
- Créer/sauver un **funnel PostHog** sur les 4 étapes une fois `signup_*` en place.
- En attendant : suivre `landing_cta_clicked (cta_type=trial)` / `landing_page_viewed` comme proxy + regarder les **session recordings** des cliqueurs (replay activé).

## 7. Critères d'acceptation
- [ ] La landing FR **et** EN affichent Problem, How, FAQ dans le nouvel ordre.
- [ ] Le hero a une ligne de réassurance (clés `hero.trust1/2/3`) + un CTA secondaire « Voir la démo » qui scrolle vers `#demo`.
- [ ] Badges de confiance factuels visibles, aucun claim inventé.
- [ ] `PostHog.astro` initialise avec `cross_subdomain_cookie: true`.
- [ ] Les liens CTA `trial` portent `?ph_id=<distinct_id>` au clic.
- [ ] `faq` présent dans `TRACKABLE_SECTIONS`.
- [ ] `pnpm build` passe ; parité FR/EN respectée.
- [ ] Spec Hub livrée en `.md`.

## 8. Risques & notes
- **Incohérence de message à surveiller** : la FAQ (a5) dit « les commerciaux utilisent uniquement l'app mobile ; le Hub est réservé aux managers », alors que le parcours cible est « le commercial crée son compte sur le Hub web ». À aligner (copy) pour ne pas dérouter le visiteur qui clique « Essayer gratuitement » → Hub. À décider au moment du plan.
- **Faible trafic** : l'impact se lira lentement ; privilégier l'apprentissage qualitatif.
- **Dépendance externe** : la mesure complète du funnel dépend de l'implémentation de la spec Hub par le dev (hors de ce repo).
