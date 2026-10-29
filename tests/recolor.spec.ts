import { test, expect } from "@playwright/test";

test("recolors every image through a theme LUT without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/recolor.html");
  await expect(page.locator("#metrics")).toContainText("wall clock", { timeout: 60_000 });
  const cards = page.locator(".card canvas");
  expect(await cards.count()).toBeGreaterThan(20);
  // Identity theme leaves pixels (nearly) unchanged; another theme changes them.
  const differs = () =>
    page.evaluate(() => {
      const img = document.querySelector<HTMLImageElement>("#unsplash .pair img")!;
      const out = document.querySelector<HTMLCanvasElement>("#unsplash .pair canvas")!;
      const c = document.createElement("canvas");
      c.width = out.width;
      c.height = out.height;
      const x = c.getContext("2d")!;
      x.drawImage(img, 0, 0, c.width, c.height);
      const a = x.getImageData(0, 0, c.width, c.height).data;
      const b = out.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
      let sum = 0;
      for (let i = 0; i < a.length; i += 4) sum += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]);
      return sum / (a.length / 4);
    });
  await page.locator("#theme").selectOption({ label: "Huet default (identity)" });
  await expect(page.locator("#metrics")).toContainText("Huet default", { timeout: 60_000 });
  await expect(page.locator("#metrics")).toContainText("wall clock");
  expect(await differs()).toBeLessThan(3);
  await page.locator("#theme").selectOption({ label: "Sunset" });
  await expect(page.locator("#metrics")).toContainText("Sunset", { timeout: 60_000 });
  await expect(page.locator("#metrics")).toContainText("wall clock");
  expect(await differs()).toBeGreaterThan(10);
  expect(errors).toEqual([]);
});

test("themes the page with the selected theme unless turned off", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/recolor.html");
  await expect(page.locator("#metrics")).toContainText("wall clock", { timeout: 60_000 });
  const body = page.locator("body");
  // Sunset is a dark theme whose dark endpoint is #242744.
  await expect(body).toHaveCSS("background-color", "rgb(36, 39, 68)");
  await page.locator("#theme").selectOption({ label: "Paperback" });
  await expect(body).toHaveCSS("background-color", "rgb(226, 193, 177)");
  await page.locator("#page-theme").uncheck();
  await expect(body).toHaveCSS("background-color", "rgb(247, 246, 242)");
  await expect(body).not.toHaveAttribute("data-huet-root");
  // Changing themes while off leaves the page alone.
  await page.locator("#theme").selectOption({ label: "Terminal" });
  await expect(page.locator("#metrics")).toContainText("Terminal", { timeout: 60_000 });
  await expect(body).toHaveCSS("background-color", "rgb(247, 246, 242)");
  await page.locator("#page-theme").check();
  await expect(body).toHaveCSS("background-color", "rgb(13, 23, 29)");
  // Inverting moves the background to the theme's light end (#7fff8b).
  await page.locator("#invert-theme").check();
  await expect(body).toHaveCSS("background-color", "rgb(127, 255, 139)");
  await page.locator("#invert-theme").uncheck();
  await expect(body).toHaveCSS("background-color", "rgb(13, 23, 29)");
  expect(errors).toEqual([]);
});
