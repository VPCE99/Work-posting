import { useCallback, useState } from "react";
import { conversations as initialConversations, initialChatProjects } from "../../data/mock";
import type { ChatProject, Conversation } from "../../types";

export function useChatState() {
  const [pinnedConversationIds, setPinnedConversationIds] = useState(["industry"]);
  const [conversations, setConversations] = useState(initialConversations);
  const [chatProjects, setChatProjects] = useState(initialChatProjects);

  const togglePinnedConversation = useCallback((id: string) => {
    setPinnedConversationIds((items) => items.includes(id) ? items.filter((item) => item !== id) : [id, ...items]);
  }, []);

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations((items) => items.map((item) => item.id === id ? { ...item, title } : item));
  }, []);

  const addChatProject = useCallback((name: string) => {
    const id = `chat-proj-${Date.now()}`;
    setChatProjects((items) => [{ id, name: name.trim() || "未命名项目" }, ...items]);
    return id;
  }, []);

  const renameChatProject = useCallback((id: string, name: string) => {
    setChatProjects((items) => items.map((item) => item.id === id ? { ...item, name: name.trim() || item.name } : item));
  }, []);

  const deleteChatProject = useCallback((id: string) => {
    setChatProjects((items) => items.filter((item) => item.id !== id));
    setConversations((items) => items.map((item) => item.projectId === id ? { ...item, projectId: null } : item));
  }, []);

  const moveConversationToProject = useCallback((conversationId: string, projectId: string | null) => {
    setConversations((items) => items.map((item) => item.id === conversationId ? { ...item, projectId } : item));
  }, []);

  /** Keeps a new chat in the in-memory sidebar until a server history API exists. */
  const startConversation = useCallback((prompt: string) => {
    const text = prompt.trim();
    const id = `chat-${Date.now()}`;
    const titleSource = text.replace(/^请使用「[^」]+」：/, "").trim() || "新对话";
    const title = titleSource.length > 18 ? `${titleSource.slice(0, 18)}…` : titleSource;
    const preview = titleSource.length > 24 ? `${titleSource.slice(0, 24)}…` : titleSource;
    const conversation: Conversation = { id, title, group: "今天", preview, prompt: text };
    setConversations((items) => [conversation, ...items]);
    return id;
  }, []);

  return {
    pinnedConversationIds,
    togglePinnedConversation,
    conversations,
    renameConversation,
    chatProjects,
    addChatProject,
    renameChatProject,
    deleteChatProject,
    moveConversationToProject,
    startConversation,
  } satisfies {
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
  };
}
