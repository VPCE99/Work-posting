import { Modal } from "../../../components/ui/Modal";

export function ExportDialog({
  projectName,
  pageCount,
  chartCount,
  tableCount,
  imageCount,
  generating,
  onClose,
  onGenerate,
}: {
  projectName?: string;
  pageCount: number;
  chartCount: number;
  tableCount: number;
  imageCount: number;
  generating: boolean;
  onClose: () => void;
  onGenerate: () => void;
}) {
  const lowResHint = imageCount > 0 ? `，其中 1 张清晰度低` : "";
  return (
    <Modal
      title="预览并生成 PPT"
      size="lg"
      onClose={onClose}
      footer={
        <>
          <button className="button" onClick={onClose}>返回编辑</button>
          <button className="button button--primary" disabled={generating} onClick={onGenerate}>
            {generating ? "生成中……" : "继续生成 PPT"}
          </button>
        </>
      }
    >
      <div className="export-review">
        <div className="preview-slide"><h2>{projectName}</h2><p>当前 PPT 预览</p></div>
        <div>
          <h3>导出前检查</h3>
          <p>✓ 页数：{pageCount}</p>
          <p>✓ 图表：{chartCount}</p>
          <p>✓ 表格：{tableCount}</p>
          <p>{imageCount > 0 ? "!" : "✓"} 图片：{imageCount}{lowResHint}</p>
          {pageCount > 0 && <button className="text-button">定位第 {pageCount} 页</button>}
        </div>
      </div>
    </Modal>
  );
}
