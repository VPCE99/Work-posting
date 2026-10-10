import {
  buildBlankSlideElements,
  buildSlideElements,
  createInsertedElement,
  createLayoutElements,
  createSlideMetas,
} from "./elements";
import { defaultChartRows, DEFAULT_SLIDE_TITLES } from "./defaults";
import type {
  ChartRow,
  ChartType,
  EditorToolName,
  PropsSectionKey,
  SaveStatus,
  SlideElement,
  SlideMeta,
} from "./types";

type HistorySnapshot = {
  slides: SlideMeta[];
  elementsBySlide: Record<number, SlideElement[]>;
  activeSlide: number;
};

export type EditorDocumentState = {
  slides: SlideMeta[];
  activeSlide: number;
  elementsBySlide: Record<number, SlideElement[]>;
  selectedElementId: string | null;
  propsSections: Record<PropsSectionKey, boolean>;
  chartDataEditing: boolean;
  elementAiPrompt: string;
  activeTool: EditorToolName;
  presentMode: boolean;
  saveStatus: SaveStatus;
  savedLabel: string;
  past: HistorySnapshot[];
  future: HistorySnapshot[];
};

export type EditorDocumentAction =
  | { type: "setActiveSlide"; slideIndex: number }
  | { type: "selectElement"; elementId: string }
  | { type: "clearSelection" }
  | { type: "patchElement"; elementId: string; patch: Partial<SlideElement> }
  | { type: "patchChartRow"; elementId: string; index: number; key: keyof ChartRow; value: string }
  | { type: "togglePropsSection"; key: PropsSectionKey }
  | { type: "setPropsSections"; sections: Record<PropsSectionKey, boolean> }
  | { type: "setChartDataEditing"; value: boolean }
  | { type: "toggleChartDataEditing" }
  | { type: "setElementAiPrompt"; value: string }
  | { type: "addSlide" }
  | { type: "setActiveTool"; tool: EditorToolName }
  | { type: "applyTool"; tool: EditorToolName }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "setPresentMode"; value: boolean }
  | { type: "markSaving" }
  | { type: "markSaved"; label: string }
  | { type: "markSaveError" };

const defaultTextSections: Record<PropsSectionKey, boolean> = {
  layout: true,
  content: true,
  style: true,
  ai: true,
  preview: true,
  data: true,
};

const defaultChartSections: Record<PropsSectionKey, boolean> = {
  layout: true,
  content: false,
  style: false,
  ai: false,
  preview: true,
  data: true,
};

const HISTORY_LIMIT = 40;

function cloneElements(map: Record<number, SlideElement[]>): Record<number, SlideElement[]> {
  const next: Record<number, SlideElement[]> = {};
  for (const [key, list] of Object.entries(map)) {
    next[Number(key)] = list.map((item) => {
      const copy: SlideElement = { ...item };
      if (item.chartRows) copy.chartRows = item.chartRows.map((row) => ({ ...row }));
      if (item.chartHeaders) copy.chartHeaders = [item.chartHeaders[0], item.chartHeaders[1], item.chartHeaders[2]];
      return copy;
    });
  }
  return next;
}

function takeSnapshot(state: EditorDocumentState): HistorySnapshot {
  return {
    slides: state.slides.map((slide) => ({ ...slide })),
    elementsBySlide: cloneElements(state.elementsBySlide),
    activeSlide: state.activeSlide,
  };
}

function withHistory(state: EditorDocumentState, next: EditorDocumentState): EditorDocumentState {
  return {
    ...next,
    saveStatus: "dirty",
    past: [...state.past, takeSnapshot(state)].slice(-HISTORY_LIMIT),
    future: [],
  };
}

function formatSavedLabel(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `已保存 ${hours}:${minutes}`;
}

export function createInitialEditorDocument(slideCount = DEFAULT_SLIDE_TITLES.length, activeSlide = 2): EditorDocumentState {
  const titles = DEFAULT_SLIDE_TITLES.slice(0, slideCount);
  while (titles.length < slideCount) titles.push(`幻灯片 ${titles.length + 1}`);
  const slides = createSlideMetas(titles);
  const elementsBySlide: Record<number, SlideElement[]> = {};
  for (let index = 0; index < slides.length; index += 1) {
    elementsBySlide[index] = buildSlideElements(index, slides[index]?.title);
  }
  const safeActive = Math.min(Math.max(activeSlide, 0), Math.max(slides.length - 1, 0));
  return {
    slides,
    activeSlide: safeActive,
    elementsBySlide,
    selectedElementId: null,
    propsSections: defaultTextSections,
    chartDataEditing: false,
    elementAiPrompt: "",
    activeTool: "pointer",
    presentMode: false,
    saveStatus: "saved",
    savedLabel: formatSavedLabel(),
    past: [],
    future: [],
  };
}

export function elementsForSlide(state: EditorDocumentState, slideIndex = state.activeSlide): SlideElement[] {
  return state.elementsBySlide[slideIndex] ?? [];
}

export function selectedElementOf(state: EditorDocumentState): SlideElement | null {
  if (!state.selectedElementId) return null;
  return elementsForSlide(state).find((item) => item.id === state.selectedElementId) ?? null;
}

export function slideTitleOf(state: EditorDocumentState, slideIndex = state.activeSlide) {
  return state.slides[slideIndex]?.title ?? "幻灯片";
}

function patchElementInSlide(
  state: EditorDocumentState,
  elementId: string,
  patch: Partial<SlideElement>,
): EditorDocumentState {
  const list = elementsForSlide(state);
  return {
    ...state,
    elementsBySlide: {
      ...state.elementsBySlide,
      [state.activeSlide]: list.map((item) => (item.id === elementId ? { ...item, ...patch } : item)),
    },
  };
}

function appendElements(state: EditorDocumentState, elements: SlideElement[]): EditorDocumentState {
  if (!elements.length) return state;
  const list = elementsForSlide(state);
  const next = {
    ...state,
    elementsBySlide: {
      ...state.elementsBySlide,
      [state.activeSlide]: [...list, ...elements],
    },
    selectedElementId: elements[elements.length - 1]?.id ?? null,
    activeTool: "pointer" as const,
    propsSections: elements[elements.length - 1]?.kind === "chart" ? defaultChartSections : defaultTextSections,
    chartDataEditing: false,
  };
  return withHistory(state, next);
}

function applyInsertTool(state: EditorDocumentState, tool: EditorToolName): EditorDocumentState {
  const list = elementsForSlide(state);
  if (tool === "layout") {
    return appendElements(state, createLayoutElements(state.activeSlide, list));
  }
  if (tool === "text") {
    return appendElements(state, [createInsertedElement(state.activeSlide, list, "text", tool)]);
  }
  if (tool === "chart") {
    return appendElements(state, [createInsertedElement(state.activeSlide, list, "chart", tool)]);
  }
  if (tool === "table") {
    return appendElements(state, [createInsertedElement(state.activeSlide, list, "table", tool)]);
  }
  if (tool === "image") {
    return appendElements(state, [createInsertedElement(state.activeSlide, list, "image", tool)]);
  }
  if (tool === "shapes") {
    return appendElements(state, [createInsertedElement(state.activeSlide, list, "shape", tool)]);
  }
  return state;
}

export function editorReducer(state: EditorDocumentState, action: EditorDocumentAction): EditorDocumentState {
  switch (action.type) {
    case "setActiveSlide":
      if (action.slideIndex === state.activeSlide) return state;
      if (action.slideIndex < 0 || action.slideIndex >= state.slides.length) return state;
      return {
        ...state,
        activeSlide: action.slideIndex,
        selectedElementId: null,
        elementAiPrompt: "",
        chartDataEditing: false,
      };
    case "selectElement": {
      const fresh = elementsForSlide(state).find((item) => item.id === action.elementId);
      if (!fresh) return state;
      return {
        ...state,
        selectedElementId: fresh.id,
        chartDataEditing: false,
        activeTool: "pointer",
        propsSections: fresh.kind === "chart" ? defaultChartSections : defaultTextSections,
      };
    }
    case "clearSelection":
      return {
        ...state,
        selectedElementId: null,
        chartDataEditing: false,
      };
    case "patchElement":
      return withHistory(state, patchElementInSlide(state, action.elementId, action.patch));
    case "patchChartRow": {
      const selected = selectedElementOf(state);
      if (!selected?.chartRows || selected.id !== action.elementId) return state;
      const chartRows = selected.chartRows.map((row, rowIndex) => (
        rowIndex === action.index ? { ...row, [action.key]: action.value } : row
      ));
      return withHistory(state, patchElementInSlide(state, action.elementId, { chartRows }));
    }
    case "togglePropsSection":
      return {
        ...state,
        propsSections: { ...state.propsSections, [action.key]: !state.propsSections[action.key] },
      };
    case "setPropsSections":
      return { ...state, propsSections: action.sections };
    case "setChartDataEditing":
      return { ...state, chartDataEditing: action.value };
    case "toggleChartDataEditing":
      return { ...state, chartDataEditing: !state.chartDataEditing };
    case "setElementAiPrompt":
      return { ...state, elementAiPrompt: action.value };
    case "addSlide": {
      const index = state.slides.length;
      const title = `空白页 ${index + 1}`;
      const slides = [...state.slides, { id: `slide-${Date.now().toString(36)}`, title }];
      const next: EditorDocumentState = {
        ...state,
        slides,
        elementsBySlide: {
          ...state.elementsBySlide,
          [index]: buildBlankSlideElements(index),
        },
        activeSlide: index,
        selectedElementId: null,
        elementAiPrompt: "",
        chartDataEditing: false,
      };
      return withHistory(state, next);
    }
    case "setActiveTool":
      return { ...state, activeTool: action.tool, presentMode: action.tool === "hand" ? state.presentMode : false };
    case "applyTool": {
      if (action.tool === "pointer") {
        return { ...state, activeTool: "pointer", presentMode: false };
      }
      if (action.tool === "undo") {
        return editorReducer(state, { type: "undo" });
      }
      if (action.tool === "redo") {
        return editorReducer(state, { type: "redo" });
      }
      if (action.tool === "hand") {
        return {
          ...state,
          activeTool: "hand",
          presentMode: !state.presentMode,
          selectedElementId: null,
          chartDataEditing: false,
        };
      }
      if (action.tool === "palette") {
        return { ...state, activeTool: "palette" };
      }
      return applyInsertTool({ ...state, activeTool: action.tool }, action.tool);
    }
    case "undo": {
      const previous = state.past[state.past.length - 1];
      if (!previous) return state;
      return {
        ...state,
        slides: previous.slides,
        elementsBySlide: previous.elementsBySlide,
        activeSlide: previous.activeSlide,
        selectedElementId: null,
        chartDataEditing: false,
        saveStatus: "dirty",
        past: state.past.slice(0, -1),
        future: [takeSnapshot(state), ...state.future].slice(0, HISTORY_LIMIT),
      };
    }
    case "redo": {
      const next = state.future[0];
      if (!next) return state;
      return {
        ...state,
        slides: next.slides,
        elementsBySlide: next.elementsBySlide,
        activeSlide: next.activeSlide,
        selectedElementId: null,
        chartDataEditing: false,
        saveStatus: "dirty",
        past: [...state.past, takeSnapshot(state)].slice(-HISTORY_LIMIT),
        future: state.future.slice(1),
      };
    }
    case "setPresentMode":
      return {
        ...state,
        presentMode: action.value,
        activeTool: action.value ? "hand" : "pointer",
        selectedElementId: action.value ? null : state.selectedElementId,
      };
    case "markSaving":
      if (state.saveStatus !== "dirty" && state.saveStatus !== "saving") return state;
      return { ...state, saveStatus: "saving" };
    case "markSaved":
      return { ...state, saveStatus: "saved", savedLabel: action.label };
    case "markSaveError":
      return { ...state, saveStatus: "error", savedLabel: "保存失败" };
    default:
      return state;
  }
}

export function buildGeneratedElementPatch(
  selected: SlideElement,
  elementAiPrompt: string,
): { patch: Partial<SlideElement>; toast: string } {
  const prompt = elementAiPrompt.trim();
  if (selected.kind === "chart") {
    const chartRows = (selected.chartRows ?? defaultChartRows).map((row, index) => (
      index === 4 ? { ...row, avg: "93.10", spot: "92.40" } : row
    ));
    return {
      patch: {
        aiGenerated: true,
        chartType: (selected.chartType ?? "line") as ChartType,
        chartRows,
        content: prompt ? `（AI）已按「${prompt}」更新图表强调点` : "规模与出租率趋势",
      },
      toast: "已生成图表内容",
    };
  }
  const next = prompt
    ? `（AI）基于「${prompt}」生成的要点：出租率改善与规模扩张并行，建议突出 2025 拐点。`
    : "（AI）已根据当前页数据重写元素文案，突出可比口径与结构分化。";
  return {
    patch: { content: next, aiGenerated: true },
    toast: "已生成元素内容",
  };
}

export { formatSavedLabel };
