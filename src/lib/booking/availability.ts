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
