import { Icon } from "./Icon";

export type MenuIconName = "file-text" | "presentation" | "image" | "pin" | "info" | "external-link" | "pencil" | "upload" | "refresh-cw" | "folder" | "folder-plus" | "trash" | "share" | "download";

export function MenuIcon({ name }: { name: MenuIconName }) {
  if (name === "presentation") return <Icon name="presentation" className="menu-item-icon" strokeWidth={1.8} />;
  if (name === "upload") return <Icon name="upload" className="menu-item-icon" strokeWidth={1.8} />;
  if (name === "refresh-cw") return <Icon name="refresh-cw" className="menu-item-icon" strokeWidth={1.8} />;

  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "image") return <svg className="menu-item-icon" {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></svg>;
  if (name === "pin") return <svg className="menu-item-icon" {...common}><path d="M12 17v5" /><path d="M5 17h14" /><path d="m7 17 1-7-3-3V5h14v2l-3 3 1 7" /></svg>;
  if (name === "info") return <svg className="menu-item-icon" {...common}><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></svg>;
  if (name === "external-link") return <svg className="menu-item-icon" {...common}><path d="M15 3h6v6" /><path d="m10 14 11-11" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>;
  if (name === "pencil") return <svg className="menu-item-icon" {...common}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg>;
  if (name === "folder") return <svg className="menu-item-icon" {...common}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9l-.81-1.2A2 2 0 0 0 8.1 2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" /></svg>;
  if (name === "folder-plus") return <svg className="menu-item-icon" {...common}><path d="M12 10v6" /><path d="M9 13h6" /><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9l-.81-1.2A2 2 0 0 0 8.1 2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" /></svg>;
  if (name === "trash") return <svg className="menu-item-icon" {...common}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>;
  if (name === "share") return <svg className="menu-item-icon" {...common}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.59 13.51 6.83 3.98" /><path d="m15.41 6.51-6.82 3.98" /></svg>;
  if (name === "download") return <svg className="menu-item-icon" {...common}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>;
  return <svg className="menu-item-icon" {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M8 13h8" /><path d="M8 17h8" /></svg>;
}
