import { MenuIcon } from "../../ui/MenuIcon";
import { Reveal } from "../../ui/Reveal";
import type { SidebarController } from "./useSidebarController";

type Props = Pick<
  SidebarController,
  | "projectMenuRef"
  | "projectMenu"
  | "chatProjects"
  | "expandedProjectIds"
  | "toggleProjectExpanded"
  | "setProjectMenu"
  | "openRenameProject"
  | "setDeleteProjectTarget"
>;

export function ProjectContextMenu(props: Props) {
  const {
    projectMenuRef,
    projectMenu,
    chatProjects,
    expandedProjectIds,
    toggleProjectExpanded,
    setProjectMenu,
    openRenameProject,
    setDeleteProjectTarget,
  } = props;

  return (
    <Reveal
      ref={projectMenuRef}
      open={Boolean(projectMenu && chatProjects.some((project) => project.id === projectMenu.id))}
      className="history-context-menu"
      role="menu"
      aria-label={projectMenu ? `${chatProjects.find((project) => project.id === projectMenu.id)?.name ?? "项目"}操作` : "项目操作"}
      style={projectMenu ? { left: projectMenu.left, top: projectMenu.top } : undefined}
      onClick={(event) => event.stopPropagation()}
    >
      {projectMenu && (() => {
        const project = chatProjects.find((item) => item.id === projectMenu.id);
        if (!project) return null;
        return <>
          <button type="button" role="menuitem" onClick={() => { toggleProjectExpanded(project.id); setProjectMenu(null); }}><MenuIcon name="folder" /><span>{expandedProjectIds.includes(project.id) ? "收起项目" : "展开项目"}</span></button>
          <button type="button" role="menuitem" onClick={() => openRenameProject(project)}><MenuIcon name="pencil" /><span>重命名项目</span></button>
          <button type="button" role="menuitem" onClick={() => { setDeleteProjectTarget(project); setProjectMenu(null); }}><MenuIcon name="trash" /><span>删除项目</span></button>
        </>;
      })()}
    </Reveal>
  );
}
