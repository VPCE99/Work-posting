import { useState } from "react";
import { usePrototype } from "../../app/PrototypeContext";
import { plans } from "../../data/mock";
import type { Plan } from "../../types";
import { Modal } from "../ui/Modal";

export function PlansDialog() {
  const { setActiveDialog, notify } = usePrototype();
  const [chosenId, setChosenId] = useState("standard");
  const [selected, setSelected] = useState<Plan | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paid, setPaid] = useState(false);
  const close = () => {
    setActiveDialog(null);
    setSelected(null);
    setPaymentOpen(false);
    setPaid(false);
  };

  return (
    <>
      <Modal title="账户与套餐" size="lg" onClose={close}>
        <div className="metric-strip">
          <div><small>当前套餐</small><strong>试用版</strong></div>
          <div><small>今日次数</small><strong>12 / 50</strong></div>
          <div><small>今日 Token</small><strong>128K / 1M</strong></div>
          <div><small>永久余额</small><strong>2.5M</strong></div>
          <div><small>更新时间</small><strong>14:32</strong></div>
        </div>
        <div className="dialog-page-header plan-list-heading">
          <div><h3>可选套餐</h3><p className="muted">会员套餐与永久加油包统一展示，通过卡片标签、权益和有效期区分。</p></div>
        </div>
        <div className="dialog-card-grid dialog-card-grid--plans">
          {plans.map((plan) => {
            const active = chosenId === plan.id;
            const kind = plan.kind === "会员" ? "会员套餐" : plan.id === "standard" ? "永久加油包 · 推荐" : "永久加油包";
            return (
              <article className={active ? "plan-card is-selected" : "plan-card"} key={plan.id} onClick={() => setChosenId(plan.id)}>
                <small className="plan-kind">{kind}</small>
                <h3>{plan.name}</h3>
                <p className="plan-card__allowance">{plan.allowance}</p>
                <p>{plan.validity}</p>
                <strong className="plan-card__price">¥{plan.price.toLocaleString()}</strong>
                <button className={active ? "button button--primary button--block" : "button button--block"} onClick={(event) => { event.stopPropagation(); setChosenId(plan.id); setSelected(plan); }}>立即购买</button>
              </article>
            );
          })}
        </div>
        <p className="muted">参考消耗：简单任务约 3K · 标准任务约 20K · 综合任务约 60K Token</p>
      </Modal>

      {selected && !paymentOpen && (
        <Modal title="确认订单" onClose={() => setSelected(null)} footer={<><button className="button" onClick={() => setSelected(null)}>取消（不创建订单）</button><button className="button button--primary" onClick={() => setPaymentOpen(true)}>支付宝扫码支付 ¥{selected.price.toLocaleString()}</button></>}>
          <dl className="summary-list">
            <div><dt>商品</dt><dd>{selected.name}</dd></div>
            <div><dt>类型</dt><dd>{selected.kind === "会员" ? "会员套餐" : "永久加油包"}</dd></div>
            <div><dt>权益</dt><dd>{selected.allowance}</dd></div>
            <div><dt>有效期</dt><dd>{selected.validity}</dd></div>
            <div><dt>到账方式</dt><dd>支付成功后自动到账</dd></div>
            <div><dt>应付金额</dt><dd><strong>¥{selected.price.toLocaleString()}</strong></dd></div>
          </dl>
        </Modal>
      )}

      {selected && paymentOpen && (
        <Modal title={`支付订单：${selected.name}`} onClose={() => { setPaymentOpen(false); setSelected(null); }}>
          {paid ? (
            <div className="purchase-payment-success">
              <div>✓</div>
              <h3>支付成功</h3>
              <p>套餐与额度已经更新。</p>
              <div className="pay-actions"><button className="button button--primary" onClick={close}>完成</button></div>
            </div>
          ) : (
            <div className="purchase-payment-panel">
              <div className="pay-qr" aria-hidden="true"><div><span>支</span></div></div>
              <p className="pay-caption">请使用支付宝扫码支付</p>
              <p className="pay-amount">¥{selected.price.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="pay-timer">二维码剩余有效时间 04:32</p>
              <p className="pay-status"><i />等待扫码</p>
              <div className="pay-actions">
                <button className="button" onClick={() => { setPaymentOpen(false); setSelected(null); }}>取消支付</button>
                <button className="button button--primary" onClick={() => { setPaid(true); notify("支付成功，额度已更新", "success"); }}>我已支付，刷新状态</button>
              </div>
              <p className="pay-note">支付成功后额度将自动更新</p>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
