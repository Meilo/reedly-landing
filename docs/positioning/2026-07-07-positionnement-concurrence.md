# Positionnement Reedly vs concurrence — refonte du message landing

> **Date** : 2026-07-07
> **Objet** : redéfinir le message de la landing autour d'une différenciation *réelle et défendable* face à la concurrence.
> **Angle validé** : **« Née pour le terrain, pas pour la visio. »**
> **Page visuelle** : `reedly-positioning.html` (ce dossier) — version interactive du comparatif + message avant/après.
> **Méthode** : recherche multi-agents (5 angles, ~100 claims extraits de sources 2025-2026, vérification adversariale de chaque claim). Sources listées en fin de doc.

> **⚠️ Corrections v1.1 (07/07)** :
> 1. **Pas de plan gratuit.** Reedly = plans payants (Pro 29 €/u/mois, Business, Enterprise) + **essai 7 jours**. Le Hero *live* affiche à tort « Plan gratuit disponible » → **bug à corriger** (`Hero.astro`, clé `hero.trust1`).
> 2. **Mémoire client** ajoutée comme pilier de différenciation (voir §5.2) — cadrée honnêtement : la mémoire n'est *pas* absente chez les concurrents (Gong, Modjo, Noota, Granola/Notion en ont), mais celle de Reedly est **native terrain** (s'enrichit des visites physiques, écrit le rapport suivant, briefe la visite suivante, offline, territoriale).

---

## 0. TL;DR

Toute la catégorie « IA commerciale » (Gong, Modjo, Noota, Fireflies, Otter, Fathom, tl;dv) est **née pour la réunion en ligne** — elle enregistre et analyse les appels Zoom/Teams/Meet des commerciaux **sédentaires**. Le commercial **terrain**, en rendez-vous physique, est resté l'angle mort de cette vague. Reedly est **conçu pour ce cas-là**.

La différenciation défendable **n'est PAS** « on est les seuls à enregistrer en présentiel » (faux — plusieurs le font). C'est **la combinaison**, qu'aucun concurrent ne réunit :

1. **Field-first par conception** (arrière-plan + mains libres + offline-first), pas un « mode présentiel » greffé sur un outil de visio.
2. **Une mémoire client native terrain** : chaque rapport part de l'historique du client, pas d'une page blanche — et briefe la visite suivante. *(Une relation, pas des RDV isolés.)*
3. **Un rapport commercial structuré en 11 sections** — pas un transcript, pas des notes génériques, pas une scorecard de coaching.
4. **Un pilotage manager pensé pour le terrain** (synthèses territoriales, directives + scoring, assistant Max).
5. **Accessible, français, self-serve** (essai 7 jours, dès 29 €/u/mois, sans engagement ni minimum de sièges) quand les leaders sont verrouillés enterprise.

---

## 1. Panorama : 3 familles, aucune ne recouvre Reedly

| Famille | Acteurs | Ce qu'ils sont vraiment | Centre de gravité |
|---|---|---|---|
| **Revenue intelligence enterprise** | Gong, Modjo, Revenue.io | Analyse d'appels en ligne + coaching + forecasting/CRM, pour directions commerciales grands comptes | Appel visio/téléphone, inside-sales |
| **Notetakers de réunion** | Noota, Fireflies, Otter, Fathom, tl;dv | Bots qui rejoignent les visios pour prendre des notes ; certains ont **ajouté** un mode présentiel mobile | Réunion en ligne (Zoom/Teams/Meet) |
| **Field-natifs** | **Siro, Speakwise, HandsOff**, Reedly | Vrais outils terrain mobiles | Rendez-vous physique |

**Le point clé** : les deux premières familles — celles que tes prospects citent (Noota, Gong, Modjo) — sont **nées pour la visio**. Le présentiel est chez elles une extension récente et immature, pas le cœur du produit. La 3ᵉ famille est le vrai terrain de bataille, mais chacun y a un angle différent de Reedly (voir §3).

---

## 2. Tableau comparatif (vérifié)

| Dimension | **Reedly** | Noota | Gong | Modjo | Visio (Otter/Fireflies/Fathom/tl;dv) |
|---|---|---|---|---|---|
| **Catégorie** | Field sales terrain | Notetaker visio **+ recrutement** | Revenue intelligence enterprise | Intelligence conversationnelle FR | Notetakers de visio |
| **Captation présentiel mobile** | ✅ cœur du produit | ✅ ajouté récemment (app neuve) | ⚠️ périphérique | ✅ mais tap manuel | Otter/tl;dv oui · Fathom « bientôt » · Fireflies desktop |
| **Arrière-plan / mains libres** | ✅ | ⚠️ non documenté | ❌ | ❌ tap Play/Stop | ❌ (setup micro « staged ») |
| **Offline-first** | ✅ | ⚠️ résilience offline (récent) | ❌ | ⚠️ partiel | ❌ fallback dégradé |
| **iOS + Android natif** | ✅ | ✅ | ✅ | ✅ | Otter/tl;dv oui |
| **Output** | **Rapport structuré 11 sections** | Notes génériques + action items | Deal/pipeline intelligence, coaching | Coaching + remplissage CRM | Transcript + résumé |
| **Mémoire client → nourrit le rapport** | ✅ le rapport & la prépa partent de l'historique | ⚠️ archive consultable | ⚠️ vue compte (analytics) | ⚠️ contexte compte (CRM) | ⚠️ archive (Granola/Notion oui) |
| **Expert sectoriel (jargon métier)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Couche manager** | Synthèses territoriales, directives, Max | ⚠️ limitée | ✅ mais inside-sales/forecast | ✅ mais revue d'appels | ❌ |
| **Prix** | **Essai 7 j · dès 29 €/u/mois, sans engagement ni min. sièges** | Gratuit / 19-49 $/u/mois | 5 000-50 000 $ + 1 300-1 920 $/u/an, 2-3 ans | ~99 €/u/mois, 15 sièges min, pas de gratuit | 0-30 $/mois |
| **Français / hébergement UE** | ✅ FR / UE | ✅ FR / UE | ❌ US | ✅ FR / AWS Paris | Otter FR partiel |
| **RGPD / rétention audio** | Audio supprimé après rapport | Rétention configurable 1 j-3 ans | US | UE, SOC2 | Otter : audio stocké (US) |
| **CRM** | HubSpot, Salesforce, Slack | SF, HubSpot, BullHorn (ATS) | SF natif, HubSpot problématique | SF + HubSpot (auto-fill) | tl;dv : SF/HubSpot/Pipedrive |

---

## 3. Deep-dive par concurrent

### Noota — le plus proche (⭐ à surveiller)
- **Ce que c'est** : notetaker de visio positionné « AI Meeting **& Recruitment** ». App iOS + Android native. A **récemment** ajouté le présentiel (« records anywhere, even face-to-face ») et une résilience offline.
- **Points forts réels** : plan gratuit, FR, hébergement UE (France/Belgique/PB), RGPD, prix accessible.
- **Failles exploitables** : (1) **généraliste/recrutement**, pas field-sales pur (intégrations ATS type BullHorn/Recruitee) ; (2) output = **notes génériques**, pas un rapport commercial structuré ; (3) app mobile **neuve/immature** (v1.0.20 sortie ~5 j avant cette recherche, corrige des bugs d'upload, « pas assez de reviews ») ; (4) **pas de pilotage territorial manager** ; (5) l'audio n'est **pas** supprimé par défaut (rétention configurable).
- **Ce qu'on NE peut PAS dire contre Noota** : « on est les seuls en présentiel/mobile/offline/FR/UE/RGPD ». Ils cochent tout ça.

### Gong — enterprise, hors catégorie
- **Ce que c'est** : plateforme de **revenue intelligence** grands comptes (4 500 clients). Analyse d'appels, coaching, forecasting.
- **Réalité prix** : ~5 000-50 000 $ de plateforme + 1 300-1 920 $/u/an, 15 sièges min, contrats **2-3 ans** payés d'avance, **pas de gratuit ni self-serve**. ~194 000 $ la 1ʳᵉ année pour 100 users.
- **Mobile** : app existe, capture in-person possible mais **périphérique** ; centre de gravité = revue d'appels et pilotage grand compte, US.
- **Angle** : Gong = **inaccessible** à une PME terrain. Différenciation par **segment + prix**, pas par capacité brute.

### Modjo — le Gong français
- **Ce que c'est** : intelligence conversationnelle FR (Doctolib, Qonto, Spendesk, PayFit). Appels visio/téléphone via bot. **A une app iOS + Android** qui enregistre le présentiel.
- **Nuances vérifiées (importantes)** : l'enregistrement présentiel de Modjo **n'est PAS mains libres** (tap Play/Stop manuel), **se met en pause** si le tel reçoit un appel, **exige internet au début/fin** (offline partiel), et le recorder navigateur est **en fin de vie**. Output = **coaching + remplissage CRM** (~90 % des champs, SF/HubSpot only), pas un rapport structuré.
- **Prix** : ~99 €/u/mois, 15 sièges min, €2-5k d'onboarding, **pas de gratuit**.
- **Ce qu'on NE peut PAS dire contre Modjo** : « on est les seuls en FR/UE/RGPD » ou « les seuls sur mobile présentiel ». Différenciation = **UX field-first (mains libres, offline) + rapport structuré + prix accessible**.

### Catégorie visio (Otter, Fireflies, Fathom, tl;dv)
- **Fathom** : online only, présentiel « bientôt » iOS, pas d'app mobile de captation aujourd'hui, n'accepte même pas l'upload d'audio.
- **Fireflies** : « bot-free » = **app desktop** (Windows/Mac) qui capte l'audio système ; pas de captation mobile terrain ; le mode bot-free perd la diarisation.
- **Otter** : **le vrai contre-exemple honnête** — supporte le présentiel via app iOS/Android, FR partiel, speaker ID. **Mais** exige un internet stable (pas offline ; offline = fallback dégradé qui peut échouer), best practices = **setup micro délibéré**, pas de captation passive en arrière-plan. Audio stocké sur serveurs Otter (US).
- **tl;dv** : présentiel + iOS/Android + plan gratuit + CRM (SF/HubSpot/Pipedrive), mais outil d'appels en ligne d'abord.

### Field-natifs — les vrais rivaux de catégorie
- **Siro** ⚠️ (le plus dangereux) : iOS+Android, présentiel, offline, CRM. **Mais** wedge = **coaching / game-film** (tonalité, gestion d'objection, coaching live), pour équipes **US door-to-door / home-services**, **~3 000 $/u/an**, pas de gratuit, **pas de français**. Output = coaching, pas rapport.
- **Speakwise** ⚠️ (le plus proche de la fiche produit) : iOS-natif, présentiel, offline, mains libres (tap AirPods), **« 95%+ »**, résumés structurés. **Mais iOS-only (pas d'Android)**, **pas de sync CRM native**, **pas de couche manager**, pas de FR/RGPD affichés. Reedly gagne sur **Android + FR + Hub + CRM**, pas sur l'enregistrement.
- **HandsOff** : voice-to-CRM terrain (immobilier, assurance), SOC2/RGPD, « audio supprimé immédiatement ». **Mais** c'est une **PWA** (pas d'app native), le flux est de la **dictée post-RDV** (on parle *après*), pas de captation live en arrière-plan ; output = champs CRM, pas un rapport 11 sections.

---

## 4. Claims à TUER (fragiles — la recherche les a réfutés)

Ne jamais écrire ces phrases sur la landing :

| ❌ Claim interdit | Pourquoi c'est faux |
|---|---|
| « Le seul à enregistrer les RDV physiques » | Noota, Modjo, Otter, tl;dv, Siro, Speakwise, HandsOff le font |
| « Le seul sur mobile / offline / mains libres » | Siro, Speakwise (offline+mains libres), Noota (offline) le revendiquent |
| « Audio supprimé = notre exclusivité » | HandsOff supprime « immédiatement » ; Noota configurable |
| « 95 % de précision, unique » | Speakwise « 95%+ » ; Modjo ~95 % FR — **table-stakes** |
| « Français / hébergement UE = différenciateur » | Vrai vs Gong/Siro/Speakwise (US) — **faux** vs Modjo/Noota |
| « Les concurrents n'ont pas de mémoire client » | **Faux** : Gong (account context, AI Briefer), Modjo (full account context HubSpot), Noota (connected workspace), Granola/Notion (« perfect meeting memory » + brief). → dire « mémoire **native terrain** », pas « eux n'ont rien ». |
| « Plan gratuit disponible » *(erreur interne, live)* | Reedly n'a **pas** de plan gratuit — seulement un **essai 7 jours**. À corriger dans `Hero.astro`. |

**Règle d'or** : on ne revendique jamais une **capacité isolée** comme exclusive. On revendique une **combinaison + une cible** (« le seul *conçu pour la vente terrain B2B* qui réunit X + Y + Z »).

---

## 5. Les 5 différenciateurs défendables

### 5.1 — Field-first, pas visio-first
Design centré sur le présentiel (arrière-plan, mains libres, **offline-first**), là où la catégorie a greffé le présentiel sur un produit né pour la visio. → *claim de conception / centre de gravité*, pas d'exclusivité.

### 5.2 — Une mémoire client native terrain *(le pilier ajouté)*
Chaque rapport **et** chaque préparation de RDV partent de **l'historique du client** (portfolio auto-enrichi, timeline, engagements en cours), pas d'une page blanche. *« Une relation, pas une série de rendez-vous isolés. »*
- **⚠️ Cadrage honnête** : la mémoire n'est pas absente ailleurs — Gong (*account context*, AI Briefer), Modjo (*full account context* dans HubSpot), Noota (*connected workspace*), Granola/Notion (« perfect meeting memory ») en ont. **Ne jamais dire « eux n'ont pas de mémoire ».**
- **Ce qui est défendable** : (1) leur mémoire est une **archive à consulter** ou une **vue compte CRM/enterprise**, pensée pour la visio et le sédentaire ; celle de Reedly est **native terrain** — s'enrichit des visites physiques, **écrit le rapport suivant**, **briefe la visite suivante**, marche **hors-ligne**, remonte **par territoire** au manager. (2) Face aux vrais rivaux terrain (Siro=coaching, Speakwise=résumés iOS, HandsOff=champs CRM), **aucun n'a de mémoire client riche** → différenciation propre. (3) Personne ne **raconte** cette histoire au commercial **terrain**, alors que c'est là (visites répétées, même territoire) qu'elle compte le plus.

### 5.3 — Un rapport commercial, pas une transcription
Output opinioné en **11 sections** décisionnelles (besoins, objections, engagements, opportunités, risques, recommandations) + **expert sectoriel** qui comprend le jargon métier. Aucun concurrent ne produit ce format.

### 5.4 — Le manager voit enfin le terrain
Le trou que l'IA n'a jamais comblé : synthèses **territoriales**, directives + scoring de conformité, assistant **Max** — un pilotage pensé pour la couverture terrain, pas la revue d'appels inside-sales.

### 5.5 — La puissance sans le ticket enterprise
**Essai 7 jours**, self-serve, **dès 29 €/u/mois**, sans engagement ni minimum de sièges, déployé en 10 min — face à Gong (194 k$/100 users), Modjo (99 €/u, 15 sièges min), Siro (3 000 $/u/an).
- **⚠️ Nuance** : atout **contre les acteurs enterprise** (Gong/Modjo/Siro). **Pas** un différenciateur contre Noota, qui est moins cher et a un plan gratuit.

---

## 6. Le nouveau message — réécriture section par section

> Convention : **AVANT** = copy actuelle · **APRÈS** = proposition. Copy FR + EN fournie pour les blocs clés. Respecte la symétrie bilingue (CLAUDE.md).

### 6.1 — HERO

**AVANT**
- H1 : « Retrouvez le temps *de vendre.* »
- Sub : « Reedly rédige vos comptes-rendus terrain et les intègre directement dans votre Hub central. »

**APRÈS (FR)**
- Kicker : `L'IA commerciale, enfin pour le terrain`
- H1 : **« Née pour le terrain, *pas pour la visio.* »**
- Sub : « Les autres IA commerciales enregistrent vos appels en ligne. Reedly capte vos **vrais** rendez-vous — en boutique, sur site, en face-à-face — et les transforme en **rapport commercial structuré**. Mains libres, même hors-ligne. »
- CTA : `Essayer 7 jours` · `Voir la démo`
- **⚠️ Ligne de confiance (`hero.trust*`) — corriger le bug live** : remplacer « Plan gratuit disponible » par **« Essai 7 jours »** · **« Sans engagement »** · **« Vos données restent en Europe »**. (Reedly n'a **pas** de plan gratuit.)

**APRÈS (EN)**
- Kicker : `Sales AI, finally built for the field`
- H1 : **“Built for the field, *not for video calls.*”**
- Sub : “Other sales AIs record your online calls. Reedly captures your **real** meetings — in-store, on-site, face-to-face — and turns them into a **structured sales report**. Hands-free, even offline.”

### 6.2 — PROBLEM (reframe autour de l'angle mort)

**AVANT** : « Un rendez-vous rapporte. Un compte-rendu coûte. » → 45 min perdues / engagements oubliés / manager aveugle.

**APRÈS (FR)**
- Eyebrow : `L'angle mort de l'IA commerciale`
- H2 : **« Le sédentaire est suréquipé. *Le terrain, livré à lui-même.* »**
- Lead : « Depuis 5 ans, chaque appel visio d'un commercial sédentaire est enregistré, analysé, coaché, versé au CRM. Le commercial **terrain**, lui, ressort de son rendez-vous avec un carnet et sa mémoire. La donnée la plus riche — celle du face-à-face — se perd. »
- Cartes (garder les 3, recentrer la 3ᵉ) :
  1. **45 min perdues par RDV** (inchangé)
  2. **Engagements oubliés** (inchangé)
  3. **Le terrain, invisible** — « L'inside-sales est tracé à 100 %. Le terrain, zéro. Le manager ne voit rien de ce qui s'est dit en clientèle, jusqu'à ce qu'il soit trop tard. »

**APRÈS (EN)**
- Eyebrow : `Sales AI's blind spot`
- H2 : **“Inside sales is over-equipped. *The field is on its own.*”**
- Lead : “For five years, every online call from an inside rep has been recorded, analyzed, coached, synced to the CRM. The **field** rep walks out of the meeting with a notepad and their memory. The richest data — the face-to-face — is lost.”

### 6.3 — NOUVELLE SECTION : « Reedly vs les outils de visio » (à créer)

Bloc de différenciation honnête, **au niveau catégorie** (pas de nom de concurrent sur la landing — voir §7). Format « pour qui c'est fait » en 2 colonnes :

| Les outils d'IA commerciale classiques | **Reedly** |
|---|---|
| Rejoignent une **visio** pour prendre des notes | Capte le **rendez-vous physique**, mains libres |
| Ont besoin de **connexion** en continu | Fonctionne **hors-ligne**, synchronise ensuite |
| Rendent un **transcript** ou un résumé générique | Rend un **rapport commercial en 11 sections** |
| Chaque compte-rendu repart d'une **page blanche** (ou d'une archive à fouiller) | Chaque rapport part de l'**historique du client** |
| Pilotage pensé pour la **revue d'appels** | Pilotage pensé pour la **couverture territoriale** |
| Verrouillés **enterprise** (ou orientés recrutement) | **Essai libre**, dès 29 €/u, sans engagement |

Titre proposé (FR) : **« Les autres sont faits pour les appels. Reedly est fait pour le terrain. »**
Titre proposé (EN) : **“The others are built for calls. Reedly is built for the field.”**

> Note stratégique : garder ce bloc **au niveau catégorie** sur la home. Réserver la comparaison **nominative** (Reedly vs Noota / Gong / Modjo) à une page `/comparatif` dédiée, mieux pour le SEO et moins risquée que de citer des marques en home.

### 6.4 — FEATURES (réordonner pour mettre les différenciateurs en tête)

**AVANT** : 1-tap · transcription · rapport 11 sections · expert sectoriel · PDF · synthèses.

**APRÈS** — ordre recentré sur l'axe :
1. **Captation terrain mains libres** (ex-card 1) — insister arrière-plan + **hors-ligne**.
2. **Mémoire client** *(nouvelle card)* — « Chaque rapport part de l'historique du client, pas d'une page blanche. Reedly se souvient de chaque visite et briefe la suivante. » (s'appuie sur les features *Portfolio Client* + *Préparation de RDV* existantes).
3. **Rapport commercial en 11 sections** (ex-card 3, remonté) — le héros de l'output.
4. **Expert sectoriel** (ex-card 4, remonté) — « raisonne comme un expert métier, pas un généraliste ».
5. Transcription fidèle +95 % (garder, mais **pas** présentée comme différenciateur).
6. Synthèses territoriales.
7. Export PDF / partage.

Lead APRÈS (FR) : « De la parole captée en clientèle au rapport prêt à décider — Reedly automatise tout le compte-rendu terrain. Votre seule tâche : appuyer sur Enregistrer. »

### 6.5 — ROLES (garder la structure, aiguiser le manager)

- **Commercial terrain** : titre inchangé (« Vendez. Reedly s'occupe du reste. ») — déjà bon.
- **Manager** : APRÈS (FR) titre : **« Voyez enfin le terrain. »** · intro : « Ce qui se dit en rendez-vous remonte automatiquement dans le Hub — la visibilité que l'inside-sales a depuis des années, enfin pour vos équipes terrain. »
- **Manager** EN : **“Finally see the field.”**

---

## 7. Risques & garde-fous

- **Ne pas nommer les concurrents en home.** Comparaison catégorielle en home ; comparaison nominative sur une page `/comparatif` dédiée (bilingue, SEO).
- **Bannir tout « le seul à… » sur une capacité isolée.** Toujours qualifier par la cible (« conçu pour la vente terrain B2B »).
- **Ne pas surjouer FR/RGPD** comme différenciateur global — c'est un atout **contre les acteurs US** seulement.
- **Assumer l'honnêteté comme force.** L'angle « l'IA a oublié le terrain » est vrai, vérifiable, et personne d'autre ne le raconte.
- **Vérifier chaque nouveau claim** contre `scripts/feature-config.mjs` et la copy existante avant publication (règle CLAUDE.md).

---

## 8. Prochaines étapes (implémentation)

1. Réécrire `Hero.astro` + clés i18n FR/EN (`public/main.js`).
2. Réécrire `Problem.astro` + i18n.
3. Créer un composant `VsVideo.astro` (nouvelle section §6.3) + l'insérer dans les deux `index.astro`.
4. Réordonner/retoucher `Features.astro` + i18n.
5. Aiguiser le volet manager de `Roles.astro` + i18n.
6. (Optionnel) Page `/comparatif` ↔ `/comparison` nominative (+ `vercel.json` si legacy).
7. `pnpm build` + revue visuelle FR/EN avant merge.

---

## 9. Sources principales (2025-2026)

- Praiz — *Comparatif intelligence conversationnelle 2026* (catégorie Gong/Modjo/notetakers)
- Salesdorado — *Avis Modjo* ; Claap — *Modjo pricing* / *Gong pricing* ; marketbetter.ai — *Gong pricing 2026*
- Noota — pages officielles *Pricing* / *In-Person Recorder* / *Security* ; App Store *Noota – Call & Voice to Text* ; G2 *Noota pricing*
- Modjo — Help Center *Record in-person meetings* ; modjo.ai ; Action Co. *Top 6 IA commerciale 2026*
- Gong — Help *Intro to the Gong mobile app* ; gong.io *Revenue Intelligence*
- Fathom Help Center ; Fireflies KB *Record without a bot* ; Otter Help *In-person best practices* ; tl;dv *Bot-free notetakers*
- Sybill — *Best tools for recording in-person sales meetings 2026* ; Siro.ai + SalesAsk *Siro pricing* ; Speakwise ; HandsOff (handsoffcrm.com) ; Revenue.io ; CraftNote ; MeetGeek

*(~100 claims extraits, chacun soumis à une vérification adversariale 3 votes. Les nuances « fragile-claim » de cette recherche sont intégrées au §4.)*
