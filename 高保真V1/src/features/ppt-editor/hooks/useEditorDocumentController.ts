import { useCallback, useReducer } from "react";
import {
  buildGeneratedElementPatch,
  createBlankEditorDocument,
  createInitialEditorDocument,
  createProjectEditorDocument,
  editorReducer,
  elementsForSlide,
  selectedElementOf,
  slideTitleOf,
  type ChartRow,
  type EditorToolName,
  type PropsSectionKey,
  type SlideElement,
} from "../model";

/** Reducer + selectors + document command helpers for the PPT editor page. */
export function useEditorDocumentController() {
  const [doc, dispatch] = useReducer(editorReducer, undefined, () => createInitialEditorDocument());

  const selectedElement = selectedElementOf(doc);
  const currentElements = elementsForSlide(doc);
  const currentSlideTitle = slideTitleOf(doc);
  const propsOpen = Boolean(selectedElement) && !doc.presentMode;

  const hydrateForProject = useCallback((
    pages: number,
    activeSlide: number,
    options?: { blank?: boolean; projectId?: string },
  ) => {
    if (options?.blank) {
      dispatch({ type: "hydrateDocument", document: createBlankEditorDocument() });
      return;
    }
    if (options?.projectId) {
      dispatch({
        type: "hydrateDocument",
        document: createProjectEditorDocument(options.projectId, pages, activeSlide),
      });
      return;
    }
    dispatch({
      type: "hydrateDocument",
      document: createInitialEditorDocument(pages, activeSlide),
    });
  }, []);

  const selectElement = useCallback((element: SlideElement) => {
    dispatch({ type: "selectElement", elementId: element.id });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: "clearSelection" });
  }, []);

  const moveElement = useCallback((elementId: string, x: number, y: number) => {
    dispatch({ type: "setElementPosition", elementId, x, y });
  }, []);

  const moveElementEnd = useCallback((
    elementId: string,
    x: number,
    y: number,
    origin: { x: number; y: number },
  ) => {
    dispatch({ type: "setElementPosition", elementId, x, y, origin });
  }, []);

  const patchSelectedElement = useCallback((patch: Partial<SlideElement>) => {
    if (!doc.selectedElementId) return;
    dispatch({ type: "patchElement", elementId: doc.selectedElementId, patch });
  }, [doc.selectedElementId]);

  const togglePropsSection = useCallback((key: PropsSectionKey) => {
    dispatch({ type: "togglePropsSection", key });
  }, []);

  const patchChartRow = useCallback((index: number, key: keyof ChartRow, value: string) => {
    if (!doc.selectedElementId) return;
    dispatch({ type: "patchChartRow", elementId: doc.selectedElementId, index, key, value });
  }, [doc.selectedElementId]);

  const generateElementContent = useCallback((notify: (text: string, tone?: "success" | "neutral" | "danger") => void) => {
    const selected = selectedElementOf(doc);
    if (!selected) return;
    const { patch, toast } = buildGeneratedElementPatch(selected, doc.elementAiPrompt);
    dispatch({ type: "patchElement", elementId: selected.id, patch });
    notify(toast, "success");
  }, [doc]);

  const addPage = useCallback((notify: (text: string, tone?: "success" | "neutral" | "danger") => void) => {
    dispatch({ type: "addSlide" });
    notify("已新增一页空白幻灯片", "success");
  }, []);

  const applyTool = useCallback((
    tool: EditorToolName,
    notify: (text: string, tone?: "success" | "neutral" | "danger") => void,
    setSlideTone: (updater: (tone: "dark" | "light") => "dark" | "light") => void,
  ) => {
    if (tool === "palette") {
      setSlideTone((tone) => {
        const next = tone === "dark" ? "light" : "dark";
        notify(next === "light" ? "已切换为浅色主题" : "已切换为深色主题", "success");
        return next;
      });
      dispatch({ type: "setActiveTool", tool: "pointer" });
      return;
    }
    if (tool === "hand") {
      const entering = !doc.presentMode;
      dispatch({ type: "applyTool", tool });
      notify(entering ? "已进入演示模式" : "已退出演示模式", "success");
      return;
    }
    if (tool === "undo") {
      if (!doc.past.length) return;
      dispatch({ type: "applyTool", tool });
      notify("已撤销");
      return;
    }
    if (tool === "redo") {
      if (!doc.future.length) return;
      dispatch({ type: "applyTool", tool });
      notify("已重做");
      return;
    }
    dispatch({ type: "applyTool", tool });
    if (tool === "pointer") return;
    const labels: Partial<Record<EditorToolName, string>> = {
      layout: "已插入版式块",
      text: "已插入文本",
      chart: "已插入图表",
      table: "已插入表格",
      image: "已插入图片",
      shapes: "已插入形状",
    };
    const message = labels[tool];
    if (message) notify(message, "success");
  }, [doc.presentMode, doc.past.length, doc.future.length]);

  return {
    doc,
    dispatch,
    selectedElement,
    currentElements,
    currentSlideTitle,
    propsOpen,
    hydrateForProject,
    selectElement,
    clearSelection,
    moveElement,
    moveElementEnd,
    patchSelectedElement,
    togglePropsSection,
    patchChartRow,
    generateElementContent,
    addPage,
    applyTool,
  };
}
