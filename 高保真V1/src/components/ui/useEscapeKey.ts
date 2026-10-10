import { useEffect, useRef } from "react";

export function useEscapeKey(
  enabled: boolean,
  onEscape: () => void,
  options?: { stopPropagation?: boolean },
) {
  const onEscapeRef = useRef(onEscape);
  const optionsRef = useRef(options);
  onEscapeRef.current = onEscape;
  optionsRef.current = options;

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (optionsRef.current?.stopPropagation) event.stopPropagation();
      onEscapeRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
