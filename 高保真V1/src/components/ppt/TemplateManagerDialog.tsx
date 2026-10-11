import { useState, type KeyboardEvent, type MouseEvent } from "react";
import { usePrototype } from "../../app/PrototypeContext";
import { getTemplateForPreview, officialTemplates, templateCoverUrls } from "../../data/mock";
import type { PptTemplate } from "../../types";
import { MenuIcon } from "../ui/MenuIcon";
import { ConfirmDialog, Modal } from "../ui/Modal";
import { TemplateCover } from "./TemplateCover";
import { TemplatePreviewDialog } from "./TemplatePreviewDialog";

export function TemplateManagerDialog({ onClose }: { onClose: () => void }) {
  const {
    favoriteTemplateIds,
    toggleFavoriteTemplate,
    customTemplates,
    addCustomTemplate,
    deleteCustomTemplate,
    notify,
  } = usePrototype();
  const [tab, setTab] = useState<"official" | "mine">("official");
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    | { kind: "delete-custom"; name: string }
    | { kind: "unfavorite"; id: string; name: string }
    | null
  >(null);
  const [previewTemplate, setPreviewTemplate] = useState<PptTemplate | null>(null);
  const favoriteOfficialTemplates = officialTemplates.filter((item) => favoriteTemplateIds.includes(item.id));
  const normalizedQuery = query.trim();
  const visibleOfficialTemplates = officialTemplates.filter((item) => (
    !normalizedQuery || `${item.name}${item.category}`.includes(normalizedQuery)
  ));

  const selectCard = (key: string) => setSelectedKey(key);
  const clearSelection = () => setSelectedKey(null);

  const openOfficialPreview = (id: string) => {
    const template = getTemplateForPreview({ kind: "official", id });
    if (template) setPreviewTemplate(template);
  };

  const openCustomPreview = (name: string) => {
    const template = getTemplateForPreview({ kind: "custom", name });
    if (template) setPreviewTemplate(template);
  };

  const requestUnfavorite = (id: string, name: string) => {
    setConfirmAction({ kind: "unfavorite", id, name });
  };

  const stopCardSelect = (event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
  };

  const onCardActivate = (event: MouseEvent, key: string) => {
    event.stopPropagation();
    selectCard(key);
  };

  return (
    <>
      <Modal title="管理 PPT 模板" size="lg" variant="template-manager" onClose={onClose} footer={<button className="button" onClick={onClose}>完成</button>}>
        <div className="template-tabs" role="tablist" aria-label="模板管理分类" onClick={clearSelection}>
          <button role="tab" aria-selected={tab === "official"} className={tab === "official" ? "tab tab--active" : "tab"} onClick={() => setTab("official")}>官方模板库</button>
          <button role="tab" aria-selected={tab === "mine"} className={tab === "mine" ? "tab tab--active" : "tab"} onClick={() => setTab("mine")}>我的模板 <span>{customTemplates.length + favoriteOfficialTemplates.length}</span></button>
        </div>

        {tab === "official" && (
          <section className="template-tab-panel" role="tabpanel" onClick={clearSelection}>
            <div className="dialog-page-header dialog-page-header--template">
              <p className="muted">浏览、预览官方模板，或收藏到“我的模板”。创建 PPT 时再选择要使用的模板。</p>
              <input
                className="template-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onClick={stopCardSelect}
                placeholder="搜索官方模板"
                aria-label="搜索官方模板"
              />
            </div>
            {visibleOfficialTemplates.length ? (
              <div className="template-library-grid">
                {visibleOfficialTemplates.map((item) => {
                  const favorite = favoriteTemplateIds.includes(item.id);
                  const key = `official:${item.id}`;
                  const selected = selectedKey === key;
                  return (
                    <article
                      className={`template-library-card${selected ? " template-library-card--selected" : ""}`}
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selected}
                      aria-label={`${item.name}${selected ? "，已选中" : ""}`}
                      onClick={(event) => onCardActivate(event, key)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          selectCard(key);
                        }
                      }}
                    >
                      <TemplateCover
                        ratio={item.ratio}
                        label={item.category}
                        alt={`${item.name} 首页主题图`}
                        {...(item.coverUrl ? { coverUrl: item.coverUrl } : {})}
                      />
                      <div className="template-library-card__body">
                        <strong>{item.name}</strong>
                        <small>官方模板 · {item.category}</small>
                        <div className="button-row" onClick={stopCardSelect}>
                          <button type="button" className="button button--small" onClick={() => openOfficialPreview(item.id)}>预览</button>
                          <button
                            type="button"
                            className="button button--small"
                            aria-pressed={favorite}
                            onClick={() => {
                              if (favorite) {
                                requestUnfavorite(item.id, item.name);
                                return;
                              }
                              toggleFavoriteTemplate(item.id);
                              notify("已收藏到我的模板", "success");
                            }}
                          >
                            {favorite ? "★ 已收藏" : "☆ 收藏"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="template-empty">未找到匹配的官方模板，请调整搜索关键词。</div>
            )}
          </section>
        )}

        {tab === "mine" && (
          <section className="template-tab-panel" role="tabpanel" onClick={clearSelection}>
            <div className="dialog-page-header dialog-page-header--template">
              <p className="muted">管理自己上传的模板，并集中查看从官方模板库收藏的内容。</p>
              <div className="button-row"><span className="usage-chip">已上传 {customTemplates.length} / 上限 3</span><button className="button button--primary" disabled={customTemplates.length >= 3} onClick={() => { addCustomTemplate(); notify("模板已上传并进入解析", "success"); }}><MenuIcon name="upload" />上传自定义模板</button></div>
            </div>

            <div className="template-section-heading"><div><h3>我的模板</h3><small>集中管理上传与收藏的 PPT 模板。</small></div></div>
            <div className="template-library-grid">
              {customTemplates.map((item) => {
                const key = `custom:${item}`;
                const selected = selectedKey === key;
                return (
                  <article
                    className={`template-library-card${selected ? " template-library-card--selected" : ""}`}
                    key={item}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selected}
                    aria-label={`${item}${selected ? "，已选中" : ""}`}
                    onClick={(event) => onCardActivate(event, key)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        selectCard(key);
                      }
                    }}
                  >
                    <TemplateCover
                      ratio="16:9"
                      label="自定义"
                      alt={`${item} 首页主题图`}
                      {...(templateCoverUrls[item] ? { coverUrl: templateCoverUrls[item] } : {})}
                    />
                    <div className="template-library-card__body">
                      <strong>{item}</strong>
                      <small>我上传的模板 · 已解析</small>
                      <div className="button-row" onClick={stopCardSelect}>
                        <button type="button" className="button button--small" onClick={() => openCustomPreview(item)}>预览</button>
                        <button type="button" className="button button--small" onClick={() => setConfirmAction({ kind: "delete-custom", name: item })}>删除</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="template-section-heading"><div><h3>收藏的官方模板</h3><small>在官方模板库中收藏的模板会同步出现在这里。</small></div></div>
            {favoriteOfficialTemplates.length ? (
              <div className="template-library-grid">
                {favoriteOfficialTemplates.map((item) => {
                  const key = `favorite:${item.id}`;
                  const selected = selectedKey === key;
                  return (
                    <article
                      className={`template-library-card${selected ? " template-library-card--selected" : ""}`}
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selected}
                      aria-label={`${item.name}${selected ? "，已选中" : ""}`}
                      onClick={(event) => onCardActivate(event, key)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          selectCard(key);
                        }
                      }}
                    >
                      <TemplateCover
                        ratio={item.ratio}
                        label={item.category}
                        alt={`${item.name} 首页主题图`}
                        {...(item.coverUrl ? { coverUrl: item.coverUrl } : {})}
                      />
                      <div className="template-library-card__body">
                        <strong>{item.name}</strong>
                        <small>收藏的官方模板</small>
                        <div className="button-row" onClick={stopCardSelect}>
                          <button type="button" className="button button--small" onClick={() => openOfficialPreview(item.id)}>预览</button>
                          <button type="button" className="button button--small" onClick={() => requestUnfavorite(item.id, item.name)}>取消收藏</button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="template-empty">暂无收藏的官方模板，可前往“官方模板库”添加。</div>
            )}
          </section>
        )}
      </Modal>

      {confirmAction?.kind === "delete-custom" && (
        <ConfirmDialog
          title="删除自定义模板"
          message={`确定删除「${confirmAction.name}」吗？删除后不可恢复。`}
          confirmText="删除模板"
          danger
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            deleteCustomTemplate(confirmAction.name);
            if (selectedKey === `custom:${confirmAction.name}`) setSelectedKey(null);
            setConfirmAction(null);
            notify("自定义模板已删除", "success");
          }}
        />
      )}
      {confirmAction?.kind === "unfavorite" && (
        <ConfirmDialog
          title="取消收藏"
          message={`确定取消收藏「${confirmAction.name}」吗？取消后可在官方模板库重新收藏。`}
          confirmText="取消收藏"
          danger
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            toggleFavoriteTemplate(confirmAction.id);
            if (selectedKey === `favorite:${confirmAction.id}`) setSelectedKey(null);
            setConfirmAction(null);
            notify("已取消收藏", "success");
          }}
        />
      )}
      {previewTemplate && (
        <TemplatePreviewDialog template={previewTemplate} onClose={() => setPreviewTemplate(null)} />
      )}
    </>
  );
}
