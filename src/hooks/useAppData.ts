import { useCallback, useEffect, useState } from "react";
import * as repo from "../db/repositories";
import {
  forecastThisMonth,
  spentThisMonth,
  todayLocal,
  type AppSettings,
  type Expense,
  type Label,
} from "../domain";
import { resyncAllNotifications } from "../notifications/scheduler";

export function useAppData() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const today = todayLocal();

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [ex, lb, st] = await Promise.all([
        repo.listExpenses(),
        repo.listLabels(),
        repo.getSettings(),
      ]);
      setExpenses(ex);
      setLabels(lb);
      setSettings(st);
      void resyncAllNotifications(ex, st);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const active = expenses.filter((e) => e.status !== "ended");
  const subscriptions = active.filter((e) => e.kind === "subscription");
  const fixed = active.filter((e) => e.kind === "fixed");

  return {
    expenses,
    labels,
    settings,
    loading,
    error,
    today,
    refresh,
    subscriptions,
    fixed,
    spent: spentThisMonth(active, today),
    forecast: forecastThisMonth(active, today),
    setSettings,
  };
}
