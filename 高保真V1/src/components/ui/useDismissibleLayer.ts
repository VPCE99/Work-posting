import { useEffect, useRef, type RefObject } from "react";

/** Close when pointerdown happens outside any of the provided roots. */
export function useDismissibleLayer(
  open: boolean,
  onDismiss: () => void,
  roots: Array<RefObject<HTMLElement | null> | null | undefined>,
) {
  const onDismissRef = useRef(onDismiss);
  const rootsRef = useRef(roots);
  onDismissRef.current = onDismiss;
  rootsRef.current = roots;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      const inside = rootsRef.current.some((root) => root?.current?.contains(target));
      if (inside) return;
      onDismissRef.current();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);
}
