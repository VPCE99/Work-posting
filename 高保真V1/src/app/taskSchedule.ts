/** Prototype clock: Thursday 8 Oct 2026, 13:46. Enabled tasks schedule after this moment. */
const PROTOTYPE_NOW = new Date(2026, 9, 8, 13, 46);

export function formatNextRun(frequency: string, time: string, enabled: boolean) {
  if (!enabled) return "已停用";
  const parts = time.split(":");
  const hour = Number(parts[0]) || 0;
  const minute = Number(parts[1]) || 0;
  const next = new Date(PROTOTYPE_NOW);
  next.setHours(hour, minute, 0, 0);
  const bump = (days: number) => next.setDate(next.getDate() + days);

  if (frequency === "每周一") {
    bump((8 - next.getDay()) % 7);
    if (next <= PROTOTYPE_NOW) bump(7);
  } else if (frequency === "每月 1 日") {
    next.setDate(1);
    if (next <= PROTOTYPE_NOW) next.setMonth(next.getMonth() + 1);
  } else {
    if (next <= PROTOTYPE_NOW) bump(1);
    if (frequency === "工作日") {
      while (next.getDay() === 0 || next.getDay() === 6) bump(1);
    }
  }

  const month = String(next.getMonth() + 1).padStart(2, "0");
  const day = String(next.getDate()).padStart(2, "0");
  const hours = String(hour).padStart(2, "0");
  const minutes = String(minute).padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
}
