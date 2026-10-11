import { useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useFocusFirstMenuitem } from "../ui/useFocusFirstMenuitem";
import type { ChartField, Slot } from "./chartDatasets";

export function FieldGroup({
  label,
  fields: items,
  menuId,
  onToggleMenu,
  onAssign,
}: {
  label: string;
  fields: ChartField[];
  menuId: string | null;
  onToggleMenu: (id: string | null) => void;
  onAssign: (slot: Slot, id: string) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useFocusFirstMenuitem(menuRef, Boolean(menuId && items.some((field) => field.id === menuId)));

  return (
    <div className="chart-field-group">
      <span>{label}</span>
      <div>
        {items.map((field) => {
          const open = menuId === field.id;
          return (
            <div className="chart-chip-wrap" key={field.id}>
              <button
                type="button"
                className={`chart-chip chart-chip--${field.kind}${open ? " is-menu-open" : ""}`}
                draggable
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={`${field.name}，${field.kind === "dimension" ? "维度" : "度量"}字段`}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleMenu(open ? null : field.id);
                }}
                onDragStart={(event) => {
                  onToggleMenu(null);
                  event.dataTransfer.setData("text/plain", field.id);
                  event.dataTransfer.effectAllowed = "move";
                }}
                onKeyDown={(event: ReactKeyboardEvent<HTMLButtonElement>) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onToggleMenu(open ? null : field.id);
                  }
                }}
              >
                <i>{field.kind === "dimension" ? "Aa" : "#"}</i>
                {field.name}
              </button>
              {open && (
                <div
                  ref={menuRef}
                  className="chart-chip-menu"
                  role="menu"
                  aria-label={`将${field.name}添加到轴`}
                  onClick={(event) => event.stopPropagation()}
                >
                  {field.kind === "dimension" ? (
                    <button type="button" role="menuitem" onClick={() => onAssign("x", field.id)}>添加到 X 轴</button>
                  ) : (
                    <>
                      <button type="button" role="menuitem" onClick={() => onAssign("yLeft", field.id)}>添加到 Y 轴 · 左</button>
                      <button type="button" role="menuitem" onClick={() => onAssign("yRight", field.id)}>添加到 Y 轴 · 右</button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
