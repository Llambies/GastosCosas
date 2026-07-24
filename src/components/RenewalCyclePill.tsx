import { motion, useReducedMotion } from "motion/react";
import type { CycleProgress } from "../domain";

interface Props {
  cycle: CycleProgress;
  compact?: boolean;
}

export function RenewalCyclePill({ cycle, compact = false }: Props) {
  const reduce = useReducedMotion();
  const fillPct = Math.round(cycle.progress * 100);
  const markerPct = cycle.mode === "renewing" ? 72 : 100;
  const fillWidth = cycle.mode === "renewing" ? fillPct * 0.72 : fillPct;

  return (
    <div
      className={`pill-wrap ${compact ? "compact" : ""} pill-${cycle.mode}`}
      aria-label={cycle.label}
    >
      <div className="pill-track">
        <motion.div
          className="pill-fill"
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          style={{ width: `${fillWidth}%` }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
          }
        />
        {cycle.mode === "renewing" && (
          <div
            className="pill-continuation"
            style={{ left: `${markerPct}%` }}
            aria-hidden
          />
        )}
        <div
          className="pill-marker"
          style={{ left: `calc(${markerPct}% - 1px)` }}
          aria-hidden
        />
      </div>
      <div className="pill-label">{cycle.label}</div>
    </div>
  );
}
