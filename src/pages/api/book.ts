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

  // Required fields, enforced server-side (mirror of the client-side form rules).
  for (const field of ['start', 'email', 'name', 'role', 'team_size', 'note'] as const) {
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
