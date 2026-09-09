# reedly-landing

Site marketing bilingue (FR/EN) de Reedly, la plateforme d'intelligence terrain
du tourisme B2B.

## Stack

- **Astro 6** en `output: 'static'` avec l'adapter `@astrojs/vercel`. Le site est
  statique ; seuls les endpoints de réservation sont rendus côté serveur
  (`export const prerender = false`).
- **Node 20+**, **pnpm 10** (voir `packageManager`). Utiliser `pnpm`, pas npm.
- **TypeScript strict**, alias `@/*` vers `src/*`.
- **Resend** pour les emails de réservation, **PostHog** pour l'analytics.
- **Pas de framework CSS** : tout est en CSS vanilla dans `src/styles/global.css`.
- Thème clair uniquement. `/docs` (Starlight) garde sa surface sombre, sans lien
  avec le reste du site.

```bash
pnpm dev      # http://localhost:4321
pnpm build    # → dist/
pnpm preview
pnpm test     # vitest (logique des créneaux de réservation)
```

## Pages

12 pages publiques, chacune existant dans les deux langues. `/` redirige en 301
vers `/en` (`vercel.json`), et les slashes finaux sont supprimés.

|                    | FR                             | EN                              |
| ------------------ | ------------------------------ | ------------------------------- |
| Accueil            | `/fr`                          | `/en`                           |
| Transcription IA   | `/fr/features/transcription-ia` | `/en/features/ai-transcription` |
| Hub Manager        | `/fr/features/hub-manager`     | `/en/features/manager-hub`      |
| Mentions légales   | `/fr/mentions-legales`         | `/en/legal-notice`              |
| Confidentialité    | `/fr/confidentialite`          | `/en/privacy-policy`            |
| Cookies            | `/fr/cookies`                  | `/en/cookie-policy`             |
| CGU                | `/fr/cgu`                      | `/en/terms-of-service`          |

Plus `/docs/*` (Starlight, anglais uniquement) et les endpoints API.

Il n'y a ni blog, ni page tarifs dédiée, ni pages comparatives : les tarifs
vivent dans la section `#pricing` de l'accueil. `vercel.json` conserve les 301
depuis toutes les anciennes URLs.

## Structure

```
src/
├── components/          # Une section d'accueil par composant
│   ├── Nav · Hero · Demo · Hub · Compliance · Pricing
│   ├── Testimonials · BookDemo · Faq · FinalCta · Footer
│   ├── Icon.astro       # Registre d'icônes unique (58 entrées)
│   └── feature/         # Blocs des pages produit
├── content/features/    # Contenu YAML des pages produit, par langue
├── data/features.yaml   # Registre id → slugs FR/EN
├── layouts/Layout.astro # Shell HTML : meta, canonical, hreflang, JSON-LD
├── lib/
│   ├── i18n.ts          # Toute la copy de l'accueil, côté serveur
│   ├── load-features.ts · feature-media.ts
│   └── booking/         # Créneaux, config, client Google (testé)
├── pages/
│   ├── {fr,en}/         # Les deux moitiés du site
│   └── api/             # availability · book (server-rendered)
└── styles/global.css    # Tout le design system
public/
├── main.js              # Scroll reveal, nav, langue, FAQ, tarifs, carousel
├── images/ · app/ · integration/ · fonts/
├── robots.txt · llms.txt
```

## Variables d'environnement

Copier `.env.example` vers `.env` et renseigner :

| Variable                                       | Rôle                                              |
| ---------------------------------------------- | ------------------------------------------------- |
| `RESEND_API_KEY`                               | Emails de confirmation de réservation             |
| `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL`      | Destinataire interne et expéditeur vérifié        |
| `PUBLIC_POSTHOG_KEY` / `_HOST` / `_DEFAULTS`   | Analytics (le préfixe `PUBLIC_` expose au client) |
| `GOOGLE_CLIENT_ID` / `_SECRET` / `_REFRESH_TOKEN` | Agenda de réservation                          |
| `GOOGLE_CALENDAR_ID`                           | `primary` par défaut                              |

Le refresh token se génère une fois : `node scripts/google-oauth.mjs`.

## Réservation de démo

La section « Réserver une démo » (`BookDemo.astro`, `#rdv`) est un tunnel
autonome, à la Calendly : le formulaire de qualification révèle un sélecteur de
créneaux de 15 minutes. Les disponibilités sont les créneaux du lundi au
vendredi 09h00-18h00 Europe/Paris moins le FreeBusy de l'agenda hôte ; la
réservation crée un événement Google Meet et invite le visiteur. Pas de base de
données : l'agenda fait foi.

## Déploiement

Déployé sur Vercel. `astro.config.mjs` combine `output: 'static'` et
`@astrojs/vercel` : les endpoints passant `prerender = false` sont émis comme
Vercel Functions. Ne pas basculer sur `output: 'hybrid'` sans intention claire.
