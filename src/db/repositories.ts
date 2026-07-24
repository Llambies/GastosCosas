import {
  deriveStatus,
  requestCancellation,
  todayLocal,
  undoCancellation,
  type AppSettings,
  type Expense,
  type ExpenseInput,
  type Label,
} from "../domain";
import { getDbSafe } from "./client";
import { mapExpense, mapLabel } from "./mappers";
import type { ExpenseRow, LabelRow } from "./types";

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

async function labelsForExpense(expenseId: string): Promise<Label[]> {
  const db = await getDbSafe();
  const rows = await db.select<LabelRow[]>(
    `SELECT l.id, l.name, l.icon, l.color, l.created_at
     FROM expense_labels el
     JOIN labels l ON l.id = el.label_id
     WHERE el.expense_id = ?
     ORDER BY l.name`,
    [expenseId],
  );
  return rows.map(mapLabel);
}

export async function listLabels(): Promise<Label[]> {
  const db = await getDbSafe();
  const rows = await db.select<LabelRow[]>(
    "SELECT id, name, icon, color, created_at FROM labels ORDER BY name",
  );
  return rows.map(mapLabel);
}

export async function createLabel(input: {
  name: string;
  icon: string;
  color: string;
}): Promise<Label> {
  const db = await getDbSafe();
  const id = newId("lbl");
  const createdAt = new Date().toISOString();
  await db.execute(
    "INSERT INTO labels (id, name, icon, color, created_at) VALUES (?, ?, ?, ?, ?)",
    [id, input.name.trim(), input.icon, input.color, createdAt],
  );
  return { id, name: input.name.trim(), icon: input.icon, color: input.color, createdAt };
}

export async function updateLabel(
  id: string,
  input: { name: string; icon: string; color: string },
): Promise<void> {
  const db = await getDbSafe();
  await db.execute(
    "UPDATE labels SET name = ?, icon = ?, color = ? WHERE id = ?",
    [input.name.trim(), input.icon, input.color, id],
  );
}

export async function deleteLabel(id: string): Promise<void> {
  const db = await getDbSafe();
  await db.execute("DELETE FROM labels WHERE id = ?", [id]);
}

export async function listExpenses(): Promise<Expense[]> {
  const db = await getDbSafe();
  const today = todayLocal();
  const rows = await db.select<ExpenseRow[]>(
    "SELECT * FROM expenses ORDER BY name COLLATE NOCASE",
  );
  const result: Expense[] = [];
  for (const row of rows) {
    const labels = await labelsForExpense(row.id);
    let expense = mapExpense(row, labels);
    const status = deriveStatus(expense, today);
    if (status !== expense.status) {
      await db.execute(
        "UPDATE expenses SET status = ?, updated_at = ? WHERE id = ?",
        [status, new Date().toISOString(), expense.id],
      );
      expense = { ...expense, status };
    }
    result.push(expense);
  }
  return result;
}

export async function getExpense(id: string): Promise<Expense | null> {
  const db = await getDbSafe();
  const rows = await db.select<ExpenseRow[]>(
    "SELECT * FROM expenses WHERE id = ?",
    [id],
  );
  if (!rows[0]) return null;
  const labels = await labelsForExpense(id);
  return mapExpense(rows[0], labels);
}

async function setExpenseLabels(
  expenseId: string,
  labelIds: string[],
): Promise<void> {
  const db = await getDbSafe();
  await db.execute("DELETE FROM expense_labels WHERE expense_id = ?", [
    expenseId,
  ]);
  for (const labelId of labelIds) {
    await db.execute(
      "INSERT INTO expense_labels (expense_id, label_id) VALUES (?, ?)",
      [expenseId, labelId],
    );
  }
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  const db = await getDbSafe();
  const id = newId("exp");
  const now = new Date().toISOString();
  const isCancellable =
    input.isCancellable ?? (input.kind === "subscription" ? true : false);

  await db.execute(
    `INSERT INTO expenses (
      id, name, amount_minor, currency, kind, period_preset,
      starts_on, ends_on, recurrence, is_cancellable, status,
      cancellation_requested_on, cancellation_effective_on,
      icon, color, notify_days_before_due, notify_days_before_end,
      notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.name.trim(),
      input.amountMinor,
      input.currency ?? "EUR",
      input.kind,
      input.periodPreset,
      input.startsOn,
      input.endsOn ?? null,
      input.recurrence,
      isCancellable ? 1 : 0,
      "active",
      null,
      null,
      input.icon,
      input.color,
      input.notifyDaysBeforeDue ?? null,
      input.notifyDaysBeforeEnd ?? null,
      input.notes ?? null,
      now,
      now,
    ],
  );
  await setExpenseLabels(id, input.labelIds);
  const created = await getExpense(id);
  if (!created) throw new Error("No se pudo crear el gasto");
  return created;
}

export async function updateExpense(
  id: string,
  input: ExpenseInput,
  extras?: Partial<
    Pick<
      Expense,
      | "status"
      | "cancellationRequestedOn"
      | "cancellationEffectiveOn"
    >
  >,
): Promise<Expense> {
  const db = await getDbSafe();
  const existing = await getExpense(id);
  if (!existing) throw new Error("Gasto no encontrado");
  const now = new Date().toISOString();
  const isCancellable =
    input.isCancellable ?? existing.isCancellable;

  await db.execute(
    `UPDATE expenses SET
      name = ?, amount_minor = ?, currency = ?, kind = ?, period_preset = ?,
      starts_on = ?, ends_on = ?, recurrence = ?, is_cancellable = ?,
      status = ?, cancellation_requested_on = ?, cancellation_effective_on = ?,
      icon = ?, color = ?, notify_days_before_due = ?, notify_days_before_end = ?,
      notes = ?, updated_at = ?
     WHERE id = ?`,
    [
      input.name.trim(),
      input.amountMinor,
      input.currency ?? existing.currency,
      input.kind,
      input.periodPreset,
      input.startsOn,
      input.endsOn ?? null,
      input.recurrence,
      isCancellable ? 1 : 0,
      extras?.status ?? existing.status,
      extras?.cancellationRequestedOn ?? existing.cancellationRequestedOn,
      extras?.cancellationEffectiveOn ?? existing.cancellationEffectiveOn,
      input.icon,
      input.color,
      input.notifyDaysBeforeDue ?? null,
      input.notifyDaysBeforeEnd ?? null,
      input.notes ?? null,
      now,
      id,
    ],
  );
  await setExpenseLabels(id, input.labelIds);
  const updated = await getExpense(id);
  if (!updated) throw new Error("No se pudo actualizar el gasto");
  return updated;
}

export async function deleteExpense(id: string): Promise<void> {
  const db = await getDbSafe();
  await db.execute("DELETE FROM expenses WHERE id = ?", [id]);
}

export async function cancelExpense(id: string, today = todayLocal()): Promise<Expense> {
  const db = await getDbSafe();
  const existing = await getExpense(id);
  if (!existing) throw new Error("Gasto no encontrado");
  const patch = requestCancellation(existing, today);
  await db.execute(
    `UPDATE expenses SET status = ?, cancellation_requested_on = ?,
      cancellation_effective_on = ?, updated_at = ? WHERE id = ?`,
    [
      patch.status,
      patch.cancellationRequestedOn,
      patch.cancellationEffectiveOn,
      patch.updatedAt,
      id,
    ],
  );
  const updated = await getExpense(id);
  if (!updated) throw new Error("No se pudo cancelar");
  return updated;
}

export async function undoCancelExpense(
  id: string,
  today = todayLocal(),
): Promise<Expense> {
  const db = await getDbSafe();
  const existing = await getExpense(id);
  if (!existing) throw new Error("Gasto no encontrado");
  const patch = undoCancellation(existing, today);
  await db.execute(
    `UPDATE expenses SET status = ?, cancellation_requested_on = ?,
      cancellation_effective_on = ?, updated_at = ? WHERE id = ?`,
    [
      patch.status,
      patch.cancellationRequestedOn,
      patch.cancellationEffectiveOn,
      patch.updatedAt,
      id,
    ],
  );
  const updated = await getExpense(id);
  if (!updated) throw new Error("No se pudo deshacer");
  return updated;
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDbSafe();
  const rows = await db.select<{ key: string; value: string }[]>(
    "SELECT key, value FROM settings",
  );
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    notifyHour: Number(map.get("notify_hour") ?? 9),
    notifyMinute: Number(map.get("notify_minute") ?? 0),
    defaultNotifyDaysBeforeDue: Number(
      map.get("default_notify_days_before_due") ?? 1,
    ),
    defaultNotifyDaysBeforeEnd: Number(
      map.get("default_notify_days_before_end") ?? 3,
    ),
    currency: map.get("currency") ?? "EUR",
  };
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDbSafe();
  await db.execute(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
    [key, value],
  );
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await setSetting("notify_hour", String(settings.notifyHour));
  await setSetting("notify_minute", String(settings.notifyMinute));
  await setSetting(
    "default_notify_days_before_due",
    String(settings.defaultNotifyDaysBeforeDue),
  );
  await setSetting(
    "default_notify_days_before_end",
    String(settings.defaultNotifyDaysBeforeEnd),
  );
  await setSetting("currency", settings.currency);
}
