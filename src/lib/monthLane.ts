import {
  daysBetween,
  daysInMonth,
  maxIso,
  minIso,
  monthStart,
  nextMonthStart,
  parseIso,
  type CycleProgress,
  type IsoDate,
} from "../domain";

export function pctInMonth(
  from: IsoDate,
  to: IsoDate,
  month: IsoDate,
): { left: number; width: number } {
  const ms = monthStart(month);
  const me = nextMonthStart(month);
  const { y, m } = parseIso(ms);
  const dim = daysInMonth(y, m);
  const start = maxIso(from, ms);
  const end = minIso(to, me);
  const span = daysBetween(start, end);
  if (span <= 0) return { left: 0, width: 0 };
  return {
    left: (daysBetween(ms, start) / dim) * 100,
    width: (span / dim) * 100,
  };
}

export function laneSegments(
  cycle: CycleProgress,
  today: IsoDate,
): {
  active: { left: number; width: number };
  next: { left: number; width: number } | null;
  dim: number;
} {
  const ms = monthStart(today);
  const me = nextMonthStart(today);
  const { y, m } = parseIso(ms);
  const dim = daysInMonth(y, m);
  const active = pctInMonth(cycle.cycleStart, cycle.cycleEnd, today);
  const next =
    cycle.mode === "renewing" && cycle.cycleEnd < me
      ? pctInMonth(cycle.cycleEnd, me, today)
      : null;
  return { active, next, dim };
}
