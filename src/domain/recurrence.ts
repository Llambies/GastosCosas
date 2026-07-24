import {
  addDays,
  clampDay,
  compareIso,
  parseIso,
  toIso,
  type IsoDate,
} from "./dates";
import { effectiveEndOn } from "./effectiveEnd";
import type { Expense, Recurrence } from "./types";

/** Avanza N meses desde el ancla original, clampando el día del ancla. */
export function addMonthsFromAnchor(anchor: IsoDate, months: number): IsoDate {
  const { y, m, d } = parseIso(anchor);
  const total = y * 12 + (m - 1) + months;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return toIso(ny, nm, clampDay(ny, nm, d));
}

export function addYearsFromAnchor(anchor: IsoDate, years: number): IsoDate {
  const { y, m, d } = parseIso(anchor);
  const ny = y + years;
  return toIso(ny, m, clampDay(ny, m, d));
}

export function nthRenewal(anchor: IsoDate, recurrence: Recurrence, n: number): IsoDate {
  if (n <= 0) return anchor;
  switch (recurrence) {
    case "monthly":
      return addMonthsFromAnchor(anchor, n);
    case "yearly":
      return addYearsFromAnchor(anchor, n);
    case "none":
      return addDays(anchor, n);
  }
}

/** Última renovación ≤ `onOrBefore` (ancla en startsOn). */
export function lastRenewalOn(
  startsOn: IsoDate,
  recurrence: Recurrence,
  onOrBefore: IsoDate,
): IsoDate {
  if (recurrence === "none" || compareIso(startsOn, onOrBefore) > 0) {
    return startsOn;
  }
  let n = 0;
  let cursor = startsOn;
  while (true) {
    const next = nthRenewal(startsOn, recurrence, n + 1);
    if (compareIso(next, onOrBefore) > 0) return cursor;
    cursor = next;
    n += 1;
  }
}

/**
 * Próxima renovación estrictamente posterior a `after`.
 * Respeta fin efectivo: no hay renovación en/después del fin.
 */
export function nextRenewalOn(
  expense: Pick<
    Expense,
    | "startsOn"
    | "recurrence"
    | "endsOn"
    | "cancellationEffectiveOn"
    | "status"
  >,
  after: IsoDate,
): IsoDate | null {
  if (expense.recurrence === "none") return null;
  const end = effectiveEndOn(expense);

  if (compareIso(expense.startsOn, after) > 0) {
    if (end && compareIso(expense.startsOn, end) >= 0) return null;
    return expense.startsOn;
  }

  let n = 0;
  let next = nthRenewal(expense.startsOn, expense.recurrence, 1);
  while (compareIso(next, after) <= 0) {
    n += 1;
    next = nthRenewal(expense.startsOn, expense.recurrence, n + 1);
  }
  if (end && compareIso(next, end) >= 0) return null;
  return next;
}
