type FieldKind = "dimension" | "measure";

export type Slot = "x" | "yLeft" | "yRight";

export type ChartField = {
  id: string;
  name: string;
  kind: FieldKind;
  unit?: string;
};

export type Dataset = {
  id: string;
  name: string;
  source: string;
  fields: ChartField[];
  rows: Array<Record<string, string | number>>;
};

export const datasets: Dataset[] = [
  {
    id: "reit-trend",
    name: "产业园 REITs 经营趋势",
    source: "当前对话 · 经营趋势表",
    fields: [
      { id: "year", name: "年度", kind: "dimension" },
      { id: "occupancy", name: "平均出租率", kind: "measure", unit: "%" },
      { id: "revenue", name: "营业收入", kind: "measure", unit: "亿元" },
    ],
    rows: [
      { year: "2023", occupancy: 89.6, revenue: 26.6 },
      { year: "2024", occupancy: 91.7, revenue: 28.9 },
      { year: "2025", occupancy: 93.8, revenue: 31.4 },
    ],
  },
];

export const fields = datasets.flatMap((dataset) => dataset.fields);
export const fieldById = (id: string | null) => fields.find((field) => field.id === id) ?? null;

export const emptySlots: Record<Slot, string | null> = { x: null, yLeft: null, yRight: null };
