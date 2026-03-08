# reedly-landing

Landing page marketing de Reedly — projet Astro indépendant.

## Stack

- **Astro 4** — SSG/hybrid, zéro JS inutile
- **Resend** — envoi des emails du formulaire de contact (côté serveur)
- Aucune dépendance CSS externe — tout est en vanilla CSS dans `src/styles/global.css`

## Structure

```
src/
├── components/        # Un composant Astro par section de la page
│   ├── Nav.astro
│   ├── Hero.astro
│   ├── Problem.astro
│   ├── Features.astro
│   ├── ReportPreview.astro
│   ├── How.astro
│   ├── Hub.astro
│   ├── Proof.astro
│   ├── Pricing.astro
│   ├── Contact.astro  ← formulaire + intégration Resend
│   ├── Faq.astro
│   ├── FinalCta.astro
│   └── Footer.astro
├── layouts/
│   └── Layout.astro   # Shell HTML, fonts, meta
├── pages/
│   ├── index.astro    # Page principale
│   └── api/
│       └── contact.ts ← endpoint POST pour le formulaire
└── styles/
    └── global.css     # Tous les styles
public/
├── favicon.svg
└── main.js            # JS interactif (i18n FR/EN, animations, FAQ, pricing toggle)
```

## Démarrage

```bash
# 1. Installer les dépendances
pnpm install   # ou npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# → Renseigner RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL

# 3. Démarrer en dev
pnpm dev       # http://localhost:4321
```

## Variables d'environnement

| Variable             | Description                                     | Exemple                    |
| -------------------- | ----------------------------------------------- | -------------------------- |
| `RESEND_API_KEY`     | Clé API Resend (https://resend.com/api-keys)    | `re_xxxxxxxxxxxxxxxxxxxx`  |
| `CONTACT_TO_EMAIL`   | Email qui reçoit les soumissions du formulaire  | `contact@reedly.ai`        |
| `CONTACT_FROM_EMAIL` | Expéditeur (domaine vérifié dans Resend requis) | `noreply@reedly.ai`        |
| `PUBLIC_POSTHOG_KEY` | Clé projet PostHog (frontend)                   | `phc_xxxxxxxxxxxxxxxxx`    |
| `PUBLIC_POSTHOG_HOST` | Host API PostHog                                | `https://us.i.posthog.com` |
| `PUBLIC_POSTHOG_DEFAULTS` | Snapshot de config par défaut PostHog      | `2026-01-30`               |

## Build & déploiement

```bash
pnpm build     # Génère le build dans dist/
pnpm preview   # Prévisualiser le build en local
```

### Vercel (recommandé pour la prod)

Swapper l'adapter dans `astro.config.mjs` :

```js
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'hybrid',
  adapter: vercel(),
});
```

Puis installer : `pnpm add @astrojs/vercel`

### Node.js standalone (défaut)

Le build actuel utilise `@astrojs/node` en mode standalone.
Le serveur se lance avec : `node dist/server/entry.mjs`

## Formulaire de contact

Le formulaire (`Contact.astro`) envoie une requête `POST /api/contact`.
L'endpoint (`src/pages/api/contact.ts`) :
- Valide les champs requis
- Appelle Resend pour envoyer l'email
- Répond avec `{ success: true }` ou `{ error: "..." }`

Pour tester sans clé Resend, commenter l'appel Resend dans `contact.ts`
et retourner `{ success: true }` directement.
