import { useState, type FormEvent } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { usePrototype } from "../../app/PrototypeContext";
import type { Skill } from "../../types";
import { ConfirmDialog, Modal } from "../../components/ui/Modal";

export function SkillsPage() {
  const { skills, addSkill, deleteSkill, notify } = usePrototype();
  const [tab, setTab] = useState<Skill["kind"]>("公用技能");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<Skill | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState<Skill | null>(null);
  const visible = skills.filter((item) => item.kind === tab && `${item.name}${item.description}`.includes(query));

  return <AppShell><section className="page-stack"><header className="page-header"><div><p className="eyebrow">能力管理</p><h1>我的技能</h1><p>技能用于保存分析标准和表达习惯，不执行代码或外部工具。</p></div><button className="button button--primary" onClick={() => setEditing(true)}>＋ 新建自定义技能</button></header><div className="toolbar"><div className="tab-row">{(["公用技能", "我的技能", "未开通"] as const).map((item) => <button key={item} className={tab === item ? "tab tab--active" : "tab"} onClick={() => setTab(item)}>{item}{item === "我的技能" ? ` ${skills.filter((skill) => skill.kind === item).length}/20` : ""}</button>)}</div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索技能" /></div><div className="card-grid card-grid--3">{visible.map((skill) => <article className="basic-card" key={skill.id}><small>{skill.kind}</small><h2>{skill.name}</h2><p>{skill.description}</p><div className="button-row"><button className="button" onClick={() => setDetail(skill)}>查看</button>{skill.kind === "公用技能" && <button className="button button--primary" onClick={() => notify("已带入新问题", "success")}>用于新问题</button>}{skill.kind === "我的技能" && <><button className="button" onClick={() => setEditing(true)}>编辑</button><button className="button" onClick={() => setDeleting(skill)}>删除</button></>}{skill.kind === "未开通" && <button className="button" disabled>联系管理员</button>}</div></article>)}</div></section>{detail && <Modal title={detail.name} onClose={() => setDetail(null)} footer={<><button className="button" onClick={() => setDetail(null)}>关闭</button>{detail.kind !== "未开通" && <button className="button button--primary" onClick={() => { setDetail(null); notify("已带入新问题", "success"); }}>用于新问题</button>}</>}><p className="eyebrow">{detail.kind}</p><h3>用途</h3><p>{detail.description}</p><h3>输入要求</h3><p>提供研究主题、材料或需要分析的数据。</p><h3>输出预期</h3><p>结构化结论、关键依据和可继续追问的问题。</p></Modal>}{editing && <SkillDialog onClose={() => setEditing(false)} onSave={(skill) => { addSkill(skill); setEditing(false); notify("技能已保存", "success"); }} />}{deleting && <ConfirmDialog title="删除技能" message={`将删除“${deleting.name}”，历史对话不会受到影响。`} danger confirmText="确认删除" onClose={() => setDeleting(null)} onConfirm={() => { deleteSkill(deleting.id); setDeleting(null); }} />}</AppShell>;
}

function SkillDialog({ onClose, onSave }: { onClose: () => void; onSave: (skill: Skill) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const submit = (event: FormEvent) => { event.preventDefault(); if (!name.trim() || !description.trim() || !prompt.trim()) return; onSave({ id: `skill-${Date.now()}`, name, description, kind: "我的技能" }); };
  return <Modal title="新建自定义技能" onClose={onClose} footer={<><button className="button" onClick={onClose}>取消</button><button className="button button--primary" type="submit" form="skill-form">保存技能</button></>}><form id="skill-form" className="form-stack" onSubmit={submit}><label>技能名称 *<input value={name} onChange={(event) => setName(event.target.value)} /></label><label>简介 *<input value={description} onChange={(event) => setDescription(event.target.value)} /></label><label>提示内容 *<textarea rows={8} value={prompt} onChange={(event) => setPrompt(event.target.value)} /></label><small>技能作为对话背景提示，不执行代码或外部工具。</small></form></Modal>;
}
