import { useEffect, useRef } from "react";

/** Close overlays when the viewport is resized (menus that use fixed coordinates). */
export function useCloseOnViewportChange(open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const close = () => onCloseRef.current();
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [open]);
}
