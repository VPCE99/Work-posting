import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrototype } from "../../app/PrototypeContext";
import { AppShell } from "../../components/layout/AppShell";
import { ImportPptDialog, NewPptDialog, TemplateManagerDialog } from "../../components/ppt/PptAssistantDialog";
import { ConfirmDialog } from "../../components/ui/Modal";
import type { PptProject } from "../../types";
import { FavoriteStarIcon } from "../../components/ui/FavoriteStarIcon";

type Filter = "全部" | "最近查看" | "收藏夹";
type ViewMode = "网格" | "列表";

export function PptProjectsPage() {
  const navigate = useNavigate();
  const { projects, updateProject, deleteProject, notify } = usePrototype();
  const [filter, setFilter] = useState<Filter>("全部");
  const [viewMode, setViewMode] = useState<ViewMode>("网格");
  const [query, setQuery] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [menuProjectId, setMenuProjectId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<PptProject | null>(null);

  useEffect(() => {
    if (!menuProjectId) return;
    const closeMenu = (event: PointerEvent) => {
      if (!(event.target as Element).closest(".project-menu-anchor")) setMenuProjectId(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuProjectId(null); };
    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuProjectId]);

  const visible = useMemo(() => projects.filter((project) => {
    const matchesFilter = filter === "全部"
      || (filter === "最近查看" && project.recentlyViewed)
      || (filter === "收藏夹" && project.favorite);
    return matchesFilter && project.name.includes(query.trim());
  }), [filter, projects, query]);

  const openEditor = (id: string) => {
    updateProject(id, { recentlyViewed: true, updatedAt: "刚刚" });
    navigate(`/ppt/${id}`);
  };

  return (
    <AppShell>
      <section className="page-stack ppt-library ppt-projects-page">
        <header className="page-header ppt-library__header">
          <div>
            <p className="eyebrow">内容创作</p>
            <h1>PPT 助手</h1>
            <p>新建、导入并集中管理 PPT 项目，历史聊天始终保留在左侧。</p>
          </div>
        </header>

        <div className="ppt-library__actions" aria-label="PPT 主要操作">
          <button className="action-tile action-tile--primary" onClick={() => setNewOpen(true)}>
            <strong>＋ 新建 PPT</strong><span>从空画布、对话或文件生成</span>
          </button>
          <button className="action-tile" onClick={() => setImportOpen(true)}>
            <strong><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M12 18v-6" /><path d="m9 15 3-3 3 3" /></svg>导入现有 PPT</strong><span>上传 .pptx 并智能解析</span>
          </button>
          <button className="action-tile" onClick={() => setTemplatesOpen(true)}>
            <strong><svg viewBox="0 0 24 24" aria-hidden="true"><rect width="18" height="7" x="3" y="3" rx="1.5" /><rect width="8" height="7" x="3" y="14" rx="1.5" /><rect width="6" height="7" x="15" y="14" rx="1.5" /></svg>模板管理</strong><span>系统模板与自定义模板</span>
          </button>
        </div>

        <div className="ppt-library__toolbar">
          <div className="tab-row" aria-label="项目筛选">
            {(["全部", "最近查看", "收藏夹"] as const).map((item) => (
              <button key={item} className={filter === item ? "tab tab--active" : "tab"} onClick={() => setFilter(item)}>
                {item}{item === "收藏夹" ? ` ${projects.filter((project) => project.favorite).length}` : ""}
              </button>
            ))}
          </div>
          <div className="ppt-library__tools">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索 PPT 项目" aria-label="搜索 PPT 项目" />
            <div className="segmented ppt-view-switch" aria-label="视图模式切换">
              <button className={viewMode === "网格" ? "segmented__active" : ""} onClick={() => setViewMode("网格")} aria-pressed={viewMode === "网格"}>
                <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="5" height="5" rx="0.8" /><rect x="9.5" y="1.5" width="5" height="5" rx="0.8" /><rect x="1.5" y="9.5" width="5" height="5" rx="0.8" /><rect x="9.5" y="9.5" width="5" height="5" rx="0.8" /></svg>
                <span>网格</span>
              </button>
              <button className={viewMode === "列表" ? "segmented__active" : ""} onClick={() => setViewMode("列表")} aria-pressed={viewMode === "列表"}>
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 3.5h12M2 8h12M2 12.5h12" /></svg>
                <span>列表</span>
              </button>
            </div>
          </div>
        </div>

        {visible.length ? (
          <div className={viewMode === "网格" ? "ppt-projects ppt-projects--grid" : "ppt-projects ppt-projects--list"}>
            {visible.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                menuOpen={menuProjectId === project.id}
                onOpen={() => openEditor(project.id)}
                onToggleMenu={() => setMenuProjectId((id) => id === project.id ? null : project.id)}
                onToggleFavorite={() => {
                  updateProject(project.id, { favorite: !project.favorite });
                  setMenuProjectId(null);
                  notify(project.favorite ? "已取消收藏" : "已加入收藏夹", "success");
                }}
                onRetry={() => {
                  updateProject(project.id, { status: "已保存", updatedAt: "刚刚" });
                  setMenuProjectId(null);
                  notify("已重新提交保存", "success");
                }}
                onRename={() => { setMenuProjectId(null); notify("重命名入口已触发"); }}
                onDelete={() => { setDeleting(project); setMenuProjectId(null); }}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state__mark">P</div>
            <h2>没有符合条件的 PPT</h2>
            <p>调整筛选或搜索关键词，也可以新建或导入项目。</p>
          </div>
        )}
      </section>

      {newOpen && <NewPptDialog onClose={() => setNewOpen(false)} onCreated={openEditor} />}
      {importOpen && <ImportPptDialog onClose={() => setImportOpen(false)} onImported={(id) => { setImportOpen(false); openEditor(id); }} />}
      {templatesOpen && <TemplateManagerDialog onClose={() => setTemplatesOpen(false)} />}
      {deleting && <ConfirmDialog title="删除 PPT 项目" message={`将永久删除“${deleting.name}”，此操作不可撤销。`} danger confirmText="确认删除" onClose={() => setDeleting(null)} onConfirm={() => { deleteProject(deleting.id); setDeleting(null); notify("项目已删除"); }} />}
    </AppShell>
  );
}

type ProjectCardProps = {
  project: PptProject;
  menuOpen: boolean;
  onOpen: () => void;
  onToggleMenu: () => void;
  onToggleFavorite: () => void;
  onRetry: () => void;
  onRename: () => void;
  onDelete: () => void;
};

function ProjectCard({ project, menuOpen, onOpen, onToggleMenu, onToggleFavorite, onRetry, onRename, onDelete }: ProjectCardProps) {
  const statusTone = project.status === "已保存" ? "success" : project.status === "解析中" ? "progress" : "danger";
  return (
    <article className="ppt-project-item">
      <div className="ppt-project-item__preview">
        <button className="ppt-project-item__preview-open" onClick={onOpen} aria-label={`打开 ${project.name}`}>
          <span>PPT</span>
          <small className="ppt-project-item__preview-pages">{project.pages} 页</small>
        </button>
        {project.favorite && (
          <button className="ppt-project-item__favorite" type="button" aria-label={`取消收藏 ${project.name}`} aria-pressed="true" onClick={onToggleFavorite}>
            <FavoriteStarIcon />
          </button>
        )}
      </div>
      <div className="ppt-project-item__info">
        <button className="ppt-project-item__title" onClick={onOpen}>{project.name}</button>
        <small className="ppt-project-item__source"><span className="ppt-project-item__grid-pages">{project.pages} 页 · </span><span className="ppt-project-item__source-label">来源：</span>{project.source}</small>
        <small><span className={`status status--${statusTone}`}>{project.status}</span></small>
      </div>
      <footer className="ppt-project-item__footer">
        <small>{project.updatedAt}</small>
        <div className="project-menu-anchor">
          <button className="icon-button ppt-project-item__more" onClick={onToggleMenu} aria-label={`${project.name} 更多操作`} aria-expanded={menuOpen}>
            <svg viewBox="0 0 18 4" aria-hidden="true">
              <circle cx="2" cy="2" r="1.5" />
              <circle cx="9" cy="2" r="1.5" />
              <circle cx="16" cy="2" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <div className="project-menu" role="menu">
              <button role="menuitem" onClick={onOpen}>打开</button>
              <button role="menuitem" onClick={onToggleFavorite}>{project.favorite ? "取消收藏" : "加入收藏夹"}</button>
              <button role="menuitem" onClick={onRename}>重命名</button>
              {project.status === "自动保存失败" && <button role="menuitem" onClick={onRetry}>重试保存</button>}
              <button role="menuitem" className="project-menu__danger" onClick={onDelete}>删除</button>
            </div>
          )}
        </div>
      </footer>
    </article>
  );
}
