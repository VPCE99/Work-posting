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
  };
}
