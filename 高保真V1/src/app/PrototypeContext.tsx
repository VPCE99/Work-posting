import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { conversations as initialConversations, initialProjects, initialSkills, initialTasks } from "../data/mock";
import type { Conversation, PptProject, ScheduledTask, Skill, ToastMessage } from "../types";

type PrototypeContextValue = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (value: boolean) => void;
  activeDialog: "plans" | "binding" | "chart" | null;
  setActiveDialog: (dialog: "plans" | "binding" | "chart" | null) => void;
  pinnedConversationIds: string[];
  togglePinnedConversation: (id: string) => void;
  conversations: Conversation[];
  renameConversation: (id: string, title: string) => void;
  tasks: ScheduledTask[];
  saveTask: (task: ScheduledTask) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  projects: PptProject[];
  addProject: (project: PptProject) => void;
  updateProject: (id: string, patch: Partial<PptProject>) => void;
  deleteProject: (id: string) => void;
  favoriteTemplateIds: string[];
  toggleFavoriteTemplate: (id: string) => void;
  customTemplates: string[];
  addCustomTemplate: () => void;
  deleteCustomTemplate: (name: string) => void;
  skills: Skill[];
  addSkill: (skill: Skill) => void;
  deleteSkill: (id: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  toasts: ToastMessage[];
  notify: (text: string, tone?: ToastMessage["tone"]) => void;
};

const PrototypeContext = createContext<PrototypeContextValue | null>(null);

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<"plans" | "binding" | "chart" | null>(null);
  const [pinnedConversationIds, setPinnedConversationIds] = useState(["industry"]);
  const [conversations, setConversations] = useState(initialConversations);
  const [tasks, setTasks] = useState(initialTasks);
  const [projects, setProjects] = useState(initialProjects);
  const [favoriteTemplateIds, setFavoriteTemplateIds] = useState(["official-finance"]);
  const [customTemplates, setCustomTemplates] = useState(["我的品牌模板", "公司标准模板"]);
  const [skills, setSkills] = useState(initialSkills);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = (text: string, tone: ToastMessage["tone"] = "neutral") => {
    const id = Date.now();
    setToasts((items) => [...items, { id, text, tone }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 2600);
  };

  const value = useMemo<PrototypeContextValue>(() => ({
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    activeDialog,
    setActiveDialog,
    pinnedConversationIds,
    togglePinnedConversation: (id) => setPinnedConversationIds((items) => items.includes(id) ? items.filter((item) => item !== id) : [id, ...items]),
    conversations,
    renameConversation: (id, title) => setConversations((items) => items.map((item) => item.id === id ? { ...item, title } : item)),
    tasks,
    saveTask: (task) => setTasks((items) => {
      const exists = items.some((item) => item.id === task.id);
      return exists ? items.map((item) => item.id === task.id ? task : item) : [task, ...items];
    }),
    deleteTask: (id) => setTasks((items) => items.filter((item) => item.id !== id)),
    toggleTask: (id) => setTasks((items) => items.map((item) => item.id === id ? { ...item, enabled: !item.enabled, nextRun: item.enabled ? "已停用" : "09/23 08:00" } : item)),
    projects,
    addProject: (project) => setProjects((items) => [project, ...items]),
    updateProject: (id, patch) => setProjects((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item)),
    deleteProject: (id) => setProjects((items) => items.filter((item) => item.id !== id)),
    favoriteTemplateIds,
    toggleFavoriteTemplate: (id) => setFavoriteTemplateIds((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]),
    customTemplates,
    addCustomTemplate: () => setCustomTemplates((items) => items.length >= 3 ? items : [...items, `自定义模板 ${items.length + 1}`]),
    deleteCustomTemplate: (name) => setCustomTemplates((items) => items.filter((item) => item !== name)),
    skills,
    addSkill: (skill) => setSkills((items) => [skill, ...items]),
    deleteSkill: (id) => setSkills((items) => items.filter((item) => item.id !== id)),
    theme,
    toggleTheme: () => setTheme((value) => value === "light" ? "dark" : "light"),
    toasts,
    notify,
  }), [sidebarCollapsed, mobileSidebarOpen, activeDialog, pinnedConversationIds, conversations, tasks, projects, favoriteTemplateIds, customTemplates, skills, theme, toasts]);

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>;
}

export function usePrototype() {
  const context = useContext(PrototypeContext);
  if (!context) throw new Error("usePrototype must be used inside PrototypeProvider");
  return context;
}
