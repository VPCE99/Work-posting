import { useCallback, useState } from "react";
import type { ToastMessage } from "../../types";
import { useTimeoutRegistry } from "../../components/ui/useManagedTimeout";
import { syncDocumentTheme } from "./useDocumentTheme";

export function useChromeState() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<"binding" | "chart" | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { schedule: scheduleToast } = useTimeoutRegistry();

  const notify = useCallback((text: string, tone: ToastMessage["tone"] = "neutral") => {
    const id = Date.now();
    setToasts((items) => [...items, { id, text, tone }]);
    scheduleToast(`toast-${id}`, () => setToasts((items) => items.filter((item) => item.id !== id)), 2600);
  }, [scheduleToast]);

  const toggleTheme = useCallback(() => {
    const root = document.querySelector<HTMLElement>(".app");
    root?.setAttribute("data-theme-switching", "");
    setTheme((value) => {
      const next = value === "light" ? "dark" : "light";
      // Explicit sync in the action to avoid a flash before layout effect.
      syncDocumentTheme(next);
      return next;
    });
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => root?.removeAttribute("data-theme-switching"));
    });
  }, []);

  return {
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    activeDialog,
    setActiveDialog,
    theme,
    toggleTheme,
    toasts,
    notify,
  };
}
