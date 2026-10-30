import { test, expect, type Page } from "@playwright/test";

/** APCA Lc of each token role against the first block, as the page reports it. */
const contrasts = (page: Page) =>
  page.$$eval("[data-lc]", (cells) => cells.map((c) => parseFloat(c.textContent!.replace("Lc ", ""))));
const lightness = (page: Page, selector: string) =>
  page.locator(selector).first().evaluate((el) => {
    const [r, g, b] = getComputedStyle(el).backgroundColor.match(/\d+/g)!.map(Number);
    return (r + g + b) / 3;
  });

test("re-themes build-time Shiki code blocks through variables, with readable tokens", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/code");
  await page.waitForSelector("body[data-ready]");
  await expect(page.locator("h1")).toHaveText("Base");
  await expect.poll(() => contrasts(page).then((r) => r.length)).toBe(12);
  // Hue tokens and comments (muted text) aim for Lc 60 on a full black-to-white ramp.
  await expect.poll(() => contrasts(page).then((r) => Math.min(...r))).toBeGreaterThanOrEqual(60);

  // Highlighted at build time with Huet variables only, and marked as surfaces.
  const after = page.locator("#after pre");
  await expect(after).toHaveClass(/\bastro-code\b.*\bhuet-bg-5\b/);
  expect(await page.locator(".post pre").first().innerHTML()).not.toMatch(/#[0-9a-f]{6}/i);
  const keyword = page.locator('#after span[style*="--huet-code-keyword"]').first();
  const code = page.locator("#after pre code");
  const before = { color: await keyword.evaluate((el) => getComputedStyle(el).color), html: await code.innerHTML() };

  // The configurator's theme reaches the blocks without re-rendering them.
  await page.locator("button", { hasText: /^Paperback$/ }).click();
  await expect(page.locator("h1")).toHaveText("Paperback");
  await expect.poll(() => keyword.evaluate((el) => getComputedStyle(el).color)).not.toBe(before.color);
  expect(await code.innerHTML()).toBe(before.html);
  // Paperback's ramp is narrower, so its targets scale down with it (lowest: comments, Lc 41).
  await expect.poll(() => contrasts(page).then((r) => Math.min(...r))).toBeGreaterThanOrEqual(40);

  // The slider skips the middle of the ramp: 0–25 on the page's side, 75–100 opposite.
  expect(await page.locator("#surface").getAttribute("max")).toBe("11");
  const near = await lightness(page, "#after pre");
  await page.locator("#surface").fill("9");
  await expect(page.locator("#surface-value")).toHaveText("huet-bg-90");
  await expect(after).toHaveClass(/\bhuet-bg-90\b/);
  // Paperback is light, so the opposite side is a dark block with light tokens.
  await expect.poll(() => lightness(page, "#after pre")).toBeLessThan(near - 100);
  await expect.poll(() => contrasts(page).then((r) => Math.min(...r))).toBeGreaterThanOrEqual(40);
  expect(errors).toEqual([]);
});

test("every-theme cards get their own colors without nested mounts", async ({ page }) => {
  await page.goto("/code?surface=90");
  await page.waitForSelector("body[data-ready]");
  const cards = page.locator("[data-card]");
  expect(await cards.count()).toBeGreaterThan(10);
  // The cards' blocks aren't surfaces of the page theme.
  expect(await page.locator("[data-card] pre[class*='huet-bg-']").count()).toBe(0);
  const backgrounds = await cards.evaluateAll((els) =>
    els.map((el) => getComputedStyle(el.querySelector("pre")!).backgroundColor),
  );
  expect(new Set(backgrounds).size).toBe(backgrounds.length);
  // Base at huet-bg-90: a dark block on a white card, like github-dark on markmiro.com.
  const base = cards.filter({ has: page.locator("figcaption", { hasText: /^Base$/ }) });
  await expect(base).toHaveCount(1);
  expect(await base.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(255, 255, 255)");
  // 90% of the L* distance from white to black.
  expect(await base.locator("pre").evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(27, 27, 27)");
  await expect(base).toHaveAttribute("data-selected", "");
});

test("highlighted rows are nested surfaces with readable tokens and markers", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/code");
  await page.waitForSelector("body[data-ready]");
  // Rows from Shiki's notation become surfaces nested in the block.
  const example = page.locator("[data-rows]");
  const pre = example.locator("pre");
  await expect(pre).toHaveClass(/\bhuet-bg-5\b/);
  // The highlight isn't a Huet surface: CSS tints it yellow at the block's lightness.
  const highlight = example.locator(".line").first();
  await expect(highlight).toHaveClass("line highlighted");
  const yellow = await highlight.evaluate((el) => {
    // The background is oklch(); read it back as sRGB.
    const pixel = document.createElement("canvas").getContext("2d")!;
    pixel.fillStyle = getComputedStyle(el).backgroundColor;
    pixel.fillRect(0, 0, 1, 1);
    const [r, g, b] = pixel.getImageData(0, 0, 1, 1).data;
    return { r, g, b };
  });
  await expect(example.locator(".line.remove")).toHaveCount(3);
  await expect(example.locator(".line.remove").first()).toHaveClass(/\bhuet-bg-red-20\b/);
  await expect(example.locator(".line.add")).toHaveClass(/\bhuet-bg-green-20\b/);
  // The highlight isn't next to the removed rows.
  expect(await example.locator(".line").nth(1).getAttribute("class")).toBe("line");
  // Base is light, so its highlighter yellow is light and saturated.
  expect(Math.min(yellow.r, yellow.g) - yellow.b).toBeGreaterThan(60);
  // The slider moves the block; rows keep their own classes.
  await page.locator("#surface").fill("9");
  await expect(pre).toHaveClass(/\bhuet-bg-90\b/);
  await expect(example.locator("[data-surface-name]")).toHaveText("huet-bg-90");
  await expect(example.locator(".line.add")).toHaveClass(/\bhuet-bg-green-20\b/);
  // Tokens and +/− markers, against the block or row they sit on, in APCA Lc. Tokens on the
  // highlight are the block's, not re-solved for the yellow, so on a huet-bg-90 block they
  // dip to Lc 56 in Terminal (60 on the block) and 43 in Paperback (44); see docs/code-blocks.md.
  const floors = { Terminal: 55, Paperback: 42 };
  const readout = example.locator("[data-row-contrast]");
  for (const [theme, minimum] of Object.entries(floors)) {
    await page.locator("button", { hasText: new RegExp(`^${theme}$`) }).click();
    await expect(page.locator("h1")).toHaveText(theme);
    await expect.poll(async () => {
      const values = [...(await readout.textContent())!.matchAll(/Lc (\d+)/g)].map((m) => Number(m[1]));
      return values.length === 3 ? Math.min(...values) : 0;
    }).toBeGreaterThanOrEqual(minimum);
  }
  expect(errors).toEqual([]);
});
