import { useState, type FormEvent } from "react";
import { usePrototype } from "../../app/PrototypeContext";
import { Modal } from "../ui/Modal";

const officialTemplates = [
  { id: "official-finance", name: "专业财务汇报", category: "财务分析", ratio: "16:9" },
  { id: "official-research", name: "行业研究报告", category: "行业研究", ratio: "16:9" },
  { id: "official-minimal", name: "极简商务提案", category: "商业提案", ratio: "16:9" },
  { id: "official-data", name: "数据可视化月报", category: "数据报告", ratio: "16:9" },
  { id: "official-investment", name: "投资委员会汇报", category: "投资决策", ratio: "16:9" },
  { id: "official-dark", name: "深色科技发布", category: "产品发布", ratio: "16:9" },
];

export function NewPptDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const { addProject, customTemplates, favoriteTemplateIds, notify } = usePrototype();
  const [name, setName] = useState("");
  const [source, setSource] = useState<"空画布" | "从现有对话生成" | "导入文件">("空画布");
  const [sourceFile, setSourceFile] = useState("");
  const [templateTab, setTemplateTab] = useState<"official" | "mine">("official");
  const [template, setTemplate] = useState(officialTemplates[0].name);
  const [attempted, setAttempted] = useState(false);
  const favoriteOfficialTemplates = officialTemplates.filter((item) => favoriteTemplateIds.includes(item.id));

  const create = (event: FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    if (!name.trim() || (source === "导入文件" && !sourceFile)) return;
    const id = `ppt-${Date.now()}`;
    addProject({ id, name: name.trim(), source, pages: source === "空画布" ? 1 : 6, status: "已保存", updatedAt: "刚刚", favorite: false, recentlyViewed: true });
    notify("项目已创建", "success");
    onCreated(id);
  };

  return (
    <Modal title="新建 PPT" size="lg" onClose={onClose} footer={<><button className="button" onClick={onClose}>取消</button><button className="button button--primary" type="submit" form="new-ppt-form">创建并进入编辑器</button></>}>
      <form id="new-ppt-form" className="form-stack" onSubmit={create}>
        <label>项目名称 *
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：2026 年消费行业研究" />
          {attempted && !name.trim() && <small className="field-error">请输入项目名称</small>}
        </label>

        <fieldset>
          <legend>内容来源 *</legend>
          <div className="source-choice-grid">
            <label className={source === "空画布" ? "source-choice source-choice--selected" : "source-choice"}>
              <input type="radio" checked={source === "空画布"} onChange={() => setSource("空画布")} />
              <span className="source-choice__visual">＋</span><strong>空画布</strong><span>手动添加内容，或进入编辑器后使用 AI 生成。</span>
            </label>
            <label className={source === "从现有对话生成" ? "source-choice source-choice--selected" : "source-choice"}>
              <input type="radio" checked={source === "从现有对话生成"} onChange={() => setSource("从现有对话生成")} />
              <span className="source-choice__visual">☷</span><strong>从现有对话生成</strong><span>使用所选对话上下文自动生成大纲。</span>
              {source === "从现有对话生成" && <select><option>行业研究报告</option><option>竞品分析</option><option>财务数据复盘</option></select>}
            </label>
            <label className={source === "导入文件" ? "source-choice source-choice--selected" : "source-choice"}>
              <input type="radio" checked={source === "导入文件"} onChange={() => setSource("导入文件")} />
              <span className="source-choice__visual">⇧</span><strong>导入文件</strong><span>使用行业报告、企业财报等材料生成 PPT。</span>
              {source === "导入文件" && <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" onChange={(event) => setSourceFile(event.target.files?.[0]?.name ?? "")} />}
              {attempted && source === "导入文件" && !sourceFile && <small className="field-error">请选择内容文件</small>}
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>PPT 模板 *</legend>
          <div className="template-picker-tabs" role="tablist" aria-label="PPT 模板来源">
            <button type="button" role="tab" aria-selected={templateTab === "official"} className={templateTab === "official" ? "tab tab--active" : "tab"} onClick={() => setTemplateTab("official")}>官方模板库</button>
            <button type="button" role="tab" aria-selected={templateTab === "mine"} className={templateTab === "mine" ? "tab tab--active" : "tab"} onClick={() => setTemplateTab("mine")}>我的模板</button>
          </div>
          <div className="template-picker-panel">
            {templateTab === "official" && <div className="template-picker-grid">{officialTemplates.map((item) => <button type="button" key={item.id} className={template === item.name ? "template-picker-card template-picker-card--selected" : "template-picker-card"} onClick={() => setTemplate(item.name)}><span>16:9 · {item.category}</span><strong>{item.name}</strong>{favoriteTemplateIds.includes(item.id) && <small>★ 已收藏</small>}</button>)}</div>}
            {templateTab === "mine" && <><div className="template-picker-grid">{customTemplates.map((item) => <button type="button" key={item} className={template === item ? "template-picker-card template-picker-card--selected" : "template-picker-card"} onClick={() => setTemplate(item)}><span>我上传的模板</span><strong>{item}</strong></button>)}{favoriteOfficialTemplates.map((item) => <button type="button" key={item.id} className={template === item.name ? "template-picker-card template-picker-card--selected" : "template-picker-card"} onClick={() => setTemplate(item.name)}><span>收藏的官方模板</span><strong>{item.name}</strong></button>)}{!customTemplates.length && !favoriteOfficialTemplates.length && <div className="template-empty">暂无我的模板，请先前往模板管理上传或收藏。</div>}</div><small>自定义模板：已上传 {customTemplates.length} / 上限 3</small></>}
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}

export function ImportPptDialog({ onClose, onImported }: { onClose: () => void; onImported: (id: string) => void }) {
  const { addProject, notify } = usePrototype();
  const [fileName, setFileName] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!fileName) return;
    const id = `ppt-import-${Date.now()}`;
    addProject({ id, name: fileName.replace(/\.pptx$/i, ""), source: "上传 PPT", pages: 1, status: "解析中", updatedAt: "刚刚", favorite: false, recentlyViewed: true });
    notify("PPT 已导入，正在智能解析", "success");
    onImported(id);
  };

  return <Modal title="导入现有 PPT" onClose={onClose} footer={<><button className="button" onClick={onClose}>取消</button><button className="button button--primary" type="submit" form="import-ppt-form" disabled={!fileName}>导入并查看解析</button></>}><form id="import-ppt-form" className="form-stack" onSubmit={submit}><label>选择 PPT 文件 *<input type="file" accept=".pptx" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} /></label><div className="notice"><strong>导入后将自动解析</strong><p>识别提纲结构、页面版式、视觉风格，以及可更新的文字、图表和表格。</p></div>{fileName && <p>已选择：<strong>{fileName}</strong></p>}<small>低保真原型不会上传真实文件，仅验证选择、导入和解析流程。</small></form></Modal>;
}

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
  const favoriteOfficialTemplates = officialTemplates.filter((item) => favoriteTemplateIds.includes(item.id));

  const chooseTemplate = (name: string) => notify(`已选择模板“${name}”`, "success");

  return (
    <Modal title="管理 PPT 模板" size="lg" onClose={onClose} footer={<button className="button" onClick={onClose}>完成</button>}>
      <div className="template-tabs" role="tablist" aria-label="模板管理分类">
        <button role="tab" aria-selected={tab === "official"} className={tab === "official" ? "tab tab--active" : "tab"} onClick={() => setTab("official")}>官方模板库</button>
        <button role="tab" aria-selected={tab === "mine"} className={tab === "mine" ? "tab tab--active" : "tab"} onClick={() => setTab("mine")}>我的模板 <span>{customTemplates.length + favoriteOfficialTemplates.length}</span></button>
      </div>

      {tab === "official" && (
        <section className="template-tab-panel" role="tabpanel">
          <div className="dialog-page-header">
            <div><h3>官方模板库</h3><p className="muted">浏览官方模板，预览后可直接选择，或收藏到“我的模板”。</p></div>
            <input className="template-search" placeholder="搜索官方模板" aria-label="搜索官方模板" />
          </div>
          <div className="template-library-grid">
            {officialTemplates.map((item) => {
              const favorite = favoriteTemplateIds.includes(item.id);
              return <article className="template-library-card" key={item.id}><div className="template-library-card__preview"><span>{item.ratio}</span><strong>{item.category}</strong></div><div className="template-library-card__body"><strong>{item.name}</strong><small>官方模板 · {item.category}</small><div className="button-row"><button className="button button--small" onClick={() => notify(`正在预览“${item.name}”`)}>预览</button><button className="button button--small button--primary" onClick={() => chooseTemplate(item.name)}>选择</button><button className="button button--small" aria-pressed={favorite} onClick={() => { toggleFavoriteTemplate(item.id); notify(favorite ? "已取消收藏" : "已收藏到我的模板", "success"); }}>{favorite ? "★ 已收藏" : "☆ 收藏"}</button></div></div></article>;
            })}
          </div>
        </section>
      )}

      {tab === "mine" && (
        <section className="template-tab-panel" role="tabpanel">
          <div className="dialog-page-header">
            <div><h3>我的模板</h3><p className="muted">管理自己上传的模板，并集中查看从官方模板库收藏的内容。</p></div>
            <div className="button-row"><span className="usage-chip">已上传 {customTemplates.length} / 上限 3</span><button className="button button--primary" disabled={customTemplates.length >= 3} onClick={() => { addCustomTemplate(); notify("模板已上传并进入解析", "success"); }}>上传自定义模板</button></div>
          </div>

          <div className="template-section-heading"><div><h3>我上传的模板</h3><small>上传 `.pptx` 后由 AI 识别视觉风格。</small></div></div>
          <div className="template-library-grid">
            {customTemplates.map((item) => <article className="template-library-card" key={item}><div className="template-library-card__preview"><span>16:9</span><strong>自定义</strong></div><div className="template-library-card__body"><strong>{item}</strong><small>我上传的模板 · 已解析</small><div className="button-row"><button className="button button--small button--primary" onClick={() => chooseTemplate(item)}>选择</button><button className="button button--small" onClick={() => notify(`正在预览“${item}”`)}>预览</button><button className="button button--small" onClick={() => { deleteCustomTemplate(item); notify("自定义模板已删除"); }}>删除</button></div></div></article>)}
          </div>

          <div className="template-section-heading"><div><h3>收藏的官方模板</h3><small>在官方模板库中收藏的模板会同步出现在这里。</small></div></div>
          {favoriteOfficialTemplates.length ? <div className="template-library-grid">{favoriteOfficialTemplates.map((item) => <article className="template-library-card" key={item.id}><div className="template-library-card__preview"><span>{item.ratio}</span><strong>{item.category}</strong></div><div className="template-library-card__body"><strong>{item.name}</strong><small>收藏的官方模板</small><div className="button-row"><button className="button button--small button--primary" onClick={() => chooseTemplate(item.name)}>选择</button><button className="button button--small" onClick={() => toggleFavoriteTemplate(item.id)}>取消收藏</button></div></div></article>)}</div> : <div className="template-empty">暂无收藏的官方模板，可前往“官方模板库”添加。</div>}
        </section>
      )}
    </Modal>
  );
}
