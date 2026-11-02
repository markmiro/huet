import { test, expect, type Page } from "@playwright/test";
import chroma from "chroma-js";

import { configurator, setPercent } from "./helpers/configurator";

async function open(page: Page) {
  await page.goto("/basic");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  return page.getByRole("button", { name: /^Theme:/ });
}

test("embedded configurator picks themes from its Themes tab", async ({ page }) => {
  const trigger = await open(page);
  await expect(trigger).toHaveAccessibleName("Theme: Base");
  await trigger.click();
  const popover = configurator(page);
  await expect(popover).toBeVisible();
  await expect(popover).toHaveCSS("border-color", "rgb(0, 0, 0)");

  // Each theme on the page's background; only the selected one has a strong edge
  const base = popover.getByRole("button", { name: "Base", exact: true });
  const terminal = popover.getByRole("button", { name: "Terminal" });
  await expect(terminal).toHaveCSS("background-color", "rgb(127, 255, 139)");
  await expect(base).toHaveCSS("border-color", "rgb(0, 0, 0)");

  await terminal.click();
  await expect(terminal).toHaveAttribute("aria-pressed", "true");
  await expect(trigger).toHaveAccessibleName("Theme: Terminal");
  // The page follows along
  await expect(page.locator("#page")).toHaveCSS("background-color", "rgb(127, 255, 139)");

  await page.keyboard.press("Escape");
  await expect(popover).toHaveCount(0);
});

test("the Edit Theme tab edits the current theme and the page's background", async ({ page }) => {
  const trigger = await open(page);
  await trigger.click();
  const popover = configurator(page);
  await popover.getByRole("tab", { name: "Edit Theme" }).click();
  // The background picker moves the page's background, not the theme
  await popover.getByRole("slider", { name: "Background" }).fill("0");
  await expect(page.locator("#page")).toHaveCSS("background-color", "rgb(0, 0, 0)");
  await expect(trigger).toHaveAccessibleName("Theme: Base");
  // Editing a color does change the theme
  await setPercent(page, "Blending and contrast", "Contrast", 50);
  await expect(trigger).toHaveAccessibleName("Theme: Custom");
});

test("outlined button has a full-contrast border, and hover tints it", async ({ page }) => {
  const trigger = await open(page);
  await expect(trigger).toHaveCSS("border-color", "rgb(0, 0, 0)");
  await page.mouse.move(0, 0);
  const rest = await trigger.evaluate((el) => getComputedStyle(el).backgroundColor);
  await trigger.hover();
  await expect(trigger).not.toHaveCSS("background-color", rest);
});

test("mini map lists colors from highest to lowest contrast", async ({ page }) => {
  const trigger = await open(page);
  await page.mouse.move(0, 0);

  const { surface, dots } = await trigger.evaluate((button) => ({
    // The outlined button has no fill, so its mini map is drawn for the page
    surface: getComputedStyle(document.querySelector("#page")!).backgroundColor,
    dots: [...button.querySelectorAll("[title]")].map((dot) => getComputedStyle(dot).backgroundColor),
  }));
  // Contrast here is distance in CIE L*, as the mini map sorts by
  const lightness = (color: string) => chroma(color).get("lab.l");
  const distances = dots.map((dot) => Math.abs(lightness(dot) - lightness(surface)));

  expect(distances.length).toBeGreaterThan(1);
  expect(distances).toEqual([...distances].sort((a, b) => b - a));
});

test("the header stays at the top, with the theme button at its right end", async ({ page }) => {
  const trigger = await open(page);
  const header = page.locator("#page > header");
  const right = async () => {
    const [h, t] = await Promise.all([header.boundingBox(), trigger.boundingBox()]);
    return h!.x + h!.width - (t!.x + t!.width);
  };
  // Only the wrapper's padding between the button and the header's edge
  expect(await right()).toBeLessThanOrEqual(8);
  await page.mouse.wheel(0, 2000);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(500);
  expect((await header.boundingBox())!.y).toBe(0);

  // The configurator opens from it and still edits the page
  await trigger.click();
  const popover = configurator(page);
  await expect(popover).toBeInViewport();
  await popover.getByRole("button", { name: "Terminal" }).click();
  await expect(page.locator("#page")).toHaveCSS("background-color", "rgb(127, 255, 139)");
});
