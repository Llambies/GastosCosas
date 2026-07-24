import Database from "@tauri-apps/plugin-sql";

let dbPromise: Promise<Database> | null = null;

export function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = Database.load("sqlite:gastocosas.db");
  }
  return dbPromise;
}

/** Fallback en memoria para desarrollo web sin Tauri. */
class MemoryDb {
  private expenses = new Map<string, Record<string, unknown>>();
  private labels = new Map<string, Record<string, unknown>>();
  private links = new Set<string>();
  private settings = new Map<string, string>([
    ["notify_hour", "9"],
    ["notify_minute", "0"],
    ["default_notify_days_before_due", "1"],
    ["default_notify_days_before_end", "3"],
    ["currency", "EUR"],
  ]);

  constructor() {
    const seed = [
      ["lbl-streaming", "Streaming", "tv", "#F59E0B"],
      ["lbl-vivienda", "Vivienda", "home", "#38BDF8"],
      ["lbl-transporte", "Transporte", "car", "#34D399"],
      ["lbl-salud", "Salud", "heart-pulse", "#F472B6"],
      ["lbl-otros", "Otros", "sparkles", "#94A3B8"],
    ] as const;
    for (const [id, name, icon, color] of seed) {
      this.labels.set(id, {
        id,
        name,
        icon,
        color,
        created_at: "2020-01-01T00:00:00.000Z",
      });
    }
  }

  async select<T>(query: string, bind: unknown[] = []): Promise<T> {
    const q = query.replace(/\s+/g, " ").trim().toLowerCase();
    if (q.includes("from labels") && !q.includes("expense_labels")) {
      return [...this.labels.values()] as T;
    }
    if (q.includes("from settings")) {
      if (q.includes("where key")) {
        const key = String(bind[0]);
        const value = this.settings.get(key);
        return (value ? [{ key, value }] : []) as T;
      }
      return [...this.settings.entries()].map(([key, value]) => ({
        key,
        value,
      })) as T;
    }
    if (q.includes("from expenses") && q.includes("where id")) {
      const row = this.expenses.get(String(bind[0]));
      return (row ? [row] : []) as T;
    }
    if (q.includes("from expenses")) {
      return [...this.expenses.values()] as T;
    }
    if (q.includes("from expense_labels") && q.includes("join labels")) {
      const expenseId = String(bind[0]);
      const out = [];
      for (const key of this.links) {
        const [eid, lid] = key.split("::");
        if (eid === expenseId) {
          const lab = this.labels.get(lid);
          if (lab) out.push(lab);
        }
      }
      return out as T;
    }
    return [] as T;
  }

  async execute(query: string, bind: unknown[] = []): Promise<{ rowsAffected: number }> {
    const q = query.replace(/\s+/g, " ").trim().toLowerCase();
    if (q.startsWith("insert into expenses")) {
      const id = String(bind[0]);
      this.expenses.set(id, {
        id,
        name: bind[1],
        amount_minor: bind[2],
        currency: bind[3],
        kind: bind[4],
        period_preset: bind[5],
        starts_on: bind[6],
        ends_on: bind[7],
        recurrence: bind[8],
        is_cancellable: bind[9],
        status: bind[10],
        cancellation_requested_on: bind[11],
        cancellation_effective_on: bind[12],
        icon: bind[13],
        color: bind[14],
        notify_days_before_due: bind[15],
        notify_days_before_end: bind[16],
        notes: bind[17],
        created_at: bind[18],
        updated_at: bind[19],
      });
      return { rowsAffected: 1 };
    }
    if (q.startsWith("update expenses set")) {
      const id = String(bind[bind.length - 1]);
      const prev = this.expenses.get(id);
      if (!prev) return { rowsAffected: 0 };
      // Orden alineado con repositories.updateExpense
      const keys = [
        "name",
        "amount_minor",
        "currency",
        "kind",
        "period_preset",
        "starts_on",
        "ends_on",
        "recurrence",
        "is_cancellable",
        "status",
        "cancellation_requested_on",
        "cancellation_effective_on",
        "icon",
        "color",
        "notify_days_before_due",
        "notify_days_before_end",
        "notes",
        "updated_at",
      ];
      const next = { ...prev };
      keys.forEach((k, i) => {
        next[k] = bind[i] as never;
      });
      this.expenses.set(id, next);
      return { rowsAffected: 1 };
    }
    if (q.startsWith("delete from expenses")) {
      const id = String(bind[0]);
      this.expenses.delete(id);
      for (const key of [...this.links]) {
        if (key.startsWith(`${id}::`)) this.links.delete(key);
      }
      return { rowsAffected: 1 };
    }
    if (q.startsWith("insert into expense_labels")) {
      this.links.add(`${bind[0]}::${bind[1]}`);
      return { rowsAffected: 1 };
    }
    if (q.startsWith("delete from expense_labels")) {
      const id = String(bind[0]);
      for (const key of [...this.links]) {
        if (key.startsWith(`${id}::`)) this.links.delete(key);
      }
      return { rowsAffected: 1 };
    }
    if (q.startsWith("insert into labels")) {
      const id = String(bind[0]);
      this.labels.set(id, {
        id,
        name: bind[1],
        icon: bind[2],
        color: bind[3],
        created_at: bind[4],
      });
      return { rowsAffected: 1 };
    }
    if (q.startsWith("update labels")) {
      const id = String(bind[3]);
      const prev = this.labels.get(id);
      if (!prev) return { rowsAffected: 0 };
      this.labels.set(id, {
        ...prev,
        name: bind[0],
        icon: bind[1],
        color: bind[2],
      });
      return { rowsAffected: 1 };
    }
    if (q.startsWith("delete from labels")) {
      const id = String(bind[0]);
      this.labels.delete(id);
      for (const key of [...this.links]) {
        if (key.endsWith(`::${id}`)) this.links.delete(key);
      }
      return { rowsAffected: 1 };
    }
    if (q.startsWith("insert into settings") || q.startsWith("insert or replace into settings")) {
      this.settings.set(String(bind[0]), String(bind[1]));
      return { rowsAffected: 1 };
    }
    return { rowsAffected: 0 };
  }
}

let memory: MemoryDb | null = null;

export async function getDbSafe(): Promise<{
  select: <T>(q: string, b?: unknown[]) => Promise<T>;
  execute: (q: string, b?: unknown[]) => Promise<{ rowsAffected: number }>;
}> {
  try {
    return await getDb();
  } catch {
    if (!memory) memory = new MemoryDb();
    return memory;
  }
}
