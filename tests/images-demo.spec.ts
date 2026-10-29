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

test("emoji are drawn into images and recolored", async ({ page }) => {
  await page.goto("/images");
  const emoji = page.locator("img[data-emoji]");
  await expect(emoji).toHaveCount(60);
  await expect
    .poll(
      () => emoji.evaluateAll((els) => (els as HTMLImageElement[]).every((img) => img.src.startsWith("blob:"))),
      { timeout: 30_000 },
    )
    .toBe(true);
  await expect(emoji.first()).toHaveAttribute("alt", "🌸");
});

test("image controls default to no neutral tint, the GPU and a 17³ LUT", async ({ page }) => {
  await page.goto("/images");
  await expect(page.getByLabel("Neutral tint on colors")).toHaveValue("0");
  await expect(page.getByLabel("Renderer")).toHaveValue("gpu");
  await expect(page.getByLabel("LUT size")).toHaveValue("17");
  const status = page.locator("[data-renderer-status]");
  await expect(status).toContainText("17³ lookup table");
  // Headless Chromium has WebGL2, so the default renderer really is the GPU.
  await expect(status).toContainText("the GPU (WebGL2)");

  const image = page.locator("img[data-huet-recolor]").first();
  await expect(image).toHaveAttribute("src", /^blob:/, { timeout: 30_000 });
  const gpuSrc = await image.getAttribute("src");
  await page.getByLabel("Renderer").selectOption("cpu");
  await expect(status).toContainText("Rendering on the CPU through");
  await expect.poll(() => image.getAttribute("src"), { timeout: 30_000 }).not.toBe(gpuSrc);
  await expect(image).toHaveAttribute("src", /^blob:/);
});
