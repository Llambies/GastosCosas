import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { createPortal } from "react-dom";
import type { ToastState } from "./components/Toast";
import { ToastHost } from "./components/Toast";
import * as repo from "./db/repositories";
import type { ExpenseInput } from "./domain";
import { useAppData } from "./hooks/useAppData";
import { useNavStack } from "./hooks/useNavStack";
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

export default function App() {
  const data = useAppData();
  const nav = useNavStack({ name: "home" });
  const { route, direction, push, pop, resetTo } = nav;
  const [toast, setToast] = useState<ToastState | null>(null);

  const detailExpense =
    route.name === "detail" || route.name === "edit"
      ? data.expenses.find((e) => e.id === (route as { id: string }).id) ?? null
      : null;

  async function afterMutation() {
    await data.refresh();
  }

  const routeKey =
    route.name +
    ("id" in route ? `:${route.id}` : "") +
    `:d${direction}`;

  return (
    <div className="app-shell">
      <div className="app-scroll">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={routeKey}
            custom={direction}
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -18 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
                onOpen={(id) => push({ name: "detail", id })}
                onSettings={() => push({ name: "settings" })}
              />
            )}

            {(route.name === "create" || route.name === "edit") && (
              <ExpenseForm
                initial={route.name === "edit" ? detailExpense : null}
                labels={data.labels}
                onBack={() => pop()}
                onNewLabel={() => push({ name: "labels" })}
                onSave={async (input: ExpenseInput) => {
                  if (route.name === "edit") {
                    const updated = await repo.updateExpense(route.id, input);
                    if (data.settings) {
                      await resyncExpenseNotifications(updated, data.settings);
                    }
                    setToast({ message: "Gasto actualizado" });
                    await afterMutation();
                    pop(); // vuelve al detalle ya en la pila
                  } else {
                    const created = await repo.createExpense(input);
                    if (data.settings) {
                      await resyncExpenseNotifications(created, data.settings);
                    }
                    setToast({ message: "Gasto creado" });
                    await afterMutation();
                    resetTo({ name: "home" });
                  }
                }}
              />
            )}

            {route.name === "detail" && detailExpense && (
              <ExpenseDetail
                expense={detailExpense}
                today={data.today}
                onBack={() => pop()}
                onEdit={() => push({ name: "edit", id: detailExpense.id })}
                onDelete={async () => {
                  await clearExpenseNotifications(detailExpense.id);
                  await repo.deleteExpense(detailExpense.id);
                  setToast({ message: "Gasto eliminado" });
                  await afterMutation();
                  resetTo({ name: "home" });
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
                        const undone = await repo.undoCancelExpense(
                          detailExpense.id,
                        );
                        if (data.settings) {
                          await resyncExpenseNotifications(
                            undone,
                            data.settings,
                          );
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
                onDialogOpen={() => nav.pushDialog("confirm-cancel")}
                onDialogClose={() => nav.dismissDialog()}
              />
            )}

            {route.name === "settings" && data.settings && (
              <Settings
                settings={data.settings}
                onBack={() => pop()}
                onLabels={() => push({ name: "labels" })}
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
                onBack={() => pop()}
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

      <ToastHost toast={toast} onDismiss={() => setToast(null)} />

      {route.name === "home" &&
        createPortal(
          <button
            type="button"
            className="fab"
            aria-label="Añadir gasto"
            onClick={() => push({ name: "create" })}
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>,
          document.body,
        )}
    </div>
  );
}
