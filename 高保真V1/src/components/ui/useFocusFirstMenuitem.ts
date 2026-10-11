import { useEffect, type RefObject } from "react";

/** Focus the first enabled [role=menuitem] after a popover mounts (rAF retry for Reveal). */
export function useFocusFirstMenuitem(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const tryFocus = () => {
      if (cancelled) return;
      const first = containerRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])');
      if (first) {
        first.focus();
        return;
      }
      requestAnimationFrame(tryFocus);
    };
    requestAnimationFrame(tryFocus);
    return () => {
      cancelled = true;
    };
  }, [active, containerRef]);
}
