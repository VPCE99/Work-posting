import type { OccupancyChartRow } from "./model";

export const DEFAULT_CHART_HEADERS = ["类别", "平均出租率", "时点出租率"] as const;
/** Value series columns (excluding category). */
export const MAX_CHART_SERIES = 4;
export const MAX_CHART_ROWS = 12;

export function normalizeChartHeaders(headers?: string[] | readonly string[]): string[] {
  const next = headers?.length ? [...headers] : [...DEFAULT_CHART_HEADERS];
  while (next.length < 3) {
    next.push(next.length === 0 ? "类别" : `系列${next.length}`);
  }
  return next;
}

/** Numeric series cell strings for a row (avg, spot, extras…). */
export function seriesValuesOf(row: OccupancyChartRow): string[] {
  return [row.avg, row.spot, ...(row.extras ?? [])];
}

export function withSeriesValue(row: OccupancyChartRow, seriesIndex: number, value: string): OccupancyChartRow {
  if (seriesIndex <= 0) return { ...row, avg: value };
  if (seriesIndex === 1) return { ...row, spot: value };
  const extras = [...(row.extras ?? [])];
  while (extras.length < seriesIndex - 1) extras.push("0");
  extras[seriesIndex - 2] = value;
  return { ...row, extras };
}

export function withSeriesCount(row: OccupancyChartRow, seriesCount: number): OccupancyChartRow {
  const count = Math.max(2, seriesCount);
  const values = seriesValuesOf(row);
  while (values.length < count) values.push("0");
  const trimmed = values.slice(0, count);
  const nextRow: OccupancyChartRow = {
    category: row.category,
    avg: trimmed[0] ?? "0",
    spot: trimmed[1] ?? "0",
  };
  if (trimmed.length > 2) nextRow.extras = trimmed.slice(2);
  return nextRow;
}

export function createChartRow(rows: OccupancyChartRow[], headers: string[]): OccupancyChartRow {
  const seriesCount = Math.max(2, normalizeChartHeaders(headers).length - 1);
  return withSeriesCount(
    { category: `项${rows.length + 1}`, avg: "0", spot: "0" },
    seriesCount,
  );
}

export function addChartColumn(
  headers: string[],
  rows: OccupancyChartRow[],
): { headers: string[]; rows: OccupancyChartRow[] } | null {
  const normalized = normalizeChartHeaders(headers);
  const seriesCount = normalized.length - 1;
  if (seriesCount >= MAX_CHART_SERIES) return null;
  return {
    headers: [...normalized, `系列${seriesCount + 1}`],
    rows: rows.map((row) => withSeriesCount(row, seriesCount + 1)),
  };
}

export function setChartHeaderAt(headers: string[], index: number, value: string): string[] {
  const next = normalizeChartHeaders(headers);
  if (index < 0 || index >= next.length) return next;
  next[index] = value;
  return next;
}

export function setChartCell(
  rows: OccupancyChartRow[],
  rowIndex: number,
  columnIndex: number,
  value: string,
): OccupancyChartRow[] {
  return rows.map((row, index) => {
    if (index !== rowIndex) return row;
    if (columnIndex <= 0) return { ...row, category: value };
    return withSeriesValue(row, columnIndex - 1, value);
  });
}
