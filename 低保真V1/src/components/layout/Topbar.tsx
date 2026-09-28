import { Link } from "react-router-dom";
import { usePrototype } from "../../app/PrototypeContext";

export function Topbar() {
  const { theme, toggleTheme, setMobileSidebarOpen } = usePrototype();

  return (
    <header className="topbar">
      <div className="topbar__brand"><button className="mobile-menu-button" onClick={() => setMobileSidebarOpen(true)} aria-label="打开导航">☰</button><Link to="/chat">ChopChat</Link><span>低保真 V1</span></div>
      <div className="topbar__actions">
        <span className="usage-chip">今日 12/50 次</span>
        <span className="usage-chip">Token 128K/1M</span>
        <button className="icon-button" onClick={toggleTheme} aria-label="切换深浅色" title="切换深浅色">{theme === "light" ? "◐" : "◑"}</button>
      </div>
    </header>
  );
}
