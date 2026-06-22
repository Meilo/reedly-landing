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
