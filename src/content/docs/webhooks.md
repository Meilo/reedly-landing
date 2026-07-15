---
title: Webhooks
description: Receive Reedly field intelligence — reports and syntheses — as signed HTTPS events.
---

Reedly captures what happens in field sales meetings and turns it into structured intelligence. Webhooks let your system receive that intelligence the moment it is produced.

## Overview

When a sales rep's meeting report is published, Reedly builds a **canonical event** and delivers it to every destination the organization has configured. Your endpoint is one of those destinations.

```
meeting recorded → AI pipeline → report published
                                       ↓
                              event queued (outbox)
                                       ↓
                     dispatcher (runs every 5 minutes)
                                       ↓
                          POST https://your-endpoint
```

Two things follow from this design, and they shape everything below:

**Reedly pushes. You do not pull.** There is no public read API. Every integration is built on the events you receive, so persist what you need on your side.

**Delivery is asynchronous.** Events are queued and drained by a dispatcher on a schedule, then retried on failure. An event typically arrives within five minutes of the report being published — not instantly.

## Setup

Your customer configures the webhook themselves, from their Reedly hub:

1. **Integrations → Webhook → Add**
2. Paste the endpoint URL. It must be **HTTPS** and **publicly reachable** — Reedly refuses private, internal, and cloud-metadata addresses.
3. Reedly **generates a signing secret and shows it once**. It must be copied at that moment; it is encrypted at rest and never displayed again.
4. **Test** sends a real signed delivery to the endpoint, so integration can be verified before any live traffic.

Subscribable events: `report.published`, and optionally `synthesis.created`.

## The envelope

Every event, whatever its type, arrives in the same envelope:

| Field | Type | Notes |
|---|---|---|
| `apiVersion` | `string` | Currently `2026-06-15` |
| `event` | `string` | `report.published` \| `synthesis.created` |
| `eventId` | `string` | Stable across retries — **your idempotency key** |
| `occurredAt` | `string` | ISO 8601 |
| `organizationId` | `string` | UUID of the Reedly organization |
| `client` | `object \| null` | The company the intelligence is about. **Always `null` on `synthesis.created`** |
| `client.name` | `string` | Company name |
| `client.contact` | `object \| null` | `{ name, email, phone, role }` |
| `client.domain` | `string \| null` | Derived from the contact's email — your best matching key |
| `client.externalIds` | `object` | Known third-party ids, keyed by provider |
| `actor` | `object` | `{ repName, repEmail }` — who captured the intelligence |
| `payload` | `object` | Event-specific. See [Events](#events) |
| `rendered` | `object` | `{ html, text }` — ready to display, no parsing needed |
| `links.reedlyUrl` | `string \| null` | Deep link back into the Reedly hub |

If all you need is to file a readable note against a company, `client` + `rendered.html` is enough — `payload` is there when you want the structure.

## Signature verification

Every request carries these headers:

| Header | Value |
|---|---|
| `X-Reedly-Signature` | `sha256=<hex>` — HMAC-SHA256 of the request body, keyed with your secret |
| `X-Reedly-Event` | The event type |
| `X-Reedly-Delivery` | The `eventId` |
| `User-Agent` | `Reedly-Webhook/1` |

> **Verify the raw body, exactly as received.**
>
> Do not `JSON.parse` and re-serialize before verifying. Re-serialization changes the bytes — key order, spacing, unicode escaping — and the signature will not match. Capture the raw body first, verify it, and only then parse. This is the single most common webhook integration bug.

Always compare in **constant time** (`timingSafeEqual`, `hmac.compare_digest`). A plain `==` leaks the secret to a timing attack.

### Node.js

```js
import { createHmac, timingSafeEqual } from 'node:crypto';

function verify(rawBody, header, secret) {
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  const received = (header ?? '').replace(/^sha256=/, '');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(received, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}
```

### Python

```python
import hmac, hashlib

def verify(raw_body: bytes, header: str, secret: str) -> bool:
    expected = hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    received = (header or "").removeprefix("sha256=")
    return hmac.compare_digest(expected, received)
```

### Worked example

Use this to validate your implementation before connecting anything:

```
secret    whsec_example_do_not_use_in_production
body      {"apiVersion":"2026-06-15","event":"report.published","eventId":"evt_report_demo"}
signature 535eaf4a186b5b3a0176e7ef0f57deb6cb84a98052d57760ccef182ab807064e
```

The header would read `X-Reedly-Signature: sha256=535eaf4a...`.

## Delivery semantics

| | |
|---|---|
| Method | `POST` |
| Content type | `application/json` |
| Success | Any `2xx` |
| Timeout | **10 seconds** |
| Redirects | **Not followed** — a `301`/`302` counts as a failure |
| Retry backoff | 5, 30, 120, 360, 720 minutes |
| Max attempts | **5**, then the delivery is dead-lettered |

**Delivery is at-least-once.** Retries are real, and a retry carries the *same* `eventId`. Deduplicate on it — treat it as a unique key on your side.

**Answer `2xx` immediately, then work asynchronously.** You have 10 seconds. If you transcribe, enrich, or call another API before responding, you will hit the timeout, Reedly will retry, and you will process the same event twice. Acknowledge first, queue the work second.

Failures are visible to your customer: the hub has a **Delivery Log** listing every attempt, its status and its error, with a manual replay button.

## Events

### `report.published`

Emitted when a rep publishes a meeting report. `payload.report` contains:

| Field | Type |
|---|---|
| `summary` | `string` |
| `client_needs` | `string[]` |
| `key_points` | `string[]` |
| `objections` | `string[]` |
| `commitments` | `string[]` |
| `next_steps` | `{ description, deadline, responsible }[]` |
| `additional_sections` | `{ key, title, type, content }[]` |

Full example: [`report-published.json`](./examples/report-published.json)

> Not every report produces an event: a report with no client name, or with no organization context, is never emitted.

### `synthesis.created`

Emitted when a synthesis — an aggregation of many reports over a period — is generated. `payload.synthesis` contains:

| Field | Type |
|---|---|
| `overview` | `string` |
| `trends` | `string[]` |
| `opportunities` | `string[]` |
| `risks` | `string[]` |
| `novelties` | `string[]` |
| `improvements` | `string[]` |
| `manager_insights` | `{ question, answer }[]` |
| `period_start`, `period_end` | `string` |
| `report_count` | `number` |
| `scope` | `string` |

Full example: [`synthesis-created.json`](./examples/synthesis-created.json)

> A synthesis spans an entire organization, not one company — so `client` is **always `null`** on this event.

## Gotchas

Four things that will cost you time if you find them the hard way.

**1. The envelope is camelCase. The payload is snake_case.**
`apiVersion`, `eventId`, `organizationId` — but `client_needs`, `next_steps`, `period_start`. The payload is the raw storage shape and passes through unchanged. This is deliberate: it keeps the payload honest rather than re-mapping it in flight.

**2. `client` is `null` on `synthesis.created`.**
Not "sometimes" — always. Any code that files an event against a company must handle the client-less case, or it will throw on the first synthesis.

**3. A disabled section is `[]`, not absent.**
Organizations can turn report sections off. A disabled section arrives as an empty array, not a missing key. Do not read emptiness as "the section does not exist" — read it as "nothing to show".

**4. `additional_sections` has no fixed schema.**
Organizations configure their own custom sections, so keys vary between customers and change over time. Iterate over the array and render `title` + `content`. Never hard-code an expected key.

## Versioning

`apiVersion` is a date string, and the contract evolves **additively only**:

- New fields **may** appear at any time.
- Existing fields are **never** renamed or removed.
- New event types **may** be introduced.

**Ignore fields you do not recognize, and ignore event types you do not handle.** A parser that rejects unknown input will break the first time we add a field.

## Reserved

`action.created` exists in the envelope's type space but is **not currently emitted**. Do not build a handler for it — it would never fire.

Actions extracted from a report already travel inside `report.published`, under `payload.report.next_steps`.

## Support

Questions about this contract: [support@reedly.ai](mailto:support@reedly.ai).
