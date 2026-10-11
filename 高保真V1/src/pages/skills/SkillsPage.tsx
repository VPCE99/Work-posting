import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { usePrototype } from "../../app/PrototypeContext";
import type { Skill } from "../../types";
import { FormSelect } from "../../components/ui/FormSelect";
import { ConfirmDialog, Modal } from "../../components/ui/Modal";

const skillVisuals: Record<string, { meta: string }> = {
  "industry-research": { meta: "使用 128 次  ·  更新于 2 天前" },
  financial: { meta: "使用 96 次  ·  更新于 5 天前" },
  writing: { meta: "使用 22 次  ·  更新于昨天" },
  interview: { meta: "使用 14 次  ·  更新于 1 周前" },
  "data-room": { meta: "联系管理员开通" },
};

const glyphProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function SkillGlyph({ id }: { id: string }) {
  if (id === "industry-research") {
    return (
      <svg {...glyphProps}>
        <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
        <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
        <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
      </svg>
    );
  }
  if (id === "financial") {
    return (
      <svg {...glyphProps}>
        <path d="M12 16v5" />
        <path d="M16 14v7" />
        <path d="M20 10v11" />
        <path d="m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15" />
        <path d="M4 18v3" />
        <path d="M8 14v7" />
      </svg>
    );
  }
  if (id === "writing") {
    return (
      <svg {...glyphProps}>
        <path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4" />
        <path d="M2 6h4" />
        <path d="M2 10h4" />
        <path d="M2 14h4" />
        <path d="M2 18h4" />
        <path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
      </svg>
    );
  }
  if (id === "interview") {
    return (
      <svg {...glyphProps}>
        <path d="M15 3.5h4.2A1.6 1.6 0 0 1 20.8 5.1v2.2A1.6 1.6 0 0 1 19.2 8.9H17.8L16.4 10.2V8.9H15A1.6 1.6 0 0 1 13.4 7.3V5.1A1.6 1.6 0 0 1 15 3.5z" />
        <path d="M4 10.2h8.4A1.7 1.7 0 0 1 14.1 11.9v4a1.7 1.7 0 0 1-1.7 1.7H7.4L5.2 19.8v-2.2H4A1.7 1.7 0 0 1 2.3 15.9v-4A1.7 1.7 0 0 1 4 10.2z" />
        <path d="M4.8 13.2h6.2" />
        <path d="M4.8 15.6h3.5" />
      </svg>
    );
  }
  if (id === "data-room") {
    return (
      <svg {...glyphProps}>
        <path d="M4.5 3h4.4l1.7 1.9h8.2c1 0 1.7.8 1.7 1.7v11.7c0 1-.7 1.7-1.7 1.7H4.5c-1 0-1.7-.7-1.7-1.7V4.7c0-1 .7-1.7 1.7-1.7z" />
        <path d="M8.5 18.2V12.2" />
        <path d="M12 18.2V8.6" />
        <path d="M15.5 18.2V10.8" />
      </svg>
    );
  }
  return (
    <svg {...glyphProps}>
      <path d="M12 3.5 13.4 8.6 18.5 10 13.4 11.4 12 16.5 10.6 11.4 5.5 10 10.6 8.6z" />
    </svg>
  );
}

type SkillDraft = {
  name: string;
  description: string;
  prompt: string;
};

export function SkillsPage() {
  const navigate = useNavigate();
  const { skills, addSkill, updateSkill, deleteSkill, notify } = usePrototype();
  const [tab, setTab] = useState<Skill["kind"]>("公用技能");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("全部类型");
  const [detail, setDetail] = useState<Skill | null>(null);
  const [editor, setEditor] = useState<{ mode: "create" } | { mode: "edit"; skill: Skill } | null>(null);
  const [deleting, setDeleting] = useState<Skill | null>(null);

  const visible = skills.filter((item) => {
    if (item.kind !== tab) return false;
    if (!`${item.name}${item.description}`.includes(query)) return false;
    if (typeFilter === "研究分析") {
      return item.name.includes("研究") || item.name.includes("分析") || item.description.includes("分析");
    }
    if (typeFilter === "内容生成") {
      return item.name.includes("写作") || item.name.includes("纪要") || item.description.includes("整理") || item.description.includes("表达");
    }
    return true;
  });

  const useSkill = (skill: Skill) => {
    setDetail(null);
    navigate("/chat", { state: { skillDraft: `请使用「${skill.name}」：${skill.description}` } });
    notify(`已将「${skill.name}」带入新对话`, "success");
  };

  return (
    <>
      <section className="page-stack skills-page">
        <header className="page-header">
          <div><p className="eyebrow">能力中心</p><h1>我的技能</h1><p>管理用于对话分析、写作与研究的技能</p></div>
          <button className="button button--primary" onClick={() => setEditor({ mode: "create" })}>＋ 新建自定义技能</button>
        </header>

        <div className="toolbar skills-toolbar">
          <div className="tab-row">{(["公用技能", "我的技能", "未开通"] as const).map((item) => <button key={item} className={tab === item ? "tab tab--active" : "tab"} onClick={() => setTab(item)}>{item}{item === "我的技能" ? ` ${skills.filter((skill) => skill.kind === item).length}/20` : ""}</button>)}</div>
          <div className="skills-toolbar__filters">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索技能" />
            <FormSelect label="技能类型" options={["全部类型", "研究分析", "内容生成"]} value={typeFilter} onChange={setTypeFilter} />
          </div>
        </div>

        <div className="card-grid card-grid--3 skills-grid">
          {visible.map((skill) => {
            const visual = skillVisuals[skill.id] ?? { meta: "刚刚创建" };
            return <article className="basic-card skill-card" key={skill.id}>
              <span className="skill-card__icon" aria-hidden="true"><SkillGlyph id={skill.id} /></span>
              <span className="skill-card__kind"><i />{skill.kind}</span>
              <h2>{skill.name}</h2>
              <p>{skill.description}</p>
              <small className="skill-card__meta">{visual.meta}</small>
              <div className="button-row">
                <button className="button" onClick={() => setDetail(skill)}>查看</button>
                {skill.kind === "公用技能" && <button className="button button--primary" onClick={() => useSkill(skill)}>用于新问题</button>}
                {skill.kind === "我的技能" && (
                  <>
                    <button className="button" onClick={() => setEditor({ mode: "edit", skill })}>编辑</button>
                    <button className="button" onClick={() => setDeleting(skill)}>删除</button>
                  </>
                )}
                {skill.kind === "未开通" && <button className="button" disabled>联系管理员</button>}
              </div>
            </article>;
          })}
        </div>
        <small className="skills-count">{visible.length} 个技能</small>
      </section>

      {detail && (
        <Modal
          title={detail.name}
          onClose={() => setDetail(null)}
          footer={
            <>
              <button className="button" onClick={() => setDetail(null)}>关闭</button>
              {detail.kind !== "未开通" && <button className="button button--primary" onClick={() => useSkill(detail)}>用于新问题</button>}
            </>
          }
        >
          <div className="skill-detail">
            <p className="skill-detail__kind">{detail.kind}</p>
            <section><h3>用途</h3><p>{detail.description}</p></section>
            <section><h3>输入要求</h3><p>提供研究主题、材料或需要分析的数据。</p></section>
            <section><h3>输出预期</h3><p>结构化结论、关键依据和可继续追问的问题。</p></section>
          </div>
        </Modal>
      )}

      {editor && (
        <SkillDialog
          mode={editor.mode}
          initial={editor.mode === "edit" ? {
            name: editor.skill.name,
            description: editor.skill.description,
            prompt: editor.skill.prompt ?? "",
          } : { name: "", description: "", prompt: "" }}
          onClose={() => setEditor(null)}
          onSave={(draft) => {
            if (editor.mode === "create") {
              addSkill({
                id: `skill-${Date.now()}`,
                name: draft.name,
                description: draft.description,
                prompt: draft.prompt,
                kind: "我的技能",
              });
              notify("技能已保存", "success");
            } else {
              updateSkill(editor.skill.id, {
                name: draft.name,
                description: draft.description,
                prompt: draft.prompt,
              });
              notify("技能已更新", "success");
            }
            setEditor(null);
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="删除技能"
          message={`将删除“${deleting.name}”，历史对话不会受到影响。`}
          danger
          confirmText="确认删除"
          onClose={() => setDeleting(null)}
          onConfirm={() => { deleteSkill(deleting.id); setDeleting(null); }}
        />
      )}
    </>
  );
}

function SkillDialog({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: "create" | "edit";
  initial: SkillDraft;
  onClose: () => void;
  onSave: (draft: SkillDraft) => void;
}) {
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [prompt, setPrompt] = useState(initial.prompt);
  const [attempted, setAttempted] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const dirty =
    name !== initial.name ||
    description !== initial.description ||
    prompt !== initial.prompt;

  const requestClose = () => {
    if (dirty) setDiscardOpen(true);
    else onClose();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    if (!name.trim() || !description.trim() || !prompt.trim()) return;
    onSave({ name: name.trim(), description: description.trim(), prompt: prompt.trim() });
  };

  return (
    <>
      <Modal
        title={mode === "edit" ? "编辑自定义技能" : "新建自定义技能"}
        onClose={requestClose}
        footer={
          <>
            <button className="button" onClick={requestClose}>取消</button>
            <button className="button button--primary" type="submit" form="skill-form">保存技能</button>
          </>
        }
      >
        <form id="skill-form" className="form-stack" onSubmit={submit}>
          <label>
            <span className="field-label-row">
              <span>技能名称 *</span>
              {attempted && !name.trim() && <small className="field-error">请输入技能名称</small>}
            </span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            <span className="field-label-row">
              <span>简介 *</span>
              {attempted && !description.trim() && <small className="field-error">请输入简介</small>}
            </span>
            <input value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label>
            <span className="field-label-row">
              <span>提示内容 *</span>
              {attempted && !prompt.trim() && <small className="field-error">请输入提示内容</small>}
            </span>
            <textarea rows={8} value={prompt} onChange={(event) => setPrompt(event.target.value)} />
          </label>
          <small>技能作为对话背景提示，不执行代码或外部工具。</small>
        </form>
      </Modal>
      {discardOpen && (
        <ConfirmDialog
          title="放弃未保存的更改？"
          message="关闭后当前输入将丢失。"
          danger
          confirmText="放弃更改"
          onClose={() => setDiscardOpen(false)}
          onConfirm={() => { setDiscardOpen(false); onClose(); }}
        />
      )}
    </>
  );
}
