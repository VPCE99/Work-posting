import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useLocation, useParams } from "react-router-dom";
import { usePrototype } from "../../app/PrototypeContext";
import { ChatComposer } from "../../components/chat/ChatComposer";
import { fitColumnTemplate } from "../../components/chat/fitTableColumns";
import { MenuIcon, type MenuIconName } from "../../components/ui/MenuIcon";
import { Reveal } from "../../components/ui/Reveal";
import { ThinkingMark } from "../../components/ui/ThinkingMark";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const FLY_MS = 680;
const THINK_MS = 8000;
const THINK_FADE_MS = 480;
const REVEAL_MS = 780;

type SendOrigin = { left: number; top: number; width: number; height: number };
type IntroStage = "fly" | "think" | "reveal" | "settled";

const reitTable: Array<{ cells: string[]; emphasize?: number[] }> = [
  { cells: ["年度", "平均出租率", "营业收入"] },
  { cells: ["2023", "89.6%", "26.6 亿元"], emphasize: [1] },
  { cells: ["2024", "91.7%", "28.9 亿元"], emphasize: [1] },
  { cells: ["2025", "93.8%", "31.4 亿元"], emphasize: [1] },
];
const reitTableColumns = fitColumnTemplate(reitTable.map((row) => row.cells));

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
  const initialPrompt = sent?.prompt ?? "请分析近三年产业园 REITs 的出租率和收入变化，并总结主要结论。";
  const [draft, setDraft] = useState("");
  const [introStage, setIntroStage] = useState<IntroStage>(fromNewSend ? "fly" : "settled");
  const [thinkingPhase, setThinkingPhase] = useState<"off" | "on" | "leaving">(fromNewSend ? "on" : "off");
  const userMessageRef = useRef<HTMLElement>(null);
  const thinkingTimer = useRef<number | null>(null);
  const thinkingFadeTimer = useRef<number | null>(null);
  const [online, setOnline] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const headerActionsRef = useRef<HTMLDivElement>(null);
  const pinned = pinnedConversationIds.includes(conversationId);

  useEffect(() => {
    if (!exportOpen && !moreOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!headerActionsRef.current?.contains(event.target as Node)) {
        setExportOpen(false);
        setMoreOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExportOpen(false);
        setMoreOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [exportOpen, moreOpen]);

  const clearThinkingTimers = () => {
    if (thinkingTimer.current !== null) window.clearTimeout(thinkingTimer.current);
    if (thinkingFadeTimer.current !== null) window.clearTimeout(thinkingFadeTimer.current);
    thinkingTimer.current = null;
    thinkingFadeTimer.current = null;
  };

  const beginThinking = () => {
    clearThinkingTimers();
    setThinkingPhase("on");
    thinkingTimer.current = window.setTimeout(() => {
      thinkingTimer.current = null;
      setThinkingPhase("leaving");
      thinkingFadeTimer.current = window.setTimeout(() => {
        thinkingFadeTimer.current = null;
        setThinkingPhase("off");
      }, 480);
    }, 8000);
  };

  useEffect(() => clearThinkingTimers, []);

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
    setThinkingPhase("on");
    const toThink = window.setTimeout(() => setIntroStage("think"), FLY_MS);
    const toLeave = window.setTimeout(() => setThinkingPhase("leaving"), THINK_MS);
    const toReveal = window.setTimeout(() => {
      setThinkingPhase("off");
      setIntroStage("reveal");
    }, THINK_MS + THINK_FADE_MS);
    const toSettle = window.setTimeout(() => setIntroStage("settled"), THINK_MS + THINK_FADE_MS + REVEAL_MS);
    return () => {
      window.clearTimeout(toThink);
      window.clearTimeout(toLeave);
      window.clearTimeout(toReveal);
      window.clearTimeout(toSettle);
    };
  }, [fromNewSend]);

  const submit = () => {
    if (!draft.trim()) return;
    setDraft("");
    beginThinking();
  };

  return (
    <section className="conversation-page">
        <header className="conversation-compact-header">
          <strong>{conversation?.title ?? "新对话"}</strong>
          <div className="conversation-compact-actions" ref={headerActionsRef}>
            <div className="popover-anchor"><button className="conversation-icon-action" aria-label="导出对话" aria-expanded={exportOpen} onClick={() => { setExportOpen((open) => !open); setMoreOpen(false); }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg><span>导出</span></button><Reveal open={exportOpen} className="menu-popover conversation-header-menu conversation-export-menu" role="menu" aria-label="导出格式">{exportFormats.map((item) => <button type="button" role="menuitem" key={item.label} onClick={() => { notify(`已创建 ${item.label} 导出任务`, "success"); setExportOpen(false); }}><MenuIcon name={item.icon} /><span>{item.label}</span></button>)}</Reveal></div>
            <div className="popover-anchor"><button className="conversation-icon-action conversation-icon-action--square" aria-label="更多操作" aria-expanded={moreOpen} onClick={() => { setMoreOpen((open) => !open); setExportOpen(false); }}>•••</button><Reveal open={moreOpen} className="menu-popover conversation-header-menu conversation-more-menu" role="menu" aria-label="更多对话操作"><button type="button" role="menuitem" onClick={() => { togglePinnedConversation(conversationId); setMoreOpen(false); notify(pinned ? "已取消置顶" : "对话已置顶", "success"); }}><MenuIcon name="pin" /><span>{pinned ? "取消置顶" : "置顶对话"}</span></button><button type="button" role="menuitem" onClick={() => { notify("已显示当前对话信息"); setMoreOpen(false); }}><MenuIcon name="info" /><span>对话信息</span></button></Reveal></div>
          </div>
        </header>

        <div className="message-stream">
          <article ref={userMessageRef} className={introStage === "fly" ? "message message--user message--user-flying" : "message message--user"}><small>你</small><p>{initialPrompt}</p></article>
          {(introStage === "reveal" || introStage === "settled") && <article className={introStage === "reveal" ? "message message--assistant rich-response answer-reveal" : "message message--assistant rich-response"}>
            <header className="rich-response__header">
              <span className="rich-response__agent-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3-1.8 5.4a2 2 0 0 1-1.3 1.3L3.5 11.5l5.4 1.8a2 2 0 0 1 1.3 1.3L12 20l1.8-5.4a2 2 0 0 1 1.3-1.3l5.4-1.8-5.4-1.8a2 2 0 0 1-1.3-1.3L12 3Z" /></svg></span>
              <div><small>CHOPCHAT · REITs ANALYST</small><h2>产业园 REITs 经营趋势摘要</h2></div>
            </header>
            <div className="rich-response__body">
              <section className="rich-response__insights" aria-label="核心结论">
                <article><strong>01</strong><div><h3>出租率连续修复</h3><p>平均出租率由 89.6% 升至 93.8%，运营韧性增强。</p></div></article>
                <article><strong>02</strong><div><h3>收入保持稳定增长</h3><p>样本营业收入三年复合增速约 8.6%，达到 31.4 亿元。</p></div></article>
                <article><strong>03</strong><div><h3>量价改善更为均衡</h3><p>需求与续租价格共同贡献增长，区域分化仍需持续跟踪。</p></div></article>
                <div className="reit-data-table" role="table" aria-label="REITs 经营数据" style={{ "--fit-columns": reitTableColumns } as CSSProperties}>
                  {reitTable.map((row, rowIndex) => (
                    <div className={rowIndex === 0 ? "reit-data-table__row reit-data-table__head" : "reit-data-table__row"} role="row" key={row.cells.join("-")}>
                      {row.cells.map((cell, cellIndex) => {
                        const emphasized = row.emphasize?.includes(cellIndex);
                        return emphasized ? <strong role="cell" key={cell}>{cell}</strong> : <span role="cell" key={cell}>{cell}</span>;
                      })}
                    </div>
                  ))}
                </div>
              </section>
              <section className="reit-chart" aria-label="出租率与营业收入趋势图">
                <div className="reit-chart__title"><strong>出租率与营业收入</strong><small>2023—2025</small></div>
                <div className="reit-chart__legend"><span><i />出租率</span><span><i />营业收入</span></div>
                <svg viewBox="0 0 296 194" role="img" aria-label="2023 至 2025 年出租率与营业收入均上升">
                  <g className="reit-chart__grid"><path d="M0 16H296" /><path d="M0 64H296" /><path d="M0 112H296" /><path d="M0 160H296" /></g>
                  <g className="reit-chart__bars"><rect x="36" y="82" width="28" height="78" /><rect x="126" y="54" width="28" height="106" /><rect x="216" y="22" width="28" height="138" /></g>
                  <path className="reit-chart__line" d="M50 108 140 64 230 30" />
                  <g className="reit-chart__points"><circle cx="50" cy="108" r="4" /><circle cx="140" cy="64" r="4" /><circle cx="230" cy="30" r="4" /></g>
                  <g className="reit-chart__labels"><text x="33" y="182">2023</text><text x="123" y="182">2024</text><text x="213" y="182">2025</text></g>
                </svg>
              </section>
            </div>
            <div className="message__actions">
              <button onClick={() => notify("已复制回答", "success")}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>复制</button>
              <button onClick={() => notify("感谢反馈", "success")}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10v12" /><path d="M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 7A2 2 0 0 1 17.5 21H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h2.8L10 2h0a3.1 3.1 0 0 1 3 3.9Z" /></svg>有帮助</button>
              <button onClick={beginThinking}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.7L20 8" /><path d="M20 3v5h-5" /></svg>重新生成</button>
            </div>
          </article>}
          {thinkingPhase !== "off" && <ThinkingMark intro={introStage === "fly" || introStage === "think"} leaving={thinkingPhase === "leaving"} />}
        </div>

        <ChatComposer className="composer--sticky" value={draft} onChange={setDraft} onSubmit={submit} placeholder="继续追问；输入 / 调用技能" online={online} onToggleOnline={() => setOnline((current) => !current)} modelPlacement="up" />
    </section>
  );
}
