import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";

const prompts = ["梳理一个行业的规模与竞争格局", "分析一家公司最近三年的财务表现", "把当前研究整理成一份 PPT 大纲"];

export function HomePage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [online, setOnline] = useState(true);

  const send = () => {
    if (!prompt.trim()) return;
    navigate("/chat/new", { state: { prompt } });
  };

  return (
    <AppShell>
      <section className="home-page">
        <div className="home-page__content">
          <p className="eyebrow">AI 对话</p>
          <h1>你好，我是 ChopChat</h1>
          <p className="lead">今天想研究或制作什么内容？</p>

          <div className="composer composer--hero">
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="输入问题；输入 / 调用技能" rows={4} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") send(); }} />
            <div className="composer__toolbar">
              <div><button className="button button--small">上传图片</button><button className={`button button--small ${online ? "button--selected" : ""}`} onClick={() => setOnline(!online)}>联网：{online ? "开" : "关"}</button><select aria-label="选择模型"><option>智能选择</option></select></div>
              <button className="button button--primary" onClick={send} disabled={!prompt.trim()}>发送</button>
            </div>
          </div>

          <div className="prompt-grid" aria-label="推荐问题">
            {prompts.map((item) => <button key={item} onClick={() => setPrompt(item)}>{item}</button>)}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
