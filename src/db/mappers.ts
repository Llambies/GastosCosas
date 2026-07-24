import type { Expense, Label } from "../domain/types";
import type { ExpenseRow, LabelRow } from "./types";

export function mapLabel(row: LabelRow): Label {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    createdAt: row.created_at,
  };
}

export function mapExpense(row: ExpenseRow, labels: Label[]): Expense {
  return {
    id: row.id,
    name: row.name,
    amountMinor: row.amount_minor,
    currency: row.currency,
    kind: row.kind as Expense["kind"],
    periodPreset: row.period_preset as Expense["periodPreset"],
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    recurrence: row.recurrence as Expense["recurrence"],
    isCancellable: row.is_cancellable === 1,
    status: row.status as Expense["status"],
    cancellationRequestedOn: row.cancellation_requested_on,
    cancellationEffectiveOn: row.cancellation_effective_on,
    icon: row.icon,
    color: row.color,
    notifyDaysBeforeDue: row.notify_days_before_due,
    notifyDaysBeforeEnd: row.notify_days_before_end,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    labels,
  };
}
