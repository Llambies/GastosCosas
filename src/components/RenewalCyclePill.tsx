import { motion, useReducedMotion } from "motion/react";
import {
  daysBetween,
  daysInMonth,
  maxIso,
  minIso,
  monthStart,
  nextMonthStart,
  parseIso,
  type CycleProgress,
  type IsoDate,
} from "../domain";

interface Props {
  cycle: CycleProgress;
  today: IsoDate;
  color?: string;
  compact?: boolean;
}

function pctInMonth(from: IsoDate, to: IsoDate, month: IsoDate): {
  left: number;
  width: number;
} {
  const ms = monthStart(month);
  const me = nextMonthStart(month);
  const { y, m } = parseIso(ms);
  const dim = daysInMonth(y, m);
  const start = maxIso(from, ms);
  const end = minIso(to, me);
  const span = daysBetween(start, end);
  if (span <= 0) return { left: 0, width: 0 };
  const left = (daysBetween(ms, start) / dim) * 100;
  const width = (span / dim) * 100;
  return { left, width };
}

export function RenewalCyclePill({
  cycle,
  today,
  color,
  compact = false,
}: Props) {
  const reduce = useReducedMotion();
  const ms = monthStart(today);
  const me = nextMonthStart(today);
  const { y, m } = parseIso(ms);
  const dim = daysInMonth(y, m);

  const active = pctInMonth(cycle.cycleStart, cycle.cycleEnd, today);
  const continuation =
    cycle.mode === "renewing" && cycle.cycleEnd < me
      ? pctInMonth(cycle.cycleEnd, me, today)
      : null;

  const markerLeft =
    cycle.markerOn >= ms && cycle.markerOn < me
      ? (daysBetween(ms, cycle.markerOn) / dim) * 100
      : null;

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
      <div className="gantt-track">
        {active.width > 0 && (
          <motion.div
            className="gantt-bar"
            initial={reduce ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            style={{
              left: `${active.left}%`,
              width: `${active.width}%`,
              background: barColor,
              transformOrigin: "left center",
            }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
            }
          />
        )}
        {continuation && continuation.width > 0 && (
          <div
            className="gantt-bar gantt-bar-next"
            style={{
              left: `${continuation.left}%`,
              width: `${continuation.width}%`,
              background: barColor,
            }}
            aria-hidden
          />
        )}
        {markerLeft != null && (
          <div
            className="gantt-marker"
            style={{ left: `${markerLeft}%` }}
            aria-hidden
          />
        )}
      </div>
      <div className="gantt-label">{cycle.label}</div>
    </div>
  );
}
