# Instrumentation PostHog du Hub (hub.reedly.ai)

But : rendre mesurable le funnel `landing → inscription`, en reliant le visiteur
anonyme de la landing à son inscription sur le Hub.

Funnel cible (même projet PostHog que la landing) :
`landing_page_viewed → landing_cta_clicked (cta_type=trial) → signup_started → signup_completed`

## 1. Initialisation posthog-js

Utiliser **la même clé projet** et le même host que la landing (`PUBLIC_POSTHOG_KEY`,
`PUBLIC_POSTHOG_HOST`). Points impératifs :

- `cross_subdomain_cookie: true` → partage du cookie d'ID anonyme sur `.reedly.ai`
  (la landing pose déjà ce cookie). C'est le mécanisme principal.
- Adopter l'ID transmis en `?ph_id=` via `bootstrap.distinctID` **dès l'init**
  (filet de sécurité si les cookies tiers sont bloqués — voir §2).
- **Ne pas** appeler `posthog.reset()` au chargement de la page (cela couperait
  le lien avec l'anonyme venu de la landing).

```js
const phId = new URLSearchParams(window.location.search).get("ph_id");

posthog.init(POSTHOG_KEY, {
  api_host: POSTHOG_HOST,
  cross_subdomain_cookie: true,
  // Reprend l'identité anonyme de la landing si le cookie n'a pas suivi.
  // Sans effet quand le cookie a déjà transmis le même id (valeur identique).
  ...(phId ? { bootstrap: { distinctID: phId } } : {}),
  // autocapture / capture_pageview : selon votre préférence
});
```

## 2. Filet de sécurité `?ph_id=` (cookies tiers bloqués)

La landing ajoute `?ph_id=<distinct_id>` au lien vers le Hub. **`ph_id` est un id
anonyme**, pas un utilisateur connu — il faut donc l'**adopter comme `distinct_id`**
à l'initialisation (`bootstrap.distinctID`, voir §1), et **surtout pas** appeler
`posthog.identify(phId)` : `identify()` avec un id anonyme peut être ignoré par la
résolution d'identité de PostHog (exactement le cas qu'on veut couvrir ici).

`identify()` est réservé à l'inscription réussie (§3), avec le **vrai** id utilisateur.

> Alternative si vous ne pouvez pas brancher `bootstrap` à l'init : après init,
> `posthog.alias(phId)` relie l'id courant à l'id de la landing. `alias` (et non
> `identify`) est le primitif correct pour fusionner deux identifiants anonymes.

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
