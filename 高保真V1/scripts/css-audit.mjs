#!/usr/bin/env node
/**
 * CSS cascade audit — reads styles in main.tsx import order.
 * Outputs rule/declaration counts, !important, duplicate selectors,
 * same/diff-value rewrites, identical rule sets, and unreferenced class tokens.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const mainPath = path.join(root, "src/main.tsx");
const whitelistPath = path.join(__dirname, "css-dynamic-class-whitelist.json");

const whitelist = JSON.parse(fs.readFileSync(whitelistPath, "utf8"));

function readCssImportOrder() {
  const main = fs.readFileSync(mainPath, "utf8");
  const imports = [...main.matchAll(/import\s+[\"'](\.\/styles\/[^\"']+\.css)[\"']/g)].map((m) => m[1]);
  return imports.map((rel) => path.join(root, "src", rel.replace(/^\.\//, "")));
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Very small CSS rule extractor — good enough for cascade audits of this codebase. */
function extractRules(cssText, file) {
  const css = stripComments(cssText);
  const rules = [];
  let i = 0;
  let atStack = [];

  while (i < css.length) {
    while (i < css.length && /\s/.test(css[i])) i += 1;
    if (i >= css.length) break;

    if (css.startsWith("@", i)) {
      const start = i;
      while (i < css.length && css[i] !== "{" && css[i] !== ";") i += 1;
      if (i >= css.length) break;
      if (css[i] === ";") {
        i += 1;
        continue;
      }
      const prelude = css.slice(start, i).trim();
      i += 1;
      atStack.push(prelude);
      continue;
    }

    if (css[i] === "}") {
      if (atStack.length) atStack.pop();
      i += 1;
      continue;
    }

    const selStart = i;
    while (i < css.length && css[i] !== "{") i += 1;
    if (i >= css.length) break;
    const selectorGroup = css.slice(selStart, i).trim();
    i += 1;
    const bodyStart = i;
    let depth = 1;
    while (i < css.length && depth > 0) {
      if (css[i] === "{") depth += 1;
      else if (css[i] === "}") depth -= 1;
      i += 1;
    }
    const body = css.slice(bodyStart, i - 1).trim();
    if (!selectorGroup || selectorGroup.startsWith("@")) continue;

    const declarations = parseDeclarations(body);
    const selectors = selectorGroup.split(",").map((s) => s.trim()).filter(Boolean);
    const atContext = atStack.join(" >> ") || "(root)";
    for (const selector of selectors) {
      rules.push({
        file: path.relative(root, file),
        atContext,
        selector,
        declarations,
        declarationText: serializeDecls(declarations),
      });
    }
  }
  return rules;
}

function parseDeclarations(body) {
  const decls = [];
  // Ignore nested @ rules inside body for declaration parse (media nesting rare here).
  if (body.includes("{")) return decls;
  for (const part of body.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const colon = trimmed.indexOf(":");
    if (colon < 0) continue;
    const prop = trimmed.slice(0, colon).trim().toLowerCase();
    const value = trimmed.slice(colon + 1).trim();
    const important = /!important\s*$/i.test(value);
    const cleanValue = value.replace(/\s*!important\s*$/i, "").trim();
    decls.push({ prop, value: cleanValue, important });
  }
  return decls;
}

function serializeDecls(decls) {
  return decls.map((d) => `${d.prop}:${d.value}${d.important ? "!important" : ""}`).sort().join(";");
}

function classTokensFromSelector(selector) {
  return [...selector.matchAll(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g)].map((m) => m[1]);
}

function isWhitelistedClass(name) {
  if (whitelist.literalProtectedClasses.includes(name)) return true;
  if (whitelist.templatePrefixes.some((p) => name.startsWith(p))) return true;
  if (whitelist.stateTokens.includes(name)) return true;
  if (whitelist.statePrefixPatterns.some((p) => name.startsWith(p) || name.includes(p))) return true;
  if (name.startsWith("is-")) return true;
  return false;
}

function collectTsxClassLiterals() {
  const srcRoot = path.join(root, "src");
  const literals = new Set();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(ts|tsx)$/.test(entry.name)) continue;
      const text = fs.readFileSync(full, "utf8");
      for (const m of text.matchAll(/[\"'`]([a-zA-Z_][\w-]*)[\"'`]/g)) {
        literals.add(m[1]);
      }
      for (const m of text.matchAll(/class(?:Name)?=\{?[`\"']([^`\"']+)[`\"']/g)) {
        for (const token of m[1].split(/\s+/)) {
          if (token) literals.add(token.replace(/^[.!]/, ""));
        }
      }
    }
  };
  walk(srcRoot);
  return literals;
}

function main() {
  const files = readCssImportOrder();
  const allRules = [];
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.error(`Missing CSS import: ${file}`);
      process.exit(1);
    }
    allRules.push(...extractRules(fs.readFileSync(file, "utf8"), file));
  }

  let declarationCount = 0;
  let importantCount = 0;
  for (const rule of allRules) {
    declarationCount += rule.declarations.length;
    importantCount += rule.declarations.filter((d) => d.important).length;
  }

  /** key: at|selector → appearances */
  const byKey = new Map();
  for (const rule of allRules) {
    const key = `${rule.atContext}||${rule.selector}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(rule);
  }

  let duplicateGroups = 0;
  let extraAppearances = 0;
  let conflictingGroups = 0;
  let sameValueRewrites = 0;
  let diffValueRewrites = 0;
  let identicalRuleSets = 0;
  const identicalExamples = [];

  for (const [key, appearances] of byKey) {
    if (appearances.length < 2) continue;
    duplicateGroups += 1;
    extraAppearances += appearances.length - 1;

    const propMaps = appearances.map((a) => {
      const map = new Map();
      for (const d of a.declarations) map.set(d.prop, d.value);
      return map;
    });

    let hasConflict = false;
    const allProps = new Set(propMaps.flatMap((m) => [...m.keys()]));
    for (const prop of allProps) {
      const values = [];
      for (const m of propMaps) {
        if (m.has(prop)) values.push(m.get(prop));
      }
      if (values.length < 2) continue;
      const first = values[0];
      for (let i = 1; i < values.length; i += 1) {
        if (values[i] === first) sameValueRewrites += 1;
        else {
          diffValueRewrites += 1;
          hasConflict = true;
        }
      }
    }
    if (hasConflict) conflictingGroups += 1;

    const texts = appearances.map((a) => a.declarationText);
    if (texts.every((t) => t && t === texts[0])) {
      identicalRuleSets += 1;
      if (identicalExamples.length < 30) {
        identicalExamples.push({
          selector: appearances[0].selector,
          atContext: appearances[0].atContext,
          files: appearances.map((a) => a.file),
        });
      }
    }
  }

  const classTokens = new Set();
  for (const rule of allRules) {
    for (const token of classTokensFromSelector(rule.selector)) classTokens.add(token);
  }
  const tsLiterals = collectTsxClassLiterals();
  const unreferenced = [...classTokens]
    .filter((name) => !tsLiterals.has(name) && !isWhitelistedClass(name))
    .sort();

  const report = {
    generatedAt: new Date().toISOString(),
    cssFileCount: files.length,
    ruleBlocksExpanded: allRules.length,
    declarationCount,
    importantCount,
    duplicateSelectorGroups: duplicateGroups,
    extraAppearances,
    conflictingValueGroups: conflictingGroups,
    sameValueRewrites,
    diffValueRewrites,
    identicalRuleSetGroups: identicalRuleSets,
    classTokenCount: classTokens.size,
    unreferencedClassCandidates: unreferenced.length,
    identicalExamples,
    unreferencedSample: unreferenced.slice(0, 40),
  };

  const outDir = path.join(root, "baselines", "css-audit");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "latest.json");
  fs.writeFileSync(outFile, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  console.error(`\nWrote ${path.relative(root, outFile)}`);
}

main();
