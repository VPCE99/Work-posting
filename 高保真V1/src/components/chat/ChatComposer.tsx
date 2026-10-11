import { useRef, type ChangeEvent, type Ref } from "react";
import { ConnectionToggle } from "../ui/ConnectionToggle";
import { MenuIcon } from "../ui/MenuIcon";
import { ModelSelect } from "../ui/ModelSelect";

type ChatComposerBase = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  className?: string;
  composerRef?: Ref<HTMLDivElement>;
  rows?: number;
};

type ChatComposerFullProps = ChatComposerBase & {
  compact?: false;
  online: boolean;
  onToggleOnline: () => void;
  modelPlacement?: "down" | "up";
};

type ChatComposerCompactProps = ChatComposerBase & {
  compact: true;
};

type ChatComposerProps = ChatComposerFullProps | ChatComposerCompactProps;

/** Images plus Excel / PPT / PDF — keep in sync with the file input accept list. */
const COMPOSER_FILE_ACCEPT = [
  "image/*",
  ".pdf",
  "application/pdf",
  ".xls",
  ".xlsx",
  ".csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  ".ppt",
  ".pptx",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
].join(",");

function composerFileMark(file: File): string {
  const name = file.name;
  const lower = name.toLowerCase();
  const type = file.type;
  if (type.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(lower)) {
    return `[图片] ${name}`;
  }
  if (type === "application/pdf" || lower.endsWith(".pdf")) {
    return `[PDF] ${name}`;
  }
  if (
    /\.(xlsx?|csv)$/i.test(lower)
    || type.includes("spreadsheet")
    || type.includes("excel")
    || type === "text/csv"
  ) {
    return `[Excel] ${name}`;
  }
  if (
    /\.pptx?$/i.test(lower)
    || type.includes("presentation")
    || type.includes("powerpoint")
  ) {
    return `[PPT] ${name}`;
  }
  return `[文件] ${name}`;
}

export function ChatComposer(props: ChatComposerProps) {
  const {
    value,
    onChange,
    onSubmit,
    placeholder,
    className,
    composerRef,
    rows = 3,
  } = props;
  const compact = props.compact === true;
  const fileRef = useRef<HTMLInputElement>(null);
  const canSend = Boolean(value.trim());

  const attachFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const mark = composerFileMark(file);
    onChange(value.trim() ? `${value.trim()}\n${mark}` : mark);
  };

  return (
    <div className={className ? `composer ${className}` : "composer"} ref={composerRef}>
      <textarea
        value={value}
        rows={compact ? Math.min(rows, 3) : rows}
        placeholder={placeholder}
        title="Enter 发送，Shift+Enter 换行"
        aria-keyshortcuts="Enter"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
          event.preventDefault();
          if (canSend) onSubmit();
        }}
      />
      <div className="composer__toolbar">
        <div className="composer__tools">
          {!compact && (
            <>
              <input ref={fileRef} className="composer__file" type="file" accept={COMPOSER_FILE_ACCEPT} onChange={attachFile} />
              <button className="button button--small" type="button" onClick={() => fileRef.current?.click()} aria-label="上传文件">
                <MenuIcon name="upload" />上传文件
              </button>
              <ConnectionToggle online={props.online} onToggle={props.onToggleOnline} />
              <ModelSelect placement={props.modelPlacement ?? "down"} />
              <span className="composer__hint">Enter 发送 · Shift+Enter 换行</span>
            </>
          )}
          {compact && <span className="composer__hint">Enter 发送</span>}
        </div>
        <button className="button button--primary composer__send" type="button" onClick={onSubmit} aria-label="发送" disabled={!canSend}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
