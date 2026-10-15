import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type Ref, type SyntheticEvent } from "react";
import { usePrototype } from "../../app/PrototypeContext";
import type { Skill } from "../../types";
import { ConnectionToggle } from "../ui/ConnectionToggle";
import { MenuIcon } from "../ui/MenuIcon";
import { ModelSelect } from "../ui/ModelSelect";
import {
  applySkillToDraft,
  getSkillSlashMatch,
  SkillPickerMenu,
  skillPickerItems,
  type SkillPickerSection,
} from "./SkillPickerMenu";

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

function filterSkills(skills: Skill[], query: string): Skill[] {
  const q = query.trim().toLowerCase();
  if (!q) return skills;
  return skills.filter(
    (skill) => skill.name.toLowerCase().includes(q) || skill.description.toLowerCase().includes(q),
  );
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
  const { skills } = usePrototype();
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursor, setCursor] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pickerDismissed, setPickerDismissed] = useState(false);
  const canSend = Boolean(value.trim());

  const slashMatch = compact ? null : getSkillSlashMatch(value, cursor);
  const sections = useMemo<SkillPickerSection[]>(() => {
    const query = slashMatch?.query ?? "";
    return [
      { title: "公共技能库", skills: filterSkills(skills.filter((item) => item.kind === "公用技能"), query) },
      { title: "用户创建的技能", skills: filterSkills(skills.filter((item) => item.kind === "我的技能"), query) },
    ];
  }, [skills, slashMatch?.query]);
  const pickerItems = skillPickerItems(sections);
  const showSkillPicker = Boolean(slashMatch) && !pickerDismissed && !compact;

  useEffect(() => {
    setActiveIndex(0);
    setPickerDismissed(false);
  }, [slashMatch?.start, slashMatch?.query]);

  useEffect(() => {
    if (activeIndex >= pickerItems.length) {
      setActiveIndex(Math.max(0, pickerItems.length - 1));
    }
  }, [activeIndex, pickerItems.length]);

  const syncCursor = (event: SyntheticEvent<HTMLTextAreaElement>) => {
    setCursor(event.currentTarget.selectionStart ?? 0);
  };

  const selectSkill = (skill: Skill) => {
    const next = applySkillToDraft(value, cursor, skill);
    onChange(next);
    setPickerDismissed(true);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      const pos = next.length;
      el.setSelectionRange(pos, pos);
      setCursor(pos);
    });
  };

  const attachFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const mark = composerFileMark(file);
    onChange(value.trim() ? `${value.trim()}\n${mark}` : mark);
  };

  const onTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSkillPicker) {
      if (event.key === "ArrowDown" && pickerItems.length > 0) {
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % pickerItems.length);
        return;
      }
      if (event.key === "ArrowUp" && pickerItems.length > 0) {
        event.preventDefault();
        setActiveIndex((current) => (current - 1 + pickerItems.length) % pickerItems.length);
        return;
      }
      if ((event.key === "Enter" || event.key === "Tab") && pickerItems[activeIndex] && !event.shiftKey) {
        event.preventDefault();
        selectSkill(pickerItems[activeIndex]);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setPickerDismissed(true);
        return;
      }
    }

    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (canSend) onSubmit();
  };

  return (
    <div className={className ? `composer ${className}` : "composer"} ref={composerRef}>
      {showSkillPicker && (
        <SkillPickerMenu
          sections={sections}
          activeIndex={activeIndex}
          onHover={setActiveIndex}
          onSelect={selectSkill}
        />
      )}
      <textarea
        ref={textareaRef}
        value={value}
        rows={compact ? Math.min(rows, 3) : rows}
        placeholder={placeholder}
        title="Enter 发送，Shift+Enter 换行；输入 / 调用技能"
        aria-keyshortcuts="Enter"
        aria-expanded={showSkillPicker}
        aria-controls={showSkillPicker ? "skill-picker" : undefined}
        onChange={(event) => {
          onChange(event.target.value);
          setCursor(event.target.selectionStart ?? event.target.value.length);
        }}
        onClick={syncCursor}
        onKeyUp={syncCursor}
        onSelect={syncCursor}
        onKeyDown={onTextareaKeyDown}
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
