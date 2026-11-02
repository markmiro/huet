import { test, expect, type Page } from "@playwright/test";

import { themes } from "../../packages/huet/src/core/themes";
import type { Theme } from "../../packages/huet/src/core/theme";

/**
 * The Bubble docs preview under theme-blue. Tinted bubbles derive their hue
 * and chroma from --primary, so if theme-blue's primary turns into the gray
 * invert, they come out plain gray, the same as the muted bubble.
 */
const path = "/docs/components/radix/bubble";

async function tintedBubbles(page: Page, theme: Theme, background: number) {
  await page.goto(path);
  await page.evaluate(
    ([theme, background]) => localStorage.setItem("huet-shadcn", JSON.stringify({ theme, background })),
    [theme, background] as const,
  );
  await page.reload();
  await page.waitForFunction(() => document.getElementById("huet-theme-hues"));
  const tinted = page.locator('.theme-blue [class*="huet-bubble-tint"] > [data-slot=bubble-content]');
  await tinted.first().waitFor();
  return tinted.evaluateAll((elements) =>
    elements.map((element) => {
      // Read back the painted sRGB color, whatever syntax computes.
      const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
      ctx.fillStyle = getComputedStyle(element).backgroundColor;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return { r, g, b };
    }),
  );
}

for (const [name, background] of [
  ["light", 1],
  ["dark", 0],
] as const) {
  test(`tinted bubbles keep theme-blue's hue in ${name} mode`, async ({ page }) => {
    const bubbles = await tintedBubbles(page, themes.Base, background);
    expect(bubbles.length).toBeGreaterThan(0);
    for (const { r, g, b } of bubbles) {
      // Base is gray, so any blue here comes from theme-blue.
      expect(b - Math.max(r, g), `rgb(${r}, ${g}, ${b})`).toBeGreaterThan(15);
    }
  });
}
