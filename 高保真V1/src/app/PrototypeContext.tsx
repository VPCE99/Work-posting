import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { ChatProject, Conversation, PptProject, ScheduledTask, Skill, ToastMessage } from "../types";
import { useChatState } from "./prototype/useChatState";
import { useChromeState } from "./prototype/useChromeState";
import { useDocumentTheme, syncDocumentTheme } from "./prototype/useDocumentTheme";
import { usePptProjectState } from "./prototype/usePptProjectState";
import { useSkillState } from "./prototype/useSkillState";
import { useTaskState } from "./prototype/useTaskState";

export { syncDocumentTheme };

type PrototypeContextValue = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (value: boolean) => void;
  activeDialog: "binding" | "chart" | null;
  setActiveDialog: (dialog: "binding" | "chart" | null) => void;
  pinnedConversationIds: string[];
  togglePinnedConversation: (id: string) => void;
  conversations: Conversation[];
  renameConversation: (id: string, title: string) => void;
  chatProjects: ChatProject[];
  addChatProject: (name: string) => string;
  renameChatProject: (id: string, name: string) => void;
  deleteChatProject: (id: string) => void;
  moveConversationToProject: (conversationId: string, projectId: string | null) => void;
  startConversation: (prompt: string) => string;
  tasks: ScheduledTask[];
  saveTask: (task: ScheduledTask) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  runTask: (id: string) => void;
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
  updateSkill: (id: string, patch: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  toasts: ToastMessage[];
  notify: (text: string, tone?: ToastMessage["tone"]) => void;
};

const PrototypeContext = createContext<PrototypeContextValue | null>(null);

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const chrome = useChromeState();
  const chat = useChatState();
  const task = useTaskState();
  const ppt = usePptProjectState();
  const skill = useSkillState();

  useDocumentTheme(chrome.theme);

  const state = useMemo(() => ({
    sidebarCollapsed: chrome.sidebarCollapsed,
    mobileSidebarOpen: chrome.mobileSidebarOpen,
    activeDialog: chrome.activeDialog,
    pinnedConversationIds: chat.pinnedConversationIds,
    conversations: chat.conversations,
    chatProjects: chat.chatProjects,
    tasks: task.tasks,
    projects: ppt.projects,
    favoriteTemplateIds: ppt.favoriteTemplateIds,
    customTemplates: ppt.customTemplates,
    skills: skill.skills,
    theme: chrome.theme,
    toasts: chrome.toasts,
  }), [
    chrome.sidebarCollapsed,
    chrome.mobileSidebarOpen,
    chrome.activeDialog,
    chrome.theme,
    chrome.toasts,
    chat.pinnedConversationIds,
    chat.conversations,
    chat.chatProjects,
    task.tasks,
    ppt.projects,
    ppt.favoriteTemplateIds,
    ppt.customTemplates,
    skill.skills,
  ]);

  const actions = useMemo(() => ({
    setSidebarCollapsed: chrome.setSidebarCollapsed,
    setMobileSidebarOpen: chrome.setMobileSidebarOpen,
    setActiveDialog: chrome.setActiveDialog,
    togglePinnedConversation: chat.togglePinnedConversation,
    renameConversation: chat.renameConversation,
    addChatProject: chat.addChatProject,
    renameChatProject: chat.renameChatProject,
    deleteChatProject: chat.deleteChatProject,
    moveConversationToProject: chat.moveConversationToProject,
    startConversation: chat.startConversation,
    saveTask: task.saveTask,
    deleteTask: task.deleteTask,
    toggleTask: task.toggleTask,
    runTask: task.runTask,
    addProject: ppt.addProject,
    updateProject: ppt.updateProject,
    deleteProject: ppt.deleteProject,
    toggleFavoriteTemplate: ppt.toggleFavoriteTemplate,
    addCustomTemplate: ppt.addCustomTemplate,
    deleteCustomTemplate: ppt.deleteCustomTemplate,
    addSkill: skill.addSkill,
    updateSkill: skill.updateSkill,
    deleteSkill: skill.deleteSkill,
    toggleTheme: chrome.toggleTheme,
    notify: chrome.notify,
  }), [
    chrome.setSidebarCollapsed,
    chrome.setMobileSidebarOpen,
    chrome.setActiveDialog,
    chrome.toggleTheme,
    chrome.notify,
    chat.togglePinnedConversation,
    chat.renameConversation,
    chat.addChatProject,
    chat.renameChatProject,
    chat.deleteChatProject,
    chat.moveConversationToProject,
    chat.startConversation,
    task.saveTask,
    task.deleteTask,
    task.toggleTask,
    task.runTask,
    ppt.addProject,
    ppt.updateProject,
    ppt.deleteProject,
    ppt.toggleFavoriteTemplate,
    ppt.addCustomTemplate,
    ppt.deleteCustomTemplate,
    skill.addSkill,
    skill.updateSkill,
    skill.deleteSkill,
  ]);

  const value = useMemo<PrototypeContextValue>(() => ({
    ...state,
    ...actions,
  }), [state, actions]);

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>;
}

export function usePrototype() {
  const context = useContext(PrototypeContext);
  if (!context) throw new Error("usePrototype must be used inside PrototypeProvider");
  return context;
}
