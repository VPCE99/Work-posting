import type { LucideIconName } from "../icons/LucideIcon";
import type { ChartRow, ChartType, EditorToolName, TextAlign } from "./types";

/** Seed titles for a new document; runtime titles live on EditorDocumentState.slides. */
export const DEFAULT_SLIDE_TITLES = ["封面", "核心结论", "市场规模", "区域表现", "重点项目", "总结"];

/** @deprecated Prefer DEFAULT_SLIDE_TITLES or document.slides — kept for existing tests/imports. */
export const slideTitles = DEFAULT_SLIDE_TITLES;

export const editorTools: Array<{ name: EditorToolName; label: string }> = [
  { name: "pointer", label: "选择" },
  { name: "layout", label: "版式" },
  { name: "text", label: "文本" },
  { name: "chart", label: "图表" },
  { name: "table", label: "表格" },
  { name: "image", label: "图片" },
  { name: "shapes", label: "形状" },
  { name: "palette", label: "主题" },
  { name: "hand", label: "演示" },
  { name: "undo", label: "撤销" },
  { name: "redo", label: "重做" },
];

export const toolIcons: Record<EditorToolName, LucideIconName> = {
  pointer: "mouse-pointer-2",
  layout: "layout-template",
  text: "type",
  chart: "chart-column",
  table: "table-2",
  image: "image",
  shapes: "shapes",
  palette: "palette",
  hand: "hand",
  undo: "undo-2",
  redo: "redo-2",
};

export const chartTypeOptions: Array<{ type: ChartType; label: string; icon: LucideIconName }> = [
  { type: "column", label: "柱状图", icon: "chart-column" },
  { type: "line", label: "折线图", icon: "chart-line" },
  { type: "pie", label: "饼图", icon: "chart-pie" },
  { type: "bar", label: "条形图", icon: "chart-bar" },
  { type: "area", label: "面积图", icon: "chart-area" },
  { type: "scatter", label: "散点图", icon: "chart-scatter" },
];

export const defaultChartRows: ChartRow[] = [
  { category: "2022A", avg: "90.65", spot: "91.43" },
  { category: "2023A", avg: "88.91", spot: "85.51" },
  { category: "2024A", avg: "89.42", spot: "87.20" },
  { category: "2025A", avg: "91.18", spot: "90.05" },
  { category: "2026Q2", avg: "92.30", spot: "91.80" },
];

export const textDefaults = {
  kind: "text" as const,
  fontSize: "16",
  lineHeight: "1.5",
  textColor: "#f7f8fa",
  bgTransparent: true,
  bold: false,
  italic: false,
  underline: false,
  align: "left" as TextAlign,
};
