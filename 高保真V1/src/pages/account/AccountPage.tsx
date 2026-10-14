import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePrototype } from "../../app/PrototypeContext";
import { EmptyState } from "../../components/ui/EmptyState";
import { DAILY_PLAN_TOKEN_CAP_K, formatTokenK, todayTokenUsageLabel } from "../../data/mock";

const RANGE_DAYS = 30;
const rangeEnd = new Date(2026, 9, 8);
const heat = [1, 4, 0, 2, 3, 1, 0, 4, 2, 3, 0, 2, 4, 1, 0, 3, 4, 1, 2, 0, 3, 0, 1, 4, 2, 0, 2, 3, 4, 1];
const heatTalks = [0, 2, 5, 9, 16];
const heatTokens = [0, 48, 120, 260, 540];
/**
 * Daily totals (K Token) against membership daily cap (1000 万).
 * Plan quota is consumed first; overflow comes from permanent balance.
 */
const tokenBars = [
  2100, 3400, 1800, 5600, 4200, 7800, 6500, 9200, 4800, 7100,
  11200, 6300, 8500, 3900, 2800, 9600, 5400, 7200, 10800, 4500,
  3100, 8800, 6100, 11500, 7600, 4100, 9900, 5800, 8300, 10200,
];
/** Chart scale includes the daily plan cap so bar height reads against 10M. */
const tokenMax = Math.max(...tokenBars, DAILY_PLAN_TOKEN_CAP_K);

type TokenSplit = { total: number; plan: number; permanent: number };

function splitTokenUsage(total: number): TokenSplit {
  const plan = Math.min(total, DAILY_PLAN_TOKEN_CAP_K);
  return { total, plan, permanent: Math.max(0, total - plan) };
}

function dayInRange(index: number) {
  const date = new Date(rangeEnd);
  date.setDate(rangeEnd.getDate() - (RANGE_DAYS - 1 - index));
  return date;
}

function formatDay(date: Date) {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function heatLabel(index: number, level: number) {
  const talks = heatTalks[level] ?? 0;
  const tokens = heatTokens[level] ?? 0;
  return `${formatDay(dayInRange(index))} · ${talks} 次对话 · ${formatTokenK(tokens)} Token`;
}

const orders = [
  { product: "标准加油包", amount: "¥259", status: "已支付", created: "2026-09-20", invoice: "未申请", closed: false },
  { product: "入门加油包", amount: "¥39", status: "已关闭", created: "2026-08-12", invoice: "—", closed: true },
];

type TipState = { content: ReactNode; anchor: HTMLElement };

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
  return <span ref={ref} className="panel-tip" role="tooltip">{tip.content}</span>;
}

function TokenTipContent({ date, split }: { date: string; split: TokenSplit }) {
  return (
    <span className="token-tip">
      <strong className="token-tip__date">{date}</strong>
      <span className="token-tip__row">
        <i className="token-tip__swatch token-tip__swatch--plan" aria-hidden="true" />
        <span>套餐额度: {formatTokenK(split.plan)} Token</span>
      </span>
      <span className="token-tip__row">
        <i className="token-tip__swatch token-tip__swatch--permanent" aria-hidden="true" />
        <span>永久额度: {formatTokenK(split.permanent)} Token</span>
      </span>
    </span>
  );
}

export function AccountPage() {
  const navigate = useNavigate();
  const { authenticated } = usePrototype();
  const [activityTip, setActivityTip] = useState<TipState | null>(null);
  const [tokenTip, setTokenTip] = useState<TipState | null>(null);
  const [orderTab, setOrderTab] = useState<"有效订单" | "全部订单">("有效订单");
  const visibleOrders = orders.filter((order) => orderTab === "全部订单" || !order.closed);

  return (
    <section className="page-stack account-page">
        <header className="page-header">
          <div><p className="eyebrow">账户</p><h1>客户后台</h1><p>统一查看套餐、用量、余额和订单。</p></div>
          <div className="button-row"><Link className="button" to="/chat">返回对话</Link>{authenticated && <button className="button button--primary" onClick={() => navigate("/account/plans", { state: { backgroundLocation: "/account" } })}>购买套餐</button>}</div>
        </header>

        {!authenticated ? (
          <EmptyState
            title="登录后查看客户后台"
            description="套餐、用量、余额和订单都与账户绑定，登录后即可同步显示。"
          />
        ) : (
        <>
        <div className="metric-grid">
          <Metric title="当前套餐" value="试用版" detail="50 次/日" />
          <Metric title="今日用量" value={todayTokenUsageLabel} detail="12 次对话 · 更新于 14:32" />
          <Metric title="永久余额" value="2.5M Token" detail="来自加油包" />
          <Metric title="本月累计" value="186M Token" detail="18 个活跃日" />
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
                  onMouseEnter={(event) => setActivityTip({ content: heatLabel(index, value), anchor: event.currentTarget })}
                  onFocus={(event) => setActivityTip({ content: heatLabel(index, value), anchor: event.currentTarget })}
                />
              ))}
            </div>
            <small>近 30 天（{formatDay(dayInRange(0))}至{formatDay(rangeEnd)}），与右侧 Token 图同一时间范围。</small>
            <PanelTip tip={activityTip} />
          </article>
          <article className="panel account-tokens" onMouseLeave={() => setTokenTip(null)}>
            <div className="panel__title">
              <h2>近 30 天 Token 使用量</h2>
              <div className="token-legend" aria-hidden="true">
                <span><i className="token-tip__swatch token-tip__swatch--plan" />套餐额度</span>
                <span><i className="token-tip__swatch token-tip__swatch--permanent" />永久额度</span>
              </div>
            </div>
            <div className="token-chart" aria-label="近 30 天 Token 使用量（套餐额度优先，超出部分为永久额度）">
              {tokenBars.map((value, index) => {
                const split = splitTokenUsage(value);
                const date = formatDay(dayInRange(index));
                const label = `${date} · 套餐额度 ${formatTokenK(split.plan)} · 永久额度 ${formatTokenK(split.permanent)}`;
                const planShare = split.total ? (split.plan / split.total) * 100 : 0;
                const permanentShare = split.total ? (split.permanent / split.total) * 100 : 0;
                return (
                  <button
                    key={index}
                    type="button"
                    className="token-bar"
                    style={{ height: `${(split.total / tokenMax) * 100}%` }}
                    aria-label={label}
                    onMouseEnter={(event) => setTokenTip({ content: <TokenTipContent date={date} split={split} />, anchor: event.currentTarget })}
                    onFocus={(event) => setTokenTip({ content: <TokenTipContent date={date} split={split} />, anchor: event.currentTarget })}
                  >
                    {/* column-reverse: plan is billed first → sits at the base; permanent stacks on top. */}
                    {split.plan > 0 && <span className="token-bar__segment token-bar__segment--plan" style={{ height: `${planShare}%` }} />}
                    {split.permanent > 0 && <span className="token-bar__segment token-bar__segment--permanent" style={{ height: `${permanentShare}%` }} />}
                  </button>
                );
              })}
            </div>
            <PanelTip tip={tokenTip} />
          </article>
        </div>

        <article className="panel account-orders">
          <div className="panel__title"><h2>购买记录</h2><div className="tab-row" role="tablist" aria-label="订单范围">{(["有效订单", "全部订单"] as const).map((tab) => <button key={tab} type="button" role="tab" aria-selected={orderTab === tab} className={orderTab === tab ? "tab tab--active" : "tab"} onClick={() => setOrderTab(tab)}>{tab}</button>)}</div></div>
          <div className="table-scroll"><table><thead><tr><th>商品</th><th>金额</th><th>状态</th><th>创建时间</th><th>发票</th><th>操作</th></tr></thead><tbody>{visibleOrders.map((order) => <tr key={order.product}><td>{order.product}</td><td>{order.amount}</td><td><span className={order.closed ? "status" : "status status--success"}>{order.status}</span></td><td>{order.created}</td><td>{order.invoice}</td><td><button className="text-button" type="button">查看</button>{!order.closed && <> <button className="text-button" type="button">申请发票</button></>}</td></tr>)}</tbody></table></div>
        </article>
        </>
        )}
    </section>
  );
}

function Metric({ title, value, detail }: { title: string; value: string; detail: string }) {
  return <article className="metric-card"><small>{title}</small><strong>{value}</strong><span>{detail}</span></article>;
}
