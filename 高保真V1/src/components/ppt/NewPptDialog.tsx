import { useState, type FormEvent } from "react";
import { usePrototype } from "../../app/PrototypeContext";
import { officialTemplates, templateCoverUrls } from "../../data/mock";
import { FormSelect } from "../ui/FormSelect";
import { ConfirmDialog, Modal } from "../ui/Modal";

const NO_PPT_TEMPLATE = "__none__";

export function NewPptDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const { addProject, customTemplates, favoriteTemplateIds, notify } = usePrototype();
  const [name, setName] = useState("");
  const [source, setSource] = useState<"空画布" | "从现有对话生成" | "导入文件">("空画布");
  const [sourceFile, setSourceFile] = useState("");
  const [templateTab, setTemplateTab] = useState<"official" | "mine">("official");
  const [template, setTemplate] = useState(NO_PPT_TEMPLATE);
  const [attempted, setAttempted] = useState(false);
  const [blankConfirmOpen, setBlankConfirmOpen] = useState(false);
  const favoriteOfficialTemplates = officialTemplates.filter((item) => favoriteTemplateIds.includes(item.id));
  const usingBlankTemplate = template === NO_PPT_TEMPLATE;
  const noneTemplateCard = (
    <button
      type="button"
      className={usingBlankTemplate ? "template-picker-card template-picker-card--none template-picker-card--selected" : "template-picker-card template-picker-card--none"}
      onClick={() => setTemplate(NO_PPT_TEMPLATE)}
    >
      <span className="template-picker-card__body">
        <span>空白画布</span>
        <strong>不选择模板</strong>
        <small>无预设版式</small>
      </span>
      <span className="template-picker-card__cover template-picker-card__cover--blank" aria-hidden="true">
        <span>＋</span>
      </span>
    </button>
  );

  const createProject = () => {
    const blankTemplate = usingBlankTemplate;
    const id = `ppt-${Date.now()}`;
    addProject({
      id,
      name: name.trim(),
      source,
      pages: blankTemplate || source === "空画布" ? 1 : 6,
      status: "已保存",
      updatedAt: "刚刚",
      favorite: false,
      recentlyViewed: true,
      blankTemplate,
    });
    notify(blankTemplate ? "已创建空白 PPT 项目" : "项目已创建", "success");
    onCreated(id);
  };

  const create = (event: FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    if (!name.trim() || (source === "导入文件" && !sourceFile) || !template.trim()) return;
    if (usingBlankTemplate) {
      setBlankConfirmOpen(true);
      return;
    }
    createProject();
  };

  return (
    <>
    <Modal title="新建 PPT" size="lg" variant="new-ppt" onClose={onClose} footer={<><button className="button" onClick={onClose}>取消</button><button className="button button--primary" type="submit" form="new-ppt-form">创建并进入编辑器</button></>}>
      <form id="new-ppt-form" className="form-stack" onSubmit={create}>
        <label>
          <span className="field-label-row">
            <span>项目名称 *</span>
            {attempted && !name.trim() && <small className="field-error">请输入项目名称</small>}
          </span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：2026 年消费行业研究" />
        </label>

        <fieldset>
          <legend className="field-label-row">
            <span>内容来源 *</span>
            {attempted && source === "导入文件" && !sourceFile && <small className="field-error">请选择内容文件</small>}
          </legend>
          <div className="source-choice-grid">
            <label className={source === "空画布" ? "source-choice source-choice--selected" : "source-choice"}>
              <input type="radio" checked={source === "空画布"} onChange={() => setSource("空画布")} />
              <span className="source-choice__visual">＋</span><strong>空画布</strong><span>手动添加内容，或进入编辑器后使用 AI 生成。</span>
            </label>
            <label className={source === "从现有对话生成" ? "source-choice source-choice--selected" : "source-choice"}>
              <input type="radio" checked={source === "从现有对话生成"} onChange={() => setSource("从现有对话生成")} />
              <span className="source-choice__visual">☷</span><strong>从现有对话生成</strong><span>使用所选对话上下文自动生成大纲。</span>
              {source === "从现有对话生成" && <FormSelect label="选择对话" options={["行业研究报告", "竞品分析", "财务数据复盘"]} />}
            </label>
            <label className={source === "导入文件" ? "source-choice source-choice--selected" : "source-choice"}>
              <input type="radio" checked={source === "导入文件"} onChange={() => setSource("导入文件")} />
              <span className="source-choice__visual">⇧</span><strong>导入文件</strong><span>使用行业报告、企业财报等材料生成 PPT。</span>
              {source === "导入文件" && <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" onChange={(event) => setSourceFile(event.target.files?.[0]?.name ?? "")} />}
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend className="field-label-row">
            <span>PPT 模板 *</span>
            {attempted && !template.trim() && <small className="field-error">请选择 PPT 模板</small>}
          </legend>
          <div className="template-picker-tabs" role="tablist" aria-label="PPT 模板来源">
            <button type="button" role="tab" aria-selected={templateTab === "official"} className={templateTab === "official" ? "tab tab--active" : "tab"} onClick={() => setTemplateTab("official")}>官方模板库</button>
            <button type="button" role="tab" aria-selected={templateTab === "mine"} className={templateTab === "mine" ? "tab tab--active" : "tab"} onClick={() => setTemplateTab("mine")}>我的模板</button>
          </div>
          <div className="template-picker-panel">
            {templateTab === "official" && (
              <div className="template-picker-grid">
                {noneTemplateCard}
                {officialTemplates.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={template === item.name ? "template-picker-card template-picker-card--selected" : "template-picker-card"}
                    onClick={() => setTemplate(item.name)}
                  >
                    <span className="template-picker-card__body">
                      <span>{item.category}</span>
                      <strong>{item.name}</strong>
                      {favoriteTemplateIds.includes(item.id) && <small>★ 已收藏</small>}
                    </span>
                    {item.coverUrl && (
                      <span className="template-picker-card__cover" aria-hidden="true">
                        <img src={item.coverUrl} alt="" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {templateTab === "mine" && (
              <>
                <div className="template-picker-grid">
                  {noneTemplateCard}
                  {customTemplates.map((item) => {
                    const coverUrl = templateCoverUrls[item];
                    return (
                      <button
                        type="button"
                        key={item}
                        className={template === item ? "template-picker-card template-picker-card--selected" : "template-picker-card"}
                        onClick={() => setTemplate(item)}
                      >
                        <span className="template-picker-card__body">
                          <span>我上传的模板</span>
                          <strong>{item}</strong>
                        </span>
                        {coverUrl && (
                          <span className="template-picker-card__cover" aria-hidden="true">
                            <img src={coverUrl} alt="" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {favoriteOfficialTemplates.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={template === item.name ? "template-picker-card template-picker-card--selected" : "template-picker-card"}
                      onClick={() => setTemplate(item.name)}
                    >
                      <span className="template-picker-card__body">
                        <span>收藏的模板</span>
                        <strong>{item.name}</strong>
                      </span>
                      {item.coverUrl && (
                        <span className="template-picker-card__cover" aria-hidden="true">
                          <img src={item.coverUrl} alt="" />
                        </span>
                      )}
                    </button>
                  ))}
                  {!customTemplates.length && !favoriteOfficialTemplates.length && (
                    <div className="template-empty">暂无我的模板，请先前往模板管理上传或收藏。</div>
                  )}
                </div>
                <small>自定义模板：已上传 {customTemplates.length} / 上限 3</small>
              </>
            )}
          </div>
        </fieldset>
      </form>
    </Modal>
    {blankConfirmOpen && (
      <ConfirmDialog
        title="确认创建"
        message="不使用模板，会默认为空白PPT"
        confirmText="继续创建"
        onClose={() => setBlankConfirmOpen(false)}
        onConfirm={() => {
          setBlankConfirmOpen(false);
          createProject();
        }}
      />
    )}
    </>
  );
}
