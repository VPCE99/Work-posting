import { Link } from "react-router-dom";
import { usePrototype } from "../../app/PrototypeContext";
import { Brand } from "../ui/Brand";

export function Topbar() {
  const { theme, toggleTheme, setMobileSidebarOpen } = usePrototype();

  return (
    <header className="topbar">
      <div className="topbar__brand"><button className="mobile-menu-button" onClick={() => setMobileSidebarOpen(true)} aria-label="打开导航">☰</button><Link to="/chat"><Brand /></Link><span className="topbar__product-name">REITs Knowledge Agent</span></div>
      <div className="topbar__actions">
        <div className="usage-indicator usage-indicator--daily" aria-label="今日用量 12 / 50 次，刚刚更新">
          <strong>今日 12 / 50 次</strong>
          <span className="usage-indicator__track" aria-hidden="true"><i /></span>
          <small>刚刚更新</small>
        </div>
        <div className="usage-indicator usage-indicator--token" aria-label="Token 用量 128K / 1M，刚刚更新">
          <strong>Token 128K / 1M</strong>
          <span className="usage-indicator__track" aria-hidden="true"><i /></span>
          <small>刚刚更新</small>
        </div>
        <button className="theme-switch" onClick={toggleTheme} aria-label={theme === "light" ? "切换为深色模式" : "切换为浅色模式"} title="切换深浅色"><span aria-hidden="true">◐</span></button>
      </div>
    </header>
  );
}
