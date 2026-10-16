import type { ReactNode } from "react";
import type { ChartType, OccupancySeriesPoint } from "./model";
import { CHART_SERIES_COLORS } from "./palette";
import { occupancyValueDomain, seriesNumbersOf } from "./scale";

type ChartRendererDensity = "slide" | "miniature";

type ChartRendererProps = {
  type: ChartType;
  series: OccupancySeriesPoint[];
  width?: number;
  height?: number;
  density?: ChartRendererDensity;
  className?: string;
  labelClassName?: string;
  title?: string;
};

const SERIES_FILLS = [
  CHART_SERIES_COLORS.primary,
  CHART_SERIES_COLORS.secondary,
  CHART_SERIES_COLORS.accent,
  "#f59e0b",
] as const;

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
  const seriesCount = Math.max(2, ...rows.map((row) => seriesNumbersOf(row).length));
  const xAt = (index: number) => pad.left + (rows.length <= 1 ? innerW / 2 : (innerW * index) / (rows.length - 1));
  const yAt = (value: number) => pad.top + innerH - ((value - min) / span) * innerH;
  const band = innerW / Math.max(rows.length, 1);
  const stroke = density === "miniature" ? 2.2 : 2.6;
  const pointR = density === "miniature" ? 2.4 : 3.2;
  const linePoints = Array.from({ length: seriesCount }, (_, seriesIndex) => (
    rows.map((row, index) => `${xAt(index)},${yAt(seriesNumbersOf(row)[seriesIndex] ?? 0)}`).join(" ")
  ));

  let content: ReactNode;
  if (type === "pie") {
    const total = rows.reduce((sum, row) => sum + Math.max(row.avg, 0.01), 0) || 1;
    let angle = -Math.PI / 2;
    const cx = width / 2;
    const cy = height / 2 + (density === "miniature" ? 0 : 4);
    const radius = density === "miniature" ? 28 : 58;
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
          fill={SERIES_FILLS[index % SERIES_FILLS.length]}
          opacity={0.9 - (index % 3) * 0.08}
        />
      );
    });
  } else if (type === "bar") {
    content = rows.map((row, index) => {
      const y = pad.top + index * (innerH / Math.max(rows.length, 1)) + (density === "miniature" ? 2 : 4);
      const h = Math.max(density === "miniature" ? 6 : 10, innerH / rows.length - (density === "miniature" ? 4 : 8));
      const values = seriesNumbersOf(row);
      const barH = h / Math.max(values.length, 1);
      return (
        <g key={row.category}>
          {values.map((value, seriesIndex) => {
            const barW = ((value - min) / span) * (innerW * 0.72);
            return (
              <rect
                key={`${row.category}-${seriesIndex}`}
                x={pad.left}
                y={y + barH * seriesIndex}
                width={Math.max(2, barW)}
                height={Math.max(2, barH * 0.82)}
                rx="2"
                fill={SERIES_FILLS[seriesIndex % SERIES_FILLS.length]}
              />
            );
          })}
          {density === "slide" && (
            <text x={pad.left - 4} y={y + h * 0.55} textAnchor="end" className={labelClassName}>{row.category}</text>
          )}
        </g>
      );
    });
  } else if (type === "column") {
    content = rows.map((row, index) => {
      const x = pad.left + band * index + band * (density === "miniature" ? 0.1 : 0.14);
      const values = seriesNumbersOf(row);
      const gap = density === "miniature" ? 1.5 : 2.5;
      const barW = Math.min(
        density === "miniature" ? 8 : 14,
        (band * 0.7 - gap * Math.max(values.length - 1, 0)) / Math.max(values.length, 1),
      );
      return (
        <g key={row.category}>
          {values.map((value, seriesIndex) => {
            const barH = ((value - min) / span) * innerH;
            return (
              <rect
                key={`${row.category}-${seriesIndex}`}
                x={x + seriesIndex * (barW + gap)}
                y={pad.top + innerH - barH}
                width={barW}
                height={Math.max(2, barH)}
                rx="2"
                fill={SERIES_FILLS[seriesIndex % SERIES_FILLS.length]}
              />
            );
          })}
          {density === "slide" && (
            <text x={x + (values.length * (barW + gap) - gap) / 2} y={height - 8} textAnchor="middle" className={labelClassName}>{row.category}</text>
          )}
        </g>
      );
    });
  } else if (type === "area") {
    content = (
      <>
        <path d={`M ${linePoints[0]?.split(" ").join(" L ") ?? ""} L ${xAt(rows.length - 1)},${pad.top + innerH} L ${xAt(0)},${pad.top + innerH} Z`} fill="rgb(59 130 246 / 22%)" />
        {linePoints.map((points, seriesIndex) => (
          <polyline
            key={`area-${seriesIndex}`}
            points={points}
            fill="none"
            stroke={SERIES_FILLS[seriesIndex % SERIES_FILLS.length]}
            strokeWidth={density === "miniature" ? 2.2 : 2.4}
          />
        ))}
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
            {seriesNumbersOf(row).map((value, seriesIndex) => (
              <circle
                key={`${row.category}-${seriesIndex}`}
                cx={xAt(index)}
                cy={yAt(value)}
                r={density === "miniature" ? 3 : 4}
                fill={SERIES_FILLS[seriesIndex % SERIES_FILLS.length]}
              />
            ))}
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
        {linePoints.map((points, seriesIndex) => (
          <polyline
            key={`line-${seriesIndex}`}
            points={points}
            fill="none"
            stroke={SERIES_FILLS[seriesIndex % SERIES_FILLS.length]}
            strokeWidth={stroke}
            strokeLinejoin="round"
          />
        ))}
        {rows.map((row, index) => (
          <g key={row.category}>
            {seriesNumbersOf(row).map((value, seriesIndex) => (
              <circle
                key={`${row.category}-${seriesIndex}`}
                cx={xAt(index)}
                cy={yAt(value)}
                r={pointR}
                fill={SERIES_FILLS[seriesIndex % SERIES_FILLS.length]}
              />
            ))}
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
