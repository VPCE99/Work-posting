import { occupancyChartSeries, occupancyValueDomain } from "../../../components/chart/scale";
import type { ChartRow, ChartSeriesPoint } from "./types";

export function chartSeries(rows: ChartRow[]): ChartSeriesPoint[] {
  return occupancyChartSeries(rows);
}

export function chartValueDomain(points: ChartSeriesPoint[]) {
  return occupancyValueDomain(points);
}
