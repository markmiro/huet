import { test, expect, type FrameLocator, type Page } from "@playwright/test";
import chroma from "chroma-js";

import { contrast } from "../../packages/huet/src/core/color";
import { themes } from "../../packages/huet/src/core/themes";
import type { Theme } from "../../packages/huet/src/core/theme";

/**
 * /create previews the picked theme (accent) and chart color in an iframe.
 * Huet keeps each pick's hue and chroma, on a ramp between the theme's ends,
 * and picks the lightness itself.
 */

/** Opens /create with a saved Huet theme, then picks `picks` in the customizer, such as { Theme: "Blue" }. */
async function openCreate(page: Page, theme: Theme, background: number, picks: Record<string, string>) {
  await page.goto("/create");
  await page.evaluate(
    ([theme, background]) => {
      localStorage.setItem("huet-shadcn", JSON.stringify({ theme, background }));
      localStorage.setItem("shadcn-create-welcome-dialog", "true");
    },
    [theme, background] as const,
  );
  await page.reload();
  const frame = page.frameLocator("iframe").first();
  await frame.locator("#design-system-theme-vars").waitFor({ state: "attached" });
  await frame.locator("#huet-charts").waitFor({ state: "attached" });
  for (const [picker, value] of Object.entries(picks)) await pick(page, picker, value);
  return frame;
}

async function pick(page: Page, picker: string, value: string) {
  await page.locator("[data-slot=dropdown-menu-trigger]", { hasText: picker }).first().click();
  await page.getByRole("menuitemradio", { name: value, exact: true }).click();
  await page.keyboard.press("Escape");
}

const vars = (frame: FrameLocator, names: string[]) =>
  frame.locator("html").evaluate(
    (html, names) => Object.fromEntries(names.map((name) => [name, getComputedStyle(html).getPropertyValue(name).trim()])),
    names,
  );
const charts = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"];
const hue = (color: string) => chroma(color).oklch()[2];
const chromaOf = (color: string) => chroma(color).oklch()[1];
const lightness = (color: string) => chroma(color).oklch()[0];

/** Hue within `range` degrees of `center`, around the wheel. */
const near = (color: string, center: number, range: number) =>
  Math.abs(((hue(color) - center + 540) % 360) - 180) <= range;

test("the picked theme color becomes a readable primary in its own hue", async ({ page }) => {
  for (const background of [1, 0]) {
    const frame = await openCreate(page, themes.Base, background, { Theme: "Blue" });
    await expect.poll(async () => near((await vars(frame, ["--primary"]))["--primary"], 264, 25)).toBe(true);
    const v = await vars(frame, ["--primary", "--primary-foreground", "--background", "--foreground", "--sidebar-primary"]);
    expect(chromaOf(v["--primary"]), `${v["--primary"]} on background ${background}`).toBeGreaterThan(0.06);
    expect(v["--sidebar-primary"]).toBe(v["--primary"]);
    // Page-colored text reads on it
    expect(v["--primary-foreground"]).toBe(v["--background"]);
    expect(contrast(chroma(v["--primary"]).hex(), chroma(v["--primary-foreground"]).hex())).toBeGreaterThanOrEqual(74);
    // Lighter on a dark page, darker on a light one
    if (background === 0) expect(lightness(v["--primary"])).toBeGreaterThan(0.6);
    else expect(lightness(v["--primary"])).toBeLessThan(0.6);
  }
});

test("a gray theme keeps primary as the max-contrast invert, and Bold menus use the accent", async ({ page }) => {
  const frame = await openCreate(page, themes.Base, 1, { Theme: "Neutral" });
  const gray = await vars(frame, ["--primary", "--foreground"]);
  expect(gray["--primary"]).toBe(gray["--foreground"]);

  await pick(page, "Theme", "Rose");
  await pick(page, "Menu Accent", "Bold");
  await expect.poll(async () => near((await vars(frame, ["--accent"]))["--accent"], 15, 30)).toBe(true);
  const bold = await vars(frame, ["--primary", "--accent", "--accent-foreground", "--background"]);
  expect(bold["--accent"]).toBe(bold["--primary"]);
  expect(bold["--accent-foreground"]).toBe(bold["--background"]);
});

test("the picked chart color spreads over readable steps in its own hue", async ({ page }) => {
  const frame = await openCreate(page, themes.Base, 1, { "Chart Color": "Amber" });
  await expect.poll(async () => near((await vars(frame, ["--chart-3"]))["--chart-3"], 60, 30)).toBe(true);
  const amber = await vars(frame, [...charts, "--background"]);
  for (const name of charts) {
    expect(near(amber[name], 60, 30), `${name} ${amber[name]} is amber`).toBe(true);
    expect(chromaOf(amber[name])).toBeGreaterThan(0.1);
  }
  // From text strength to large-graphics strength against the page, evenly
  const lc = charts.map((name) => contrast(amber["--background"], amber[name]));
  expect(lc[0]).toBeGreaterThanOrEqual(89);
  expect(lc[4]).toBeGreaterThanOrEqual(44);
  expect(lc[4]).toBeLessThan(50);
  for (let i = 1; i < lc.length; i++) expect(lc[i]).toBeLessThan(lc[i - 1] - 8);

  // Picking another chart color repaints the preview, at the same strengths
  await pick(page, "Chart Color", "Teal");
  await expect.poll(async () => near((await vars(frame, ["--chart-3"]))["--chart-3"], 185, 30)).toBe(true);
  const teal = await vars(frame, charts);
  charts.forEach((name, i) => expect(contrast(amber["--background"], teal[name])).toBeCloseTo(lc[i], -1));
});

test("a gray chart color takes the theme's own steps", async ({ page }) => {
  const frame = await openCreate(page, themes.Radioactive, 1, { "Chart Color": "Neutral" });
  await expect.poll(async () => {
    const v = await vars(frame, ["--chart-1", "--foreground"]);
    return v["--chart-1"] === v["--foreground"];
  }).toBe(true);
});

test("the Huet panel shows the picked accent and chart ramps", async ({ page }) => {
  await openCreate(page, themes.Base, 1, { Theme: "Violet", "Chart Color": "Amber" });
  const toggle = page.getByRole("button", { name: /Huet Theme Configurator/ });
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
  await page.getByRole("button", { name: "Edit Theme", exact: true }).click();
  const accent = page.locator("[data-ramp=Accent]");
  const chart = page.locator("[data-ramp=Chart]");
  await expect(accent).toBeVisible();
  // The theme's two ends and the picked colors: one accent, five chart colors
  await expect(accent.locator("[style*='left: calc']")).toHaveCount(3);
  await expect(chart.locator("[style*='left: calc']")).toHaveCount(7);
  // Picking another theme color moves the accent ramp's marker
  const marker = () => accent.locator("[style*='left: calc']").nth(1).evaluate((el) => getComputedStyle(el).backgroundColor);
  const violet = await marker();
  await pick(page, "Theme", "Emerald");
  await expect.poll(marker).not.toBe(violet);
});
