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

/** Posición (%) del inicio del día de hoy en la pista del mes. */
export function todayMarkerLeft(today: IsoDate): number {
  const { y, m, d } = parseIso(today);
  return ((d - 1) / daysInMonth(y, m)) * 100;
}

/**
 * Segmentos de la pista mensual.
 * - `active`: ciclo actual recortado al mes (lleva nombre/importe).
 * - `next`: tramo posterior a la renovación dentro del mes (aún no cobrado).
 * - `prev`: tramo del ciclo anterior que solapa el mes (p.ej. renovó el 23
 *   y hoy es el 30 → del 1 al 23), solo si el gasto ya estaba activo al
 *   inicio del mes.
 */
export function laneSegments(
  cycle: CycleProgress,
  today: IsoDate,
  startsOn?: IsoDate,
): {
  active: { left: number; width: number };
  next: { left: number; width: number } | null;
  prev: { left: number; width: number } | null;
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
  const prev =
    cycle.mode === "renewing" &&
    startsOn &&
    startsOn <= ms &&
    cycle.cycleStart > ms &&
    cycle.cycleStart < me
      ? pctInMonth(ms, cycle.cycleStart, today)
      : null;
  return { active, next, prev, dim };
}
