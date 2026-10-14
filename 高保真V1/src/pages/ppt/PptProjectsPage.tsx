import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrototype } from "../../app/PrototypeContext";
import { ImportPptDialog, NewPptDialog, TemplateManagerDialog } from "../../components/ppt/PptAssistantDialog";
import { ProjectCoverArt } from "../../components/ppt/ProjectCoverArt";
import { getProjectDeck } from "../../data/mock";
import { ConfirmDialog } from "../../components/ui/Modal";
import type { PptProject } from "../../types";
import { FavoriteStarIcon } from "../../components/ui/FavoriteStarIcon";
import { Icon } from "../../components/ui/Icon";

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
  const [deleting, setDeleting] = useState<PptProject | null>(null);

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
    <>
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
            <strong><Icon name="upload" strokeWidth={1.8} />导入现有 PPT</strong><span>上传 .pptx 并智能解析</span>
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
                onOpen={() => openEditor(project.id)}
                onToggleFavorite={() => {
                  updateProject(project.id, { favorite: !project.favorite });
                  notify(project.favorite ? "已取消收藏" : "已加入收藏夹", "success");
                }}
                onRename={(name) => {
                  updateProject(project.id, { name, updatedAt: "刚刚" });
                  notify("项目已重命名", "success");
                }}
                onDelete={() => setDeleting(project)}
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
    </>
  );
}

type ProjectCardProps = {
  project: PptProject;
  onOpen: () => void;
  onToggleFavorite: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
};

function ProjectCard({ project, onOpen, onToggleFavorite, onRename, onDelete }: ProjectCardProps) {
  const statusTone = project.status === "已保存" ? "success" : project.status === "解析中" ? "progress" : "danger";
  const deck = getProjectDeck(project.id);
  const coverTitle = deck?.slideTitles[0] ?? project.name;
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(project.name);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const skipNameCommit = useRef(false);
  const nameCommitLock = useRef(false);
  const openTimer = useRef<number | null>(null);

  useEffect(() => {
    setRenaming(false);
  }, [project.id]);

  useEffect(() => {
    if (!renaming) return;
    nameInputRef.current?.focus();
    nameInputRef.current?.select();
  }, [renaming]);

  useEffect(() => () => {
    if (openTimer.current !== null) window.clearTimeout(openTimer.current);
  }, []);

  const beginRename = () => {
    skipNameCommit.current = false;
    nameCommitLock.current = false;
    setNameDraft(project.name);
    setRenaming(true);
  };

  const commitRename = () => {
    if (nameCommitLock.current) return;
    nameCommitLock.current = true;
    const cancelled = skipNameCommit.current;
    skipNameCommit.current = false;
    const next = (nameInputRef.current?.value ?? nameDraft).trim();
    setRenaming(false);
    if (cancelled || !next || next === project.name) return;
    onRename(next);
  };

  const cancelRename = () => {
    skipNameCommit.current = true;
    setRenaming(false);
  };

  const openFromTitle = () => {
    if (openTimer.current !== null) window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(() => {
      openTimer.current = null;
      onOpen();
    }, 220);
  };

  const renameFromTitle = () => {
    if (openTimer.current !== null) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    beginRename();
  };

  return (
    <article className="ppt-project-item">
      <div className={`ppt-project-item__preview${deck ? " ppt-project-item__preview--cover" : ""}`}>
        <button className="ppt-project-item__preview-open" onClick={onOpen} aria-label={`打开 ${project.name}`}>
          {deck ? (
            <ProjectCoverArt
              layout={deck.coverLayout}
              title={coverTitle}
              subtitle={deck.coverSubtitle}
              variant="card"
            />
          ) : (
            <span>PPT</span>
          )}
          <small className="ppt-project-item__preview-pages">{project.pages} 页</small>
        </button>
      </div>
      <div className="ppt-project-item__info">
        {renaming ? (
          <form
            className="ppt-project-item__title-form"
            onSubmit={(event) => {
              event.preventDefault();
              commitRename();
            }}
          >
            <input
              ref={nameInputRef}
              className="ppt-project-item__title-input"
              value={nameDraft}
              maxLength={40}
              aria-label="项目名称"
              onChange={(event) => setNameDraft(event.target.value)}
              onBlur={commitRename}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  cancelRename();
                }
              }}
            />
          </form>
        ) : (
          <button type="button" className="ppt-project-item__title" title="双击重命名" onClick={openFromTitle} onDoubleClick={renameFromTitle}>
            {project.name}
          </button>
        )}
        <small className="ppt-project-item__source"><span className="ppt-project-item__grid-pages">{project.pages} 页 · </span><span className="ppt-project-item__source-label">来源：</span>{project.source}</small>
        <small><span className={`status status--${statusTone}`}>{project.status}</span></small>
      </div>
      <footer className="ppt-project-item__footer">
        <small>{project.updatedAt}</small>
        <button
          className={`ppt-project-item__favorite${project.favorite ? " ppt-project-item__favorite--on" : ""}`}
          type="button"
          aria-label={project.favorite ? `取消收藏 ${project.name}` : `收藏 ${project.name}`}
          aria-pressed={project.favorite}
          onClick={onToggleFavorite}
        >
          <FavoriteStarIcon />
        </button>
        <button className="icon-button ppt-project-item__delete" type="button" aria-label={`删除 ${project.name}`} onClick={onDelete}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        </button>
      </footer>
    </article>
  );
}
