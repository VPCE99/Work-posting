import { useState } from "react";
import { usePrototype } from "../../app/PrototypeContext";
import { Modal } from "../ui/Modal";

type Platform = "微信" | "飞书";

export function MobileBindingDialog() {
  const { setActiveDialog, notify } = usePrototype();
  const [bindings, setBindings] = useState<Array<Platform | null>>([null, null]);
  const [pending, setPending] = useState<{ index: number; platform: Platform } | null>(null);
  const close = () => { setPending(null); setActiveDialog(null); };
  const begin = (index: number, platform: Platform) => setPending({ index, platform });
  const complete = () => {
    if (!pending) return;
    setBindings((items) => items.map((item, index) => index === pending.index ? pending.platform : item));
    notify(`${pending.platform}绑定成功`, "success");
    setPending(null);
  };

  return <><Modal title="绑定手机端" size="lg" onClose={close} footer={<button className="button" onClick={close}>取消</button>}><p className="lead">每个项目可独立选择微信或飞书，扫码后即可使用。连接配置由 ChopChat 在服务器内自动完成。</p><p>当前账号可绑定 2 个手机端项目，可重复选择同一平台。</p><div className="binding-list">{bindings.map((platform, index) => <article className="binding-card" key={index}><strong className="binding-card__number">{index + 1}</strong><div><h3>项目 {index + 1}</h3><p>选择要绑定的平台；两个项目可以选择相同平台。</p></div><span className={`status ${platform ? "status--success" : ""}`}>{platform ? `已绑定${platform}` : "未配置"}</span><div className="button-row"><button className="button binding-wechat" onClick={() => begin(index, "微信")}>绑定微信</button><button className="button binding-feishu" onClick={() => begin(index, "飞书")}>绑定飞书</button></div></article>)}</div></Modal>{pending && <Modal title={`绑定${pending.platform} · 项目 ${pending.index + 1}`} onClose={() => setPending(null)} footer={<><button className="button" onClick={() => setPending(null)}>返回</button><button className="button button--primary" onClick={complete}>模拟扫码完成</button></>}><div className="payment-panel"><div className="qr-placeholder">{pending.platform}<br />绑定码</div><p>请使用{pending.platform}扫码完成授权。</p><p>二维码剩余有效时间：04:32</p></div></Modal>}</>;
}
