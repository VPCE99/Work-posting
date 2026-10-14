import { useState, type FormEvent } from "react";
import { Modal } from "../ui/Modal";

type Props = {
  onClose: () => void;
  onSubmit: (input: { displayName: string; account: string; password: string }) => void;
  onSwitchToLogin: () => void;
};

export function RegisterDialog({ onClose, onSubmit, onSwitchToLogin }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const mismatch = Boolean(confirmPassword) && password !== confirmPassword;
  const canSubmit = Boolean(displayName.trim() && account.trim() && password.trim() && password === confirmPassword);

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
    <Modal
      title="注册"
      size="sm"
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="button" onClick={onClose}>取消</button>
          <button type="submit" form="auth-register-form" className="button button--primary" disabled={!canSubmit}>注册</button>
        </>
      )}
    >
      <form id="auth-register-form" className="form-stack auth-form" onSubmit={submit}>
        <p className="muted">当前为模拟注册。提交后会提示注册成功，正式账号体系接入后再写入服务器。</p>
        <label>
          昵称
          <input
            autoFocus
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="请输入昵称"
            maxLength={20}
            autoComplete="nickname"
          />
        </label>
        <label>
          手机号 / 邮箱
          <input
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
            placeholder="请设置密码"
            autoComplete="new-password"
          />
        </label>
        <label>
          确认密码
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="请再次输入密码"
            autoComplete="new-password"
          />
        </label>
        {mismatch && <small className="auth-form__error">两次输入的密码不一致</small>}
        <button type="button" className="auth-form__switch" onClick={onSwitchToLogin}>
          已有账号？去登录
        </button>
      </form>
    </Modal>
  );
}
