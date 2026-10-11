import { useState, type DragEvent } from "react";
import { usePrototype } from "../../app/PrototypeContext";
import { Modal } from "../ui/Modal";
import { useDismissibleLayer } from "../ui/useDismissibleLayer";
import { useEscapeKey } from "../ui/useEscapeKey";
import { ChartResult } from "./ChartResult";
import { datasets, emptySlots, fieldById, type Dataset, type Slot } from "./chartDatasets";
import { DropSlot } from "./DropSlot";
import { FieldGroup } from "./FieldGroup";

export function ChartDialog() {
  const { notify, setActiveDialog } = usePrototype();
  const [openDatasets, setOpenDatasets] = useState<string[]>(datasets.map((dataset) => dataset.id));
  const [title, setTitle] = useState("");
  const [slots, setSlots] = useState(emptySlots);
  const [over, setOver] = useState<Slot | null>(null);
  const [generated, setGenerated] = useState(false);
  const [fieldMenuId, setFieldMenuId] = useState<string | null>(null);

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
    setFieldMenuId(null);
    setGenerated(false);
  };

  useDismissibleLayer(Boolean(fieldMenuId), () => setFieldMenuId(null), [], { withinSelector: ".chart-chip-wrap" });
  useEscapeKey(Boolean(fieldMenuId), () => setFieldMenuId(null), { stopPropagation: true, capture: true });

  const onDrop = (slot: Slot) => (event: DragEvent) => {
    event.preventDefault();
    setOver(null);
    assign(slot, event.dataTransfer.getData("text/plain"));
  };

  const clearSlot = (slot: Slot) => {
    setSlots((current) => ({ ...current, [slot]: null }));
    setGenerated(false);
  };

  const datasetOf = (fieldId: string): Dataset => {
    const matched = datasets.find((dataset) => dataset.fields.some((field) => field.id === fieldId));
    if (matched) return matched;
    const fallback = datasets[0];
    if (!fallback) throw new Error("Chart datasets are empty");
    return fallback;
  };

  return (
    <Modal
      title="自定义作图"
      size="xl"
      variant="chart"
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
                    <FieldGroup
                      label="维度"
                      fields={dimensions}
                      menuId={fieldMenuId}
                      onToggleMenu={setFieldMenuId}
                      onAssign={assign}
                    />
                    <FieldGroup
                      label="度量"
                      fields={measures}
                      menuId={fieldMenuId}
                      onToggleMenu={setFieldMenuId}
                      onAssign={assign}
                    />
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
              <p>拖拽或点击左侧字段到右侧配置区</p>
            </div>
          )}
        </main>

        <aside className="chart-config">
          <label className="chart-config__title">图表标题<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="输入图表标题..." /></label>
          <DropSlot slot="x" label="X 轴" hint="拖入或添加 1 个维度" field={xField} active={over === "x"} onDrop={onDrop("x")} onOver={() => setOver("x")} onLeave={() => setOver(null)} onClear={() => clearSlot("x")} />
          <DropSlot slot="yLeft" label="Y 轴 · 左" hint="拖入或添加 1 个度量" field={leftField} active={over === "yLeft"} onDrop={onDrop("yLeft")} onOver={() => setOver("yLeft")} onLeave={() => setOver(null)} onClear={() => clearSlot("yLeft")} />
          <DropSlot slot="yRight" label="Y 轴 · 右" hint="可选，独立刻度" field={rightField} active={over === "yRight"} onDrop={onDrop("yRight")} onOver={() => setOver("yRight")} onLeave={() => setOver(null)} onClear={() => clearSlot("yRight")} />
        </aside>
      </div>
    </Modal>
  );
}
