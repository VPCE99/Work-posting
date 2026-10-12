/** Explicit feature public API — keep in sync with current call sites. */
export type {
  AgentChatMessage,
  AgentPanelMode,
  ChartRow,
  ChartType,
  EditorToolName,
  PropsSectionKey,
  SaveStatus,
  SlideElement,
  SlideMeta,
  TextAlign,
  SlideElementKind,
} from "./types";

export {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  clampZoom,
  ZOOM_DEFAULT,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_STEP,
  ZOOM_WHEEL_STEP,
} from "./zoom";

export {
  chartTypeOptions,
  defaultChartRows,
  DEFAULT_SLIDE_TITLES,
  editorTools,
  textDefaults,
  toolIcons,
} from "./defaults";

export {
  buildBlankSlideElements,
  buildCoverSlideElements,
  buildSlideElements,
  countDocumentAssets,
  createInsertedElement,
  createLayoutElements,
  createSlideMetas,
  elementId,
  elementLabel,
  slideElementClass,
} from "./elements";

export {
  AGENT_COLLAPSE_MS,
  AGENT_THINK_MS,
  agentQuickActions,
  agentReplyFor,
  initialAgentMessages,
} from "./agent";

export { elementBoxStyle, elementTextStyle } from "./styles";

export type { EditorAction, EditorDocumentState } from "./editorReducer";
export {
  buildGeneratedElementPatch,
  createBlankEditorDocument,
  createInitialEditorDocument,
  createProjectEditorDocument,
  editorReducer,
  elementsForSlide,
  formatSavedLabel,
  selectedElementOf,
  slideTitleOf,
} from "./editorReducer";
