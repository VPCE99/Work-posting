#!/usr/bin/env node
/**
 * Batch helpers for checklist §8–§10:
 * - rewrite modal:has(...) → modal--variant in CSS
 * - append 90/95 rules into owner files by selector heuristic, then empty those files
 *
 * Run from package root. Does not touch TSX (call sites updated separately).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const styles = (...p) => path.join(root, "src/styles", ...p);

const HAS_TO_VARIANT = [
  [/\.modal:has\(\.metric-strip\)/g, ".modal--plans"],
  [/\.modal:has\(\.dialog-card-grid--plans\)/g, ".modal--plans"],
  [/\.modal:has\(\.purchase-payment-panel\)/g, ".modal--payment"],
  [/\.modal:has\(\.purchase-payment-success\)/g, ".modal--payment"],
  [/\.modal:has\(\.binding-list\)/g, ".modal--binding"],
  [/\.modal:has\(#task-form\)/g, ".modal--task"],
  [/\.modal:has\(#new-ppt-form\)/g, ".modal--new-ppt"],
  [/\.modal:has\(#import-ppt-form\)/g, ".modal--import-ppt"],
  [/\.modal:has\(\.template-tabs\)/g, ".modal--template-manager"],
  [/\.modal:has\(\.template-preview-dialog\)/g, ".modal--template-preview"],
  [/\.modal:has\(\.summary-list\)/g, ".modal--order"],
  // Backdrop probes content inside the panel; match explicit variant class instead.
  [/\.modal-backdrop:has\(\.template-tabs\)/g, ".modal-backdrop:has(.modal--template-manager)"],
];

function rewriteModalHas(file) {
  let text = fs.readFileSync(file, "utf8");
  const before = text;
  for (const [re, rep] of HAS_TO_VARIANT) text = text.replace(re, rep);
  if (text !== before) {
    fs.writeFileSync(file, text);
    console.log("rewrote :has → variant:", path.relative(root, file));
  }
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Split top-level rules (including @media blocks as units). */
function splitTopLevel(css) {
  const src = stripComments(css);
  const chunks = [];
  let i = 0;
  while (i < src.length) {
    while (i < src.length && /\s/.test(src[i])) i += 1;
    if (i >= src.length) break;
    const start = i;
    if (src.startsWith("@", i)) {
      while (i < src.length && src[i] !== "{" && src[i] !== ";") i += 1;
      if (i >= src.length) break;
      if (src[i] === ";") {
        i += 1;
        chunks.push(src.slice(start, i));
        continue;
      }
      let depth = 0;
      for (; i < src.length; i += 1) {
        if (src[i] === "{") depth += 1;
        else if (src[i] === "}") {
          depth -= 1;
          if (depth === 0) {
            i += 1;
            break;
          }
        }
      }
      chunks.push(src.slice(start, i).trim());
      continue;
    }
    while (i < src.length && src[i] !== "{") i += 1;
    if (i >= src.length) break;
    let depth = 0;
    for (; i < src.length; i += 1) {
      if (src[i] === "{") depth += 1;
      else if (src[i] === "}") {
        depth -= 1;
        if (depth === 0) {
          i += 1;
          break;
        }
      }
    }
    chunks.push(src.slice(start, i).trim());
  }
  return chunks.filter(Boolean);
}

function classifyChunk(chunk) {
  const head = chunk.slice(0, 200);
  // Media blocks must keep load-order after 00–40; classify before content heuristics.
  if (/@media/.test(head)) return "99";
  if (/ppt-library|ppt-projects|ppt-project-item|template-library|source-choice|template-picker|template-tabs|template-preview/.test(head)) {
    return "ppt-projects";
  }
  if (/chart-dialog|\.modal--chart/.test(head)) return "chart";
  if (/app--ppt-editor|ppt-editor__topbar|ppt-editor__workspace|ppt-editor__status|ppt-editor__identity|ppt-editor__top-actions|ppt-editor__shortcuts|editor-exit|editor-file|editor-save/.test(head)) {
    return "00";
  }
  if (/ppt-left-panel|ppt-pages|ppt-page-view|slide-thumb|ppt-add-page|ppt-outline|canvas-toolbar|canvas-zoom|canvas-tool|slide-canvas-wrap|slide-work-area|slide-canvas-stage/.test(head)) {
    return "10";
  }
  if (/ppt-agent|editor-quick|canvas-agent|composer--agent|agent-/.test(head)) return "30";
  if (/ppt-element-props|ppt-props|slide-element|tool-panel/.test(head)) return "40";
  if (/slide-|market-slide|live-slide|canvas__/.test(head)) return "20";
  // default shell leftovers
  if (/ppt-editor/.test(head)) return "00";
  return "00";
}

const OWNER_FILES = {
  "00": styles("features/ppt-editor/00-shell-and-topbar.css"),
  "10": styles("features/ppt-editor/10-navigation-and-canvas.css"),
  "20": styles("features/ppt-editor/20-slide-content.css"),
  "30": styles("features/ppt-editor/30-agent-and-dialogs.css"),
  "40": styles("features/ppt-editor/40-element-properties.css"),
  "99": styles("features/ppt-editor/99-responsive.css"),
  "ppt-projects": styles("features/ppt-projects.css"),
  chart: styles("features/chart.css"),
};

function migrateOverrides(file, label) {
  const text = fs.readFileSync(file, "utf8");
  const chunks = splitTopLevel(text);
  const buckets = Object.fromEntries(Object.keys(OWNER_FILES).map((k) => [k, []]));
  for (const chunk of chunks) {
    const key = classifyChunk(chunk);
    buckets[key].push(chunk);
  }
  for (const [key, list] of Object.entries(buckets)) {
    if (!list.length) continue;
    const dest = OWNER_FILES[key];
    const banner = `\n\n/* --- Migrated from ${label} (checklist §9; values unchanged) --- */\n`;
    fs.appendFileSync(dest, banner + list.join("\n\n") + "\n");
    console.log(`  ${label} → ${path.relative(root, dest)}: ${list.length} chunks`);
  }
  fs.writeFileSync(file, `/* ${label} emptied — rules migrated to owners (checklist §9). */\n`);
}

function main() {
  const mode = process.argv[2] ?? "all";
  if (mode === "has" || mode === "all") {
    for (const rel of [
      "components/modal.css",
      "features/account.css",
      "features/tasks.css",
      "features/ppt-projects.css",
    ]) {
      rewriteModalHas(styles(rel));
    }
  }
  if (mode === "overrides" || mode === "all") {
    console.log("Migrating 90/95…");
    migrateOverrides(styles("features/ppt-editor/90-current-overrides.css"), "90-current-overrides.css");
    migrateOverrides(styles("features/ppt-editor/95-from-global.css"), "95-from-global.css");
  }
}

main();
