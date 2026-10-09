import { useRef, type ChangeEvent, type Ref } from "react";
import { ConnectionToggle } from "../ui/ConnectionToggle";
import { MenuIcon } from "../ui/MenuIcon";
import { ModelSelect } from "../ui/ModelSelect";

type ChatComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  online: boolean;
  onToggleOnline: () => void;
  modelPlacement?: "down" | "up";
  className?: string;
  composerRef?: Ref<HTMLDivElement>;
};

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  placeholder,
  online,
  onToggleOnline,
  modelPlacement = "down",
  className,
  composerRef,
}: ChatComposerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const canSend = Boolean(value.trim());

  const attachImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const mark = `[图片] ${file.name}`;
    onChange(value.trim() ? `${value.trim()}\n${mark}` : mark);
  };

  return (
    <div className={className ? `composer ${className}` : "composer"} ref={composerRef}>
      <textarea
        value={value}
        rows={3}
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
          <input ref={fileRef} className="composer__file" type="file" accept="image/*" onChange={attachImage} />
          <button className="button button--small" type="button" onClick={() => fileRef.current?.click()}>
            <MenuIcon name="upload" />上传图片
          </button>
          <ConnectionToggle online={online} onToggle={onToggleOnline} />
          <ModelSelect placement={modelPlacement} />
          <span className="composer__hint">Enter 发送 · Shift+Enter 换行</span>
        </div>
        <button className="button button--primary composer__send" type="button" onClick={onSubmit} aria-label="发送" disabled={!canSend}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
