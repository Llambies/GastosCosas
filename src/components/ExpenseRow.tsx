import { motion, useReducedMotion } from "motion/react";
import {
  cycleProgress,
  daysInMonth,
  formatEur,
  nextMonthStart,
  parseIso,
  type Expense,
} from "../domain";
import { getIcon } from "../lib/iconRegistry";
import { laneSegments, pctInMonth } from "../lib/monthLane";

interface Props {
  expense: Expense;
  today: string;
  index: number;
  onOpen: (id: string) => void;
}

export function ExpenseRow({ expense, today, index, onOpen }: Props) {
  const Icon = getIcon(expense.icon);
  const reduce = useReducedMotion();
  const cycle = cycleProgress(expense, today);
  const { y, m } = parseIso(today);
  const dim = daysInMonth(y, m);

  const segments = cycle
    ? laneSegments(cycle, today, expense.startsOn)
    : {
        active: pctInMonth(expense.startsOn, nextMonthStart(today), today),
        next: null,
        prev: null,
        dim,
      };

  // Si el tramo activo es muy estrecho, ampliar un mínimo visual para el título
  const activeWidth = Math.max(
    segments.active.width,
    segments.active.width > 0 ? 28 : 0,
  );
  const activeLeft = Math.min(segments.active.left, 100 - activeWidth);

  const label = cycle?.label ?? null;

  return (
    <motion.button
      type="button"
      className="expense-lane"
      onClick={() => onOpen(expense.id)}
      aria-label={`${expense.name}, ${formatEur(expense.amountMinor)}${label ? `, ${label}` : ""}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.18,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(index, 6) * 0.03,
      }}
    >
      <div
        className="expense-lane-track"
        style={{ ["--lane-days" as string]: dim }}
      >
        {segments.prev && segments.prev.width > 0 && (
          <div
            className="expense-lane-bar expense-lane-bar-next"
            style={{
              left: `${segments.prev.left}%`,
              width: `${segments.prev.width}%`,
              background: expense.color,
            }}
            aria-hidden
          />
        )}
        {activeWidth > 0 && (
          <motion.div
            className="expense-lane-bar"
            initial={reduce ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            style={{
              left: `${activeLeft}%`,
              width: `${activeWidth}%`,
              background: expense.color,
              transformOrigin: "left center",
            }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <div className="expense-lane-labels">
              <Icon size={16} aria-hidden className="expense-lane-icon" />
              <span className="expense-lane-name">{expense.name}</span>
              <span className="expense-lane-amount">
                {formatEur(expense.amountMinor)}
              </span>
            </div>
            {label && <div className="expense-lane-meta">{label}</div>}
          </motion.div>
        )}
        {segments.next && segments.next.width > 0 && (
          <div
            className="expense-lane-bar expense-lane-bar-next"
            style={{
              left: `${segments.next.left}%`,
              width: `${segments.next.width}%`,
              background: expense.color,
            }}
            aria-hidden
          />
        )}
      </div>
    </motion.button>
  );
}
