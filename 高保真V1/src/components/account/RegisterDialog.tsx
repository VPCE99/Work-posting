import { useState, type FormEvent } from "react";
import { Modal } from "../ui/Modal";
import { AuthField, ChatIcon, LockIcon, MailIcon, RegisterVisual, UserIcon } from "./AuthDialogParts";
import { WeChatAuthDialog } from "./WeChatAuthDialog";

type Props = {
  onClose: () => void;
  onSubmit: (input: { displayName: string; account: string; password: string }) => void;
  onSwitchToLogin: () => void;
  onNotice: (message: string) => void;
};

export function RegisterDialog({ onClose, onSubmit, onSwitchToLogin, onNotice }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [wechatOpen, setWechatOpen] = useState(false);
  const passwordShort = password.length > 0 && password.trim().length < 8;
  const canSubmit = Boolean(displayName.trim() && account.trim() && password.trim().length >= 8 && agreed);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      displayName: displayName.trim(),
      account: account.trim(),
      password: password.trim(),
    });
  };

  return (
    <>
    <Modal title="注册" variant="auth" frameless onClose={onClose}>
      <div className="auth-dialog auth-dialog--register">
        <RegisterVisual />
        <div className="auth-dialog__panel">
          <form className="auth-dialog__form" onSubmit={submit}>
            <h2 className="auth-dialog__title">创建 ChopChat 账户</h2>
            <p className="auth-dialog__subtitle">几步即可开启你的智能工作区。</p>
            <div className="auth-dialog__fields">
              <AuthField label="昵称" icon={<UserIcon />}>
                <input
                  autoFocus
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="你的名字"
                  maxLength={20}
                  autoComplete="nickname"
                />
              </AuthField>
              <AuthField label="邮箱" icon={<MailIcon />}>
                <input
                  type="email"
                  value={account}
                  onChange={(event) => setAccount(event.target.value)}
                  placeholder="name@example.com"
                  autoComplete="username"
                />
              </AuthField>
              <AuthField label="设置密码" icon={<LockIcon />}>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="至少 8 位字符"
                  autoComplete="new-password"
                />
              </AuthField>
            </div>
            {passwordShort && <small className="auth-dialog__error">密码至少需要 8 位字符</small>}
            <div className="auth-check auth-check--terms">
              <label>
                <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
                <span>我已阅读并同意</span>
              </label>
              <button type="button" className="auth-link" onClick={() => onNotice("服务协议即将开放")}>《服务协议》</button>
              <span>和</span>
              <button type="button" className="auth-link" onClick={() => onNotice("隐私政策即将开放")}>《隐私政策》</button>
            </div>
            <button type="submit" className="button button--primary auth-dialog__submit" disabled={!canSubmit}>创建账户</button>
            <div className="auth-dialog__divider" aria-hidden="true"><span /><em>或</em><span /></div>
            <button type="button" className="button auth-dialog__social" onClick={() => setWechatOpen(true)}>
              <ChatIcon />
              使用微信注册
            </button>
            <p className="auth-dialog__switch">
              已有账户？
              <button type="button" onClick={onSwitchToLogin}>直接登录</button>
            </p>
          </form>
          <button type="button" className="auth-dialog__close" onClick={onClose} aria-label="关闭弹窗">×</button>
        </div>
      </div>
    </Modal>
    {wechatOpen && (
      <WeChatAuthDialog
        mode="register"
        onClose={() => setWechatOpen(false)}
        onComplete={() => onSubmit({
          displayName: "微信用户",
          account: "wechat@chopchat.com",
          password: "wechat-demo",
        })}
      />
    )}
    </>
  );
}
