import { ArrowLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import { ColorPicker } from "../components/ColorPicker";
import { IconPicker } from "../components/IconPicker";
import { LabelChip } from "../components/LabelChip";
import type { Label } from "../domain";

interface Props {
  labels: Label[];
  onBack: () => void;
  onCreate: (input: { name: string; icon: string; color: string }) => Promise<void>;
  onUpdate: (
    id: string,
    input: { name: string; icon: string; color: string },
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function LabelsManager({
  labels,
  onBack,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState<Label | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("tag");
  const [color, setColor] = useState("#94A3B8");
  const [error, setError] = useState<string | null>(null);

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setName("");
    setIcon("tag");
    setColor("#94A3B8");
    setError(null);
  }

  function startEdit(label: Label) {
    setEditing(label);
    setCreating(false);
    setName(label.name);
    setIcon(label.icon);
    setColor(label.color);
    setError(null);
  }

  async function save() {
    if (!name.trim()) {
      setError("Nombre obligatorio");
      return;
    }
    try {
      if (editing) {
        await onUpdate(editing.id, { name, icon, color });
      } else {
        await onCreate({ name, icon, color });
      }
      setCreating(false);
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    }
  }

  const formOpen = creating || editing;

  return (
    <div className="page-enter">
      <div className="topbar">
        <button type="button" className="icon-btn" aria-label="Volver" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <h2 className="page-title">Etiquetas</h2>
      </div>

      {!formOpen && (
        <>
          <div className="stack">
            {labels.map((l) => (
              <div
                key={l.id}
                className="expense-row"
                style={{ gridTemplateColumns: "1fr auto auto" }}
              >
                <button type="button" onClick={() => startEdit(l)} style={{ textAlign: "left" }}>
                  <LabelChip label={l} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Eliminar ${l.name}`}
                  onClick={() => void onDelete(l.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: 18 }}
            onClick={startCreate}
          >
            Nueva etiqueta
          </button>
        </>
      )}

      {formOpen && (
        <div>
          <div className="field">
            <label htmlFor="ln">Nombre</label>
            <input id="ln" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Icono</label>
            <IconPicker value={icon} color={color} onChange={setIcon} />
          </div>
          <div className="field">
            <label>Color</label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          {error && <div className="error">{error}</div>}
          <div className="stack" style={{ marginTop: 12 }}>
            <button type="button" className="btn btn-primary" onClick={() => void save()}>
              Guardar
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
