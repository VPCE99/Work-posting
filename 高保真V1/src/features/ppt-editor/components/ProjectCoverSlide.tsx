import type { MouseEvent as ReactMouseEvent } from "react";
import { ProjectCoverArt } from "../../../components/ppt/ProjectCoverArt";
import type { PptCoverLayout } from "../../../types";
import type { DragBind } from "../hooks/useCanvasElementDrag";
import { elementId, slideElementClass, type SlideElement } from "../model";

const SEED_KEYS = ["title", "subtitle", "accent", "chart"] as const;

/** Editable first-slide cover that matches the project card theme art. */
export function ProjectCoverSlide({
  layout,
  title,
  subtitle,
  elements,
  selectedId,
  onSelect,
  bindDrag,
}: {
  layout: PptCoverLayout;
  title: string;
  subtitle: string;
  elements: SlideElement[];
  selectedId: string | null;
  onSelect: (element: SlideElement) => void;
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
    <div className="project-cover-slide">
      <ProjectCoverArt
        layout={layout}
        title={titleEl?.content || title}
        subtitle={subtitleEl?.content || subtitle}
        variant="slide"
      />
      {titleEl && (
        <div
          className={slideElementClass("project-cover-slide__hit project-cover-slide__hit--title", selectedId, titleEl.id)}
          data-label={titleEl.label}
          {...interact(titleEl)}
        />
      )}
      {subtitleEl && (
        <div
          className={slideElementClass("project-cover-slide__hit project-cover-slide__hit--subtitle", selectedId, subtitleEl.id)}
          data-label={subtitleEl.label}
          {...interact(subtitleEl)}
        />
      )}
      {accentEl && (
        <div
          className={slideElementClass("project-cover-slide__hit project-cover-slide__hit--accent", selectedId, accentEl.id)}
          data-label={accentEl.label}
          {...interact(accentEl)}
        />
      )}
      {chartEl && (
        <div
          className={slideElementClass("project-cover-slide__hit project-cover-slide__hit--chart", selectedId, chartEl.id)}
          data-label={chartEl.label}
          {...interact(chartEl)}
        />
      )}
      {extras.map((element) => (
        <div
          key={element.id}
          className={slideElementClass("project-cover-slide__extra", selectedId, element.id)}
          data-label={element.label}
          style={{
            left: `calc(${element.x}px * var(--slide-scale))`,
            top: `calc(${element.y}px * var(--slide-scale))`,
            width: `calc(${element.w}px * var(--slide-scale))`,
            height: `calc(${element.h}px * var(--slide-scale))`,
          }}
          {...interact(element)}
        >
          {element.content}
        </div>
      ))}
    </div>
  );
}
