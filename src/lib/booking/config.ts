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
