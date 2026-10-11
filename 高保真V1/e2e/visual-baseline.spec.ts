import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { captureComputedStyles, clientGoto, installClockFreeze, setTheme, stabilizePage } from "./helpers/visual";

const ROUTES = [
  { name: "chat", path: "/chat" },
  { name: "chat-industry", path: "/chat/industry" },
  { name: "tasks", path: "/tasks" },
  { name: "ppt", path: "/ppt" },
  { name: "ppt-editor", path: "/ppt/industry-2026" },
  { name: "skills", path: "/skills" },
  { name: "account", path: "/account" },
  { name: "account-plans", path: "/account/plans" },
] as const;

const VIEWPORTS = [
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "390x844", width: 390, height: 844 },
] as const;

const THEMES = ["dark", "light"] as const;

const computedOutDir = path.join(process.cwd(), "baselines", "computed-styles");

test.describe.configure({ mode: "serial" });

test.describe("visual baselines", () => {
  for (const viewport of VIEWPORTS) {
    for (const theme of THEMES) {
      for (const route of ROUTES) {
        test(`${route.name} ${theme} ${viewport.name}`, async ({ page }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          // Load once, set theme, then SPA-navigate so theme state is preserved under modals.
          await installClockFreeze(page);
          await page.goto("/chat", { waitUntil: "networkidle" });
          await stabilizePage(page);
          await setTheme(page, theme);
          if (route.path !== "/chat") {
            await clientGoto(page, route.path);
            await stabilizePage(page);
          }
          await expect(page.locator(".app")).toHaveAttribute("data-theme", theme);

          // Mobile drawer: open once for chat shell pages under 860px.
          if (viewport.width <= 860 && (route.name === "chat" || route.name === "tasks")) {
            const openNav = page.getByRole("button", { name: /展开导航栏|展开导航|打开导航|菜单/ });
            if (await openNav.count()) {
              await openNav.first().click({ force: true });
              await page.waitForTimeout(100);
            }
          }

          if (route.name === "ppt-editor") {
            await expect(page.locator(".ppt-editor")).toBeVisible({ timeout: 20_000 });
          }
          if (route.name === "account-plans") {
            await expect(page.getByRole("dialog", { name: /账户与套餐/ })).toBeVisible();
          }

          const mask = route.name === "ppt-editor"
            ? [page.locator(".editor-save-state")]
            : [];
          await expect(page).toHaveScreenshot(`${route.name}--${theme}--${viewport.name}.png`, {
            fullPage: false,
            animations: "disabled",
            caret: "hide",
            // Chrome 1-level RGB noise / font AA; layout regressions use computed-style JSON.
            maxDiffPixelRatio: 0.02,
            threshold: 0.25,
            mask,
          });

          // Persist computed styles for desktop dark primary routes (acceptance JSON).
          if (viewport.name === "1440x900" && theme === "dark") {
            fs.mkdirSync(computedOutDir, { recursive: true });
            const styles = await captureComputedStyles(page);
            fs.writeFileSync(
              path.join(computedOutDir, `${route.name}.json`),
              `${JSON.stringify(styles, null, 2)}\n`,
            );
          }
        });
      }
    }
  }

  test("toolbar bottom border absent on skills and ppt projects (both themes)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const theme of THEMES) {
      for (const route of ["/skills", "/ppt"] as const) {
        await page.goto(route, { waitUntil: "networkidle" });
        await stabilizePage(page);
        await setTheme(page, theme);
        const border = await page.evaluate(() => {
          const candidates = [
            ...document.querySelectorAll(
              ".skills-page [class*='toolbar'], .ppt-projects-page [class*='toolbar'], .page-toolbar, .projects-toolbar, .skills-toolbar",
            ),
          ] as HTMLElement[];
          return candidates.slice(0, 6).map((el) => {
            const cs = getComputedStyle(el);
            return {
              className: el.className,
              borderBottomWidth: cs.borderBottomWidth,
              borderBottomStyle: cs.borderBottomStyle,
              borderBottomColor: cs.borderBottomColor,
            };
          });
        });
        for (const item of border) {
          const width = Number.parseFloat(item.borderBottomWidth || "0");
          if (item.borderBottomStyle === "none" || width === 0) continue;
          // Soft gray separators must not reappear.
          expect(item.borderBottomColor, `${route} ${theme} ${item.className}`).not.toMatch(/rgb\(\s*2[0-9]{2}/);
        }
      }
    }
  });

  test("two usage indicators remain independent", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/chat", { waitUntil: "networkidle" });
    await stabilizePage(page);
    await setTheme(page, "dark");
    await expect(page.locator(".usage-indicator--daily")).toHaveCount(1);
    await expect(page.locator(".usage-indicator--token")).toHaveCount(1);
    const boxes = await page.locator(".usage-indicator").evaluateAll((nodes) =>
      nodes.map((n) => {
        const r = n.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height) };
      }),
    );
    expect(boxes).toHaveLength(2);
    expect(boxes[0]).toEqual({ w: 155, h: 52 });
    expect(boxes[1]).toEqual({ w: 155, h: 52 });
  });
});
