import type { DragEvent } from "react";
import type { ChartField, Slot } from "./chartDatasets";

export function DropSlot({
  label,
  hint,
  field,
  active,
  onDrop,
  onOver,
  onLeave,
  onClear,
}: {
  slot: Slot;
  label: string;
  hint: string;
  field: ChartField | null;
  active: boolean;
  onDrop: (event: DragEvent) => void;
  onOver: () => void;
  onLeave: () => void;
  onClear: () => void;
}) {
  return (
    <label className="chart-drop">
      <span>{label}</span>
      <small>{hint}</small>
      <div
        className={active ? "chart-drop__zone is-over" : "chart-drop__zone"}
        role="group"
        aria-label={field ? `${label}：${field.name}` : `${label}，${hint}`}
        onDragOver={(event) => {
          event.preventDefault();
          onOver();
        }}
        onDragLeave={onLeave}
        onDrop={onDrop}
      >
        {field ? (
          <button
            type="button"
            className={`chart-chip chart-chip--${field.kind}`}
            aria-label={`从${label}移除${field.name}`}
            onClick={onClear}
            onKeyDown={(event) => {
              if (event.key === "Delete" || event.key === "Backspace") {
                event.preventDefault();
                onClear();
              }
            }}
          >
            <i>{field.kind === "dimension" ? "Aa" : "#"}</i>
            {field.name}
            <b aria-hidden="true">×</b>
          </button>
        ) : (
          <em>拖拽或点击左侧字段添加</em>
        )}
      </div>
    </label>
  );
}
