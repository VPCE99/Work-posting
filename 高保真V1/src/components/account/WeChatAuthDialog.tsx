import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { ChatIcon } from "./AuthDialogParts";

type Mode = "login" | "register";

type Props = {
  mode: Mode;
  onClose: () => void;
  onComplete: () => void;
};

const QR_SIZE = 21;
const START_SECONDS = 4 * 60 + 32;

function moduleOn(x: number, y: number) {
  const finder = (ox: number, oy: number) => {
    if (x < ox || y < oy || x >= ox + 7 || y >= oy + 7) return false;
    const edge = x === ox || y === oy || x === ox + 6 || y === oy + 6;
    const core = x >= ox + 2 && x <= ox + 4 && y >= oy + 2 && y <= oy + 4;
    return edge || core;
  };
  if (finder(0, 0) || finder(14, 0) || finder(0, 14)) return true;
  if ((x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)) return false;
  if (x > 6 && x < 14 && y > 6 && y < 14) return false;
  if (x === 6 || y === 6) return (x + y) % 2 === 0;
  return (x * 17 + y * 13) % 5 > 1;
}

function SampleQr() {
  const cells = [];
  for (let y = 0; y < QR_SIZE; y += 1) {
    for (let x = 0; x < QR_SIZE; x += 1) {
      if (!moduleOn(x, y)) continue;
      cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
    }
  }
  return (
    <svg className="wechat-auth__qr" viewBox="0 0 21 21" aria-hidden="true">
      {cells}
    </svg>
  );
}

function formatTime(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function WeChatAuthDialog({ mode, onClose, onComplete }: Props) {
  const [seconds, setSeconds] = useState(START_SECONDS);
  const expired = seconds === 0;
  const isLogin = mode === "login";

  useEffect(() => {
    if (expired) return;
    const timer = window.setInterval(() => {
      setSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [expired]);

  return (
    <Modal
      title={isLogin ? "微信登录" : "微信注册"}
      size="sm"
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="button" onClick={onClose}>返回</button>
          <button type="button" className="button button--primary" onClick={onComplete} disabled={expired}>
            模拟扫码完成
          </button>
        </>
      )}
    >
      <div className="wechat-auth">
        <div className={`wechat-auth__code${expired ? " wechat-auth__code--expired" : ""}`}>
          <SampleQr />
          <span className="wechat-auth__badge"><ChatIcon /></span>
          {expired && <p className="wechat-auth__expired">二维码已失效</p>}
        </div>
        <p className="wechat-auth__lead">
          {isLogin ? "请使用微信扫描二维码，在手机上确认后即可登录。" : "请使用微信扫描二维码，确认后即可创建账户。"}
        </p>
        <p className="wechat-auth__status">{expired ? "等待重新获取二维码" : "等待扫码"}</p>
        <p className="wechat-auth__meta">
          {expired ? "当前为示例流程。" : `二维码剩余有效时间 ${formatTime(seconds)} · 当前为示例流程。`}
          {expired && (
            <button type="button" className="wechat-auth__refresh" onClick={() => setSeconds(START_SECONDS)}>
              刷新二维码
            </button>
          )}
        </p>
      </div>
    </Modal>
  );
}
