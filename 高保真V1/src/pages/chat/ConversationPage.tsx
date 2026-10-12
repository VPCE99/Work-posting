import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useLocation, useParams } from "react-router-dom";
import { usePrototype } from "../../app/PrototypeContext";
import { ChatComposer } from "../../components/chat/ChatComposer";
import { fitColumnTemplate } from "../../components/chat/fitTableColumns";
import { PlanConfirmationCard } from "./PlanConfirmationCard";
import { ShareConversationDialog } from "./ShareConversationDialog";
import { replyForConversation } from "./conversationReplies";
import { planConfirmationProvider, type PlanConfirmation } from "./planConfirmation";
import { buildConversationShareSnapshot, sharePublisher, type SharePublication } from "./shareSnapshot";
import { emptyReplyView, reduceReplyStream, replyStreamer, replyViewFromMock, type ReplyView } from "./replyStream";
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
const PLAN_INTERRUPT_MS = 1800;
const MARKER_PREVIEW_CHARS = 30;

type ActivePlan = {
  anchorId: string;
  request: PlanConfirmation;
  selectedId: string | null;
};

type SendOrigin = { left: number; top: number; width: number; height: number };
type IntroStage = "fly" | "think" | "reveal" | "settled";
type ScrollMarker = { id: string; preview: string; topPct: number };
type ScrollThumb = { topPct: number; heightPct: number };

function previewForMarker(text: string, max = MARKER_PREVIEW_CHARS) {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max)}…`;
}

const exportFormats: Array<{ label: string; icon: MenuIconName }> = [
  { label: "PDF", icon: "file-text" },
  { label: "Word", icon: "file-text" },
  { label: "PPT", icon: "presentation" },
  { label: "长图", icon: "image" },
];

export function ConversationPage() {
  const { conversationId = "industry" } = useParams();
  const location = useLocation();
  const { conversations, pinnedConversationIds, togglePinnedConversation, renameConversation, notify } = usePrototype();
  const conversation = conversations.find((item) => item.id === conversationId);
  const sent = location.state as { prompt?: string; origin?: SendOrigin } | null;
  const fromNewSend = Boolean(sent?.prompt);
  const livePrompt = sent?.prompt ?? conversation?.prompt;
  const reply = replyForConversation(conversationId, livePrompt);
  const replyColumns = fitColumnTemplate(reply.table.map((row) => row.cells));
  const initialPrompt = livePrompt ?? reply.prompt;
  const [draft, setDraft] = useState("");
  const [introStage, setIntroStage] = useState<IntroStage>(fromNewSend ? "fly" : "settled");
  const [thinkingPhase, setThinkingPhase] = useState<"off" | "on" | "leaving">("off");
  const [followUpMessages, setFollowUpMessages] = useState<Array<{ id: number; text: string; turnIndex: number }>>([]);
  const [flyingFollowUpId, setFlyingFollowUpId] = useState<number | null>(null);
  const [followUpFlyToken, setFollowUpFlyToken] = useState(0);
  const userMessageRef = useRef<HTMLElement>(null);
  const streamRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const followUpBubbleRefs = useRef<Record<number, HTMLElement | null>>({});
  const followUpIdRef = useRef(0);
  const pendingFollowUpFlyId = useRef<number | null>(null);
  const sessionTurnRef = useRef(0);
  const awaitingPlanRef = useRef(false);
  const resumeAfterPlanRef = useRef<(() => void) | null>(null);
  const [pendingPlan, setPendingPlan] = useState<ActivePlan | null>(null);
  const [resolvedPlans, setResolvedPlans] = useState<ActivePlan[]>([]);
  const [answerView, setAnswerView] = useState<ReplyView | null>(() => (fromNewSend ? null : replyViewFromMock(reply)));
  const [streamRun, setStreamRun] = useState(0);
  const [chartFlows, setChartFlows] = useState(false);
  const streamAbortRef = useRef<AbortController | null>(null);
  const { schedule: scheduleTimeout, clear: clearTimeoutKey } = useTimeoutRegistry();
  const [online, setOnline] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [morePanel, setMorePanel] = useState<"actions" | "export">("actions");
  const [sharePublication, setSharePublication] = useState<SharePublication | null>(null);
  const [renamingTitle, setRenamingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const skipTitleCommit = useRef(false);
  const [scrollMarkers, setScrollMarkers] = useState<ScrollMarker[]>([]);
  const [streamScrollable, setStreamScrollable] = useState(false);
  const [scrollThumb, setScrollThumb] = useState<ScrollThumb>({ topPct: 0, heightPct: 100 });
  const headerActionsRef = useRef<HTMLDivElement>(null);
  const pinned = pinnedConversationIds.includes(conversationId);
  const displayedTitle = conversation?.title ?? "新对话";

  useEffect(() => {
    setRenamingTitle(false);
    setSharePublication(null);
    setPendingPlan(null);
    setResolvedPlans([]);
    sessionTurnRef.current = 0;
    awaitingPlanRef.current = false;
    resumeAfterPlanRef.current = null;
    streamAbortRef.current?.abort();
    setStreamRun(0);
    setChartFlows(false);
    setAnswerView(fromNewSend ? null : replyViewFromMock(reply));
    clearTimeoutKey("plan-interrupt");
    clearTimeoutKey("plan-show");
  }, [conversationId, clearTimeoutKey]);

  useEffect(() => {
    if (!renamingTitle) return;
    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  }, [renamingTitle]);

  const beginRename = () => {
    if (!conversation) return;
    skipTitleCommit.current = false;
    setTitleDraft(displayedTitle);
    setRenamingTitle(true);
  };

  const commitRename = () => {
    const cancelled = skipTitleCommit.current;
    skipTitleCommit.current = false;
    const next = (titleInputRef.current?.value ?? titleDraft).trim();
    setRenamingTitle(false);
    if (cancelled || !conversation || !next || next === displayedTitle) return;
    renameConversation(conversationId, next);
    notify("对话已重命名", "success");
  };

  const cancelRename = () => {
    skipTitleCommit.current = true;
    setRenamingTitle(false);
  };

  const refreshScrollChrome = () => {
    const stream = streamRef.current;
    if (!stream) return;
    const scrollHeight = stream.scrollHeight;
    const clientHeight = stream.clientHeight;
    const scrollable = scrollHeight > clientHeight + 1;
    setStreamScrollable(scrollable);
    if (!scrollable) {
      setScrollMarkers((current) => (current.length ? [] : current));
      setScrollThumb({ topPct: 0, heightPct: 100 });
      return;
    }
    const maxScroll = Math.max(1, scrollHeight - clientHeight);
    const heightPct = Math.min(100, Math.max(12, (clientHeight / scrollHeight) * 100));
    const topPct = Math.min(100 - heightPct, Math.max(0, (stream.scrollTop / maxScroll) * (100 - heightPct)));
    setScrollThumb({ topPct, heightPct });
    const turns = stream.querySelectorAll<HTMLElement>("[data-user-turn]");
    const next = Array.from(turns, (el) => {
      const id = el.dataset.userTurn ?? "";
      const preview = previewForMarker(el.dataset.preview || el.textContent || "");
      const topPctMarker = Math.min(100, Math.max(0, (el.offsetTop / scrollHeight) * 100));
      return { id, preview, topPct: topPctMarker };
    }).filter((item) => item.id);
    setScrollMarkers(next);
  };

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

  const clearPlanTimers = () => {
    clearTimeoutKey("plan-interrupt");
    clearTimeoutKey("plan-show");
  };

  const beginThinking = (onDone?: () => void) => {
    clearThinkingTimers();
    setThinkingPhase("on");
    scheduleTimeout("thinking", () => {
      setThinkingPhase("leaving");
      scheduleTimeout("thinking-fade", () => {
        setThinkingPhase("off");
        onDone?.();
      }, THINK_FADE_MS);
    }, THINK_MS);
  };

  const startAgentTurn = (anchorId: string, prompt: string, turnIndex: number, onDone?: () => void) => {
    const request = planConfirmationProvider({ conversationId, turnIndex, prompt });
    if (!request) {
      beginThinking(onDone);
      return;
    }
    awaitingPlanRef.current = true;
    resumeAfterPlanRef.current = onDone ?? null;
    clearThinkingTimers();
    clearPlanTimers();
    setThinkingPhase("on");
    scheduleTimeout("plan-interrupt", () => {
      setThinkingPhase("leaving");
      scheduleTimeout("plan-show", () => {
        setThinkingPhase("off");
        setPendingPlan({ anchorId, request, selectedId: null });
      }, THINK_FADE_MS);
    }, PLAN_INTERRUPT_MS);
  };

  const confirmPlan = () => {
    if (!pendingPlan?.selectedId) return;
    const selectedId = pendingPlan.selectedId;
    setResolvedPlans((items) => [...items, { ...pendingPlan, selectedId }]);
    setPendingPlan(null);
    awaitingPlanRef.current = false;
    const resume = resumeAfterPlanRef.current ?? undefined;
    resumeAfterPlanRef.current = null;
    beginThinking(resume);
  };

  const beginAnswerStream = () => {
    setIntroStage("reveal");
    setStreamRun((run) => run + 1);
  };

  const replyRef = useRef(reply);
  replyRef.current = reply;
  const initialPromptRef = useRef(initialPrompt);
  initialPromptRef.current = initialPrompt;

  useEffect(() => {
    if (streamRun === 0) return;
    const controller = new AbortController();
    streamAbortRef.current?.abort();
    streamAbortRef.current = controller;
    const snapshot = replyRef.current;
    const prompt = initialPromptRef.current;
    let cancelled = false;
    const run = async () => {
      let view = emptyReplyView();
      try {
        for await (const event of replyStreamer({
          conversationId,
          prompt,
          reply: snapshot,
          signal: controller.signal,
        })) {
          if (cancelled) return;
          view = reduceReplyStream(view, event);
          setAnswerView({ ...view, insights: view.insights.map((item) => ({ ...item })) });
          if (event.type === "chart") setChartFlows(true);
          if (event.type === "done") setIntroStage("settled");
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        throw error;
      }
    };
    void run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [streamRun, conversationId]);

  useLayoutEffect(() => {
    if (!fromNewSend) return;
    const bubble = userMessageRef.current;
    if (!bubble) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    bubble.scrollIntoView({ block: "nearest", behavior: "auto" });
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
      setAnswerView(replyViewFromMock(reply));
      setIntroStage("settled");
      setThinkingPhase("off");
      return;
    }

    setIntroStage("fly");
    setThinkingPhase("off");
    // Thinking starts only after the user bubble has fully settled.
    scheduleTimeout("intro-think", () => {
      setIntroStage("think");
      const turnIndex = ++sessionTurnRef.current;
      const request = planConfirmationProvider({ conversationId, turnIndex, prompt: initialPrompt });
      if (!request) {
        setThinkingPhase("on");
        return;
      }
      clearTimeoutKey("intro-leave");
      clearTimeoutKey("intro-reveal");
      clearTimeoutKey("intro-settle");
      awaitingPlanRef.current = true;
      resumeAfterPlanRef.current = () => {
        beginAnswerStream();
      };
      setThinkingPhase("on");
      scheduleTimeout("plan-interrupt", () => {
        setThinkingPhase("leaving");
        scheduleTimeout("plan-show", () => {
          setThinkingPhase("off");
          setPendingPlan({ anchorId: "initial", request, selectedId: null });
        }, THINK_FADE_MS);
      }, PLAN_INTERRUPT_MS);
    }, FLY_MS);
    scheduleTimeout("intro-leave", () => setThinkingPhase("leaving"), FLY_MS + THINK_MS);
    scheduleTimeout("intro-reveal", () => {
      setThinkingPhase("off");
      beginAnswerStream();
    }, FLY_MS + THINK_MS + THINK_FADE_MS);
    return () => {
      clearTimeoutKey("intro-think");
      clearTimeoutKey("intro-leave");
      clearTimeoutKey("intro-reveal");
      clearTimeoutKey("intro-settle");
      clearTimeoutKey("plan-interrupt");
      clearTimeoutKey("plan-show");
    };
  }, [fromNewSend, conversationId, initialPrompt, scheduleTimeout, clearTimeoutKey]);

  useLayoutEffect(() => {
    if (followUpFlyToken === 0) return;
    const id = pendingFollowUpFlyId.current;
    if (id == null) return;
    const bubble = followUpBubbleRefs.current[id];
    if (!bubble) return;

    const thinkKey = `followup-think-${id}`;
    const sentTurn = followUpMessages.find((item) => item.id === id);
    const messageText = sentTurn?.text ?? "";
    const turnIndex = sentTurn?.turnIndex ?? sessionTurnRef.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pendingFollowUpFlyId.current = null;
      setFlyingFollowUpId(null);
      startAgentTurn(`followup-${id}`, messageText, turnIndex);
      return;
    }

    const stream = streamRef.current;
    if (stream) stream.scrollTop = stream.scrollHeight;
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
      try {
        animation.commitStyles();
      } catch {
        /* ignore browsers without commitStyles */
      }
      bubble.style.transform = "";
      animation.cancel();
      pendingFollowUpFlyId.current = null;
      setFlyingFollowUpId(null);
      startAgentTurn(`followup-${id}`, messageText, turnIndex);
      refreshScrollChrome();
    }, FLY_MS);
    return () => {
      animation.cancel();
      clearTimeoutKey(thinkKey);
    };
  }, [followUpFlyToken, followUpMessages, scheduleTimeout, clearTimeoutKey]);

  useLayoutEffect(() => {
    refreshScrollChrome();
    const stream = streamRef.current;
    if (!stream) return;
    if (pendingPlan || (answerView && !answerView.done)) stream.scrollTop = stream.scrollHeight;
  }, [followUpMessages, introStage, thinkingPhase, initialPrompt, pendingPlan, resolvedPlans, answerView]);

  useEffect(() => {
    const stream = streamRef.current;
    if (!stream) return;
    const onScroll = () => refreshScrollChrome();
    stream.addEventListener("scroll", onScroll, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => refreshScrollChrome());
    observer?.observe(stream);
    return () => {
      stream.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, []);

  const renderPlans = (anchorId: string) => (
    <>
      {resolvedPlans.filter((item) => item.anchorId === anchorId).map((item) => (
        <PlanConfirmationCard key={item.request.id} confirmation={item.request} selectedId={item.selectedId} resolved />
      ))}
      {pendingPlan?.anchorId === anchorId && (
        <PlanConfirmationCard
          confirmation={pendingPlan.request}
          selectedId={pendingPlan.selectedId}
          onSelect={(optionId) => setPendingPlan((current) => (current && current.anchorId === anchorId ? { ...current, selectedId: optionId } : current))}
          onConfirm={confirmPlan}
        />
      )}
    </>
  );

  const submit = () => {
    if (!draft.trim()) return;
    if (pendingPlan || awaitingPlanRef.current) return;
    if (introStage === "fly" || introStage === "think") return;
    const text = draft.trim();
    setDraft("");
    clearThinkingTimers();
    setThinkingPhase("off");
    const id = ++followUpIdRef.current;
    const turnIndex = ++sessionTurnRef.current;
    pendingFollowUpFlyId.current = id;
    setFollowUpMessages((messages) => [...messages, { id, text, turnIndex }]);
    setFlyingFollowUpId(id);
    setFollowUpFlyToken((token) => token + 1);
  };

  return (
    <section className="conversation-page">
        <header className="conversation-compact-header">
          {renamingTitle ? (
            <form
              className="conversation-title-form"
              onSubmit={(event) => {
                event.preventDefault();
                commitRename();
              }}
            >
              <input
                ref={titleInputRef}
                className="conversation-title-input"
                value={titleDraft}
                maxLength={40}
                aria-label="对话名称"
                onChange={(event) => setTitleDraft(event.target.value)}
                onBlur={commitRename}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    cancelRename();
                  }
                }}
              />
            </form>
          ) : (
            <button type="button" className="conversation-title" onClick={beginRename}>
              {displayedTitle}
            </button>
          )}
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
                        const plans = [
                          ...resolvedPlans.map((item) => ({
                            anchorId: item.anchorId,
                            question: item.request.question,
                            answer: item.request.options.find((option) => option.id === item.selectedId)?.label ?? null,
                          })),
                          ...(pendingPlan ? [{
                            anchorId: pendingPlan.anchorId,
                            question: pendingPlan.request.question,
                            answer: pendingPlan.request.options.find((option) => option.id === pendingPlan.selectedId)?.label ?? null,
                          }] : []),
                        ];
                        setSharePublication(sharePublisher(buildConversationShareSnapshot({
                          conversationId,
                          title: displayedTitle,
                          prompt: initialPrompt,
                          followUps: followUpMessages.map((message) => ({ id: message.id, text: message.text })),
                          plans,
                          answer: answerView ? {
                            agent: answerView.agent,
                            title: answerView.title,
                            insights: answerView.insights,
                            table: answerView.table ? { label: reply.tableLabel, rows: reply.table.map((row) => row.cells) } : null,
                            chart: answerView.chart ? { title: reply.chartTitle, range: reply.chartRange, caption: reply.chartCaption } : null,
                          } : null,
                        })));
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

        <div className="message-stream-shell">
        <div className="message-stream" ref={streamRef}>
          <div className="message-stream__column">
          <article
            ref={userMessageRef}
            data-user-turn="initial"
            data-preview={initialPrompt}
            className={introStage === "fly" ? "message message--user message--user-flying" : "message message--user"}
          >
            <p>{initialPrompt}</p>
          </article>
          {renderPlans("initial")}
          {answerView?.agent && <article className="message message--assistant rich-response" aria-busy={!answerView.done}>
            <header className="rich-response__header">
              <span className="rich-response__agent-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3-1.8 5.4a2 2 0 0 1-1.3 1.3L3.5 11.5l5.4 1.8a2 2 0 0 1 1.3 1.3L12 20l1.8-5.4a2 2 0 0 1 1.3-1.3l5.4-1.8-5.4-1.8a2 2 0 0 1-1.3-1.3L12 3Z" /></svg></span>
              <div>
                <small>{answerView.agent}</small>
                <h2>
                  {answerView.title}
                  {!answerView.done && answerView.insights.length === 0 && <span className="reply-stream-caret" aria-hidden="true" />}
                </h2>
              </div>
            </header>
            {(answerView.insights.length > 0 || answerView.table || answerView.chart) && (
            <div className="rich-response__body">
              <section className="rich-response__insights" aria-label="核心结论">
                {answerView.insights.map((item, index) => (
                  <article key={`${item.title}-${index}`}><strong>0{index + 1}</strong><div><h3>{item.title}</h3><p>{item.body}{!answerView.done && !answerView.table && index === answerView.insights.length - 1 && <span className="reply-stream-caret" aria-hidden="true" />}</p></div></article>
                ))}
                {answerView.table && (
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
                )}
              </section>
              {answerView.chart && (
              <section className={chartFlows ? "reit-chart reit-chart--flow" : "reit-chart"} aria-label={`${reply.chartTitle}趋势图`}>
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
              )}
            </div>
            )}
            {answerView.actions && (
            <div className="message__actions">
              <button onClick={() => notify("已复制回答", "success")}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>复制</button>
              <button onClick={() => notify("感谢反馈", "success")}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10v12" /><path d="M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 7A2 2 0 0 1 17.5 21H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h2.8L10 2h0a3.1 3.1 0 0 1 3 3.9Z" /></svg>有帮助</button>
              <button onClick={() => beginThinking()}><Icon name="refresh-cw" strokeWidth={1.8} />重新生成</button>
            </div>
            )}
          </article>}
          {followUpMessages.map((message) => (
            <div key={message.id} className="conversation-turn">
            <article
              ref={(node) => {
                followUpBubbleRefs.current[message.id] = node;
              }}
              data-user-turn={`followup-${message.id}`}
              data-preview={message.text}
              className={flyingFollowUpId === message.id ? "message message--user message--user-flying" : "message message--user"}
            >
              <p>{message.text}</p>
            </article>
            {renderPlans(`followup-${message.id}`)}
            </div>
          ))}
          {answerView?.done && thinkingPhase === "off" && flyingFollowUpId == null && !pendingPlan && (
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
        </div>
        {streamScrollable && (
          <div
            className="conversation-scroll-rail"
            aria-label="对话滚动条"
            onClick={(event) => {
              if (event.target !== event.currentTarget) return;
              const stream = streamRef.current;
              if (!stream) return;
              const rect = event.currentTarget.getBoundingClientRect();
              const ratio = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
              const maxScroll = Math.max(0, stream.scrollHeight - stream.clientHeight);
              stream.scrollTo({ top: ratio * maxScroll, behavior: "smooth" });
            }}
          >
            <div
              className="conversation-scroll-thumb"
              style={{ top: `${scrollThumb.topPct}%`, height: `${scrollThumb.heightPct}%` }}
            />
            {scrollMarkers.map((marker) => (
              <button
                key={marker.id}
                type="button"
                className="conversation-scroll-marker"
                style={{ top: `calc(5px + (100% - 10px) * ${marker.topPct} / 100)` }}
                aria-label={`跳转到：${marker.preview}`}
                onClick={(event) => {
                  event.stopPropagation();
                  const target = streamRef.current?.querySelector<HTMLElement>(`[data-user-turn="${marker.id}"]`);
                  target?.scrollIntoView({ block: "start", behavior: "smooth" });
                }}
              >
                <span className="conversation-scroll-marker__tip">{marker.preview}</span>
              </button>
            ))}
          </div>
        )}
        </div>

        {sharePublication && (
          <ShareConversationDialog
            publication={sharePublication}
            onClose={() => setSharePublication(null)}
            onCopy={(copied) => notify(copied ? "分享链接已复制" : "请手动选中链接后复制", copied ? "success" : "neutral")}
          />
        )}

        <footer className="conversation-composer-dock">
          <ChatComposer className="composer--sticky" composerRef={composerRef} value={draft} onChange={setDraft} onSubmit={submit} placeholder={pendingPlan ? "请先确认上方的选项" : "继续追问；输入 / 调用技能"} online={online} onToggleOnline={() => setOnline((current) => !current)} modelPlacement="up" />
          <p className="conversation-privacy">端到端会话隔离 · 数据仅用于当前工作区</p>
        </footer>
    </section>
  );
}
