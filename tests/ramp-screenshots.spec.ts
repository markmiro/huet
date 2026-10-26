import { test, expect } from "@playwright/test";

// Run against a separately served baseline checkout to capture matched PR evidence.
test("capture before/after ramp squares for neutral and blue backgrounds", async ({ browser }) => {
  test.skip(!process.env.HUET_BEFORE_URL, "Set HUET_BEFORE_URL to a baseline Vite server");
  for (const [version, url] of [
    ["before", process.env.HUET_BEFORE_URL!],
    ["after", "http://localhost:8733/"],
  ]) {
    const context = await browser.newContext({ viewport: { width: 2000, height: 1100 } });
    const page = await context.newPage();
    await page.goto(url);
    await page.locator("select").first().selectOption("colorContrast");
    await page.locator("select").nth(1).selectOption("increment20");
    await expect(page.locator("pre")).toHaveCount(6);
    for (const [name, index] of [["neutral", 0], ["blue", 4]] as const) {
      await page.locator("button.w2.h2.ba.ml1").nth(index).click();
      const matrix = page.locator("pre").first().locator("..").locator("..");
      await expect(matrix).toBeVisible();
      const box = (await matrix.boundingBox())!;
      const picker = (await page.getByText("Background ramp", { exact: true }).boundingBox())!;
      await page.screenshot({
        path: `docs/screenshots/ramp-squares-${name}-${version}.png`,
        clip: { x: box.x, y: picker.y, width: box.width, height: Math.ceil(box.y + box.height - picker.y) },
      });
    }
    await context.close();
  }
});
