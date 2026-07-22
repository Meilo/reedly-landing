# Native booking calendar — design

**Date:** 2026-07-22
**Branch:** feat/sales-led-restructure
**Status:** Approved (design)

## Overview

Replace the third-party calendar placeholder in the "Réserver une démo" section
with a native, Calendly-like booking flow. Visitors pick a 15-minute slot from
real availability, and confirming the slot creates a Google Calendar event with a
Google Meet link on the host's Workspace calendar, inviting the visitor.

Deliberately simple and self-hosted — not a commercial scheduling product.

## Goals

- Visitors book a 15-minute demo from real availability, no third-party embed.
- Booking auto-creates a Google Calendar event **with a Google Meet link** and
  invites the visitor (who receives the standard Google invite + Meet link).
- Availability reflects the host's actual calendar (busy times are excluded).
- Bilingual (FR/EN) via the existing `data-i18n` mechanism.
- No database, no admin UI, minimal moving parts.

## Non-goals (YAGNI)

- No custom reschedule/cancel UI. Rescheduling and cancellation are handled
  through the standard Google Calendar invitation (the invitee can decline or
  propose a new time; the host manages the event in Google Calendar).
- No multiple hosts / round-robin. Single host account.
- No login/accounts, no payment, no admin dashboard.
- No CAPTCHA. A lightweight honeypot field is the only bot guard.

## Confirmed parameters

| Parameter | Value |
|---|---|
| Host account | One Google **Workspace** account (OAuth refresh token) |
| Working hours | Mon–Fri, 09:00–18:00 |
| Timezone (source of truth) | `Europe/Paris` |
| Slot length | 15 minutes |
| Minimum notice | 120 minutes (no booking sooner than 2h from now) |
| Booking horizon | 14 days |
| Display timezone | Visitor's local timezone (with "heure de Paris" label) |

## UX flow

Lives inside `src/components/BookDemo.astro` (`#rdv`). The existing qualifying
form (role / team size / sector / email) is unchanged. On submit it reveals the
native calendar instead of the old placeholder.

1. **Qualify** (existing): role, team size, sector, email → "Voir les créneaux".
2. **Pick a day**: list of available days within the 14-day horizon; only days
   with ≥ 1 free slot are shown. Fetched from `GET /api/availability`.
3. **Pick a slot**: 15-minute slots for the selected day, rendered in the
   visitor's local timezone (formatted client-side with `Intl`), with a
   "heure de Paris" reference label.
4. **Confirm**: recap of date/time + **Name** field (email prefilled from the
   qualifying step, editable) + optional note → "Confirmer le rendez-vous".
5. **Success**: confirmation with date/time, "Invitation Google Agenda envoyée à
   \<email>", and the Meet link. On a `409 slot_taken`, availability is
   re-fetched and the visitor is asked to pick another slot.

States to handle: loading, empty (no availability in horizon), network/server
error, slot-taken conflict.

## Architecture

The Google calendar is the source of truth. A booking is a calendar event, which
then blocks the slot for subsequent availability queries. **No database.**

### Endpoints (both `export const prerender = false`)

**`GET /api/availability`**

- Computes availability live: working-hours grid **minus** the host calendar's
  FreeBusy over `[now + minNotice, now + horizon]`.
- Response:
  ```json
  {
    "timezone": "Europe/Paris",
    "slotMinutes": 15,
    "days": [
      { "date": "2026-07-23",
        "slots": ["2026-07-23T09:00:00+02:00", "2026-07-23T09:15:00+02:00"] }
    ]
  }
  ```
- On Google/config error: `500 { "error": "unavailable" }`.

**`POST /api/book`**

- Body:
  ```json
  {
    "start": "2026-07-23T09:00:00+02:00",
    "email": "visitor@agency.fr",
    "name": "Prénom Nom",
    "note": "optional",
    "role": "head_of_sales",
    "team_size": "6-15",
    "sector": "agence_voyages",
    "company_website": ""   // honeypot, must be empty
  }
  ```
- Validation guard (pure, testable): required fields present; email format;
  `start` is grid-aligned, in the future respecting min-notice, within working
  hours, and inside the horizon.
- Re-check FreeBusy for `[start, start+15m]`; if busy → `409 { "error": "slot_taken" }`.
- Create the event; return `200 { "start", "end", "meetLink" }`.
- Honeypot filled → treat as success without creating anything (silent drop).

### Modules

- `src/lib/booking/config.ts` — working hours, slot length, min notice, horizon,
  timezone, event summary/description templates, `calendarId` (from env, default
  `primary`).
- `src/lib/booking/availability.ts` — **pure** `generateSlots(...)` (no I/O).
- `src/lib/booking/google.ts` — OAuth token refresh, `getBusy()`, `createEvent()`.
- `src/pages/api/availability.ts`, `src/pages/api/book.ts` — thin HTTP wrappers.

## Availability algorithm (core, TDD)

```
generateSlots({ now, horizonDays, workingHours, slotMinutes,
                minNoticeMinutes, timezone, busy }) -> string[] (ISO slot starts)
```

- Pure function, no network, no `Date.now()` inside (now is injected) → fully
  deterministic and unit-testable.
- Steps: for each day in `[today, today + horizonDays]` that is a working day,
  enumerate `slotMinutes` starts across the day's working windows; drop any slot
  starting before `now + minNoticeMinutes`; drop any slot overlapping a `busy`
  interval; return remaining starts as tz-aware ISO strings.
- Timezone correctness (incl. DST transitions) via **luxon** on the server. The
  client never does timezone math — it formats server-provided ISO strings with
  `Intl.DateTimeFormat`.

Test cases (at minimum):
- Min-notice cutoff removes near-term slots.
- A `busy` interval removes exactly the overlapping slots.
- Weekend days produce no slots.
- A fully-busy working day produces no slots (day omitted from `days`).
- Slots land on the 15-minute grid at working-hours boundaries.
- DST spring-forward / fall-back day generates correct wall-clock slots.

## Google integration

- Auth: `google-auth-library` `OAuth2Client` with `GOOGLE_CLIENT_ID` /
  `GOOGLE_CLIENT_SECRET` / `GOOGLE_REFRESH_TOKEN`; the library refreshes access
  tokens automatically.
- FreeBusy: `POST https://www.googleapis.com/calendar/v3/freeBusy` for the
  configured calendar over the query window (direct `fetch`, bearer token).
- Create event: `POST .../calendars/{calendarId}/events?conferenceDataVersion=1&sendUpdates=all`
  with `conferenceData.createRequest` (`conferenceSolutionKey.type = hangoutsMeet`),
  the visitor as an attendee, summary/description from config, `start`/`end` in
  `Europe/Paris`. Read the Meet URL from the response `hangoutLink` /
  `conferenceData.entryPoints`.
- Uses the lean REST approach (no heavyweight `googleapis` package).

## Notifications

- **To the visitor:** the standard Google Calendar invitation with the Meet link,
  sent by Google via `sendUpdates=all`.
- **Internal:** reuse Resend (existing `RESEND_API_KEY`, `CONTACT_TO_EMAIL`,
  `CONTACT_FROM_EMAIL`) to email the team a recap (qualifying data + booked time
  + Meet link) so they have context beyond the raw calendar event. A Resend
  failure must **not** fail the booking (log and continue).

## Configuration & prerequisites

Env (added to `.env` and Vercel):

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_CALENDAR_ID` (optional, default `primary`)
- Reuses `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`

One-time setup (documented in the plan; `scripts/google-oauth.mjs` provided):

1. Google Cloud project → enable **Google Calendar API**.
2. Create an OAuth 2.0 Client (Desktop) → client id/secret.
3. Run `node scripts/google-oauth.mjs`, consent with the host Workspace account,
   scopes `calendar.events` + `calendar.readonly` → obtain the refresh token.
4. Put the four values in `.env` (and Vercel project env).

If env is missing, endpoints return `500 { "error": "unavailable" }` and the UI
shows a graceful fallback message (with the existing contact path as backup).

## Dependencies added

- `luxon` (+ `@types/luxon`) — server-side timezone math.
- `google-auth-library` — OAuth token refresh.
- `vitest` — test runner (project currently has none); wire a `test` script.

## i18n

All calendar UI strings go through the existing `data-i18n` / `public/main.js`
mechanism, with FR and EN entries. Event summary/description are generated in a
neutral form (or by the page's `lang`). Slot times are localized client-side.

## Security / abuse considerations

- Honeypot hidden field on the booking payload; filled → silent no-op.
- `/api/book` only accepts grid-aligned, in-window, currently-free slots — it
  cannot create arbitrary events.
- No secrets reach the client; all Google calls are server-side.
- Rate limiting is out of scope (low volume); noted as a future option.

## Testing

- **Unit (vitest, TDD):** `generateSlots` and the `/api/book` slot-validation
  guard (both pure).
- **Manual/integration:** the Google client (`getBusy`, `createEvent`) against a
  real test calendar; end-to-end booking on a preview deploy.
