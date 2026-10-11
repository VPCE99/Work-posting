import { useEffect, useId, useRef, useState } from "react";
import { useManagedTimeout } from "./useManagedTimeout";

/** Progressive follow-up status copy — 4 steps × 2s ≈ 8s thinking window. */
const THINKING_STATUS_STEPS = [
  "思考下一步",
  "梳理分析要点",
  "正在制作图表",
  "汇总完整回答",
] as const;

const STEP_MS = 2000;
const ROLL_MS = 380;

export function ThinkingMark({ leaving = false, intro = false }: { leaving?: boolean; intro?: boolean }) {
  const gradientId = useId().replace(/:/g, "");
  const [step, setStep] = useState(0);
  const [outgoing, setOutgoing] = useState<string | null>(null);
  const skipRoll = useRef(true);
  const { schedule: scheduleRoll, clear: clearRoll } = useManagedTimeout();
  const className = ["follow-up-thinking", intro ? "follow-up-thinking--intro" : "", leaving ? "follow-up-thinking--leaving" : ""].filter(Boolean).join(" ");
  const label = THINKING_STATUS_STEPS[step] ?? THINKING_STATUS_STEPS[0];

  useEffect(() => {
    if (leaving) return;
    const timer = window.setInterval(() => {
      setStep((value) => {
        setOutgoing(THINKING_STATUS_STEPS[value] ?? null);
        return (value + 1) % THINKING_STATUS_STEPS.length;
      });
    }, STEP_MS);
    return () => window.clearInterval(timer);
  }, [leaving]);

  useEffect(() => {
    if (!outgoing) {
      clearRoll();
      return;
    }
    scheduleRoll(() => setOutgoing(null), ROLL_MS);
  }, [outgoing, scheduleRoll, clearRoll]);

  useEffect(() => {
    skipRoll.current = false;
  }, []);

  const enterClass = skipRoll.current || !outgoing
    ? "follow-up-thinking__label"
    : "follow-up-thinking__label follow-up-thinking__label--enter";

  return (
    <div className={className} role="status" aria-live="polite" aria-label={label}>
      <svg className="thinking-mark" viewBox="0 0 104 104" aria-hidden="true">
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
      <span className="follow-up-thinking__viewport">
        {outgoing && (
          <span className="follow-up-thinking__label follow-up-thinking__label--exit" aria-hidden="true">
            {outgoing}
          </span>
        )}
        <span className={enterClass} key={label}>
          {label}
        </span>
      </span>
    </div>
  );
}
