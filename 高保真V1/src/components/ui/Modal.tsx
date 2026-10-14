import { useEffect, useRef, type ReactNode } from "react";
import { focusableElements, inertOutside, trapTab } from "./focusContainment";
import { useModalReveal } from "./Reveal";

export type ModalVariant =
  | "default"
  | "chart"
  | "plans"
  | "payment"
  | "binding"
  | "task"
  | "order"
  | "new-ppt"
  | "import-ppt"
  | "template-manager"
  | "template-preview"
  | "auth";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  /** Explicit modal chrome variant; prefer this over inferring from body content. */
  variant?: ModalVariant;
  /** Split or custom dialogs render their own header instead of the shared chrome. */
  frameless?: boolean;
};

export function Modal({ title, children, onClose, footer, size = "md", variant = "default", frameless = false }: ModalProps) {
  const { panelRef, veilRef } = useModalReveal();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const panel = panelRef.current;
    const backdrop = panel?.closest<HTMLElement>(".modal-backdrop");
    if (!panel || !backdrop) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const release = inertOutside(backdrop);
    const initial = focusableElements(panel);
    (initial[0] ?? panel).focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (document.querySelector(".form-select__menu, .chart-chip-menu")) return;
        const backdrops = document.querySelectorAll(".modal-backdrop");
        if (backdrops[backdrops.length - 1] !== backdrop) return;
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      trapTab(event, panel);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      release();
      previous?.focus();
    };
  }, [panelRef]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal-backdrop__veil" ref={veilRef} />
      <section
        ref={panelRef}
        className={["modal", `modal--${size}`, variant !== "default" ? `modal--${variant}` : ""].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {frameless ? children : (
          <>
            <header className="modal__header">
              <h2>{title}</h2>
              <button className="icon-button" onClick={onClose} aria-label="关闭弹窗">×</button>
            </header>
            <div className="modal__body">{children}</div>
            {footer && <footer className="modal__footer">{footer}</footer>}
          </>
        )}
      </section>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmText = "确认", danger = false, onConfirm, onClose }: {
  title: string;
  message: string;
  confirmText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      title={title}
      size="sm"
      onClose={onClose}
      footer={<><button className="button" onClick={onClose}>取消</button><button className={`button ${danger ? "button--danger" : "button--primary"}`} onClick={onConfirm}>{confirmText}</button></>}
    >
      <p>{message}</p>
    </Modal>
  );
}
