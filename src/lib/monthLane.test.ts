import { describe, expect, it } from "vitest";
import type { CycleProgress } from "../domain";
import { laneSegments, todayMarkerLeft } from "./monthLane";

function renewing(cycleStart: string, cycleEnd: string): CycleProgress {
  return {
    mode: "renewing",
    progress: 0.5,
    cycleStart,
    cycleEnd,
    markerOn: cycleEnd,
    label: "Renueva",
  };
}

describe("laneSegments", () => {
  it("antes de renovar: sólido hasta la fecha y tenue hasta fin de mes", () => {
    // Empieza en junio, renueva el 23; hoy 12 jul → ciclo 23 jun – 23 jul
    const segs = laneSegments(
      renewing("2026-06-23", "2026-07-23"),
      "2026-07-12",
      "2026-06-23",
    );
    expect(segs.prev).toBeNull();
    expect(segs.active.left).toBeCloseTo(0, 5);
    expect(segs.active.width).toBeCloseTo((22 / 31) * 100, 5);
    expect(segs.next).not.toBeNull();
    expect(segs.next!.left).toBeCloseTo((22 / 31) * 100, 5);
    expect(segs.next!.width).toBeCloseTo((9 / 31) * 100, 5);
  });

  it("después de renovar: tramo previo del 1 a la renovación + ciclo actual", () => {
    // Cursor: empezó el mes pasado, renueva el 23; hoy 30 jul → ciclo 23 jul – 23 ago
    const segs = laneSegments(
      renewing("2026-07-23", "2026-08-23"),
      "2026-07-30",
      "2026-06-23",
    );
    expect(segs.prev).not.toBeNull();
    expect(segs.prev!.left).toBeCloseTo(0, 5);
    expect(segs.prev!.width).toBeCloseTo((22 / 31) * 100, 5);
    expect(segs.active.left).toBeCloseTo((22 / 31) * 100, 5);
    expect(segs.active.width).toBeCloseTo((9 / 31) * 100, 5);
    expect(segs.next).toBeNull();
  });

  it("alta a mitad de mes: no rellena desde el día 1", () => {
    const segs = laneSegments(
      renewing("2026-07-15", "2026-08-15"),
      "2026-07-30",
      "2026-07-15",
    );
    expect(segs.prev).toBeNull();
    expect(segs.active.left).toBeCloseTo((14 / 31) * 100, 5);
    expect(segs.next).toBeNull();
  });
});

describe("todayMarkerLeft", () => {
  it("día 1 queda al inicio", () => {
    expect(todayMarkerLeft("2026-07-01")).toBe(0);
  });

  it("día 30 de julio queda al inicio de esa columna", () => {
    expect(todayMarkerLeft("2026-07-30")).toBeCloseTo((29 / 31) * 100, 5);
  });
});
