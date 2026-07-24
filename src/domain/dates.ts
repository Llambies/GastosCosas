/** Fechas locales ISO `YYYY-MM-DD` sin conversiones UTC. */

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

export type IsoDate = string;

export function parseIso(date: IsoDate): { y: number; m: number; d: number } {
  const match = ISO.exec(date);
  if (!match) throw new Error(`Fecha ISO inválida: ${date}`);
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

export function toIso(y: number, m: number, d: number): IsoDate {
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function todayLocal(now = new Date()): IsoDate {
  return toIso(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

export function clampDay(y: number, m: number, day: number): number {
  return Math.min(day, daysInMonth(y, m));
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const { y, m, d } = parseIso(date);
  const dt = new Date(y, m - 1, d + days);
  return toIso(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
}

export function addMonthsClamped(date: IsoDate, months: number): IsoDate {
  const { y, m, d } = parseIso(date);
  const total = y * 12 + (m - 1) + months;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return toIso(ny, nm, clampDay(ny, nm, d));
}

export function addYearsClamped(date: IsoDate, years: number): IsoDate {
  const { y, m, d } = parseIso(date);
  const ny = y + years;
  return toIso(ny, m, clampDay(ny, m, d));
}

export function compareIso(a: IsoDate, b: IsoDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function minIso(a: IsoDate, b: IsoDate): IsoDate {
  return compareIso(a, b) <= 0 ? a : b;
}

export function maxIso(a: IsoDate, b: IsoDate): IsoDate {
  return compareIso(a, b) >= 0 ? a : b;
}

export function monthStart(date: IsoDate): IsoDate {
  const { y, m } = parseIso(date);
  return toIso(y, m, 1);
}

export function nextMonthStart(date: IsoDate): IsoDate {
  return addMonthsClamped(monthStart(date), 1);
}

export function daysBetween(start: IsoDate, end: IsoDate): number {
  const a = parseIso(start);
  const b = parseIso(end);
  const da = Date.UTC(a.y, a.m - 1, a.d);
  const db = Date.UTC(b.y, b.m - 1, b.d);
  return Math.round((db - da) / 86_400_000);
}

/** Solape de rangos semiabiertos [a0,a1) ∩ [b0,b1). */
export function overlapDays(
  a0: IsoDate,
  a1: IsoDate,
  b0: IsoDate,
  b1: IsoDate,
): number {
  const start = maxIso(a0, b0);
  const end = minIso(a1, b1);
  const n = daysBetween(start, end);
  return n > 0 ? n : 0;
}

export function formatDayLabel(date: IsoDate): string {
  const { d } = parseIso(date);
  return String(d);
}
