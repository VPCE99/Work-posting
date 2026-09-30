import { useState } from "react";
import { usePrototype } from "../../app/PrototypeContext";
import { FormSelect } from "../ui/FormSelect";
import { Modal } from "../ui/Modal";

type Field = { name: string; type: "维度" | "数值" | "日期" };

const baseFields: Field[] = [
  { name: "年份", type: "日期" },
  { name: "市场规模", type: "数值" },
  { name: "同比增长率", type: "维度" },
  { name: "地区", type: "维度" },
];

export function ChartDialog() {
  const { notify, setActiveDialog } = usePrototype();
  const [fields, setFields] = useState(baseFields);
  const [title, setTitle] = useState("市场规模与增长率");
  const [xAxis, setXAxis] = useState("年份");
  const [leftY, setLeftY] = useState("市场规模");
  const [rightY, setRightY] = useState("");
  const [group, setGroup] = useState("地区");
  const [generated, setGenerated] = useState(false);

  const close = () => setActiveDialog(null);
  const changeType = (name: string, type: Field["type"]) => {
    setFields((items) => items.map((item) => item.name === name ? { ...item, type } : item));
  };
  const numeric = fields.filter((item) => item.type === "数值");
  const dimensions = fields.filter((item) => item.type !== "数值");

  return (
    <Modal title="自定义作图" size="xl" onClose={close} footer={<button className="button" onClick={close}>关闭</button>}>
      <div className="chart-dialog-meta">数据来自：当前对话 · 行业研究报告</div>
      <div className="chart-dialog">
        <div className="chart-workspace">
          <aside className="data-panel">
            <h2>数据集与字段</h2>
            <label>数据集<FormSelect label="数据集" options={["回答 #3 · 行业规模数据"]} /></label>
            <small>来源：当前对话回答 #3</small>
            <div className="field-list">
              {fields.map((field) => (
                <article key={field.name}>
                  <div>
                    <strong>{field.type === "数值" ? "#" : field.type === "日期" ? "◷" : "Aa"} {field.name}</strong>
                    <FormSelect label={`${field.name}字段类型`} value={field.type} onChange={(next) => changeType(field.name, next as Field["type"])} options={["维度", "数值", "日期"]} />
                  </div>
                  {field.name === "同比增长率" && field.type === "维度" && <small className="field-error">建议改为数值后放入 Y 轴</small>}
                </article>
              ))}
            </div>
            <button className="button button--block">预览数据</button>
          </aside>

          <main className="chart-preview">
            <div className="tab-row"><button className="tab tab--active">图表预览</button><button className="tab">数据预览</button></div>
            <div className="chart-stage">
              <h2>{title || "未命名图表"}</h2>
              {generated ? (
                <div className="combo-chart">
                  <div className="combo-chart__bars">{[44, 62, 78, 91].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div>
                  {rightY && <svg viewBox="0 0 400 180" preserveAspectRatio="none" aria-label="增长率折线"><polyline points="0,150 130,108 260,78 400,28" fill="none" stroke="currentColor" strokeWidth="4" /></svg>}
                  <div className="combo-chart__labels"><span>2023</span><span>2024</span><span>2025</span><span>2026E</span></div>
                </div>
              ) : <div className="chart-placeholder">配置完成后点击“生成图表”</div>}
            </div>
            {rightY && <p className="notice">双 Y 轴使用独立刻度，请避免误导性比较。</p>}
          </main>

          <aside className="config-panel">
            <h2>图表配置</h2>
            <label>标题<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
            <label>图形类型<FormSelect label="图形类型" options={["柱状图", "折线图", "组合图"]} /></label>
            <label>X 轴<FormSelect label="X 轴" value={xAxis} onChange={setXAxis} options={dimensions.map((field) => field.name)} /></label>
            <label>左 Y 轴<FormSelect label="左 Y 轴" value={leftY} onChange={setLeftY} options={[{ value: "", label: "请选择" }, ...numeric.map((field) => field.name)]} /></label>
            <label>右 Y 轴（选填）<FormSelect label="右 Y 轴" value={rightY} onChange={setRightY} options={[{ value: "", label: "不使用" }, ...numeric.filter((field) => field.name !== leftY).map((field) => field.name)]} /></label>
            <label>分组（选填）<FormSelect label="分组" value={group} onChange={setGroup} options={[{ value: "", label: "不分组" }, ...dimensions.map((field) => field.name)]} /></label>
            <div className="button-row"><button className="button" onClick={() => { setTitle(""); setRightY(""); setGenerated(false); }}>重置</button><button className="button button--primary" disabled={!xAxis || !leftY} onClick={() => setGenerated(true)}>生成图表</button></div>
            <hr />
            <button className="button button--block" disabled={!generated} onClick={() => notify("已创建数据下载任务", "success")}>下载数据</button>
            <button className="button button--block" disabled={!generated} onClick={() => notify("已创建图片下载任务", "success")}>下载图片</button>
          </aside>
        </div>
      </div>
    </Modal>
  );
}
