import { ArrowLeft, Bell, Tags } from "lucide-react";
import { useState } from "react";
import type { AppSettings } from "../domain";
import { ensureNotificationPermission } from "../notifications/scheduler";

interface Props {
  settings: AppSettings;
  onBack: () => void;
  onSave: (settings: AppSettings) => Promise<void>;
  onLabels: () => void;
}

export function Settings({ settings, onBack, onSave, onLabels }: Props) {
  const [form, setForm] = useState(settings);
  const [perm, setPerm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function askPerm() {
    const ok = await ensureNotificationPermission();
    setPerm(ok ? "Permiso concedido" : "Permiso denegado o no disponible");
  }

  return (
    <div className="page-enter">
      <div className="topbar">
        <button type="button" className="icon-btn" aria-label="Volver" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <h2 className="page-title">Ajustes</h2>
      </div>

      <section className="section" style={{ marginTop: 8 }}>
        <h2>Notificaciones</h2>
        <p>Canales Android: gastos-proximos y suscripciones-fin.</p>
        <button type="button" className="btn btn-secondary" onClick={() => void askPerm()}>
          <Bell size={16} /> Pedir permiso
        </button>
        {perm && <p className="muted" style={{ marginTop: 8 }}>{perm}</p>}

        <div className="field" style={{ marginTop: 16 }}>
          <label htmlFor="hour">Hora de aviso</label>
          <input
            id="hour"
            type="number"
            min={0}
            max={23}
            value={form.notifyHour}
            onChange={(e) =>
              setForm((f) => ({ ...f, notifyHour: Number(e.target.value) }))
            }
          />
        </div>
        <div className="field">
          <label htmlFor="minute">Minuto</label>
          <input
            id="minute"
            type="number"
            min={0}
            max={59}
            value={form.notifyMinute}
            onChange={(e) =>
              setForm((f) => ({ ...f, notifyMinute: Number(e.target.value) }))
            }
          />
        </div>
        <div className="field">
          <label htmlFor="dd">Días antes del cobro (default)</label>
          <input
            id="dd"
            type="number"
            min={0}
            value={form.defaultNotifyDaysBeforeDue}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                defaultNotifyDaysBeforeDue: Number(e.target.value),
              }))
            }
          />
        </div>
        <div className="field">
          <label htmlFor="de">Días antes del fin (default)</label>
          <input
            id="de"
            type="number"
            min={0}
            value={form.defaultNotifyDaysBeforeEnd}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                defaultNotifyDaysBeforeEnd: Number(e.target.value),
              }))
            }
          />
        </div>
      </section>

      <section className="section">
        <h2>Etiquetas</h2>
        <p>Gestiona icono y color de cada etiqueta.</p>
        <button type="button" className="btn btn-secondary" onClick={onLabels}>
          <Tags size={16} /> Gestionar etiquetas
        </button>
      </section>

      <button
        type="button"
        className="btn btn-primary"
        style={{ marginTop: 24 }}
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          try {
            await onSave(form);
          } finally {
            setSaving(false);
          }
        }}
      >
        {saving ? "Guardando…" : "Guardar ajustes"}
      </button>
    </div>
  );
}
