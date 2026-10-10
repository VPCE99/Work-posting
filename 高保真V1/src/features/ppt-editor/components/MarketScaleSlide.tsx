import type { MouseEvent as ReactMouseEvent } from "react";
import { elementBoxStyle, elementId, elementTextStyle, slideElementClass, type SlideElement } from "../model";
import { LiveSlideChart } from "./LiveSlideChart";
import { SlideElementView } from "./SlideElementView";

const SEED_KEYS = ["title", "subtitle", "metric", "note", "chart"] as const;

export function MarketScaleSlide({
  elements,
  selectedId,
  onSelect,
}: {
  elements: SlideElement[];
  selectedId: string | null;
  onSelect: (element: SlideElement) => void;
}) {
  const byKey = (key: (typeof SEED_KEYS)[number]) => elements.find((item) => item.id === elementId(2, key));
  const pick = (element: SlideElement) => (event: ReactMouseEvent) => {
    event.stopPropagation();
    onSelect(element);
  };
  const title = byKey("title");
  const subtitle = byKey("subtitle");
  const metric = byKey("metric");
  const note = byKey("note");
  const chart = byKey("chart");
  const seedIds = new Set(SEED_KEYS.map((key) => elementId(2, key)));
  const extras = elements.filter((item) => !seedIds.has(item.id));

  return (
    <div className="market-slide market-slide--live">
      {title && (
        <h2
          className={slideElementClass("market-slide__live-text", selectedId, title.id)}
          data-label={title.label}
          style={elementTextStyle(title)}
          onClick={pick(title)}
        >
          {title.content}
        </h2>
      )}
      {subtitle && (
        <p
          className={slideElementClass("market-slide__live-text", selectedId, subtitle.id)}
          data-label={subtitle.label}
          style={elementTextStyle(subtitle)}
          onClick={pick(subtitle)}
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
          onClick={pick(metric)}
        >
          {metric.content}
        </div>
      )}
      <span className="market-slide__metric-two-label">出租率稳步提升</span>
      <strong className="market-slide__metric-two">93.8%</strong>
      {note && (
        <div
          className={slideElementClass("market-slide__live-text", selectedId, note.id)}
          data-label={note.label}
          style={elementTextStyle(note)}
          onClick={pick(note)}
        >
          {note.content}
        </div>
      )}
      {chart && (
        <>
          <button
            type="button"
            className={slideElementClass("market-slide__chart-hit", selectedId, chart.id)}
            data-label={chart.label}
            aria-label="选择图表元素"
            style={elementBoxStyle(chart)}
            onClick={pick(chart)}
          />
          <LiveSlideChart element={chart} />
        </>
      )}
      {extras.map((element) => (
        <SlideElementView key={element.id} element={element} selectedId={selectedId} onSelect={onSelect} />
      ))}
      <span className="market-slide__source">来源：ChopChat Research · 2026E 为预测值</span>
      <span className="market-slide__brand">ChopChat</span>
    </div>
  );
}

