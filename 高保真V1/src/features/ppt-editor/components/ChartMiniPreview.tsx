import { ChartRenderer } from "../../../components/chart/ChartRenderer";
import { chartSeries, defaultChartRows, type ChartRow, type ChartType } from "../model";

export function ChartMiniPreview({ chartType, rows }: { chartType: ChartType; rows?: ChartRow[] }) {
  const series = chartSeries(rows ?? defaultChartRows);
  return (
    <ChartRenderer
      type={chartType}
      series={series}
      width={160}
      height={88}
      density="miniature"
      className="ppt-props-chart-preview__svg"
    />
  );
}
