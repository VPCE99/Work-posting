import { expect, test } from "@playwright/test";

test("ppt editor smoke: open, select, edit, agent, dialogs", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ppt/industry-2026");

  const editor = page.locator(".ppt-editor");
  await expect(editor).toBeVisible({ timeout: 20_000 });

  const liveText = editor.locator(".slide-canvas__live-item, .market-slide__live-text").first();
  await expect(liveText).toBeVisible();
  await liveText.click();

  const contentInput = editor.locator(".ppt-element-props textarea").first();
  await expect(contentInput).toBeVisible();
  await contentInput.fill("烟雾测试文案");

  await editor.locator(".slide-thumb").nth(2).click();
  const chartHit = editor.locator(".market-slide__chart-hit").first();
  await expect(chartHit).toBeVisible();
  await chartHit.click();
  await expect(editor.locator(".ppt-element-props")).toBeVisible();

  const previewToggle = editor.getByRole("button", { name: /图表预览/ });
  if ((await previewToggle.getAttribute("aria-expanded")) === "false") {
    await previewToggle.click();
  }

  const chartTypeButton = editor.getByRole("button", { name: "柱状图" });
  await expect(chartTypeButton).toBeVisible();
  await chartTypeButton.click();

  // Collapse uses the panel header control; dock button may coexist in the DOM.
  const collapse = editor.locator("button.ppt-agent-collapse");
  const openDock = editor.locator("button.canvas-agent-dock");
  if (await collapse.isVisible()) {
    await collapse.click();
    await page.waitForTimeout(400);
    await expect(openDock).toBeVisible();
    await openDock.click();
  } else {
    await expect(openDock).toBeVisible();
    await openDock.click();
    await page.waitForTimeout(400);
    await expect(collapse).toBeVisible();
    await collapse.click();
  }

  const fileMenu = editor.getByRole("button", { name: /文件与数据/ });
  await expect(fileMenu).toBeVisible();
  await fileMenu.click();
  await page.keyboard.press("Escape");

  await expect(editor).toBeVisible();
});
