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
