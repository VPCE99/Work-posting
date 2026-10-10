export type ChartType = "column" | "line" | "pie" | "bar" | "area" | "scatter";

export type OccupancyChartRow = {
  category: string;
  avg: string;
  spot: string;
};

export type OccupancySeriesPoint = {
  category: string;
  avg: number;
  spot: number;
};
