import { MenuIcon } from "../../ui/MenuIcon";
import { Reveal } from "../../ui/Reveal";
import type { SidebarController } from "./useSidebarController";

type Props = Pick<
  SidebarController,
  | "historyMenuRef"
  | "historyMenu"
  | "conversations"
  | "pinnedConversationIds"
  | "chatProjects"
  | "moveConversationToProject"
  | "setExpandedProjectIds"
  | "setHistoryMenu"
  | "notify"
  | "openCreateProject"
  | "openConversation"
  | "beginRename"
  | "togglePinnedConversation"
>;

export function HistoryContextMenu(props: Props) {
  const {
    historyMenuRef,
    historyMenu,
    conversations,
    pinnedConversationIds,
    chatProjects,
    moveConversationToProject,
    setExpandedProjectIds,
    setHistoryMenu,
    notify,
    openCreateProject,
    openConversation,
    beginRename,
    togglePinnedConversation,
  } = props;

  return (
    <Reveal
      ref={historyMenuRef}
      open={Boolean(historyMenu && conversations.some((conversation) => conversation.id === historyMenu.id))}
      className={`history-context-menu${historyMenu?.panel === "move" ? " history-context-menu--tall" : ""}`}
      role="menu"
      aria-label={historyMenu ? `${conversations.find((conversation) => conversation.id === historyMenu.id)?.title ?? "对话"}操作` : "对话操作"}
      style={historyMenu ? { left: historyMenu.left, top: historyMenu.top } : undefined}
      onClick={(event) => event.stopPropagation()}
    >
      {historyMenu && (() => {
        const item = conversations.find((conversation) => conversation.id === historyMenu.id);
        if (!item) return null;
        const pinned = pinnedConversationIds.includes(item.id);
        if (historyMenu.panel === "move") {
          return <>
            <button type="button" role="menuitem" onClick={() => setHistoryMenu({ ...historyMenu, panel: "actions" })}><span>← 返回</span></button>
            {chatProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                role="menuitem"
                disabled={item.projectId === project.id}
                onClick={() => {
                  moveConversationToProject(item.id, project.id);
                  setExpandedProjectIds((ids) => (ids.includes(project.id) ? ids : [...ids, project.id]));
                  setHistoryMenu(null);
                  notify(`已移入「${project.name}」`, "success");
                }}
              >
                <MenuIcon name="folder" /><span>{project.name}</span>
              </button>
            ))}
            <button type="button" role="menuitem" onClick={() => openCreateProject(item.id)}><MenuIcon name="folder-plus" /><span>新建项目并移入</span></button>
          </>;
        }
        return <>
          <button type="button" role="menuitem" onClick={() => openConversation(item.id)}><MenuIcon name="external-link" /><span>打开对话</span></button>
          <button type="button" role="menuitem" onClick={() => beginRename(item)}><MenuIcon name="pencil" /><span>重命名</span></button>
          <button type="button" role="menuitem" onClick={() => { togglePinnedConversation(item.id); setHistoryMenu(null); }}><MenuIcon name="pin" /><span>{pinned ? "取消置顶" : "置顶对话"}</span></button>
          <button type="button" role="menuitem" onClick={() => setHistoryMenu({ ...historyMenu, panel: "move" })}><MenuIcon name="folder" /><span>移入项目</span></button>
          {item.projectId ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                moveConversationToProject(item.id, null);
                setHistoryMenu(null);
                notify("已移出项目", "success");
              }}
            >
              <MenuIcon name="folder" /><span>移出项目</span>
            </button>
          ) : null}
        </>;
      })()}
    </Reveal>
  );
}
