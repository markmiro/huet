import { test, expect, type Frame } from "@playwright/test";

import { themes } from "../../packages/huet/src/core/themes";

/*
  Huet paints after React hydrates. FIRST_PAINT_SCRIPT (scripts/shadcn-huet/
  first-paint.ts) replays the last paint before that on the top page, and
  keeps preview iframes hidden until theirs lands, so neither flashes stock
  shadcn colors. Each frame here logs its visible <html> background and text
  color on every animation frame; all of them must be the final ones.
*/

type Sample = { visible: boolean; bg: string; fg: string };
declare global {
  interface Window {
    __paints?: Sample[];
  }
}

function logPaints() {
  const paints: Sample[] = [];
  window.__paints = paints;
  const tick = () => {
    const root = document.documentElement;
    if (document.body) {
      const style = getComputedStyle(root);
      paints.push({
        visible: style.visibility !== "hidden",
        bg: style.backgroundColor,
        fg: getComputedStyle(document.body).color,
      });
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** The visible paints that differ from the frame's last one. */
async function flashes(frame: Frame) {
  const paints = (await frame.evaluate(() => window.__paints)) ?? [];
  const last = paints[paints.length - 1];
  return paints.filter((paint) => paint.visible && (paint.bg !== last.bg || paint.fg !== last.fg));
}

test("pages and block previews open in Huet's colors, without a stock shadcn flash", async ({ page }) => {
  // A dark Huet page, so stock shadcn's white page and black text stand out.
  await page.goto("/blocks/sidebar");
  await page.evaluate((theme) => localStorage.setItem("huet-shadcn", JSON.stringify({ theme, background: 0 })), themes.Sunset);
  // This load saves the dark paint for the next one to replay.
  await page.reload();
  await page.waitForFunction(() => localStorage.getItem("huet-shadcn-paint")?.includes("--background"));

  await page.addInitScript(logPaints);
  await page.reload();
  const previews = () => page.frames().filter((frame) => frame.url().includes("/view/"));
  await expect.poll(() => previews().length).toBeGreaterThan(0);
  for (const frame of [page.mainFrame(), ...previews()]) {
    // Painted: an iframe is shown once Huet has painted it.
    await expect.poll(() => frame.evaluate(() => document.documentElement.style.visibility)).toBe("");
    await expect.poll(() => frame.evaluate(() => window.__paints?.length ?? 0)).toBeGreaterThan(10);
    expect(await flashes(frame), frame.url()).toEqual([]);
  }
});
