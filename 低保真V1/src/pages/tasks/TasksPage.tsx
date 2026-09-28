import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrototype } from "../../app/PrototypeContext";
import { AppShell } from "../../components/layout/AppShell";
import { TaskDialog } from "../../components/tasks/TaskDialog";
import { ConfirmDialog } from "../../components/ui/Modal";
import type { ScheduledTask } from "../../types";

export function TasksPage() {
  const navigate = useNavigate();
  const { tasks, saveTask, deleteTask, toggleTask, notify } = usePrototype();
  const [editingTask, setEditingTask] = useState<ScheduledTask | null | undefined>(undefined);
  const [deletingTask, setDeletingTask] = useState<ScheduledTask | null>(null);

  return (
    <AppShell>
      <section className="page-stack">
        <header className="page-header">
          <div><p className="eyebrow">自动化</p><h1>定时任务</h1><p>集中管理周期性研究任务，历史聊天始终保留在左侧。</p></div>
          <button className="button button--primary" onClick={() => setEditingTask(null)}>＋ 新建任务</button>
        </header>

        <div className="card-grid card-grid--3 task-page-grid">
          {tasks.map((task) => (
            <article className="task-card task-card--page" key={task.id}>
              <div className="task-card__title">
                <button className={`switch ${task.enabled ? "switch--on" : ""}`} onClick={() => toggleTask(task.id)} aria-label={task.enabled ? "停用任务" : "启用任务"}><span /></button>
                <strong>{task.name}</strong>
              </div>
              <p>{task.prompt}</p>
              <dl className="task-meta"><div><dt>频率</dt><dd>{task.frequency} {task.time}</dd></div><div><dt>下次执行</dt><dd>{task.nextRun}</dd></div><div><dt>结果</dt><dd>{task.result}</dd></div></dl>
              <div className="button-row">
                {task.result === "已生成报告" && <button className="button" onClick={() => navigate("/chat/industry")}>查看网页对话</button>}
                <button className="button" onClick={() => notify(`${task.name} 已进入运行队列`, "success")}>立即运行</button>
                <button className="button" onClick={() => setEditingTask(task)}>编辑</button>
                <button className="button" onClick={() => setDeletingTask(task)}>删除</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {editingTask !== undefined && <TaskDialog initial={editingTask ?? undefined} onClose={() => setEditingTask(undefined)} onSave={(task) => { saveTask(task); setEditingTask(undefined); notify("任务已保存", "success"); }} />}
      {deletingTask && <ConfirmDialog title="删除定时任务" message={`将永久删除“${deletingTask.name}”，此操作不可撤销。`} confirmText="确认删除" danger onClose={() => setDeletingTask(null)} onConfirm={() => { deleteTask(deletingTask.id); setDeletingTask(null); notify("任务已删除"); }} />}
    </AppShell>
  );
}
