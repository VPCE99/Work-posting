import { useCallback, useState } from "react";
import { formatNextRun } from "../taskSchedule";
import { initialTasks } from "../../data/mock";
import type { ScheduledTask } from "../../types";

export function useTaskState() {
  const [tasks, setTasks] = useState(initialTasks);

  const saveTask = useCallback((task: ScheduledTask) => {
    setTasks((items) => {
      const exists = items.some((item) => item.id === task.id);
      return exists ? items.map((item) => item.id === task.id ? task : item) : [task, ...items];
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((items) => items.filter((item) => item.id !== id));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((items) => items.map((item) => {
      if (item.id !== id) return item;
      const enabled = !item.enabled;
      return { ...item, enabled, nextRun: formatNextRun(item.frequency, item.time, enabled) };
    }));
  }, []);

  const runTask = useCallback((id: string) => {
    setTasks((items) => items.map((item) => item.id === id ? { ...item, enabled: true, result: "刚刚完成", nextRun: formatNextRun(item.frequency, item.time, true) } : item));
  }, []);

  return { tasks, saveTask, deleteTask, toggleTask, runTask };
}
