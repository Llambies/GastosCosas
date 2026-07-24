import { COLOR_SWATCHES } from "../styles/swatches";

interface Props {
  value: string;
  onChange: (color: string) => void;
}

function sameColor(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

export function ColorPicker({ value, onChange }: Props) {
  return (
    <div>
      <div className="swatches" role="listbox" aria-label="Colores">
        {COLOR_SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            className={`swatch ${sameColor(value, c) ? "selected" : ""}`}
            style={{ background: c }}
            aria-label={`Color ${c}`}
            aria-selected={sameColor(value, c)}
            onClick={() => onChange(c)}
          />
        ))}
      </div>
      <div className="field" style={{ marginTop: 12 }}>
        <label htmlFor="custom-color">Color personalizado</label>
        <input
          id="custom-color"
          type="color"
          value={value.length === 7 ? value : "#F5B700"}
          onChange={(e) => onChange(e.target.value)}
          style={{ padding: 4, height: 44 }}
        />
      </div>
    </div>
  );
}
