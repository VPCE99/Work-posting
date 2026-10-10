import { Reveal } from "../../../components/ui/Reveal";
import { MenuIcon } from "../../../components/ui/MenuIcon";
import { LucideIcon } from "../icons/LucideIcon";
import type { SaveStatus } from "../model";

export function EditorHeader({
  projectName,
  saveStatus,
  savedLabel,
  actionsOpen,
  onToggleActions,
  onExit,
  onDataAction,
  onExport,
}: {
  projectName: string;
  saveStatus: SaveStatus;
  savedLabel: string;
  actionsOpen: boolean;
  onToggleActions: () => void;
  onExit: () => void;
  onDataAction: (kind: "parse" | "refresh" | "report") => void;
  onExport: () => void;
}) {
  const label =
    saveStatus === "dirty" ? "未保存的更改" :
    saveStatus === "saving" ? "保存中…" :
    saveStatus === "error" ? "保存失败" :
    savedLabel;

  const stateClass =
    saveStatus === "saving" || saveStatus === "dirty" ? `editor-save-state editor-save-state--${saveStatus === "dirty" ? "dirty" : "saving"}` :
    saveStatus === "error" ? "editor-save-state editor-save-state--error" :
    "editor-save-state";

  return (
    <header className="ppt-editor__topbar">
      <div className="ppt-editor__identity">
        <button className="button editor-exit-button" onClick={onExit}>
          <LucideIcon name="arrow-left" size={16} />
          <span>退出编辑</span>
        </button>
        <span className="editor-identity-divider" aria-hidden="true" />
        <strong className="editor-project-name">{projectName}</strong>
        <span className={stateClass}><i aria-hidden="true" /><span>{label}</span></span>
      </div>
      <div className="ppt-editor__top-actions">
        <div className="popover-anchor editor-file-menu-anchor">
          <button className="button editor-file-trigger" aria-haspopup="menu" aria-expanded={actionsOpen} onClick={onToggleActions}>
            <LucideIcon name="folder-open" size={15} />
            <span>文件与数据</span>
            <LucideIcon name="chevron-down" size={13} />
          </button>
          <Reveal open={actionsOpen} className="menu-popover editor-action-popover" role="group" aria-label="文件与数据操作">
            <button onClick={() => onDataAction("parse")}><MenuIcon name="upload" /><span><strong>上传并智能解析</strong><small>识别现有 PPT 的结构、版式与数据</small></span></button>
            <button onClick={() => onDataAction("refresh")}><MenuIcon name="refresh-cw" /><span><strong>刷新数据</strong><small>更新已识别的图表、表格和文字</small></span></button>
            <button onClick={() => onDataAction("report")}><MenuIcon name="file-text" /><span><strong>更新报告</strong><small>重新获取制作 PPT 所依据的报告</small></span></button>
          </Reveal>
        </div>
        <button className="button button--primary" onClick={onExport}>预览并生成</button>
      </div>
    </header>
  );
}
