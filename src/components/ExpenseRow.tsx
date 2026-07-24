import { motion } from "motion/react";
import { cycleProgress, formatEur, type Expense } from "../domain";
import { getIcon } from "../lib/iconRegistry";
import { LabelChips } from "./LabelChip";
import { RenewalCyclePill } from "./RenewalCyclePill";

interface Props {
  expense: Expense;
  today: string;
  index: number;
  onOpen: (id: string) => void;
}

export function ExpenseRow({ expense, today, index, onOpen }: Props) {
  const Icon = getIcon(expense.icon);
  const cycle = cycleProgress(expense, today);

  return (
    <motion.button
      type="button"
      className="expense-row"
      onClick={() => onOpen(expense.id)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 24, delay: index * 0.04 }}
    >
      <div
        className="avatar"
        style={{ background: `${expense.color}33`, color: expense.color }}
      >
        <Icon size={22} aria-hidden />
      </div>
      <div className="row-main">
        <div className="row-title">{expense.name}</div>
        <div className="row-meta">
          <LabelChips labels={expense.labels} max={2} />
        </div>
        {cycle && (
          <div style={{ marginTop: 8 }}>
            <RenewalCyclePill cycle={cycle} compact />
          </div>
        )}
      </div>
      <div className="row-amount">{formatEur(expense.amountMinor)}</div>
    </motion.button>
  );
}
