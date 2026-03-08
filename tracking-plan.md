# Plan de tracking landing Reedly (v1)

## Objectif

Mesurer l'efficacite de la landing sur 3 axes:

- acquisition (d'ou viennent les visiteurs qui convertissent)
- engagement (quels contenus et interactions declenchent l'intention)
- conversion (clic CTA et envoi du formulaire contact)

## Convention de nommage

- format evenement: `domain_object_action` (snake_case)
- pas de PII dans les evenements (pas d'email, pas de nom, pas de message libre)
- `event` en anglais, valeurs de proprietes en anglais (meme si UI FR/EN)

## Proprietes communes (tous les evenements)

- `page_name`: `landing_home`
- `page_lang`: `fr` | `en`
- `device_type`: `mobile` | `desktop` (derive de largeur viewport)
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` (si presents)
- `referrer_host`
- `session_id`

## Evenements P0 (MVP)

### 1) `landing_page_viewed`
- **Quand**: au chargement de la page d'accueil
- **Ou**: script principal `public/main.js`
- **Props specifiques**:
  - `is_returning_visitor` (bool)
  - `initial_scroll_depth_percent` (number, toujours `0`)

### 2) `landing_cta_clicked`
- **Quand**: clic sur un CTA principal
- **Ou**: liens CTA dans `Hero`, `Pricing`, `FinalCta`, `Nav`
- **Props specifiques**:
  - `cta_id`: `hero_download` | `hero_hub` | `pricing_free` | `pricing_pro` | `pricing_business` | `pricing_team` | `pricing_enterprise` | `final_store_ios` | `final_store_android` | `final_hub` | `nav_login`
  - `cta_type`: `download` | `hub` | `contact` | `login`
  - `section_id`: `hero` | `pricing` | `final_cta` | `nav`
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

## Evenements P1 (optimisation)

### 7) `landing_section_viewed`
- **Quand**: une section devient visible (50% viewport, 1 seule fois/session)
- **Sections**: `problem`, `how`, `features`, `report`, `hub`, `proof`, `pricing`, `contact`, `faq`, `final_cta`
- **Utilite**: analyser la profondeur de lecture et les chutes

### 8) `landing_faq_item_opened`
- **Quand**: ouverture d'une question FAQ
- **Props specifiques**:
  - `faq_id`: `q1` a `q5`
  - `open_rank`: ordre d'ouverture dans la session

### 9) `landing_pricing_toggled`
- **Quand**: changement de panel ou de billing
- **Ou**: `public/main.js` (toggles pricing existants)
- **Props specifiques**:
  - `toggle_type`: `audience` | `billing`
  - `from_value`, `to_value`
  - `active_panel`: `mobile` | `managers`
  - `billing_mode`: `monthly` | `annual`

### 10) `landing_language_changed`
- **Quand**: clic sur FR/EN
- **Props specifiques**:
  - `from_lang`, `to_lang`

## KPIs a suivre

- `landing_to_contact_submit_rate` = `landing_contact_form_submitted` / `landing_page_viewed`
- `landing_contact_success_rate` = `landing_contact_form_succeeded` / `landing_contact_form_submitted`
- `landing_primary_cta_ctr` = `landing_cta_clicked (cta_type in [download, hub])` / `landing_page_viewed`
- `pricing_to_cta_rate` = `landing_cta_clicked where section_id=pricing` / `landing_section_viewed where section_id=pricing`
- `faq_assist_rate` = sessions avec `landing_faq_item_opened` puis `landing_cta_clicked`

## Segmentation recommandee

- par langue (`page_lang`)
- par device (`device_type`)
- par source (`utm_*`, `referrer_host`)
- par type d'intention (`subject` du formulaire)

## Guardrails data quality

- dedup `landing_page_viewed` (1 fois par chargement)
- `landing_contact_form_started` emis 1 seule fois par session formulaire
- whitelist stricte des valeurs enum (`cta_id`, `subject`, `error_type`)
- verification hebdo des volumes et taux d'erreur

## Plan d'implementation

### Phase 1 (rapide, priorite business)
- implementer les 6 evenements P0
- valider via debug PostHog en local + prod
- construire 1 dashboard "Landing Conversion Core"

### Phase 2 (optimisation CRO)
- ajouter P1 (section, faq, pricing, langue)
- creer 1 funnel par source trafic (`utm_source`)
- brancher des experimentations copy/CTA basees sur les insights

## Dashboard minimal (v1)

- **Tuile 1**: visiteurs uniques (`landing_page_viewed`)
- **Tuile 2**: CTR CTA principal (`landing_cta_clicked`)
- **Tuile 3**: submissions formulaire (`landing_contact_form_submitted`)
- **Tuile 4**: succes formulaire (`landing_contact_form_succeeded`)
- **Tuile 5**: erreurs formulaire (`landing_contact_form_failed`, split `error_type`)
- **Tuile 6**: conversion par langue et device
