import {
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
import { nextRenewalOn } from "./recurrence";
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

function coverageEnd(expense: Expense, hardCap: IsoDate): IsoDate {
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

/**
 * Fin del tramo "ya activo" dentro del mes: hasta la próxima renovación
 * (si aún no ha ocurrido) o hasta fin de mes / fin efectivo.
 * No se corta en "hoy".
 */
function spentIntervalEnd(expense: Expense, today: IsoDate): IsoDate {
  const me = nextMonthStart(today);
  const hardCap = coverageEnd(expense, me);
  const next = nextRenewalOn(expense, today);
  if (next && next < me) {
    return minIso(next, hardCap);
  }
  return hardCap;
}

/**
 * Gastado este mes: ciclo ya activo completo (hasta renovación/fin),
 * no prorrateo hasta hoy. No incluye renovaciones futuras del mes.
 */
export function spentThisMonth(expenses: Expense[], today: IsoDate): number {
  const ms = monthStart(today);

  return expenses.reduce((sum, expense) => {
    if (expense.startsOn > today) return sum;
    const intervalEnd = spentIntervalEnd(expense, today);
    return sum + contributionMinor(expense, ms, intervalEnd, today);
  }, 0);
}

/**
 * Previsto: coste mensual completo de suscripciones que siguen activas
 * (se espera que renueven). Si cortan este mes, se prorratea hasta el fin.
 */
export function forecastThisMonth(expenses: Expense[], today: IsoDate): number {
  const ms = monthStart(today);
  const me = nextMonthStart(today);

  return expenses.reduce((sum, expense) => {
    const base = monthBaseMinor(expense, today);
    if (base === 0) return sum;

    // Pago único: solo el solape real en el mes
    if (expense.recurrence === "none") {
      return sum + contributionMinor(expense, ms, me, today);
    }

    if (expense.startsOn >= me) return sum;

    const end = effectiveEndOn(expense);
    if (end && end <= ms) return sum;

    // Cancelada / fin dentro del mes → prorrateo hasta esa fecha
    if (end && end < me) {
      return sum + contributionMinor(expense, ms, me, today);
    }

    // Activa y se espera renovación → importe mensual completo
    return sum + base;
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
