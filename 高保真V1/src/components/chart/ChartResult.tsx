import { paddedValueDomain, scaleLinear } from "./scale";
import type { ChartField, Dataset } from "./chartDatasets";

export function ChartResult({
  title,
  dataset,
  x,
  left,
  right,
}: {
  title: string;
  dataset: Dataset;
  x: ChartField;
  left: ChartField;
  right: ChartField | null;
}) {
  const labels = dataset.rows.map((row) => String(row[x.id]));
  const leftValues = dataset.rows.map((row) => Number(row[left.id]));
  const rightValues = right ? dataset.rows.map((row) => Number(row[right.id])) : [];
  const width = 640;
  const height = 320;
  const pad = { top: 24, right: right ? 54 : 24, bottom: 36, left: 54 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const leftDomain = paddedValueDomain(leftValues);
  const rightDomain = paddedValueDomain(rightValues.length ? rightValues : [1]);
  const band = innerW / labels.length;
  const barW = Math.min(46, band * 0.42);
  const yOf = (value: number, axis: { min: number; max: number }) =>
    scaleLinear(value, axis, { start: pad.top + innerH, end: pad.top });
  const line = rightValues.map((value, index) => `${pad.left + band * index + band / 2},${yOf(value, rightDomain)}`).join(" ");
  const ticks = [0, 0.5, 1];

  return (
    <div className="chart-result">
      <header>
        <strong>{title || "未命名图表"}</strong>
        <div>
          <span><i className="is-bar" />{left.name}</span>
          {right && <span><i className="is-line" />{right.name}</span>}
        </div>
      </header>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title || "生成的图表"}>
        {ticks.map((tick) => {
          const y = pad.top + innerH - tick * innerH;
          return <path key={tick} className="chart-result__grid" d={`M${pad.left} ${y}H${width - pad.right}`} />;
        })}
        {leftValues.map((value, index) => {
          const xPos = pad.left + band * index + (band - barW) / 2;
          const y = yOf(value, leftDomain);
          return <rect key={labels[index]} className="chart-result__bar" x={xPos} y={y} width={barW} height={pad.top + innerH - y} rx="0" ry="0" />;
        })}
        {right && <polyline className="chart-result__line" points={line} />}
        {right && rightValues.map((value, index) => (
          <circle key={labels[index]} className="chart-result__point" cx={pad.left + band * index + band / 2} cy={yOf(value, rightDomain)} r="4.5" />
        ))}
        {labels.map((label, index) => (
          <text key={label} className="chart-result__label" x={pad.left + band * index + band / 2} y={height - 12} textAnchor="middle">{label}</text>
        ))}
        <text className="chart-result__unit" x={pad.left - 10} y={18} textAnchor="end">{left.unit}</text>
        {right && <text className="chart-result__unit" x={width - pad.right + 10} y={18}>{right.unit}</text>}
      </svg>
    </div>
  );
}
