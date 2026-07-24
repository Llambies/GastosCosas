import { Check } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { ICON_CATALOG } from "../lib/iconRegistry";

interface Props {
  value: string;
  color: string;
  onChange: (name: string) => void;
}

export function IconPicker({ value, color, onChange }: Props) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return ICON_CATALOG;
    return ICON_CATALOG.filter(
      (i) =>
        i.name.includes(needle) || i.label.toLowerCase().includes(needle),
    );
  }, [q]);

  const Selected = ICON_CATALOG.find((i) => i.name === value)?.Icon;

  return (
    <div>
      <div
        className="avatar"
        style={{
          width: 64,
          height: 64,
          borderRadius: 10,
          background: `${color}22`,
          color,
          marginBottom: 12,
        }}
        aria-hidden
      >
        {Selected && <Selected size={30} />}
      </div>
      <input
        type="search"
        placeholder="Buscar icono…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Buscar icono"
        style={{
          width: "100%",
          minHeight: 44,
          marginBottom: 10,
          padding: "10px 12px",
          borderRadius: 6,
          border: "1px solid var(--line)",
          background: "#fff",
        }}
      />
      <div className="picker-grid" role="listbox" aria-label="Iconos">
        {filtered.map(({ name, Icon, label }) => {
          const selected = name === value;
          return (
            <motion.button
              key={name}
              type="button"
              className={`picker-item ${selected ? "selected" : ""}`}
              style={{ color }}
              aria-label={label}
              aria-selected={selected}
              role="option"
              onClick={() => onChange(name)}
              whileTap={{ scale: 0.92 }}
            >
              <Icon size={22} />
              {selected && (
                <Check
                  size={12}
                  style={{ position: "absolute", top: 4, right: 4 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
