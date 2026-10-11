import { NavLink } from "react-router-dom";
import { NavIcon } from "./NavIcon";
import type { SidebarController } from "./useSidebarController";

type Props = Pick<
  SidebarController,
  "setActiveDialog" | "closeMobile" | "activeDialog" | "startNewConversation"
>;

export function SidebarNav({ setActiveDialog, closeMobile, activeDialog, startNewConversation }: Props) {
  return (
    <nav className="primary-nav" aria-label="主要功能">
      <NavLink className={({ isActive }) => isActive ? "nav-item nav-item--active" : "nav-item"} to="/tasks" onClick={() => { setActiveDialog(null); closeMobile(); }} title="定时任务"><NavIcon name="alarm-clock" /><span className="nav-item__label">定时任务</span></NavLink>
      <NavLink className={({ isActive }) => isActive ? "nav-item nav-item--active" : "nav-item"} to="/ppt" onClick={() => { setActiveDialog(null); closeMobile(); }} title="PPT 助手"><NavIcon name="presentation" /><span className="nav-item__label">PPT 助手</span></NavLink>
      <NavLink className={({ isActive }) => isActive ? "nav-item nav-item--active" : "nav-item"} to="/skills" onClick={() => { setActiveDialog(null); closeMobile(); }} title="我的技能"><NavIcon name="sparkles" /><span className="nav-item__label">我的技能</span></NavLink>
      <NavLink className={({ isActive }) => isActive ? "nav-item nav-item--active" : "nav-item"} to="/account" onClick={() => { setActiveDialog(null); closeMobile(); }} title="客户后台"><NavIcon name="layout-dashboard" /><span className="nav-item__label">客户后台</span></NavLink>
      <button className={activeDialog === "chart" ? "nav-item nav-item--active" : "nav-item"} onClick={() => { setActiveDialog("chart"); closeMobile(); }} title="自定义作图"><NavIcon name="chart-no-axes-combined" /><span className="nav-item__label">自定义作图</span></button>
      <div className="nav-divider" />
      <button className="nav-item nav-item--new" onClick={startNewConversation} title="新对话"><span>＋</span><span className="nav-item__label">新对话</span></button>
    </nav>
  );
}
