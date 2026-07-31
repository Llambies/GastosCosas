import { Settings } from "lucide-react";
import { AmountHero } from "../components/AmountHero";
import { ExpenseRow } from "../components/ExpenseRow";
import type { Expense } from "../domain";
import { todayMarkerLeft } from "../lib/monthLane";

interface Props {
  spent: number;
  forecast: number;
  subscriptions: Expense[];
  fixed: Expense[];
  today: string;
  loading: boolean;
  error: string | null;
  onOpen: (id: string) => void;
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

      <AmountHero spentMinor={spent} forecastMinor={forecast} />

      {error && (
        <div
          className="empty"
          style={{ marginTop: 18, color: "var(--danger)" }}
        >
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
            {subscriptions.length === 0 ? (
              <div className="empty">Aún no hay suscripciones.</div>
            ) : (
              <div className="list list-lanes">
                <div
                  className="lane-today"
                  style={{ left: `${todayMarkerLeft(today)}%` }}
                  aria-hidden
                >
                  <span className="lane-today-label">hoy</span>
                </div>
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
            {fixed.length === 0 ? (
              <div className="empty">Sin pagos fijos todavía.</div>
            ) : (
              <div className="list list-lanes">
                <div
                  className="lane-today"
                  style={{ left: `${todayMarkerLeft(today)}%` }}
                  aria-hidden
                >
                  <span className="lane-today-label">hoy</span>
                </div>
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
    </div>
  );
}
