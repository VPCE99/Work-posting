import type { CSSProperties } from "react";
import { ChartRenderer } from "../../../components/chart/ChartRenderer";
import { chartSeries, defaultChartRows, elementBoxStyle, type SlideElement } from "../model";

export function LiveSlideChart({
  element,
  positioned = true,
}: {
  element: SlideElement;
  positioned?: boolean;
}) {
  const rows = chartSeries(element.chartRows ?? defaultChartRows);
  const type = element.chartType ?? "line";
  const style: CSSProperties | undefined = positioned ? elementBoxStyle(element) : undefined;

  return (
    <div className="market-slide__live-chart" style={style}>
      <strong className="market-slide__live-chart-title">{element.content || "图表"}</strong>
      <ChartRenderer
        type={type}
        series={rows}
        width={320}
        height={200}
        density="slide"
        title={element.content || "图表"}
      />
      <div className="market-slide__live-chart-legend">
        <span><i className="is-avg" />平均出租率</span>
        <span><i className="is-spot" />时点出租率</span>
      </div>
    </div>
  );
}
