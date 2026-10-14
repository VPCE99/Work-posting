import type { RefObject } from "react";
import { Brand } from "../../../components/ui/Brand";
import { ChatComposer } from "../../../components/chat/ChatComposer";
import { ThinkingMark } from "../../../components/ui/ThinkingMark";
import { LucideIcon } from "../icons/LucideIcon";
import { ChartMiniPreview } from "./ChartMiniPreview";
import {
  agentQuickActions,
  type AgentChatMessage,
  type AgentPanelMode,
  type AgentPreviewStatus,
} from "../model";

export function AgentPanel({
  agentMode,
  agentMessages,
  agentThinking,
  agentDraft,
  agentStreamRef,
  onCollapse,
  onDraftChange,
  onSend,
  onConfirmPreview,
  onDiscardPreview,
}: {
  agentMode: AgentPanelMode;
  agentMessages: AgentChatMessage[];
  agentThinking: "off" | "on" | "leaving";
  agentDraft: string;
  agentStreamRef: RefObject<HTMLDivElement | null>;
  onCollapse: () => void;
  onDraftChange: (value: string) => void;
  onSend: (prompt: string) => void;
  onConfirmPreview: (messageId: string, kind: "chart" | "image") => void;
  onDiscardPreview: (messageId: string) => void;
}) {
  return (
    <aside
      className={
        agentMode === "closed"
          ? "ppt-agent ppt-agent--collapsing ppt-agent--closed"
          : agentMode === "closing"
            ? "ppt-agent ppt-agent--collapsing"
            : agentMode === "opening"
              ? "ppt-agent ppt-agent--expanding"
              : "ppt-agent"
      }
      aria-label="AI 助手"
      aria-hidden={agentMode === "closed"}
      inert={agentMode === "closed" || agentMode === "closing" ? true : undefined}
    >
      <header className="ppt-agent-tabs">
        <h2>AI 助手</h2>
        <button
          type="button"
          className="ppt-agent-collapse"
          aria-label="收起 AI 助手"
          title="收起"
          onClick={onCollapse}
        >
          <LucideIcon name="chevron-right" size={16} />
        </button>
      </header>
      <div className="ppt-agent-main">
        <div className="ppt-agent__stream message-stream" ref={agentStreamRef} aria-live="polite">
          {agentMessages.map((message) => (
            message.role === "user" ? (
              <article className="message message--user ppt-agent__bubble" key={message.id}>
                <p>{message.text}</p>
              </article>
            ) : (
              <article className="message message--assistant ppt-agent__bubble" key={message.id}>
                <header className="ppt-agent__reply-head">
                  <span className="rich-response__agent-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="m12 3-1.8 5.4a2 2 0 0 1-1.3 1.3L3.5 11.5l5.4 1.8a2 2 0 0 1 1.3 1.3L12 20l1.8-5.4a2 2 0 0 1 1.3-1.3l5.4-1.8-5.4-1.8a2 2 0 0 1-1.3-1.3L12 3Z" /></svg>
                  </span>
                  <strong>{message.title ?? "AI 助手"}</strong>
                </header>
                <p>{message.text}</p>
                {message.preview && (
                  <AgentAssetPreviewCard
                    message={message}
                    onConfirm={() => onConfirmPreview(message.id, message.preview!.kind)}
                    onDiscard={() => onDiscardPreview(message.id)}
                  />
                )}
              </article>
            )
          ))}
          {agentThinking !== "off" && (
            <ThinkingMark intro={agentThinking === "on"} leaving={agentThinking === "leaving"} />
          )}
        </div>
        <div className="ppt-agent__composer-wrap">
          <div className="editor-quick-actions" aria-label="快捷指令">
            {agentQuickActions.map((action) => (
              <button
                type="button"
                key={action.label}
                disabled={agentThinking === "on"}
                onClick={() => onSend(action.prompt)}
              >
                {action.label}
              </button>
            ))}
          </div>
          <ChatComposer
            className="composer--agent"
            compact
            rows={2}
            value={agentDraft}
            onChange={onDraftChange}
            onSubmit={() => onSend(agentDraft)}
            placeholder="描述你想如何修改当前页…"
          />
        </div>
      </div>
      <span className="ppt-agent__morph-logo" aria-hidden="true"><Brand compact /></span>
    </aside>
  );
}

function previewStatusLabel(status: AgentPreviewStatus | undefined) {
  if (status === "inserted") return "已插入当前页";
  if (status === "discarded") return "已放弃本次生成";
  return null;
}

function AgentAssetPreviewCard({
  message,
  onConfirm,
  onDiscard,
}: {
  message: AgentChatMessage;
  onConfirm: () => void;
  onDiscard: () => void;
}) {
  const preview = message.preview;
  if (!preview) return null;
  const status = message.previewStatus ?? "pending";
  const settled = status !== "pending";
  const statusLabel = previewStatusLabel(status);

  return (
    <div className={`ppt-agent-preview${settled ? ` ppt-agent-preview--${status}` : ""}`}>
      <div className="ppt-agent-preview__media" aria-hidden="true">
        {preview.kind === "chart" ? (
          <ChartMiniPreview chartType={preview.chartType ?? "column"} />
        ) : (
          <div className="ppt-agent-preview__image">
            <LucideIcon name="image" size={28} />
            <span>示意图预览</span>
          </div>
        )}
      </div>
      <div className="ppt-agent-preview__meta">
        <strong>{preview.kind === "chart" ? "图表预览" : "图片预览"}</strong>
        <small>{preview.caption}</small>
      </div>
      {settled ? (
        <p className="ppt-agent-preview__status">{statusLabel}</p>
      ) : (
        <div className="ppt-agent-preview__actions">
          <button type="button" className="button" onClick={onDiscard}>放弃</button>
          <button type="button" className="button button--primary" onClick={onConfirm}>
            插入当前页
          </button>
        </div>
      )}
    </div>
  );
}
