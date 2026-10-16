import type { OccupancyChartRow, OccupancySeriesPoint } from "./model";

export function occupancyChartSeries(rows: OccupancyChartRow[]): OccupancySeriesPoint[] {
  return rows.map((row) => {
    const point: OccupancySeriesPoint = {
    category: row.category,
    avg: Number.parseFloat(row.avg) || 0,
    spot: Number.parseFloat(row.spot) || 0,
    };
    if (row.extras) point.extras = row.extras.map((value) => Number.parseFloat(value) || 0);
    return point;
  });
}

export function seriesNumbersOf(point: OccupancySeriesPoint): number[] {
  return [point.avg, point.spot, ...(point.extras ?? [])];
}

export function occupancyValueDomain(points: OccupancySeriesPoint[]) {
  const values = points.flatMap((row) => seriesNumbersOf(row));
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const span = max - min || 1;
  return { min, max, span };
}

/** Domain helper for Chart Dialog dual-axis result charts. */
export function paddedValueDomain(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const slack = (max - min) * 0.6 || max * 0.08;
  return { min: Math.max(0, min - slack), max: max + slack };
}

export function scaleLinear(value: number, domain: { min: number; max: number }, range: { start: number; end: number }) {
  const span = domain.max - domain.min || 1;
  return range.start + ((value - domain.min) / span) * (range.end - range.start);
}
