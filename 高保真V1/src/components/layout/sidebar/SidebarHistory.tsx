import type { Conversation } from "../../../types";
import { historyGroups } from "./useSidebarController";
import type { SidebarController } from "./useSidebarController";

type Props = Pick<
  SidebarController,
  | "historyQuery"
  | "setHistoryQuery"
  | "sidebarCollapsed"
  | "mobileSidebarOpen"
  | "pinnedConversations"
  | "chatProjects"
  | "expandedProjectIds"
  | "pinnedConversationIds"
  | "unfiledConversations"
  | "conversationsInProject"
  | "historyMenu"
  | "projectMenu"
  | "openCreateProject"
  | "toggleProjectExpanded"
  | "openProjectMenu"
  | "openProjectMenuFromButton"
  | "openHistoryMenu"
  | "openHistoryMenuFromButton"
  | "openConversation"
  | "togglePinnedConversation"
>;

export function SidebarHistory(props: Props) {
  const {
    historyQuery,
    setHistoryQuery,
    sidebarCollapsed,
    mobileSidebarOpen,
    pinnedConversations,
    chatProjects,
    expandedProjectIds,
    pinnedConversationIds,
    unfiledConversations,
    conversationsInProject,
    historyMenu,
    projectMenu,
    openCreateProject,
    toggleProjectExpanded,
    openProjectMenu,
    openProjectMenuFromButton,
    openHistoryMenu,
    openHistoryMenuFromButton,
    openConversation,
    togglePinnedConversation,
  } = props;

  const historyItem = (item: Conversation, pinned: boolean, nested = false) => (
    <div className={`history-item${nested ? " history-item--nested" : ""}`} key={item.id} onContextMenu={(event) => openHistoryMenu(event, item)}>
      <button className="history-item__open" onClick={() => openConversation(item.id)} title={item.title}>
        <strong>{item.title}</strong>
      </button>
      <div className="history-item__actions">
        <button
          type="button"
          className="history-item__more"
          aria-haspopup="menu"
          aria-expanded={historyMenu?.id === item.id}
          aria-label={`${item.title}更多操作`}
          title="更多操作"
          onClick={(event) => openHistoryMenuFromButton(event, item)}
        >
          <svg className="history-more-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="5" cy="12" r="1.75" />
            <circle cx="12" cy="12" r="1.75" />
            <circle cx="19" cy="12" r="1.75" />
          </svg>
        </button>
        <button className={`history-item__pin ${pinned ? "history-item__pin--active" : ""}`} onClick={() => togglePinnedConversation(item.id)} aria-label={pinned ? `取消置顶${item.title}` : `置顶${item.title}`} title={pinned ? "取消置顶" : "置顶"}><svg className="history-pin-icon" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M8.2 3.2h7.6c.75 0 1.25.5 1.25 1.15V9c0 .5.18.9.58 1.28l1.12 1.05c.4.38.65.72.65 1.22 0 .82-.62 1.4-1.5 1.4h-4.95V20.7c0 .55-.42.95-.95.95s-.95-.4-.95-.95v-6.75H6.15c-.88 0-1.5-.58-1.5-1.4 0-.5.25-.84.65-1.22l1.12-1.05c.4-.38.58-.78.58-1.28V4.35c0-.65.5-1.15 1.2-1.15zm2.15 2.15c-.28 0-.5.22-.5.5V9.1c0 .72-.28 1.25-.82 1.78l-.38.36h6.7l-.38-.36c-.54-.53-.82-1.06-.82-1.78V5.85c0-.28-.22-.5-.5-.5H10.35z" /></svg></button>
      </div>
    </div>
  );

  const folderIcon = (expanded: boolean) => (
    <svg className={`history-folder-icon${expanded ? " history-folder-icon--open" : ""}`} viewBox="0 0 24 24" aria-hidden="true">
      {expanded ? (
        // Open folder — front flap angled down (matches Codex expanded state).
        <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6A2 2 0 0 1 18.44 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
      ) : (
        // Closed folder — tab + flat front pocket line.
        <>
          <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9l-.81-1.2A2 2 0 0 0 8.1 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z" />
          <path d="M2 10h20" />
        </>
      )}
    </svg>
  );

  return (
    <section className="sidebar-history" aria-label="常驻历史聊天" inert={sidebarCollapsed && !mobileSidebarOpen ? true : undefined}>
        <label className="sidebar-search"><span className="sr-only">搜索历史</span><input value={historyQuery} onChange={(event) => setHistoryQuery(event.target.value)} placeholder="搜索历史聊天" /></label>
        <div className="sidebar-history__scroll">
          <div className="history-section">
            <div className="history-section__title"><strong>置顶的聊天</strong><span data-digits={String(pinnedConversations.length).length}>{pinnedConversations.length}</span></div>
            {pinnedConversations.length ? pinnedConversations.map((item) => historyItem(item, true)) : <small className="history-empty">暂无置顶聊天</small>}
          </div>

          <div className="history-section">
            <div className="history-section__title">
              <strong>项目</strong>
              <button
                type="button"
                className="history-section__action"
                onClick={() => openCreateProject()}
                aria-label="新建项目"
                title="新建项目"
              >
                ＋
              </button>
            </div>
            {chatProjects.length ? chatProjects.map((project) => {
              const members = conversationsInProject(project.id);
              const expanded = expandedProjectIds.includes(project.id);
              return (
                <div className="history-project" key={project.id}>
                  <div
                    className={`history-project__row${expanded ? " history-project__row--expanded" : ""}`}
                    onContextMenu={(event) => openProjectMenu(event, project)}
                  >
                    <button
                      type="button"
                      className="history-project__open"
                      onClick={() => toggleProjectExpanded(project.id)}
                      aria-expanded={expanded}
                      title={project.name}
                    >
                      {folderIcon(expanded)}
                      <strong>{project.name}</strong>
                    </button>
                    <div className="history-item__actions">
                      <button
                        type="button"
                        className="history-item__more"
                        aria-haspopup="menu"
                        aria-expanded={projectMenu?.id === project.id}
                        aria-label={`${project.name}更多操作`}
                        title="更多操作"
                        onClick={(event) => openProjectMenuFromButton(event, project)}
                      >
                        <svg className="history-more-icon" viewBox="0 0 24 24" aria-hidden="true">
                          <circle cx="5" cy="12" r="1.75" />
                          <circle cx="12" cy="12" r="1.75" />
                          <circle cx="19" cy="12" r="1.75" />
                        </svg>
                      </button>
                      <span className="history-project__count" data-digits={String(members.length).length} aria-label={`${members.length} 个对话`}>{members.length}</span>
                    </div>
                  </div>
                  {expanded && (
                    <div className="history-project__children">
                      {members.length
                        ? members.map((item) => historyItem(item, pinnedConversationIds.includes(item.id), true))
                        : <small className="history-empty">将对话移入此项目</small>}
                    </div>
                  )}
                </div>
              );
            }) : <small className="history-empty">暂无项目，点击 ＋ 新建</small>}
          </div>

          <div className="history-section">
            <div className="history-section__title"><strong>历史聊天</strong></div>
            {historyGroups.map((group) => {
              const items = unfiledConversations.filter((item) => item.group === group);
              if (!items.length) return null;
              return <div className="history-group" key={group}><small>{group}</small>{items.map((item) => historyItem(item, false))}</div>;
            })}
            {!unfiledConversations.length && <small className="history-empty">暂无未归档聊天</small>}
          </div>
        </div>
      </section>
  );
}
