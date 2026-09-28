import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { Modal } from "../../components/ui/Modal";
import { usePrototype } from "../../app/PrototypeContext";
import { TemplateManagerDialog } from "../../components/ppt/PptAssistantDialog";

const slideTitles = ["封面", "核心结论", "市场规模", "竞争格局", "财务分析", "风险与建议"];

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
            <button className="button" onClick={exitEditor}>← 退出编辑</button>
            <strong>{project?.name ?? "PPT 项目"}</strong>
            <span className="muted">{saved}</span>
          </div>
          <div className="ppt-editor__top-actions">
            <div className="popover-anchor">
              <button className="button" aria-haspopup="menu" aria-expanded={actionsOpen} onClick={() => setActionsOpen((value) => !value)}>文件与数据⌄</button>
              {actionsOpen && <div className="menu-popover editor-action-popover" role="group" aria-label="文件与数据操作">
                <button onClick={() => runDataAction("parse")}><strong>上传并智能解析</strong><small>识别现有 PPT 的结构、版式与数据</small></button>
                <button onClick={() => runDataAction("refresh")}><strong>刷新数据</strong><small>更新已识别的图表、表格和文字</small></button>
                <button onClick={() => runDataAction("report")}><strong>更新报告</strong><small>重新获取制作 PPT 所依据的报告</small></button>
              </div>}
            </div>
            <button className="button" onClick={save}>{saved.startsWith("保存中") ? "保存中……" : "保存"}</button>
            <button className="button button--primary" onClick={() => setExportOpen(true)}>预览与生成</button>
          </div>
        </header>

        <div className="ppt-editor__workspace">
          <aside className="ppt-left-panel" aria-label="PPT 编辑功能">
            <div className="ppt-left-tabs" role="tablist" aria-label="编辑功能分类">
              <button role="tab" aria-selected={leftTab === "pages"} className={leftTab === "pages" ? "ppt-left-tab ppt-left-tab--active" : "ppt-left-tab"} onClick={() => setLeftTab("pages")}>页面</button>
              <button role="tab" aria-selected={leftTab === "design"} className={leftTab === "design" ? "ppt-left-tab ppt-left-tab--active" : "ppt-left-tab"} onClick={() => setLeftTab("design")}>设计</button>
              <button role="tab" aria-selected={leftTab === "draft"} className={leftTab === "draft" ? "ppt-left-tab ppt-left-tab--active" : "ppt-left-tab"} onClick={() => setLeftTab("draft")}>草稿</button>
            </div>

            <div className="ppt-left-panel__content">
              {leftTab === "pages" && <>
                <div className="tab-row">
                  <button className={pageView === "thumbnail" ? "tab tab--active" : "tab"} onClick={() => setPageView("thumbnail")}>缩略图</button>
                  <button className={pageView === "outline" ? "tab tab--active" : "tab"} onClick={() => setPageView("outline")}>大纲</button>
                </div>
                {pageView === "thumbnail" && slideTitles.map((title, index) => <button key={title} className={activeSlide === index ? "slide-thumb slide-thumb--active" : "slide-thumb"} onClick={() => setActiveSlide(index)}><span>{index + 1}</span><div>{title}</div></button>)}
                {pageView === "outline" && <div className="ppt-outline-list">{slideTitles.map((title, index) => <button key={title} className={activeSlide === index ? "ppt-outline-item ppt-outline-item--active" : "ppt-outline-item"} onClick={() => setActiveSlide(index)}><span>{index + 1}</span><strong>{title}</strong></button>)}</div>}
                <button className="button button--block" onClick={() => notify("已新增一页空白幻灯片", "success")}>＋ 新增页面</button>
              </>}

              {leftTab === "design" && <div className="tool-panel">
                <div><h2>视觉样式</h2><p className="muted">调整当前项目的模板与整体风格。</p></div>
                <label>当前模板<select><option>系统模板 A</option>{customTemplates.map((item) => <option key={item}>{item}</option>)}</select></label>
                <div className="style-preview-grid"><button className="style-preview style-preview--active">经典</button><button className="style-preview">简约</button><button className="style-preview">深色</button><button className="style-preview">杂志</button></div>
                <button className="button button--block" onClick={() => setTemplatesOpen(true)}>管理模板</button>
                <small>自定义模板已上传 {customTemplates.length} / 上限 3</small>
              </div>}

              {leftTab === "draft" && <div className="tool-panel">
                <div><h2>大纲草稿</h2><p className="muted">保存当前结构，或载入已有草稿继续编辑。</p></div>
                <button className="button button--primary button--block" onClick={() => notify("当前大纲已保存", "success")}>保存当前大纲</button>
                <article className="mini-card"><strong>行业报告草稿</strong><span>6 页 · 更新于昨天</span><button className="text-button" onClick={() => notify("草稿已载入", "success")}>加载草稿</button></article>
              </div>}
            </div>
          </aside>

          <main className="slide-canvas-wrap">
            <div className="canvas-toolbar"><strong>第 {activeSlide + 1} 页 · {slideTitles[activeSlide]}</strong><div className="canvas-zoom-controls"><button className="button button--small" aria-label="缩小画布">−</button><span>90%</span><button className="button button--small" aria-label="放大画布">＋</button><button className="button button--small">适应窗口</button></div></div>
            <div className="slide-work-area">
              <aside className="canvas-floating-tools" aria-label="画布编辑工具">
                <button className="canvas-tool canvas-tool--standalone" title="切换页面面板" aria-label="切换页面面板" onClick={() => notify("已切换页面面板")}>◫</button>
                <div className="canvas-tool-pill">
                  <button className="canvas-tool canvas-tool--active" title="选择" aria-label="选择工具" onClick={() => chooseInsertTool("选择")}>↖</button>
                  <button className="canvas-tool" title="形状" aria-label="形状工具" onClick={() => chooseInsertTool("形状")}>□</button>
                  <button className="canvas-tool" title="绘制" aria-label="绘制工具" onClick={() => chooseInsertTool("绘制")}>⌁</button>
                  <button className="canvas-tool" title="文字" aria-label="文字工具" onClick={() => chooseInsertTool("文字")}>T</button>
                  <button className="canvas-tool" title="布局" aria-label="布局工具" onClick={() => chooseInsertTool("布局")}>▦</button>
                  <button className="canvas-tool" title="图片" aria-label="图片工具" onClick={() => chooseInsertTool("图片")}>▧</button>
                  <button className="canvas-tool" title="图表" aria-label="图表工具" onClick={() => chooseInsertTool("图表")}>▥</button>
                  <button className="canvas-tool" title="表格" aria-label="表格工具" onClick={() => chooseInsertTool("表格")}>▤</button>
                  <button className="canvas-tool" title="拖动画布" aria-label="拖动画布" onClick={() => chooseInsertTool("拖动画布")}>☝</button>
                  <span className="canvas-tool-divider" />
                  <button className="canvas-tool" title="撤销" aria-label="撤销" onClick={() => notify("已撤销上一步操作")}>↶</button>
                  <button className="canvas-tool" title="重做" aria-label="重做" onClick={() => notify("已重做上一步操作")}>↷</button>
                </div>
              </aside>
              <div className="slide-canvas-stage">
                <div className="slide-canvas"><small>第 {activeSlide + 1} 页</small><h1>{slideTitles[activeSlide]}</h1><p>这是低保真幻灯片画布，用于验证布局、工具入口与生成流程。</p>{activeSlide > 1 && <div className="mock-chart"><div style={{ height: "45%" }} /><div style={{ height: "72%" }} /><div style={{ height: "88%" }} /><div style={{ height: "64%" }} /></div>}</div>
              </div>
            </div>
          </main>

          <aside className="ppt-agent" aria-label="Agent">
            <header className="ppt-agent__header"><div><span className="eyebrow">AI COPILOT</span><h2>Agent</h2></div><button className="text-button" onClick={() => notify("Agent 对话已清空")}>清空</button></header>
            <div className="ppt-agent__messages">
              <article className="agent-message"><small>Agent</small><p>我可以根据当前页面与报告内容，生成页面、改写文案或插入图表。</p></article>
              <article className="agent-context"><strong>当前上下文</strong><span>第 {activeSlide + 1} 页 · {slideTitles[activeSlide]}</span><span>已关联当前报告</span></article>
            </div>
            <div className="ppt-agent__composer">
              <textarea rows={6} placeholder="描述需要生成或修改的 PPT 页面" />
              <div className="button-row"><button className="button button--small">引用报告</button><button className="button button--small">插入图表</button></div>
              <button className="button button--primary button--block" onClick={() => notify("Agent 页面生成任务已提交", "success")}>生成页面</button>
            </div>
          </aside>
        </div>
        <footer className="ppt-editor__status">第 {activeSlide + 1}/{slideTitles.length} 页 <span>图表 6</span><span>表格 3</span><span>图片 12</span><span>数据更新时间 14:20</span><span>自动保存：开启</span></footer>
      </section>

      {parseOpen && <Modal title="上传 PPT 智能解析" onClose={() => setParseOpen(false)} footer={<button className="button" onClick={() => setParseOpen(false)}>后台继续解析</button>}><div className="progress-list"><p><strong>文件：</strong>行业报告模板.pptx</p><p>✓ 上传文件</p><p>✓ 解析提纲结构</p><p>◉ 识别版式与视觉风格 <strong>68%</strong></p><progress value="68" max="100" /><p>○ 识别可更新文字、图表和表格</p><small>当前识别：18 页 / 6 个图表 / 3 个表格 / 12 张图片</small></div></Modal>}
      {exportOpen && <Modal title="预览并生成 PPT" size="lg" onClose={() => setExportOpen(false)} footer={<><button className="button" onClick={() => setExportOpen(false)}>返回编辑</button><button className="button button--primary" disabled={generating} onClick={() => { setGenerating(true); window.setTimeout(() => { setGenerating(false); notify("PPT 已生成，可下载", "success"); }, 1200); }}>{generating ? "生成中……" : "继续生成 PPT"}</button></>}><div className="export-review"><div className="preview-slide"><h2>{project?.name}</h2><p>当前 PPT 预览</p></div><div><h3>导出前检查</h3><p>✓ 页数：18</p><p>✓ 图表：6</p><p>✓ 表格：3</p><p>! 图片：12，其中 1 张清晰度低</p><button className="text-button">定位第 9 页</button></div></div></Modal>}
      {templatesOpen && <TemplateManagerDialog onClose={() => setTemplatesOpen(false)} />}
    </AppShell>
  );
}
