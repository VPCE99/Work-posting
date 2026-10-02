import type { Ref } from "react";
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
  return (
    <div className={className ? `composer ${className}` : "composer"} ref={composerRef}>
      <textarea
        value={value}
        rows={3}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") onSubmit();
        }}
      />
      <div className="composer__toolbar">
        <div>
          <button className="button button--small" type="button">
            <MenuIcon name="upload" />上传图片
          </button>
          <ConnectionToggle online={online} onToggle={onToggleOnline} />
          <ModelSelect placement={modelPlacement} />
        </div>
        <button className="button button--primary composer__send" type="button" onClick={onSubmit} aria-label="发送" aria-disabled={!value.trim()}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
