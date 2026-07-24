import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { ToastState } from "./components/Toast";
import { ToastHost } from "./components/Toast";
import * as repo from "./db/repositories";
import type { ExpenseInput } from "./domain";
import { useAppData } from "./hooks/useAppData";
import {
  clearExpenseNotifications,
  resyncAllNotifications,
  resyncExpenseNotifications,
} from "./notifications/scheduler";
import { ExpenseDetail } from "./screens/ExpenseDetail";
import { ExpenseForm } from "./screens/ExpenseForm";
import { Home } from "./screens/Home";
import { LabelsManager } from "./screens/LabelsManager";
import { Settings } from "./screens/Settings";

type Route =
  | { name: "home" }
  | { name: "create" }
  | { name: "edit"; id: string }
  | { name: "detail"; id: string }
  | { name: "settings" }
  | { name: "labels"; from: "settings" | "create" | "edit"; editId?: string };

export default function App() {
  const data = useAppData();
  const [route, setRoute] = useState<Route>({ name: "home" });
  const [toast, setToast] = useState<ToastState | null>(null);

  const detailExpense =
    route.name === "detail" || route.name === "edit"
      ? data.expenses.find((e) => e.id === (route as { id: string }).id) ?? null
      : null;

  async function afterMutation() {
    await data.refresh();
  }

  return (
    <div className="app-shell">
      <div className="app-scroll">
      <AnimatePresence mode="wait">
        <motion.div
          key={route.name + ("id" in route ? route.id : "") + ("from" in route ? route.from : "")}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          {route.name === "home" && (
            <Home
              spent={data.spent}
              forecast={data.forecast}
              subscriptions={data.subscriptions}
              fixed={data.fixed}
              today={data.today}
              loading={data.loading}
              error={data.error}
              onOpen={(id) => setRoute({ name: "detail", id })}
              onSettings={() => setRoute({ name: "settings" })}
            />
          )}

          {(route.name === "create" || route.name === "edit") && (
            <ExpenseForm
              initial={route.name === "edit" ? detailExpense : null}
              labels={data.labels}
              onBack={() =>
                setRoute(
                  route.name === "edit"
                    ? { name: "detail", id: route.id }
                    : { name: "home" },
                )
              }
              onNewLabel={() =>
                setRoute({
                  name: "labels",
                  from: route.name,
                  editId: route.name === "edit" ? route.id : undefined,
                })
              }
              onSave={async (input: ExpenseInput) => {
                if (route.name === "edit") {
                  const updated = await repo.updateExpense(route.id, input);
                  if (data.settings) {
                    await resyncExpenseNotifications(updated, data.settings);
                  }
                  setToast({ message: "Gasto actualizado" });
                  await afterMutation();
                  setRoute({ name: "detail", id: route.id });
                } else {
                  const created = await repo.createExpense(input);
                  if (data.settings) {
                    await resyncExpenseNotifications(created, data.settings);
                  }
                  setToast({ message: "Gasto creado" });
                  await afterMutation();
                  setRoute({ name: "home" });
                }
              }}
            />
          )}

          {route.name === "detail" && detailExpense && (
            <ExpenseDetail
              expense={detailExpense}
              today={data.today}
              onBack={() => setRoute({ name: "home" })}
              onEdit={() => setRoute({ name: "edit", id: detailExpense.id })}
              onDelete={async () => {
                await clearExpenseNotifications(detailExpense.id);
                await repo.deleteExpense(detailExpense.id);
                setToast({ message: "Gasto eliminado" });
                await afterMutation();
                setRoute({ name: "home" });
              }}
              onCancel={async () => {
                const updated = await repo.cancelExpense(detailExpense.id);
                if (data.settings) {
                  await resyncExpenseNotifications(updated, data.settings);
                }
                setToast({
                  message: "Cancelación programada",
                  actionLabel: "Deshacer",
                  onAction: () => {
                    void (async () => {
                      const undone = await repo.undoCancelExpense(detailExpense.id);
                      if (data.settings) {
                        await resyncExpenseNotifications(undone, data.settings);
                      }
                      await afterMutation();
                    })();
                  },
                });
                await afterMutation();
              }}
              onUndoCancel={async () => {
                const undone = await repo.undoCancelExpense(detailExpense.id);
                if (data.settings) {
                  await resyncExpenseNotifications(undone, data.settings);
                }
                setToast({ message: "Cancelación deshecha" });
                await afterMutation();
              }}
            />
          )}

          {route.name === "settings" && data.settings && (
            <Settings
              settings={data.settings}
              onBack={() => setRoute({ name: "home" })}
              onLabels={() => setRoute({ name: "labels", from: "settings" })}
              onSave={async (settings) => {
                await repo.saveSettings(settings);
                data.setSettings(settings);
                await resyncAllNotifications(data.expenses, settings);
                setToast({ message: "Ajustes guardados" });
              }}
            />
          )}

          {route.name === "labels" && (
            <LabelsManager
              labels={data.labels}
              onBack={() => {
                if (route.from === "settings") setRoute({ name: "settings" });
                else if (route.from === "edit" && route.editId)
                  setRoute({ name: "edit", id: route.editId });
                else setRoute({ name: "create" });
              }}
              onCreate={async (input) => {
                await repo.createLabel(input);
                await afterMutation();
                setToast({ message: "Etiqueta creada" });
              }}
              onUpdate={async (id, input) => {
                await repo.updateLabel(id, input);
                await afterMutation();
                setToast({ message: "Etiqueta actualizada" });
              }}
              onDelete={async (id) => {
                await repo.deleteLabel(id);
                await afterMutation();
                setToast({ message: "Etiqueta eliminada" });
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
      </div>

      {route.name === "home" && (
        <button
          type="button"
          className="fab"
          aria-label="Añadir gasto"
          onClick={() => setRoute({ name: "create" })}
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      )}

      <ToastHost toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
