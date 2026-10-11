import { useState, type FormEvent } from "react";
import { usePrototype } from "../../app/PrototypeContext";
import { Icon } from "../ui/Icon";
import { Modal } from "../ui/Modal";

export function ImportPptDialog({ onClose, onImported }: { onClose: () => void; onImported: (id: string) => void }) {
  const { addProject, notify } = usePrototype();
  const [fileName, setFileName] = useState("");
  const [attempted, setAttempted] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    if (!fileName) return;
    const id = `ppt-import-${Date.now()}`;
    addProject({ id, name: fileName.replace(/\.pptx$/i, ""), source: "上传 PPT", pages: 1, status: "解析中", updatedAt: "刚刚", favorite: false, recentlyViewed: true });
    notify("PPT 已导入，正在智能解析", "success");
    onImported(id);
  };

  return (
    <Modal
      title="导入现有 PPT"
      variant="import-ppt"
      onClose={onClose}
      footer={(
        <>
          <button className="button" onClick={onClose}>取消</button>
          <button className="button button--primary" type="submit" form="import-ppt-form">导入并查看解析</button>
        </>
      )}
    >
      <form id="import-ppt-form" className="form-stack" onSubmit={submit}>
        <span className="field-label-row ppt-import-label">
          <span>选择 PPT 文件 *</span>
          {attempted && !fileName && <small className="field-error">请选择 PPT 文件</small>}
        </span>
        <label className="ppt-import-dropzone">
          <input type="file" accept=".pptx" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} />
          <Icon name="upload" strokeWidth={1.8} />
          <strong>{fileName || "选择 .pptx 文件"}</strong>
        </label>
        <div className="notice">
          <strong>导入后将自动解析</strong>
          <p>识别提纲结构、页面版式、视觉风格，以及可更新的文字、图表和表格。</p>
        </div>
        <small>低保真原型不会上传真实文件，仅验证选择、导入和解析流程。</small>
      </form>
    </Modal>
  );
}
