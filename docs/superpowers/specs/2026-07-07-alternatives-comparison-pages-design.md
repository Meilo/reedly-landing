# Pages « Alternative à X » — template SEO, première page : Noota

**Date** : 2026-07-07
**Repo** : `reedly-landing` (Astro 6, static + `@astrojs/vercel`)
**Statut** : Design validé — en attente de relecture avant plan d'implémentation
**Branche** : `feat/landing-alternative-pages`

---

## 1. Objectif

Créer un **template réutilisable** de pages comparatives « Alternative à X » (X = concurrent bien référencé), à double objectif :

1. **SEO** — capter les requêtes « alternative à Noota », « Noota alternative », « Noota vs Reedly » en citant un outil déjà bien référencé.
2. **Conversion** — convaincre un prospect en phase de décision que Reedly apporte une valeur qu'un notetaker de réunion n'apporte pas.

**Première page** : Noota. Le template doit rendre l'ajout des concurrents suivants (Gong, Modjo…) trivial : un fichier YAML par langue + une entrée de registre.

Cadrage stratégique conforme à `docs/positioning/2026-07-07-positionnement-concurrence.md` (recherche multi-agents, claims vérifiés).

## 2. Principes & garde-fous (NON négociables)

- **On joue la valeur, jamais le prix.** Aucune ligne tarifaire, aucun « plan gratuit », aucune comparaison de prix. Si le prospect perçoit la valeur de Reedly, le tarif n'est pas le sujet. (Cohérent avec le positioning §5.5 : le prix n'est *pas* un différenciateur face à Noota.)
- **Reedly doit sortir gagnant** à la lecture — sans survendre Noota et sans mentir. Chaque ligne du tableau met Reedly en avant tout en décrivant honnêtement ce que Noota fait vraiment.
- **Pas de ligne de parité** (français, hébergement UE) : dire « les deux font pareil » n'apporte aucune valeur → exclu du comparatif.
- **Pas de ligne qui plante le doute.** Ex. « audio supprimé (Reedly) vs configurable (Noota) » fait paraître Reedly désavantagé → la confidentialité est reformulée en **promesse Reedly**, pas en comparaison.
- **Claims à TUER** (positioning §4) — ne jamais écrire :
  - « le seul à enregistrer le présentiel / en mains libres / hors-ligne » (Noota, Modjo, Otter, Siro… le font aussi).
  - « Noota n'a pas de mémoire client » (Noota a un *connected workspace*). → on dit « archive de comptes-rendus à consulter » vs « mémoire centrée client ».
  - « Noota ne fait qu'une note » (Noota produit une note **structurée** avec sections/templates). → le différenciateur est la **nature de l'output** : Noota restitue la réunion, Reedly en tire une **analyse commerciale décisionnelle**.
- **Ton fair-play** aligné sur le blog existant `alternative-gong-modjo-terrain.md` : « il ne s'agit pas de dénigrer ces outils ».

## 3. Architecture technique (calquée sur les *features*)

Le pattern *features* du repo est repris à l'identique (registre + contenu YAML bilingue + loader + route `[...slug]` + composants de section). Rendu **server-side par langue** — pas de dictionnaire `data-i18n`/`main.js` : le contenu vit dans les YAML `fr`/`en`.

| Élément | Fichier | Rôle |
|---|---|---|
| Registre | `src/data/alternatives.yaml` | `id` → `{ slugs: { fr, en }, competitor }` |
| Contenu | `src/content/alternatives/{fr,en}/noota.yaml` | Toute la page |
| Loader | `src/lib/load-alternatives.ts` | Miroir de `load-features.ts` : `loadAlternativeContent`, `getAllAlternativeSlugs`, `findMirrorSlug`, `findAlternativeId` |
| Routes | `src/pages/fr/alternatives/[...slug].astro` + `src/pages/en/alternatives/[...slug].astro` | `getStaticPaths` depuis le registre + hreflang + JSON-LD |
| Composants | `src/components/alternative/*.astro` | Sections (voir §5). Réutilise le style `.feature-card` ; **le tableau comparatif est le seul composant réellement nouveau** |

**URL** : `/fr/alternatives/noota` + `/en/alternatives/noota` (segment parent unique `alternatives`, comme `/features/`, non traduit). Le mot-clé « alternative à Noota » est porté par le `title` + le H1. Ajouter Gong ⇒ `/{fr,en}/alternatives/gong`.

**Registre Noota** :
```yaml
alternatives:
  - id: "noota"
    competitor: "Noota"
    slugs:
      fr: "noota"
      en: "noota"
```

## 4. Modèle de contenu (schéma YAML de la collection)

```yaml
seo: { title, description, keywords[] }
hero: { eyebrow, title (html <em>), lead, cta_label, cta_url }
verdict: { title (html), text }              # TL;DR honnête « deux outils, deux métiers »
comparison:
  eyebrow, title (html), lead
  columns: { reedly, competitor }            # libellés d'en-tête
  rows:
    - { need, reedly, competitor }           # need = besoin du commercial (colonne gauche)
value_blocks:
  eyebrow, title
  blocks:
    - { title, tagline?, text, icon, items?[] }   # items = puces (ex. les 11 sections)
fair:                                         # « Quand Noota est le bon choix »
  eyebrow, title, lead
  cards:
    - { title, text, icon }
privacy: { text }                            # réassurance confidentialité (promesse Reedly)
faq:
  - { question, answer }                      # → JSON-LD FAQPage
related:
  - { href, label }                           # maillage interne (features + autres alternatives)
```

`icon` ∈ la liste `ICON_NAMES` de `scripts/generate-feature.mjs` (mappée dans `FeatureIcon.astro`).

## 5. Structure de la page (contenu FR de référence)

> Le contenu EN est le miroir strict (mêmes sections, `findMirrorSlug`). Copie EN produite à l'implémentation. Titres avec `<em>` rendus via `set:html`.

### 5.1 — Hero
- **eyebrow** : `Alternative à Noota`
- **title** : `L'alternative à Noota <em>pensée pour la vente terrain.</em>`
- **lead** : « Noota est un excellent notetaker pour vos réunions en ligne. Mais si vos commerciaux vendent sur le terrain, Reedly transforme chaque visite en **rapport commercial décisionnel**, enrichit une **mémoire de chaque client**, et n'oublie jamais un engagement. Mains libres, même hors-ligne. »
- **CTA** : `Essayer 7 jours` → `/fr#trial`

### 5.2 — Verdict honnête (TL;DR)
- **title** : `Deux outils, <em>deux métiers.</em>`
- **text** : « Noota capture et résume vos réunions — visio comme présentiel — et sert aussi au recrutement. Reedly est conçu pour un seul métier : la **vente terrain B2B**. Il ne se contente pas de noter le rendez-vous : il en tire une analyse commerciale, la relie à l'historique du client, et pilote la suite. »

### 5.3 — Tableau comparatif (centre de la page, composant nouveau)
- **eyebrow** : `Comparaison` · **title** : `Reedly face à Noota, <em>du point de vue du terrain.</em>`
- **lead** : « Six besoins concrets d'un commercial terrain, et ce que chaque outil apporte vraiment. »
- **columns** : `Reedly` · `Noota`
- **rows** :

| `need` | `reedly` | `competitor` (Noota) |
|---|---|---|
| Le compte-rendu | **Rapport commercial décisionnel** — au-delà du résumé : objections *et* réponses, concurrents, engagements, opportunités, **risques**, **recommandations**, structuré **par secteur** ; il alimente la mémoire client, les actions et les synthèses | **Note de réunion structurée** — résumé fidèle et organisé de l'échange (sections, templates, action items) |
| Des actions qui ne tombent pas aux oubliettes | Actions **datées + priorisées par l'IA**, **rappel auto si en retard**, alerte si le client devient dormant | Liste d'action items dans la note |
| Se souvenir de chaque client | **Fiche client auto-enrichie** dont l'historique **nourrit le rapport suivant** | Comptes-rendus à consulter un par un |
| Arriver préparé au prochain RDV | **Briefing IA** avant chaque visite (engagements, points de vigilance) | Historique à relire manuellement |
| Une IA qui comprend mon métier | **Expert sectoriel** : jargon + structure par secteur | IA généraliste |
| Que le manager voie le terrain | **Synthèses territoriales** + directives + Max | Pilotage terrain limité |

Rendu : colonne Reedly mise en avant (fond vert subtil, bordure verte) ; colonne Noota neutre. Table scrollable horizontalement sur mobile.

### 5.4 — Blocs de valeur (la substance)
- **eyebrow** : `Pourquoi Reedly` · **title** : `Ce qu'un notetaker ne fait pas.`
- **blocks** :
  1. **« Un rapport qui décide, pas seulement qui résume »** — *tagline* : « Noota restitue ce qui s'est dit. Reedly en tire ce qu'il faut décider. » `items` = les 11 sections : résumé exécutif, profil client, besoins exprimés, objections et réponses, produits/services discutés, concurrents mentionnés, engagements mutuels, prochaines étapes et échéances, opportunités, risques, recommandations. Icône `layers`.
  2. **« Vos engagements ne s'oublient plus »** — actions extraites du rapport, **datées et priorisées par l'IA** selon leur importance ; l'app **alerte** en cas d'action en retard *et* de client devenu dormant. « Reedly agit, il ne se contente pas de noter. » Icône `target`.
  3. **« Une mémoire du client, pas une pile de comptes-rendus »** — fiche client auto-enrichie (timeline, besoins agrégés, contacts, score de relation) ; chaque nouveau rapport part de l'historique et **briefe la visite suivante**. « Une relation, pas des rendez-vous isolés. » Icône `brain`.
  4. **« Pensé pour le terrain »** — captation en 1 tap, **mains libres**, en **arrière-plan**, **hors-ligne** (synchro ensuite). L'IA comprend le vocabulaire métier. Icône `zap`.
  5. **« Le manager voit enfin le terrain »** — synthèses territoriales (tendances/risques/opportunités priorisés), directives + scoring de conformité, assistant Max. Icône `chart`.

### 5.5 — Confidentialité (réassurance, promesse Reedly)
- **text** : « Vos conversations client ne sont jamais conservées : l'audio est automatiquement **supprimé après la génération du rapport**. Vos données sont hébergées en Europe. » *(Formulé comme un engagement Reedly, sans comparaison avec la config de Noota.)*

### 5.6 — « Quand Noota est le bon choix » (fair-play, sur l'usage)
- **eyebrow** : `En toute honnêteté` · **title** : `Quand Noota est le bon choix.`
- **lead** : « Noota est un très bon outil. Il sera plus adapté que Reedly si… »
- **cards** :
  1. **Vos réunions sont surtout en visio ou au téléphone** — Noota est né pour la réunion en ligne ; c'est son terrain de jeu.
  2. **Vous avez un besoin recrutement** — Noota couvre l'entretien candidat et s'intègre aux ATS.
  3. **Vous cherchez un notetaker généraliste** — pour prendre des notes sur tout type de réunion, au-delà de la vente terrain.

### 5.7 — FAQ (→ JSON-LD FAQPage)
1. **Reedly est-il une vraie alternative à Noota ?** — Pour une équipe de vente terrain B2B, oui. Noota est un notetaker de réunion (visio + recrutement) ; Reedly produit un rapport commercial décisionnel, entretient une mémoire de chaque client et donne au manager une vision du terrain.
2. **Quelle est la vraie différence entre Reedly et Noota ?** — Noota restitue fidèlement la réunion dans une note structurée. Reedly en tire une analyse commerciale (objections et réponses, risques, recommandations) qui alimente ensuite la mémoire client, les actions suivies et les synthèses territoriales.
3. **Noota enregistre-t-il les rendez-vous physiques ?** — Oui, Noota a ajouté le présentiel. Reedly est conçu autour du terrain (mains libres, arrière-plan, hors-ligne) et en tire un rapport commercial, pas seulement des notes de réunion.
4. **Peut-on passer de Noota à Reedly facilement ?** — Oui : il suffit de commencer à enregistrer vos rendez-vous. La mémoire client s'enrichit dès les premières visites, sans configuration.
5. **Mes données restent-elles en Europe ?** — Oui, vos données sont hébergées en Europe, et l'audio est supprimé après la génération du rapport.

### 5.8 — CTA final
Réutilise le composant `FinalCta` existant (aucune copie spécifique).

### 5.9 — Related (maillage interne)
Liens vers `/fr/features/rapport-ia`, `/fr/features/portfolio-client`, `/fr/features/preparation-rdv` + (plus tard) les autres pages `/alternatives/*`.

## 6. SEO

- **FR title** : `Alternative à Noota pour la vente terrain | Reedly` (≤ 60)
- **FR description** : `Reedly, l'alternative à Noota pensée pour les commerciaux terrain : rapport commercial décisionnel, mémoire client, actions suivies. Essai 7 jours.` (≤ 155)
- **EN title** : `Noota Alternative for Field Sales | Reedly`
- **EN description** : `Reedly is the Noota alternative built for field sales reps: decision-ready sales reports, client memory, tracked actions. 7-day free trial.`
- **keywords FR** : `alternative Noota`, `Noota alternative vente terrain`, `Noota vs Reedly`
- **H1** = titre du hero.
- **Canonical** : `https://www.reedly.ai/{fr,en}/alternatives/noota`.
- **hreflang** : paire fr ↔ en via `Layout` (comme les features) + meta `alternative-mirror` (`data-link-fr` / `data-link-en`) pour le toggle de langue dans la Nav (mécanisme identique à `feature-mirror`).
- **JSON-LD** : `BreadcrumbList` (Accueil → Alternatives → Noota) + `FAQPage` (repris de la route `features/[...slug]`).
- **OG image** : réutilise l'existante (pas d'OG custom).
- **Sitemap** : `@astrojs/sitemap` régénère automatiquement au build → les pages sont incluses sans action.
- **`vercel.json`** : aucune modif requise (URLs neuves, pas de legacy à préserver ; les redirects `/comparatif` existants restent tels quels).
- **Footer** : ajouter un lien discret « Alternatives » (ou « Comparatifs ») pointant vers `/fr/alternatives/noota` / `/en/alternatives/noota`. Pas de lien dans la Nav (page destinée au trafic SEO organique).

## 7. Cohérence produit à respecter

- **Essai = 7 jours, pas de plan gratuit** (positioning §0 + `CLAUDE.md`). Ne pas reprendre le « 14 jours » présent dans d'anciens YAML features (incohérence connue, hors scope de correction ici).
- Vérifier chaque claim contre `scripts/feature-config.mjs` et la copy existante avant publication.
- Toutes les capacités Reedly citées sont vérifiées : rapport 11 sections (`feature-config.mjs`, `rapport-ia.yaml`), actions datées/priorisées + alertes `overdue_action`/`dormant_client` (`packages/domain/action.ts`, `report-pipeline.ts`, `alert-scheduler.ts`), mémoire client + briefing (`portfolio-client.yaml`, `preparation-rdv.yaml`), synthèses/directives/Max (features YAML dédiés).

## 8. Hors scope

- Pages Gong / Modjo (le template les rend triviales — un YAML chacun — mais elles ne sont pas dans ce lot).
- Page hub `/comparatif` multi-concurrents (on garde des pages dédiées 1-concurrent).
- Lien dans la Nav principale.
- Toute comparaison tarifaire / mention de plan gratuit.
- OG image custom, témoignages, schema Review.

## 9. Livrables

**À créer**
- `src/data/alternatives.yaml`
- `src/content/alternatives/fr/noota.yaml` + `src/content/alternatives/en/noota.yaml`
- `src/lib/load-alternatives.ts`
- `src/pages/fr/alternatives/[...slug].astro` + `src/pages/en/alternatives/[...slug].astro`
- `src/components/alternative/` : `AltHero.astro`, `AltVerdict.astro`, `AltComparison.astro` (nouveau, centerpiece), `AltValueBlocks.astro`, `AltFair.astro`, `AltFaq.astro` (ou réutilise `FeatureFaq`), `AltRelated.astro`

**À modifier**
- `src/components/Footer.astro` (lien discret)

**Réutilisés tels quels** : `Layout.astro`, `Nav.astro`, `Footer.astro`, `FinalCta.astro`, `FeatureIcon.astro`, styles `.feature-card` de `global.css`.

## 10. Vérification

- `pnpm build` (le worktree n'a pas de `.env` → copier `.env` depuis le repo principal avant tout build/dev).
- Revue visuelle FR **et** EN de `/alternatives/noota` (le toggle de langue doit basculer correctement via le meta mirror).
- Vérifier les JSON-LD (BreadcrumbList + FAQPage) et les balises SEO (title/description/canonical/hreflang).
- Symétrie bilingue complète (CLAUDE.md).
