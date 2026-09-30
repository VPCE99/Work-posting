export type MenuIconName = "file-text" | "presentation" | "image" | "pin" | "info" | "external-link" | "pencil" | "upload" | "refresh-cw";

export function MenuIcon({ name }: { name: MenuIconName }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "presentation") return <svg className="menu-item-icon" {...common}><path d="M2 3h20" /><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" /><path d="m7 21 5-5 5 5" /></svg>;
  if (name === "image") return <svg className="menu-item-icon" {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></svg>;
  if (name === "pin") return <svg className="menu-item-icon" {...common}><path d="M12 17v5" /><path d="M5 17h14" /><path d="m7 17 1-7-3-3V5h14v2l-3 3 1 7" /></svg>;
  if (name === "info") return <svg className="menu-item-icon" {...common}><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></svg>;
  if (name === "external-link") return <svg className="menu-item-icon" {...common}><path d="M15 3h6v6" /><path d="m10 14 11-11" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>;
  if (name === "pencil") return <svg className="menu-item-icon" {...common}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg>;
  if (name === "upload") return <svg className="menu-item-icon" {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M12 18v-6" /><path d="m9 15 3-3 3 3" /></svg>;
  if (name === "refresh-cw") return <svg className="menu-item-icon" {...common}><path d="M20 12a8 8 0 1 1-2.3-5.7L20 8" /><path d="M20 3v5h-5" /></svg>;
  return <svg className="menu-item-icon" {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M8 13h8" /><path d="M8 17h8" /></svg>;
}
