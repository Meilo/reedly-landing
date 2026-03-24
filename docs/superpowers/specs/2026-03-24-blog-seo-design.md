# Blog SEO — Design Spec

## Contexte

Reedly est une app mobile iOS/Android pour commerciaux terrain B2B. Elle enregistre les RDV clients, transcrit l'audio, et génère un rapport structuré en 11 sections via IA. Le site (Astro + Vercel, domaine `www.reedly.ai`) a besoin d'un blog pour capter du trafic organique long terme sur des requêtes que les clients cibles tapent réellement.

## Objectif

Créer 5 articles de blog (FR + EN) ciblant des requêtes SEO à intention commerciale, avec du contenu éducatif de qualité (800-1500 mots). Aucune mention de Reedly dans le corps des articles — CTA final et encart auteur uniquement.

## Décisions validées

| Sujet | Décision |
|---|---|
| Langues | FR + EN, dès le lancement |
| URLs | Slugs distincts par langue (`/blog/slug-fr` et `/blog/slug-en`) |
| Stockage contenu | Markdown dans le repo (Astro Content Collections) |
| Ton éditorial | Guide terrain — direct, concret, vouvoiement, exemples de situations terrain |
| Place de Reedly | Zéro mention dans le corps. CTA final + encart auteur uniquement |
| Architecture blog | Minimaliste — pas de catégories, pas de tags, pas de pagination |

---

## 1. Architecture technique

### Content Collections

Les fichiers sont plats (pas de sous-dossiers `fr/`/`en/`) pour que le slug Astro corresponde directement à l'URL finale sans préfixe de langue. La langue est gérée via le frontmatter `lang`.

```
src/content/blog/
  compte-rendu-reunion-client-automatique.md       (lang: fr)
  outil-compte-rendu-commercial-terrain.md         (lang: fr)
  application-enregistrement-reunion-b2b.md        (lang: fr)
  rapport-visite-client-automatise-ia.md           (lang: fr)
  alternative-gong-modjo-terrain.md                (lang: fr)
  automatic-client-meeting-report.md               (lang: en)
  field-sales-report-tool.md                       (lang: en)
  b2b-meeting-recording-app.md                     (lang: en)
  ai-automated-client-visit-report.md              (lang: en)
  gong-modjo-alternative-field-sales.md            (lang: en)
```

Les URLs résultantes sont plates : `/blog/compte-rendu-reunion-client-automatique`, `/blog/automatic-client-meeting-report`, etc.

### Frontmatter de chaque article

```yaml
---
title: "Compte-rendu de réunion client automatique : guide terrain"
description: "Comment automatiser vos comptes-rendus..."
date: 2026-03-24
lang: fr
mirror: automatic-client-meeting-report
keywords: ["compte rendu réunion client automatique", "rapport réunion IA"]
readingTime: 6
---
```

- `lang` : `fr` ou `en`
- `mirror` : slug (nom de fichier sans extension) de la version dans l'autre langue (pour hreflang). Pas de préfixe de dossier.
- `readingTime` : estimé manuellement à la rédaction

### Pages Astro

- `src/pages/blog/index.astro` — page liste, filtrée par langue courante (détectée via le système i18n existant dans `main.js`)
- `src/pages/blog/[...slug].astro` — page article, rendu Markdown par Astro
- Le layout existant (`Layout.astro`) est réutilisé avec `title`, `description`, et de nouveaux props :
  - `lang` (optionnel, default `"fr"`) — injecté dans `<html lang>` pour que les pages EN aient `lang="en"` en SSG
  - `ogType` (optionnel, default `"website"`) — les articles passent `"article"` pour `<meta property="og:type">`
  - `hreflang` (optionnel) — objet `{ fr: "/blog/slug-fr", en: "/blog/slug-en" }` pour injecter les balises `<link rel="alternate" hreflang>` dans le `<head>`
  - `articleMeta` (optionnel) — objet `{ publishedTime: string, author: string }` pour les OG tags `article:published_time` et `article:author`

### Collection config

Fichier `src/content.config.ts` (ou mise à jour si existant). **Astro 5 utilise l'API `loader`**, pas `type: 'content'` :

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    lang: z.enum(['fr', 'en']),
    mirror: z.string(),
    keywords: z.array(z.string()),
    readingTime: z.number(),
  }),
});

export const collections = { blog };
```

### Navigation

Ajout d'un lien "Blog" dans `Nav.astro` et `Footer.astro`, avec `data-link-fr="/blog"` et `data-link-en="/blog"` (même URL, le filtrage se fait côté client par langue).

### Switch de langue sur les articles individuels

Le `urlMap` existant dans `main.js` est un dictionnaire statique (`/tarifs` <-> `/pricing`) qui ne peut pas gérer les slugs dynamiques du blog. Solution : la page `[...slug].astro` injecte un élément `<meta>` caché avec les URLs miroir :

```html
<meta name="blog-mirror" data-link-fr="/blog/slug-fr" data-link-en="/blog/slug-en" />
```

Côté `main.js`, dans la logique de switch de langue, on ajoute un fallback : si la page courante n'est pas dans `urlMap`, on cherche un `<meta name="blog-mirror">` et on utilise ses `data-link-fr`/`data-link-en` pour la redirection. Sinon, comportement par défaut (rechargement sur la même page).

### i18n

Ajout des clés nécessaires dans `main.js` (objet `T`) :
- `nav.blog` : "Blog" (FR) / "Blog" (EN)
- `blog.title` : "Blog" / "Blog"
- `blog.subtitle` : "Guides pratiques pour les commerciaux terrain" / "Field sales practical guides"
- `blog.read` : "Lire" / "Read"
- `blog.back` : "Retour au blog" / "Back to blog"
- `blog.cta.text` : "Reedly transforme vos RDV terrain en rapports structurés." / "Reedly turns your field meetings into structured reports."
- `blog.cta.button` : "Essayer gratuitement" / "Try for free"

---

## 2. Plan de contenu (5 articles)

### Article 1 — Compte-rendu de réunion client automatique

- **Requête FR** : "compte rendu réunion client automatique"
- **Slug FR** : `compte-rendu-reunion-client-automatique`
- **Slug EN** : `automatic-client-meeting-report`
- **Angle** : Le vrai coût du CR manuel (temps, oublis, qualité). Ce qu'un CR automatique doit contenir pour être utile. Checklist des 11 sections essentielles d'un bon CR. Comment structurer son workflow pour ne plus rien rédiger à la main.
- **Cible** : commerciaux terrain et managers qui cherchent à gagner du temps

### Article 2 — Outil de compte-rendu pour commercial terrain

- **Requête FR** : "outil compte rendu commercial terrain"
- **Slug FR** : `outil-compte-rendu-commercial-terrain`
- **Slug EN** : `field-sales-report-tool`
- **Angle** : Les critères pour choisir un outil adapté au terrain (pas besoin de PC, fonctionne en mobilité, pas de saisie manuelle). Les erreurs à éviter (outils desktop déguisés en mobile). Ce que le terrain exige vs ce que les outils bureau proposent.
- **Cible** : directeurs commerciaux qui évaluent des solutions

### Article 3 — Application d'enregistrement de réunion B2B

- **Requête FR** : "application enregistrement réunion B2B"
- **Slug FR** : `application-enregistrement-reunion-b2b`
- **Slug EN** : `b2b-meeting-recording-app`
- **Angle** : Pourquoi enregistrer ses RDV terrain (mémoire, preuve, formation). Les questions légales (consentement, RGPD, suppression audio). Les bonnes pratiques : que faire de l'enregistrement une fois le rapport généré.
- **Cible** : commerciaux curieux mais hésitants sur le légal

### Article 4 — Rapport de visite client automatisé par IA

- **Requête FR** : "rapport visite client automatisé IA"
- **Slug FR** : `rapport-visite-client-automatise-ia`
- **Slug EN** : `ai-automated-client-visit-report`
- **Angle** : Ce que l'IA sait faire aujourd'hui sur un rapport terrain (structuration, extraction d'engagements, détection d'objections). Ce qu'elle ne sait pas faire (juger la relation humaine). Comment en tirer le maximum sans perdre le contrôle.
- **Cible** : profils tech-curieux, managers qui veulent comprendre l'IA appliquée

### Article 5 — Alternative à Gong et Modjo pour le terrain

- **Requête FR** : "alternative Gong terrain" / "alternative Modjo terrain"
- **Slug FR** : `alternative-gong-modjo-terrain`
- **Slug EN** : `gong-modjo-alternative-field-sales`
- **Angle** : Pourquoi Gong et Modjo ne sont pas faits pour le terrain (conçus pour les calls, pas les RDV physiques). Ce dont un commercial terrain a réellement besoin. Les questions à poser avant de choisir un outil.
- **Cible** : commerciaux ou managers qui connaissent déjà Gong/Modjo et cherchent autre chose

### Maillage interne

Chaque article linke vers 1-2 autres articles du blog quand c'est pertinent, + un lien vers `/solution` ou `/comparatif` dans le CTA final.

---

## 3. Layout et UI

### Page liste `/blog`

- Réutilise Nav + Footer existants
- Titre "Blog" + sous-titre court (i18n)
- Grille de cards (style cohérent avec `problem-card` existantes) : titre, date, description, lien "Lire"
- Pas de sidebar, pas de filtres, pas de pagination
- Le switch langue existant filtre les articles FR/EN automatiquement

### Page article `/blog/[slug]`

- Header : titre H1, date, temps de lecture estimé
- Corps : Markdown rendu par Astro, stylé avec la typographie existante du site
- Fil d'Ariane : Accueil > Blog > Titre de l'article
- Encart auteur en fin d'article :
  - Logo Reedly + phrase descriptive (i18n)
  - Bouton CTA vers `/#final-cta`
- Lien hreflang vers la version miroir (FR/EN)
- Pas de barre latérale, pas de commentaires, pas de partage social

### Styles

- Réutilisation maximale du design system existant (`global.css`)
- Nouvelles classes spécifiques au blog dans un fichier `blog.css` importé uniquement sur les pages blog
- Les cards blog suivent le même pattern visuel que les cards existantes (bordures, radius, hover)

---

## 4. SEO par article

- `<title>` et `<meta description>` dynamiques depuis le frontmatter
- URL canonique vers `https://www.reedly.ai/blog/[slug]` (slug plat, sans préfixe de langue)
- `<html lang="fr">` ou `<html lang="en">` selon le frontmatter `lang` (via le nouveau prop `lang` du Layout)
- `<meta property="og:type" content="article">` sur les articles (via le nouveau prop `ogType`)
- `<meta property="article:published_time">` et `<meta property="article:author" content="Reedly">` (via le nouveau prop `articleMeta`)
- `<meta property="og:locale">` : `fr_FR` pour FR, `en_US` pour EN
- `<meta property="og:locale:alternate">` : la locale de la version miroir
- Balises `<link rel="alternate" hreflang="fr" href="...">` et `hreflang="en"` dans le `<head>` (via le nouveau prop `hreflang`, alimenté par le champ `mirror` du frontmatter)
- Schema.org `BlogPosting` en JSON-LD : titre, date de publication, auteur ("Reedly"), description, URL, `inLanguage`
- Ajout des 10 URLs blog (5 FR + 5 EN) dans le sitemap existant (`public/sitemap.xml`)
- Meta `robots: index, follow` (hérité du layout existant)

---

## 5. Structure commune de chaque article

1. **Accroche terrain** — situation vécue, concrète ("Vous sortez de chez le client...")
2. **Le problème développé** — données, exemples concrets, conséquences
3. **La solution / les bonnes pratiques** — le coeur de valeur, conseils actionnables
4. **Encart CTA final** — seul endroit où Reedly est mentionné, avec bouton

---

## Fichiers à créer / modifier

### Nouveaux fichiers

- `src/content.config.ts` — config Content Collections
- `src/pages/blog/index.astro` — page liste
- `src/pages/blog/[...slug].astro` — page article
- `src/styles/blog.css` — styles spécifiques au blog
- `src/content/blog/*.md` — 10 articles (5 FR + 5 EN, fichiers plats)

### Fichiers modifiés

- `src/layouts/Layout.astro` — nouveaux props optionnels : `lang`, `ogType`, `hreflang`, `articleMeta`
- `src/components/Nav.astro` — ajout lien Blog
- `src/components/Footer.astro` — ajout lien Blog
- `public/main.js` — ajout des clés i18n blog
- `public/sitemap.xml` — ajout des 10 URLs blog
