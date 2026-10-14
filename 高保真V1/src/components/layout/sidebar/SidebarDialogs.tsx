import { LoginDialog } from "../../account/LoginDialog";
import { RegisterDialog } from "../../account/RegisterDialog";
import { ConfirmDialog, Modal } from "../../ui/Modal";
import type { SidebarController } from "./useSidebarController";

type Props = Pick<
  SidebarController,
  | "renameTarget"
  | "setRenameTarget"
  | "renameDraft"
  | "setRenameDraft"
  | "submitRename"
  | "projectEditor"
  | "setProjectEditor"
  | "submitProjectEditor"
  | "deleteProjectTarget"
  | "setDeleteProjectTarget"
  | "deleteChatProject"
  | "setExpandedProjectIds"
  | "notify"
  | "logoutOpen"
  | "setLogoutOpen"
  | "navigate"
  | "authDialog"
  | "setAuthDialog"
  | "login"
  | "register"
  | "logout"
>;

export function SidebarDialogs(props: Props) {
  const {
    renameTarget,
    setRenameTarget,
    renameDraft,
    setRenameDraft,
    submitRename,
    projectEditor,
    setProjectEditor,
    submitProjectEditor,
    deleteProjectTarget,
    setDeleteProjectTarget,
    deleteChatProject,
    setExpandedProjectIds,
    notify,
    logoutOpen,
    setLogoutOpen,
    navigate,
    authDialog,
    setAuthDialog,
    login,
    register,
    logout,
  } = props;

  return (
    <>
      {renameTarget && <Modal title="重命名对话" size="sm" onClose={() => setRenameTarget(null)} footer={<><button className="button" onClick={() => setRenameTarget(null)}>取消</button><button className="button button--primary" type="submit" form="rename-conversation-form" disabled={!renameDraft.trim()}>保存</button></>}><form id="rename-conversation-form" className="form-stack" onSubmit={submitRename}><label>对话名称<input autoFocus value={renameDraft} onChange={(event) => setRenameDraft(event.target.value)} maxLength={40} /></label><small>{renameDraft.trim().length}/40</small></form></Modal>}
      {projectEditor && (
        <Modal
          title={projectEditor.mode === "create" ? "新建项目" : "重命名项目"}
          size="sm"
          onClose={() => setProjectEditor(null)}
          footer={(
            <>
              <button className="button" onClick={() => setProjectEditor(null)}>取消</button>
              <button className="button button--primary" type="submit" form="chat-project-form" disabled={!projectEditor.draft.trim()}>
                {projectEditor.mode === "create" ? "创建" : "保存"}
              </button>
            </>
          )}
        >
          <form id="chat-project-form" className="form-stack" onSubmit={submitProjectEditor}>
            <label>
              项目名称
              <input
                autoFocus
                value={projectEditor.draft}
                onChange={(event) => setProjectEditor({ ...projectEditor, draft: event.target.value })}
                maxLength={40}
                placeholder="例如：葱花创投研究"
              />
            </label>
            <small>{projectEditor.draft.trim().length}/40</small>
          </form>
        </Modal>
      )}
      {deleteProjectTarget && (
        <ConfirmDialog
          title="删除项目"
          message={`确定删除「${deleteProjectTarget.name}」吗？项目内的对话会回到下方未归档历史，不会被删除。`}
          confirmText="删除项目"
          onClose={() => setDeleteProjectTarget(null)}
          onConfirm={() => {
            deleteChatProject(deleteProjectTarget.id);
            setExpandedProjectIds((ids) => ids.filter((id) => id !== deleteProjectTarget.id));
            setDeleteProjectTarget(null);
            notify("项目已删除", "success");
          }}
        />
      )}
      {authDialog === "login" && (
        <LoginDialog
          onClose={() => setAuthDialog(null)}
          onSwitchToRegister={() => setAuthDialog("register")}
          onSubmit={(input) => {
            try {
              login(input);
              setAuthDialog(null);
              notify("登录成功", "success");
            } catch (error) {
              notify(error instanceof Error ? error.message : "登录失败");
            }
          }}
        />
      )}
      {authDialog === "register" && (
        <RegisterDialog
          onClose={() => setAuthDialog(null)}
          onSwitchToLogin={() => setAuthDialog("login")}
          onSubmit={(input) => {
            try {
              register(input);
              setAuthDialog(null);
              notify("注册成功", "success");
            } catch (error) {
              notify(error instanceof Error ? error.message : "注册失败");
            }
          }}
        />
      )}
      {logoutOpen && (
        <ConfirmDialog
          title="退出登录"
          message="确定退出当前测试账号吗？本原型不会清除任何真实数据，退出后历史与项目会暂时隐藏。"
          confirmText="退出登录"
          onClose={() => setLogoutOpen(false)}
          onConfirm={() => {
            logout();
            setLogoutOpen(false);
            notify("已退出登录");
            navigate("/chat");
          }}
        />
      )}
    </>
  );
}
