export function EditorStatusBar({
  activeSlide,
  slideCount,
  zoomLabel,
}: {
  activeSlide: number;
  slideCount: number;
  zoomLabel: string;
}) {
  return (
    <footer className="ppt-editor__status">
      <span>第 {activeSlide + 1} / {slideCount} 页</span>
      <span>自动保存已开启</span>
      <span className="ppt-editor__shortcuts">⌘ Z 撤销   ⌘ ⇧ Z 重做   Shift + 滚轮缩放</span>
      <span aria-live="polite">{zoomLabel}</span>
    </footer>
  );
}
