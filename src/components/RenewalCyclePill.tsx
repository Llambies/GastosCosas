import { motion, useReducedMotion } from "motion/react";
import type { CycleProgress, IsoDate } from "../domain";
import { laneSegments, todayMarkerLeft } from "../lib/monthLane";

interface Props {
  cycle: CycleProgress;
  today: IsoDate;
  startsOn?: IsoDate;
  color?: string;
  title?: string;
  compact?: boolean;
}

/** Detalle: pista del mes con barra coloreada y título dentro. */
export function RenewalCyclePill({
  cycle,
  today,
  startsOn,
  color,
  title,
  compact = false,
}: Props) {
  const reduce = useReducedMotion();
  const { active, next, prev, dim } = laneSegments(cycle, today, startsOn);
  const barColor =
    color ?? (cycle.mode === "ending" ? "var(--warn)" : "var(--ok)");

  return (
    <div
      className={`month-gantt ${compact ? "compact" : ""} gantt-${cycle.mode}`}
      aria-label={cycle.label}
    >
      {!compact && (
        <div className="gantt-scale" aria-hidden>
          <span>1</span>
          <span>{dim}</span>
        </div>
      )}
      <div className="gantt-track gantt-track-tall">
        {prev && prev.width > 0 && (
          <div
            className="gantt-bar gantt-bar-next"
            style={{
              left: `${prev.left}%`,
              width: `${prev.width}%`,
              background: barColor,
            }}
            aria-hidden
          />
        )}
        {active.width > 0 && (
          <motion.div
            className="gantt-bar gantt-bar-filled"
            initial={reduce ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            style={{
              left: `${active.left}%`,
              width: `${Math.max(active.width, 24)}%`,
              background: barColor,
              transformOrigin: "left center",
            }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
            }
          >
            {title && <span className="gantt-bar-title">{title}</span>}
          </motion.div>
        )}
        {next && next.width > 0 && (
          <div
            className="gantt-bar gantt-bar-next"
            style={{
              left: `${next.left}%`,
              width: `${next.width}%`,
              background: barColor,
            }}
            aria-hidden
          />
        )}
        <div
          className="lane-today lane-today-inset"
          style={{ left: `${todayMarkerLeft(today)}%` }}
          aria-hidden
        >
          <span className="lane-today-label">hoy</span>
        </div>
      </div>
      <div className="gantt-label">{cycle.label}</div>
    </div>
  );
}
