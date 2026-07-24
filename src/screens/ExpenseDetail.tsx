import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { LabelChips } from "../components/LabelChip";
import { RenewalCyclePill } from "../components/RenewalCyclePill";
import {
  cycleProgress,
  effectiveEndOn,
  expenseForecastShare,
  expenseSpentShare,
  formatEur,
  nextRenewalOn,
  type Expense,
} from "../domain";
import { getIcon } from "../lib/iconRegistry";

interface Props {
  expense: Expense;
  today: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onCancel: () => Promise<void>;
  onUndoCancel: () => Promise<void>;
}

export function ExpenseDetail({
  expense,
  today,
  onBack,
  onEdit,
  onDelete,
  onCancel,
  onUndoCancel,
}: Props) {
  const Icon = getIcon(expense.icon);
  const cycle = cycleProgress(expense, today);
  const next = nextRenewalOn(expense, today);
  const end = effectiveEndOn(expense);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <div className="page-enter">
      <div className="topbar">
        <button type="button" className="icon-btn" aria-label="Volver" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <button type="button" className="icon-btn settings-link" aria-label="Editar" onClick={onEdit}>
          <Pencil size={18} />
        </button>
      </div>

      <div className="detail-head">
        <div
          className="detail-avatar"
          style={{ background: `${expense.color}33`, color: expense.color }}
        >
          <Icon size={34} />
        </div>
        <h1 className="detail-name">{expense.name}</h1>
        <div style={{ fontSize: "1.4rem", fontWeight: 650 }}>
          {formatEur(expense.amountMinor)}
        </div>
        <div className="row-meta">
          <LabelChips labels={expense.labels} max={20} />
        </div>
      </div>

      {cycle && (
        <div style={{ marginBottom: 20 }}>
          <RenewalCyclePill
            cycle={cycle}
            today={today}
            color={expense.color}
          />
        </div>
      )}

      <section className="section" style={{ marginTop: 8 }}>
        <h2>Resumen</h2>
        <p>Aporte a los totales del mes y fechas clave.</p>
        <div className="stack">
          <div className="metric">
            <div className="label">Gastado (este gasto)</div>
            <div className="amount" style={{ fontSize: "1.25rem" }}>
              {formatEur(expenseSpentShare(expense, today))}
            </div>
          </div>
          <div className="metric forecast">
            <div className="label">Previsto (este gasto)</div>
            <div className="amount" style={{ fontSize: "1.25rem" }}>
              {formatEur(expenseForecastShare(expense, today))}
            </div>
          </div>
          <p className="muted">
            {next ? `Próxima renovación: ${next}` : "Sin renovación pendiente"}
            {end ? ` · Fin efectivo: ${end}` : ""}
            {` · Estado: ${expense.status}`}
          </p>
        </div>
      </section>

      <div className="stack" style={{ marginTop: 24 }}>
        {expense.isCancellable && expense.status === "active" && (
          <button
            type="button"
            className="btn btn-danger"
            disabled={busy}
            onClick={() => setConfirmCancel(true)}
          >
            Cancelar al final del ciclo
          </button>
        )}
        {expense.status === "ending" && (
          <button
            type="button"
            className="btn btn-secondary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onUndoCancel();
              } finally {
                setBusy(false);
              }
            }}
          >
            Deshacer cancelación
          </button>
        )}
        <button
          type="button"
          className="btn btn-secondary"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onDelete();
            } finally {
              setBusy(false);
            }
          }}
        >
          <Trash2 size={16} /> Eliminar
        </button>
      </div>

      {confirmCancel && (
        <div className="confirm-backdrop" role="dialog" aria-modal="true">
          <div className="confirm-sheet">
            <h3>¿Cancelar {expense.name}?</h3>
            <p className="muted">
              Seguirá contando hasta la próxima renovación
              {next ? ` (${next})` : ""} y no generará otro ciclo.
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmCancel(false)}
              >
                No
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={async () => {
                  setBusy(true);
                  try {
                    await onCancel();
                    setConfirmCancel(false);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
