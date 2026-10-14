import { useState, type FormEvent } from "react";
import { Modal } from "../ui/Modal";
import { AuthField, ChatIcon, LockIcon, LoginVisual, MailIcon } from "./AuthDialogParts";
import { WeChatAuthDialog } from "./WeChatAuthDialog";

type Props = {
  onClose: () => void;
  onSubmit: (input: { account: string; password: string; displayName?: string }) => void;
  onSwitchToRegister: () => void;
  onNotice: (message: string) => void;
};

export function LoginDialog({ onClose, onSubmit, onSwitchToRegister, onNotice }: Props) {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [wechatOpen, setWechatOpen] = useState(false);
  const canSubmit = Boolean(account.trim() && password.trim());

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({ account: account.trim(), password: password.trim() });
  };

  return (
    <>
    <Modal title="登录" variant="auth" frameless onClose={onClose}>
      <div className="auth-dialog">
        <LoginVisual />
        <div className="auth-dialog__panel">
          <form className="auth-dialog__form" onSubmit={submit}>
            <h2 className="auth-dialog__title">登录 ChopChat</h2>
            <p className="auth-dialog__subtitle">使用你的账户访问智能工作区。</p>
            <div className="auth-dialog__fields">
              <AuthField label="邮箱" icon={<MailIcon />}>
                <input
                  autoFocus
                  type="email"
                  value={account}
                  onChange={(event) => setAccount(event.target.value)}
                  placeholder="name@example.com"
                  autoComplete="username"
                />
              </AuthField>
              <AuthField label="密码" icon={<LockIcon />}>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                />
              </AuthField>
            </div>
            <div className="auth-dialog__options">
              <label className="auth-check">
                <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                <span>记住我</span>
              </label>
              <button type="button" className="auth-link" onClick={() => onNotice("忘记密码功能即将开放")}>忘记密码？</button>
            </div>
            <button type="submit" className="button button--primary auth-dialog__submit" disabled={!canSubmit}>登录</button>
            <div className="auth-dialog__divider" aria-hidden="true"><span /><em>或</em><span /></div>
            <button type="button" className="button auth-dialog__social" onClick={() => setWechatOpen(true)}>
              <ChatIcon />
              使用微信登录
            </button>
            <p className="auth-dialog__switch">
              还没有账户？
              <button type="button" onClick={onSwitchToRegister}>立即注册</button>
            </p>
          </form>
          <button type="button" className="auth-dialog__close" onClick={onClose} aria-label="关闭弹窗">×</button>
        </div>
      </div>
    </Modal>
    {wechatOpen && (
      <WeChatAuthDialog
        mode="login"
        onClose={() => setWechatOpen(false)}
        onComplete={() => onSubmit({ account: "wechat@chopchat.com", password: "wechat-demo", displayName: "微信用户" })}
      />
    )}
    </>
  );
}
