import { FormSelect } from "../../../components/ui/FormSelect";
import type { SlideMeta } from "../model";

export function SlideNavigator({
  leftTab,
  pageView,
  slides,
  activeSlide,
  slideTone,
  customTemplates,
  onLeftTabChange,
  onPageViewChange,
  onActiveSlideChange,
  onSlideToneChange,
  onNotify,
  onOpenTemplates,
  onAddPage,
}: {
  leftTab: "pages" | "design" | "draft";
  pageView: "thumbnail" | "outline";
  slides: SlideMeta[];
  activeSlide: number;
  slideTone: "dark" | "light";
  customTemplates: string[];
  onLeftTabChange: (tab: "pages" | "design" | "draft") => void;
  onPageViewChange: (view: "thumbnail" | "outline") => void;
  onActiveSlideChange: (index: number) => void;
  onSlideToneChange: (tone: "dark" | "light") => void;
  onNotify: (text: string, tone?: "neutral" | "success" | "danger") => void;
  onOpenTemplates: () => void;
  onAddPage: () => void;
}) {
  return (
    <aside className="ppt-left-panel" aria-label="PPT 编辑功能">
      <div className="ppt-left-mode-tabs">
        <div className="ppt-left-mode-tabs__group" role="tablist" aria-label="编辑功能">
          <button type="button" role="tab" aria-selected={leftTab === "pages"} className={leftTab === "pages" ? "active" : ""} onClick={() => onLeftTabChange("pages")}>页面</button>
          <button type="button" role="tab" aria-selected={leftTab === "design"} className={leftTab === "design" ? "active" : ""} onClick={() => onLeftTabChange("design")}>视觉样式</button>
          <button type="button" role="tab" aria-selected={leftTab === "draft"} className={leftTab === "draft" ? "active" : ""} onClick={() => onLeftTabChange("draft")}>大纲草稿</button>
        </div>
      </div>
      {leftTab === "pages" && <div className="ppt-left-panel__content">
          <div className="tab-row ppt-page-view-tabs">
            <button className={pageView === "thumbnail" ? "tab tab--active" : "tab"} onClick={() => onPageViewChange("thumbnail")}>缩略图</button>
            <button className={pageView === "outline" ? "tab tab--active" : "tab"} onClick={() => onPageViewChange("outline")}>大纲</button>
          </div>
          {pageView === "thumbnail" && slides.map((slide, index) => (
            <button
              key={slide.id}
              className={activeSlide === index ? "slide-thumb slide-thumb--active" : "slide-thumb"}
              onClick={() => onActiveSlideChange(index)}
            >
              <span className="slide-thumb__meta">
                <small>{String(index + 1).padStart(2, "0")}</small>
                <strong>{slide.title}</strong>
              </span>
              <span className="slide-thumb__preview" aria-hidden="true" />
            </button>
          ))}
          {pageView === "outline" && (
            <div className="ppt-outline-list">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  className={activeSlide === index ? "ppt-outline-item ppt-outline-item--active" : "ppt-outline-item"}
                  onClick={() => onActiveSlideChange(index)}
                >
                  <span>{index + 1}</span>
                  <strong>{slide.title}</strong>
                </button>
              ))}
            </div>
          )}
          <button className="button button--block ppt-add-page" onClick={onAddPage}>+ 添加页面</button>
        </div>}
      {leftTab === "design" && <div className="tool-panel ppt-side-panel"><div><h2>视觉样式</h2><p className="muted">调整当前项目的模板与整体风格。</p></div><label>当前模板<FormSelect label="当前模板" options={["系统模板 A", ...customTemplates]} /></label><div className="style-preview-grid" role="group" aria-label="演示配色"><button type="button" className={slideTone === "dark" ? "style-preview style-preview--active" : "style-preview"} onClick={() => onSlideToneChange("dark")}>深色</button><button type="button" className={slideTone === "light" ? "style-preview style-preview--active" : "style-preview"} onClick={() => onSlideToneChange("light")}>浅色</button><button type="button" className="style-preview">经典</button><button type="button" className="style-preview">杂志</button></div><button className="button button--block" onClick={onOpenTemplates}>管理模板</button></div>}
      {leftTab === "draft" && <div className="tool-panel ppt-side-panel"><div><h2>大纲草稿</h2><p className="muted">保存当前结构，或载入已有草稿继续编辑。</p></div><button className="button button--primary button--block" onClick={() => onNotify("当前大纲已保存", "success")}>保存当前大纲</button><article className="mini-card"><strong>行业报告草稿</strong><span>{slides.length} 页 · 更新于昨天</span></article></div>}
    </aside>
  );
}
