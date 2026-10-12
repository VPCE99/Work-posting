import { useRef } from "react";
import { Modal } from "../../components/ui/Modal";
import type { SharePublication } from "./shareSnapshot";

type Props = {
  publication: SharePublication;
  onClose: () => void;
  onCopy: (copied: boolean) => void;
};

export function ShareConversationDialog({ publication, onClose, onCopy }: Props) {
  const linkRef = useRef<HTMLInputElement>(null);
  const captured = new Date(publication.snapshot.capturedAt);
  const when = new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit" }).format(captured);
  const status = publication.reachable ? "可以访问" : "暂不可访问";

  const copyLink = () => {
    const field = linkRef.current;
    const write = navigator.clipboard?.writeText(publication.url);
    if (!write) {
      field?.select();
      onCopy(false);
      return;
    }
    write.then(
      () => onCopy(true),
      () => {
        field?.select();
        onCopy(false);
      },
    );
  };

  return (
    <Modal
      title="分享对话"
      size="sm"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="button" onClick={onClose}>关闭</button>
          <button type="button" className="button button--primary" onClick={copyLink}>复制链接</button>
        </>
      }
    >
      <div className="share-snapshot">
        <p>
          {publication.reachable
            ? "已根据当前对话生成网页快照。其他人打开链接即可看到这份内容。"
            : "已根据当前对话生成网页快照。其他人打开链接即可看到这份内容。分享服务尚未接入，此链接仅用于预览，暂时无法访问。"}
        </p>
        <label className="share-snapshot__link">
          <span>分享链接</span>
          <input ref={linkRef} readOnly value={publication.url} aria-label="分享链接" onFocus={(event) => event.currentTarget.select()} />
        </label>
        <small>网页快照 · {when} · {publication.snapshot.turns.length} 段内容 · {status}</small>
      </div>
    </Modal>
  );
}
