import { Link } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { usePrototype } from "../../app/PrototypeContext";

const heat = Array.from({ length: 72 }, (_, index) => (index * 7) % 5);
const bars = [32, 48, 38, 60, 45, 78, 65, 82, 56, 72, 90, 68, 76, 62];

export function AccountPage() {
  const { setActiveDialog } = usePrototype();
  return <AppShell><section className="page-stack"><header className="page-header"><div><p className="eyebrow">账户</p><h1>客户后台</h1><p>统一查看套餐、用量、余额和订单。</p></div><div className="button-row"><Link className="button" to="/chat">返回对话</Link><button className="button button--primary" onClick={() => setActiveDialog("plans")}>购买套餐</button></div></header><div className="metric-grid"><Metric title="当前套餐" value="试用版" detail="50 次/日" /><Metric title="今日用量" value="128K / 1M" detail="12 次对话 · 更新于 14:32" /><Metric title="永久余额" value="2.5M Token" detail="来自加油包" /><Metric title="本月累计" value="3.8M Token" detail="18 个活跃日" /></div><div className="dashboard-grid"><article className="panel"><div className="panel__title"><h2>近 12 个月活跃度</h2><span>按天</span></div><div className="heatmap" aria-label="活跃热力图">{heat.map((value, index) => <span key={index} data-level={value} title={`第 ${index + 1} 天：${value} 次对话`} />)}</div><small>颜色深浅代表每日对话次数；悬停查看日期、次数和 Token。</small></article><article className="panel"><div className="panel__title"><h2>近 30 天 Token 使用量</h2><span>Token</span></div><div className="bar-chart">{bars.map((value, index) => <span key={index} style={{ height: `${value}%` }} title={`${value * 1000} Token`} />)}</div></article></div><article className="panel"><div className="panel__title"><h2>购买记录</h2><div className="tab-row"><button className="tab tab--active">有效订单</button><button className="tab">全部订单</button></div></div><div className="table-scroll"><table><thead><tr><th>商品</th><th>金额</th><th>状态</th><th>创建时间</th><th>发票</th><th>操作</th></tr></thead><tbody><tr><td>标准加油包</td><td>¥259</td><td><span className="status status--success">已支付</span></td><td>2026-09-20</td><td>未申请</td><td><button className="text-button">查看</button> <button className="text-button">申请发票</button></td></tr><tr><td>入门加油包</td><td>¥39</td><td><span className="status">已关闭</span></td><td>2026-08-12</td><td>—</td><td><button className="text-button">查看</button></td></tr></tbody></table></div></article></section></AppShell>;
}

function Metric({ title, value, detail }: { title: string; value: string; detail: string }) {
  return <article className="metric-card"><small>{title}</small><strong>{value}</strong><span>{detail}</span></article>;
}
