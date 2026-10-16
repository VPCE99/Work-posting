import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { normalizeChartHeaders, setChartHeaderAt } from "../../../components/chart/chartData";
import { ChartRenderer } from "../../../components/chart/ChartRenderer";
import { occupancyChartSeries } from "../../../components/chart/scale";
import { defaultChartRows, elementBoxStyle, type SlideElement } from "../model";

type EditTarget = { kind: "title" } | { kind: "legend"; index: number };

const LEGEND_TONES = ["is-avg", "is-spot", "is-extra", "is-extra2"] as const;

export function LiveSlideChart({
  element,
  positioned = true,
  editable = false,
  onPatch,
}: {
  element: SlideElement;
  positioned?: boolean;
  editable?: boolean;
  onPatch?: (patch: Partial<SlideElement>) => void;
}) {
  const rows = occupancyChartSeries(element.chartRows ?? defaultChartRows);
  const type = element.chartType ?? "line";
  const headers = normalizeChartHeaders(element.chartHeaders);
  const legends = headers.slice(1);
  const title = element.content || "图表";
  const style: CSSProperties | undefined = positioned ? elementBoxStyle(element) : undefined;
  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const canEdit = Boolean(editable && onPatch);

  useEffect(() => {
    if (!editing) return;
    inputRef.current?.select();
  }, [editing]);

  useEffect(() => {
    setEditing(null);
  }, [element.id]);

  const beginEdit = (target: EditTarget, value: string) => (event: ReactMouseEvent) => {
    if (!canEdit) return;
    event.preventDefault();
    event.stopPropagation();
    setDraft(value);
    setEditing(target);
  };

  const blockDrag = (event: ReactPointerEvent | ReactMouseEvent) => {
    if (canEdit) event.stopPropagation();
  };

  const commit = () => {
    if (!editing || !onPatch) {
      setEditing(null);
      return;
    }
    const value = draft.trim();
    if (editing.kind === "title") {
      if (value && value !== element.content) onPatch({ content: value });
    } else {
      const fallback = legends[editing.index] || `系列${editing.index + 1}`;
      const next = setChartHeaderAt(headers, editing.index + 1, value || fallback);
      if (next[editing.index + 1] !== headers[editing.index + 1]) onPatch({ chartHeaders: next });
    }
    setEditing(null);
  };

  const onEditKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setEditing(null);
    }
  };

  return (
    <div className={canEdit ? "market-slide__live-chart market-slide__live-chart--editable" : "market-slide__live-chart"} style={style}>
      {editing?.kind === "title" ? (
        <input
          ref={inputRef}
          className="market-slide__live-chart-edit"
          value={draft}
          aria-label="编辑图表名称"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={onEditKeyDown}
          onPointerDown={blockDrag}
          onClick={blockDrag}
        />
      ) : (
        <strong
          className="market-slide__live-chart-title"
          title={canEdit ? "双击编辑图表名称" : undefined}
          onPointerDown={blockDrag}
          onDoubleClick={beginEdit({ kind: "title" }, title)}
        >
          {title}
        </strong>
      )}
      <ChartRenderer
        type={type}
        series={rows}
        width={320}
        height={200}
        density="slide"
        title={title}
      />
      <div className="market-slide__live-chart-legend">
        {legends.map((legend, index) => {
          const tone = LEGEND_TONES[index % LEGEND_TONES.length];
          if (editing?.kind === "legend" && editing.index === index) {
            return (
              <span className="market-slide__live-chart-legend-item" key={`edit-${index}`}>
                <i className={tone} />
                <input
                  ref={inputRef}
                  className="market-slide__live-chart-edit market-slide__live-chart-edit--legend"
                  value={draft}
                  aria-label={`编辑图例 ${index + 1}`}
                  onChange={(event) => setDraft(event.target.value)}
                  onBlur={commit}
                  onKeyDown={onEditKeyDown}
                  onPointerDown={blockDrag}
                  onClick={blockDrag}
                />
              </span>
            );
          }
          return (
            <span
              key={`${legend}-${index}`}
              className="market-slide__live-chart-legend-item"
              title={canEdit ? "双击编辑图例" : undefined}
              onPointerDown={blockDrag}
              onDoubleClick={beginEdit({ kind: "legend", index }, legend)}
            >
              <i className={tone} />
              {legend}
            </span>
          );
        })}
      </div>
    </div>
  );
}
