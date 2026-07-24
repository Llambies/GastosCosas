import { Plus, Settings } from "lucide-react";
import { AmountHero } from "../components/AmountHero";
import { ExpenseRow } from "../components/ExpenseRow";
import type { Expense } from "../domain";

interface Props {
  spent: number;
  forecast: number;
  subscriptions: Expense[];
  fixed: Expense[];
  today: string;
  loading: boolean;
  error: string | null;
  onOpen: (id: string) => void;
  onCreate: () => void;
  onSettings: () => void;
}

export function Home({
  spent,
  forecast,
  subscriptions,
  fixed,
  today,
  loading,
  error,
  onOpen,
  onCreate,
  onSettings,
}: Props) {
  return (
    <div className="page-enter">
      <div className="topbar">
        <h1 className="brand">
          Gasto<span>Cosas</span>
        </h1>
        <button
          type="button"
          className="icon-btn settings-link"
          aria-label="Ajustes"
          onClick={onSettings}
        >
          <Settings size={20} />
        </button>
      </div>

      <p className="muted" style={{ marginTop: 2, maxWidth: "36ch" }}>
        Gastado: ciclo activo. Previsto: incluye la próxima renovación del mes.
      </p>

      <AmountHero spentMinor={spent} forecastMinor={forecast} />

      {error && (
        <div className="empty" style={{ marginTop: 18, color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="empty" style={{ marginTop: 24 }}>
          Cargando gastos…
        </div>
      ) : (
        <>
          <section className="section">
            <h2>Suscripciones activas</h2>
            <p>Mensuales y anuales con su ciclo a la vista.</p>
            {subscriptions.length === 0 ? (
              <div className="empty">Aún no hay suscripciones.</div>
            ) : (
              <div className="list">
                {subscriptions.map((e, i) => (
                  <ExpenseRow
                    key={e.id}
                    expense={e}
                    today={today}
                    index={i}
                    onOpen={onOpen}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="section">
            <h2>Pagos fijos</h2>
            <p>Alquiler, hipoteca y otros cargos no cancelables.</p>
            {fixed.length === 0 ? (
              <div className="empty">Sin pagos fijos todavía.</div>
            ) : (
              <div className="list">
                {fixed.map((e, i) => (
                  <ExpenseRow
                    key={e.id}
                    expense={e}
                    today={today}
                    index={i}
                    onOpen={onOpen}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <button
        type="button"
        className="fab"
        aria-label="Añadir gasto"
        onClick={onCreate}
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>
    </div>
  );
}
