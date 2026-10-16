import type { MouseEvent as ReactMouseEvent } from "react";
import { ProjectCoverArt } from "../../../components/ppt/ProjectCoverArt";
import type { PptCoverLayout } from "../../../types";
import type { DragBind } from "../hooks/useCanvasElementDrag";
import { elementBoxStyle, elementId, elementTextStyle, slideElementClass, type SlideElement } from "../model";
import { LiveSlideChart } from "./LiveSlideChart";
import { SlideElementView } from "./SlideElementView";

const SEED_KEYS = ["title", "subtitle", "accent", "chart"] as const;

/** Editable first-slide cover — hit boxes and visuals share element x/y so drag works. */
export function ProjectCoverSlide({
  layout,
  title,
  subtitle,
  elements,
  selectedId,
  onSelect,
  onPatch,
  bindDrag,
}: {
  layout: PptCoverLayout;
  title: string;
  subtitle: string;
  elements: SlideElement[];
  selectedId: string | null;
  onSelect: (element: SlideElement) => void;
  onPatch?: (elementId: string, patch: Partial<SlideElement>) => void;
  bindDrag?: DragBind;
}) {
  const byKey = (key: (typeof SEED_KEYS)[number]) => elements.find((item) => item.id === elementId(0, key));
  const interact = (element: SlideElement) => ({
    onClick: (event: ReactMouseEvent) => {
      event.stopPropagation();
      onSelect(element);
    },
    ...(bindDrag ? bindDrag(element) : {}),
  });
  const titleEl = byKey("title");
  const subtitleEl = byKey("subtitle");
  const accentEl = byKey("accent");
  const chartEl = byKey("chart");
  const seedIds = new Set(SEED_KEYS.map((key) => elementId(0, key)));
  const extras = elements.filter((item) => !seedIds.has(item.id));

  return (
    <div className="project-cover-slide project-cover-slide--live">
      <ProjectCoverArt
        layout={layout}
        title={titleEl?.content || title}
        subtitle={subtitleEl?.content || subtitle}
        variant="slide"
      />
      {titleEl && (
        <div
          className={slideElementClass("project-cover-slide__live-text", selectedId, titleEl.id)}
          data-label={titleEl.label}
          style={elementTextStyle(titleEl)}
          {...interact(titleEl)}
        >
          {titleEl.content}
        </div>
      )}
      {accentEl && (
        <div
          className={slideElementClass("project-cover-slide__live-accent", selectedId, accentEl.id)}
          data-label={accentEl.label}
          style={{
            ...elementBoxStyle(accentEl),
            background: accentEl.textColor || "#00c9c3",
            height: `calc(${Math.max(accentEl.h, 3)}px * var(--slide-scale))`,
            minHeight: 0,
            borderRadius: 999,
          }}
          {...interact(accentEl)}
        />
      )}
      {subtitleEl && (
        <div
          className={slideElementClass("project-cover-slide__live-text", selectedId, subtitleEl.id)}
          data-label={subtitleEl.label}
          style={elementTextStyle(subtitleEl)}
          {...interact(subtitleEl)}
        >
          {subtitleEl.content}
        </div>
      )}
      {chartEl && (
        <div
          className={slideElementClass("project-cover-slide__live-chart", selectedId, chartEl.id)}
          data-label={chartEl.label}
          style={elementBoxStyle(chartEl)}
          {...interact(chartEl)}
        >
          <LiveSlideChart
            element={chartEl}
            positioned={false}
            editable={Boolean(onPatch)}
            {...(onPatch ? { onPatch: (patch: Partial<SlideElement>) => onPatch(chartEl.id, patch) } : {})}
          />
        </div>
      )}
      {extras.map((element) => (
        <SlideElementView
          key={element.id}
          element={element}
          selectedId={selectedId}
          onSelect={onSelect}
          {...(onPatch ? { onPatch } : {})}
          {...(bindDrag ? { bindDrag } : {})}
        />
      ))}
    </div>
  );
}
