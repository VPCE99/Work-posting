export type ChartType = "column" | "line" | "pie" | "bar" | "area" | "scatter";

export type OccupancyChartRow = {
  category: string;
  avg: string;
  spot: string;
  /** Additional series beyond avg/spot (table columns 4+). */
  extras?: string[];
};

export type OccupancySeriesPoint = {
  category: string;
  avg: number;
  spot: number;
  extras?: number[];
};
