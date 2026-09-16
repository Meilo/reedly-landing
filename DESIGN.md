---
name: Reedly
description: Site marketing bilingue de Reedly, en thème clair, où chaque commande est un objet qu'on enfonce.
colors:
  brand: "#16a34a"
  brand-dark: "#15803d"
  brand-light: "#4ade80"
  brand-tint: "#dcfce7"
  ink: "#0f172a"
  ink-raised: "#1b2231"
  ink-edge: "#04070f"
  bg: "#f8fafc"
  surface: "#ffffff"
  surface-2: "#f1f5f9"
  surface-3: "#eef2f6"
  muted: "#475569"
  faint: "#64748b"
  line: "rgba(148, 163, 184, 0.28)"
  line-soft: "rgba(148, 163, 184, 0.18)"
  line-edge: "#cbd5e1"
typography:
  display:
    fontFamily: "Lanterosy, sans-serif"
    fontSize: "clamp(2.1rem, 8.5vw, 4.6rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Lanterosy, sans-serif"
    fontSize: "clamp(1.6rem, 5.5vw, 3.3rem)"
    fontWeight: 400
    lineHeight: 1.14
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.02rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.06em"
  eyebrow:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.04em"
rounded:
  sm: "10px"
  md: "14px"
  lg: "24px"
  pill: "999px"
spacing:
  pad: "clamp(16px, 4vw, 28px)"
  section-y: "clamp(80px, 9vw, 140px)"
  container: "1240px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "16px 26px"
  button-ink:
    backgroundColor: "{colors.ink-raised}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "16px 26px"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "16px 22px"
  button-onDark:
    backgroundColor: "transparent"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "16px 22px"
  nav-cta:
    backgroundColor: "{colors.ink-raised}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "11px"
    padding: "11px 17px"
  eyebrow:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.brand}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  card-floating:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "22px"
    padding: "22px clamp(18px, 4vw, 32px)"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.faint}"
    rounded: "8px"
    padding: "7px 11px"
  chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "#ffffff"
    rounded: "8px"
    padding: "7px 11px"
---

# Design System: Reedly

## Overview

**Creative North Star: « L'instrument qu'on enfonce »**

L'interface de Reedly est un outil muni de vraies commandes. Chaque bouton est un objet physique : deux pixels de contour, une arête dure d'une teinte plus sombre sous la semelle, et aucun flou nulle part. Au survol il s'enfonce de 2px et son arête raccourcit d'autant ; à la pression il prend les 2px restants et se retrouve à fleur de surface. L'enfoncement **est** le retour d'information. Rien d'autre ne bouge, aucune couleur ne change.

Autour de ces commandes, le décor se tait. Le site vit sur un champ d'ardoise froide, presque blanc, avec quatre surfaces neutres qui s'empilent sans une seule ombre, et un unique vert qui n'apparaît que là où il faut agir ou valider. La typographie oppose un display à fort caractère, Lanterosy, à un Inter de labeur, et chaque titre se casse en deux lignes dont la seconde passe en retrait de ton. Les photos sont de vrais commerciaux dans de vrais rendez-vous, jamais des illustrations.

Le système est fluide avant d'être responsive : soixante-trois `clamp()` contre trois breakpoints. La page respire en continu entre le téléphone et le grand écran au lieu de sauter d'un palier à l'autre. C'est cohérent avec le produit, qui est utilisé debout, sur la route, dans une agence bruyante, autant que derrière un bureau.

Ce que ce monde refuse, explicitement : le SaaS B2B générique (dégradés violets, illustrations 3D flottantes, captures en perspective, glassmorphism décoratif), le tableau de bord sombre « data » (le thème clair unique est un choix, pas un manque), et l'imagerie d'outil de visio (pas de grille de visages, pas de forme d'onde audio). Reedly est né pour le rendez-vous physique et son apparence doit le dire.

**Key Characteristics:**

- Commandes en relief, arête dure, zéro flou, l'enfoncement comme unique retour
- Thème clair unique, quatre surfaces neutres empilées sans ombre
- Un seul vert, réservé à l'action et à la validation
- Lanterosy en display contre Inter en corps, titres en deux lignes
- Fluide par défaut : `clamp()` partout, breakpoint en dernier recours
- Photographie documentaire de terrain, jamais d'illustration

## Colors

Un champ d'ardoise froide presque monochrome, traversé par un seul vert. La palette est bâtie pour que ce vert reste rare : sur une page donnée il ne porte que les boutons d'action, les eyebrows et les marques de validation.

### Primary

- **Vert Signal** (`{colors.brand}`) : la seule couleur vive du système. Fond des boutons primaires, texte des eyebrows, coches des listes de fonctionnalités, liens. C'est un voyant qui s'allume, pas une couleur de marque à étaler.
- **Vert Enfoncé** (`{colors.brand-dark}`) : l'arête sous le bouton primaire et sa couleur de lien au survol. C'est littéralement la profondeur du vert, la tranche qu'on voit parce que le bouton dépasse de la page.
- **Vert Veilleuse** (`{colors.brand-light}`) : le vert des sections sombres, sur `<em>` des titres et sur les eyebrows. Le Vert Signal ne tient pas le contraste sur l'Ardoise Nuit ; celui-ci prend le relais.
- **Vert Halo** (`{colors.brand-tint}`) : fond de sélection de texte et pastilles très discrètes. Jamais un fond de bloc.

### Neutral

- **Ardoise Nuit** (`{colors.ink}`) : le texte courant et le fond des sections sombres. Même valeur des deux côtés, ce qui fait que les sections sombres sont l'exact négatif des claires.
- **Ardoise Bombée** (`{colors.ink-raised}`) : le remplissage des boutons encre, un cran plus clair que l'Ardoise Nuit pour que le bouton se détache du texte qui l'entoure.
- **Arête Noire** (`{colors.ink-edge}`) : la tranche sous les boutons encre, et leur contour.
- **Papier Froid** (`{colors.bg}`) : le fond par défaut de toute section.
- **Blanc Pur** (`{colors.surface}`) : les sections `.section--white` et les cartes qui flottent.
- **Gris Atelier** (`{colors.surface-2}`) et **Gris Cadre** (`{colors.surface-3}`) : les deux crans plus profonds, pour les cadres photo et les fonds de démo. Ce sont eux qui donnent la profondeur des sections, à la place des ombres.
- **Ardoise Moyenne** (`{colors.muted}`) : les chapôs et les paragraphes secondaires.
- **Ardoise Claire** (`{colors.faint}`) : les labels de formulaire, les mentions, et le `<em>` des titres en section claire.
- **Filet** (`{colors.line}`), **Filet Doux** (`{colors.line-soft}`), **Arête Claire** (`{colors.line-edge}`) : les trois traits. Le dernier sert à la fois de contour et de tranche aux boutons fantômes.

### Named Rules

**La règle du seul voyant.** Le Vert Signal ne porte qu'une action à la fois dans un champ de vision. Deux boutons verts côte à côte, c'est une erreur de hiérarchie : le second passe en encre ou en fantôme. Sa rareté est ce qui le rend lisible.

**La règle du thème unique.** Le site marketing est en clair, uniquement. Il n'y a ni variable de thème, ni `prefers-color-scheme`, ni sélecteur. Les sections sombres sont un contraste de rythme à l'intérieur du thème clair, pas un mode. (`/docs`, sous Starlight, garde sa propre surface sombre : c'est un autre système.)

## Typography

**Display Font:** Lanterosy (auto-hébergée en woff2, `font-display: swap`, une seule graisse : 400)
**Body Font:** Inter (`wght@200..800`, avec `system-ui` puis `-apple-system` en repli)

**Character:** Un display au dessin marqué, posé en une seule graisse et toujours en grand, contre un Inter qui fait tout le reste sans se faire remarquer. Le contraste ne vient pas de la graisse mais de la nature des deux caractères : l'un a une voix, l'autre est transparent.

### Hierarchy

- **Display** (400, `clamp(2.1rem, 8.5vw, 4.6rem)`, interligne 1.02, `text-wrap: balance`) : le titre de hero, un par page. L'équilibrage n'est appliqué qu'ici ; sur un `h2` il déplacerait les césures voulues.
- **Headline** (400, `clamp(1.6rem, 5.5vw, 3.3rem)`, interligne 1.14) : les titres de section.
- **Body** (400, `1.02rem`, interligne 1.65, `max-width: 52ch`) : les chapôs et le corps de texte. La variante hero monte à `1.08rem` avec un interligne de 1.6.
- **Label** (800, `15px`, `letter-spacing: 0.06em`, capitales) : les libellés de boutons. La variante compacte de la nav descend à `12.5px` sans rien changer d'autre.
- **Eyebrow** (600, `12px`, `letter-spacing: 0.04em`, capitales) : les surtitres en pastille au-dessus des titres de section.

### Named Rules

**La règle des deux lignes.** Tout titre de section se casse en deux lignes avec un `<br />` littéral, la seconde enveloppée dans `<em>`. Ce `<em>` n'est pas de l'italique : il est neutralisé en `font-style: normal` et passe en Ardoise Claire sur fond clair, en Vert Veilleuse sur fond sombre. Un titre d'une seule ligne casse le rythme de la page entière.

**La règle de Lanterosy.** Lanterosy ne descend jamais sous le niveau des titres. Pas de bouton, pas de label, pas de paragraphe. Elle n'a qu'une graisse et n'est pas dessinée pour le petit corps.

## Layout

Un conteneur de `1240px` maximum, centré, avec une gouttière fluide (`clamp(16px, 4vw, 28px)`). Les sections respirent sur `clamp(80px, 9vw, 140px)` en vertical, ce qui va de 80px sur un téléphone à 140px sur un grand écran sans palier intermédiaire.

Les grilles internes sont presque toutes en `repeat(auto-fit, minmax(min(100%, Xpx), 1fr))`, avec un `min(100%, …)` qui garantit qu'une colonne ne dépasse jamais son parent sur petit écran. La réorganisation se fait donc par la grille elle-même, pas par des règles de largeur.

Trois breakpoints seulement dans tout le système : `900px`, `760px` et `720px`, et chacun ne sert qu'à réordonner une mise en page qui ne pouvait pas se résoudre en fluide.

Les maquettes de téléphone de la section Demo utilisent un registre à part : un conteneur en `container-type: inline-size` définit `--u: 0.25641cqw`, c'est-à-dire un pixel de la maquette d'origine en 390px de large, et chaque dimension du bloc est un `calc(var(--u) * N)`. L'écran est donc redimensionné avec sa coque, jamais en pixels CSS fixes.

### Named Rules

**La règle du fluide d'abord.** On met à l'échelle avec `clamp()` et des grilles `auto-fit`. Un breakpoint de largeur est un dernier recours, réservé aux cas où la mise en page doit réellement se réordonner. Le rapport actuel, soixante-trois `clamp()` pour trois breakpoints, est la cible et non un accident.

**La règle du pixel de maquette.** À l'intérieur de `.appui`, aucune valeur en `px` absolus. Tout passe par `--u`, y compris la prop `size` des icônes. Un `px` posé là casse au format où le téléphone est réellement rendu, autour de 252px de large.

## Elevation & Depth

Le système utilise trois registres de profondeur distincts, chacun avec un rôle assigné. Ce n'est pas une inconsistance : c'est la doctrine.

1. **L'arête dure, pour les commandes.** Un `box-shadow` à décalage vertical et flou nul, d'une teinte plus sombre que le remplissage. Le bouton n'a pas d'ombre portée, il a une tranche. C'est ce qui le rend enfonçable.
2. **L'ombre atmosphérique, pour ce qui flotte.** Des ombres multi-couches à grand flou et étalement négatif, réservées aux rares éléments réellement détachés de la page : la carte de réservation, la fenêtre du Hub, la barre de nav compacte.
3. **L'empilement tonal plat, pour les sections.** Papier Froid, Blanc Pur, Gris Atelier, Gris Cadre. Aucune ombre entre deux zones de page : la profondeur vient du ton.

### Shadow Vocabulary

- **Arête de commande** (`0 4px 0 0 <teinte sombre>`) : sous tout `.btn`. Passe à `0 2px` au survol, à `0` à la pression.
- **Arête compacte** (`0 3px 0 0 <teinte sombre>`) : la même chose en plus court, pour `.nav__cta`, `.store-badge` et `.hub__composer-send`.
- **Carte flottante** (`0 2px 4px rgba(15,23,42,.04), 0 18px 32px -18px rgba(15,23,42,.16), 0 48px 90px -50px rgba(15,23,42,.42)`) : la carte de réservation. Trois couches, du contact au halo lointain.
- **Fenêtre applicative** (`0 0 0 1px rgba(15,23,42,.05), 0 40px 80px -50px rgba(15,23,42,.45)`) : la fenêtre du Hub, un filet de contour plus une ombre profonde.
- **Verre de nav** (`0 10px 30px -18px rgba(15,23,42,.28), inset 0 1px 0 rgba(255,255,255,.7)`) : la nav compacte, avec `backdrop-filter: blur(18px) saturate(180%)`.

### Named Rules

**La règle du zéro flou sur les commandes.** Aucun bouton du système ne porte d'ombre floue. Si une commande a besoin de se détacher, elle prend du contour ou une arête plus haute, jamais du flou. Le flou est réservé à ce qui flotte vraiment.

**La règle de l'empilement muet.** Deux zones de page adjacentes se distinguent par leur ton, jamais par une ombre. Il y a quatre surfaces disponibles pour ça.

## Shapes

Trois rayons et une pastille. `24px` pour les grands blocs (cadres photo, cartes de plan, fenêtres), `14px` pour les commandes et les blocs moyens, `10px` pour les petits éléments, `999px` pour les eyebrows et les pastilles. La carte de réservation fait exception à `22px`, valeur reprise telle quelle de la maquette.

Les bordures sont systématiquement d'un pixel en gris-bleu translucide, sauf sur les boutons où elles montent à deux pixels opaques, parce qu'elles participent au volume plutôt qu'à la séparation. Les cadres photo découpent en `overflow: hidden` et zooment leur image de 4% au survol sur `0.7s`.

La coque de téléphone est la seule géométrie asymétrique du système : `38px` en haut, zéro en bas, parce qu'elle sort du cadre par le bas.

### Named Rules

**La règle de l'arête franche.** Les angles sont arrondis, jamais les arêtes. Un bouton enfoncé montre une tranche nette d'une teinte plus sombre. Aucun dégradé, aucun biseau, aucune lumière simulée, à l'exception du liseré interne d'un pixel sur les boutons encre.

## Components

Le caractère d'ensemble : **robuste et lisible**. Tout est dimensionné pour être vu et touché vite, y compris sur un téléphone en déplacement. La lisibilité prime sur la finesse.

### Buttons

- **Shape:** angles moyens (`14px`), contour de 2px, arête de 4px sans flou.
- **Primary:** fond Vert Signal, texte blanc, contour et arête en Vert Enfoncé. Rembourrage `16px 26px`. Label en capitales, 800, `0.06em`.
- **Ink:** fond Ardoise Bombée, contour et arête en Arête Noire, plus un liseré interne `inset 0 1px 0 rgba(255,255,255,.1)` qui simule la lumière sur le haut de la touche.
- **Ghost:** fond Blanc Pur, contour et arête en Arête Claire, texte Ardoise Nuit. Rembourrage resserré à `16px 22px`.
- **onDark:** fond transparent, contour et arête en blanc à 30%. La variante des sections sombres.
- **Block:** pleine largeur, rembourrage `16px 15px`.
- **Hover / Active:** `translateY(2px)` avec l'arête ramenée à 2px, puis `translateY(4px)` avec l'arête à zéro. Transition de `0.1s` sur la transformée et l'ombre.

### Chips

- **Style:** angles `8px`, rembourrage `7px 11px`, `0.88rem` en graisse 500, fond transparent et texte Ardoise Claire au repos.
- **State:** l'état actif bascule en fond Ardoise Nuit et texte blanc. Transition de `0.16s` sur le fond et la couleur. Utilisé pour la taille d'équipe du formulaire de réservation.

### Cards / Containers

- **Corner Style:** `24px` par défaut, `22px` pour la carte de réservation.
- **Background:** Blanc Pur sur les sections claires, Gris Cadre pour les cadres qui reçoivent une image ou une démo.
- **Shadow Strategy:** aucune ombre par défaut. Seules la carte de réservation et la fenêtre du Hub reçoivent le registre atmosphérique (voir Elevation & Depth).
- **Border:** un pixel en Filet Doux quand la carte est sur fond blanc et a besoin de se délimiter.
- **Internal Padding:** `clamp(26px, 3vw, 38px)` pour les cartes de plan, `22px clamp(18px, 4vw, 32px)` par rangée de formulaire.

### Inputs / Fields

Les champs n'ont pas de boîte. Chaque rangée du formulaire est une bande horizontale séparée de la précédente par un filet à 14% d'opacité : à gauche un label de `110px` en `0.82rem` Ardoise Claire, à droite le contrôle lui-même, sans bordure, sans fond, sans `outline`, en `1.02rem`, qui hérite de la police du document. Les `select` perdent leur `appearance` native.

- **Focus:** il n'y a pas de style de focus par champ. La règle globale `:focus-visible` pose un contour de 2px en Vert Signal à 3px de décalage, sur tout élément focusable du site.
- **Densité:** deux rangées seulement portent un `min-height` (`74px` pour le rôle, `73px` pour la taille d'équipe), parce que leur contrôle est plus court que leur label. C'est une valeur reprise de la maquette, pas une règle générale.

### Navigation

Barre collante en haut de page, fond transparent au repos. Au-delà du seuil de défilement elle se contracte : largeur ramenée à `1000px`, angles `14px`, fond blanc à 45% avec `backdrop-filter: blur(18px) saturate(180%)`, liseré interne blanc et ombre douce. La transition dure `0.4s` sur la courbe maison.

Au-dessus d'une section marquée `data-nav-dark`, l'encre de la nav bascule en blanc. Son CTA reprend la recette des boutons encre en format compact : `11px 17px`, angles `11px`, arête de 3px, label à `12.5px`.

### Phone mockups (signature)

Les deux écrans d'application de la section Demo sont du balisage, pas des captures. Coque en dégradé `145deg` de `#454a55` à `#0c0e12`, arrondie à `38px` en haut seulement, avec un liseré interne clair et une ombre remontante. À l'intérieur, tout est exprimé en `--u` (voir Layout). Deux calibrages sont porteurs : les corps de texte à `15.14` et `14.6` reproduisent exactement les césures de la maquette d'origine, et les mentions `(3‑4 jours)` / `(3‑4 days)` utilisent un trait d'union insécable (U+2011) sans quoi la ligne casse après le tiret.

## Do's and Don'ts

### Do:

- **Do** utiliser le registre d'icônes unique (`src/components/Icon.astro`) pour toute icône d'interface. Une icône manquante s'y ajoute, elle ne se dessine pas dans un composant.
- **Do** casser chaque titre de section en deux lignes, la seconde dans un `<em>`, et le rendre avec `set:html`.
- **Do** donner à toute nouvelle commande une arête (`--btn-edge`) et laisser la géométrie de survol et de pression à `.btn`. Une variante ne définit que sa teinte d'arête, éventuellement son `--btn-inset`.
- **Do** mettre à l'échelle avec `clamp()` et des grilles `auto-fit` avant d'envisager un breakpoint.
- **Do** distinguer deux zones de page par leur surface tonale, parmi les quatre disponibles.
- **Do** utiliser de la photographie documentaire de vrais commerciaux en rendez-vous, cadrée depuis `src/lib/feature-media.ts`.

### Don't:

- **Don't** ajouter une couleur de survol à un bouton. L'enfoncement est le retour d'information, et c'est le seul.
- **Don't** poser d'ombre floue sous une commande. Le flou appartient à ce qui flotte réellement.
- **Don't** faire apparaître le Vert Signal deux fois dans le même champ de vision. La deuxième action passe en encre ou en fantôme.
- **Don't** introduire de variable de thème, de `prefers-color-scheme` ou de palette sombre sur le site marketing. Le thème clair est un choix.
- **Don't** utiliser Lanterosy ailleurs que dans un titre.
- **Don't** écrire de `px` absolus à l'intérieur de `.appui`, ni toucher aux corps `15.14` / `14.6` des maquettes de téléphone.
- **Don't** reprendre l'imagerie de la catégorie : dégradés violets, illustrations 3D, captures en perspective, grilles de visages en visio, formes d'onde audio.
