---
title: Webhooks
description: The Reedly integration contract — what we emit, its shape, and how to receive it as signed HTTPS events.
---

Reedly captures what happens in field sales meetings and turns it into structured intelligence. This page is the **contract for that intelligence**: what Reedly emits, in what shape, and how you receive it.

## The contract and the transport are separate

Everything Reedly emits is one **canonical event** — a single, versioned, transport-agnostic payload. Webhooks are the delivery mode documented here, but the same event reaches every destination unchanged:

| Destination | What it is | Who builds it |
|---|---|---|
| **Webhook** | The event `POST`ed to your HTTPS endpoint, signed | You — nothing needed on our side |
| **Email** | The event's `rendered.html` / `rendered.text`, sent to an address | Nobody — configured in the hub |
| **File export** | The event written as JSON to the customer's own S3 bucket, plus an aggregated `index.csv` | Nobody — configured in the hub |
| **Native CRM** | The event turned into a note on the matching company/contact/deal in the CRM | Us — one connector per CRM |

So if you are reading this to size up **what data you can get**, read [The envelope](#the-envelope), [Events](#events) and [Custom sections](#custom-sections) and ignore the transport chapters. The shape is the same whichever route the data takes.

If webhooks turn out not to be your route, tell us — a native connector into your CRM is the other shape we build, and it consumes this exact event.

## How webhook delivery works

When a sales rep's meeting report is published, Reedly builds the event and delivers it to every destination the organization has configured. Your endpoint is one of those destinations.

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

:::caution[Verify the raw body, exactly as received]
Do not `JSON.parse` and re-serialize before verifying. Re-serialization changes the bytes — key order, spacing, unicode escaping — and the signature will not match. Capture the raw body first, verify it, and only then parse. This is the single most common webhook integration bug.
:::

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
| `additional_sections` | `{ key, title, type, content }[]` — see [Custom sections](#custom-sections) |

That is the whole payload. A report carries more in Reedly's own UI — the agency profile, the commercial context, the products discussed — but those are **not** on the wire today. Do not build against fields you saw in a screenshot.

Full example: [`report-published.json`](/docs/examples/report-published.json)

:::note
Not every report produces an event: a report with no client name, or with no organization context, is never emitted.
:::

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

Full example: [`synthesis-created.json`](/docs/examples/synthesis-created.json)

:::note
A synthesis spans an entire organization, not one company — so `client` is **always `null`** on this event.
:::

## Custom sections

Every organization tailors what its reports contain. This is the part of the payload that varies between your customers, so it deserves its own read.

An admin can do two things, from the Reports and Syntheses screens in their hub:

- **Turn a standard section off.** Objections, key points, commitments, next steps — any of them, except `summary` (and `overview` on syntheses), which can never be disabled.
- **Add a custom section.** They give it a **label** (what it's called) and an **instruction** in plain language — *"Describe the budget discussed and who arbitrates it"*. Reedly's AI fills it from the meeting, per report. Up to 20 per organization.

Custom sections arrive in `additional_sections`:

```json
{
  "key": "custom_5c8b1d24-9a3f-4e67-b012-7d4e9f2a6c85",
  "title": "Budget et saisonnalité",
  "type": "paragraph",
  "content": "Budget groupes 2027 confirmé à **environ 180 000 €**, arbitré en comité fin septembre."
}
```

### Mapping them

**`key` is your anchor, not `title`.** The key is minted once, when the admin creates the section, and never changes — renaming the section leaves it intact. `title` is the admin's label and *will* change under you. Map on `key`.

A key tells you where the section came from:

| `key` looks like | Origin | `title` is | `type` |
|---|---|---|---|
| `custom_` + a UUID | The admin wrote this section | Their label — human, translated, mutable | Always `"paragraph"` |
| A plain name (`accountProfile`, `productFit`) | A sector-standard section with no column of its own | **The raw key itself**, not a label | **Absent** |
| Absent | A legacy or fixed section | A label | Varies |

Two traps in that table. A sector-standard fold-in has `title` equal to its key — you'll see the literal string `"accountProfile"` where you expected a human title, so don't render it blind. And `type` is optional everywhere: **when it's missing, treat it as `paragraph`.**

### Reading the content

`content` is always a single plain-text string, never an object or an array. It uses a small markdown subset: `**bold**` for emphasis, blank lines between paragraphs. If the AI found nothing for a section, `content` is an explicit sentence saying so rather than an empty string — the section is still there.

Custom sections are **additive**. They never alter the standard ones, and a failure to generate them never blocks the report — so an event can legitimately arrive with `additional_sections: []` even for an organization that configured some.

:::note
Sections and their instructions are configured per organization, by an admin, and take effect on the **next** report. They are not part of the versioned contract: a customer can add one tomorrow, and your integration must survive a key it has never seen.
:::

## Gotchas

Four things that will cost you time if you find them the hard way.

**1. The envelope is camelCase. The payload is snake_case.**
`apiVersion`, `eventId`, `organizationId` — but `client_needs`, `next_steps`, `period_start`. The payload is the raw storage shape and passes through unchanged. This is deliberate: it keeps the payload honest rather than re-mapping it in flight.

**2. `client` is `null` on `synthesis.created`.**
Not "sometimes" — always. Any code that files an event against a company must handle the client-less case, or it will throw on the first synthesis.

**3. A disabled section is `[]`, not absent.**
When an admin turns a standard section off, it arrives as an empty array, not a missing key. Do not read emptiness as "the section does not exist" — read it as "nothing to show".

**4. `additional_sections` has no fixed schema.**
Its keys differ per organization and appear without warning — see [Custom sections](#custom-sections). Iterate; never hard-code an expected key; anchor any mapping on `key`, never on `title`.

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
