import { test, expect } from "@playwright/test";

test("recolors every image through a theme LUT without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/recolor.html");
  await expect(page.locator("#metrics")).toContainText("wall clock", { timeout: 60_000 });
  // 20 Unsplash photos (3 faces, 6 macro, 11 scenes), 4 markmiro.com
  // screenshots and the emoji sheet.
  await expect(page.locator(".card canvas")).toHaveCount(25);
  // Emoji are rasterized from the system font into a transparent sheet.
  const emoji = page.locator("#emoji .pair canvas");
  await expect(emoji).toHaveCount(1);
  expect(await emoji.evaluate((c: HTMLCanvasElement) => c.width)).toBeGreaterThan(0);
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

test("hides and shows the original images", async ({ page }) => {
  await page.goto("/recolor.html");
  await expect(page.locator("#metrics")).toContainText("wall clock", { timeout: 60_000 });
  const before = page.locator("#unsplash .pair img").first();
  const after = page.locator("#unsplash .pair canvas").first();
  await expect(before).toBeVisible();
  const half = (await after.boundingBox())!.width;
  await page.locator("#originals").uncheck();
  const opacity = (el: typeof before) => el.evaluate((x) => getComputedStyle(x).opacity);
  await expect.poll(() => opacity(before)).toBe("0");
  await expect.poll(() => opacity(page.locator("#focus-original"))).toBe("0");
  // The recolored image takes the whole card, with the original laid over it.
  expect((await after.boundingBox())!.width).toBeGreaterThan(half * 1.8);
  expect(await before.boundingBox()).toEqual(await after.boundingBox());
  await expect(page.locator(".pair-note").first()).toHaveText("Recolored · hover for the original");
  // Hovering shows the original.
  await after.hover();
  await expect.poll(() => opacity(before)).toBe("1");
  await page.mouse.move(0, 0);
  await expect.poll(() => opacity(before)).toBe("0");
  // Before ramps in the coordinate grid are hidden too; theme ramps remain.
  await expect(page.locator(".ramp-row canvas.before").first()).toBeHidden();
  await expect(page.locator(".ramp-row canvas:not(.before)")).toHaveCount(6);
  await expect(page.locator(".ramp-row canvas:not(.before)").first()).toBeVisible();
  await expect(page.locator(".ramps .note .after")).toBeVisible();
  await expect(page.locator(".ramps .note .before")).toBeHidden();
  // Hovering the focused image shows its original and inspects pixels.
  const focus = page.locator("#focus-original");
  expect(await focus.boundingBox()).toEqual(await page.locator("#focus-result").boundingBox());
  await focus.hover();
  await expect.poll(() => opacity(focus)).toBe("1");
  await expect(page.locator("#inspect")).toContainText("t ");
  await page.locator("#originals").check();
  await expect(before).toBeVisible();
  await expect(page.locator(".ramp-row canvas.before").first()).toBeVisible();
  await expect(page.locator(".ramps .note .before")).toBeVisible();
  await expect(page.locator(".ramps .note .after")).toBeHidden();
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
