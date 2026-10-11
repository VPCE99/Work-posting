import { useState, type FormEvent } from "react";
import { FormSelect } from "../ui/FormSelect";
import { Modal } from "../ui/Modal";
import { formatNextRun } from "../../app/taskSchedule";
import type { ScheduledTask } from "../../types";

export function TaskDialog({ initial, onSave, onClose }: {
  initial?: ScheduledTask;
  onSave: (task: ScheduledTask) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [prompt, setPrompt] = useState(initial?.prompt ?? "");
  const [frequency, setFrequency] = useState(initial?.frequency ?? "每天");
  const [time, setTime] = useState(initial?.time ?? "08:00");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);
  const [attempted, setAttempted] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    if (!name.trim() || !prompt.trim()) return;
    const trimmedEmail = email.trim();
    onSave({
      id: initial?.id ?? `task-${Date.now()}`,
      name: name.trim(),
      prompt: prompt.trim(),
      frequency,
      time,
      ...(trimmedEmail ? { email: trimmedEmail } : {}),
      enabled,
      nextRun: formatNextRun(frequency, time, enabled),
      result: initial?.result ?? "等待运行",
    });
  };

  return (
    <Modal
      title={initial ? "编辑定时任务" : "新建定时任务"}
      variant="task"
      onClose={onClose}
      footer={<><button className="button" onClick={onClose}>取消</button><button className="button button--primary" form="task-form" type="submit">保存任务</button></>}
    >
      <form id="task-form" className="form-stack" onSubmit={submit}>
        <label>
          <span className="field-label-row task-form__label-text">
            <span>任务名称 <span aria-hidden="true">*</span></span>
            {attempted && !name.trim() && <small className="field-error">请输入任务名称</small>}
          </span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：每日行业简报" />
        </label>
        <label>
          <span className="field-label-row task-form__label-text">
            <span>任务内容 <span aria-hidden="true">*</span></span>
            {attempted && !prompt.trim() && <small className="field-error">请输入任务内容</small>}
          </span>
          <textarea rows={5} value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="描述研究范围、数据要求和输出格式" />
        </label>
        <div className="form-grid form-grid--2">
          <label>执行频率
            <FormSelect label="执行频率" value={frequency} onChange={setFrequency} options={["每天", "工作日", "每周一", "每月 1 日"]} />
          </label>
          <label>执行时间
            <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
          </label>
        </div>
        <label>邮件投递（选填）
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" />
          <small>不填邮箱时，结果只保存为网页对话。</small>
        </label>
        <label className="check-row"><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} /> 保存后立即启用</label>
      </form>
    </Modal>
  );
}
