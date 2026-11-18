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

test("emoji stay text and follow the configurator's theme", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/images");
  const palette = () =>
    page.evaluate(() => ({
      name: document.getElementById("page")!.style.getPropertyValue("font-palette"),
      css: document.querySelector("style[data-huet-fonts]")?.textContent ?? "",
    }));
  await expect.poll(async () => (await palette()).name).toMatch(/^--huet-fonts-\d+$/);
  const before = await palette();
  expect(before.css).toContain(`@font-palette-values ${before.name} {\n  font-family: "Twemoji";`);
  // The emoji are text in the Twemoji font, not images.
  const emoji = page.locator("#emoji");
  await expect(emoji).toContainText("Build passed ✅ and shipped 🚀");
  await expect(emoji.locator("img, canvas, svg")).toHaveCount(0);
  expect(await page.evaluate(() => document.fonts.check('30px "Twemoji"', "🌸"))).toBe(true);

  await pickTheme(page, "Sunset");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sunset");
  await expect.poll(async () => (await palette()).css).not.toBe(before.css);
  expect((await palette()).name).toBe(before.name);
  expect(errors).toEqual([]);
});

test("images recolor by default, on the GPU", async ({ page }) => {
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
  const image = page.locator("img[data-huet-recolor]").first();
  await expect(image).toHaveAttribute("data-huet-recolored", "", { timeout: 30_000 });
  // Headless Chromium has WebGL2, so the default renderer really is the GPU.
  expect(await page.evaluate(() => (window as any).cpuDraws)).toBe(0);
});
