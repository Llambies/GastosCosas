import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { ColorPicker } from "../components/ColorPicker";
import { IconPicker } from "../components/IconPicker";
import { LabelChip } from "../components/LabelChip";
import {
  parseEurInput,
  resolvePeriodPreset,
  todayLocal,
  type Expense,
  type ExpenseInput,
  type Label,
  type PeriodPreset,
  type Recurrence,
} from "../domain";

interface Props {
  initial?: Expense | null;
  labels: Label[];
  onBack: () => void;
  onSave: (input: ExpenseInput) => Promise<void>;
  onNewLabel: () => void;
}

export function ExpenseForm({
  initial,
  labels,
  onBack,
  onSave,
  onNewLabel,
}: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState(
    initial ? (initial.amountMinor / 100).toFixed(2).replace(".", ",") : "",
  );
  const [kind, setKind] = useState<"subscription" | "fixed">(
    initial?.kind ?? "subscription",
  );
  const [preset, setPreset] = useState<PeriodPreset>(
    initial?.periodPreset ?? "monthly",
  );
  const [startsOn, setStartsOn] = useState(initial?.startsOn ?? todayLocal());
  const [endsOn, setEndsOn] = useState(initial?.endsOn ?? "");
  const [recurrence, setRecurrence] = useState<Recurrence>(
    initial?.recurrence ?? "monthly",
  );
  const [icon, setIcon] = useState(initial?.icon ?? "tv");
  const [color, setColor] = useState(initial?.color ?? "#F5B700");
  const [labelIds, setLabelIds] = useState<string[]>(
    initial?.labels.map((l) => l.id) ?? [],
  );
  const [notifyDue, setNotifyDue] = useState(
    initial?.notifyDaysBeforeDue != null
      ? String(initial.notifyDaysBeforeDue)
      : "",
  );
  const [notifyEnd, setNotifyEnd] = useState(
    initial?.notifyDaysBeforeEnd != null
      ? String(initial.notifyDaysBeforeEnd)
      : "",
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const amountMinor = useMemo(() => parseEurInput(amount), [amount]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (amountMinor == null) {
      setError("Importe inválido");
      return;
    }
    const resolved = resolvePeriodPreset(
      preset,
      startsOn,
      endsOn || null,
      recurrence,
    );
    const input: ExpenseInput = {
      name,
      amountMinor,
      kind,
      periodPreset: preset,
      startsOn: resolved.startsOn,
      endsOn: resolved.endsOn,
      recurrence: resolved.recurrence,
      isCancellable: kind === "subscription",
      icon,
      color,
      notifyDaysBeforeDue: notifyDue === "" ? null : Number(notifyDue),
      notifyDaysBeforeEnd: notifyEnd === "" ? null : Number(notifyEnd),
      notes: notes.trim() || null,
      labelIds,
    };
    setSaving(true);
    try {
      await onSave(input);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
      setSaving(false);
    }
  }

  function toggleLabel(id: string) {
    setLabelIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div className="page-enter">
      <div className="topbar">
        <button type="button" className="icon-btn" aria-label="Volver" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <h2 className="page-title">
          {initial ? "Editar gasto" : "Nuevo gasto"}
        </h2>
      </div>

      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="name">Nombre</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Netflix, alquiler…"
            autoComplete="off"
          />
        </div>

        <div className="field">
          <label htmlFor="amount">Importe (€)</label>
          <input
            id="amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="15,99"
          />
        </div>

        <div className="field">
          <label htmlFor="kind">Tipo</label>
          <select
            id="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as "subscription" | "fixed")}
          >
            <option value="subscription">Suscripción</option>
            <option value="fixed">Pago fijo</option>
          </select>
        </div>

        <div className="field">
          <label>Icono</label>
          <IconPicker value={icon} color={color} onChange={setIcon} />
        </div>

        <div className="field">
          <label>Color</label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        <div className="field">
          <label>Etiquetas</label>
          <div className="stack">
            {labels.map((l) => (
              <button
                key={l.id}
                type="button"
                className={`label-check ${labelIds.includes(l.id) ? "on" : ""}`}
                onClick={() => toggleLabel(l.id)}
              >
                <LabelChip label={l} />
              </button>
            ))}
            <button type="button" className="btn btn-secondary" onClick={onNewLabel}>
              Nueva etiqueta
            </button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="preset">Periodo</label>
          <select
            id="preset"
            value={preset}
            onChange={(e) => setPreset(e.target.value as PeriodPreset)}
          >
            <option value="today">Hoy</option>
            <option value="monthly">Mensual</option>
            <option value="annual">Anual</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        {preset !== "today" && (
          <div className="field">
            <label htmlFor="starts">Fecha inicial</label>
            <input
              id="starts"
              type="date"
              value={startsOn}
              onChange={(e) => setStartsOn(e.target.value)}
            />
          </div>
        )}

        {preset === "custom" && (
          <>
            <div className="field">
              <label htmlFor="ends">Fecha final (opcional)</label>
              <input
                id="ends"
                type="date"
                value={endsOn}
                onChange={(e) => setEndsOn(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="rec">Recurrencia</label>
              <select
                id="rec"
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as Recurrence)}
              >
                <option value="none">Ninguna</option>
                <option value="monthly">Mensual</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </>
        )}

        <div className="field">
          <label htmlFor="nd">Avisar cobro (días antes, vacío = default)</label>
          <input
            id="nd"
            inputMode="numeric"
            value={notifyDue}
            onChange={(e) => setNotifyDue(e.target.value)}
            placeholder="1"
          />
        </div>
        <div className="field">
          <label htmlFor="ne">Avisar fin (días antes, vacío = default)</label>
          <input
            id="ne"
            inputMode="numeric"
            value={notifyEnd}
            onChange={(e) => setNotifyEnd(e.target.value)}
            placeholder="3"
          />
        </div>

        <div className="field">
          <label htmlFor="notes">Notas</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error && <div className="field"><div className="error">{error}</div></div>}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </form>
    </div>
  );
}
