import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePrototype } from "../../app/PrototypeContext";
import { TemplateManagerDialog } from "../../components/ppt/PptAssistantDialog";
import { useEscapeKey } from "../../components/ui/useEscapeKey";
import { useManagedTimeout } from "../../components/ui/useManagedTimeout";
import { AgentPanel } from "../../features/ppt-editor/components/AgentPanel";
import { EditorHeader } from "../../features/ppt-editor/components/EditorHeader";
import { EditorStatusBar } from "../../features/ppt-editor/components/EditorStatusBar";
import { EditorToolbar } from "../../features/ppt-editor/components/EditorToolbar";
import { ElementPropsPanel } from "../../features/ppt-editor/components/ElementPropsPanel";
import { SlideCanvas } from "../../features/ppt-editor/components/SlideCanvas";
import { SlideNavigator } from "../../features/ppt-editor/components/SlideNavigator";
import { ExportDialog } from "../../features/ppt-editor/dialogs/ExportDialog";
import { ParseDialog } from "../../features/ppt-editor/dialogs/ParseDialog";
import { useAgentChat } from "../../features/ppt-editor/hooks/useAgentChat";
import { useEditorZoom } from "../../features/ppt-editor/hooks/useEditorZoom";
import {
  buildGeneratedElementPatch,
  countDocumentAssets,
  createInitialEditorDocument,
  editorReducer,
  elementsForSlide,
  formatSavedLabel,
  selectedElementOf,
  slideTitleOf,
  type ChartRow,
  type EditorToolName,
  type PropsSectionKey,
  type SlideElement,
} from "../../features/ppt-editor/model";

export function PptEditorPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, customTemplates, notify, sidebarCollapsed, setSidebarCollapsed } = usePrototype();
  const project = projects.find((item) => item.id === projectId);
  const [leftTab, setLeftTab] = useState<"pages" | "design" | "draft">("pages");
  const [pageView, setPageView] = useState<"thumbnail" | "outline">("thumbnail");
  const [slideTone, setSlideTone] = useState<"dark" | "light">("dark");
  const [actionsOpen, setActionsOpen] = useState(false);
  const [parseOpen, setParseOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [doc, dispatch] = useReducer(editorReducer, undefined, () => createInitialEditorDocument());
  const canvasStageRef = useRef<HTMLDivElement>(null);
  const previousSidebarCollapsed = useRef(sidebarCollapsed);
  const invalidRedirected = useRef(false);
  const { zoom, zoomLabel, scale, zoomBy, fitZoom } = useEditorZoom(canvasStageRef);
  const { schedule: scheduleSave } = useManagedTimeout();
  const currentSlideTitle = slideTitleOf(doc);
  const {
    agentMode,
    agentDraft,
    setAgentDraft,
    agentMessages,
    agentThinking,
    agentStreamRef,
    agentDocked,
    agentDockVisible,
    collapseAgent,
    expandAgent,
    sendAgentMessage,
  } = useAgentChat(currentSlideTitle);

  const selectedElement = selectedElementOf(doc);
  const currentElements = elementsForSlide(doc);
  const propsOpen = Boolean(selectedElement) && !doc.presentMode;
  const useLightSlide = slideTone === "light";
  const assetCounts = countDocumentAssets(doc.elementsBySlide);

  useEffect(() => {
    if (project || invalidRedirected.current) return;
    invalidRedirected.current = true;
    notify("未找到该 PPT 项目", "danger");
    navigate("/ppt", { replace: true });
  }, [project, navigate, notify]);

  useEffect(() => {
    if (project?.status === "解析中") setParseOpen(true);
  }, [project?.status]);

  useEffect(() => {
    previousSidebarCollapsed.current = sidebarCollapsed;
    setSidebarCollapsed(true);
    return () => setSidebarCollapsed(previousSidebarCollapsed.current);
    // Capture the pre-editor sidebar state once on mount; do not re-run when it flips to true.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSidebarCollapsed]);

  useEffect(() => {
    if (!selectedElement) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      if (target.closest(".slide-element") || target.closest(".ppt-element-props") || target.closest(".form-select__menu")) return;
      dispatch({ type: "clearSelection" });
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [selectedElement]);

  useEscapeKey(Boolean(selectedElement), () => dispatch({ type: "clearSelection" }));
  useEscapeKey(doc.presentMode, () => dispatch({ type: "setPresentMode", value: false }));

  useEffect(() => {
    if (!actionsOpen) return;
    const closeMenu = (event: PointerEvent) => {
      if (!(event.target as Element).closest(".editor-file-menu-anchor")) setActionsOpen(false);
    };
    document.addEventListener("pointerdown", closeMenu);
    return () => document.removeEventListener("pointerdown", closeMenu);
  }, [actionsOpen]);

  useEscapeKey(actionsOpen, () => setActionsOpen(false));

  useEffect(() => {
    if (doc.saveStatus !== "dirty") return;
    scheduleSave(() => {
      dispatch({ type: "markSaving" });
      scheduleSave(() => {
        dispatch({ type: "markSaved", label: formatSavedLabel() });
      }, 450);
    }, 500);
  }, [doc.saveStatus, doc.past.length, scheduleSave]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (!meta) return;
      const key = event.key.toLowerCase();
      if (key === "z" && event.shiftKey) {
        event.preventDefault();
        dispatch({ type: "redo" });
        return;
      }
      if (key === "z") {
        event.preventDefault();
        dispatch({ type: "undo" });
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const exitEditor = () => {
    setSidebarCollapsed(previousSidebarCollapsed.current);
    navigate("/ppt");
  };

  const runDataAction = (action: "parse" | "refresh" | "report") => {
    setActionsOpen(false);
    if (action === "parse") setParseOpen(true);
    if (action === "refresh") notify("正在刷新已识别的数据内容");
    if (action === "report") notify("正在更新 PPT 所依据的报告数据");
  };

  const applyTool = useCallback((tool: EditorToolName) => {
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
  }, [doc.presentMode, doc.past.length, doc.future.length, notify]);

  const selectElement = useCallback((element: SlideElement) => {
    dispatch({ type: "selectElement", elementId: element.id });
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

  const generateElementContent = useCallback(() => {
    const selected = selectedElementOf(doc);
    if (!selected) return;
    const { patch, toast } = buildGeneratedElementPatch(selected, doc.elementAiPrompt);
    dispatch({ type: "patchElement", elementId: selected.id, patch });
    notify(toast, "success");
  }, [doc, notify]);

  const addPage = useCallback(() => {
    dispatch({ type: "addSlide" });
    notify("已新增一页空白幻灯片", "success");
  }, [notify]);

  if (!project) return null;

  const workspaceClass = [
    "ppt-editor__workspace",
    agentDocked ? "ppt-editor__workspace--agent-docked" : "",
    propsOpen ? "ppt-editor__workspace--props-open" : "",
    doc.presentMode ? "ppt-editor__workspace--present" : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      <section className="ppt-editor">
        <EditorHeader
          projectName={project.name}
          saveStatus={doc.saveStatus}
          savedLabel={doc.savedLabel}
          actionsOpen={actionsOpen}
          onToggleActions={() => setActionsOpen((value) => !value)}
          onExit={exitEditor}
          onDataAction={runDataAction}
          onExport={() => setExportOpen(true)}
        />

        <div className={workspaceClass}>
          {!doc.presentMode && (
            <SlideNavigator
              leftTab={leftTab}
              pageView={pageView}
              slides={doc.slides}
              activeSlide={doc.activeSlide}
              slideTone={slideTone}
              customTemplates={customTemplates}
              onLeftTabChange={setLeftTab}
              onPageViewChange={setPageView}
              onActiveSlideChange={(index) => dispatch({ type: "setActiveSlide", slideIndex: index })}
              onSlideToneChange={setSlideTone}
              onNotify={notify}
              onOpenTemplates={() => setTemplatesOpen(true)}
              onAddPage={addPage}
            />
          )}

          <main className="slide-canvas-wrap">
            {!doc.presentMode && (
              <EditorToolbar
                activeSlide={doc.activeSlide}
                slideTitle={currentSlideTitle}
                zoom={zoom}
                zoomLabel={zoomLabel}
                agentDockVisible={agentDockVisible}
                onZoomBy={zoomBy}
                onFitZoom={fitZoom}
                onExpandAgent={expandAgent}
              />
            )}
            <SlideCanvas
              activeSlide={doc.activeSlide}
              scale={scale}
              useLightSlide={useLightSlide}
              currentElements={currentElements}
              selectedElementId={doc.selectedElementId}
              activeTool={doc.activeTool}
              presentMode={doc.presentMode}
              canUndo={doc.past.length > 0}
              canRedo={doc.future.length > 0}
              canvasStageRef={canvasStageRef}
              onClearSelection={() => dispatch({ type: "clearSelection" })}
              onSelectElement={selectElement}
              onApplyTool={applyTool}
            />
          </main>

          <div className={propsOpen ? "ppt-element-props-slot ppt-element-props-slot--open" : "ppt-element-props-slot"} aria-hidden={!propsOpen}>
            {selectedElement && (
              <ElementPropsPanel
                element={selectedElement}
                sections={doc.propsSections}
                aiPrompt={doc.elementAiPrompt}
                dataEditing={doc.chartDataEditing}
                onToggleSection={togglePropsSection}
                onChange={patchSelectedElement}
                onAiPromptChange={(value) => dispatch({ type: "setElementAiPrompt", value })}
                onGenerate={generateElementContent}
                onToggleDataEditing={() => dispatch({ type: "toggleChartDataEditing" })}
                onPatchChartRow={patchChartRow}
                onClose={() => dispatch({ type: "clearSelection" })}
              />
            )}
          </div>

          {!doc.presentMode && (
            <AgentPanel
              agentMode={agentMode}
              agentMessages={agentMessages}
              agentThinking={agentThinking}
              agentDraft={agentDraft}
              agentStreamRef={agentStreamRef}
              onCollapse={collapseAgent}
              onDraftChange={setAgentDraft}
              onSend={sendAgentMessage}
            />
          )}
        </div>
        {!doc.presentMode && (
          <EditorStatusBar activeSlide={doc.activeSlide} slideCount={doc.slides.length} zoomLabel={zoomLabel} />
        )}
      </section>

      {parseOpen && (
        <ParseDialog
          pageCount={doc.slides.length}
          chartCount={assetCounts.charts}
          tableCount={assetCounts.tables}
          imageCount={assetCounts.images}
          onClose={() => setParseOpen(false)}
        />
      )}
      {exportOpen && (
        <ExportDialog
          projectName={project.name}
          pageCount={doc.slides.length}
          chartCount={assetCounts.charts}
          tableCount={assetCounts.tables}
          imageCount={assetCounts.images}
          generating={generating}
          onClose={() => setExportOpen(false)}
          onGenerate={() => {
            setGenerating(true);
            window.setTimeout(() => {
              setGenerating(false);
              notify("PPT 已生成，可下载", "success");
            }, 1200);
          }}
        />
      )}
      {templatesOpen && <TemplateManagerDialog onClose={() => setTemplatesOpen(false)} />}
    </>
  );
}
