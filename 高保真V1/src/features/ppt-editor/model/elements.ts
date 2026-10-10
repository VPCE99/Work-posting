import { defaultChartRows, DEFAULT_SLIDE_TITLES, textDefaults } from "./defaults";
import type { EditorToolName, SlideElement, SlideElementKind, SlideMeta } from "./types";

export function elementId(slideIndex: number, key: string) {
  return `s${slideIndex + 1}-${key}`;
}

export function elementLabel(slideIndex: number, order: number) {
  return `S${slideIndex + 1}-E${order}`;
}

export function createSlideMetas(titles: string[] = DEFAULT_SLIDE_TITLES): SlideMeta[] {
  return titles.map((title, index) => ({
    id: `slide-${index + 1}`,
    title,
  }));
}

export function buildSlideElements(slideIndex: number, title = DEFAULT_SLIDE_TITLES[slideIndex] ?? "幻灯片"): SlideElement[] {
  if (slideIndex === 2) {
    return [
      { ...textDefaults, id: elementId(slideIndex, "title"), label: elementLabel(slideIndex, 1), content: "市场规模与增长趋势", x: 34, y: 30, w: 500, h: 36, fontSize: "22", lineHeight: "1.4", aiGenerated: true },
      { ...textDefaults, id: elementId(slideIndex, "subtitle"), label: elementLabel(slideIndex, 2), content: "产业园 REITs · 2023—2026E", x: 36, y: 66, w: 320, h: 22, fontSize: "12", textColor: "#8e949e" },
      { ...textDefaults, id: elementId(slideIndex, "metric"), label: elementLabel(slideIndex, 3), content: "31.4 亿元 · 规模持续扩张", x: 36, y: 132, w: 220, h: 80, textColor: "#00c9c3", bold: true, aiGenerated: true },
      { ...textDefaults, id: elementId(slideIndex, "note"), label: elementLabel(slideIndex, 4), content: "较 2023 年提升 4.6 个百分点", x: 36, y: 300, w: 260, h: 24, fontSize: "12", textColor: "#8e949e" },
      {
        ...textDefaults,
        id: elementId(slideIndex, "chart"),
        label: elementLabel(slideIndex, 5),
        kind: "chart",
        content: "规模与出租率趋势",
        x: 356,
        y: 120,
        w: 360,
        h: 260,
        aiGenerated: true,
        chartType: "line",
        chartHeaders: ["类别", "平均出租率", "时点出租率"],
        chartRows: defaultChartRows.map((row) => ({ ...row })),
      },
    ];
  }
  return [
    { ...textDefaults, id: elementId(slideIndex, "title"), label: elementLabel(slideIndex, 1), content: title, x: 80, y: 140, w: 520, h: 48, fontSize: "28", lineHeight: "1.3", bold: true, aiGenerated: true },
    { ...textDefaults, id: elementId(slideIndex, "body"), label: elementLabel(slideIndex, 2), content: "板块整体回落、可比口径企稳、个券分化加剧 | 数据截至 2026Q2", x: 230, y: 280, w: 500, h: 50, textColor: "#c8cdd5" },
  ];
}

export function buildBlankSlideElements(slideIndex: number): SlideElement[] {
  return [
    {
      ...textDefaults,
      id: elementId(slideIndex, "title"),
      label: elementLabel(slideIndex, 1),
      content: "空白页标题",
      x: 80,
      y: 160,
      w: 520,
      h: 48,
      fontSize: "28",
      lineHeight: "1.3",
      bold: true,
    },
  ];
}

function nextInsertOffset(existing: SlideElement[]) {
  const n = existing.length;
  return { x: 72 + (n % 4) * 24, y: 96 + (n % 5) * 28 };
}

export function createInsertedElement(
  slideIndex: number,
  existing: SlideElement[],
  kind: Exclude<SlideElementKind, never>,
  tool: EditorToolName,
): SlideElement {
  const order = existing.length + 1;
  const { x, y } = nextInsertOffset(existing);
  const stamp = Date.now().toString(36);
  const base = {
    ...textDefaults,
    id: elementId(slideIndex, `${tool}-${stamp}`),
    label: elementLabel(slideIndex, order),
    x,
    y,
  };

  if (kind === "chart") {
    return {
      ...base,
      kind: "chart",
      content: "新建图表",
      w: 320,
      h: 220,
      chartType: "column",
      chartHeaders: ["类别", "平均出租率", "时点出租率"],
      chartRows: defaultChartRows.map((row) => ({ ...row })),
    };
  }
  if (kind === "table") {
    return {
      ...base,
      kind: "table",
      content: "项目 | 指标 | 数值\n华北 | 出租率 | 92%\n华东 | 出租率 | 89%",
      w: 360,
      h: 140,
      fontSize: "13",
    };
  }
  if (kind === "image") {
    return {
      ...base,
      kind: "image",
      content: "图片占位",
      w: 240,
      h: 160,
      bgTransparent: false,
      textColor: "#8e949e",
      align: "center",
    };
  }
  if (kind === "shape") {
    return {
      ...base,
      kind: "shape",
      content: "",
      w: 160,
      h: 100,
      bgTransparent: false,
      textColor: "#00c9c3",
      shapeVariant: "rect",
    };
  }
  return {
    ...base,
    kind: "text",
    content: "双击编辑文本",
    w: 280,
    h: 40,
    fontSize: "18",
  };
}

export function createLayoutElements(slideIndex: number, existing: SlideElement[]): SlideElement[] {
  const stamp = Date.now().toString(36);
  const start = existing.length;
  return [
    {
      ...textDefaults,
      id: elementId(slideIndex, `layout-title-${stamp}`),
      label: elementLabel(slideIndex, start + 1),
      content: "版式标题",
      x: 64,
      y: 48,
      w: 560,
      h: 44,
      fontSize: "26",
      bold: true,
    },
    {
      ...textDefaults,
      id: elementId(slideIndex, `layout-body-${stamp}`),
      label: elementLabel(slideIndex, start + 2),
      content: "在此补充要点说明，适合结论页或章节页。",
      x: 64,
      y: 120,
      w: 560,
      h: 72,
      fontSize: "16",
      textColor: "#c8cdd5",
    },
  ];
}

export function slideElementClass(base: string, selectedId: string | null, id: string) {
  const selected = selectedId === id ? "slide-element slide-element--selected" : "slide-element";
  return base ? `${base} ${selected}` : selected;
}

export function countDocumentAssets(elementsBySlide: Record<number, SlideElement[]>) {
  let charts = 0;
  let tables = 0;
  let images = 0;
  for (const list of Object.values(elementsBySlide)) {
    for (const element of list) {
      if (element.kind === "chart") charts += 1;
      if (element.kind === "table") tables += 1;
      if (element.kind === "image") images += 1;
    }
  }
  return { charts, tables, images };
}
