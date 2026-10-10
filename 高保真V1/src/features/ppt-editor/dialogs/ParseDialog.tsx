import { Modal } from "../../../components/ui/Modal";

export function ParseDialog({
  pageCount,
  chartCount,
  tableCount,
  imageCount,
  onClose,
}: {
  pageCount: number;
  chartCount: number;
  tableCount: number;
  imageCount: number;
  onClose: () => void;
}) {
  return (
    <Modal title="上传 PPT 智能解析" onClose={onClose} footer={<button className="button" onClick={onClose}>后台继续解析</button>}>
      <div className="progress-list">
        <p><strong>文件：</strong>行业报告模板.pptx</p>
        <p>✓ 上传文件</p>
        <p>✓ 解析提纲结构</p>
        <p>◉ 识别版式与视觉风格 <strong>68%</strong></p>
        <progress value="68" max="100" />
        <p>○ 识别可更新文字、图表和表格</p>
        <small>当前识别：{pageCount} 页 / {chartCount} 个图表 / {tableCount} 个表格 / {imageCount} 张图片</small>
      </div>
    </Modal>
  );
}
