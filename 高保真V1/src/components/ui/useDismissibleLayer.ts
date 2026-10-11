import { useEffect, useRef, type RefObject } from "react";

type DismissibleOptions = {
  /** Treat matches of this selector as inside (for class-based anchors without a single ref). */
  withinSelector?: string;
  /**
   * Default `pointerdown`. Use `click` when triggers call stopPropagation on click
   * (e.g. Sidebar context menus) so the same-trigger toggle is not raced by dismiss.
   */
  event?: "pointerdown" | "click";
};

/** Close when a pointer/click happens outside any of the provided roots. */
export function useDismissibleLayer(
  open: boolean,
  onDismiss: () => void,
  roots: Array<RefObject<HTMLElement | null> | null | undefined>,
  options?: DismissibleOptions,
) {
  const onDismissRef = useRef(onDismiss);
  const rootsRef = useRef(roots);
  const optionsRef = useRef(options);
  onDismissRef.current = onDismiss;
  rootsRef.current = roots;
  optionsRef.current = options;

  useEffect(() => {
    if (!open) return;
    const eventName = optionsRef.current?.event ?? "pointerdown";
    const onOutside = (event: Event) => {
      const target = event.target as Node | null;
      if (!target) return;
      const insideRoot = rootsRef.current.some((root) => root?.current?.contains(target));
      if (insideRoot) return;
      const selector = optionsRef.current?.withinSelector;
      if (selector && target instanceof Element && target.closest(selector)) return;
      onDismissRef.current();
    };
    document.addEventListener(eventName, onOutside);
    return () => document.removeEventListener(eventName, onOutside);
  }, [open]);
}
