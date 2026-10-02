import { useState, type DragEvent } from "react";
import { usePrototype } from "../../app/PrototypeContext";
import { Modal } from "../ui/Modal";

type FieldKind = "dimension" | "measure";
type Slot = "x" | "yLeft" | "yRight";

type ChartField = {
  id: string;
  name: string;
  kind: FieldKind;
  unit?: string;
};

type Dataset = {
  id: string;
  name: string;
  source: string;
  fields: ChartField[];
  rows: Array<Record<string, string | number>>;
};

const datasets: Dataset[] = [
  {
    id: "reit-trend",
    name: "产业园 REITs 经营趋势",
    source: "当前对话 · 经营趋势表",
    fields: [
      { id: "year", name: "年度", kind: "dimension" },
      { id: "occupancy", name: "平均出租率", kind: "measure", unit: "%" },
      { id: "revenue", name: "营业收入", kind: "measure", unit: "亿元" },
    ],
    rows: [
      { year: "2023", occupancy: 89.6, revenue: 26.6 },
      { year: "2024", occupancy: 91.7, revenue: 28.9 },
      { year: "2025", occupancy: 93.8, revenue: 31.4 },
    ],
  },
];

const fields = datasets.flatMap((dataset) => dataset.fields);
const fieldById = (id: string | null) => fields.find((field) => field.id === id) ?? null;

const emptySlots: Record<Slot, string | null> = { x: null, yLeft: null, yRight: null };

export function ChartDialog() {
  const { notify, setActiveDialog } = usePrototype();
  const [openDatasets, setOpenDatasets] = useState<string[]>(datasets.map((dataset) => dataset.id));
  const [title, setTitle] = useState("");
  const [slots, setSlots] = useState(emptySlots);
  const [over, setOver] = useState<Slot | null>(null);
  const [generated, setGenerated] = useState(false);

  const close = () => setActiveDialog(null);
  const xField = fieldById(slots.x);
  const leftField = fieldById(slots.yLeft);
  const rightField = fieldById(slots.yRight);
  const canGenerate = Boolean(xField && leftField);

  const assign = (slot: Slot, id: string) => {
    const field = fieldById(id);
    if (!field) return;
    if (slot === "x" && field.kind !== "dimension") {
      notify("X 轴请拖入维度字段");
      return;
    }
    if (slot !== "x" && field.kind !== "measure") {
      notify("Y 轴请拖入度量字段");
      return;
    }
    setSlots((current) => {
      const next = { ...current };
      (Object.keys(next) as Slot[]).forEach((key) => {
        if (next[key] === id) next[key] = null;
      });
      next[slot] = id;
      return next;
    });
    setGenerated(false);
  };

  const onDrop = (slot: Slot) => (event: DragEvent) => {
    event.preventDefault();
    setOver(null);
    assign(slot, event.dataTransfer.getData("text/plain"));
  };

  const clearSlot = (slot: Slot) => {
    setSlots((current) => ({ ...current, [slot]: null }));
    setGenerated(false);
  };

  const datasetOf = (fieldId: string) => datasets.find((dataset) => dataset.fields.some((field) => field.id === fieldId)) ?? datasets[0];

  return (
    <Modal
      title="自定义作图"
      size="xl"
      onClose={close}
      footer={
        <>
          <button className="button button--primary" disabled={!canGenerate} onClick={() => setGenerated(true)}>生成图表</button>
          <div className="chart-dialog__downloads">
            <button className="button" disabled={!generated} onClick={() => notify("已创建数据下载任务", "success")}>下载数据</button>
            <button className="button" disabled={!generated} onClick={() => notify("已创建图片下载任务", "success")}>下载图片</button>
          </div>
        </>
      }
    >
      <div className="chart-dialog">
        <aside className="chart-sources">
          <h2>数据集</h2>
          {datasets.map((dataset) => {
            const open = openDatasets.includes(dataset.id);
            const dimensions = dataset.fields.filter((field) => field.kind === "dimension");
            const measures = dataset.fields.filter((field) => field.kind === "measure");
            return (
              <section className="chart-source" key={dataset.id}>
                <button
                  type="button"
                  className="chart-source__toggle"
                  aria-expanded={open}
                  onClick={() => setOpenDatasets((current) => open ? current.filter((id) => id !== dataset.id) : [...current, dataset.id])}
                >
                  <span className="chart-source__caret" aria-hidden="true" />
                  <strong>{dataset.name}</strong>
                </button>
                {open && (
                  <div className="chart-source__body">
                    <small>{dataset.source}</small>
                    <FieldGroup label="维度" fields={dimensions} />
                    <FieldGroup label="度量" fields={measures} />
                  </div>
                )}
              </section>
            );
          })}
        </aside>

        <main className="chart-canvas">
          {generated && xField && leftField ? (
            <ChartResult title={title} dataset={datasetOf(xField.id)} x={xField} left={leftField} right={rightField} />
          ) : (
            <div className="chart-canvas__empty">
              <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 34V18M20 34V12M30 34V22M38 34H8" /></svg>
              <p>拖拽左侧字段到右侧配置区</p>
            </div>
          )}
        </main>

        <aside className="chart-config">
          <label className="chart-config__title">图表标题<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="输入图表标题..." /></label>
          <DropSlot slot="x" label="X 轴" hint="拖入 1 个维度" field={xField} active={over === "x"} onDrop={onDrop("x")} onOver={() => setOver("x")} onLeave={() => setOver(null)} onClear={() => clearSlot("x")} />
          <DropSlot slot="yLeft" label="Y 轴 · 左" hint="拖入 1 个度量" field={leftField} active={over === "yLeft"} onDrop={onDrop("yLeft")} onOver={() => setOver("yLeft")} onLeave={() => setOver(null)} onClear={() => clearSlot("yLeft")} />
          <DropSlot slot="yRight" label="Y 轴 · 右" hint="可选，独立刻度" field={rightField} active={over === "yRight"} onDrop={onDrop("yRight")} onOver={() => setOver("yRight")} onLeave={() => setOver(null)} onClear={() => clearSlot("yRight")} />
        </aside>
      </div>
    </Modal>
  );
}

function FieldGroup({ label, fields: items }: { label: string; fields: ChartField[] }) {
  return (
    <div className="chart-field-group">
      <span>{label}</span>
      <div>
        {items.map((field) => (
          <button
            key={field.id}
            type="button"
            className={`chart-chip chart-chip--${field.kind}`}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("text/plain", field.id);
              event.dataTransfer.effectAllowed = "move";
            }}
          >
            <i>{field.kind === "dimension" ? "Aa" : "#"}</i>
            {field.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function DropSlot({
  label,
  hint,
  field,
  active,
  onDrop,
  onOver,
  onLeave,
  onClear,
}: {
  slot: Slot;
  label: string;
  hint: string;
  field: ChartField | null;
  active: boolean;
  onDrop: (event: DragEvent) => void;
  onOver: () => void;
  onLeave: () => void;
  onClear: () => void;
}) {
  return (
    <label className="chart-drop">
      <span>{label}</span>
      <small>{hint}</small>
      <div
        className={active ? "chart-drop__zone is-over" : "chart-drop__zone"}
        onDragOver={(event) => {
          event.preventDefault();
          onOver();
        }}
        onDragLeave={onLeave}
        onDrop={onDrop}
      >
        {field ? (
          <button type="button" className={`chart-chip chart-chip--${field.kind}`} onClick={onClear}>
            <i>{field.kind === "dimension" ? "Aa" : "#"}</i>
            {field.name}
            <b aria-hidden="true">×</b>
          </button>
        ) : (
          <em>拖拽字段到此处</em>
        )}
      </div>
    </label>
  );
}

function ChartResult({
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
  const domain = (values: number[]) => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const slack = (max - min) * 0.6 || max * 0.08;
    return { min: Math.max(0, min - slack), max: max + slack };
  };
  const leftDomain = domain(leftValues);
  const rightDomain = domain(rightValues.length ? rightValues : [1]);
  const band = innerW / labels.length;
  const barW = Math.min(46, band * 0.42);
  const yOf = (value: number, axis: { min: number; max: number }) => pad.top + innerH - ((value - axis.min) / (axis.max - axis.min)) * innerH;
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
          return <rect key={labels[index]} className="chart-result__bar" x={xPos} y={y} width={barW} height={pad.top + innerH - y} rx="3" />;
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
