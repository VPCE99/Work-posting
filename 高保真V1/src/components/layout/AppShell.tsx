import type { ReactNode } from "react";
import { usePrototype } from "../../app/PrototypeContext";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { GlobalDialogs } from "./GlobalDialogs";

export function AppShell({
  children,
  fullBleed = false,
  pptEditor = false,
}: {
  children: ReactNode;
  fullBleed?: boolean;
  pptEditor?: boolean;
}) {
  const { theme, toasts } = usePrototype();
  // Theme DOM sync is owned by useDocumentTheme in PrototypeProvider (not render-phase).
  return (
    <div className={pptEditor ? "app app--ppt-editor" : "app"} data-theme={theme}>
      <Topbar />
      <div className="app__body"><Sidebar /><main className={fullBleed ? "main main--full" : "main"}>{children}</main></div>
      <GlobalDialogs />
      <div className="toast-stack" aria-live="polite">{toasts.map((toast) => <div key={toast.id} className={`toast toast--${toast.tone ?? "neutral"}`}>{toast.text}</div>)}</div>
    </div>
  );
}
