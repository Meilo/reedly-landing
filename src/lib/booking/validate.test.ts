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
