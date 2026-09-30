import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { Modal } from "../../components/ui/Modal";
import { usePrototype } from "../../app/PrototypeContext";
import { TemplateManagerDialog } from "../../components/ppt/PptAssistantDialog";
import { MenuIcon } from "../../components/ui/MenuIcon";

const slideTitles = ["封面", "核心结论", "市场规模", "区域表现", "重点项目", "总结"];

type EditorToolName = "pointer" | "layout" | "text" | "chart" | "table" | "image" | "shapes" | "palette" | "hand" | "undo" | "redo";

const editorTools: Array<{ name: EditorToolName; label: string }> = [
  { name: "pointer", label: "选择" },
  { name: "layout", label: "版式" },
  { name: "text", label: "文本" },
  { name: "chart", label: "图表" },
  { name: "table", label: "表格" },
  { name: "image", label: "图片" },
  { name: "shapes", label: "形状" },
  { name: "palette", label: "主题" },
  { name: "hand", label: "演示" },
  { name: "undo", label: "撤销" },
  { name: "redo", label: "重做" },
];

const lucidePaths: Record<string, string> = {
  "mouse-pointer-2": '<path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"/>',
  "layout-template": '<rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/>',
  type: '<path d="M12 4v16"/><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2"/><path d="M9 20h6"/>',
  "chart-column": '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  "table-2": '<path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  shapes: '<path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z"/><rect x="3" y="14" width="7" height="7" rx="1"/><circle cx="17.5" cy="17.5" r="3.5"/>',
  palette: '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>',
  hand: '<path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
  "undo-2": '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5 5.5 5.5 0 0 1-5.5 5.5H11"/>',
  "redo-2": '<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5 5.5 5.5 0 0 0 9.5 20H13"/>',
  "folder-open": '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  "arrow-left": '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  minus: '<path d="M5 12h14"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
};

const toolIcons: Record<EditorToolName, string> = {
  pointer: "mouse-pointer-2",
  layout: "layout-template",
  text: "type",
  chart: "chart-column",
  table: "table-2",
  image: "image",
  shapes: "shapes",
  palette: "palette",
  hand: "hand",
  undo: "undo-2",
  redo: "redo-2",
};

function LucideIcon({ name, size }: { name: string; size: number }) {
  return <svg className="lucide-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: lucidePaths[name] }} />;
}

function MarketScaleSlide() {
  return <div className="market-slide">
    <h2>市场规模与增长趋势</h2>
    <p className="market-slide__subtitle">产业园 REITs · 2023—2026E</p>
    <span className="market-slide__rule" />
    <span className="market-slide__metric-one-label">规模持续扩张</span>
    <strong className="market-slide__metric-one">31.4</strong>
    <span className="market-slide__metric-one-unit">亿元</span>
    <span className="market-slide__metric-two-label">出租率稳步提升</span>
    <strong className="market-slide__metric-two">93.8%</strong>
    <span className="market-slide__metric-two-note">较 2023 年提升 4.6 个百分点</span>
    <span className="market-slide__chart-title">规模与出租率趋势</span>
    <span className="market-slide__bar market-slide__bar--1" /><span className="market-slide__bar market-slide__bar--2" /><span className="market-slide__bar market-slide__bar--3" /><span className="market-slide__bar market-slide__bar--4" />
    <svg className="market-slide__trend" viewBox="0 0 260 120" aria-hidden="true"><path d="M14 100l74-26 74-24 74-32" /></svg>
    <span className="market-slide__dot market-slide__dot--1" /><span className="market-slide__dot market-slide__dot--2" /><span className="market-slide__dot market-slide__dot--3" /><span className="market-slide__dot market-slide__dot--4" />
    <span className="market-slide__axis" />
    <span className="market-slide__year market-slide__year--1">2023</span><span className="market-slide__year market-slide__year--2">2024</span><span className="market-slide__year market-slide__year--3">2025</span><span className="market-slide__year market-slide__year--4">2026E</span>
    <span className="market-slide__source">来源：ChopChat Research · 2026E 为预测值</span>
    <span className="market-slide__brand">ChopChat</span>
  </div>;
}

export function PptEditorPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, customTemplates, notify, setSidebarCollapsed } = usePrototype();
  const project = projects.find((item) => item.id === projectId) ?? projects[0];
  const [activeSlide, setActiveSlide] = useState(2);
  const [leftTab, setLeftTab] = useState<"pages" | "design" | "draft">("pages");
  const [pageView, setPageView] = useState<"thumbnail" | "outline">("thumbnail");
  const [actionsOpen, setActionsOpen] = useState(false);
  const [parseOpen, setParseOpen] = useState(project?.status === "解析中");
  const [exportOpen, setExportOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState("已保存 14:32");
  const [templatesOpen, setTemplatesOpen] = useState(false);

  useEffect(() => {
    setSidebarCollapsed(true);
    return () => setSidebarCollapsed(false);
  }, [setSidebarCollapsed]);

  useEffect(() => {
    if (!actionsOpen) return;
    const closeMenu = (event: PointerEvent) => {
      if (!(event.target as Element).closest(".editor-file-menu-anchor")) setActionsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setActionsOpen(false); };
    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [actionsOpen]);

  const exitEditor = () => {
    setSidebarCollapsed(false);
    navigate("/ppt");
  };

  const save = () => {
    setSaved("保存中……");
    window.setTimeout(() => { setSaved("已保存 刚刚"); notify("PPT 已保存", "success"); }, 700);
  };

  const runDataAction = (action: "parse" | "refresh" | "report") => {
    setActionsOpen(false);
    if (action === "parse") setParseOpen(true);
    if (action === "refresh") notify("正在刷新已识别的数据内容");
    if (action === "report") notify("正在更新 PPT 所依据的报告数据");
  };

  const chooseInsertTool = (tool: string) => notify(`已选择“${tool}”工具`);

  return (
    <AppShell fullBleed>
      <section className="ppt-editor">
        <header className="ppt-editor__topbar">
          <div className="ppt-editor__identity">
            <button className="button editor-exit-button" onClick={exitEditor}>
              <LucideIcon name="arrow-left" size={16} />
              <span>退出编辑</span>
            </button>
            <span className="editor-identity-divider" aria-hidden="true" />
            <strong className="editor-project-name">{project?.name ?? "PPT 项目"}</strong>
            <span className={saved.startsWith("保存中") ? "editor-save-state editor-save-state--saving" : "editor-save-state"}><i aria-hidden="true" /><span>{saved}</span></span>
          </div>
          <div className="ppt-editor__top-actions">
            <div className="popover-anchor editor-file-menu-anchor">
              <button className="button editor-file-trigger" aria-haspopup="menu" aria-expanded={actionsOpen} onClick={() => setActionsOpen((value) => !value)}>
                <LucideIcon name="folder-open" size={15} />
                <span>文件与数据</span>
                <LucideIcon name="chevron-down" size={13} />
              </button>
              {actionsOpen && <div className="menu-popover editor-action-popover" role="group" aria-label="文件与数据操作">
                <button onClick={() => runDataAction("parse")}><MenuIcon name="upload" /><span><strong>上传并智能解析</strong><small>识别现有 PPT 的结构、版式与数据</small></span></button>
                <button onClick={() => runDataAction("refresh")}><MenuIcon name="refresh-cw" /><span><strong>刷新数据</strong><small>更新已识别的图表、表格和文字</small></span></button>
                <button onClick={() => runDataAction("report")}><MenuIcon name="file-text" /><span><strong>更新报告</strong><small>重新获取制作 PPT 所依据的报告</small></span></button>
              </div>}
            </div>
            <button className="button" onClick={save}>{saved.startsWith("保存中") ? "保存中……" : "保存"}</button>
            <button className="button button--primary" onClick={() => setExportOpen(true)}>预览并生成</button>
          </div>
        </header>

        <div className="ppt-editor__workspace">
          <aside className="ppt-left-panel" aria-label="PPT 编辑功能">
            <div className="ppt-left-mode-tabs">
              <div className="ppt-left-mode-tabs__group" role="tablist" aria-label="编辑功能">
                <button type="button" role="tab" aria-selected={leftTab === "pages"} className={leftTab === "pages" ? "active" : ""} onClick={() => setLeftTab("pages")}>页面</button>
                <button type="button" role="tab" aria-selected={leftTab === "design"} className={leftTab === "design" ? "active" : ""} onClick={() => setLeftTab("design")}>视觉样式</button>
                <button type="button" role="tab" aria-selected={leftTab === "draft"} className={leftTab === "draft" ? "active" : ""} onClick={() => setLeftTab("draft")}>大纲草稿</button>
              </div>
              <button type="button" className="ppt-add-icon" aria-label="新增页面" onClick={() => notify("已新增一页空白幻灯片", "success")}><LucideIcon name="plus" size={14} /></button>
            </div>
            {leftTab === "pages" && <div className="ppt-left-panel__content">
                <div className="tab-row ppt-page-view-tabs">
                  <button className={pageView === "thumbnail" ? "tab tab--active" : "tab"} onClick={() => setPageView("thumbnail")}>缩略图</button>
                  <button className={pageView === "outline" ? "tab tab--active" : "tab"} onClick={() => setPageView("outline")}>大纲</button>
                </div>
                {pageView === "thumbnail" && slideTitles.map((title, index) => <button key={title} className={activeSlide === index ? "slide-thumb slide-thumb--active" : "slide-thumb"} onClick={() => setActiveSlide(index)}><span className="slide-thumb__meta"><small>{String(index + 1).padStart(2, "0")}</small><strong>{title}</strong></span><span className="slide-thumb__preview" aria-hidden="true" /></button>)}
                {pageView === "outline" && <div className="ppt-outline-list">{slideTitles.map((title, index) => <button key={title} className={activeSlide === index ? "ppt-outline-item ppt-outline-item--active" : "ppt-outline-item"} onClick={() => setActiveSlide(index)}><span>{index + 1}</span><strong>{title}</strong></button>)}</div>}
                <button className="button button--block ppt-add-page" onClick={() => notify("已新增一页空白幻灯片", "success")}>+ 添加页面</button>
              </div>}
            {leftTab === "design" && <div className="tool-panel ppt-side-panel"><div><h2>视觉样式</h2><p className="muted">调整当前项目的模板与整体风格。</p></div><label>当前模板<select><option>系统模板 A</option>{customTemplates.map((item) => <option key={item}>{item}</option>)}</select></label><div className="style-preview-grid"><button className="style-preview style-preview--active">经典</button><button className="style-preview">简约</button><button className="style-preview">深色</button><button className="style-preview">杂志</button></div><button className="button button--block" onClick={() => setTemplatesOpen(true)}>管理模板</button></div>}
            {leftTab === "draft" && <div className="tool-panel ppt-side-panel"><div><h2>大纲草稿</h2><p className="muted">保存当前结构，或载入已有草稿继续编辑。</p></div><button className="button button--primary button--block" onClick={() => notify("当前大纲已保存", "success")}>保存当前大纲</button><article className="mini-card"><strong>行业报告草稿</strong><span>6 页 · 更新于昨天</span></article></div>}
          </aside>

          <main className="slide-canvas-wrap">
            <div className="canvas-toolbar"><strong>第 {activeSlide + 1} 页 · {slideTitles[activeSlide]}</strong><div className="canvas-zoom-controls"><button aria-label="缩小画布"><LucideIcon name="minus" size={14} /></button><span>82%</span><button aria-label="放大画布"><LucideIcon name="plus" size={14} /></button><button>适应</button></div></div>
            <div className="slide-work-area">
              <aside className="canvas-floating-tools" aria-label="画布编辑工具">
                <div className="canvas-tool-pill">
                  {editorTools.map((tool, index) => <button key={tool.name} className={index === 0 ? "canvas-tool canvas-tool--active" : tool.name === "undo" || tool.name === "redo" ? "canvas-tool canvas-tool--muted" : "canvas-tool"} title={tool.label} aria-label={`${tool.label}工具`} onClick={() => chooseInsertTool(tool.label)}><LucideIcon name={toolIcons[tool.name]} size={17} /></button>)}
                </div>
              </aside>
              <div className="slide-canvas-stage">
                <div className="slide-canvas">{activeSlide === 2 ? <MarketScaleSlide /> : <div className="slide-canvas__placeholder"><small>第 {activeSlide + 1} 页</small><h1>{slideTitles[activeSlide]}</h1><p>聚焦核心经营数据与市场趋势，为投资判断提供结构化依据。</p></div>}</div>
              </div>
            </div>
          </main>

          <aside className="ppt-agent" aria-label="AI 助手">
            <header className="ppt-agent-tabs"><h2>AI 助手</h2></header>
            <div className="ppt-agent-main"><textarea rows={4} placeholder="描述你想如何修改当前页…" /><div className="editor-quick-actions"><button>优化排版</button><button>改写文案</button><button>生成图表</button><button>提取结论</button></div><article className="agent-suggestion"><strong>AI 建议</strong><p>建议突出 2025 年出租率改善，并将规模增长作为主视觉。</p></article><button className="button button--primary button--block agent-generate" onClick={() => notify("已生成当前页修改", "success")}>生成修改</button></div>
          </aside>
        </div>
        <footer className="ppt-editor__status"><span>第 {activeSlide + 1} / {slideTitles.length} 页</span><span>自动保存已开启</span><span className="ppt-editor__shortcuts">⌘ Z 撤销   ⌘ ⇧ Z 重做</span><span>82%</span></footer>
      </section>

      {parseOpen && <Modal title="上传 PPT 智能解析" onClose={() => setParseOpen(false)} footer={<button className="button" onClick={() => setParseOpen(false)}>后台继续解析</button>}><div className="progress-list"><p><strong>文件：</strong>行业报告模板.pptx</p><p>✓ 上传文件</p><p>✓ 解析提纲结构</p><p>◉ 识别版式与视觉风格 <strong>68%</strong></p><progress value="68" max="100" /><p>○ 识别可更新文字、图表和表格</p><small>当前识别：18 页 / 6 个图表 / 3 个表格 / 12 张图片</small></div></Modal>}
      {exportOpen && <Modal title="预览并生成 PPT" size="lg" onClose={() => setExportOpen(false)} footer={<><button className="button" onClick={() => setExportOpen(false)}>返回编辑</button><button className="button button--primary" disabled={generating} onClick={() => { setGenerating(true); window.setTimeout(() => { setGenerating(false); notify("PPT 已生成，可下载", "success"); }, 1200); }}>{generating ? "生成中……" : "继续生成 PPT"}</button></>}><div className="export-review"><div className="preview-slide"><h2>{project?.name}</h2><p>当前 PPT 预览</p></div><div><h3>导出前检查</h3><p>✓ 页数：18</p><p>✓ 图表：6</p><p>✓ 表格：3</p><p>! 图片：12，其中 1 张清晰度低</p><button className="text-button">定位第 9 页</button></div></div></Modal>}
      {templatesOpen && <TemplateManagerDialog onClose={() => setTemplatesOpen(false)} />}
    </AppShell>
  );
}
