import { expect, test } from "@playwright/test";

test("ppt editor smoke: open, select, edit, agent, dialogs", async ({ page }) => {
  await page.goto("/ppt/industry-2026");

  const editor = page.locator(".ppt-editor");
  await expect(editor).toBeVisible({ timeout: 20_000 });

  const liveText = editor.locator(".slide-canvas__live-item, .market-slide__live-text").first();
  await expect(liveText).toBeVisible();
  await liveText.click();

  const contentInput = editor.locator(".ppt-element-props textarea").first();
  if (await contentInput.count()) {
    await contentInput.fill("烟雾测试文案");
  }

  await editor.locator(".slide-thumb").nth(2).click();
  const chartHit = editor.locator(".market-slide__chart-hit").first();
  await expect(chartHit).toBeVisible();
  await chartHit.click();

  const chartTypeButton = editor.locator(".ppt-props-chart-types button").filter({ hasText: "柱状图" }).first();
  if (await chartTypeButton.count()) {
    await chartTypeButton.click();
  }

  const agentToggle = editor.locator("button").filter({ hasText: /收起|展开|AI/ }).first();
  if (await agentToggle.count()) {
    await agentToggle.click();
    await page.waitForTimeout(400);
    await agentToggle.click();
  }

  const fileMenu = editor.getByRole("button", { name: /文件与数据|文件/ }).first();
  if (await fileMenu.count()) {
    await fileMenu.click();
    await page.keyboard.press("Escape");
  }

  await expect(editor).toBeVisible();
});
