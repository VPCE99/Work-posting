import { useState, type FormEvent } from "react";
import { Modal } from "../ui/Modal";

type Props = {
  onClose: () => void;
  onSubmit: (input: { account: string; password: string }) => void;
  onSwitchToRegister: () => void;
};

export function LoginDialog({ onClose, onSubmit, onSwitchToRegister }: Props) {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const canSubmit = Boolean(account.trim() && password.trim());

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({ account: account.trim(), password: password.trim() });
  };

  return (
    <Modal
      title="登录"
      size="sm"
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="button" onClick={onClose}>取消</button>
          <button type="submit" form="auth-login-form" className="button button--primary" disabled={!canSubmit}>登录</button>
        </>
      )}
    >
      <form id="auth-login-form" className="form-stack auth-form" onSubmit={submit}>
        <p className="muted">登录后可查看与账户绑定的历史聊天、项目和其他内容。</p>
        <label>
          手机号 / 邮箱
          <input
            autoFocus
            value={account}
            onChange={(event) => setAccount(event.target.value)}
            placeholder="请输入手机号或邮箱"
            autoComplete="username"
          />
        </label>
        <label>
          密码
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="请输入密码"
            autoComplete="current-password"
          />
        </label>
        <button type="button" className="auth-form__switch" onClick={onSwitchToRegister}>
          还没有账号？去注册
        </button>
      </form>
    </Modal>
  );
}
