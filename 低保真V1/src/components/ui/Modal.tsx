import { useEffect, type ReactNode } from "react";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
};

export function Modal({ title, children, onClose, footer, size = "md" }: ModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className={`modal modal--${size}`} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal__header">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="关闭弹窗">×</button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__footer">{footer}</footer>}
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
      footer={<><button className="button button--ghost" onClick={onClose}>取消</button><button className={`button ${danger ? "button--danger" : "button--primary"}`} onClick={onConfirm}>{confirmText}</button></>}
    >
      <p>{message}</p>
    </Modal>
  );
}
