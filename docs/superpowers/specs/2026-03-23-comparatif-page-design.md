# Page Comparatif SEO — /comparatif

**Date**: 2026-03-23
**Ticket**: 4.2 (Phase 5 — Polish)
**Status**: Approved

---

## Objectif

Page publique `/comparatif` sur le site landing Astro (`reedly-landing`) comparant Reedly a 6 concurrents. Double objectif : SEO (capter les requetes "alternative a Gong", "meilleur outil compte-rendu terrain") et conversion (convaincre un prospect en phase de decision).

## Decisions de design

| Decision | Choix | Raison |
|----------|-------|--------|
| Angle | Page hub unique (pas de sous-pages par concurrent) | Stade early — une page bien faite suffit, sous-pages possibles plus tard |
| Ton | Challenger affirme | Coherent avec le messaging landing existant |
| Sections | 5 (hero, tableau, arguments, prix, CTA) | Pas de FAQ ni temoignages (pas de temoignages collectes) |
| Axes tableau | 7 (terrain, rapports, diarisation, vocabulaire, syntheses, hub, prix) | Couvre les differenciants cles sans noyer l'info |

## Structure de la page

### Section 1 — Hero

- **Eyebrow** : "Comparatif" (mono, vert, uppercase)
- **H1** (utiliser `data-i18n-html` car contient `<em>`) : "Pourquoi les commerciaux terrain *choisissent Reedly.*"
- **Lead** : "Les autres transcrivent vos reunions. Reedly les comprend — rapports structures en 11 sections, vocabulaire metier, syntheses strategiques. Le tout a un prix qui a du sens."
- Pas de CTA dans le hero — le tableau est le contenu principal, visible immediatement au scroll

### Section 2 — Tableau comparatif

- **Eyebrow** : "Comparaison"
- **H2** (utiliser `data-i18n-html`) : "Reedly face aux *alternatives.*"
- **Lead** : "Transcription, rapports, terrain, management — voici comment Reedly se positionne face aux principaux outils du marche."

Tableau 8 colonnes (Reedly + 6 concurrents) x 7 lignes :

| Axe | Reedly | Noota | Leexi | Modjo | Gong | Fireflies | Otter |
|-----|--------|-------|-------|-------|------|-----------|-------|
| Concu pour le terrain | oui | partiel | non | non | non | non | non |
| Rapports structures (11 sections) | oui | non | non | non | non | non | non |
| Distinction vocale | oui | oui | oui | oui | oui | oui | non |
| Vocabulaire metier | oui | non | non | partiel | partiel | non | non |
| Syntheses strategiques | oui | non | non | partiel | oui | non | non |
| Hub management | oui | non | partiel | oui | oui | non | non |
| Prix / user / mois | 69 EUR | 19-49 EUR | 23-65 EUR | ~99 EUR | 108-250 USD | 10-29 USD | 8-20 USD |

Rendu visuel :
- Colonne Reedly mise en avant (fond vert subtil, bordure verte)
- Icones : cercle vert check, cercle rouge croix, cercle ambre tilde
- Prix en font mono, Reedly vert, Gong rouge

### Section 3 — Arguments differenciants

- **Eyebrow** : "Pourquoi Reedly"
- **H2** (utiliser `data-i18n-html`) : "Ce que les autres *ne font pas.*"
- **Lead** : "Reedly n'est pas un outil de transcription reconverti. C'est un agent IA concu des le depart pour les commerciaux de terrain."

4 cartes en grille 2x2 (classe CSS dediee `.comp-diff-grid` avec `grid-template-columns: 1fr 1fr`, distinct du `.features-grid` existant qui est 3 colonnes) :

1. **Concu pour le terrain** — icone telephone (SVG outline), texte sur enregistrement micro, hors-ligne, rapport auto
2. **Rapports experts, pas des notes** — icone document (SVG outline), texte sur 11 sections, IA consultante metier
3. **Qui dit quoi** — icone micro (SVG outline), texte sur diarisation commercial/client
4. **Syntheses strategiques** — icone graphique (SVG outline), texte sur agregation tendances/risques/opportunites

Style visuel identique a `.feature-card` (surface + border + icon SVG outline vert dans cercle), mais classe CSS propre au composant.

### Section 4 — Comparatif prix

- **Eyebrow** : "Tarifs"
- **H2** (utiliser `data-i18n-html`) : "Plus complet. *Moins cher.*"
- **Lead** : "Prix par utilisateur par mois, plans equipe."

Barres horizontales triees par prix decroissant. Les largeurs sont des proportions visuelles arbitraires (pas un calcul exact) pour creer un impact visuel clair — Gong tres large, Otter tres court :

1. Gong (108-250 USD) — barre rouge, 100%
2. Modjo (~99 EUR) — barre grise, 40%
3. **Reedly (69 EUR)** — barre verte avec bordure, 28%
4. Leexi (23-65 EUR) — barre grise, 26%
5. Noota (19-49 EUR) — barre grise, 20%
6. Fireflies (10-29 USD) — barre grise, 12%
7. Otter (8-20 USD) — barre grise, 8%

Note en bas : "Fireflies et Otter sont moins chers mais ne font que de la transcription — pas de rapports structures, pas de terrain, pas de syntheses."

### Section 5 — CTA final

- **H2** (utiliser `data-i18n-html`) : "Pret a passer aux *rapports intelligents ?*"
- **Sous-titre** : "Essai gratuit 7 jours. Sans engagement. Rapport en moins de 2 minutes."
- **Boutons** (different du FinalCta de la landing qui utilise des store badges — ici on utilise des boutons simples car la page cible aussi les managers) :
  - "Telecharger l'app" (`.btn--primary`) → lien vers `#final-cta` qui ouvre le notify modal (app pas encore sur les stores, meme pattern que le hero de la landing)
  - "Creer un Hub equipe" (`.btn--ghost`) → lien vers `https://hub.reedly.ai`
- Style : identique au `.final-cta__box` de la landing (surface card avec gradient vert subtil en haut)

## Implementation technique

### Fichiers a creer

1. `src/pages/comparatif.astro` — Page Astro, import Layout + Nav + Footer + nouveau composant Comparatif
2. `src/components/Comparatif.astro` — Composant unique contenant les 5 sections (meme pattern que les autres composants)

### Fichiers a modifier

1. `public/main.js` — Ajouter les cles i18n `comparatif.*` au dictionnaire `T` (FR + EN)
2. `src/components/Nav.astro` — Pas de modification (page SEO, pas dans la nav)
3. `src/components/Footer.astro` — Ajouter un lien "Comparatif" dans les liens footer (avec `data-link-fr="/comparatif"` et `data-link-en="/comparatif"`)

### Conventions a respecter

- **Layout** : `<Layout title="..." description="...">` avec props SEO custom
- **i18n** : `data-i18n` pour le texte brut, `data-i18n-html` pour les titres contenant `<br>` ou `<em>` (utilise `innerHTML`). Cles dans `T.fr` et `T.en` dans main.js.
- **Tracking** : attributs `data-track-id`, `data-track-type`, `data-track-section` sur les CTA
- **CSS** : styles scoped dans le composant Astro + reutilisation des classes globales (`.section`, `.inner`, `.btn`, `.section__eyebrow`, `.reveal`)
- **Animations** : classes `.reveal` et `.reveal-delay-*` (IntersectionObserver existant dans main.js)
- **Responsive** : table scrollable horizontalement sur mobile, grille 2x2 → 1 colonne, boutons empiles

### Cles i18n

Convention de nommage : `comparatif.{section}.{element}`

#### FR (`T.fr`)

```
comparatif.hero.eyebrow = "Comparatif"
comparatif.hero.title = "Pourquoi les commerciaux terrain<br><em>choisissent Reedly.</em>"
comparatif.hero.lead = "Les autres transcrivent vos reunions. Reedly les comprend — rapports structures en 11 sections, vocabulaire metier, syntheses strategiques. Le tout a un prix qui a du sens."

comparatif.table.eyebrow = "Comparaison"
comparatif.table.title = "Reedly face aux <em>alternatives.</em>"
comparatif.table.lead = "Transcription, rapports, terrain, management — voici comment Reedly se positionne face aux principaux outils du marche."
comparatif.table.row1 = "Concu pour le terrain"
comparatif.table.row2 = "Rapports structures (11 sections)"
comparatif.table.row3 = "Distinction vocale"
comparatif.table.row4 = "Vocabulaire metier"
comparatif.table.row5 = "Syntheses strategiques"
comparatif.table.row6 = "Hub management"
comparatif.table.row7 = "Prix / utilisateur / mois"

comparatif.why.eyebrow = "Pourquoi Reedly"
comparatif.why.title = "Ce que les autres <em>ne font pas.</em>"
comparatif.why.lead = "Reedly n'est pas un outil de transcription reconverti. C'est un agent IA concu des le depart pour les commerciaux de terrain."
comparatif.why.card1.title = "Concu pour le terrain"
comparatif.why.card1.text = "Pas une app de visio reconvertie. Enregistrement via le micro du telephone, mode hors-ligne, rapport genere automatiquement des le retour en zone reseau."
comparatif.why.card2.title = "Rapports experts, pas des notes"
comparatif.why.card2.text = "11 sections structurees par secteur : resume executif, besoins client, objections, engagements, prochaines etapes. L'IA raisonne comme un consultant metier."
comparatif.why.card3.title = "Qui dit quoi"
comparatif.why.card3.text = "La diarisation identifie automatiquement commercial vs client. Les besoins exprimes par le client sont distingues des arguments du commercial dans le rapport."
comparatif.why.card4.title = "Syntheses strategiques"
comparatif.why.card4.text = "Agregez une semaine ou un trimestre de rendez-vous en tendances, risques et opportunites priorisees. De l'intelligence commerciale, pas juste de la documentation."

comparatif.price.eyebrow = "Tarifs"
comparatif.price.title = "Plus complet. <em>Moins cher.</em>"
comparatif.price.lead = "Prix par utilisateur par mois, plans equipe."
comparatif.price.note = "Fireflies et Otter sont moins chers mais ne font que de la transcription — pas de rapports structures, pas de terrain, pas de syntheses."

comparatif.cta.title = "Pret a passer aux<br><em>rapports intelligents ?</em>"
comparatif.cta.sub = "Essai gratuit 7 jours. Sans engagement. Rapport en moins de 2 minutes."
comparatif.cta.download = "Telecharger l'app →"
comparatif.cta.hub = "Creer un Hub equipe →"
```

#### EN (`T.en`)

```
comparatif.hero.eyebrow = "Compare"
comparatif.hero.title = "Why field sales reps<br><em>choose Reedly.</em>"
comparatif.hero.lead = "Others transcribe your meetings. Reedly understands them — structured reports in 11 sections, industry vocabulary, strategic syntheses. All at a price that makes sense."

comparatif.table.eyebrow = "Comparison"
comparatif.table.title = "Reedly vs the <em>alternatives.</em>"
comparatif.table.lead = "Transcription, reports, field work, management — here's how Reedly compares to the main tools on the market."
comparatif.table.row1 = "Built for the field"
comparatif.table.row2 = "Structured reports (11 sections)"
comparatif.table.row3 = "Speaker identification"
comparatif.table.row4 = "Industry vocabulary"
comparatif.table.row5 = "Strategic syntheses"
comparatif.table.row6 = "Management hub"
comparatif.table.row7 = "Price / user / month"

comparatif.why.eyebrow = "Why Reedly"
comparatif.why.title = "What the others <em>don't do.</em>"
comparatif.why.lead = "Reedly isn't a repurposed transcription tool. It's an AI agent built from day one for field sales reps."
comparatif.why.card1.title = "Built for the field"
comparatif.why.card1.text = "Not a video call app repurposed. Records via the phone microphone, works offline, generates the report automatically when back in network."
comparatif.why.card2.title = "Expert reports, not notes"
comparatif.why.card2.text = "11 sections structured by industry: executive summary, client needs, objections, commitments, next steps. The AI reasons like an industry consultant."
comparatif.why.card3.title = "Who said what"
comparatif.why.card3.text = "Diarization automatically identifies sales rep vs client. Client-expressed needs are distinguished from the rep's arguments in the report."
comparatif.why.card4.title = "Strategic syntheses"
comparatif.why.card4.text = "Aggregate a week or a quarter of meetings into prioritized trends, risks, and opportunities. Business intelligence, not just documentation."

comparatif.price.eyebrow = "Pricing"
comparatif.price.title = "More complete. <em>Less expensive.</em>"
comparatif.price.lead = "Price per user per month, team plans."
comparatif.price.note = "Fireflies and Otter are cheaper but only do transcription — no structured reports, no field support, no syntheses."

comparatif.cta.title = "Ready for<br><em>intelligent reports?</em>"
comparatif.cta.sub = "Free 7-day trial. No commitment. Report in under 2 minutes."
comparatif.cta.download = "Download the app →"
comparatif.cta.hub = "Create a Team Hub →"
```

### SEO

- **Title** : "Reedly vs Gong, Noota, Modjo — Comparatif outils compte-rendu terrain"
- **Meta description** : "Comparez Reedly aux alternatives : Gong, Noota, Leexi, Modjo, Fireflies, Otter. Rapports structures, vocabulaire metier, diarisation, syntheses. A partir de 69 EUR/mois."
- **H1** : "Pourquoi les commerciaux terrain choisissent Reedly."
- **Canonical** : `https://www.reedly.ai/comparatif`
- **Schema.org** : Pas de schema specifique pour cette page
- **OG image** : Reutiliser `/og-image.png` existante
- **hreflang** : Non necessaire (une seule URL, i18n client-side)

### Pas dans le scope

- Sous-pages par concurrent (`/comparatif/gong`, etc.)
- FAQ section
- Temoignages / social proof
- Schema.org avance (FAQ, Review)
- OG image custom pour la page comparatif
- Lien dans la nav principale (page destinee au trafic SEO organique)
