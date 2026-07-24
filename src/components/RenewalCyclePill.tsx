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
              : { type: "spring", stiffness: 120, damping: 18 }
          }
        />
        {cycle.mode === "renewing" && (
          <div
            className="pill-continuation"
            style={{ left: `${markerPct}%` }}
            aria-hidden
          />
        )}
        <motion.div
          className="pill-marker"
          style={{ left: `calc(${markerPct}% - 1px)` }}
          animate={
            reduce
              ? undefined
              : { scaleY: [1, 1.25, 1], opacity: [0.85, 1, 0.85] }
          }
          transition={
            reduce
              ? undefined
              : { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
          }
        />
      </div>
      <div className="pill-label">{cycle.label}</div>
    </div>
  );
}
