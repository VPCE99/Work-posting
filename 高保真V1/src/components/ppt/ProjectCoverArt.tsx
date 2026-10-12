import { useId } from "react";
import type { PptCoverLayout } from "../../types";

/** Renders the first-slide cover art used by project cards and the editor canvas. */
export function ProjectCoverArt({
  layout,
  title,
  subtitle,
  variant = "card",
}: {
  layout: PptCoverLayout;
  title: string;
  subtitle: string;
  variant?: "card" | "slide";
}) {
  const gradId = useId();
  const className = [
    "ppt-cover-art",
    `ppt-cover-art--${layout}`,
    variant === "slide" ? "ppt-cover-art--slide" : "ppt-cover-art--card",
  ].join(" ");

  return (
    <div className={className} aria-hidden={variant === "card" ? true : undefined}>
      <div className="ppt-cover-art__copy">
        <strong className="ppt-cover-art__title">{title}</strong>
        <span className="ppt-cover-art__rule" />
        <small className="ppt-cover-art__subtitle">{subtitle}</small>
      </div>
      <div className="ppt-cover-art__visual">
        {layout === "industry-outlook" && <IndustryOutlookVisual gradId={gradId} />}
        {layout === "monthly-report" && <MonthlyReportVisual gradId={gradId} />}
        {layout === "competition-map" && <CompetitionMapVisual gradId={gradId} />}
      </div>
    </div>
  );
}

function IndustryOutlookVisual({ gradId }: { gradId: string }) {
  const bars = [18, 26, 34, 42, 50, 58, 66, 74, 82, 92];
  const points = bars.map((height, index) => {
    const x = 12 + index * 18;
    const y = 108 - height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg className="ppt-cover-art__chart" viewBox="0 0 200 120" role="img" aria-label="增长趋势图">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1fd4c8" />
          <stop offset="55%" stopColor="#127f9a" />
          <stop offset="100%" stopColor="#0b3d6e" />
        </linearGradient>
      </defs>
      <g className="ppt-cover-art__grid" stroke="#2a3038" strokeWidth="1">
        <path d="M8 20H192" />
        <path d="M8 48H192" />
        <path d="M8 76H192" />
        <path d="M8 104H192" />
      </g>
      {bars.map((height, index) => (
        <rect
          key={height}
          className="ppt-cover-art__bar"
          x={6 + index * 18}
          y={108 - height}
          width="12"
          height={height}
          rx="2"
          fill={`url(#${gradId})`}
        />
      ))}
      <polyline className="ppt-cover-art__line" points={points} />
      {bars.map((height, index) => (
        <circle key={`p-${height}`} className="ppt-cover-art__point" cx={12 + index * 18} cy={108 - height} r="2.4" />
      ))}
      <path className="ppt-cover-art__arrow" d="M178 20 L192 14 L186 28 Z" />
    </svg>
  );
}

function smoothThrough(points: ReadonlyArray<readonly [number, number]>) {
  const first = points[0];
  if (!first) return "";
  let d = `M ${first[0]} ${first[1]}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const c1x = (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1);
    const c1y = (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1);
    const c2x = (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1);
    const c2y = (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1);
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function MonthlyReportVisual({ gradId }: { gradId: string }) {
  const areaId = `${gradId}-area`;
  const primary: ReadonlyArray<readonly [number, number]> = [
    [14, 84], [42, 70], [70, 74], [98, 52], [126, 46], [154, 32], [184, 22],
  ];
  const secondary: ReadonlyArray<readonly [number, number]> = primary.map(([x, y]) => [x, y + 16]);
  const primaryPath = smoothThrough(primary);
  const end = primary[primary.length - 1] ?? [184, 22];
  const start = primary[0] ?? [14, 84];
  return (
    <svg className="ppt-cover-art__chart" viewBox="0 0 200 120" role="img" aria-label="月报指标图">
      <defs>
        <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1fd4c8" stopOpacity="0.42" />
          <stop offset="70%" stopColor="#127f9a" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0b3d6e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="ppt-cover-art__grid" stroke="#2a3038" strokeWidth="1">
        <path d="M8 22H192" />
        <path d="M8 48H192" />
        <path d="M8 74H192" />
        <path d="M8 100H192" />
      </g>
      <path className="ppt-cover-art__area" d={`${primaryPath} L ${end[0]} 108 L ${start[0]} 108 Z`} fill={`url(#${areaId})`} />
      <path className="ppt-cover-art__series ppt-cover-art__series--soft" d={smoothThrough(secondary)} />
      <path className="ppt-cover-art__series" d={primaryPath} />
      {primary.map(([x, y], index) => (
        <g key={`${x}-${y}`}>
          {index === primary.length - 1 && <circle className="ppt-cover-art__halo" cx={x} cy={y} r="6.5" />}
          <circle className="ppt-cover-art__point" cx={x} cy={y} r={index === primary.length - 1 ? 2.8 : 2.2} />
        </g>
      ))}
    </svg>
  );
}

function CompetitionMapVisual({ gradId }: { gradId: string }) {
  const leadId = `${gradId}-lead`;
  const bubbles: Array<{ cx: number; cy: number; r: number; fill: string; lead?: boolean }> = [
    { cx: 52, cy: 78, r: 8, fill: "#2a3440" },
    { cx: 78, cy: 58, r: 11, fill: "#1a4d5c" },
    { cx: 112, cy: 38, r: 16, fill: `url(#${leadId})`, lead: true },
    { cx: 148, cy: 54, r: 12, fill: "#146878" },
    { cx: 168, cy: 80, r: 7, fill: "#31404c" },
    { cx: 96, cy: 86, r: 6, fill: "#24303a" },
  ];
  return (
    <svg className="ppt-cover-art__chart" viewBox="0 0 200 120" role="img" aria-label="竞品格局图">
      <defs>
        <radialGradient id={leadId} cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#7af0e6" />
          <stop offset="42%" stopColor="#14b8b0" />
          <stop offset="100%" stopColor="#0b4e6e" />
        </radialGradient>
      </defs>
      <g className="ppt-cover-art__grid" stroke="#2a3038" strokeWidth="1">
        <path d="M16 24H186" />
        <path d="M16 52H186" />
        <path d="M16 80H186" />
        <path d="M16 108H186" />
        <path d="M40 16V108" />
        <path d="M88 16V108" />
        <path d="M136 16V108" />
        <path d="M184 16V108" />
      </g>
      {bubbles.map((bubble) => (
        <g key={`${bubble.cx}-${bubble.cy}`}>
          {bubble.lead && <circle className="ppt-cover-art__halo" cx={bubble.cx} cy={bubble.cy} r={bubble.r + 7} />}
          <circle
            className={bubble.lead ? "ppt-cover-art__bubble ppt-cover-art__bubble--lead" : "ppt-cover-art__bubble"}
            cx={bubble.cx}
            cy={bubble.cy}
            r={bubble.r}
            fill={bubble.fill}
          />
          {bubble.lead && <circle className="ppt-cover-art__point" cx={bubble.cx - 4} cy={bubble.cy - 4} r="2.2" />}
        </g>
      ))}
    </svg>
  );
}
