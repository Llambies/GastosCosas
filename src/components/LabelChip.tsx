import { getIcon } from "../lib/iconRegistry";
import type { Label } from "../domain";

interface Props {
  label: Label;
}

export function LabelChip({ label }: Props) {
  const Icon = getIcon(label.icon);
  return (
    <span
      className="chip"
      style={{
        color: label.color,
        background: `${label.color}22`,
        borderColor: `${label.color}66`,
      }}
    >
      <Icon size={12} aria-hidden />
      {label.name}
    </span>
  );
}

export function LabelChips({
  labels,
  max = 3,
}: {
  labels: Label[];
  max?: number;
}) {
  const shown = labels.slice(0, max);
  const rest = labels.length - shown.length;
  return (
    <>
      {shown.map((l) => (
        <LabelChip key={l.id} label={l} />
      ))}
      {rest > 0 && (
        <span
          className="chip"
          style={{
            color: "var(--text-muted)",
            background: "var(--surface-soft)",
            borderColor: "var(--surface-line)",
          }}
        >
          +{rest}
        </span>
      )}
    </>
  );
}
