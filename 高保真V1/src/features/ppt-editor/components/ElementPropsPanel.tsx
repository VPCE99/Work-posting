import {
  addChartColumn,
  createChartRow,
  MAX_CHART_ROWS,
  MAX_CHART_SERIES,
  normalizeChartHeaders,
  seriesValuesOf,
  setChartCell,
  setChartHeaderAt,
} from "../../../components/chart/chartData";
import { FormSelect } from "../../../components/ui/FormSelect";
import { LucideIcon } from "../icons/LucideIcon";
import {
  chartTypeOptions,
  defaultChartRows,
  type ChartRow,
  type PropsSectionKey,
  type SlideElement,
} from "../model";
import { ChartMiniPreview } from "./ChartMiniPreview";

export function ElementPropsPanel({
  element,
  sections,
  aiPrompt,
  dataEditing,
  onToggleSection,
  onChange,
  onAiPromptChange,
  onGenerate,
  onToggleDataEditing,
  onPatchChartRow,
  onClose,
}: {
  element: SlideElement;
  sections: Record<PropsSectionKey, boolean>;
  aiPrompt: string;
  dataEditing: boolean;
  onToggleSection: (key: PropsSectionKey) => void;
  onChange: (patch: Partial<SlideElement>) => void;
  onAiPromptChange: (value: string) => void;
  onGenerate: () => void;
  onToggleDataEditing: () => void;
  onPatchChartRow: (index: number, key: keyof ChartRow, value: string) => void;
  onClose: () => void;
}) {
  const isChart = element.kind === "chart";
  const chartType = element.chartType ?? "line";
  const headers = normalizeChartHeaders(element.chartHeaders);
  const rows = element.chartRows ?? defaultChartRows;
  const seriesLabels = headers.slice(1);
  const canAddRow = rows.length < MAX_CHART_ROWS;
  const canAddColumn = seriesLabels.length < MAX_CHART_SERIES;

  const addRow = () => {
    if (!canAddRow) return;
    onChange({ chartHeaders: headers, chartRows: [...rows, createChartRow(rows, headers)] });
  };

  const addColumn = () => {
    const next = addChartColumn(headers, rows);
    if (!next) return;
    onChange({ chartHeaders: next.headers, chartRows: next.rows });
  };

  return (
    <aside className="ppt-element-props" aria-label={`元素属性 ${element.label}`}>
      <header className="ppt-element-props__header">
        <h2>元素属性 · {element.label}</h2>
        <button type="button" className="icon-button" aria-label="关闭元素属性" onClick={onClose}>×</button>
      </header>
      <div className="ppt-element-props__body">
        <section className="ppt-props-section">
          <button type="button" className="ppt-props-section__toggle" aria-expanded={sections.layout} onClick={() => onToggleSection("layout")}>
            <span>布局{element.aiGenerated ? <i className="ppt-props-ai-badge">AI 生成</i> : null}</span>
            <LucideIcon name="chevron-down" size={14} />
          </button>
          {sections.layout && (
            <div className="ppt-props-section__content ppt-props-layout-grid">
              {([
                ["x", "X", element.x],
                ["y", "Y", element.y],
                ["w", "W", element.w],
                ["h", "H", element.h],
              ] as const).map(([key, label, value]) => (
                <label key={key} className="ppt-props-field">
                  <span>{label}</span>
                  <input
                    type="number"
                    value={value}
                    onChange={(event) => onChange({ [key]: Number(event.target.value) || 0 })}
                  />
                </label>
              ))}
            </div>
          )}
        </section>

        <section className="ppt-props-section">
          <button type="button" className="ppt-props-section__toggle" aria-expanded={sections.ai} onClick={() => onToggleSection("ai")}>
            <span>AI 生成</span>
            <LucideIcon name="chevron-down" size={14} />
          </button>
          {sections.ai && (
            <div className="ppt-props-section__content ppt-props-ai">
              <textarea
                rows={3}
                placeholder={isChart ? "例如：用双折线对比平均与时点出租率…" : "例如：总结消费 REIT 最新出租率变化趋势…"}
                value={aiPrompt}
                onChange={(event) => onAiPromptChange(event.target.value)}
              />
              <div className="ppt-props-ai__actions">
                <button type="button" className="button button--primary button--block" onClick={onGenerate}>{isChart ? "生成图表" : "生成内容"}</button>
                <button type="button" className="ppt-props-ai__refresh" aria-label="重新生成" onClick={onGenerate}>
                  <LucideIcon name="refresh-cw" size={15} />
                </button>
              </div>
            </div>
          )}
        </section>

        {isChart ? (
          <>
            <section className="ppt-props-section">
              <button type="button" className="ppt-props-section__toggle" aria-expanded={sections.preview} onClick={() => onToggleSection("preview")}>
                <span>图表预览</span>
                <LucideIcon name="chevron-down" size={14} />
              </button>
              {sections.preview && (
                <div className="ppt-props-section__content">
                  <div className="ppt-props-chart-preview" data-chart-type={chartType}>
                    <ChartMiniPreview chartType={chartType} rows={rows} />
                  </div>
                  <div className="ppt-props-field">
                    <span>图表类型</span>
                    <div className="ppt-props-chart-types" role="group" aria-label="图表类型">
                      {chartTypeOptions.map((option) => (
                        <button
                          key={option.type}
                          type="button"
                          className={chartType === option.type ? "is-active" : ""}
                          aria-label={option.label}
                          aria-pressed={chartType === option.type}
                          title={option.label}
                          onClick={() => onChange({ chartType: option.type })}
                        >
                          <LucideIcon name={option.icon} size={15} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="ppt-props-field">
                    <span>图表名称</span>
                    <input
                      value={element.content}
                      placeholder="例如：增长趋势"
                      onChange={(event) => onChange({ content: event.target.value })}
                    />
                  </label>
                  <div className="ppt-props-legend-fields">
                    {seriesLabels.map((label, index) => (
                      <label className="ppt-props-field" key={`legend-${index}`}>
                        <span>图例 {index + 1}</span>
                        <input
                          value={label}
                          onChange={(event) => onChange({ chartHeaders: setChartHeaderAt(headers, index + 1, event.target.value) })}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="ppt-props-section">
              <div className="ppt-props-section__head">
                <button type="button" className="ppt-props-section__toggle" aria-expanded={sections.data} onClick={() => onToggleSection("data")}>
                  <span>数据</span>
                  <LucideIcon name="chevron-down" size={14} />
                </button>
                <button type="button" className="ppt-props-data-edit" onClick={onToggleDataEditing}>
                  {dataEditing ? "完成" : "编辑"}
                </button>
              </div>
              {sections.data && (
                <div className="ppt-props-section__content">
                  <div
                    className="ppt-props-data-table"
                    role="table"
                    aria-label="图表数据"
                    style={{ ["--ppt-data-cols" as string]: String(headers.length) }}
                  >
                    <div className="ppt-props-data-table__row ppt-props-data-table__head" role="row">
                      {headers.map((header, headerIndex) => (
                        dataEditing ? (
                          <input
                            key={`header-${headerIndex}`}
                            role="columnheader"
                            value={header}
                            aria-label={`列标题 ${headerIndex + 1}`}
                            onChange={(event) => onChange({ chartHeaders: setChartHeaderAt(headers, headerIndex, event.target.value) })}
                          />
                        ) : (
                          <span role="columnheader" key={`header-${headerIndex}`}>{header}</span>
                        )
                      ))}
                    </div>
                    {rows.map((row, index) => {
                      const values = [row.category, ...seriesValuesOf(row)];
                      while (values.length < headers.length) values.push("0");
                      return (
                        <div className="ppt-props-data-table__row" role="row" key={`${row.category}-${index}`}>
                          {headers.map((header, columnIndex) => (
                            dataEditing ? (
                              <input
                                key={`${index}-${columnIndex}`}
                                role="cell"
                                value={values[columnIndex] ?? ""}
                                onChange={(event) => {
                                  if (columnIndex === 0) {
                                    onPatchChartRow(index, "category", event.target.value);
                                    return;
                                  }
                                  if (columnIndex === 1) {
                                    onPatchChartRow(index, "avg", event.target.value);
                                    return;
                                  }
                                  if (columnIndex === 2) {
                                    onPatchChartRow(index, "spot", event.target.value);
                                    return;
                                  }
                                  onChange({ chartRows: setChartCell(rows, index, columnIndex, event.target.value) });
                                }}
                                aria-label={`${header} · 第 ${index + 1} 行`}
                              />
                            ) : (
                              <span role="cell" key={`${index}-${columnIndex}`}>{values[columnIndex] ?? ""}</span>
                            )
                          ))}
                        </div>
                      );
                    })}
                  </div>
                  {dataEditing && (
                    <div className="ppt-props-data-actions">
                      <button type="button" className="ppt-props-data-action" disabled={!canAddRow} onClick={addRow}>
                        加行
                      </button>
                      <button type="button" className="ppt-props-data-action" disabled={!canAddColumn} onClick={addColumn}>
                        加列
                      </button>
                      <small>
                        {rows.length}/{MAX_CHART_ROWS} 行 · {seriesLabels.length}/{MAX_CHART_SERIES} 系列
                      </small>
                    </div>
                  )}
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            <section className="ppt-props-section">
              <button type="button" className="ppt-props-section__toggle" aria-expanded={sections.content} onClick={() => onToggleSection("content")}>
                <span>内容</span>
                <LucideIcon name="chevron-down" size={14} />
              </button>
              {sections.content && (
                <div className="ppt-props-section__content">
                  <textarea
                    rows={4}
                    value={element.content}
                    onChange={(event) => onChange({ content: event.target.value })}
                  />
                </div>
              )}
            </section>

            <section className="ppt-props-section">
              <button type="button" className="ppt-props-section__toggle" aria-expanded={sections.style} onClick={() => onToggleSection("style")}>
                <span>样式</span>
                <LucideIcon name="chevron-down" size={14} />
              </button>
              {sections.style && (
                <div className="ppt-props-section__content ppt-props-style">
                  <div className="ppt-props-style__row">
                    <label className="ppt-props-field">
                      <span>字号</span>
                      <FormSelect label="字号" options={["12", "14", "16", "18", "22", "28"]} value={element.fontSize} onChange={(value) => onChange({ fontSize: value })} />
                    </label>
                    <label className="ppt-props-field">
                      <span>行高</span>
                      <FormSelect label="行高" options={["1.2", "1.4", "1.5", "1.6", "1.8"]} value={element.lineHeight} onChange={(value) => onChange({ lineHeight: value })} />
                    </label>
                  </div>
                  <div className="ppt-props-style__row">
                    <label className="ppt-props-field">
                      <span>文字色</span>
                      <span className="ppt-props-swatch">
                        <input type="color" value={element.textColor} onChange={(event) => onChange({ textColor: event.target.value })} aria-label="文字色" />
                      </span>
                    </label>
                    <label className="ppt-props-field">
                      <span>背景色</span>
                      <button
                        type="button"
                        className={element.bgTransparent ? "ppt-props-swatch ppt-props-swatch--none" : "ppt-props-swatch"}
                        aria-label="切换背景色"
                        onClick={() => onChange({ bgTransparent: !element.bgTransparent })}
                      >
                        {element.bgTransparent ? "×" : null}
                      </button>
                    </label>
                  </div>
                  <div className="ppt-props-field">
                    <span>格式</span>
                    <div className="ppt-props-format" role="group" aria-label="文字格式">
                      <button type="button" className={element.bold ? "is-active" : ""} aria-pressed={element.bold} onClick={() => onChange({ bold: !element.bold })}><b>B</b></button>
                      <button type="button" className={element.italic ? "is-active" : ""} aria-pressed={element.italic} onClick={() => onChange({ italic: !element.italic })}><i>I</i></button>
                      <button type="button" className={element.underline ? "is-active" : ""} aria-pressed={element.underline} onClick={() => onChange({ underline: !element.underline })}><u>U</u></button>
                      <span className="ppt-props-format__divider" />
                      {([
                        ["left", "左对齐"],
                        ["center", "居中"],
                        ["right", "右对齐"],
                      ] as const).map(([align, label]) => (
                        <button
                          key={align}
                          type="button"
                          className={element.align === align ? "is-active" : ""}
                          aria-label={label}
                          aria-pressed={element.align === align}
                          onClick={() => onChange({ align })}
                        >
                          <LucideIcon name={align === "left" ? "align-left" : align === "center" ? "align-center" : "align-right"} size={14} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </aside>
  );
}

