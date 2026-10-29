import { expect, test } from "@playwright/test";

const firstImages = (page: import("@playwright/test").Page) =>
  page.locator("img[data-huet-recolor]").evaluateAll((els) =>
    (els as HTMLImageElement[]).slice(0, 3).map((img) => img.src),
  );

test("images follow the configurator's theme", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/images");
  const isRecolored = (srcs: string[]) => srcs.every((src) => src.startsWith("blob:"));
  await expect.poll(async () => isRecolored(await firstImages(page)), { timeout: 30_000 }).toBe(true);
  const before = await firstImages(page);

  await page.getByRole("button", { name: /^Sunset/ }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sunset");
  // Every image gets a new recolored copy for the new theme.
  await expect
    .poll(async () => {
      const srcs = await firstImages(page);
      return isRecolored(srcs) && srcs.every((src, i) => src !== before[i]);
    }, { timeout: 30_000 })
    .toBe(true);
  expect(errors).toEqual([]);
});
