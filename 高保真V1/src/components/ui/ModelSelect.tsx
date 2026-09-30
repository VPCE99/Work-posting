import { useEffect, useId, useRef, useState } from "react";
import { Reveal } from "./Reveal";

const models = ["智能选择"];

export function ModelSelect({ placement = "down" }: { placement?: "down" | "up" }) {
  const [value, setValue] = useState(models[0]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className={placement === "up" ? "model-select model-select--up" : "model-select"} ref={rootRef}>
      <button type="button" className="model-select__trigger" aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} aria-label="选择模型" onClick={() => setOpen((current) => !current)}>
        <span>{value}</span>
        <svg viewBox="0 0 12 8" aria-hidden="true"><path d="M2 2 6 6 10 2" /></svg>
      </button>
      <Reveal open={open} className="model-select__menu" id={listId} role="listbox" aria-label="选择模型">
        {models.map((option) => (
          <button type="button" role="option" aria-selected={option === value} key={option} onClick={() => { setValue(option); setOpen(false); }}>
            <span>{option}</span>
            {option === value && <svg className="model-select__check" viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-6.5" /></svg>}
          </button>
        ))}
      </Reveal>
    </div>
  );
}
