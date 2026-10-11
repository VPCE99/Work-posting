import { useCallback, useEffect, useRef } from "react";

/** Stable timeout handle that always clears on unmount and when replaced. */
export function useManagedTimeout() {
  const timerRef = useRef<number | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = null;
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    clear();
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      fn();
    }, ms);
  }, [clear]);

  useEffect(() => () => clear(), [clear]);

  return { schedule, clear };
}

/**
 * Keyed timeout registry: scheduling under one key does not cancel other keys.
 * Use when a component needs concurrent delays (save vs export, thinking vs fade, toasts).
 */
export function useTimeoutRegistry() {
  const timersRef = useRef(new Map<string, number>());

  const clear = useCallback((key?: string) => {
    if (key != null) {
      const id = timersRef.current.get(key);
      if (id != null) window.clearTimeout(id);
      timersRef.current.delete(key);
      return;
    }
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current.clear();
  }, []);

  const schedule = useCallback((key: string, fn: () => void, ms: number) => {
    clear(key);
    const id = window.setTimeout(() => {
      timersRef.current.delete(key);
      fn();
    }, ms);
    timersRef.current.set(key, id);
  }, [clear]);

  useEffect(() => () => clear(), [clear]);

  return { schedule, clear };
}
