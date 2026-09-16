# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: the field sales rep.** Covers a portfolio of accounts or points of sale
and visits them physically. Uses only the mobile app (iOS and Android), in the
account's premises: a counter, a showroom, a busy reception, sometimes with no
network. Their job during the visit is to hold the conversation, not to document
it.

**Secondary: the sales director or manager.** Runs the network of reps. Uses only
the Manager Hub on the web. Their job is to know, account by account, what is
actually being said in the field, without multiplying reporting meetings.

**Sector-agnostic.** Reedly is for any field sales team visiting a portfolio of
accounts. B2B tourism is where the first customers happen to be, not a
positioning. This supersedes the "B2B tourism vertical" framing still written in
CLAUDE.md and the README; the live FAQ and the demo form's sector picker
(tourism, industry and construction, retail, services, health) are the accurate
statement. Tourism examples in existing copy are illustrations, not a market
boundary.

## Product Purpose

Turn a physical sales visit into structured, reliable data without the rep doing
administrative work. The rep runs the meeting; the app transcribes in the
background during the conversation or takes the rep's dictation right after; a
structured report in 11 sections is generated and lands in the Manager Hub.

Success for the rep: leaving a meeting with the report already written, before
driving to the next account. Success for the director: reading the field, across
the whole team, without asking anyone for a status update.

## Positioning

**Field-first, and the client memory is the lead differentiator.** Each report
starts from that account's history rather than a blank page, and briefs the next
visit. Reedly models a relationship over time, not a series of isolated meetings.

The surrounding argument, secondary to the memory: the entire "sales AI" category
(Gong, Modjo, Noota, Fireflies, Otter, Fathom, tl;dv) was born for the online
meeting and serves inside sales. In-person capture there is a grafted mode, not
the core. Reedly is designed for the physical visit: background capture, hands
free, offline-first.

The defensible claim is the combination, not any single item, and specifically
not "we are the only ones who record in person" (several competitors do).

`docs/positioning/2026-07-07-positionnement-concurrence.md` is useful research but
is **not binding and is partly stale** (it states 29 EUR/user/month against the
live 49 EUR, and a Pro/Business/Enterprise plan structure that no longer matches).
Treat it as evidence, not as the current strategy.

## Operating Context

- The meeting happens in the account's premises, often noisy, sometimes with no
  network. The app holds offline; transcription and report generation call the AI
  models and run as soon as the connection is back.
- The rep either lets the app transcribe in the background during the
  conversation, or dictates the report immediately afterwards.
- The manager's surface is the web Hub, separate from the app. Reps never use the
  Hub; managers never use the app to work.
- Buying is organisation-level and seat-based, not self-serve individual. The
  qualifying path on the site is a booked 15-minute demo.

## Capabilities and Constraints

**Shipped and true today:**

- Mobile app (iOS and Android) for field reps; Manager Hub on the web for
  managers and sales leadership.
- Background transcription during the meeting, or dictation right after.
- Structured report in 11 sections: executive summary, client profile, needs,
  objections, commitments, next steps, opportunities, risks, recommendations.
- **Client memory across visits**: the report and the preparation start from the
  account's history and brief the next visit.
- **Max**, the conversational assistant in the Hub (`hub.reedly.ai/max`): answers
  questions on the team's field data and can create actions, emails and
  follow-ups.
- **CRM connectors**: HubSpot, Salesforce, Slack.
- **Periodic and territorial syntheses** for managers, over a chosen period.
- Works offline: the app holds with no network.

**Non-negotiable product constraint, privacy by design:**

The voice is neither recorded nor stored. Only the transcript is used to generate
the report, and only the structured report remains in the customer's Reedly
space. Never write copy framed as "audio is recorded then deleted"; that was the
old positioning and was removed site-wide. Note that the stale positioning doc
still contains the old framing ("Audio supprimé après rapport"); it is wrong.

**Compliance commitments already published on the site:** data hosted in the EU,
DPA on request, subprocessor list published, encryption at rest and in transit,
deletion on request within 30 days, participant consent built into the flow.

**Pricing:** Team at 49 EUR per rep per month (42 EUR billed annually), from 3
reps. Enterprise on quote, 16+ reps. There is no free plan, only a trial. The
dollar price is at parity, 49 USD / 42 USD, not an FX conversion.

**Bilingual, mandatory:** every public surface exists in both French and English.
Neither language is a translation afterthought.

## Brand Commitments

- Name: **Reedly**. Assets in the repo: `public/logo-mark.svg`, `public/logo-512.png`,
  `public/max-creature.png` (Max's character), `src/assets/logo.png`.
- **Never imply that reps lack skill.** Reedly replaces the administrative work
  (writing reports, taking notes), never the listening or the selling. Copy must
  valorise the rep, not position them as the problem.
- **No em dashes in copy.** Use commas, colons or periods; titles use " · ".
- Product page copy is canvas copy, kept verbatim, including the `<b>` emphasis
  inside cards.
- Section headings are two lines: first plain, second in `<em>`.

## Evidence on Hand

**Real and usable:**

- Four named testimonials, with roles, in `src/lib/i18n.ts` (`tm.*`): Maryam B.
  (founder), Margaux P. (tour-operator sales rep), Angelique C. (tour-operator
  sales rep), Isabelle V. (customer-relationship transformation consultant).
- "60% of crucial details lost" on the transcription page's problem section is a
  sourced statistic.
- Competitive research in `docs/positioning/`, with ~100 claims verified
  adversarially as of 2026-07-07. Useful as raw material; stale on pricing and
  plan structure.
- Photography in `public/images/`, mapped per feature in `src/lib/feature-media.ts`.
- The phone mockups in `src/components/app/` reproduce a real Reedly report and
  recording screen, so their content is product-accurate.

**Handle with care:**

- **"95%+ transcription accuracy" and "structured report in under 2 minutes" are
  official company figures but are not measured.** Leave the existing instances
  alone. Do not put them on new surfaces, do not build a proof section around
  them, and do not derive new numbers from them.

**Absences that must never be fabricated:**

- No customer logos, no case studies, no press coverage, no benchmark against a
  named competitor, no user counts, no revenue or retention figures.
- No certification claims (no SOC 2, no ISO). Only the compliance commitments
  listed above are published.

## Product Principles

1. **The rep's attention belongs to the client.** Anything that asks them to
   manage, tap, or watch the tool during a meeting is a failure of the product.
2. **Memory over transcript.** The unit of value is the account relationship over
   time, not the recording of one meeting. Structure and continuity beat raw
   capture.
3. **The field is the source of truth for management.** The Hub exists so a
   director can read what is actually happening without asking for it.
4. **Privacy is a product feature, stated plainly.** No voice stored, EU hosting,
   consent in the flow. It is said in the open, not buried in legal pages.
5. **Claim only what is built.** No fabricated proof, no borrowed credibility, no
   number without a source.

## Accessibility & Inclusion

No product-specific standard has been established. The site is light-theme only
by decision; `/docs` (Starlight) keeps its own dark surface, unrelated.
