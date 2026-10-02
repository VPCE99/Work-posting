import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatComposer } from "../../components/chat/ChatComposer";
import { Brand } from "../../components/ui/Brand";

const prompts = ["对比不同园区的出租率差异", "解释收入增长的主要驱动因素", "把结论整理成投资备忘录"];

export function HomePage() {
  const navigate = useNavigate();
  const composerRef = useRef<HTMLDivElement>(null);
  const [prompt, setPrompt] = useState("");
  const [online, setOnline] = useState(true);

  const send = () => {
    if (!prompt.trim()) return;
    const rect = composerRef.current?.getBoundingClientRect();
    navigate("/chat/new", {
      state: {
        prompt,
        origin: rect
          ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
          : undefined,
      },
    });
  };

  return (
      <section className="home-page">
        <div className="home-glow" aria-hidden="true" />
        <div className="home-page__content">
          <div className="home-page__brand"><Brand compact reveal /></div>
          <h1>ChopChat</h1>
          <p className="lead">今天想研究什么？</p>

          <ChatComposer
            className="composer--hero"
            composerRef={composerRef}
            value={prompt}
            onChange={setPrompt}
            onSubmit={send}
            placeholder="输入问题；输入 / 调用技能"
            online={online}
            onToggleOnline={() => setOnline((current) => !current)}
          />

          <p className="home-page__suggestion-label">试试这样问</p>
          <div className="prompt-grid" aria-label="推荐问题">
            {prompts.map((item) => <button key={item} onClick={() => setPrompt(item)}>{item}</button>)}
          </div>
          <p className="home-page__privacy">端到端会话隔离 · 数据仅用于当前工作区</p>
        </div>
      </section>
  );
}
