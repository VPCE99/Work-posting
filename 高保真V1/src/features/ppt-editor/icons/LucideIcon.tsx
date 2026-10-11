import { Icon, type IconName } from "../../../components/ui/Icon";

/** Lucide-style tool icons — static registry via shared Icon (no innerHTML). */
const lucideToIcon: Record<string, IconName> = {
  "mouse-pointer-2": "mouse-pointer-2",
  "layout-template": "layout-template",
  type: "type",
  "chart-column": "chart-column",
  "table-2": "table-2",
  image: "image",
  shapes: "shapes",
  palette: "palette",
  hand: "hand",
  "undo-2": "undo-2",
  "redo-2": "redo-2",
  "folder-open": "folder-open",
  "chevron-down": "chevron-down",
  "chevron-right": "chevron-right",
  "arrow-left": "arrow-left",
  minus: "minus",
  plus: "plus",
  "align-left": "align-left",
  "align-center": "align-center",
  "align-right": "align-right",
  // MenuIcon uses a simplified refresh glyph; Lucide keeps the full 4-path set.
  "refresh-cw": "refresh-cw-lucide",
  "chart-line": "chart-line",
  "chart-pie": "chart-pie",
  "chart-bar": "chart-bar",
  "chart-area": "chart-area",
  "chart-scatter": "chart-scatter",
};

export type LucideIconName = keyof typeof lucideToIcon;

export function LucideIcon({ name, size }: { name: LucideIconName; size: number }) {
  const iconName = lucideToIcon[name];
  if (!iconName) return null;
  return <Icon name={iconName} size={size} className="lucide-icon" strokeWidth={2} />;
}
