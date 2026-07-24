import {
  addDays,
  daysInMonth,
  maxIso,
  minIso,
  monthStart,
  nextMonthStart,
  overlapDays,
  parseIso,
  type IsoDate,
} from "./dates";
import { effectiveEndOn } from "./effectiveEnd";
import type { Expense } from "./types";

function monthBaseMinor(expense: Expense, month: IsoDate): number {
  const ms = monthStart(month);
  const me = nextMonthStart(month);

  switch (expense.recurrence) {
    case "yearly":
      return Math.round(expense.amountMinor / 12);
    case "monthly":
      return expense.amountMinor;
    case "none": {
      if (expense.startsOn >= ms && expense.startsOn < me) {
        return expense.amountMinor;
      }
      return 0;
    }
  }
}

function coverageEnd(
  expense: Expense,
  hardCap: IsoDate,
): IsoDate {
  const end = effectiveEndOn(expense);
  if (end) return minIso(end, hardCap);
  return hardCap;
}

function contributionMinor(
  expense: Expense,
  intervalStart: IsoDate,
  intervalEnd: IsoDate,
  month: IsoDate,
): number {
  const ms = monthStart(month);
  const me = nextMonthStart(month);
  const { y, m } = parseIso(ms);
  const dim = daysInMonth(y, m);
  const base = monthBaseMinor(expense, month);
  if (base === 0) return 0;

  const start = maxIso(expense.startsOn, ms);
  const end = coverageEnd(expense, me);
  const days = overlapDays(start, end, intervalStart, intervalEnd);
  if (days <= 0) return 0;
  return Math.round((base * days) / dim);
}

/** Gastado este mes: consumo estimado hasta mañana (hoy inclusive). */
export function spentThisMonth(expenses: Expense[], today: IsoDate): number {
  const ms = monthStart(today);
  const me = nextMonthStart(today);
  const tomorrow = addDays(today, 1);
  const intervalEnd = minIso(tomorrow, me);

  return expenses.reduce((sum, expense) => {
    if (expense.status === "ended" && effectiveEndOn(expense)) {
      // sigue aportando si hubo solape en el mes
    }
    return sum + contributionMinor(expense, ms, intervalEnd, today);
  }, 0);
}

/** Previsto: proyección prorrateada hasta fin de mes o fin efectivo. */
export function forecastThisMonth(expenses: Expense[], today: IsoDate): number {
  const ms = monthStart(today);
  const me = nextMonthStart(today);

  return expenses.reduce((sum, expense) => {
    return sum + contributionMinor(expense, ms, me, today);
  }, 0);
}

export function expenseSpentShare(
  expense: Expense,
  today: IsoDate,
): number {
  return spentThisMonth([expense], today);
}

export function expenseForecastShare(
  expense: Expense,
  today: IsoDate,
): number {
  return forecastThisMonth([expense], today);
}
