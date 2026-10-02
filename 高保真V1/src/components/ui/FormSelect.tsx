import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Reveal } from "./Reveal";

type Choice = { value: string; label: string };

type FormSelectProps = {
  options: Array<string | Choice>;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
};

function choicesOf(options: Array<string | Choice>): Choice[] {
  return options.map((option) => (typeof option === "string" ? { value: option, label: option } : option));
}

export function FormSelect({ options, value, onChange, label }: FormSelectProps) {
  const choices = choicesOf(options);
  const [uncontrolled, setUncontrolled] = useState(value ?? choices[0]?.value ?? "");
  const current = value ?? uncontrolled;
  const currentLabel = choices.find((choice) => choice.value === current)?.label ?? current;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [box, setBox] = useState<{ left: number; top?: number; bottom?: number; width: number; maxHeight: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom;
    const above = rect.top;
    const upward = below < 180 && above > below;
    setBox({
      left: rect.left,
      width: Math.max(rect.width, 128),
      top: upward ? undefined : rect.bottom + 4,
      bottom: upward ? window.innerHeight - rect.top + 4 : undefined,
      maxHeight: Math.max(96, (upward ? above : below) - 12),
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const choose = (next: string) => {
    setUncontrolled(next);
    onChange?.(next);
    setOpen(false);
  };

  return (
    <div className="form-select">
      <button
        ref={triggerRef}
        type="button"
        className="form-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      >
        <span>{currentLabel}</span>
      </button>
      {box && createPortal(
        <Reveal
          ref={menuRef}
          open={open}
          id={listId}
          className="form-select__menu"
          role="listbox"
          aria-label={label}
          style={{
            position: "fixed",
            left: box.left,
            top: box.top,
            bottom: box.bottom,
            width: box.width,
            maxHeight: box.maxHeight,
            zIndex: 260,
          }}
        >
          {choices.map((choice) => (
            <button
              type="button"
              role="option"
              aria-selected={choice.value === current}
              key={`${choice.value}::${choice.label}`}
              onClick={() => choose(choice.value)}
            >
              <span>{choice.label}</span>
            </button>
          ))}
        </Reveal>,
        document.querySelector("[data-theme]") ?? document.body,
      )}
    </div>
  );
}
