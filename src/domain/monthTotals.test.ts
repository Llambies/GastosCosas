import { describe, expect, it } from "vitest";
import { requestCancellation } from "./cancellation";
import { cycleProgress } from "./cycleProgress";
import { addDays, addYearsClamped, daysInMonth, toIso } from "./dates";
import { forecastThisMonth, spentThisMonth } from "./monthTotals";
import { nextRenewalOn } from "./recurrence";
import type { Expense } from "./types";

function expense(partial: Partial<Expense> & Pick<Expense, "id" | "startsOn">): Expense {
  return {
    name: "Test",
    amountMinor: 3000,
    currency: "EUR",
    kind: "subscription",
    periodPreset: "monthly",
    endsOn: null,
    recurrence: "monthly",
    isCancellable: true,
    status: "active",
    cancellationRequestedOn: null,
    cancellationEffectiveOn: null,
    icon: "tv",
    color: "#F59E0B",
    notifyDaysBeforeDue: null,
    notifyDaysBeforeEnd: null,
    notes: null,
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2020-01-01T00:00:00.000Z",
    labels: [],
    ...partial,
  };
}

describe("monthTotals", () => {
  it("alta a mitad de mes: previsto = importe completo si se renueva", () => {
    const today = "2024-04-20";
    const e = expense({ id: "1", startsOn: "2024-04-15", amountMinor: 3000 });
    // Gastado: ciclo activo hasta fin de mes [15, 05-01) = 16 días
    expect(spentThisMonth([e], today)).toBe(Math.round((3000 * 16) / 30));
    // Previsto: coste mensual completo (no cancelada)
    expect(forecastThisMonth([e], today)).toBe(3000);
  });

  it("antes de renovar el 15: gastado hasta el 15; previsto mes completo", () => {
    const today = "2024-03-12";
    const e = expense({
      id: "r",
      startsOn: "2024-02-15",
      amountMinor: 3100,
    });
    expect(spentThisMonth([e], today)).toBe(Math.round((3100 * 14) / 31));
    expect(forecastThisMonth([e], today)).toBe(3100);
  });

  it("caso screenshot: empieza el 24 → gastado prorrateado, previsto 12€", () => {
    const today = "2026-07-24";
    const e = expense({
      id: "cosa",
      startsOn: "2026-07-24",
      amountMinor: 1200,
    });
    // [07-24, 08-01) = 8 días en julio (31)
    expect(spentThisMonth([e], today)).toBe(Math.round((1200 * 8) / 31));
    expect(forecastThisMonth([e], today)).toBe(1200);
  });

  it("después de renovar el 15: gastado y previsto cubren el mes", () => {
    const today = "2024-03-20";
    const e = expense({
      id: "r2",
      startsOn: "2024-02-15",
      amountMinor: 3100,
    });
    expect(spentThisMonth([e], today)).toBe(3100);
    expect(forecastThisMonth([e], today)).toBe(3100);
  });

  it("suscripción futura en el mes: gastado 0, previsto importe completo", () => {
    const today = "2024-04-10";
    const e = expense({ id: "f", startsOn: "2024-04-20", amountMinor: 3000 });
    expect(spentThisMonth([e], today)).toBe(0);
    expect(forecastThisMonth([e], today)).toBe(3000);
  });

  it("soporta meses de 28/29/30/31 días", () => {
    const cases = [
      { today: "2025-02-10", dim: 28 },
      { today: "2024-02-10", dim: 29 },
      { today: "2024-04-10", dim: 30 },
      { today: "2024-01-10", dim: 31 },
    ];
    for (const { today, dim } of cases) {
      const { y, m } = { y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) };
      expect(daysInMonth(y, m)).toBe(dim);
      const e = expense({
        id: "m",
        startsOn: toIso(y, m, 1),
        amountMinor: dim * 100,
      });
      expect(forecastThisMonth([e], today)).toBe(dim * 100);
      expect(spentThisMonth([e], today)).toBe(dim * 100);
    }
  });

  it("anual / 12 como base mensual", () => {
    const e = expense({
      id: "y",
      startsOn: "2024-01-01",
      recurrence: "yearly",
      periodPreset: "annual",
      amountMinor: 12000,
    });
    expect(forecastThisMonth([e], "2024-03-15")).toBe(1000);
    expect(spentThisMonth([e], "2024-03-15")).toBe(1000);
  });

  it("cancelación el día 12 antes de renovar el 15 alinea gastado y previsto al 15", () => {
    const today = "2024-03-12";
    const e = expense({
      id: "c",
      startsOn: "2024-02-15",
      amountMinor: 3100,
    });
    const beforeForecast = forecastThisMonth([e], today);
    const patch = requestCancellation(e, today);
    expect(patch.cancellationEffectiveOn).toBe("2024-03-15");
    const cancelled = { ...e, ...patch };
    const afterForecast = forecastThisMonth([cancelled], today);
    expect(afterForecast).toBeLessThan(beforeForecast);
    expect(afterForecast).toBe(Math.round((3100 * 14) / 31));
    expect(spentThisMonth([cancelled], today)).toBe(afterForecast);
  });

  it("fin fuera del mes no altera el mes actual", () => {
    const e = expense({
      id: "f",
      startsOn: "2024-01-01",
      endsOn: "2024-06-01",
      amountMinor: 3100,
    });
    expect(forecastThisMonth([e], "2024-03-12")).toBe(3100);
    expect(spentThisMonth([e], "2024-03-12")).toBe(3100);
  });
});

describe("recurrence anchors", () => {
  it("ajusta ancla 29–31 al último día válido", () => {
    const e = expense({ id: "a", startsOn: "2024-01-31" });
    expect(nextRenewalOn(e, "2024-01-31")).toBe("2024-02-29");
    expect(nextRenewalOn(e, "2024-02-29")).toBe("2024-03-31");
    expect(nextRenewalOn(e, "2025-01-31")).toBe("2025-02-28");
  });

  it("contempla años bisiestos en recurrencia anual", () => {
    const e = expense({
      id: "b",
      startsOn: "2024-02-29",
      recurrence: "yearly",
      periodPreset: "annual",
    });
    expect(nextRenewalOn(e, "2024-02-29")).toBe("2025-02-28");
    expect(addYearsClamped("2024-02-29", 1)).toBe("2025-02-28");
  });
});

describe("cycleProgress", () => {
  it("modo renewing vs ending", () => {
    const today = "2024-03-12";
    const active = expense({ id: "r", startsOn: "2024-02-15" });
    const renewing = cycleProgress(active, today);
    expect(renewing?.mode).toBe("renewing");
    expect(renewing?.markerOn).toBe("2024-03-15");

    const ending = cycleProgress(
      { ...active, ...requestCancellation(active, today) },
      today,
    );
    expect(ending?.mode).toBe("ending");
    expect(ending?.markerOn).toBe("2024-03-15");
  });

  it("addDays helper", () => {
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
  });
});
