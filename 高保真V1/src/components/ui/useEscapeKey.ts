import { useEffect, useRef } from "react";

export function useEscapeKey(
  enabled: boolean,
  onEscape: () => void,
  options?: { stopPropagation?: boolean; capture?: boolean },
) {
  const onEscapeRef = useRef(onEscape);
  const optionsRef = useRef(options);
  onEscapeRef.current = onEscape;
  optionsRef.current = options;

  useEffect(() => {
    if (!enabled) return;
    const capture = Boolean(optionsRef.current?.capture);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (optionsRef.current?.stopPropagation) event.stopPropagation();
      onEscapeRef.current();
    };
    document.addEventListener("keydown", onKeyDown, capture);
    return () => document.removeEventListener("keydown", onKeyDown, capture);
  }, [enabled]);
}
