import {
  addDays,
  compareIso,
  daysBetween,
  type IsoDate,
} from "./dates";
import { effectiveEndOn } from "./effectiveEnd";
import { lastRenewalOn, nextRenewalOn } from "./recurrence";
import type { CycleProgress, Expense } from "./types";

function relativeLabel(target: IsoDate, today: IsoDate, verb: "Renueva" | "Acaba"): string {
  const diff = daysBetween(today, target);
  if (diff === 0) return `${verb} hoy`;
  if (diff === 1) return `${verb} mañana`;
  if (diff > 1 && diff <= 7) {
    return verb === "Acaba" ? `Quedan ${diff} días` : `${verb} en ${diff} días`;
  }
  const day = Number(target.slice(8, 10));
  return `${verb} el ${day}`;
}

export function cycleProgress(
  expense: Expense,
  today: IsoDate,
): CycleProgress | null {
  const status =
    expense.status === "ended" ||
    (effectiveEndOn(expense) &&
      compareIso(today, effectiveEndOn(expense)!) >= 0)
      ? "ended"
      : expense.status;

  if (status === "ended") return null;

  const end = effectiveEndOn(expense);
  const next = nextRenewalOn(expense, today);
  const willEndWithoutFullCycle =
    !!end && (!next || compareIso(end, next) <= 0);

  if (expense.status === "ending" || willEndWithoutFullCycle) {
    const marker = end!;
    const cycleStart =
      expense.recurrence === "none"
        ? expense.startsOn
        : lastRenewalOn(expense.startsOn, expense.recurrence, today);
    const cycleEnd = marker;
    const total = Math.max(1, daysBetween(cycleStart, cycleEnd));
    const elapsed = Math.min(
      total,
      Math.max(0, daysBetween(cycleStart, addDays(today, 1))),
    );
    return {
      mode: "ending",
      progress: Math.min(1, elapsed / total),
      cycleStart,
      cycleEnd,
      markerOn: marker,
      label: relativeLabel(marker, today, "Acaba"),
    };
  }

  if (!next) return null;

  const cycleStart =
    expense.recurrence === "none"
      ? expense.startsOn
      : lastRenewalOn(expense.startsOn, expense.recurrence, today);
  const cycleEnd = next;
  const total = Math.max(1, daysBetween(cycleStart, cycleEnd));
  const elapsed = Math.min(
    total,
    Math.max(0, daysBetween(cycleStart, addDays(today, 1))),
  );

  return {
    mode: "renewing",
    progress: Math.min(1, elapsed / total),
    cycleStart,
    cycleEnd,
    markerOn: next,
    label: relativeLabel(next, today, "Renueva"),
  };
}
