import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { usePrototype } from "../../app/PrototypeContext";
import { ConnectionToggle } from "../../components/ui/ConnectionToggle";
import { MenuIcon, type MenuIconName } from "../../components/ui/MenuIcon";

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
  const initialPrompt = (location.state as { prompt?: string } | null)?.prompt ?? "请分析近三年产业园 REITs 的出租率和收入变化，并总结主要结论。";
  const [draft, setDraft] = useState("");
  const [generating, setGenerating] = useState(false);
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

  const submit = () => {
    if (!draft.trim()) return;
    setGenerating(true);
    setDraft("");
    window.setTimeout(() => setGenerating(false), 1600);
  };

  return (
    <AppShell>
      <section className="conversation-page">
        <header className="conversation-compact-header">
          <strong>{conversation?.title ?? "新对话"}</strong>
          <div className="conversation-compact-actions" ref={headerActionsRef}>
            <div className="popover-anchor"><button className="conversation-icon-action" aria-label="导出对话" aria-expanded={exportOpen} onClick={() => { setExportOpen((open) => !open); setMoreOpen(false); }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg><span>导出</span></button>{exportOpen && <div className="menu-popover conversation-header-menu conversation-export-menu" role="menu" aria-label="导出格式">{exportFormats.map((item) => <button type="button" role="menuitem" key={item.label} onClick={() => { notify(`已创建 ${item.label} 导出任务`, "success"); setExportOpen(false); }}><MenuIcon name={item.icon} /><span>{item.label}</span></button>)}</div>}</div>
            <div className="popover-anchor"><button className="conversation-icon-action conversation-icon-action--square" aria-label="更多操作" aria-expanded={moreOpen} onClick={() => { setMoreOpen((open) => !open); setExportOpen(false); }}>•••</button>{moreOpen && <div className="menu-popover conversation-header-menu conversation-more-menu" role="menu" aria-label="更多对话操作"><button type="button" role="menuitem" onClick={() => { togglePinnedConversation(conversationId); setMoreOpen(false); notify(pinned ? "已取消置顶" : "对话已置顶", "success"); }}><MenuIcon name="pin" /><span>{pinned ? "取消置顶" : "置顶对话"}</span></button><button type="button" role="menuitem" onClick={() => { notify("已显示当前对话信息"); setMoreOpen(false); }}><MenuIcon name="info" /><span>对话信息</span></button></div>}</div>
          </div>
        </header>

        <div className="message-stream">
          <article className="message message--user"><small>你</small><p>{initialPrompt}</p></article>
          <article className="message message--assistant rich-response">
            <header className="rich-response__header">
              <span className="rich-response__agent-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3-1.8 5.4a2 2 0 0 1-1.3 1.3L3.5 11.5l5.4 1.8a2 2 0 0 1 1.3 1.3L12 20l1.8-5.4a2 2 0 0 1 1.3-1.3l5.4-1.8-5.4-1.8a2 2 0 0 1-1.3-1.3L12 3Z" /></svg></span>
              <div><small>CHOPCHAT · REITs ANALYST</small><h2>产业园 REITs 经营趋势摘要</h2></div>
            </header>
            <div className="rich-response__body">
              <section className="rich-response__insights" aria-label="核心结论">
                <article><strong>01</strong><div><h3>出租率连续修复</h3><p>平均出租率由 89.6% 升至 93.8%，运营韧性增强。</p></div></article>
                <article><strong>02</strong><div><h3>收入保持稳定增长</h3><p>样本营业收入三年复合增速约 8.6%，达到 31.4 亿元。</p></div></article>
                <article><strong>03</strong><div><h3>量价改善更为均衡</h3><p>需求与续租价格共同贡献增长，区域分化仍需持续跟踪。</p></div></article>
                <div className="reit-data-table" role="table" aria-label="REITs 经营数据">
                  <div className="reit-data-table__row reit-data-table__head" role="row"><span>年度</span><span>平均出租率</span><span>营业收入</span></div>
                  <div className="reit-data-table__row" role="row"><span>2023</span><strong>89.6%</strong><span>26.6 亿元</span></div>
                  <div className="reit-data-table__row" role="row"><span>2024</span><strong>91.7%</strong><span>28.9 亿元</span></div>
                  <div className="reit-data-table__row" role="row"><span>2025</span><strong>93.8%</strong><span>31.4 亿元</span></div>
                </div>
              </section>
              <section className="reit-chart" aria-label="出租率与营业收入趋势图">
                <div className="reit-chart__title"><strong>出租率与营业收入</strong><small>2023—2025</small></div>
                <div className="reit-chart__legend"><span><i />出租率</span><span><i />营业收入</span></div>
                <svg viewBox="0 0 296 194" role="img" aria-label="2023 至 2025 年出租率与营业收入均上升">
                  <g className="reit-chart__grid"><path d="M0 20H296" /><path d="M0 60H296" /><path d="M0 100H296" /><path d="M0 140H296" /></g>
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
              <button onClick={() => setGenerating(true)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.7L20 8" /><path d="M20 3v5h-5" /></svg>重新生成</button>
            </div>
          </article>
          {generating && <article className="message message--assistant"><small>ChopChat</small><p>正在整理数据……</p><progress value="62" max="100" /><button className="text-button" onClick={() => setGenerating(false)}>停止生成</button></article>}
        </div>

        <div className="composer composer--sticky"><textarea rows={3} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="继续追问；输入 / 调用技能" /><div className="composer__toolbar"><div><button className="button button--small"><MenuIcon name="upload" />上传图片</button><ConnectionToggle online={online} onToggle={() => setOnline(!online)} /><select aria-label="模型选择"><option>智能选择</option></select></div><button className="button button--primary composer__send" aria-label="发送" aria-disabled={!draft.trim()} onClick={submit}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg></button></div></div>
      </section>
    </AppShell>
  );
}
