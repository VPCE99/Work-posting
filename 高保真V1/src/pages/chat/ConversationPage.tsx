import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useLocation, useParams } from "react-router-dom";
import { usePrototype } from "../../app/PrototypeContext";
import { ChatComposer } from "../../components/chat/ChatComposer";
import { fitColumnTemplate } from "../../components/chat/fitTableColumns";
import { replyForConversation } from "./conversationReplies";
import { Icon } from "../../components/ui/Icon";
import { MenuIcon, type MenuIconName } from "../../components/ui/MenuIcon";
import { Reveal } from "../../components/ui/Reveal";
import { ThinkingMark } from "../../components/ui/ThinkingMark";
import { useDismissibleLayer } from "../../components/ui/useDismissibleLayer";
import { useEscapeKey } from "../../components/ui/useEscapeKey";
import { useTimeoutRegistry } from "../../components/ui/useManagedTimeout";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const FLY_MS = 680;
const THINK_MS = 8000;
const THINK_FADE_MS = 480;
const REVEAL_MS = 780;

type SendOrigin = { left: number; top: number; width: number; height: number };
type IntroStage = "fly" | "think" | "reveal" | "settled";

const exportFormats: Array<{ label: string; icon: MenuIconName }> = [
  { label: "PDF", icon: "file-text" },
  { label: "Word", icon: "file-text" },
  { label: "PPT", icon: "presentation" },
  { label: "长图", icon: "image" },
];

export function ConversationPage() {
  const { conversationId = "industry" } = useParams();
  const location = useLocation();
  const { conversations, pinnedConversationIds, togglePinnedConversation, notify } = usePrototype();
  const conversation = conversations.find((item) => item.id === conversationId);
  const sent = location.state as { prompt?: string; origin?: SendOrigin } | null;
  const fromNewSend = Boolean(sent?.prompt);
  const reply = replyForConversation(conversationId, sent?.prompt);
  const replyColumns = fitColumnTemplate(reply.table.map((row) => row.cells));
  const initialPrompt = sent?.prompt ?? reply.prompt;
  const [draft, setDraft] = useState("");
  const [introStage, setIntroStage] = useState<IntroStage>(fromNewSend ? "fly" : "settled");
  const [thinkingPhase, setThinkingPhase] = useState<"off" | "on" | "leaving">("off");
  const [followUpMessages, setFollowUpMessages] = useState<Array<{ id: number; text: string }>>([]);
  const [flyingFollowUpId, setFlyingFollowUpId] = useState<number | null>(null);
  const [followUpFlyToken, setFollowUpFlyToken] = useState(0);
  const userMessageRef = useRef<HTMLElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const followUpBubbleRefs = useRef<Record<number, HTMLElement | null>>({});
  const followUpIdRef = useRef(0);
  const pendingFollowUpFlyId = useRef<number | null>(null);
  const { schedule: scheduleTimeout, clear: clearTimeoutKey } = useTimeoutRegistry();
  const [online, setOnline] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [morePanel, setMorePanel] = useState<"actions" | "export">("actions");
  const headerActionsRef = useRef<HTMLDivElement>(null);
  const pinned = pinnedConversationIds.includes(conversationId);

  useDismissibleLayer(moreOpen, () => {
    setMoreOpen(false);
    setMorePanel("actions");
  }, [headerActionsRef]);
  useEscapeKey(moreOpen, () => {
    if (morePanel === "export") {
      setMorePanel("actions");
      return;
    }
    setMoreOpen(false);
  });

  const clearThinkingTimers = () => {
    clearTimeoutKey("thinking");
    clearTimeoutKey("thinking-fade");
  };

  const beginThinking = () => {
    clearThinkingTimers();
    setThinkingPhase("on");
    scheduleTimeout("thinking", () => {
      setThinkingPhase("leaving");
      scheduleTimeout("thinking-fade", () => {
        setThinkingPhase("off");
      }, THINK_FADE_MS);
    }, THINK_MS);
  };

  useLayoutEffect(() => {
    if (!fromNewSend) return;
    const bubble = userMessageRef.current;
    if (!bubble) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bubbleRect = bubble.getBoundingClientRect();
    const origin = sent?.origin;
    const dx = origin ? origin.left + 16 - bubbleRect.left : 0;
    const dy = origin ? origin.top + 14 - bubbleRect.top : 72;
    const animation = bubble.animate(
      [
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: "translate(0px, 0px)" },
      ],
      { duration: FLY_MS, easing: EASE, fill: "both" },
    );
    return () => animation.cancel();
  }, [fromNewSend, sent?.origin]);

  useEffect(() => {
    if (!fromNewSend) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIntroStage("settled");
      setThinkingPhase("off");
      return;
    }

    setIntroStage("fly");
    setThinkingPhase("off");
    // Thinking starts only after the user bubble has fully settled.
    scheduleTimeout("intro-think", () => {
      setIntroStage("think");
      setThinkingPhase("on");
    }, FLY_MS);
    scheduleTimeout("intro-leave", () => setThinkingPhase("leaving"), FLY_MS + THINK_MS);
    scheduleTimeout("intro-reveal", () => {
      setThinkingPhase("off");
      setIntroStage("reveal");
    }, FLY_MS + THINK_MS + THINK_FADE_MS);
    scheduleTimeout("intro-settle", () => setIntroStage("settled"), FLY_MS + THINK_MS + THINK_FADE_MS + REVEAL_MS);
    return () => {
      clearTimeoutKey("intro-think");
      clearTimeoutKey("intro-leave");
      clearTimeoutKey("intro-reveal");
      clearTimeoutKey("intro-settle");
    };
  }, [fromNewSend, scheduleTimeout, clearTimeoutKey]);

  useLayoutEffect(() => {
    if (followUpFlyToken === 0) return;
    const id = pendingFollowUpFlyId.current;
    if (id == null) return;
    const bubble = followUpBubbleRefs.current[id];
    if (!bubble) return;

    const thinkKey = `followup-think-${id}`;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pendingFollowUpFlyId.current = null;
      setFlyingFollowUpId(null);
      beginThinking();
      return;
    }

    const bubbleRect = bubble.getBoundingClientRect();
    const origin = composerRef.current?.getBoundingClientRect();
    const dx = origin ? origin.left + 16 - bubbleRect.left : 0;
    const dy = origin ? origin.top + 14 - bubbleRect.top : 72;
    const animation = bubble.animate(
      [
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: "translate(0px, 0px)" },
      ],
      { duration: FLY_MS, easing: EASE, fill: "both" },
    );
    // Keep fly token stable until the next send so cleanup does not cancel a finished settle.
    scheduleTimeout(thinkKey, () => {
      pendingFollowUpFlyId.current = null;
      setFlyingFollowUpId(null);
      beginThinking();
    }, FLY_MS);
    return () => {
      animation.cancel();
      clearTimeoutKey(thinkKey);
    };
  }, [followUpFlyToken, scheduleTimeout, clearTimeoutKey]);

  const submit = () => {
    if (!draft.trim()) return;
    if (introStage === "fly" || introStage === "think") return;
    const text = draft.trim();
    setDraft("");
    clearThinkingTimers();
    setThinkingPhase("off");
    const id = ++followUpIdRef.current;
    pendingFollowUpFlyId.current = id;
    setFollowUpMessages((messages) => [...messages, { id, text }]);
    setFlyingFollowUpId(id);
    setFollowUpFlyToken((token) => token + 1);
  };

  return (
    <section className="conversation-page">
        <header className="conversation-compact-header">
          <strong>{conversation?.title ?? "新对话"}</strong>
          <div className="conversation-compact-actions" ref={headerActionsRef}>
            <div className="popover-anchor">
              <button
                type="button"
                className="conversation-icon-action conversation-icon-action--square"
                aria-label="更多操作"
                aria-expanded={moreOpen}
                onClick={() => {
                  setMoreOpen((open) => {
                    const next = !open;
                    if (next) setMorePanel("actions");
                    return next;
                  });
                }}
              >
                <svg className="conversation-more-dots" viewBox="0 0 16 16" aria-hidden="true">
                  <circle cx="2" cy="8" r="1" />
                  <circle cx="8" cy="8" r="1" />
                  <circle cx="14" cy="8" r="1" />
                </svg>
              </button>
              <Reveal
                open={moreOpen}
                className={`menu-popover conversation-header-menu conversation-more-menu${morePanel === "export" ? " conversation-more-menu--export" : ""}`}
                role="menu"
                aria-label={morePanel === "export" ? "导出格式" : "更多对话操作"}
              >
                {morePanel === "export" ? (
                  <>
                    <button type="button" role="menuitem" onClick={() => setMorePanel("actions")}><span>← 返回</span></button>
                    {exportFormats.map((item) => (
                      <button
                        type="button"
                        role="menuitem"
                        key={item.label}
                        onClick={() => {
                          notify(`已创建 ${item.label} 导出任务`, "success");
                          setMoreOpen(false);
                          setMorePanel("actions");
                        }}
                      >
                        <MenuIcon name={item.icon} /><span>{item.label}</span>
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        togglePinnedConversation(conversationId);
                        setMoreOpen(false);
                        notify(pinned ? "已取消置顶" : "对话已置顶", "success");
                      }}
                    >
                      <MenuIcon name="pin" /><span>{pinned ? "取消置顶" : "置顶对话"}</span>
                    </button>
                    <button type="button" role="menuitem" onClick={() => setMorePanel("export")}>
                      <MenuIcon name="upload" /><span>导出</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        notify("分享功能即将接入，敬请期待");
                        setMoreOpen(false);
                      }}
                    >
                      <MenuIcon name="share" /><span>分享对话</span>
                    </button>
                  </>
                )}
              </Reveal>
            </div>
          </div>
        </header>

        <div className="message-stream">
          <article ref={userMessageRef} className={introStage === "fly" ? "message message--user message--user-flying" : "message message--user"}><p>{initialPrompt}</p></article>
          {(introStage === "reveal" || introStage === "settled") && <article className={introStage === "reveal" ? "message message--assistant rich-response answer-reveal" : "message message--assistant rich-response"}>
            <header className="rich-response__header">
              <span className="rich-response__agent-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3-1.8 5.4a2 2 0 0 1-1.3 1.3L3.5 11.5l5.4 1.8a2 2 0 0 1 1.3 1.3L12 20l1.8-5.4a2 2 0 0 1 1.3-1.3l5.4-1.8-5.4-1.8a2 2 0 0 1-1.3-1.3L12 3Z" /></svg></span>
              <div><small>{reply.agent}</small><h2>{reply.title}</h2></div>
            </header>
            <div className="rich-response__body">
              <section className="rich-response__insights" aria-label="核心结论">
                {reply.insights.map((item, index) => (
                  <article key={item.title}><strong>0{index + 1}</strong><div><h3>{item.title}</h3><p>{item.body}</p></div></article>
                ))}
                <div className="reit-data-table" role="table" aria-label={reply.tableLabel} style={{ "--fit-columns": replyColumns } as CSSProperties}>
                  {reply.table.map((row, rowIndex) => (
                    <div className={rowIndex === 0 ? "reit-data-table__row reit-data-table__head" : "reit-data-table__row"} role="row" key={row.cells.join("-")}>
                      {row.cells.map((cell, cellIndex) => {
                        const emphasized = row.emphasize?.includes(cellIndex);
                        return emphasized ? <strong role="cell" key={cell}>{cell}</strong> : <span role="cell" key={cell}>{cell}</span>;
                      })}
                    </div>
                  ))}
                </div>
              </section>
              <section className="reit-chart" aria-label={`${reply.chartTitle}趋势图`}>
                <div className="reit-chart__title"><strong>{reply.chartTitle}</strong><small>{reply.chartRange}</small></div>
                <div className="reit-chart__legend"><span><i />{reply.legend[0]}</span><span><i />{reply.legend[1]}</span></div>
                <svg viewBox="0 0 296 194" role="img" aria-label={reply.chartCaption}>
                  <g className="reit-chart__grid"><path d="M0 16H296" /><path d="M0 64H296" /><path d="M0 112H296" /><path d="M0 160H296" /></g>
                  <g className="reit-chart__bars"><rect x="36" y="82" width="28" height="78" /><rect x="126" y="54" width="28" height="106" /><rect x="216" y="22" width="28" height="138" /></g>
                  <path className="reit-chart__line" d="M50 108 140 64 230 30" />
                  <g className="reit-chart__points"><circle cx="50" cy="108" r="4" /><circle cx="140" cy="64" r="4" /><circle cx="230" cy="30" r="4" /></g>
                  <g className="reit-chart__labels"><text x="33" y="182">{reply.labels[0]}</text><text x="123" y="182">{reply.labels[1]}</text><text x="213" y="182">{reply.labels[2]}</text></g>
                </svg>
              </section>
            </div>
            <div className="message__actions">
              <button onClick={() => notify("已复制回答", "success")}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>复制</button>
              <button onClick={() => notify("感谢反馈", "success")}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10v12" /><path d="M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 7A2 2 0 0 1 17.5 21H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h2.8L10 2h0a3.1 3.1 0 0 1 3 3.9Z" /></svg>有帮助</button>
              <button onClick={beginThinking}><Icon name="refresh-cw" strokeWidth={1.8} />重新生成</button>
            </div>
          </article>}
          {followUpMessages.map((message) => (
            <article
              key={message.id}
              ref={(node) => {
                followUpBubbleRefs.current[message.id] = node;
              }}
              className={flyingFollowUpId === message.id ? "message message--user message--user-flying" : "message message--user"}
            >
              <p>{message.text}</p>
            </article>
          ))}
          {(introStage === "reveal" || introStage === "settled") && thinkingPhase === "off" && flyingFollowUpId == null && (
            <div className="conversation-followups">
              <p className="conversation-followups__label">试试这样追问</p>
              <div className="conversation-followups__grid prompt-grid" aria-label="建议追问">
                {reply.followUps.map((item) => (
                  <button key={item} type="button" onClick={() => setDraft(item)}>{item}</button>
                ))}
              </div>
            </div>
          )}
          {thinkingPhase !== "off" && <ThinkingMark intro={introStage === "think"} leaving={thinkingPhase === "leaving"} />}
        </div>

        <footer className="conversation-composer-dock">
          <ChatComposer className="composer--sticky" composerRef={composerRef} value={draft} onChange={setDraft} onSubmit={submit} placeholder="继续追问；输入 / 调用技能" online={online} onToggleOnline={() => setOnline((current) => !current)} modelPlacement="up" />
          <p className="conversation-privacy">端到端会话隔离 · 数据仅用于当前工作区</p>
        </footer>
    </section>
  );
}
