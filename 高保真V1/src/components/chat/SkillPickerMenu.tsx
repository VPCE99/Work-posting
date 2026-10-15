import type { Skill } from "../../types";

export type SkillPickerSection = {
  title: string;
  skills: Skill[];
};

type Props = {
  sections: SkillPickerSection[];
  activeIndex: number;
  onHover: (index: number) => void;
  onSelect: (skill: Skill) => void;
};

export function skillPickerItems(sections: SkillPickerSection[]): Skill[] {
  return sections.flatMap((section) => section.skills);
}

export function SkillPickerMenu({ sections, activeIndex, onHover, onSelect }: Props) {
  let flatIndex = -1;

  return (
    <div id="skill-picker" className="skill-picker" role="listbox" aria-label="选择技能">
      {sections.map((section, sectionIndex) => (
        <div className="skill-picker__section" key={section.title}>
          {sectionIndex > 0 && <div className="skill-picker__divider" aria-hidden="true" />}
          <p className="skill-picker__label">{section.title}</p>
          {section.skills.length === 0 ? (
            <p className="skill-picker__empty">暂无可用技能</p>
          ) : (
            section.skills.map((skill) => {
              flatIndex += 1;
              const index = flatIndex;
              const active = index === activeIndex;
              return (
                <button
                  key={skill.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={active ? "skill-picker__item skill-picker__item--active" : "skill-picker__item"}
                  onMouseEnter={() => onHover(index)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onSelect(skill);
                  }}
                >
                  <span className="skill-picker__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 3-1.8 5.4a2 2 0 0 1-1.3 1.3L3.5 11.5l5.4 1.8a2 2 0 0 1 1.3 1.3L12 20l1.8-5.4a2 2 0 0 1 1.3-1.3l5.4-1.8-5.4-1.8a2 2 0 0 1-1.3-1.3L12 3Z" />
                    </svg>
                  </span>
                  <span className="skill-picker__copy">
                    <strong>{skill.name}</strong>
                    <small>{skill.description}</small>
                  </span>
                  <span className="skill-picker__tag">{skill.kind === "公用技能" ? "公共" : "我的"}</span>
                </button>
              );
            })
          )}
        </div>
      ))}
    </div>
  );
}

/** Detect a trailing `/query` token suitable for skill mention. */
export function getSkillSlashMatch(value: string, cursor: number): { start: number; query: string } | null {
  const before = value.slice(0, cursor);
  const match = /(^|[\s\n])\/([^\s\n]*)$/.exec(before);
  if (!match) return null;
  const query = match[2] ?? "";
  return { start: before.length - query.length - 1, query };
}

export function applySkillToDraft(value: string, cursor: number, skill: Skill): string {
  const match = getSkillSlashMatch(value, cursor);
  if (!match) return value;
  const insert = `请使用「${skill.name}」：${skill.description}`;
  return `${value.slice(0, match.start)}${insert}${value.slice(cursor)}`;
}
