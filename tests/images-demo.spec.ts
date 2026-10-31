import { expect, test, type Page } from "@playwright/test";
import { pickTheme } from "./helpers/configurator";

// A coarse fingerprint of the first recolored canvases, to tell when they're redrawn.
const firstCanvases = (page: Page) =>
  page.locator("img[data-huet-recolor]").evaluateAll((els) =>
    (els as HTMLImageElement[]).slice(0, 3).map((img) => {
      const canvas = img.nextElementSibling;
      if (!(canvas instanceof HTMLCanvasElement) || !img.hasAttribute("data-huet-recolored")) return null;
      const small = Object.assign(document.createElement("canvas"), { width: 8, height: 8 });
      const context = small.getContext("2d")!;
      context.drawImage(canvas, 0, 0, 8, 8);
      return Array.from(context.getImageData(0, 0, 8, 8).data).join();
    }),
  );

test("images follow the configurator's theme", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/images");
  const isRecolored = (prints: (string | null)[]) => prints.every((print) => print !== null);
  await expect.poll(async () => isRecolored(await firstCanvases(page)), { timeout: 30_000 }).toBe(true);
  const before = await firstCanvases(page);

  await pickTheme(page, "Sunset");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sunset");
  // Every image is redrawn for the new theme.
  await expect
    .poll(async () => {
      const prints = await firstCanvases(page);
      return isRecolored(prints) && prints.every((print, i) => print !== before[i]);
    }, { timeout: 30_000 })
    .toBe(true);
  expect(errors).toEqual([]);
});

// The emoji section is commented out on the Images page.
test.skip("emoji are drawn into images and recolored", async ({ page }) => {
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
  // The CPU renderer writes pixels back with putImageData; the GPU one never does.
  await page.addInitScript(() => {
    const w = window as any;
    w.cpuDraws = 0;
    const putImageData = CanvasRenderingContext2D.prototype.putImageData;
    CanvasRenderingContext2D.prototype.putImageData = function (this: CanvasRenderingContext2D, ...args: any[]) {
      if (this.canvas.getAttribute("role") === "img") w.cpuDraws++;
      return (putImageData as any).apply(this, args);
    };
  });
  await page.goto("/images");
  await expect(page.getByLabel("Neutral tint on colors")).toHaveValue("0");
  await expect(page.getByLabel("Renderer")).toHaveValue("gpu");
  await expect(page.getByLabel("LUT size")).toHaveValue("17");
  const status = page.locator("[data-renderer-status]");
  await expect(status).toContainText("17³ lookup table");
  // Headless Chromium has WebGL2, so the default renderer really is the GPU.
  await expect(status).toContainText("the GPU (WebGL2)");

  const image = page.locator("img[data-huet-recolor]").first();
  await expect(image).toHaveAttribute("data-huet-recolored", "", { timeout: 30_000 });
  expect(await page.evaluate(() => (window as any).cpuDraws)).toBe(0);
  await page.getByLabel("Renderer").selectOption("cpu");
  await expect(status).toContainText("Rendering on the CPU through");
  await expect.poll(() => page.evaluate(() => (window as any).cpuDraws), { timeout: 30_000 }).toBeGreaterThan(0);
  await expect(image).toHaveAttribute("data-huet-recolored", "");
});
