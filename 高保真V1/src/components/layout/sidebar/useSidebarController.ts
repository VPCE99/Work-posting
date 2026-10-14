import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePrototype } from "../../../app/PrototypeContext";
import type { ChatProject, Conversation } from "../../../types";
import { focusableElements, trapTab } from "../../ui/focusContainment";
import { useCloseOnViewportChange } from "../../ui/useCloseOnViewportChange";
import { useDismissibleLayer } from "../../ui/useDismissibleLayer";
import { useEscapeKey } from "../../ui/useEscapeKey";
import { useFocusFirstMenuitem } from "../../ui/useFocusFirstMenuitem";

export const historyGroups = ["今天", "昨天", "过去 7 天", "更早"] as const;

export type HistoryMenuState = { id: string; left: number; top: number; panel: "actions" | "move" };
export type ProjectMenuState = { id: string; left: number; top: number };
export type ProjectEditorState = {
  mode: "create" | "rename";
  projectId?: string;
  draft: string;
  moveConversationId?: string;
};

export function useSidebarController() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    activeDialog,
    setActiveDialog,
    authenticated,
    user,
    login,
    register,
    logout,
    pinnedConversationIds,
    togglePinnedConversation,
    conversations,
    renameConversation,
    chatProjects,
    addChatProject,
    renameChatProject,
    deleteChatProject,
    moveConversationToProject,
    notify,
  } = usePrototype();

  const [historyQuery, setHistoryQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [authDialog, setAuthDialog] = useState<"login" | "register" | null>(null);
  const [historyMenu, setHistoryMenu] = useState<HistoryMenuState | null>(null);
  const [projectMenu, setProjectMenu] = useState<ProjectMenuState | null>(null);
  const [expandedProjectIds, setExpandedProjectIds] = useState<string[]>(["proj-reits"]);
  const [renameTarget, setRenameTarget] = useState<Conversation | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [projectEditor, setProjectEditor] = useState<ProjectEditorState | null>(null);
  const [deleteProjectTarget, setDeleteProjectTarget] = useState<ChatProject | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const [isDrawer, setIsDrawer] = useState(false);

  useEffect(() => {
    // Match CSS drawer breakpoint: icon-rail collapse stays available until true mobile.
    const query = window.matchMedia("(max-width: 860px)");
    const sync = () => setIsDrawer(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    const main = document.querySelector<HTMLElement>(".main");
    const topbar = document.querySelector<HTMLElement>(".topbar");
    if (!isDrawer) {
      sidebar?.removeAttribute("inert");
      sidebar?.removeAttribute("aria-hidden");
      return;
    }
    if (!mobileSidebarOpen) {
      sidebar?.setAttribute("inert", "");
      sidebar?.setAttribute("aria-hidden", "true");
      return () => {
        sidebar?.removeAttribute("inert");
        sidebar?.removeAttribute("aria-hidden");
      };
    }
    sidebar?.removeAttribute("inert");
    sidebar?.removeAttribute("aria-hidden");
    main?.setAttribute("inert", "");
    topbar?.setAttribute("inert", "");
    focusableElements(sidebar ?? document.body)[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileSidebarOpen(false);
        return;
      }
      if (sidebar) trapTab(event, sidebar);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      main?.removeAttribute("inert");
      topbar?.removeAttribute("inert");
      document.querySelector<HTMLElement>(".mobile-menu-button")?.focus();
    };
  }, [isDrawer, mobileSidebarOpen, setMobileSidebarOpen]);

  const historyMenuRef = useRef<HTMLDivElement>(null);
  const projectMenuRef = useRef<HTMLDivElement>(null);

  const closeContextMenus = () => {
    setHistoryMenu(null);
    setProjectMenu(null);
  };
  // Legacy used window `click` + menu/trigger stopPropagation; keep click so toggle is not raced.
  useDismissibleLayer(Boolean(historyMenu || projectMenu), closeContextMenus, [historyMenuRef, projectMenuRef], {
    event: "click",
  });
  useEscapeKey(Boolean(historyMenu || projectMenu), closeContextMenus);
  useCloseOnViewportChange(Boolean(historyMenu || projectMenu), closeContextMenus);
  useFocusFirstMenuitem(historyMenuRef, Boolean(historyMenu));
  useFocusFirstMenuitem(projectMenuRef, Boolean(projectMenu));

  const filteredConversations = useMemo(
    () => conversations.filter((item) => `${item.title}${item.preview}`.includes(historyQuery)),
    [conversations, historyQuery],
  );
  const pinnedConversations = filteredConversations.filter((item) => pinnedConversationIds.includes(item.id));
  const unfiledConversations = filteredConversations.filter(
    (item) => !pinnedConversationIds.includes(item.id) && !item.projectId,
  );
  const conversationsInProject = (projectId: string) =>
    filteredConversations.filter((item) => item.projectId === projectId);

  const flashSidebarPress = (event: ReactPointerEvent<HTMLElement>) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(".nav-item, .history-item__open");
    if (!target || !event.currentTarget.contains(target)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.getAnimations().forEach((animation) => {
      const effect = animation.effect;
      if (effect instanceof KeyframeEffect && effect.target === target && effect.pseudoElement === "::before") animation.cancel();
    });
    target.animate(
      [
        { backgroundSize: "6% 100%", opacity: 1 },
        { backgroundSize: "72% 100%", opacity: 1, offset: 0.46 },
        { backgroundSize: "172% 100%", opacity: 1, offset: 0.78 },
        { backgroundSize: "172% 100%", opacity: 0 },
      ],
      { duration: 500, easing: "linear", pseudoElement: "::before" },
    );
  };

  const closeMobile = () => setMobileSidebarOpen(false);
  const openConversation = (id: string) => {
    setActiveDialog(null);
    setHistoryMenu(null);
    closeMobile();
    navigate(`/chat/${id}`);
  };
  const startNewConversation = () => {
    setActiveDialog(null);
    closeMobile();
    navigate("/chat");
  };

  const placeMenu = (clientX: number, clientY: number, width: number, height: number) => ({
    left: Math.min(clientX, window.innerWidth - width - 8),
    top: Math.min(clientY, window.innerHeight - height - 8),
  });

  const openHistoryMenu = (event: ReactMouseEvent, item: Conversation) => {
    event.preventDefault();
    event.stopPropagation();
    setProjectMenu(null);
    const pos = placeMenu(event.clientX, event.clientY, 200, 220);
    setHistoryMenu({ id: item.id, ...pos, panel: "actions" });
  };

  const openHistoryMenuFromButton = (event: ReactMouseEvent<HTMLButtonElement>, item: Conversation) => {
    event.preventDefault();
    event.stopPropagation();
    setProjectMenu(null);
    if (historyMenu?.id === item.id) {
      setHistoryMenu(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const pos = placeMenu(rect.right - 200, rect.bottom + 4, 200, 220);
    setHistoryMenu({ id: item.id, ...pos, panel: "actions" });
  };

  const openProjectMenu = (event: ReactMouseEvent, project: ChatProject) => {
    event.preventDefault();
    event.stopPropagation();
    setHistoryMenu(null);
    const pos = placeMenu(event.clientX, event.clientY, 200, 140);
    setProjectMenu({ id: project.id, ...pos });
  };

  const openProjectMenuFromButton = (event: ReactMouseEvent<HTMLButtonElement>, project: ChatProject) => {
    event.preventDefault();
    event.stopPropagation();
    setHistoryMenu(null);
    if (projectMenu?.id === project.id) {
      setProjectMenu(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const pos = placeMenu(rect.right - 200, rect.bottom + 4, 200, 140);
    setProjectMenu({ id: project.id, ...pos });
  };

  const toggleProjectExpanded = (projectId: string) => {
    setExpandedProjectIds((ids) => (
      ids.includes(projectId) ? ids.filter((id) => id !== projectId) : [...ids, projectId]
    ));
  };

  const beginRename = (item: Conversation) => {
    setHistoryMenu(null);
    setRenameTarget(item);
    setRenameDraft(item.title);
  };

  const submitRename = (event: FormEvent) => {
    event.preventDefault();
    if (!renameTarget || !renameDraft.trim()) return;
    renameConversation(renameTarget.id, renameDraft.trim());
    notify("对话已重命名", "success");
    setRenameTarget(null);
  };

  const openCreateProject = (moveConversationId?: string) => {
    setHistoryMenu(null);
    setProjectMenu(null);
    setProjectEditor({
      mode: "create",
      draft: "",
      ...(moveConversationId ? { moveConversationId } : {}),
    });
  };

  const openRenameProject = (project: ChatProject) => {
    setProjectMenu(null);
    setProjectEditor({ mode: "rename", projectId: project.id, draft: project.name });
  };

  const submitProjectEditor = (event: FormEvent) => {
    event.preventDefault();
    if (!projectEditor || !projectEditor.draft.trim()) return;
    const name = projectEditor.draft.trim();
    if (projectEditor.mode === "create") {
      const id = addChatProject(name);
      setExpandedProjectIds((ids) => (ids.includes(id) ? ids : [id, ...ids]));
      if (projectEditor.moveConversationId) {
        moveConversationToProject(projectEditor.moveConversationId, id);
        notify(`已移入「${name}」`, "success");
      } else {
        notify("项目已创建", "success");
      }
    } else if (projectEditor.projectId) {
      renameChatProject(projectEditor.projectId, name);
      notify("项目已重命名", "success");
    }
    setProjectEditor(null);
  };

  const handleCollapseClick = () => {
    if (isDrawer) {
      setMobileSidebarOpen(false);
      return;
    }
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const collapseAriaLabel = isDrawer ? "关闭导航" : sidebarCollapsed ? "展开导航栏" : "收起导航栏";

  return {
    navigate,
    location,
    sidebarRef,
    sidebarCollapsed,
    mobileSidebarOpen,
    activeDialog,
    setActiveDialog,
    authenticated,
    user,
    login,
    register,
    logout,
    pinnedConversationIds,
    togglePinnedConversation,
    conversations,
    chatProjects,
    deleteChatProject,
    moveConversationToProject,
    notify,
    historyQuery,
    setHistoryQuery,
    accountOpen,
    setAccountOpen,
    logoutOpen,
    setLogoutOpen,
    authDialog,
    setAuthDialog,
    historyMenu,
    setHistoryMenu,
    projectMenu,
    setProjectMenu,
    expandedProjectIds,
    setExpandedProjectIds,
    renameTarget,
    setRenameTarget,
    renameDraft,
    setRenameDraft,
    projectEditor,
    setProjectEditor,
    deleteProjectTarget,
    setDeleteProjectTarget,
    isDrawer,
    historyMenuRef,
    projectMenuRef,
    pinnedConversations,
    unfiledConversations,
    conversationsInProject,
    flashSidebarPress,
    closeMobile,
    openConversation,
    startNewConversation,
    openHistoryMenu,
    openHistoryMenuFromButton,
    openProjectMenu,
    openProjectMenuFromButton,
    toggleProjectExpanded,
    beginRename,
    submitRename,
    openCreateProject,
    openRenameProject,
    submitProjectEditor,
    handleCollapseClick,
    collapseAriaLabel,
    setSidebarCollapsed,
  };
}

export type SidebarController = ReturnType<typeof useSidebarController>;
