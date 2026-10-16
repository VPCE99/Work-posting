import type { RefObject } from "react";
import type { PptCoverLayout } from "../../../types";
import { useCanvasElementDrag } from "../hooks/useCanvasElementDrag";
import { LucideIcon } from "../icons/LucideIcon";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  editorTools,
  toolIcons,
  type EditorToolName,
  type SlideElement,
} from "../model";
import { MarketScaleSlide } from "./MarketScaleSlide";
import { ProjectCoverSlide } from "./ProjectCoverSlide";
import { SlideElementView } from "./SlideElementView";

export function SlideCanvas({
  activeSlide,
  scale,
  useLightSlide,
  currentElements,
  selectedElementId,
  activeTool,
  presentMode,
  canUndo,
  canRedo,
  canvasStageRef,
  coverLayout = null,
  coverTitle = "",
  coverSubtitle = "",
  onClearSelection,
  onSelectElement,
  onApplyTool,
  onMoveElement,
  onMoveElementEnd,
  onPatchElement,
}: {
  activeSlide: number;
  scale: number;
  useLightSlide: boolean;
  currentElements: SlideElement[];
  selectedElementId: string | null;
  activeTool: EditorToolName;
  presentMode: boolean;
  canUndo: boolean;
  canRedo: boolean;
  canvasStageRef: RefObject<HTMLDivElement | null>;
  coverLayout?: PptCoverLayout | null;
  coverTitle?: string;
  coverSubtitle?: string;
  onClearSelection: () => void;
  onSelectElement: (element: SlideElement) => void;
  onApplyTool: (tool: EditorToolName) => void;
  onMoveElement: (elementId: string, x: number, y: number) => void;
  onMoveElementEnd: (elementId: string, x: number, y: number, origin: { x: number; y: number }) => void;
  onPatchElement: (elementId: string, patch: Partial<SlideElement>) => void;
}) {
  const isCoverSlide = activeSlide === 0 && Boolean(coverLayout);
  const isMarketSlide = activeSlide === 2 && !isCoverSlide;
  const dragEnabled = !presentMode && activeTool === "pointer";
  const chartEditable = !presentMode;
  const { bindDrag } = useCanvasElementDrag({
    scale,
    enabled: dragEnabled,
    onSelect: onSelectElement,
    onMove: onMoveElement,
    onMoveEnd: onMoveElementEnd,
  });
  const chartPatch = chartEditable ? onPatchElement : undefined;

  return (
    <div className={presentMode ? "slide-work-area slide-work-area--present" : "slide-work-area"}>
      {!presentMode && (
        <aside className="canvas-floating-tools" aria-label="画布编辑工具">
          <div className="canvas-tool-pill">
            {editorTools.map((tool) => {
              const muted = (tool.name === "undo" && !canUndo) || (tool.name === "redo" && !canRedo);
              const active = activeTool === tool.name || (tool.name === "hand" && presentMode);
              const className = [
                "canvas-tool",
                active ? "canvas-tool--active" : "",
                muted ? "canvas-tool--muted" : "",
              ].filter(Boolean).join(" ");
              return (
                <button
                  key={tool.name}
                  type="button"
                  className={className}
                  title={tool.label}
                  aria-label={`${tool.label}工具`}
                  aria-pressed={active}
                  disabled={muted}
                  onClick={() => onApplyTool(tool.name)}
                >
                  <LucideIcon name={toolIcons[tool.name]} size={17} />
                </button>
              );
            })}
          </div>
        </aside>
      )}
      <div
        className="slide-canvas-stage"
        ref={canvasStageRef}
        title="按住 Shift 并滚动鼠标滚轮可缩放画布"
        onMouseDown={(event) => {
          if ((event.target as Element).closest(".slide-element")) return;
          onClearSelection();
        }}
      >
        <div
          className={useLightSlide ? "slide-canvas slide-canvas--light" : "slide-canvas slide-canvas--dark"}
          style={{
            width: CANVAS_WIDTH * scale,
            height: CANVAS_HEIGHT * scale,
            ["--slide-scale" as string]: String(scale),
          }}
        >
          {isCoverSlide && coverLayout ? (
            <ProjectCoverSlide
              layout={coverLayout}
              title={coverTitle}
              subtitle={coverSubtitle}
              elements={currentElements}
              selectedId={selectedElementId}
              onSelect={onSelectElement}
              {...(chartPatch ? { onPatch: chartPatch } : {})}
              {...(dragEnabled ? { bindDrag } : {})}
            />
          ) : isMarketSlide ? (
            <MarketScaleSlide
              elements={currentElements}
              selectedId={selectedElementId}
              onSelect={onSelectElement}
              {...(chartPatch ? { onPatch: chartPatch } : {})}
              {...(dragEnabled ? { bindDrag } : {})}
            />
          ) : (
            <div className="slide-canvas__placeholder slide-canvas__placeholder--live">
              <small>第 {activeSlide + 1} 页</small>
              {currentElements.map((element) => (
                <SlideElementView
                  key={element.id}
                  element={element}
                  selectedId={selectedElementId}
                  onSelect={onSelectElement}
                  {...(chartPatch ? { onPatch: chartPatch } : {})}
                  {...(dragEnabled ? { bindDrag } : {})}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
