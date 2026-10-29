import { test, expect, type Page } from "@playwright/test";

// Set HUET_DOCS_SCREENSHOTS=1 to refresh docs/screenshots/color-model-*.png.
const docs = !!process.env.HUET_DOCS_SCREENSHOTS;

/** Rendered background chroma (max RGB channel spread) of every ramp swatch. */
const swatchSpread = (page: Page) =>
  page.locator(".swatch").evaluateAll((els) =>
    els.map((el) => {
      const [r, g, b] = getComputedStyle(el).backgroundColor.match(/\d+/g)!.map(Number);
      return Math.max(r, g, b) - Math.min(r, g, b);
    }),
  );

async function capture(page: Page, name: string) {
  if (!docs) return;
  const workspace = (await page.locator("#themed").boundingBox())!;
  const controls = (await page.locator(".controls").boundingBox())!;
  await page.screenshot({
    path: `docs/screenshots/color-model-${name}.png`,
    clip: {
      x: workspace.x - 16,
      y: controls.y,
      width: workspace.width + 32,
      height: workspace.y + workspace.height - controls.y + 16,
    },
  });
}

test("Sunset and Astro neutral ramps travel through hues in HCL", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 2000 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/lab.html");
  for (const preset of ["sunset", "astro"]) {
    await page.locator("#preset").selectOption(preset);
    await expect(page.locator("#ramp-label")).toContainText("in hcl");
    const after = await swatchSpread(page);
    await capture(page, `${preset}-after`);
    // The only path huet/core supported before: endpoints mixed in OKLab.
    await page.locator("#model").selectOption("");
    await page.locator("#use-middle").uncheck();
    await expect(page.locator("#ramp-label")).toContainText("in oklab");
    const before = await swatchSpread(page);
    await capture(page, `${preset}-before`);
    // Midtones are visibly colored instead of muddy grays.
    for (const i of [3, 4, 5, 6, 7])
      expect(after[i], `${preset} huet-bg-${i * 10}`).toBeGreaterThan(before[i] + 20);
  }
  // Astro's peach stop appears in the middle of the ramp.
  await page.locator("#preset").selectOption("astro");
  await page.locator("#position").fill("50");
  await expect(page.locator("#themed")).toHaveCSS("background-color", "rgb(255, 185, 128)");
  expect(errors).toEqual([]);
});
