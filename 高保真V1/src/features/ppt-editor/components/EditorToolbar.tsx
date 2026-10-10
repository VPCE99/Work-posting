import { Brand } from "../../../components/ui/Brand";
import { LucideIcon } from "../icons/LucideIcon";
import { ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from "../model";

export function EditorToolbar({
  activeSlide,
  slideTitle,
  zoom,
  zoomLabel,
  agentDockVisible,
  onZoomBy,
  onFitZoom,
  onExpandAgent,
}: {
  activeSlide: number;
  slideTitle: string;
  zoom: number;
  zoomLabel: string;
  agentDockVisible: boolean;
  onZoomBy: (delta: number) => void;
  onFitZoom: () => void;
  onExpandAgent: () => void;
}) {
  return (
    <div className="canvas-toolbar">
      <strong>第 {activeSlide + 1} 页 · {slideTitle}</strong>
      <div className="canvas-toolbar__trailing">
        <div className="canvas-zoom-controls" role="group" aria-label="画布缩放">
          <button type="button" aria-label="缩小画布" disabled={zoom <= ZOOM_MIN} onClick={() => onZoomBy(-ZOOM_STEP)}><LucideIcon name="minus" size={14} /></button>
          <span aria-live="polite">{zoomLabel}</span>
          <button type="button" aria-label="放大画布" disabled={zoom >= ZOOM_MAX} onClick={() => onZoomBy(ZOOM_STEP)}><LucideIcon name="plus" size={14} /></button>
          <button type="button" aria-label="适应画布" onClick={onFitZoom}>适应</button>
        </div>
        <button
          type="button"
          className={agentDockVisible ? "canvas-agent-dock canvas-agent-dock--visible" : "canvas-agent-dock"}
          aria-label="打开 AI 助手"
          aria-hidden={!agentDockVisible}
          tabIndex={agentDockVisible ? 0 : -1}
          onClick={onExpandAgent}
          title="打开 AI 助手"
        >
          <Brand compact />
        </button>
      </div>
    </div>
  );
}
