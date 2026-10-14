import { useCallback, useEffect, useRef, useState } from "react";
import { useManagedTimeout } from "../../../components/ui/useManagedTimeout";
import {
  AGENT_COLLAPSE_MS,
  AGENT_THINK_MS,
  agentReplyFor,
  initialAgentMessages,
  type AgentChatMessage,
  type AgentPanelMode,
  type AgentPreviewStatus,
} from "../model";

export function useAgentChat(slideTitle: string) {
  const [agentMode, setAgentMode] = useState<AgentPanelMode>("open");
  const [agentDraft, setAgentDraft] = useState("");
  const [agentMessages, setAgentMessages] = useState<AgentChatMessage[]>(initialAgentMessages);
  const [agentThinking, setAgentThinking] = useState<"off" | "on" | "leaving">("off");
  const { schedule: scheduleCollapse, clear: clearCollapse } = useManagedTimeout();
  const { schedule: scheduleThink } = useManagedTimeout();
  const agentStreamRef = useRef<HTMLDivElement>(null);
  const agentMsgId = useRef(0);

  useEffect(() => {
    const stream = agentStreamRef.current;
    if (!stream) return;
    stream.scrollTop = stream.scrollHeight;
  }, [agentMessages, agentThinking]);

  const collapseAgent = useCallback(() => {
    if (agentMode !== "open") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAgentMode("closed");
      return;
    }
    setAgentMode("closing");
    scheduleCollapse(() => setAgentMode("closed"), AGENT_COLLAPSE_MS);
  }, [agentMode, scheduleCollapse]);

  const expandAgent = useCallback(() => {
    if (agentMode !== "closed" && agentMode !== "closing") return;
    clearCollapse();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAgentMode("open");
      return;
    }
    setAgentMode("opening");
    scheduleCollapse(() => setAgentMode("open"), AGENT_COLLAPSE_MS);
  }, [agentMode, clearCollapse, scheduleCollapse]);

  const sendAgentMessage = useCallback((raw: string) => {
    const prompt = raw.trim();
    if (!prompt || agentThinking === "on") return;
    const slideLabel = slideTitle || "当前页";
    const userId = `agent-user-${++agentMsgId.current}`;
    const replyId = `agent-reply-${++agentMsgId.current}`;
    setAgentMessages((current) => [...current, { id: userId, role: "user", text: prompt }]);
    setAgentDraft("");
    setAgentThinking("on");
    scheduleThink(() => {
      const reply = agentReplyFor(prompt, slideLabel);
      setAgentMessages((current) => [...current, { id: replyId, role: "assistant", ...reply }]);
      setAgentThinking("leaving");
      scheduleThink(() => {
        setAgentThinking("off");
      }, 280);
    }, AGENT_THINK_MS);
  }, [slideTitle, agentThinking, scheduleThink]);

  const resolvePreview = useCallback((messageId: string, status: Exclude<AgentPreviewStatus, "pending">) => {
    setAgentMessages((current) => current.map((message) => (
      message.id === messageId && message.previewStatus === "pending"
        ? { ...message, previewStatus: status }
        : message
    )));
  }, []);

  return {
    agentMode,
    agentDraft,
    setAgentDraft,
    agentMessages,
    agentThinking,
    agentStreamRef,
    agentDocked: agentMode === "closing" || agentMode === "closed",
    agentDockVisible: agentMode === "closing" || agentMode === "closed",
    collapseAgent,
    expandAgent,
    sendAgentMessage,
    resolvePreview,
  };
}
