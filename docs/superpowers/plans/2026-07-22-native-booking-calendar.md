# Native Booking Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-hosted, Calendly-like 15-minute demo booking flow that computes availability from Google FreeBusy and creates Google Meet events on the host's Workspace calendar.

**Architecture:** Two server-rendered Astro API endpoints (`prerender = false`) back a booking widget rendered inside `BookDemo.astro`. Availability is computed live (working-hours grid minus FreeBusy); a booking is a Google Calendar event with a Meet link. No database — the calendar is the source of truth. All timezone math is server-side (luxon); the client only formats server-provided ISO strings.

**Tech Stack:** Astro 6 (static + Vercel functions), TypeScript strict, luxon (server tz math), google-auth-library (OAuth token refresh) + REST via fetch, Resend (internal notification), vitest (tests), vanilla JS/CSS on the client.

## Global Constraints

- **Package manager:** pnpm (not npm). Node 20+.
- **Imports:** always `@/...`, never relative `../` (except within the same `src/lib/booking/` folder where relative `./` is used for sibling modules).
- **Astro frontmatter/TS:** single-quoted strings, semicolons, 2-space indent.
- **Server endpoints:** `export const prerender = false`; read secrets via `import.meta.env.X`; return `Response` with `Content-Type: application/json`.
- **No em dashes (« — ») in any user-facing copy** (FR or EN). Use commas/colons/periods.
- **Bilingual symmetry mandatory:** every user-facing string has FR and EN entries in `public/main.js` `T.fr` / `T.en`.
- **Booking parameters (verbatim):** timezone `Europe/Paris`; working hours Mon–Fri (luxon weekdays `[1,2,3,4,5]`) 09:00–18:00; slot length 15 min; minimum notice 120 min; horizon 14 days.
- **Slot ISO format:** always `DateTime.toISO({ suppressMilliseconds: true })`, e.g. `2026-07-20T09:00:00+02:00`.
- **Secrets never reach the client.** All Google calls are server-side.

---

## File Structure

**Create:**
- `src/lib/booking/config.ts` — booking parameters + `getCalendarId()`.
- `src/lib/booking/availability.ts` — pure `generateSlots()` + `groupSlotsByDay()`.
- `src/lib/booking/validate.ts` — pure `isSlotBookable()`.
- `src/lib/booking/google.ts` — OAuth token, `getBusy()`, `createEvent()`, `isGoogleConfigured()`.
- `src/lib/booking/availability.test.ts` — unit tests for availability.
- `src/lib/booking/validate.test.ts` — unit tests for the slot guard.
- `src/pages/api/availability.ts` — `GET /api/availability`.
- `src/pages/api/book.ts` — `POST /api/book`.
- `scripts/google-oauth.mjs` — one-time refresh-token generator.
- `vitest.config.ts` — test runner config.

**Modify:**
- `package.json` — deps + `test` script.
- `src/components/BookDemo.astro` — replace the placeholder with the booking widget + client script + styles.
- `public/main.js` — add `bookdemo.cal.*` i18n keys to `T.fr` and `T.en`.
- `.env.example` (create if absent) — document the new env vars.

---

## Task 1: Test tooling + booking config

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`, `src/lib/booking/config.ts`

**Interfaces:**
- Produces: `BOOKING_CONFIG` (const object), `getCalendarId(): string`, `WorkingHours`/`WorkingWindow` types (re-exported from config for convenience are NOT needed — types live in availability.ts, see Task 2). A `test` npm script running vitest.

- [ ] **Step 1: Install dependencies**

```bash
pnpm add luxon google-auth-library
pnpm add -D @types/luxon vitest
```

- [ ] **Step 2: Add the test script to package.json**

In `package.json` `"scripts"`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 4: Create the booking config**

`src/lib/booking/config.ts`:

```ts
import type { WorkingHours } from './availability';

export const BOOKING_CONFIG = {
  timezone: 'Europe/Paris',
  slotMinutes: 15,
  minNoticeMinutes: 120,
  horizonDays: 14,
  workingHours: {
    days: [1, 2, 3, 4, 5],
    windows: [{ start: '09:00', end: '18:00' }],
  } as WorkingHours,
} as const;

// Calendar id is read lazily (only at request time) so importing this module
// never touches import.meta.env, keeping unit tests env-free.
export function getCalendarId(): string {
  return import.meta.env.GOOGLE_CALENDAR_ID || 'primary';
}
```

- [ ] **Step 5: Verify the runner works**

Run: `pnpm test`
Expected: vitest runs and reports "No test files found" (exit 0) — the runner is wired. (Real tests arrive in Task 2.)

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts src/lib/booking/config.ts
git commit -m "chore(booking): add vitest, luxon, google-auth-library + booking config"
```

---

## Task 2: Availability core (pure, TDD)

**Files:**
- Create: `src/lib/booking/availability.ts`
- Test: `src/lib/booking/availability.test.ts`

**Interfaces:**
- Consumes: `luxon`.
- Produces:
  - `interface WorkingWindow { start: string; end: string }` (`'HH:mm'`)
  - `interface WorkingHours { days: number[]; windows: WorkingWindow[] }` (days = luxon weekday 1..7)
  - `interface BusyInterval { start: string; end: string }` (ISO instants)
  - `interface GenerateSlotsParams { now: string; horizonDays: number; workingHours: WorkingHours; slotMinutes: number; minNoticeMinutes: number; timezone: string; busy: BusyInterval[] }`
  - `function generateSlots(p: GenerateSlotsParams): string[]` — sorted ISO slot starts (`suppressMilliseconds`).
  - `interface DaySlots { date: string; slots: string[] }`
  - `function groupSlotsByDay(slots: string[], timezone: string): DaySlots[]`

- [ ] **Step 1: Write the failing tests**

`src/lib/booking/availability.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { generateSlots, groupSlotsByDay } from './availability';

const base = {
  workingHours: { days: [1, 2, 3, 4, 5], windows: [{ start: '09:00', end: '18:00' }] },
  slotMinutes: 15,
  timezone: 'Europe/Paris',
};

describe('generateSlots', () => {
  it('starts at 09:00 and ends at 17:45 with no notice/busy (summer, +02:00)', () => {
    const slots = generateSlots({
      ...base, now: '2026-07-20T00:00:00.000Z', horizonDays: 0,
      minNoticeMinutes: 0, busy: [],
    });
    expect(slots[0]).toBe('2026-07-20T09:00:00+02:00');
    expect(slots[slots.length - 1]).toBe('2026-07-20T17:45:00+02:00');
  });

  it('drops slots earlier than now + minNotice', () => {
    // Paris 07:30, +120min notice => earliest 09:30
    const slots = generateSlots({
      ...base, now: '2026-07-20T05:30:00.000Z', horizonDays: 0,
      minNoticeMinutes: 120, busy: [],
    });
    expect(slots).not.toContain('2026-07-20T09:15:00+02:00');
    expect(slots[0]).toBe('2026-07-20T09:30:00+02:00');
  });

  it('removes slots overlapping a busy interval', () => {
    const slots = generateSlots({
      ...base, now: '2026-07-20T00:00:00.000Z', horizonDays: 0, minNoticeMinutes: 0,
      busy: [{ start: '2026-07-20T09:00:00+02:00', end: '2026-07-20T09:30:00+02:00' }],
    });
    expect(slots).not.toContain('2026-07-20T09:00:00+02:00');
    expect(slots).not.toContain('2026-07-20T09:15:00+02:00');
    expect(slots).toContain('2026-07-20T09:30:00+02:00');
  });

  it('produces no slots on a weekend day', () => {
    // 2026-07-25 is a Saturday
    const slots = generateSlots({
      ...base, now: '2026-07-25T00:00:00.000Z', horizonDays: 0,
      minNoticeMinutes: 0, busy: [],
    });
    expect(slots).toEqual([]);
  });

  it('produces no slots when the whole working day is busy', () => {
    const slots = generateSlots({
      ...base, now: '2026-07-20T00:00:00.000Z', horizonDays: 0, minNoticeMinutes: 0,
      busy: [{ start: '2026-07-20T09:00:00+02:00', end: '2026-07-20T18:00:00+02:00' }],
    });
    expect(slots).toEqual([]);
  });

  it('uses the correct winter offset (+01:00)', () => {
    // 2026-01-19 is a Monday
    const slots = generateSlots({
      ...base, now: '2026-01-19T00:00:00.000Z', horizonDays: 0,
      minNoticeMinutes: 0, busy: [],
    });
    expect(slots[0]).toBe('2026-01-19T09:00:00+01:00');
  });
});

describe('groupSlotsByDay', () => {
  it('groups slots by their calendar date in the given timezone, preserving order', () => {
    const days = groupSlotsByDay(
      ['2026-07-20T09:00:00+02:00', '2026-07-20T09:15:00+02:00', '2026-07-21T09:00:00+02:00'],
      'Europe/Paris',
    );
    expect(days).toEqual([
      { date: '2026-07-20', slots: ['2026-07-20T09:00:00+02:00', '2026-07-20T09:15:00+02:00'] },
      { date: '2026-07-21', slots: ['2026-07-21T09:00:00+02:00'] },
    ]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — `generateSlots`/`groupSlotsByDay` are not exported yet.

- [ ] **Step 3: Implement availability.ts**

`src/lib/booking/availability.ts`:

```ts
import { DateTime } from 'luxon';

export interface WorkingWindow {
  start: string; // 'HH:mm'
  end: string; // 'HH:mm'
}
export interface WorkingHours {
  days: number[]; // luxon weekday: 1 (Mon) .. 7 (Sun)
  windows: WorkingWindow[];
}
export interface BusyInterval {
  start: string; // ISO instant
  end: string; // ISO instant
}
export interface GenerateSlotsParams {
  now: string;
  horizonDays: number;
  workingHours: WorkingHours;
  slotMinutes: number;
  minNoticeMinutes: number;
  timezone: string;
  busy: BusyInterval[];
}
export interface DaySlots {
  date: string; // 'YYYY-MM-DD'
  slots: string[];
}

function parseHm(hm: string): { hour: number; minute: number } {
  const [hour, minute] = hm.split(':').map((n) => parseInt(n, 10));
  return { hour, minute };
}

export function generateSlots(p: GenerateSlotsParams): string[] {
  const nowDt = DateTime.fromISO(p.now);
  const earliestMs = nowDt.plus({ minutes: p.minNoticeMinutes }).toMillis();
  const busy = p.busy.map((b) => ({
    s: DateTime.fromISO(b.start).toMillis(),
    e: DateTime.fromISO(b.end).toMillis(),
  }));
  const startDay = nowDt.setZone(p.timezone).startOf('day');
  const out: string[] = [];

  for (let i = 0; i <= p.horizonDays; i++) {
    const day = startDay.plus({ days: i });
    if (!p.workingHours.days.includes(day.weekday)) continue;

    for (const win of p.workingHours.windows) {
      const from = parseHm(win.start);
      const to = parseHm(win.end);
      const winStart = day.set({ hour: from.hour, minute: from.minute, second: 0, millisecond: 0 });
      const winEnd = day.set({ hour: to.hour, minute: to.minute, second: 0, millisecond: 0 });
      const winEndMs = winEnd.toMillis();

      let slot = winStart;
      while (slot.plus({ minutes: p.slotMinutes }).toMillis() <= winEndMs) {
        const startMs = slot.toMillis();
        const endMs = slot.plus({ minutes: p.slotMinutes }).toMillis();
        const overlaps = busy.some((b) => startMs < b.e && endMs > b.s);
        if (startMs >= earliestMs && !overlaps) {
          out.push(slot.toISO({ suppressMilliseconds: true })!);
        }
        slot = slot.plus({ minutes: p.slotMinutes });
      }
    }
  }
  return out;
}

export function groupSlotsByDay(slots: string[], timezone: string): DaySlots[] {
  const order: string[] = [];
  const map = new Map<string, string[]>();
  for (const iso of slots) {
    const date = DateTime.fromISO(iso, { setZone: true }).setZone(timezone).toISODate()!;
    if (!map.has(date)) {
      map.set(date, []);
      order.push(date);
    }
    map.get(date)!.push(iso);
  }
  return order.map((date) => ({ date, slots: map.get(date)! }));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test`
Expected: PASS (all 7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/booking/availability.ts src/lib/booking/availability.test.ts
git commit -m "feat(booking): pure slot generator + day grouping with tests"
```

---

## Task 3: Slot validation guard (pure, TDD)

**Files:**
- Create: `src/lib/booking/validate.ts`
- Test: `src/lib/booking/validate.test.ts`

**Interfaces:**
- Consumes: `luxon`, `WorkingHours` from `./availability`.
- Produces:
  - `interface SlotValidationConfig { timezone: string; slotMinutes: number; minNoticeMinutes: number; horizonDays: number; workingHours: WorkingHours }`
  - `function isSlotBookable(startIso: string, now: string, config: SlotValidationConfig): boolean`

- [ ] **Step 1: Write the failing tests**

`src/lib/booking/validate.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { isSlotBookable } from './validate';

const cfg = {
  timezone: 'Europe/Paris',
  slotMinutes: 15,
  minNoticeMinutes: 120,
  horizonDays: 14,
  workingHours: { days: [1, 2, 3, 4, 5], windows: [{ start: '09:00', end: '18:00' }] },
};
const now = '2026-07-20T00:00:00.000Z'; // Paris 02:00, Monday

describe('isSlotBookable', () => {
  it('accepts a well-formed in-window future slot', () => {
    expect(isSlotBookable('2026-07-21T10:00:00+02:00', now, cfg)).toBe(true);
  });
  it('accepts the last slot of the window (17:45)', () => {
    expect(isSlotBookable('2026-07-21T17:45:00+02:00', now, cfg)).toBe(true);
  });
  it('rejects a slot not aligned to the grid', () => {
    expect(isSlotBookable('2026-07-21T10:07:00+02:00', now, cfg)).toBe(false);
  });
  it('rejects a slot on a weekend', () => {
    expect(isSlotBookable('2026-07-25T10:00:00+02:00', now, cfg)).toBe(false);
  });
  it('rejects a slot before the working window', () => {
    expect(isSlotBookable('2026-07-21T08:45:00+02:00', now, cfg)).toBe(false);
  });
  it('rejects a slot whose end passes the window end (18:00)', () => {
    expect(isSlotBookable('2026-07-21T18:00:00+02:00', now, cfg)).toBe(false);
  });
  it('rejects a slot within the minimum notice', () => {
    // now Paris 07:30, slot 09:00 => 90 min < 120
    expect(isSlotBookable('2026-07-21T09:00:00+02:00', '2026-07-21T05:30:00.000Z', cfg)).toBe(false);
  });
  it('rejects a slot beyond the horizon', () => {
    expect(isSlotBookable('2026-08-30T10:00:00+02:00', now, cfg)).toBe(false);
  });
  it('rejects an unparseable start', () => {
    expect(isSlotBookable('not-a-date', now, cfg)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test src/lib/booking/validate.test.ts`
Expected: FAIL — `isSlotBookable` not exported.

- [ ] **Step 3: Implement validate.ts**

`src/lib/booking/validate.ts`:

```ts
import { DateTime } from 'luxon';
import type { WorkingHours } from './availability';

export interface SlotValidationConfig {
  timezone: string;
  slotMinutes: number;
  minNoticeMinutes: number;
  horizonDays: number;
  workingHours: WorkingHours;
}

export function isSlotBookable(
  startIso: string,
  now: string,
  config: SlotValidationConfig,
): boolean {
  const start = DateTime.fromISO(startIso, { setZone: true });
  if (!start.isValid) return false;

  const local = start.setZone(config.timezone);
  const nowDt = DateTime.fromISO(now);
  if (!nowDt.isValid) return false;

  // Grid alignment
  if (local.second !== 0 || local.millisecond !== 0) return false;
  if (local.minute % config.slotMinutes !== 0) return false;

  // Notice + horizon
  const startMs = local.toMillis();
  const earliestMs = nowDt.plus({ minutes: config.minNoticeMinutes }).toMillis();
  const latestMs = nowDt.plus({ days: config.horizonDays }).toMillis();
  if (startMs < earliestMs) return false;
  if (startMs > latestMs) return false;

  // Working day
  if (!config.workingHours.days.includes(local.weekday)) return false;

  // Inside a working window (slot end must not pass the window end)
  const endMs = local.plus({ minutes: config.slotMinutes }).toMillis();
  return config.workingHours.windows.some((win) => {
    const [sh, sm] = win.start.split(':').map((n) => parseInt(n, 10));
    const [eh, em] = win.end.split(':').map((n) => parseInt(n, 10));
    const winStart = local.set({ hour: sh, minute: sm, second: 0, millisecond: 0 }).toMillis();
    const winEnd = local.set({ hour: eh, minute: em, second: 0, millisecond: 0 }).toMillis();
    return startMs >= winStart && endMs <= winEnd;
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test src/lib/booking/validate.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/booking/validate.ts src/lib/booking/validate.test.ts
git commit -m "feat(booking): pure slot-validation guard with tests"
```

---

## Task 4: Google client + OAuth setup script

**Files:**
- Create: `src/lib/booking/google.ts`, `scripts/google-oauth.mjs`, `.env.example`

**Interfaces:**
- Consumes: `google-auth-library`, `BusyInterval` from `./availability`.
- Produces:
  - `function isGoogleConfigured(): boolean`
  - `function getBusy(timeMinIso: string, timeMaxIso: string, calendarId: string): Promise<BusyInterval[]>`
  - `interface CreateEventParams { startIso: string; endIso: string; timezone: string; summary: string; description: string; attendeeEmail: string; attendeeName: string; calendarId: string }`
  - `function createEvent(p: CreateEventParams): Promise<{ meetLink: string; eventId: string }>`

- [ ] **Step 1: Implement google.ts**

`src/lib/booking/google.ts`:

```ts
import { OAuth2Client } from 'google-auth-library';
import type { BusyInterval } from './availability';

const CAL_API = 'https://www.googleapis.com/calendar/v3';

export function isGoogleConfigured(): boolean {
  return Boolean(
    import.meta.env.GOOGLE_CLIENT_ID &&
      import.meta.env.GOOGLE_CLIENT_SECRET &&
      import.meta.env.GOOGLE_REFRESH_TOKEN,
  );
}

async function getAccessToken(): Promise<string> {
  const client = new OAuth2Client(
    import.meta.env.GOOGLE_CLIENT_ID,
    import.meta.env.GOOGLE_CLIENT_SECRET,
  );
  client.setCredentials({ refresh_token: import.meta.env.GOOGLE_REFRESH_TOKEN });
  const { token } = await client.getAccessToken();
  if (!token) throw new Error('Failed to obtain Google access token');
  return token;
}

export async function getBusy(
  timeMinIso: string,
  timeMaxIso: string,
  calendarId: string,
): Promise<BusyInterval[]> {
  const token = await getAccessToken();
  const res = await fetch(`${CAL_API}/freeBusy`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timeMin: timeMinIso,
      timeMax: timeMaxIso,
      items: [{ id: calendarId }],
    }),
  });
  if (!res.ok) throw new Error(`freeBusy failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const cal = data.calendars?.[calendarId];
  if (cal?.errors?.length) throw new Error(`freeBusy calendar error: ${JSON.stringify(cal.errors)}`);
  return (cal?.busy ?? []) as BusyInterval[];
}

export interface CreateEventParams {
  startIso: string;
  endIso: string;
  timezone: string;
  summary: string;
  description: string;
  attendeeEmail: string;
  attendeeName: string;
  calendarId: string;
}

export async function createEvent(
  p: CreateEventParams,
): Promise<{ meetLink: string; eventId: string }> {
  const token = await getAccessToken();
  const res = await fetch(
    `${CAL_API}/calendars/${encodeURIComponent(p.calendarId)}/events` +
      `?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: p.summary,
        description: p.description,
        start: { dateTime: p.startIso, timeZone: p.timezone },
        end: { dateTime: p.endIso, timeZone: p.timezone },
        attendees: [{ email: p.attendeeEmail, displayName: p.attendeeName }],
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      }),
    },
  );
  if (!res.ok) throw new Error(`events.insert failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const meetLink =
    data.hangoutLink ||
    data.conferenceData?.entryPoints?.find((e: { entryPointType?: string; uri?: string }) =>
      e.entryPointType === 'video')?.uri ||
    '';
  return { meetLink, eventId: data.id };
}
```

- [ ] **Step 2: Create the OAuth refresh-token script**

`scripts/google-oauth.mjs`:

```js
// One-time helper to obtain a Google refresh token for the booking host account.
// Prereqs (see .env.example): a Google Cloud OAuth 2.0 "Desktop" client with the
// redirect URI http://localhost:53682 registered, and Calendar API enabled.
//
// Usage:
//   GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=yyy node scripts/google-oauth.mjs
import http from 'node:http';
import { OAuth2Client } from 'google-auth-library';

const PORT = 53682;
const REDIRECT = `http://localhost:${PORT}`;
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
];

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the environment first.');
  process.exit(1);
}

const client = new OAuth2Client(clientId, clientSecret, REDIRECT);
const authUrl = client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: SCOPES,
});

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  const code = url.searchParams.get('code');
  if (!code) {
    res.writeHead(400).end('Missing code');
    return;
  }
  try {
    const { tokens } = await client.getToken(code);
    res.writeHead(200, { 'Content-Type': 'text/plain' })
      .end('Done. You can close this tab and return to the terminal.');
    console.log('\n=== GOOGLE_REFRESH_TOKEN ===\n' + tokens.refresh_token + '\n');
    if (!tokens.refresh_token) {
      console.log('No refresh_token returned. Revoke prior access at ' +
        'https://myaccount.google.com/permissions and retry.');
    }
  } catch (err) {
    console.error(err);
    res.writeHead(500).end('Token exchange failed, see terminal.');
  } finally {
    server.close();
  }
});

server.listen(PORT, () => {
  console.log('Open this URL, sign in with the HOST Workspace account, and grant access:\n');
  console.log(authUrl + '\n');
});
```

- [ ] **Step 3: Document env vars**

Create `.env.example` (append if it already exists):

```bash
# Booking calendar (Google) — host Workspace account
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_CALENDAR_ID=primary
# Internal booking notification reuses the existing Resend vars:
# RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL
```

- [ ] **Step 4: Type-check**

Run: `pnpm astro check --minimal 2>/dev/null || npx tsc --noEmit -p tsconfig.json`
Expected: no type errors in `src/lib/booking/google.ts`. (If `crypto` is flagged, it is a Node 20 global; no import needed.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/booking/google.ts scripts/google-oauth.mjs .env.example
git commit -m "feat(booking): Google FreeBusy + event/Meet client and OAuth setup script"
```

---

## Task 5: `GET /api/availability` endpoint

**Files:**
- Create: `src/pages/api/availability.ts`

**Interfaces:**
- Consumes: `BOOKING_CONFIG`, `getCalendarId` (`@/lib/booking/config`); `generateSlots`, `groupSlotsByDay` (`@/lib/booking/availability`); `getBusy`, `isGoogleConfigured` (`@/lib/booking/google`); `luxon`.
- Produces: `GET /api/availability` → `{ timezone, slotMinutes, days: DaySlots[] }`.

- [ ] **Step 1: Implement the endpoint**

`src/pages/api/availability.ts`:

```ts
/**
 * GET /api/availability
 * Returns bookable 15-min slots (working hours minus Google FreeBusy) grouped by day.
 */
import type { APIRoute } from 'astro';
import { DateTime } from 'luxon';
import { BOOKING_CONFIG, getCalendarId } from '@/lib/booking/config';
import { generateSlots, groupSlotsByDay } from '@/lib/booking/availability';
import { getBusy, isGoogleConfigured } from '@/lib/booking/google';

export const prerender = false;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async () => {
  if (!isGoogleConfigured()) {
    console.error('[availability] Google env not configured');
    return json(500, { error: 'unavailable' });
  }

  const nowDt = DateTime.utc();
  const now = nowDt.toISO()!;
  const timeMax = nowDt.plus({ days: BOOKING_CONFIG.horizonDays + 1 }).toISO()!;

  try {
    const busy = await getBusy(now, timeMax, getCalendarId());
    const slots = generateSlots({
      now,
      horizonDays: BOOKING_CONFIG.horizonDays,
      workingHours: BOOKING_CONFIG.workingHours,
      slotMinutes: BOOKING_CONFIG.slotMinutes,
      minNoticeMinutes: BOOKING_CONFIG.minNoticeMinutes,
      timezone: BOOKING_CONFIG.timezone,
      busy,
    });
    const days = groupSlotsByDay(slots, BOOKING_CONFIG.timezone);
    return json(200, { timezone: BOOKING_CONFIG.timezone, slotMinutes: BOOKING_CONFIG.slotMinutes, days });
  } catch (err) {
    console.error('[availability] error:', err);
    return json(500, { error: 'unavailable' });
  }
};
```

- [ ] **Step 2: Manual verification (requires Google env in `.env`)**

Run: `pnpm dev`, then in another terminal:
`curl -s http://localhost:4321/api/availability | head -c 400`
Expected: JSON with `timezone: "Europe/Paris"`, `slotMinutes: 15`, and a `days` array. Without configured env, expect `{"error":"unavailable"}` and a server log line — this is the correct degraded behavior.

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/availability.ts
git commit -m "feat(booking): GET /api/availability endpoint"
```

---

## Task 6: `POST /api/book` endpoint

**Files:**
- Create: `src/pages/api/book.ts`

**Interfaces:**
- Consumes: `BOOKING_CONFIG`, `getCalendarId`; `isSlotBookable` (`@/lib/booking/validate`); `getBusy`, `createEvent`, `isGoogleConfigured`; `Resend`; `luxon`.
- Produces: `POST /api/book` → `{ start, end, meetLink }` (200), `{ error: 'slot_taken' }` (409), `{ error: 'invalid_slot' }` / field errors (400), `{ error: 'unavailable' }` (500).

- [ ] **Step 1: Implement the endpoint**

`src/pages/api/book.ts`:

```ts
/**
 * POST /api/book
 * Validates a slot, re-checks FreeBusy, then creates a Google Calendar event
 * with a Meet link and invites the visitor. Sends a best-effort internal email.
 */
import type { APIRoute } from 'astro';
import { DateTime } from 'luxon';
import { Resend } from 'resend';
import { BOOKING_CONFIG, getCalendarId } from '@/lib/booking/config';
import { isSlotBookable } from '@/lib/booking/validate';
import { getBusy, createEvent, isGoogleConfigured } from '@/lib/booking/google';

export const prerender = false;

interface BookPayload {
  start: string;
  email: string;
  name: string;
  note?: string;
  role?: string;
  team_size?: string;
  sector?: string;
  company_website?: string; // honeypot
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function notifyTeam(p: BookPayload, startIso: string, meetLink: string): Promise<void> {
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) return;
  const to = import.meta.env.CONTACT_TO_EMAIL ?? 'contact@reedly.ai';
  const from = import.meta.env.CONTACT_FROM_EMAIL ?? 'noreply@reedly.ai';
  const when = DateTime.fromISO(startIso, { setZone: true })
    .setZone(BOOKING_CONFIG.timezone)
    .toFormat("cccc d LLLL yyyy 'à' HH'h'mm", { locale: 'fr' });
  try {
    await new Resend(apiKey).emails.send({
      from: `Reedly Booking <${from}>`,
      to: [to],
      replyTo: p.email,
      subject: `[Reedly] Démo réservée, ${p.name}`,
      html: `<div style="font-family:sans-serif">
        <h2 style="color:#16a34a">Nouveau créneau réservé</h2>
        <p><b>${p.name}</b> (${p.email})</p>
        <p>Quand : ${when} (heure de Paris)</p>
        <p>Poste : ${p.role ?? ''} · Équipe : ${p.team_size ?? ''} · Secteur : ${p.sector ?? ''}</p>
        ${p.note ? `<p>Note : ${p.note}</p>` : ''}
        <p>Meet : <a href="${meetLink}">${meetLink}</a></p>
      </div>`,
    });
  } catch (err) {
    console.error('[book] internal notification failed (non-fatal):', err);
  }
}

export const POST: APIRoute = async ({ request }) => {
  let data: BookPayload;
  try {
    data = await request.json();
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  // Honeypot: silently accept without doing anything.
  if (data.company_website && data.company_website.trim() !== '') {
    return json(200, { start: data.start, end: data.start, meetLink: '' });
  }

  for (const field of ['start', 'email', 'name'] as const) {
    if (!data[field]?.trim()) return json(400, { error: `missing_${field}` });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return json(400, { error: 'invalid_email' });
  }

  if (!isGoogleConfigured()) {
    console.error('[book] Google env not configured');
    return json(500, { error: 'unavailable' });
  }

  const now = DateTime.utc().toISO()!;
  if (!isSlotBookable(data.start, now, BOOKING_CONFIG)) {
    return json(400, { error: 'invalid_slot' });
  }

  const endIso = DateTime.fromISO(data.start, { setZone: true })
    .plus({ minutes: BOOKING_CONFIG.slotMinutes })
    .toISO({ suppressMilliseconds: true })!;

  try {
    const busy = await getBusy(data.start, endIso, getCalendarId());
    if (busy.length > 0) return json(409, { error: 'slot_taken' });

    const { meetLink } = await createEvent({
      startIso: data.start,
      endIso,
      timezone: BOOKING_CONFIG.timezone,
      summary: `Démo Reedly · ${data.name}`,
      description:
        `Démo Reedly (15 min).\n\n` +
        `Contact : ${data.name} (${data.email})\n` +
        `Poste : ${data.role ?? '-'} · Équipe : ${data.team_size ?? '-'} · Secteur : ${data.sector ?? '-'}` +
        (data.note ? `\n\nNote : ${data.note}` : ''),
      attendeeEmail: data.email,
      attendeeName: data.name,
      calendarId: getCalendarId(),
    });

    await notifyTeam(data, data.start, meetLink);
    return json(200, { start: data.start, end: endIso, meetLink });
  } catch (err) {
    console.error('[book] error:', err);
    return json(500, { error: 'unavailable' });
  }
};
```

- [ ] **Step 2: Manual verification (requires Google env)**

Run: `pnpm dev`, then:
`curl -s -X POST http://localhost:4321/api/book -H 'Content-Type: application/json' -d '{"start":"2026-01-01T10:00:00+01:00","email":"a@b.co","name":"Test"}'`
Expected: `{"error":"invalid_slot"}` (past date). With a valid future slot from `/api/availability`, expect `200` with a `meetLink`, an event on the host calendar, and an invite to the attendee email. A second POST for the same slot should return `{"error":"slot_taken"}` (409).

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/book.ts
git commit -m "feat(booking): POST /api/book endpoint (validate, Meet event, notify)"
```

---

## Task 7: Booking widget UI (markup, styles, client script) + i18n

**Files:**
- Modify: `src/components/BookDemo.astro`, `public/main.js`

**Interfaces:**
- Consumes: `GET /api/availability`, `POST /api/book`; the existing qualifying form (`#bd-email`, `#bd-role`, `#bd-team`, `#bd-sector`); `window._reedlyT` for dynamic strings.
- Produces: the interactive booking widget shown after the qualifying step.

- [ ] **Step 1: Add i18n keys to public/main.js**

In `T.fr` (near the other `bookdemo.*` keys, around line 566) add:

```js
    "bookdemo.cal.pickday": "Choisissez un jour",
    "bookdemo.cal.pickslot": "Choisissez un créneau",
    "bookdemo.cal.tznote": "Créneaux affichés dans votre fuseau horaire.",
    "bookdemo.cal.loading": "Chargement des disponibilités…",
    "bookdemo.cal.empty": "Aucun créneau disponible pour l'instant. Réécrivez-nous et on cale ça.",
    "bookdemo.cal.error": "Impossible de charger les créneaux. Réessayez dans un instant.",
    "bookdemo.cal.name": "Votre nom",
    "bookdemo.cal.note": "Un mot sur votre besoin (optionnel)",
    "bookdemo.cal.confirm": "Confirmer le rendez-vous",
    "bookdemo.cal.booking": "Confirmation en cours…",
    "bookdemo.cal.back": "← Changer de créneau",
    "bookdemo.cal.slot_taken": "Ce créneau vient d'être pris. Choisissez-en un autre.",
    "bookdemo.cal.success_title": "C'est réservé.",
    "bookdemo.cal.success_body": "Une invitation Google Agenda avec le lien Meet vient de partir sur votre email.",
    "bookdemo.cal.meet": "Ouvrir le lien Google Meet",
```

In `T.en` (near the English `bookdemo.*` keys) add:

```js
    "bookdemo.cal.pickday": "Pick a day",
    "bookdemo.cal.pickslot": "Pick a time",
    "bookdemo.cal.tznote": "Times shown in your timezone.",
    "bookdemo.cal.loading": "Loading availability…",
    "bookdemo.cal.empty": "No slots available right now. Drop us a line and we'll sort it out.",
    "bookdemo.cal.error": "Could not load slots. Please try again in a moment.",
    "bookdemo.cal.name": "Your name",
    "bookdemo.cal.note": "A word about your need (optional)",
    "bookdemo.cal.confirm": "Confirm the meeting",
    "bookdemo.cal.booking": "Confirming…",
    "bookdemo.cal.back": "← Change slot",
    "bookdemo.cal.slot_taken": "That slot was just taken. Please pick another.",
    "bookdemo.cal.success_title": "You're booked.",
    "bookdemo.cal.success_body": "A Google Calendar invite with the Meet link is on its way to your email.",
    "bookdemo.cal.meet": "Open the Google Meet link",
```

- [ ] **Step 2: Replace the placeholder markup in BookDemo.astro**

Replace the `<div class="bookdemo__calendar" id="bookdemo-calendar" hidden>…</div>` block (lines ~130-136) with:

```astro
        <!-- Native booking calendar, revealed after the qualifying step. -->
        <div class="bookdemo__calendar" id="bookdemo-calendar" hidden>
          <p class="bookdemo__cal-tznote" data-i18n="bookdemo.cal.tznote">Créneaux affichés dans votre fuseau horaire.</p>

          <div class="bookdemo__cal-status" id="cal-status" data-i18n="bookdemo.cal.loading">Chargement des disponibilités…</div>

          <div class="bookdemo__cal-grid" id="cal-grid" hidden>
            <div class="bookdemo__cal-col">
              <div class="bookdemo__cal-label" data-i18n="bookdemo.cal.pickday">Choisissez un jour</div>
              <div class="bookdemo__cal-days" id="cal-days"></div>
            </div>
            <div class="bookdemo__cal-col">
              <div class="bookdemo__cal-label" data-i18n="bookdemo.cal.pickslot">Choisissez un créneau</div>
              <div class="bookdemo__cal-slots" id="cal-slots"></div>
            </div>
          </div>

          <form class="bookdemo__cal-confirm" id="cal-confirm" hidden novalidate>
            <div class="bookdemo__cal-recap" id="cal-recap"></div>
            <input type="text" class="form__input" id="cal-name" name="name" required
              data-i18n-placeholder="bookdemo.cal.name" placeholder="Votre nom" autocomplete="name" />
            <input type="text" class="form__input" id="cal-note" name="note"
              data-i18n-placeholder="bookdemo.cal.note" placeholder="Un mot sur votre besoin (optionnel)" />
            <input type="text" id="cal-hp" name="company_website" tabindex="-1" autocomplete="off"
              aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" />
            <div class="bookdemo__cal-actions">
              <button type="button" class="btn btn--ghost" id="cal-back" data-i18n="bookdemo.cal.back">← Changer de créneau</button>
              <button type="submit" class="btn btn--primary" id="cal-submit" data-i18n="bookdemo.cal.confirm">Confirmer le rendez-vous</button>
            </div>
            <div class="bookdemo__cal-err" id="cal-confirm-err" hidden></div>
          </form>

          <div class="bookdemo__cal-success" id="cal-success" hidden>
            <div class="bookdemo__cal-success-icon">✓</div>
            <h3 data-i18n="bookdemo.cal.success_title">C'est réservé.</h3>
            <p id="cal-success-when"></p>
            <p data-i18n="bookdemo.cal.success_body">Une invitation Google Agenda avec le lien Meet vient de partir sur votre email.</p>
            <a class="btn btn--primary" id="cal-meet" href="#" target="_blank" rel="noopener" data-i18n="bookdemo.cal.meet">Ouvrir le lien Google Meet</a>
          </div>
        </div>
```

- [ ] **Step 3: Add widget styles**

In the `<style>` block of `BookDemo.astro`, append (reuse tokens `--surface2`, `--border`, `--green`, `--muted`, `--text`, `--mono`):

```css
  .bookdemo__cal-tznote { font-size: 0.78rem; color: var(--muted); margin: 0 0 14px; }
  .bookdemo__cal-status { padding: 28px; text-align: center; color: var(--muted); font-family: var(--mono); font-size: 0.85rem; }
  .bookdemo__cal-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 18px; }
  @media (max-width: 640px) { .bookdemo__cal-grid { grid-template-columns: 1fr; } }
  .bookdemo__cal-label { font-family: var(--mono); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 10px; }
  .bookdemo__cal-days { display: flex; flex-direction: column; gap: 6px; max-height: 300px; overflow-y: auto; }
  .bookdemo__cal-slots { display: grid; grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); gap: 8px; align-content: start; max-height: 300px; overflow-y: auto; }
  .bookdemo__cal-day, .bookdemo__cal-slot { padding: 10px 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface2); color: var(--text); font-size: 0.9rem; cursor: pointer; text-align: center; transition: border-color 0.15s, background 0.15s; }
  .bookdemo__cal-day { text-align: left; }
  .bookdemo__cal-day:hover, .bookdemo__cal-slot:hover { border-color: var(--green); }
  .bookdemo__cal-day[aria-selected="true"] { border-color: var(--green); background: rgba(34, 197, 94, 0.1); }
  .bookdemo__cal-confirm { display: flex; flex-direction: column; gap: 12px; }
  .bookdemo__cal-recap { font-size: 1rem; color: var(--text); font-weight: 600; }
  .bookdemo__cal-actions { display: flex; gap: 10px; justify-content: space-between; flex-wrap: wrap; }
  .bookdemo__cal-err { color: var(--red); font-size: 0.85rem; }
  .bookdemo__cal-success { text-align: center; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .bookdemo__cal-success-icon { width: 44px; height: 44px; border-radius: 50%; background: rgba(34,197,94,0.15); color: var(--green); display: grid; place-items: center; font-size: 1.4rem; }
```

- [ ] **Step 4: Rewrite the inline script in BookDemo.astro**

Replace the existing `<script is:inline>` block with:

```astro
<script is:inline>
  (function () {
    var form = document.getElementById("bookdemo-form");
    var calendar = document.getElementById("bookdemo-calendar");
    if (!form || !calendar) return;

    var lang = location.pathname.indexOf("/en") === 0 ? "en" : "fr";
    var locale = lang === "fr" ? "fr-FR" : "en-US";
    function tr(key) {
      try { return (window._reedlyT && window._reedlyT[lang] && window._reedlyT[lang][key]) || key; }
      catch (e) { return key; }
    }

    var statusEl = document.getElementById("cal-status");
    var gridEl = document.getElementById("cal-grid");
    var daysEl = document.getElementById("cal-days");
    var slotsEl = document.getElementById("cal-slots");
    var confirmEl = document.getElementById("cal-confirm");
    var recapEl = document.getElementById("cal-recap");
    var successEl = document.getElementById("cal-success");
    var confirmErr = document.getElementById("cal-confirm-err");
    var selectedSlot = null;

    function show(el) { el.removeAttribute("hidden"); }
    function hide(el) { el.setAttribute("hidden", ""); }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hide(form);
      show(calendar);
      calendar.scrollIntoView({ behavior: "smooth", block: "nearest" });
      loadAvailability();
      try {
        if (typeof window.reedlyTrackEvent === "function") {
          window.reedlyTrackEvent("landing_bookdemo_qualified", {
            role: (document.getElementById("bd-role") || {}).value || "",
            team_size: (document.getElementById("bd-team") || {}).value || "",
          });
        }
      } catch (err) {}
    });

    function loadAvailability() {
      show(statusEl); statusEl.textContent = tr("bookdemo.cal.loading");
      hide(gridEl); hide(confirmEl); hide(successEl);
      fetch("/api/availability")
        .then(function (r) { if (!r.ok) throw new Error("http"); return r.json(); })
        .then(function (data) {
          if (!data.days || data.days.length === 0) {
            statusEl.textContent = tr("bookdemo.cal.empty");
            return;
          }
          hide(statusEl); show(gridEl);
          renderDays(data.days);
        })
        .catch(function () { statusEl.textContent = tr("bookdemo.cal.error"); });
    }

    function renderDays(days) {
      daysEl.innerHTML = ""; slotsEl.innerHTML = "";
      var dayFmt = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" });
      days.forEach(function (day, i) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "bookdemo__cal-day";
        btn.textContent = dayFmt.format(new Date(day.slots[0]));
        btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
        btn.addEventListener("click", function () {
          Array.prototype.forEach.call(daysEl.children, function (c) { c.setAttribute("aria-selected", "false"); });
          btn.setAttribute("aria-selected", "true");
          renderSlots(day.slots);
        });
        daysEl.appendChild(btn);
      });
      renderSlots(days[0].slots);
    }

    function renderSlots(slots) {
      slotsEl.innerHTML = "";
      var timeFmt = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
      slots.forEach(function (iso) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "bookdemo__cal-slot";
        btn.textContent = timeFmt.format(new Date(iso));
        btn.addEventListener("click", function () { openConfirm(iso); });
        slotsEl.appendChild(btn);
      });
    }

    function openConfirm(iso) {
      selectedSlot = iso;
      var fmt = new Intl.DateTimeFormat(locale, {
        weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
      });
      recapEl.textContent = fmt.format(new Date(iso));
      hide(confirmErr); confirmErr.textContent = "";
      hide(gridEl); show(confirmEl);
      var emailField = document.getElementById("bd-email");
      confirmEl.dataset.email = emailField ? emailField.value : "";
    }

    document.getElementById("cal-back").addEventListener("click", function () {
      hide(confirmEl); show(gridEl);
    });

    confirmEl.addEventListener("submit", function (e) {
      e.preventDefault();
      var submitBtn = document.getElementById("cal-submit");
      var name = document.getElementById("cal-name").value.trim();
      if (!name) { document.getElementById("cal-name").focus(); return; }
      submitBtn.disabled = true; submitBtn.textContent = tr("bookdemo.cal.booking");
      hide(confirmErr);

      fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: selectedSlot,
          email: confirmEl.dataset.email || "",
          name: name,
          note: document.getElementById("cal-note").value.trim(),
          company_website: document.getElementById("cal-hp").value,
          role: (document.getElementById("bd-role") || {}).value || "",
          team_size: (document.getElementById("bd-team") || {}).value || "",
          sector: (document.getElementById("bd-sector") || {}).value || "",
        }),
      })
        .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, status: r.status, body: b }; }); })
        .then(function (res) {
          submitBtn.disabled = false; submitBtn.textContent = tr("bookdemo.cal.confirm");
          if (res.ok) {
            showSuccess(res.body);
          } else if (res.status === 409) {
            show(confirmErr); confirmErr.textContent = tr("bookdemo.cal.slot_taken");
            hide(confirmEl); show(gridEl); loadAvailability();
          } else {
            show(confirmErr); confirmErr.textContent = tr("bookdemo.cal.error");
          }
        })
        .catch(function () {
          submitBtn.disabled = false; submitBtn.textContent = tr("bookdemo.cal.confirm");
          show(confirmErr); confirmErr.textContent = tr("bookdemo.cal.error");
        });
    });

    function showSuccess(body) {
      hide(confirmEl); hide(gridEl); hide(statusEl); show(successEl);
      var fmt = new Intl.DateTimeFormat(locale, {
        weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
      });
      document.getElementById("cal-success-when").textContent = fmt.format(new Date(body.start));
      var meet = document.getElementById("cal-meet");
      if (body.meetLink) { meet.href = body.meetLink; show(meet); } else { hide(meet); }
      try {
        if (typeof window.reedlyTrackEvent === "function") {
          window.reedlyTrackEvent("landing_bookdemo_booked", { start: body.start });
        }
      } catch (err) {}
    }
  })();
</script>
```

- [ ] **Step 5: Remove the now-unused placeholder i18n key**

In `public/main.js`, delete the `"bookdemo.calendar": ...` line from both `T.fr` and `T.en` (it referenced the old Cal.com placeholder).

- [ ] **Step 6: Build + visual verification**

Run: `pnpm build`
Expected: build succeeds with no errors.

Then `pnpm dev`, open `http://localhost:4321/fr`, scroll to `#rdv`, submit the qualifying form. Verify: the calendar reveals; with Google env set, days/slots load; picking a slot shows the confirm panel with the date; confirming shows the success panel with a Meet link. Without Google env, verify the graceful "error"/"empty" message appears (no crash). Repeat on `/en` to confirm English strings.

- [ ] **Step 7: Commit**

```bash
git add src/components/BookDemo.astro public/main.js
git commit -m "feat(booking): native booking widget UI, client flow, and i18n"
```

---

## Task 8: Final integration pass + docs

**Files:**
- Modify: `CLAUDE.md` (env + booking notes), `README` only if it documents env (optional)

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test`
Expected: all availability + validate tests PASS.

- [ ] **Step 2: Type-check and build**

Run: `pnpm build`
Expected: success, no type errors.

- [ ] **Step 3: Document the feature in CLAUDE.md**

Under the "Environment" section, add the Google booking vars (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID`) and a one-line note: "Native demo booking lives in `BookDemo.astro` + `src/lib/booking/*` + `/api/availability` + `/api/book`; refresh token generated via `node scripts/google-oauth.mjs`."

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(booking): document Google booking env and architecture"
```

---

## Self-Review

**Spec coverage:**
- UX flow (qualify → day → slot → confirm → success) → Task 7. ✓
- `GET /api/availability` (working hours − FreeBusy) → Tasks 2, 5. ✓
- `POST /api/book` (validate, re-check FreeBusy, Meet event, invite) → Tasks 3, 6. ✓
- No database (calendar is source of truth) → Tasks 5, 6 (no persistence). ✓
- Availability core pure + TDD (min-notice, busy, weekend, full day, grid, DST) → Task 2. ✓
- luxon server-side; client uses Intl → Tasks 2/3 (luxon), Task 7 (Intl). ✓
- Google Workspace OAuth refresh token, lean REST, Meet via conferenceData → Task 4. ✓
- Internal Resend notification, non-fatal → Task 6. ✓
- Config + env + setup script → Tasks 1, 4. ✓
- Honeypot bot guard → Tasks 6, 7. ✓
- i18n FR/EN → Task 7. ✓
- Non-goals (no reschedule/cancel UI, single host, no login) → respected (nothing built for them). ✓

**Placeholder scan:** No "TBD"/"handle errors"/"similar to" — all steps carry real code. ✓

**Type consistency:** `generateSlots`/`groupSlotsByDay`/`DaySlots` (Task 2) match usage in Task 5; `isSlotBookable`/`SlotValidationConfig` (Task 3) match Task 6 (`BOOKING_CONFIG` satisfies the `SlotValidationConfig` shape: timezone, slotMinutes, minNoticeMinutes, horizonDays, workingHours all present); `getBusy`/`createEvent`/`isGoogleConfigured`/`CreateEventParams` (Task 4) match Tasks 5/6; response shapes `{ timezone, slotMinutes, days }` and `{ start, end, meetLink }` match the client in Task 7. ✓
