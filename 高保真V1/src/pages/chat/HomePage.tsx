import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brand } from "../../components/ui/Brand";
import { ConnectionToggle } from "../../components/ui/ConnectionToggle";
import { MenuIcon } from "../../components/ui/MenuIcon";
import { ModelSelect } from "../../components/ui/ModelSelect";

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

          <div className="composer composer--hero" ref={composerRef}>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="输入问题；输入 / 调用技能" rows={4} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") send(); }} />
            <div className="composer__toolbar">
              <div><button className="button button--small"><MenuIcon name="upload" />上传图片</button><ConnectionToggle online={online} onToggle={() => setOnline(!online)} /><ModelSelect /></div>
              <button className="button button--primary composer__send" type="button" onClick={send} aria-label="发送" aria-disabled={!prompt.trim()}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>
              </button>
            </div>
          </div>

          <p className="home-page__suggestion-label">试试这样问</p>
          <div className="prompt-grid" aria-label="推荐问题">
            {prompts.map((item) => <button key={item} onClick={() => setPrompt(item)}>{item}</button>)}
          </div>
          <p className="home-page__privacy">端到端会话隔离 · 数据仅用于当前工作区</p>
        </div>
      </section>
  );
}
