import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH, type SlideElement } from "../model";

export type DragBind = (element: SlideElement) => {
  onPointerDown: (event: ReactPointerEvent) => void;
};

type DragOrigin = {
  id: string;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  originX: number;
  originY: number;
  width: number;
  height: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function useCanvasElementDrag({
  scale,
  enabled,
  onSelect,
  onMove,
  onMoveEnd,
}: {
  scale: number;
  enabled: boolean;
  onSelect: (element: SlideElement) => void;
  onMove: (elementId: string, x: number, y: number) => void;
  onMoveEnd: (elementId: string, x: number, y: number, origin: { x: number; y: number }) => void;
}) {
  const dragRef = useRef<DragOrigin | null>(null);
  const latestRef = useRef({ x: 0, y: 0 });
  const callbacksRef = useRef({ onMove, onMoveEnd, scale });
  callbacksRef.current = { onMove, onMoveEnd, scale };

  useEffect(() => {
    if (!enabled) return;

    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      const { scale: currentScale, onMove: move } = callbacksRef.current;
      const dx = (event.clientX - drag.startClientX) / currentScale;
      const dy = (event.clientY - drag.startClientY) / currentScale;
      const x = Math.round(clamp(drag.originX + dx, 0, Math.max(0, CANVAS_WIDTH - drag.width)));
      const y = Math.round(clamp(drag.originY + dy, 0, Math.max(0, CANVAS_HEIGHT - drag.height)));
      latestRef.current = { x, y };
      move(drag.id, x, y);
    };

    const finish = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      dragRef.current = null;
      document.body.classList.remove("is-dragging-slide-element");
      callbacksRef.current.onMoveEnd(drag.id, latestRef.current.x, latestRef.current.y, {
        x: drag.originX,
        y: drag.originY,
      });
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
  }, [enabled]);

  const bindDrag = (element: SlideElement) => ({
    onPointerDown: (event: ReactPointerEvent) => {
      if (!enabled || event.button !== 0) return;
      event.stopPropagation();
      event.preventDefault();
      onSelect(element);
      dragRef.current = {
        id: element.id,
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        originX: element.x,
        originY: element.y,
        width: element.w,
        height: element.h,
      };
      latestRef.current = { x: element.x, y: element.y };
      document.body.classList.add("is-dragging-slide-element");
    },
  });

  return { bindDrag };
}
