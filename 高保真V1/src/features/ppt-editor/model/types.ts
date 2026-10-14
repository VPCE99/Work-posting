import type { ChartType as SharedChartType, OccupancyChartRow } from "../../../components/chart/model";

export type AgentPanelMode = "open" | "closing" | "closed" | "opening";
type AgentChatRole = "user" | "assistant";

export type TextAlign = "left" | "center" | "right";
export type ChartType = SharedChartType;
export type ChartRow = OccupancyChartRow;

/** Chart/image draft shown in the agent panel before the user inserts it. */
export type AgentAssetPreview = {
  kind: "chart" | "image";
  chartType?: ChartType;
  caption: string;
};

export type AgentPreviewStatus = "pending" | "inserted" | "discarded";

export type AgentChatMessage = {
  id: string;
  role: AgentChatRole;
  text: string;
  title?: string;
  preview?: AgentAssetPreview;
  previewStatus?: AgentPreviewStatus;
};

export type EditorToolName =
  | "pointer"
  | "layout"
  | "text"
  | "chart"
  | "table"
  | "image"
  | "shapes"
  | "palette"
  | "hand"
  | "undo"
  | "redo";

export type SlideElementKind = "text" | "chart" | "table" | "image" | "shape";

export type SlideElement = {
  id: string;
  label: string;
  kind: SlideElementKind;
  content: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: string;
  lineHeight: string;
  textColor: string;
  bgTransparent: boolean;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: TextAlign;
  aiGenerated?: boolean;
  chartType?: ChartType;
  chartHeaders?: [string, string, string];
  chartRows?: ChartRow[];
  shapeVariant?: "rect" | "ellipse";
};

export type SlideMeta = {
  id: string;
  title: string;
};

export type SaveStatus = "clean" | "dirty" | "saving" | "saved" | "error";

export type PropsSectionKey = "layout" | "content" | "style" | "ai" | "preview" | "data";
