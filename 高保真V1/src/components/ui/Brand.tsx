import { useId } from "react";

type BrandProps = {
  compact?: boolean;
  showTagline?: boolean;
  reveal?: boolean;
};

export function Brand({ compact = false, showTagline = false, reveal = false }: BrandProps) {
  const gradientId = useId().replace(/:/g, "");
  return (
    <span className={`brand ${compact ? "brand--compact" : ""}`} aria-label="ChopChat">
      <svg className={reveal ? "brand-mark brand-mark--reveal" : "brand-mark"} aria-hidden="true" viewBox="0 0 104 104">
        <defs>
          <linearGradient id={`${gradientId}-cyan`} x1="0" y1="1" x2="1" y2="0"><stop stopColor="#08BBD1" /><stop offset="1" stopColor="#1ED7C7" /></linearGradient>
          <linearGradient id={`${gradientId}-green`} x1="0" y1="1" x2="1" y2="0"><stop stopColor="#16CFA7" /><stop offset="1" stopColor="#52E779" /></linearGradient>
          <linearGradient id={`${gradientId}-blue`} x1="0" y1="1" x2="1" y2="0"><stop stopColor="#1679F5" /><stop offset="1" stopColor="#1CA7F2" /></linearGradient>
          <linearGradient id={`${gradientId}-aqua`} x1="0" y1="1" x2="1" y2="0"><stop stopColor="#08B8D6" /><stop offset="1" stopColor="#19D0B8" /></linearGradient>
          <linearGradient id={`${gradientId}-bars`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#0EA5F4" /><stop offset="1" stopColor="#21D488" /></linearGradient>
        </defs>
        <circle className="brand-petal brand-petal--1" cx="29" cy="29" r="29" fill={`url(#${gradientId}-cyan)`} opacity="0.8" />
        <circle className="brand-petal brand-petal--2" cx="75" cy="29" r="29" fill={`url(#${gradientId}-green)`} opacity="0.8" />
        <circle className="brand-petal brand-petal--3" cx="29" cy="75" r="29" fill={`url(#${gradientId}-blue)`} opacity="0.8" />
        <circle className="brand-petal brand-petal--4" cx="75" cy="75" r="29" fill={`url(#${gradientId}-aqua)`} opacity="0.8" />
        <path className="brand-bubble" d="M52 25c-15.5 0-28 12.1-28 27s12.5 27 28 27c4.7 0 9.1-1.1 13-3.1L77.5 82l-3.3-13.2C77.9 64.2 80 58.4 80 52c0-14.9-12.5-27-28-27Z" fill="#F8FCFD" stroke="#D8F4F4" strokeWidth="2" strokeLinejoin="round" />
        <rect className="brand-bar brand-bar--1" x="35" y="54" width="8" height="16" rx="4" fill={`url(#${gradientId}-bars)`} />
        <rect className="brand-bar brand-bar--2" x="48" y="46" width="8" height="23" rx="4" fill={`url(#${gradientId}-bars)`} />
        <rect className="brand-bar brand-bar--3" x="61" y="37" width="8" height="32" rx="4" fill={`url(#${gradientId}-bars)`} />
      </svg>
      {!compact && (
        <span className="brand-copy">
          <strong>ChopChat</strong>
          {showTagline && <small>REITs Knowledge Agent</small>}
        </span>
      )}
    </span>
  );
}
