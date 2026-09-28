import { useEffect, useMemo, useState } from "react";
import type { FormEvent, MouseEvent as ReactMouseEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { usePrototype } from "../../app/PrototypeContext";
import type { Conversation } from "../../types";
import { ConfirmDialog, Modal } from "../ui/Modal";

const groups = ["今天", "昨天", "过去 7 天", "更早"] as const;

export function Sidebar() {
  const navigate = useNavigate();
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    activeDialog,
    setActiveDialog,
    pinnedConversationIds,
    togglePinnedConversation,
    conversations,
    renameConversation,
    notify,
  } = usePrototype();
  const [historyQuery, setHistoryQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [historyMenu, setHistoryMenu] = useState<{ id: string; left: number; top: number } | null>(null);
  const [renameTarget, setRenameTarget] = useState<Conversation | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  useEffect(() => {
    if (!historyMenu) return;
    const close = () => setHistoryMenu(null);
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("click", close);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", close);
    };
  }, [historyMenu]);

  const filteredConversations = useMemo(
    () => conversations.filter((item) => `${item.title}${item.preview}`.includes(historyQuery)),
    [conversations, historyQuery],
  );
  const pinnedConversations = filteredConversations.filter((item) => pinnedConversationIds.includes(item.id));

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

  const openHistoryMenu = (event: ReactMouseEvent, item: Conversation) => {
    event.preventDefault();
    const width = 190;
    const height = 132;
    setHistoryMenu({
      id: item.id,
      left: Math.min(event.clientX, window.innerWidth - width - 8),
      top: Math.min(event.clientY, window.innerHeight - height - 8),
    });
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

  const historyItem = (item: Conversation, pinned: boolean) => (
    <div className="history-item" key={item.id} onContextMenu={(event) => openHistoryMenu(event, item)}>
      <button className="history-item__open" onClick={() => openConversation(item.id)} title={item.preview}>
        <strong>{item.title}</strong><span>{item.preview}</span>
      </button>
      <button className={`history-item__pin ${pinned ? "history-item__pin--active" : ""}`} onClick={() => togglePinnedConversation(item.id)} aria-label={pinned ? `取消置顶${item.title}` : `置顶${item.title}`} title={pinned ? "取消置顶" : "置顶"}>⌖</button>
    </div>
  );

  return (
    <>
      <aside className={`sidebar ${sidebarCollapsed ? "sidebar--collapsed" : ""} ${mobileSidebarOpen ? "sidebar--mobile-open" : ""}`}>
        <div className="sidebar__heading">
          {!sidebarCollapsed && <strong>功能导航</strong>}
          <button className="icon-button" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label={sidebarCollapsed ? "展开导航栏" : "收起导航栏"}>{sidebarCollapsed ? "»" : "«"}</button>
        </div>

        <nav className="primary-nav" aria-label="主要功能">
          <NavLink className={({ isActive }) => isActive ? "nav-item nav-item--active" : "nav-item"} to="/tasks" onClick={() => { setActiveDialog(null); closeMobile(); }} title="定时任务"><span>◴</span>{!sidebarCollapsed && "定时任务"}</NavLink>
          <NavLink className={({ isActive }) => isActive ? "nav-item nav-item--active" : "nav-item"} to="/ppt" onClick={() => { setActiveDialog(null); closeMobile(); }} title="PPT 助手"><span>▤</span>{!sidebarCollapsed && "PPT 助手"}</NavLink>
          <NavLink className={({ isActive }) => isActive ? "nav-item nav-item--active" : "nav-item"} to="/skills" onClick={() => { setActiveDialog(null); closeMobile(); }} title="我的技能"><span>✦</span>{!sidebarCollapsed && "我的技能"}</NavLink>
          <NavLink className={({ isActive }) => isActive ? "nav-item nav-item--active" : "nav-item"} to="/account" onClick={() => { setActiveDialog(null); closeMobile(); }} title="客户后台"><span>▦</span>{!sidebarCollapsed && "客户后台"}</NavLink>
          <button className={activeDialog === "chart" ? "nav-item nav-item--active" : "nav-item"} onClick={() => { setActiveDialog("chart"); closeMobile(); }} title="自定义作图"><span>▥</span>{!sidebarCollapsed && "自定义作图"}</button>
          <div className="nav-divider" />
          <button className="nav-item nav-item--new" onClick={startNewConversation} title="新对话"><span>＋</span>{!sidebarCollapsed && "新对话"}</button>
        </nav>

        {!sidebarCollapsed && (
          <section className="sidebar-history" aria-label="常驻历史聊天">
            <label className="sidebar-search"><span className="sr-only">搜索历史</span><input value={historyQuery} onChange={(event) => setHistoryQuery(event.target.value)} placeholder="搜索历史聊天" /></label>
            <div className="sidebar-history__scroll">
              <div className="history-section">
                <div className="history-section__title"><strong>置顶的聊天</strong><span>{pinnedConversations.length}</span></div>
                {pinnedConversations.length ? pinnedConversations.map((item) => historyItem(item, true)) : <small className="history-empty">暂无置顶聊天</small>}
              </div>

              <div className="history-section">
                <div className="history-section__title"><strong>历史聊天</strong></div>
                {groups.map((group) => {
                  const items = filteredConversations.filter((item) => item.group === group && !pinnedConversationIds.includes(item.id));
                  if (!items.length) return null;
                  return <div className="history-group" key={group}><small>{group}</small>{items.map((item) => historyItem(item, false))}</div>;
                })}
              </div>
            </div>
          </section>
        )}

        <div className="sidebar-account popover-anchor">
          <button type="button" className="sidebar-account__trigger" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen} aria-controls="sidebar-account-menu" title="账户信息">
            <span className="account-avatar">C</span>
            {!sidebarCollapsed && <span><strong>测试账号</strong><small>试用版</small></span>}
            {!sidebarCollapsed && <span aria-hidden="true">…</span>}
          </button>
          {accountOpen && (
            <div id="sidebar-account-menu" className="sidebar-account-menu" role="menu" aria-label="账户信息菜单">
              <strong>测试账号</strong><small>当前套餐：试用版</small><hr />
              <button type="button" role="menuitem" onClick={() => { setActiveDialog("plans"); setAccountOpen(false); }}><span>账户与套餐</span><span aria-hidden="true">›</span></button>
              <button type="button" role="menuitem" onClick={() => { setActiveDialog("binding"); setAccountOpen(false); }}><span>绑定手机端</span><span aria-hidden="true">›</span></button>
              <button type="button" role="menuitem" onClick={() => { notify("当前暂无新的更新提醒"); setAccountOpen(false); }}><span>更新提醒</span></button>
              <button type="button" role="menuitem" onClick={() => { setLogoutOpen(true); setAccountOpen(false); }}><span>退出登录</span></button>
            </div>
          )}
        </div>
      </aside>

      {mobileSidebarOpen && <button className="mobile-scrim" aria-label="关闭导航" onClick={closeMobile} />}
      {historyMenu && (() => {
        const item = conversations.find((conversation) => conversation.id === historyMenu.id);
        if (!item) return null;
        const pinned = pinnedConversationIds.includes(item.id);
        return <div className="history-context-menu" role="menu" aria-label={`${item.title}操作`} style={{ left: historyMenu.left, top: historyMenu.top }} onClick={(event) => event.stopPropagation()}>
          <button type="button" role="menuitem" onClick={() => openConversation(item.id)}>打开对话</button>
          <button type="button" role="menuitem" onClick={() => beginRename(item)}>重命名</button>
          <button type="button" role="menuitem" onClick={() => { togglePinnedConversation(item.id); setHistoryMenu(null); }}>{pinned ? "取消置顶" : "置顶对话"}</button>
        </div>;
      })()}
      {renameTarget && <Modal title="重命名对话" size="sm" onClose={() => setRenameTarget(null)} footer={<><button className="button" onClick={() => setRenameTarget(null)}>取消</button><button className="button button--primary" type="submit" form="rename-conversation-form" disabled={!renameDraft.trim()}>保存</button></>}><form id="rename-conversation-form" className="form-stack" onSubmit={submitRename}><label>对话名称<input autoFocus value={renameDraft} onChange={(event) => setRenameDraft(event.target.value)} maxLength={40} /></label><small>{renameDraft.trim().length}/40</small></form></Modal>}
      {logoutOpen && <ConfirmDialog title="退出登录" message="确定退出当前测试账号吗？本原型不会清除任何真实数据。" confirmText="退出登录" onClose={() => setLogoutOpen(false)} onConfirm={() => { setLogoutOpen(false); navigate("/chat"); }} />}
    </>
  );
}
