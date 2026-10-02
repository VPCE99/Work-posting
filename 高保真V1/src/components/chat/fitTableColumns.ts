/** Width units for one cell. CJK takes a full unit; Latin and digits take a little over half. */
export function textUnits(value: string) {
  let units = 0;
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    units += code > 0xff ? 1 : 0.56;
  }
  return units;
}

/**
 * Grid tracks for any column count.
 * Each column is at least as wide as its longest cell, then the remaining
 * table width is shared almost evenly, with a small extra share for longer text.
 * Side padding on the row keeps the first and last text outside the rounded border.
 */
export function fitColumnTemplate(rows: string[][]) {
  const count = rows[0]?.length ?? 0;
  if (count === 0) return "none";
  const longest = Array.from({ length: count }, (_, index) =>
    Math.max(1, ...rows.map((row) => textUnits(row[index] ?? ""))),
  );
  const peak = Math.max(...longest);
  return longest
    .map((units) => {
      const weight = 1 + (units / peak) * 0.45;
      return `minmax(max-content, ${weight.toFixed(3)}fr)`;
    })
    .join(" ");
}
