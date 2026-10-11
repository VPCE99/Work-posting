import { Icon } from "../../ui/Icon";

export type NavIconName = "alarm-clock" | "presentation" | "sparkles" | "layout-dashboard" | "chart-no-axes-combined";

export function NavIcon({ name }: { name: NavIconName }) {
  if (name === "presentation") {
    return <Icon name="presentation" size={20} className="nav-icon" strokeWidth={2} />;
  }
  if (name === "chart-no-axes-combined") {
    return <Icon name="chart-no-axes-combined" size={20} className="nav-icon" strokeWidth={2} />;
  }
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "alarm-clock") return <svg className="nav-icon" {...common}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M5 3 2 6" /><path d="m22 6-3-3" /><path d="M6.38 18.7 4 21" /><path d="M17.64 18.67 20 21" /></svg>;
  if (name === "sparkles") return <svg className="nav-icon" {...common}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M3 5h4" /><path d="M19 17v4" /><path d="M17 19h4" /></svg>;
  return <svg className="nav-icon" {...common}><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>;
}
