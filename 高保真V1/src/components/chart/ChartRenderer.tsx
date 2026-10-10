import type { ReactNode } from "react";
import type { ChartType, OccupancySeriesPoint } from "./model";
import { CHART_SERIES_COLORS } from "./palette";
import { occupancyValueDomain } from "./scale";

export type ChartRendererDensity = "slide" | "miniature";

export type ChartRendererProps = {
  type: ChartType;
  series: OccupancySeriesPoint[];
  width?: number;
  height?: number;
  density?: ChartRendererDensity;
  className?: string;
  labelClassName?: string;
  title?: string;
};

export function ChartRenderer({
  type,
  series,
  width = 320,
  height = 200,
  density = "slide",
  className,
  labelClassName = "market-slide__live-chart-label",
  title,
}: ChartRendererProps) {
  const rows = density === "miniature" ? series.slice(0, 5) : series;
  const pad =
    density === "miniature"
      ? { top: 10, right: 8, bottom: 14, left: 16 }
      : { top: 18, right: 12, bottom: 28, left: 28 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const { min, span } = occupancyValueDomain(rows);
  const xAt = (index: number) => pad.left + (rows.length <= 1 ? innerW / 2 : (innerW * index) / (rows.length - 1));
  const yAt = (value: number) => pad.top + innerH - ((value - min) / span) * innerH;
  const avgLine = rows.map((row, index) => `${xAt(index)},${yAt(row.avg)}`).join(" ");
  const spotLine = rows.map((row, index) => `${xAt(index)},${yAt(row.spot)}`).join(" ");
  const band = innerW / Math.max(rows.length, 1);
  const stroke = density === "miniature" ? 2.2 : 2.6;
  const pointR = density === "miniature" ? 2.4 : 3.2;
  const { primary, secondary, accent } = CHART_SERIES_COLORS;

  let content: ReactNode;
  if (type === "pie") {
    const total = rows.reduce((sum, row) => sum + Math.max(row.avg, 0.01), 0) || 1;
    let angle = -Math.PI / 2;
    const cx = width / 2;
    const cy = height / 2 + (density === "miniature" ? 0 : 4);
    const radius = density === "miniature" ? 28 : 58;
    const fills = [primary, secondary, accent];
    content = rows.map((row, index) => {
      const slice = (Math.max(row.avg, 0.01) / total) * Math.PI * 2;
      const start = angle;
      angle += slice;
      const large = slice > Math.PI ? 1 : 0;
      const x1 = cx + Math.cos(start) * radius;
      const y1 = cy + Math.sin(start) * radius;
      const x2 = cx + Math.cos(angle) * radius;
      const y2 = cy + Math.sin(angle) * radius;
      return (
        <path
          key={row.category}
          d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`}
          fill={fills[index % fills.length]}
          opacity={0.9 - (index % 3) * 0.08}
        />
      );
    });
  } else if (type === "bar") {
    content = rows.map((row, index) => {
      const y = pad.top + index * (innerH / Math.max(rows.length, 1)) + (density === "miniature" ? 2 : 4);
      const h = Math.max(density === "miniature" ? 6 : 10, innerH / rows.length - (density === "miniature" ? 4 : 8));
      const avgW = ((row.avg - min) / span) * (innerW * 0.72);
      const spotW = ((row.spot - min) / span) * (innerW * 0.72);
      return (
        <g key={row.category}>
          <rect x={pad.left} y={y} width={Math.max(2, avgW)} height={h * 0.42} rx="2" fill={primary} />
          <rect x={pad.left} y={y + h * 0.48} width={Math.max(2, spotW)} height={h * 0.42} rx="2" fill={secondary} />
          {density === "slide" && (
            <text x={pad.left - 4} y={y + h * 0.55} textAnchor="end" className={labelClassName}>{row.category}</text>
          )}
        </g>
      );
    });
  } else if (type === "column") {
    content = rows.map((row, index) => {
      const x = pad.left + band * index + band * (density === "miniature" ? 0.12 : 0.18);
      const barW = Math.min(density === "miniature" ? 10 : 18, band * 0.28);
      const avgH = ((row.avg - min) / span) * innerH;
      const spotH = ((row.spot - min) / span) * innerH;
      return (
        <g key={row.category}>
          <rect x={x} y={pad.top + innerH - avgH} width={barW} height={Math.max(2, avgH)} rx="2" fill={primary} />
          <rect x={x + barW + (density === "miniature" ? 2 : 3)} y={pad.top + innerH - spotH} width={barW} height={Math.max(2, spotH)} rx="2" fill={secondary} />
          {density === "slide" && (
            <text x={x + barW} y={height - 8} textAnchor="middle" className={labelClassName}>{row.category}</text>
          )}
        </g>
      );
    });
  } else if (type === "area") {
    content = (
      <>
        <path d={`M ${avgLine.split(" ").join(" L ")} L ${xAt(rows.length - 1)},${pad.top + innerH} L ${xAt(0)},${pad.top + innerH} Z`} fill="rgb(59 130 246 / 22%)" />
        <polyline points={avgLine} fill="none" stroke={primary} strokeWidth={density === "miniature" ? 2.2 : 2.4} />
        <polyline points={spotLine} fill="none" stroke={secondary} strokeWidth={density === "miniature" ? 2.2 : 2.4} />
        {density === "slide" && rows.map((row, index) => (
          <text key={row.category} x={xAt(index)} y={height - 8} textAnchor="middle" className={labelClassName}>{row.category}</text>
        ))}
      </>
    );
  } else if (type === "scatter") {
    content = (
      <>
        {rows.map((row, index) => (
          <g key={row.category}>
            <circle cx={xAt(index)} cy={yAt(row.avg)} r={density === "miniature" ? 3 : 4} fill={primary} />
            <circle cx={xAt(index)} cy={yAt(row.spot)} r={density === "miniature" ? 3 : 4} fill={secondary} />
            {density === "slide" && (
              <text x={xAt(index)} y={height - 8} textAnchor="middle" className={labelClassName}>{row.category}</text>
            )}
          </g>
        ))}
      </>
    );
  } else {
    content = (
      <>
        <polyline points={avgLine} fill="none" stroke={primary} strokeWidth={stroke} strokeLinejoin="round" />
        <polyline points={spotLine} fill="none" stroke={secondary} strokeWidth={stroke} strokeLinejoin="round" />
        {rows.map((row, index) => (
          <g key={row.category}>
            <circle cx={xAt(index)} cy={yAt(row.avg)} r={pointR} fill={primary} />
            <circle cx={xAt(index)} cy={yAt(row.spot)} r={pointR} fill={secondary} />
            {density === "slide" && (
              <text x={xAt(index)} y={height - 8} textAnchor="middle" className={labelClassName}>{row.category}</text>
            )}
          </g>
        ))}
      </>
    );
  }

  return (
    <svg className={className} viewBox={`0 0 ${width} ${height}`} role={title ? "img" : "presentation"} aria-label={title} aria-hidden={title ? undefined : true}>
      {content}
    </svg>
  );
}
