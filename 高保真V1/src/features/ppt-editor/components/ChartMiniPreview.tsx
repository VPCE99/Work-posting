import { ChartRenderer } from "../../../components/chart/ChartRenderer";
import { occupancyChartSeries } from "../../../components/chart/scale";
import { defaultChartRows, type ChartRow, type ChartType } from "../model";

export function ChartMiniPreview({ chartType, rows }: { chartType: ChartType; rows?: ChartRow[] }) {
  const series = occupancyChartSeries(rows ?? defaultChartRows);
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
