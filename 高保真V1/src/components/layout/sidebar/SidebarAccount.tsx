import { Reveal } from "../../ui/Reveal";
import type { SidebarController } from "./useSidebarController";

/** 头像内固定展示两个字：中文名取末两字，其它取前两字。 */
function avatarInitials(displayName: string) {
  const text = displayName.replace(/\s+/g, "");
  if (!text) return "用户";
  const cjk = text.match(/[\u4e00-\u9fff]/g)?.join("") ?? "";
  if (cjk.length >= 2) return cjk.slice(-2);
  if (cjk.length === 1) return `${cjk}用户`.slice(0, 2);
  return text.slice(0, 2).toUpperCase();
}

type Props = Pick<
  SidebarController,
  | "accountOpen"
  | "setAccountOpen"
  | "authenticated"
  | "user"
  | "setActiveDialog"
  | "closeMobile"
  | "navigate"
  | "location"
  | "notify"
  | "setLogoutOpen"
  | "setAuthDialog"
>;

export function SidebarAccount({
  accountOpen,
  setAccountOpen,
  authenticated,
  user,
  setActiveDialog,
  closeMobile,
  navigate,
  location,
  notify,
  setLogoutOpen,
  setAuthDialog,
}: Props) {
  const displayName = authenticated ? (user?.displayName ?? "测试账号") : "未登录";
  const planLabel = authenticated ? (user?.planLabel ?? "试用版") : "登录后同步账户内容";
  const avatarLabel = authenticated ? avatarInitials("用户") : "登录";

  return (
    <div className="sidebar-account popover-anchor">
      <button
        type="button"
        className="sidebar-account__trigger"
        onClick={() => setAccountOpen((open) => !open)}
        aria-expanded={accountOpen}
        aria-controls="sidebar-account-menu"
        title={authenticated ? "账户信息" : "登录或注册"}
      >
        <span className={`account-avatar${authenticated ? "" : " account-avatar--guest"}`} aria-hidden="true">{avatarLabel}</span>
        <span className="sidebar-account__copy"><strong>{displayName}</strong><small>{planLabel}</small></span>
        <span className="sidebar-account__more" aria-hidden="true">…</span>
      </button>
      <Reveal
        open={accountOpen}
        id="sidebar-account-menu"
        className={`sidebar-account-menu${authenticated ? "" : " sidebar-account-menu--guest"}`}
        role="menu"
        aria-label={authenticated ? "账户信息菜单" : "登录与注册菜单"}
      >
        {authenticated ? (
          <>
            <strong>{displayName}</strong>
            <small>当前套餐：{planLabel}</small>
            <hr />
            <button type="button" role="menuitem" onClick={() => { setActiveDialog(null); setAccountOpen(false); closeMobile(); navigate("/account/plans", { state: { backgroundLocation: location.pathname } }); }}><span>账户与套餐</span><span aria-hidden="true">›</span></button>
            <button type="button" role="menuitem" onClick={() => { setActiveDialog("binding"); setAccountOpen(false); }}><span>绑定手机端</span><span aria-hidden="true">›</span></button>
            <button type="button" role="menuitem" onClick={() => { notify("当前暂无新的更新提醒"); setAccountOpen(false); }}><span>更新提醒</span></button>
            <button type="button" role="menuitem" className="sidebar-account-menu__danger" onClick={() => { setLogoutOpen(true); setAccountOpen(false); }}><span>退出登录</span></button>
          </>
        ) : (
          <>
            <strong>欢迎使用 ChopChat</strong>
            <small>登录后同步历史聊天与项目</small>
            <hr />
            <button type="button" role="menuitem" onClick={() => { setAuthDialog("login"); setAccountOpen(false); }}><span>登录</span><span aria-hidden="true">›</span></button>
            <button type="button" role="menuitem" onClick={() => { setAuthDialog("register"); setAccountOpen(false); }}><span>注册</span><span aria-hidden="true">›</span></button>
          </>
        )}
      </Reveal>
    </div>
  );
}
