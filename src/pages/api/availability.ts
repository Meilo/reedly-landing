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
    return json(200, {
      timezone: BOOKING_CONFIG.timezone,
      slotMinutes: BOOKING_CONFIG.slotMinutes,
      days,
    });
  } catch (err) {
    console.error('[availability] error:', err);
    return json(500, { error: 'unavailable' });
  }
};
