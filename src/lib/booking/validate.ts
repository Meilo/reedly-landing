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
