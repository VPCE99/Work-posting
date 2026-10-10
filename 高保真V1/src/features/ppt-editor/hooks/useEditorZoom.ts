import { useCallback, useEffect, useState, type RefObject } from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH, clampZoom, ZOOM_DEFAULT, ZOOM_WHEEL_STEP } from "../model";

export function useEditorZoom(canvasStageRef: RefObject<HTMLDivElement | null>) {
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);

  const fitZoom = useCallback(() => {
    const stage = canvasStageRef.current;
    if (!stage) return;
    const padX = 48;
    const padY = 48;
    const availW = Math.max(stage.clientWidth - padX, 80);
    const availH = Math.max(stage.clientHeight - padY, 80);
    const nextScale = Math.min(availW / CANVAS_WIDTH, availH / CANVAS_HEIGHT);
    setZoom(clampZoom(nextScale * 100));
  }, [canvasStageRef]);

  const zoomBy = useCallback((delta: number) => {
    setZoom((current) => clampZoom(current + delta));
  }, []);

  // Fit once on enter. Do not re-fit when AI assistant / props panel toggles —
  // the slide should keep its size when the agent docks.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => fitZoom());
    return () => window.cancelAnimationFrame(frame);
  }, [fitZoom]);

  useEffect(() => {
    const stage = canvasStageRef.current;
    if (!stage) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.shiftKey) return;
      event.preventDefault();
      // macOS / 部分浏览器在按住 Shift 时会把纵向滚轮映射为 deltaX，deltaY 常为 0。
      const rawDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (rawDelta === 0) return;
      zoomBy(rawDelta > 0 ? -ZOOM_WHEEL_STEP : ZOOM_WHEEL_STEP);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [canvasStageRef, zoomBy]);

  return {
    zoom,
    zoomLabel: `${zoom}%`,
    scale: zoom / 100,
    zoomBy,
    fitZoom,
  };
}
