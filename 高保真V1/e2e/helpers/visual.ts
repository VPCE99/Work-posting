import type { Page } from "@playwright/test";

const CRITICAL_SELECTORS = [
  ".topbar",
  ".usage-indicator--daily",
  ".usage-indicator--token",
  ".sidebar",
  ".nav-item",
  ".account-avatar",
  ".prompt-grid button",
  ".composer",
  ".ppt-editor__topbar",
  ".ppt-editor__status",
  ".slide-thumb",
  ".canvas-toolbar",
  ".slide-canvas-stage",
  ".slide-canvas",
  ".ppt-agent",
  ".modal",
] as const;

const STYLE_PROPS = [
  "display",
  "position",
  "width",
  "height",
  "padding",
  "gap",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderTopStyle",
  "borderBottomStyle",
  "borderTopColor",
  "borderBottomColor",
  "borderRadius",
  "backgroundColor",
  "color",
  "boxShadow",
  "transform",
  "opacity",
  "zIndex",
  "fontSize",
  "lineHeight",
] as const;

/** Must run before the first navigation so document Date is frozen for save labels. */
export async function installClockFreeze(page: Page) {
  await page.addInitScript(() => {
    const fixed = Date.parse("2026-10-11T12:00:00+08:00");
    const RealDate = Date;
    class FrozenDate extends RealDate {
      constructor(...args: unknown[]) {
        if (args.length === 0) super(fixed);
        else super(...(args as ConstructorParameters<typeof Date>));
      }
      static now() {
        return fixed;
      }
    }
    // @ts-expect-error test-only clock freeze
    window.Date = FrozenDate;
  });
}

/** Freeze motion sources before screenshots / style capture. */
export async function stabilizePage(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
    `,
  });
}

/** SPA navigate without remounting React (preserves theme / UI state). */
export async function clientGoto(page: Page, nextPath: string) {
  await page.evaluate((p) => {
    window.history.pushState({}, "", p);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, nextPath);
  await page.waitForURL((url) => url.pathname === nextPath || url.pathname + url.search === nextPath);
  await page.waitForTimeout(120);
}

export async function setTheme(page: Page, theme: "dark" | "light") {
  const current = await page.locator(".app").getAttribute("data-theme");
  if (current === theme) return;
  // Prefer the real toggle so React state and document chrome stay aligned.
  const toggle = page.getByRole("button", { name: /切换为浅色模式|切换为深色模式/ });
  if (await toggle.count()) {
    await toggle.first().click({ force: true });
    await expectTheme(page, theme);
    return;
  }
  await page.evaluate((next) => {
    const root = document.querySelector(".app");
    if (root instanceof HTMLElement) root.dataset.theme = next;
  }, theme);
  await page.waitForTimeout(80);
}

async function expectTheme(page: Page, theme: "dark" | "light") {
  await page.waitForFunction((next) => {
    return document.querySelector(".app")?.getAttribute("data-theme") === next;
  }, theme);
}

export async function captureComputedStyles(page: Page) {
  return page.evaluate(
    ({ selectors, props }) => {
      const out: Record<string, Record<string, string> | null> = {};
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (!el) {
          out[selector] = null;
          continue;
        }
        const cs = getComputedStyle(el);
        const box = el.getBoundingClientRect();
        const entry: Record<string, string> = {
          offsetWidth: String(Math.round(box.width)),
          offsetHeight: String(Math.round(box.height)),
        };
        for (const prop of props) {
          entry[prop] = String((cs as unknown as Record<string, string>)[prop] ?? "");
        }
        out[selector] = entry;
      }
      return out;
    },
    { selectors: [...CRITICAL_SELECTORS], props: [...STYLE_PROPS] },
  );
}

export { CRITICAL_SELECTORS };
