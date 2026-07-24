import {
  cancel,
  createChannel,
  Importance,
  isPermissionGranted,
  requestPermission,
  Schedule,
  sendNotification,
  Visibility,
} from "@tauri-apps/plugin-notification";
import {
  addDays,
  effectiveEndOn,
  formatEur,
  nextRenewalOn,
  type AppSettings,
  type Expense,
  type IsoDate,
  todayLocal,
} from "../domain";

export const CHANNEL_DUE = "gastos-proximos";
export const CHANNEL_END = "suscripciones-fin";

/** IDs estables: cobro = hash positivo, fin = cobro + offset. */
export function notificationId(expenseId: string, kind: "due" | "end"): number {
  let hash = 0;
  for (let i = 0; i < expenseId.length; i++) {
    hash = (hash * 31 + expenseId.charCodeAt(i)) >>> 0;
  }
  const base = (hash % 1_000_000_000) + 1;
  return kind === "due" ? base : base + 1_000_000_000;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    let granted = await isPermissionGranted();
    if (!granted) {
      const perm = await requestPermission();
      granted = perm === "granted";
    }
    if (granted) {
      await ensureChannels();
    }
    return granted;
  } catch {
    return false;
  }
}

async function ensureChannels(): Promise<void> {
  try {
    await createChannel({
      id: CHANNEL_DUE,
      name: "Gastos próximos",
      description: "Avisos de cobros y renovaciones",
      importance: Importance.Default,
      visibility: Visibility.Private,
    });
    await createChannel({
      id: CHANNEL_END,
      name: "Suscripciones al fin",
      description: "Avisos de caducidad de suscripciones",
      importance: Importance.Default,
      visibility: Visibility.Private,
    });
  } catch {
    /* canales ya creados o entorno sin plugin */
  }
}

function atLocal(date: IsoDate, hour: number, minute: number): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d, hour, minute, 0, 0);
}

function endBody(name: string, days: number): string {
  if (days === 0) return `${name} termina hoy`;
  if (days === 1) return `${name} termina mañana`;
  return `${name} termina en ${days} días`;
}

function dueBody(name: string, amountMinor: number, days: number): string {
  const amount = formatEur(amountMinor);
  if (days === 0) return `${name} · ${amount} hoy`;
  if (days === 1) return `${name} · ${amount} mañana`;
  return `${name} · ${amount} en ${days} días`;
}

async function cancelPair(expenseId: string): Promise<void> {
  try {
    await cancel([
      notificationId(expenseId, "due"),
      notificationId(expenseId, "end"),
    ]);
  } catch {
    /* plugin ausente en web */
  }
}

export async function resyncExpenseNotifications(
  expense: Expense,
  settings: AppSettings,
  today = todayLocal(),
): Promise<void> {
  await cancelPair(expense.id);
  if (expense.status === "ended") return;

  const granted = await ensureNotificationPermission().catch(() => false);
  if (!granted) return;

  const dueDays =
    expense.notifyDaysBeforeDue ?? settings.defaultNotifyDaysBeforeDue;
  const endDays =
    expense.notifyDaysBeforeEnd ?? settings.defaultNotifyDaysBeforeEnd;
  const end = effectiveEndOn(expense);
  const next = nextRenewalOn(expense, today);

  const jobs: {
    id: number;
    title: string;
    body: string;
    date: Date;
    channelId: string;
  }[] = [];

  // Cancelación pendiente: sustituye aviso de renovación por el de final
  if (expense.status === "ending" && end) {
    const fireOn = addDays(end, -endDays);
    if (fireOn >= today) {
      jobs.push({
        id: notificationId(expense.id, "end"),
        title: "Fin de suscripción",
        body: endBody(expense.name, endDays),
        date: atLocal(fireOn, settings.notifyHour, settings.notifyMinute),
        channelId: CHANNEL_END,
      });
    }
  } else {
    if (next && (!end || next < end)) {
      const fireOn = addDays(next, -dueDays);
      if (fireOn >= today) {
        jobs.push({
          id: notificationId(expense.id, "due"),
          title: "Próximo cobro",
          body: dueBody(expense.name, expense.amountMinor, dueDays),
          date: atLocal(fireOn, settings.notifyHour, settings.notifyMinute),
          channelId: CHANNEL_DUE,
        });
      }
    }
    if (end) {
      const fireOn = addDays(end, -endDays);
      if (fireOn >= today) {
        jobs.push({
          id: notificationId(expense.id, "end"),
          title: "Fin de suscripción",
          body: endBody(expense.name, endDays),
          date: atLocal(fireOn, settings.notifyHour, settings.notifyMinute),
          channelId: CHANNEL_END,
        });
      }
    }
  }

  for (const job of jobs) {
    if (job.date.getTime() <= Date.now()) continue;
    try {
      sendNotification({
        id: job.id,
        title: job.title,
        body: job.body,
        channelId: job.channelId,
        schedule: Schedule.at(job.date, false, true),
        extra: { expenseId: expense.id },
      });
    } catch {
      /* entorno sin plugin */
    }
  }
}

export async function resyncAllNotifications(
  expenses: Expense[],
  settings: AppSettings,
): Promise<void> {
  for (const expense of expenses) {
    await resyncExpenseNotifications(expense, settings);
  }
}

export async function clearExpenseNotifications(
  expenseId: string,
): Promise<void> {
  await cancelPair(expenseId);
}
