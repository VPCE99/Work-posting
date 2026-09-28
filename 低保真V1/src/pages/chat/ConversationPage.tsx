import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { usePrototype } from "../../app/PrototypeContext";

export function ConversationPage() {
  const { conversationId = "industry" } = useParams();
  const location = useLocation();
  const { conversations, pinnedConversationIds, togglePinnedConversation, notify } = usePrototype();
  const conversation = conversations.find((item) => item.id === conversationId);
  const initialPrompt = (location.state as { prompt?: string } | null)?.prompt ?? "请分析这组数据，并给出主要结论。";
  const [draft, setDraft] = useState("");
  const [generating, setGenerating] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pinned = pinnedConversationIds.includes(conversationId);

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
          <div className="conversation-compact-actions">
            <div className="popover-anchor"><button className="conversation-icon-action" aria-label="导出对话" aria-expanded={exportOpen} onClick={() => { setExportOpen((open) => !open); setMoreOpen(false); }}>⇧ <span>导出</span></button>{exportOpen && <div className="menu-popover conversation-header-menu" role="group" aria-label="导出格式">{["PDF", "Word", "PPT", "长图"].map((item) => <button key={item} onClick={() => { notify(`已创建 ${item} 导出任务`, "success"); setExportOpen(false); }}>{item}</button>)}</div>}</div>
            <div className="popover-anchor"><button className="conversation-icon-action conversation-icon-action--square" aria-label="更多操作" aria-expanded={moreOpen} onClick={() => { setMoreOpen((open) => !open); setExportOpen(false); }}>•••</button>{moreOpen && <div className="menu-popover conversation-header-menu" role="group" aria-label="更多对话操作"><button onClick={() => { togglePinnedConversation(conversationId); setMoreOpen(false); notify(pinned ? "已取消置顶" : "对话已置顶", "success"); }}>{pinned ? "取消置顶" : "置顶对话"}</button><button onClick={() => { notify("已显示当前对话信息"); setMoreOpen(false); }}>对话信息</button></div>}</div>
          </div>
        </header>

        <div className="message-stream">
          <article className="message message--user"><small>你</small><p>{initialPrompt}</p></article>
          <article className="message message--assistant">
            <small>ChopChat</small>
            <h2>核心结论</h2>
            <p>行业仍处于稳步增长阶段，主要驱动来自需求结构变化、数字化投入和头部企业扩张。以下内容用于检查回答、数据和后续操作的布局。</p>
            <div className="data-table" role="table"><div className="data-table__row data-table__head"><span>年份</span><span>市场规模</span><span>同比增长率</span></div><div className="data-table__row"><span>2024</span><span>128 亿元</span><span>12.8%</span></div><div className="data-table__row"><span>2025</span><span>149 亿元</span><span>16.4%</span></div><div className="data-table__row"><span>2026E</span><span>176 亿元</span><span>18.1%</span></div></div>
            <div className="message__actions"><button>复制</button><button>反馈</button><button>重新生成</button></div>
          </article>
          {generating && <article className="message message--assistant"><small>ChopChat</small><p>正在整理数据……</p><progress value="62" max="100" /><button className="text-button" onClick={() => setGenerating(false)}>停止生成</button></article>}
        </div>

        <div className="composer composer--sticky"><textarea rows={3} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="继续追问；输入 / 调用技能" /><div className="composer__toolbar"><div><button className="button button--small">上传图片</button><button className="button button--small button--selected">联网：开</button><select aria-label="模型选择"><option>智能选择</option></select></div><button className="button button--primary" disabled={!draft.trim()} onClick={submit}>发送</button></div></div>
      </section>
    </AppShell>
  );
}
