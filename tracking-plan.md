# Plan de tracking landing Reedly (v2)

## Objectif

Mesurer l'efficacite de la landing sur 4 axes:

- acquisition (d'ou viennent les visiteurs qui convertissent)
- engagement (quels contenus et interactions declenchent l'intention)
- conversion (clic CTA et envoi du formulaire contact)
- parcours utilisateur (enchainement de pages et d'actions qui menent a la conversion)

## Convention de nommage

- format evenement: `domain_object_action` (snake_case)
- pas de PII dans les evenements (pas d'email, pas de nom, pas de message libre)
- `event` en anglais, valeurs de proprietes en anglais (meme si UI FR/EN)

## Proprietes communes (tous les evenements)

- `page_name`: derive dynamiquement de l'URL (voir mapping ci-dessous)
- `page_lang`: `fr` | `en`
- `device_type`: `mobile` | `desktop` (derive de largeur viewport)
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` (si presents)
- `referrer_host`
- `session_id`
- `visitor_id` (persistant cross-sessions, localStorage)
- `visit_number` (1, 2, 3... incremente a chaque nouvelle session)
- `pages_viewed_this_session` (compteur de pages vues dans la session)
- `entry_page` (premiere page de la session)
- `days_since_first_visit` (anciennete du visiteur en jours)

### Mapping page_name

| URL pattern | page_name |
|-------------|-----------|
| `/en/`, `/fr/` | `landing_home` |
| `/en/solution`, `/fr/solution` | `landing_solution` |
| `/en/pricing`, `/fr/tarifs` | `landing_pricing` |
| `/en/comparison`, `/fr/comparatif` | `landing_comparison` |
| `/en/blog`, `/fr/blog` | `landing_blog_index` |
| `/en/blog/{slug}`, `/fr/blog/{slug}` | `landing_blog_article` |

## Evenements

### 1) `landing_page_viewed`
- **Quand**: au chargement de chaque page
- **Ou**: script principal `public/main.js`
- **Props specifiques**:
  - `is_returning_visitor` (bool)
  - `initial_scroll_depth_percent` (number, toujours `0`)
  - `blog_article_slug` (string, uniquement sur pages blog article)

### 2) `landing_cta_clicked`
- **Quand**: clic sur un CTA principal
- **Ou**: liens CTA avec attribut `data-track-id`
- **Props specifiques**:
  - `cta_id`: `hero_download` | `hero_hub` | `pricing_team` | `pricing_enterprise` | `final_store_ios` | `final_store_android` | `nav_login` | `blog_cta_try_free`
  - `cta_type`: `download` | `hub` | `contact` | `login`
  - `section_id`: `hero` | `pricing` | `final_cta` | `nav` | `blog_article`
  - `target_kind`: `anchor` | `external` | `mailto`

### 3) `landing_contact_form_started`
- **Quand**: premier focus dans le formulaire contact
- **Ou**: `src/components/Contact.astro` (script inline)
- **Props specifiques**:
  - `form_id`: `contact_form`
  - `entry_point`: `direct` | `anchor_navigation`

### 4) `landing_contact_form_submitted`
- **Quand**: submit du formulaire (avant appel API)
- **Ou**: `src/components/Contact.astro`
- **Props specifiques**:
  - `form_id`: `contact_form`
  - `subject`: `demo` | `team` | `partnership` | `sector` | `support` | `other` | `unknown`
  - `has_company` (bool)
  - `message_length_bucket`: `0_50` | `51_200` | `201_500` | `500_plus`

### 5) `landing_contact_form_succeeded`
- **Quand**: reponse `200` de `/api/contact`
- **Ou**: `src/components/Contact.astro`
- **Props specifiques**:
  - `form_id`: `contact_form`
  - `subject`
  - `request_duration_ms`

### 6) `landing_contact_form_failed`
- **Quand**: reponse non-`200` ou exception reseau
- **Ou**: `src/components/Contact.astro`
- **Props specifiques**:
  - `form_id`: `contact_form`
  - `subject`
  - `error_type`: `validation` | `server` | `network` | `unknown`
  - `http_status` (nullable)

### 7) `landing_pricing_toggled`
- **Quand**: changement de panel ou de billing
- **Ou**: `public/main.js` (toggles pricing)
- **Props specifiques**:
  - `toggle_type`: `audience` | `billing`
  - `from_value`, `to_value`
  - `active_panel`: `mobile` | `managers`
  - `billing_mode`: `monthly` | `annual`

### 8) `landing_language_changed`
- **Quand**: clic sur FR/EN
- **Props specifiques**:
  - `from_lang`, `to_lang`

### 9) `landing_section_viewed`
- **Quand**: une section devient visible (50% viewport, 1 seule fois/session)
- **Ou**: `public/main.js` (IntersectionObserver dedie analytique)
- **Sections trackees**: `problem`, `how`, `features`, `report-preview`, `hub`, `proof`, `demo`, `pricing`, `contact`, `faq`, `final-cta`, `comparaison`
- **Props specifiques**:
  - `section_id`: id de la section
  - `section_index`: position dans la liste ordonnee
- **Utilite**: analyser la profondeur de lecture et les chutes

### 10) `landing_faq_item_opened`
- **Quand**: ouverture d'une question FAQ
- **Ou**: `public/main.js` (handler FAQ accordion)
- **Props specifiques**:
  - `faq_id`: `q1` a `q6`
  - `open_rank`: ordre d'ouverture dans la session

### 11) `landing_nav_clicked`
- **Quand**: clic sur un lien de navigation interne (header ou footer)
- **Ou**: `public/main.js`
- **Props specifiques**:
  - `nav_target`: URL du lien (ex: `/en/pricing`)
  - `nav_source`: `header` | `footer`

### 12) `landing_notify_modal_opened`
- **Quand**: ouverture du modal de notification (pre-launch app)
- **Ou**: `public/main.js` (openNotifyModal)
- **Props specifiques**: aucune

### 13) `landing_notify_submitted`
- **Quand**: soumission du formulaire de notification email
- **Ou**: `public/main.js` (notify form handler)
- **Props specifiques**:
  - `success` (bool)
  - `http_status` (si echec serveur)
  - `error_type`: `network` (si echec reseau)

### 14) `landing_blog_scroll_depth`
- **Quand**: atteinte d'un milestone de scroll (25%, 50%, 75%, 100%)
- **Ou**: `public/main.js` (uniquement pages blog article)
- **Props specifiques**:
  - `depth_percent`: `25` | `50` | `75` | `100`
  - `blog_article_slug`: slug de l'article

### 15) `landing_blog_time_on_page`
- **Quand**: atteinte d'un milestone de temps passe (30s, 60s, 2min, 5min)
- **Ou**: `public/main.js` (uniquement pages blog article, interval 5s)
- **Props specifiques**:
  - `seconds`: `30` | `60` | `120` | `300`
  - `blog_article_slug`: slug de l'article

## KPIs a suivre

- `landing_to_contact_submit_rate` = `landing_contact_form_submitted` / `landing_page_viewed`
- `landing_contact_success_rate` = `landing_contact_form_succeeded` / `landing_contact_form_submitted`
- `landing_primary_cta_ctr` = `landing_cta_clicked (cta_type in [download, hub])` / `landing_page_viewed`
- `pricing_to_cta_rate` = `landing_cta_clicked where section_id=pricing` / `landing_section_viewed where section_id=pricing`
- `faq_assist_rate` = sessions avec `landing_faq_item_opened` puis `landing_cta_clicked`
- `comparison_conversion_lift` = taux conversion des visiteurs ayant vu `landing_comparison` vs ceux qui ne l'ont pas vue
- `multi_visit_conversion_rate` = taux conversion filtre par `visit_number > 1`
- `blog_to_cta_rate` = `landing_cta_clicked (cta_id=blog_cta_try_free)` / `landing_page_viewed (page_name=landing_blog_article)`
- `blog_engagement_score` = combinaison scroll depth + temps passe

## Segmentation recommandee

- par langue (`page_lang`)
- par device (`device_type`)
- par source (`utm_*`, `referrer_host`)
- par type d'intention (`subject` du formulaire)
- par page d'entree (`entry_page`)
- par anciennete (`visit_number`, `days_since_first_visit`)

## Funnels PostHog a configurer

### 1. Pricing > CTA
`landing_page_viewed (page_name=landing_pricing)` > `landing_cta_clicked`

### 2. Comparatif > Download
`landing_page_viewed (page_name=landing_comparison)` > `landing_cta_clicked (cta_type=download)`

### 3. Blog > Conversion
`landing_page_viewed (page_name=landing_blog_article)` > `landing_cta_clicked (cta_id=blog_cta_try_free)` > `landing_cta_clicked (cta_type=download)`

### 4. Homepage > Contact
`landing_page_viewed (page_name=landing_home)` > `landing_section_viewed (section_id=contact)` > `landing_contact_form_started` > `landing_contact_form_submitted` > `landing_contact_form_succeeded`

### 5. Parcours avant download
Paths analysis filtre sur `landing_cta_clicked (cta_type=download)` comme evenement final

## Insights croisees

- **Parcours avant download**: Paths analysis avec `landing_cta_clicked (cta_type=download)` comme fin
- **Impact comparatif**: Cohort visiteurs `landing_comparison` vs non-visiteurs, comparaison conversion
- **Mobile vs Desktop**: Breakdown par `device_type` sur tous les funnels
- **Multi-visite**: Filtrer par `visit_number > 1` pour comportement visiteurs recurrents
- **Page d'entree**: Correlation entre `entry_page` et taux de conversion
- **Profondeur de lecture**: Correlation entre `landing_section_viewed` count et conversion

## Guardrails data quality

- dedup `landing_page_viewed` (1 fois par chargement)
- `landing_contact_form_started` emis 1 seule fois par session formulaire
- `landing_section_viewed` emis 1 seule fois par section par session
- `landing_faq_item_opened` emis a chaque ouverture (avec `open_rank` pour l'ordre)
- `landing_blog_scroll_depth` emis 1 seule fois par milestone par page
- `landing_blog_time_on_page` emis 1 seule fois par milestone par page
- whitelist stricte des valeurs enum (`cta_id`, `subject`, `error_type`)
- verification hebdo des volumes et taux d'erreur

## Plan d'implementation

### Phase 1 (fait)
- fix `page_name` dynamique (derive de l'URL)
- infrastructure parcours utilisateur (`visitor_id`, `visit_number`, `entry_page`, `pages_viewed_this_session`, `days_since_first_visit`)
- enrichissement `landing_page_viewed` avec `blog_article_slug`

### Phase 2 (fait)
- `landing_section_viewed` via IntersectionObserver
- `landing_faq_item_opened` dans accordion handler
- CTA blog (`blog_cta_try_free`) dans les 2 templates blog
- `landing_notify_modal_opened` et `landing_notify_submitted`
- `landing_nav_clicked` pour navigation interne
- `landing_blog_scroll_depth` et `landing_blog_time_on_page`

### Phase 3 (a faire)
- configurer les funnels et dashboards PostHog
- bandeau de consentement GDPR

## Dashboard recommande (v2)

- **Tuile 1**: visiteurs uniques par page (`landing_page_viewed` breakdown `page_name`)
- **Tuile 2**: CTR CTA principal par page (`landing_cta_clicked` / `landing_page_viewed`)
- **Tuile 3**: funnel contact complet (started > submitted > succeeded)
- **Tuile 4**: funnel pricing > CTA
- **Tuile 5**: top parcours avant download (Paths)
- **Tuile 6**: conversion par source (utm_source)
- **Tuile 7**: engagement blog (scroll depth + temps moyen)
- **Tuile 8**: visiteurs recurrents vs nouveaux (visit_number)
- **Tuile 9**: conversion par device (mobile vs desktop)
- **Tuile 10**: sections les plus vues (landing_section_viewed breakdown)
