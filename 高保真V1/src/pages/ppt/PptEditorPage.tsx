import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePrototype } from "../../app/PrototypeContext";
import { TemplateManagerDialog } from "../../components/ppt/PptAssistantDialog";
import { useDismissibleLayer } from "../../components/ui/useDismissibleLayer";
import { useEscapeKey } from "../../components/ui/useEscapeKey";
import { useManagedTimeout, useTimeoutRegistry } from "../../components/ui/useManagedTimeout";
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
import { useEditorAutosave } from "../../features/ppt-editor/hooks/useEditorAutosave";
import { useEditorDialogs } from "../../features/ppt-editor/hooks/useEditorDialogs";
import { useEditorDocumentController } from "../../features/ppt-editor/hooks/useEditorDocumentController";
import { useEditorKeyboardShortcuts } from "../../features/ppt-editor/hooks/useEditorKeyboardShortcuts";
import { useEditorZoom } from "../../features/ppt-editor/hooks/useEditorZoom";
import { getProjectDeck } from "../../data/mock";
import {
  countDocumentAssets,
  type EditorToolName,
} from "../../features/ppt-editor/model";

export function PptEditorPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, customTemplates, notify, sidebarCollapsed, setSidebarCollapsed } = usePrototype();
  const project = projects.find((item) => item.id === projectId);
  const [leftTab, setLeftTab] = useState<"pages" | "design" | "draft">("pages");
  const [pageView, setPageView] = useState<"thumbnail" | "outline">("thumbnail");
  const [slideTone, setSlideTone] = useState<"dark" | "light">("light");
  const {
    actionsOpen,
    toggleActions,
    closeActions,
    parseOpen,
    setParseOpen,
    openParse,
    closeParse,
    exportOpen,
    openExport,
    closeExport,
    generating,
    setGenerating,
    templatesOpen,
    openTemplates,
    closeTemplates,
  } = useEditorDialogs();
  const {
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
    patchElement,
    togglePropsSection,
    patchChartRow,
    generateElementContent,
    addPage,
    applyTool: applyToolCore,
  } = useEditorDocumentController();
  const canvasStageRef = useRef<HTMLDivElement>(null);
  const previousSidebarCollapsed = useRef(sidebarCollapsed);
  const invalidRedirected = useRef(false);
  const hydratedProjectId = useRef<string | null>(null);
  const { zoom, zoomLabel, scale, zoomBy, fitZoom } = useEditorZoom(canvasStageRef);
  const { schedule: scheduleSave } = useManagedTimeout();
  const { schedule: scheduleKeyed } = useTimeoutRegistry();
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
    resolvePreview,
  } = useAgentChat(currentSlideTitle);

  const useLightSlide = slideTone === "light";
  const assetCounts = countDocumentAssets(doc.elementsBySlide);

  useEffect(() => {
    if (project || invalidRedirected.current) return;
    invalidRedirected.current = true;
    notify("未找到该 PPT 项目", "danger");
    navigate("/ppt", { replace: true });
  }, [project, navigate, notify]);

  const projectDeck = project ? getProjectDeck(project.id) : null;

  useEffect(() => {
    if (!project || hydratedProjectId.current === project.id) return;
    hydratedProjectId.current = project.id;
    if (project.blankTemplate) {
      hydrateForProject(1, 0, { blank: true });
      return;
    }
    const pages = Math.max(1, project.pages);
    // Open on the cover when the project has a deck theme; otherwise keep the seeded middle slide.
    const activeSlide = projectDeck ? 0 : Math.min(2, pages - 1);
    hydrateForProject(pages, activeSlide, { projectId: project.id });
  }, [project, projectDeck, hydrateForProject]);

  useEffect(() => {
    if (project?.status === "解析中") setParseOpen(true);
  }, [project?.status, setParseOpen]);

  useEffect(() => {
    previousSidebarCollapsed.current = sidebarCollapsed;
    setSidebarCollapsed(true);
    return () => setSidebarCollapsed(previousSidebarCollapsed.current);
    // Capture the pre-editor sidebar state once on mount; do not re-run when it flips to true.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSidebarCollapsed]);

  useDismissibleLayer(Boolean(selectedElement), clearSelection, [], {
    withinSelector: ".slide-element, .ppt-element-props, .form-select__menu",
  });

  useEscapeKey(Boolean(selectedElement), clearSelection);
  useEscapeKey(doc.presentMode, () => dispatch({ type: "setPresentMode", value: false }));

  useDismissibleLayer(actionsOpen, closeActions, [], { withinSelector: ".editor-file-menu-anchor" });
  useEscapeKey(actionsOpen, closeActions);

  useEditorAutosave(doc, dispatch, scheduleSave);
  useEditorKeyboardShortcuts(dispatch);

  const exitEditor = () => {
    setSidebarCollapsed(previousSidebarCollapsed.current);
    navigate("/ppt");
  };

  const runDataAction = (action: "parse" | "refresh" | "report") => {
    closeActions();
    if (action === "parse") openParse();
    if (action === "refresh") notify("正在刷新已识别的数据内容");
    if (action === "report") notify("正在更新 PPT 所依据的报告数据");
  };

  const applyTool = useCallback((tool: EditorToolName) => {
    applyToolCore(tool, notify, setSlideTone);
  }, [applyToolCore, notify]);

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
          onToggleActions={toggleActions}
          onExit={exitEditor}
          onDataAction={runDataAction}
          onExport={openExport}
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
              onOpenTemplates={openTemplates}
              onAddPage={() => addPage(notify)}
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
              coverLayout={projectDeck?.coverLayout ?? null}
              coverTitle={projectDeck?.slideTitles[0] ?? project?.name ?? ""}
              coverSubtitle={projectDeck?.coverSubtitle ?? ""}
              onClearSelection={clearSelection}
              onSelectElement={selectElement}
              onApplyTool={applyTool}
              onMoveElement={moveElement}
              onMoveElementEnd={moveElementEnd}
              onPatchElement={patchElement}
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
                onGenerate={() => generateElementContent(notify)}
                onToggleDataEditing={() => dispatch({ type: "toggleChartDataEditing" })}
                onPatchChartRow={patchChartRow}
                onClose={clearSelection}
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
              onConfirmPreview={(messageId, kind) => {
                applyTool(kind);
                resolvePreview(messageId, "inserted");
              }}
              onDiscardPreview={(messageId) => resolvePreview(messageId, "discarded")}
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
          onClose={closeParse}
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
          onClose={closeExport}
          onGenerate={() => {
            setGenerating(true);
            scheduleKeyed("export-generate", () => {
              setGenerating(false);
              notify("PPT 已生成，可下载", "success");
            }, 1200);
          }}
        />
      )}
      {templatesOpen && <TemplateManagerDialog onClose={closeTemplates} />}
    </>
  );
}
