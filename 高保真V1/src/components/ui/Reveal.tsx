import { forwardRef, useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode, type Ref } from "react";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const OPEN_MS = 280;
const CLOSE_MS = 240;

type Point = { x: number; y: number };

let lastPoint: { x: number; y: number; time: number } | null = null;
let listening = false;

function ensureTriggerMemory() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("pointerdown", (event) => {
    lastPoint = { x: event.clientX, y: event.clientY, time: performance.now() };
  }, true);
}

function readTrigger(maxAge = 900): Point | null {
  ensureTriggerMemory();
  if (!lastPoint) return null;
  if (performance.now() - lastPoint.time > maxAge) return null;
  return { x: lastPoint.x, y: lastPoint.y };
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function motionKeyframes(rect: DOMRect, origin: Point | null, closing: boolean): Keyframe[] {
  const full = "translate(0px, 0px) scale(1)";
  if (!origin || rect.width < 1 || rect.height < 1) {
    const resting = "translate(0px, 0px) scale(0.94)";
    return closing
      ? [{ transform: full, opacity: 1 }, { transform: resting, opacity: 0 }]
      : [{ transform: resting, opacity: 0 }, { transform: full, opacity: 1 }];
  }
  const dx = origin.x - (rect.left + rect.width / 2);
  const dy = origin.y - (rect.top + rect.height / 2);
  const shrunk = `translate(${dx}px, ${dy}px) scale(0.2)`;
  return closing
    ? [{ transform: full, opacity: 1 }, { transform: shrunk, opacity: 0 }]
    : [{ transform: shrunk, opacity: 0 }, { transform: full, opacity: 1 }];
}

function playSurface(node: HTMLElement, origin: Point | null, closing: boolean) {
  node.getAnimations().forEach((animation) => animation.cancel());
  if (prefersReducedMotion()) {
    return node.animate(
      [{ opacity: closing ? 0 : 1 }, { opacity: closing ? 0 : 1 }],
      { duration: 0, fill: "both" },
    );
  }
  return node.animate(motionKeyframes(node.getBoundingClientRect(), origin, closing), {
    duration: closing ? CLOSE_MS : OPEN_MS,
    easing: EASE,
    fill: "both",
  });
}

function assignRef<T>(target: Ref<T> | undefined, node: T | null) {
  if (typeof target === "function") target(node);
  else if (target) target.current = node;
}

type RevealProps = { open: boolean } & HTMLAttributes<HTMLDivElement>;

export const Reveal = forwardRef<HTMLDivElement, RevealProps>(function Reveal({ open, children, style, ...rest }, forwardedRef) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<Point | null>(null);
  const contentRef = useRef<ReactNode>(children);
  const styleRef = useRef(style);
  const [mounted, setMounted] = useState(open);

  if (open) {
    contentRef.current = children;
    styleRef.current = style;
  }

  useLayoutEffect(() => {
    ensureTriggerMemory();
    if (open) setMounted(true);
  }, [open]);

  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!mounted || !node) return;
    if (open) {
      originRef.current = readTrigger();
      const animation = playSurface(node, originRef.current, false);
      return () => animation.cancel();
    }
    const animation = playSurface(node, originRef.current, true);
    let cancelled = false;
    animation.finished.then(() => {
      if (!cancelled) setMounted(false);
    }).catch(() => {});
    return () => {
      cancelled = true;
      animation.cancel();
    };
  }, [open, mounted]);

  const setNode = (node: HTMLDivElement | null) => {
    nodeRef.current = node;
    assignRef(forwardedRef, node);
  };

  if (!mounted) return null;
  return (
    <div
      {...rest}
      ref={setNode}
      style={{ ...styleRef.current, pointerEvents: open ? undefined : "none" }}
    >
      {contentRef.current}
    </div>
  );
});

function placeClone(clone: HTMLElement, rect: DOMRect) {
  const style = clone.style;
  style.position = "fixed";
  style.left = `${rect.left}px`;
  style.top = `${rect.top}px`;
  style.width = `${rect.width}px`;
  style.height = `${rect.height}px`;
  style.minWidth = `${rect.width}px`;
  style.minHeight = `${rect.height}px`;
  style.maxWidth = `${rect.width}px`;
  style.maxHeight = `${rect.height}px`;
  style.margin = "0";
  style.right = "auto";
  style.bottom = "auto";
  style.transform = "none";
  style.pointerEvents = "none";
  style.animation = "none";
}

export function useModalReveal() {
  const panelRef = useRef<HTMLElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<Point | null>(null);
  const panelRectRef = useRef<DOMRect | null>(null);
  const veilRectRef = useRef<DOMRect | null>(null);
  const sessionRef = useRef(0);

  useLayoutEffect(() => {
    ensureTriggerMemory();
    const panel = panelRef.current;
    const veil = veilRef.current;
    if (!panel) return;
    const generation = ++sessionRef.current;
    const origin = readTrigger();
    originRef.current = origin;
    const track = () => {
      if (panel.getAnimations().some((animation) => animation.playState === "running")) return;
      panelRectRef.current = panel.getBoundingClientRect();
      veilRectRef.current = veil?.getBoundingClientRect() ?? null;
    };
    panelRectRef.current = panel.getBoundingClientRect();
    veilRectRef.current = veil?.getBoundingClientRect() ?? null;
    const enter = playSurface(panel, origin, false);
    const veilEnter = veil && !prefersReducedMotion()
      ? veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: OPEN_MS, easing: EASE, fill: "both" })
      : null;
    const observer = new ResizeObserver(track);
    observer.observe(panel);
    window.addEventListener("resize", track);
    window.addEventListener("scroll", track, true);
    return () => {
      enter.cancel();
      veilEnter?.cancel();
      observer.disconnect();
      window.removeEventListener("resize", track);
      window.removeEventListener("scroll", track, true);
      const panelRect = panelRectRef.current;
      const veilRect = veilRectRef.current;
      const savedOrigin = originRef.current;
      if (prefersReducedMotion() || !panelRect || panelRect.width < 1) return;
      const clone = panel.cloneNode(true) as HTMLElement;
      clone.removeAttribute("id");
      clone.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
      clone.setAttribute("aria-hidden", "true");
      placeClone(clone, panelRect);
      clone.style.zIndex = "210";
      document.body.appendChild(clone);
      const exit = playSurface(clone, savedOrigin, true);
      exit.finished.then(() => clone.remove()).catch(() => clone.remove());

      const veilClone = document.createElement("div");
      veilClone.className = "modal-backdrop__veil";
      veilClone.setAttribute("aria-hidden", "true");
      if (veilRect && veilRect.width > 1) placeClone(veilClone, veilRect);
      else veilClone.style.cssText = "position:fixed;inset:0;";
      veilClone.style.zIndex = "200";
      veilClone.style.pointerEvents = "none";
      document.body.appendChild(veilClone);
      const veilExit = veilClone.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CLOSE_MS, easing: EASE, fill: "forwards" });
      veilExit.finished.then(() => veilClone.remove()).catch(() => veilClone.remove());

      queueMicrotask(() => {
        if (sessionRef.current === generation) return;
        exit.cancel();
        veilExit.cancel();
        clone.remove();
        veilClone.remove();
      });
    };
  }, []);

  return { panelRef, veilRef };
}
