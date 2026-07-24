import { compareIso, type IsoDate } from "./dates";
import { effectiveEndOn } from "./effectiveEnd";
import { nextRenewalOn } from "./recurrence";
import type { Expense, ExpenseStatus } from "./types";

export { effectiveEndOn };

export function deriveStatus(
  expense: Pick<
    Expense,
    "endsOn" | "cancellationEffectiveOn" | "cancellationRequestedOn" | "status"
  >,
  today: IsoDate,
): ExpenseStatus {
  const end = effectiveEndOn(expense);
  if (end && compareIso(today, end) >= 0) return "ended";
  if (expense.cancellationEffectiveOn || expense.cancellationRequestedOn) {
    return "ending";
  }
  return "active";
}

export function requestCancellation(
  expense: Expense,
  today: IsoDate,
): Pick<
  Expense,
  | "status"
  | "cancellationRequestedOn"
  | "cancellationEffectiveOn"
  | "updatedAt"
> {
  if (!expense.isCancellable) {
    throw new Error("Este gasto no se puede cancelar");
  }
  if (expense.status === "ended") {
    throw new Error("El gasto ya ha finalizado");
  }
  const next = nextRenewalOn(
    { ...expense, cancellationEffectiveOn: null },
    today,
  );
  const effective = next ?? effectiveEndOn(expense) ?? today;
  return {
    status: "ending",
    cancellationRequestedOn: today,
    cancellationEffectiveOn: effective,
    updatedAt: new Date().toISOString(),
  };
}

export function undoCancellation(
  expense: Expense,
  today: IsoDate,
): Pick<
  Expense,
  | "status"
  | "cancellationRequestedOn"
  | "cancellationEffectiveOn"
  | "updatedAt"
> {
  const end = expense.endsOn;
  let status: ExpenseStatus = "active";
  if (end && compareIso(today, end) >= 0) {
    status = "ended";
  }
  return {
    status,
    cancellationRequestedOn: null,
    cancellationEffectiveOn: null,
    updatedAt: new Date().toISOString(),
  };
}
