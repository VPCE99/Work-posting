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

const ACCOUNT_DISPLAY_NAME = "测试账号";
const ACCOUNT_AVATAR_LABEL = avatarInitials("用户");

type Props = Pick<
  SidebarController,
  | "accountOpen"
  | "setAccountOpen"
  | "setActiveDialog"
  | "closeMobile"
  | "navigate"
  | "location"
  | "notify"
  | "setLogoutOpen"
>;

export function SidebarAccount({
  accountOpen,
  setAccountOpen,
  setActiveDialog,
  closeMobile,
  navigate,
  location,
  notify,
  setLogoutOpen,
}: Props) {
  return (
    <div className="sidebar-account popover-anchor">
      <button type="button" className="sidebar-account__trigger" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen} aria-controls="sidebar-account-menu" title="账户信息">
        <span className="account-avatar" aria-hidden="true">{ACCOUNT_AVATAR_LABEL}</span>
        <span className="sidebar-account__copy"><strong>{ACCOUNT_DISPLAY_NAME}</strong><small>试用版</small></span>
        <span className="sidebar-account__more" aria-hidden="true">…</span>
      </button>
      <Reveal open={accountOpen} id="sidebar-account-menu" className="sidebar-account-menu" role="menu" aria-label="账户信息菜单">
        <strong>{ACCOUNT_DISPLAY_NAME}</strong><small>当前套餐：试用版</small><hr />
        <button type="button" role="menuitem" onClick={() => { setActiveDialog(null); setAccountOpen(false); closeMobile(); navigate("/account/plans", { state: { backgroundLocation: location.pathname } }); }}><span>账户与套餐</span><span aria-hidden="true">›</span></button>
        <button type="button" role="menuitem" onClick={() => { setActiveDialog("binding"); setAccountOpen(false); }}><span>绑定手机端</span><span aria-hidden="true">›</span></button>
        <button type="button" role="menuitem" onClick={() => { notify("当前暂无新的更新提醒"); setAccountOpen(false); }}><span>更新提醒</span></button>
        <button type="button" role="menuitem" onClick={() => { setLogoutOpen(true); setAccountOpen(false); }}><span>退出登录</span></button>
      </Reveal>
    </div>
  );
}
