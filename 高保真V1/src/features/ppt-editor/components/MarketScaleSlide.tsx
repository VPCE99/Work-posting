import type { MouseEvent as ReactMouseEvent } from "react";
import type { DragBind } from "../hooks/useCanvasElementDrag";
import { elementBoxStyle, elementId, elementTextStyle, slideElementClass, type SlideElement } from "../model";
import { LiveSlideChart } from "./LiveSlideChart";
import { SlideElementView } from "./SlideElementView";

const SEED_KEYS = ["title", "subtitle", "metric", "metricLabel", "metricValue", "note", "chart", "source", "brand"] as const;

export function MarketScaleSlide({
  elements,
  selectedId,
  onSelect,
  onPatch,
  bindDrag,
}: {
  elements: SlideElement[];
  selectedId: string | null;
  onSelect: (element: SlideElement) => void;
  onPatch?: (elementId: string, patch: Partial<SlideElement>) => void;
  bindDrag?: DragBind;
}) {
  const byKey = (key: (typeof SEED_KEYS)[number]) => elements.find((item) => item.id === elementId(2, key));
  const interact = (element: SlideElement) => ({
    onClick: (event: ReactMouseEvent) => {
      event.stopPropagation();
      onSelect(element);
    },
    ...(bindDrag ? bindDrag(element) : {}),
  });
  const title = byKey("title");
  const subtitle = byKey("subtitle");
  const metric = byKey("metric");
  const metricLabel = byKey("metricLabel");
  const metricValue = byKey("metricValue");
  const note = byKey("note");
  const chart = byKey("chart");
  const source = byKey("source");
  const brand = byKey("brand");
  const seedIds = new Set(SEED_KEYS.map((key) => elementId(2, key)));
  const extras = elements.filter((item) => !seedIds.has(item.id));

  return (
    <div className="market-slide market-slide--live">
      {title && (
        <h2
          className={slideElementClass("market-slide__live-text", selectedId, title.id)}
          data-label={title.label}
          style={elementTextStyle(title)}
          {...interact(title)}
        >
          {title.content}
        </h2>
      )}
      {subtitle && (
        <p
          className={slideElementClass("market-slide__live-text", selectedId, subtitle.id)}
          data-label={subtitle.label}
          style={elementTextStyle(subtitle)}
          {...interact(subtitle)}
        >
          {subtitle.content}
        </p>
      )}
      <span className="market-slide__rule" />
      {metric && (
        <div
          className={slideElementClass("market-slide__live-text market-slide__live-metric", selectedId, metric.id)}
          data-label={metric.label}
          style={elementTextStyle(metric)}
          {...interact(metric)}
        >
          {metric.content}
        </div>
      )}
      {metricLabel && (
        <div
          className={slideElementClass("market-slide__live-text", selectedId, metricLabel.id)}
          data-label={metricLabel.label}
          style={elementTextStyle(metricLabel)}
          {...interact(metricLabel)}
        >
          {metricLabel.content}
        </div>
      )}
      {metricValue && (
        <div
          className={slideElementClass("market-slide__live-text market-slide__live-metric-value", selectedId, metricValue.id)}
          data-label={metricValue.label}
          style={elementTextStyle(metricValue)}
          {...interact(metricValue)}
        >
          {metricValue.content}
        </div>
      )}
      {note && (
        <div
          className={slideElementClass("market-slide__live-text", selectedId, note.id)}
          data-label={note.label}
          style={elementTextStyle(note)}
          {...interact(note)}
        >
          {note.content}
        </div>
      )}
      {chart && (
        <div
          className={slideElementClass("market-slide__chart-hit", selectedId, chart.id)}
          data-label={chart.label}
          style={elementBoxStyle(chart)}
          {...interact(chart)}
        >
          <LiveSlideChart
            element={chart}
            positioned={false}
            editable={Boolean(onPatch)}
            {...(onPatch ? { onPatch: (patch: Partial<SlideElement>) => onPatch(chart.id, patch) } : {})}
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
      {source && (
        <div
          className={slideElementClass("market-slide__live-text", selectedId, source.id)}
          data-label={source.label}
          style={elementTextStyle(source)}
          {...interact(source)}
        >
          {source.content}
        </div>
      )}
      {brand && (
        <div
          className={slideElementClass("market-slide__live-text", selectedId, brand.id)}
          data-label={brand.label}
          style={elementTextStyle(brand)}
          {...interact(brand)}
        >
          {brand.content}
        </div>
      )}
    </div>
  );
}
