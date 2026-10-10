import type { RefObject } from "react";
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
  onClearSelection,
  onSelectElement,
  onApplyTool,
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
  onClearSelection: () => void;
  onSelectElement: (element: SlideElement) => void;
  onApplyTool: (tool: EditorToolName) => void;
}) {
  const isMarketSlide = activeSlide === 2;

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
          {isMarketSlide ? (
            <MarketScaleSlide
              elements={currentElements}
              selectedId={selectedElementId}
              onSelect={onSelectElement}
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
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
