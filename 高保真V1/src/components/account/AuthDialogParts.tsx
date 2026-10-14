import { useId, type ReactNode } from "react";
import { Brand } from "../ui/Brand";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export function MailIcon() {
  return (
    <Icon>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Icon>
  );
}

export function LockIcon() {
  return (
    <Icon>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function UserIcon() {
  return (
    <Icon>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19.2a7 7 0 0 1 14 0" />
    </Icon>
  );
}

export function ChatIcon() {
  return (
    <Icon>
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 3 1.2-4.2A8 8 0 1 1 21 12Z" />
    </Icon>
  );
}

function CheckIcon() {
  return (
    <Icon>
      <path d="m8 12.5 2.6 2.6L16.5 9" />
    </Icon>
  );
}

export function AuthField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <label>
      {label}
      <span className="auth-field">
        {icon}
        {children}
      </span>
    </label>
  );
}

export function AuthThinkingMark() {
  const gradientId = useId().replace(/:/g, "");

  return (
    <div className="auth-dialog__mark" aria-hidden="true">
      <svg viewBox="0 0 104 104">
        <defs>
          <linearGradient id={`${gradientId}-petal-1`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#08BBD1" />
            <stop offset="1" stopColor="#1ED7C7" />
          </linearGradient>
          <linearGradient id={`${gradientId}-petal-2`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#16CFA7" />
            <stop offset="1" stopColor="#52E779" />
          </linearGradient>
          <linearGradient id={`${gradientId}-petal-3`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#1679F5" />
            <stop offset="1" stopColor="#1CA7F2" />
          </linearGradient>
          <linearGradient id={`${gradientId}-petal-4`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#08B8D6" />
            <stop offset="1" stopColor="#19D0B8" />
          </linearGradient>
          <linearGradient id={`${gradientId}-bars`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#0EA5F4" />
            <stop offset="1" stopColor="#21D488" />
          </linearGradient>
        </defs>
        <ellipse className="thinking-petal thinking-petal--1" cx="29" cy="29" rx="29" ry="29" fill={`url(#${gradientId}-petal-1)`} />
        <ellipse className="thinking-petal thinking-petal--2" cx="75" cy="29" rx="29" ry="29" fill={`url(#${gradientId}-petal-2)`} />
        <ellipse className="thinking-petal thinking-petal--3" cx="29" cy="75" rx="29" ry="29" fill={`url(#${gradientId}-petal-3)`} />
        <ellipse className="thinking-petal thinking-petal--4" cx="75" cy="75" rx="29" ry="29" fill={`url(#${gradientId}-petal-4)`} />
        <path d="M52 26c15 0 27 11 27 26 0 6-2 12-6 16l5 13-13-5c-4 3-8 4-13 4-15 0-27-12-27-27 0-15 12-27 27-27z" fill="#F8FCFD" stroke="#D8F4F4" strokeWidth="2" />
        <rect className="thinking-bar thinking-bar--1" x="35" y="53.432" width="8" height="16" rx="4" fill={`url(#${gradientId}-bars)`} />
        <rect className="thinking-bar thinking-bar--2" x="48" y="45.649" width="8" height="23" rx="4" fill={`url(#${gradientId}-bars)`} />
        <rect className="thinking-bar thinking-bar--3" x="61" y="37" width="8" height="32" rx="4" fill={`url(#${gradientId}-bars)`} />
      </svg>
    </div>
  );
}

export function LoginVisual() {
  return (
    <aside className="auth-dialog__visual">
      <Brand />
      <p className="auth-dialog__kicker">CONTINUE YOUR WORK</p>
      <h2 className="auth-dialog__headline">欢迎回来，继续未完成的思考。</h2>
      <p className="auth-dialog__lead">对话、任务与文件已在工作区中保持同步。</p>
      <p className="auth-dialog__note">端到端会话隔离 · 数据仅用于当前工作区</p>
    </aside>
  );
}

const FLOW_STEPS = [
  { title: "连接知识库", detail: "导入文件与常用资料", done: true },
  { title: "设置研究偏好", detail: "定义输出语言与格式", done: true },
  { title: "创建第一个任务", detail: "让 AI 自动推进工作", done: false },
  { title: "邀请协作者", detail: "与团队共享工作区", done: false },
];

export function RegisterVisual() {
  return (
    <aside className="auth-dialog__visual">
      <Brand />
      <p className="auth-dialog__kicker">SET UP YOUR SPACE</p>
      <h2 className="auth-dialog__headline">建立一套属于你的智能工作流。</h2>
      <p className="auth-dialog__lead">从捕捉想法，到交付成果，保持清晰有序。</p>
      <div className="auth-flow" aria-hidden="true">
        <div className="auth-flow__meta">
          <span>WORKFLOW PREVIEW</span>
          <span>03 / 04</span>
        </div>
        {FLOW_STEPS.map((step) => (
          <div key={step.title} className={`auth-flow__step${step.done ? " auth-flow__step--done" : ""}`}>
            <span className="auth-flow__mark">{step.done ? <CheckIcon /> : <span className="auth-flow__ring" />}</span>
            <div className="auth-flow__card">
              <strong>{step.title}</strong>
              <small>{step.detail}</small>
            </div>
          </div>
        ))}
      </div>
      <p className="auth-dialog__note">设置可随时调整 · 工作区数据独立存储</p>
    </aside>
  );
}
