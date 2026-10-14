import { HistoryContextMenu } from "./sidebar/HistoryContextMenu";
import { ProjectContextMenu } from "./sidebar/ProjectContextMenu";
import { SidebarAccount } from "./sidebar/SidebarAccount";
import { SidebarDialogs } from "./sidebar/SidebarDialogs";
import { SidebarHistory } from "./sidebar/SidebarHistory";
import { SidebarNav } from "./sidebar/SidebarNav";
import { useSidebarController } from "./sidebar/useSidebarController";

export function Sidebar() {
  const c = useSidebarController();

  return (
    <>
      <aside ref={c.sidebarRef} className={`sidebar ${c.sidebarCollapsed ? "sidebar--collapsed" : ""} ${c.mobileSidebarOpen ? "sidebar--mobile-open" : ""}`} onPointerDown={c.flashSidebarPress}>
        <div className="sidebar__heading">
          <strong className="sidebar__title">功能导航</strong>
          <button
            className="icon-button sidebar-collapse-button"
            onClick={c.handleCollapseClick}
            aria-label={c.collapseAriaLabel}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              {c.isDrawer || !c.sidebarCollapsed
                ? <><path d="m14 5-5 5 5 5" /><path d="m9 5-5 5 5 5" /></>
                : <><path d="m6 5 5 5-5 5" /><path d="m11 5 5 5-5 5" /></>}
            </svg>
          </button>
        </div>

        <SidebarNav
          setActiveDialog={c.setActiveDialog}
          closeMobile={c.closeMobile}
          activeDialog={c.activeDialog}
          startNewConversation={c.startNewConversation}
        />

        {c.authenticated ? (
          <SidebarHistory
            historyQuery={c.historyQuery}
            setHistoryQuery={c.setHistoryQuery}
            sidebarCollapsed={c.sidebarCollapsed}
            mobileSidebarOpen={c.mobileSidebarOpen}
            pinnedConversations={c.pinnedConversations}
            chatProjects={c.chatProjects}
            expandedProjectIds={c.expandedProjectIds}
            pinnedConversationIds={c.pinnedConversationIds}
            unfiledConversations={c.unfiledConversations}
            conversationsInProject={c.conversationsInProject}
            historyMenu={c.historyMenu}
            projectMenu={c.projectMenu}
            openCreateProject={c.openCreateProject}
            toggleProjectExpanded={c.toggleProjectExpanded}
            openProjectMenu={c.openProjectMenu}
            openProjectMenuFromButton={c.openProjectMenuFromButton}
            openHistoryMenu={c.openHistoryMenu}
            openHistoryMenuFromButton={c.openHistoryMenuFromButton}
            openConversation={c.openConversation}
            togglePinnedConversation={c.togglePinnedConversation}
          />
        ) : (
          <section
            className="sidebar-history sidebar-history--guest"
            aria-label="常驻历史聊天"
            inert={c.sidebarCollapsed && !c.mobileSidebarOpen ? true : undefined}
          >
            <div className="sidebar-history__scroll">
              <small className="history-empty">登录后可查看历史聊天与项目</small>
            </div>
          </section>
        )}

        <SidebarAccount
          accountOpen={c.accountOpen}
          setAccountOpen={c.setAccountOpen}
          authenticated={c.authenticated}
          user={c.user}
          setActiveDialog={c.setActiveDialog}
          closeMobile={c.closeMobile}
          navigate={c.navigate}
          location={c.location}
          notify={c.notify}
          setLogoutOpen={c.setLogoutOpen}
          setAuthDialog={c.setAuthDialog}
        />
      </aside>

      {c.mobileSidebarOpen && <button className="mobile-scrim" aria-label="关闭导航" onClick={c.closeMobile} />}
      <HistoryContextMenu
        historyMenuRef={c.historyMenuRef}
        historyMenu={c.historyMenu}
        conversations={c.conversations}
        pinnedConversationIds={c.pinnedConversationIds}
        chatProjects={c.chatProjects}
        moveConversationToProject={c.moveConversationToProject}
        setExpandedProjectIds={c.setExpandedProjectIds}
        setHistoryMenu={c.setHistoryMenu}
        notify={c.notify}
        openCreateProject={c.openCreateProject}
        openConversation={c.openConversation}
        beginRename={c.beginRename}
        togglePinnedConversation={c.togglePinnedConversation}
      />
      <ProjectContextMenu
        projectMenuRef={c.projectMenuRef}
        projectMenu={c.projectMenu}
        chatProjects={c.chatProjects}
        expandedProjectIds={c.expandedProjectIds}
        toggleProjectExpanded={c.toggleProjectExpanded}
        setProjectMenu={c.setProjectMenu}
        openRenameProject={c.openRenameProject}
        setDeleteProjectTarget={c.setDeleteProjectTarget}
      />
      <SidebarDialogs
        renameTarget={c.renameTarget}
        setRenameTarget={c.setRenameTarget}
        renameDraft={c.renameDraft}
        setRenameDraft={c.setRenameDraft}
        submitRename={c.submitRename}
        projectEditor={c.projectEditor}
        setProjectEditor={c.setProjectEditor}
        submitProjectEditor={c.submitProjectEditor}
        deleteProjectTarget={c.deleteProjectTarget}
        setDeleteProjectTarget={c.setDeleteProjectTarget}
        deleteChatProject={c.deleteChatProject}
        setExpandedProjectIds={c.setExpandedProjectIds}
        notify={c.notify}
        logoutOpen={c.logoutOpen}
        setLogoutOpen={c.setLogoutOpen}
        navigate={c.navigate}
        authDialog={c.authDialog}
        setAuthDialog={c.setAuthDialog}
        login={c.login}
        register={c.register}
        logout={c.logout}
      />
    </>
  );
}
