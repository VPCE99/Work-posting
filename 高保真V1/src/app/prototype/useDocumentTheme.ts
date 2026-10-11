import { useLayoutEffect } from "react";

/** Keep document chrome aligned with .app theme; strip orphan html[data-theme]. */
export function syncDocumentTheme(theme: "light" | "dark") {
  // Theme tokens/selectors must only live on .app. A leftover data-theme on
  // <html> lets [data-theme="light"] chrome rules fire while .app stays dark
  // (white sidebar + dark main). Strip orphans and keep color-scheme only.
  if (document.documentElement.getAttribute("data-theme") !== null) {
    document.documentElement.removeAttribute("data-theme");
  }
  if (document.documentElement.style.colorScheme !== theme) {
    document.documentElement.style.colorScheme = theme;
  }
  const bodyBg = theme === "dark" ? "#0b0d10" : "#f4f7f8";
  if (document.body.style.backgroundColor !== bodyBg) {
    document.body.style.backgroundColor = bodyBg;
  }
}

/** Single ownership for theme → documentElement / body side effects. */
export function useDocumentTheme(theme: "light" | "dark") {
  useLayoutEffect(() => {
    syncDocumentTheme(theme);
  }, [theme]);
}
