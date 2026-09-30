import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { usePrototype } from "../../app/PrototypeContext";

const heat = Array.from({ length: 84 }, (_, index) => (index * 7) % 5);
const heatTalks = [0, 2, 5, 9, 16];
const heatTokens = [0, 48, 120, 260, 540];
const tokenBars = [320, 480, 410, 760, 540, 980, 860, 1240, 690, 880, 1520, 910, 1040, 730, 640, 1100, 820, 960, 1380, 770, 590, 1010, 870, 1430, 920, 680, 1160, 840, 990, 1210];
const tokenMax = Math.max(...tokenBars);

function formatToken(value: number) {
  if (value >= 1000) {
    const millions = value / 1000;
    return `${Number.isInteger(millions) ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }
  return `${value}K`;
}

function heatLabel(index: number, level: number) {
  const date = new Date(2026, 8, 29);
  date.setDate(date.getDate() - (heat.length - 1 - index));
  return `${date.getMonth() + 1}月${date.getDate()}日 · ${heatTalks[level]} 次对话 · ${heatTokens[level]}K Token`;
}

type TipState = { text: string; anchor: HTMLElement };

function PanelTip({ tip }: { tip: TipState | null }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const node = ref.current;
    const container = node?.closest(".account-activity, .account-tokens") as HTMLElement | null;
    if (!node || !tip || !container) return;
    const box = container.getBoundingClientRect();
    const anchor = tip.anchor.getBoundingClientRect();
    const size = node.getBoundingClientRect();
    const left = Math.max(8, Math.min(anchor.left + anchor.width / 2 - box.left - size.width / 2, box.width - size.width - 8));
    let top = anchor.top - box.top - size.height - 8;
    if (top < 8) top = anchor.bottom - box.top + 8;
    if (top + size.height > box.height - 8) top = Math.max(8, box.height - size.height - 8);
    node.style.left = `${left}px`;
    node.style.top = `${top}px`;
  }, [tip]);
  if (!tip) return null;
  return <span ref={ref} className="panel-tip" role="tooltip">{tip.text}</span>;
}

export function AccountPage() {
  const { setActiveDialog } = usePrototype();
  const [activityTip, setActivityTip] = useState<TipState | null>(null);
  const [tokenTip, setTokenTip] = useState<TipState | null>(null);

  return (
    <section className="page-stack account-page">
        <header className="page-header">
          <div><p className="eyebrow">账户</p><h1>客户后台</h1><p>统一查看套餐、用量、余额和订单。</p></div>
          <div className="button-row"><Link className="button" to="/chat">返回对话</Link><button className="button button--primary" onClick={() => setActiveDialog("plans")}>购买套餐</button></div>
        </header>

        <div className="metric-grid">
          <Metric title="当前套餐" value="试用版" detail="50 次/日" />
          <Metric title="今日用量" value="128K / 1M" detail="12 次对话 · 更新于 14:32" />
          <Metric title="永久余额" value="2.5M Token" detail="来自加油包" />
          <Metric title="本月累计" value="3.8M Token" detail="18 个活跃日" />
        </div>

        <div className="dashboard-grid">
          <article className="panel account-activity" onMouseLeave={() => setActivityTip(null)}>
            <div className="panel__title"><h2>近一个月活跃度</h2><span>按天</span></div>
            <div className="heatmap" aria-label="活跃热力图">
              {heat.map((value, index) => (
                <button
                  key={index}
                  type="button"
                  className="heat-cell"
                  data-level={value}
                  aria-label={heatLabel(index, value)}
                  onMouseEnter={(event) => setActivityTip({ text: heatLabel(index, value), anchor: event.currentTarget })}
                  onFocus={(event) => setActivityTip({ text: heatLabel(index, value), anchor: event.currentTarget })}
                />
              ))}
            </div>
            <small>颜色深浅代表每日对话次数；悬停查看日期、次数和 Token。</small>
            <PanelTip tip={activityTip} />
          </article>
          <article className="panel account-tokens" onMouseLeave={() => setTokenTip(null)}>
            <div className="panel__title"><h2>近 30 天 Token 使用量</h2><span>Token</span></div>
            <div className="token-chart" aria-label="近 30 天 Token 使用量">
              {tokenBars.map((value, index) => {
                const text = `第 ${index + 1} 天 · ${formatToken(value)} Token`;
                return (
                  <button
                    key={index}
                    type="button"
                    className="token-bar"
                    style={{ height: `${(value / tokenMax) * 100}%` }}
                    aria-label={text}
                    onMouseEnter={(event) => setTokenTip({ text, anchor: event.currentTarget })}
                    onFocus={(event) => setTokenTip({ text, anchor: event.currentTarget })}
                  />
                );
              })}
            </div>
            <PanelTip tip={tokenTip} />
          </article>
        </div>

        <article className="panel account-orders">
          <div className="panel__title"><h2>购买记录</h2><div className="tab-row"><button className="tab tab--active">有效订单</button><button className="tab">全部订单</button></div></div>
          <div className="table-scroll"><table><thead><tr><th>商品</th><th>金额</th><th>状态</th><th>创建时间</th><th>发票</th><th>操作</th></tr></thead><tbody><tr><td>标准加油包</td><td>¥259</td><td><span className="status status--success">已支付</span></td><td>2026-09-20</td><td>未申请</td><td><button className="text-button">查看</button> <button className="text-button">申请发票</button></td></tr><tr><td>入门加油包</td><td>¥39</td><td><span className="status">已关闭</span></td><td>2026-08-12</td><td>—</td><td><button className="text-button">查看</button></td></tr></tbody></table></div>
        </article>
    </section>
  );
}

function Metric({ title, value, detail }: { title: string; value: string; detail: string }) {
  return <article className="metric-card"><small>{title}</small><strong>{value}</strong><span>{detail}</span></article>;
}
