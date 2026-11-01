import { test, expect, type Page } from "@playwright/test";

import { configurator, setPercent } from "./helpers/configurator";

async function open(page: Page) {
  await page.goto("/");
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

test("contrast button inverts the page colors", async ({ page }) => {
  const trigger = await open(page);
  // Light theme: dark button with light text
  await expect(trigger).toHaveCSS("background-color", "rgb(0, 0, 0)");
  await expect(trigger).toHaveCSS("color", "rgb(255, 255, 255)");

  await page.getByRole("combobox", { name: "Background", exact: true }).selectOption("0");
  // Dark page: light button with dark text
  await expect(trigger).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(trigger).toHaveCSS("color", "rgb(0, 0, 0)");
});

test("blended button only shows its border while open", async ({ page }) => {
  const trigger = await open(page);
  const style = page.getByLabel("Theme button");
  await style.selectOption("outlined");
  await expect(trigger).toHaveCSS("border-color", "rgb(0, 0, 0)");
  await style.selectOption("blended");
  await expect(trigger).toHaveCSS("border-color", "rgba(0, 0, 0, 0)");
  await trigger.click();
  await expect(trigger).toHaveCSS("border-color", "rgb(0, 0, 0)");
});

test("button hover adjusts its background", async ({ page }) => {
  const trigger = await open(page);
  for (const mode of ["contrast", "outlined", "blended"]) {
    await page.getByLabel("Theme button").selectOption(mode);
    await page.mouse.move(0, 0);
    const rest = await trigger.evaluate((el) => getComputedStyle(el).backgroundColor);
    await trigger.hover();
    await expect(trigger, mode).not.toHaveCSS("background-color", rest);
  }
});

for (const mode of ["contrast", "outlined"]) {
  test(`${mode} mini map lists colors from highest to lowest contrast`, async ({
    page,
  }) => {
    const trigger = await open(page);
    await page.getByLabel("Theme button").selectOption(mode);
    await page.mouse.move(0, 0);

    const ratios = await trigger.evaluate((button) => {
      const luminance = (rgb: string) => {
        const [r, g, b] = rgb.match(/\d+/g)!.slice(0, 3).map((v) => {
          const c = Number(v) / 255;
          return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      // The mini map is drawn for the button's fill, or else the theme's page
      const own = getComputedStyle(button).backgroundColor;
      const surface = luminance(
        own === "rgba(0, 0, 0, 0)"
          ? getComputedStyle(document.querySelector("#page")!).backgroundColor
          : own
      );
      return [...button.querySelectorAll("[title]")].map((dot) => {
        const l = luminance(getComputedStyle(dot).backgroundColor);
        return (Math.max(l, surface) + 0.05) / (Math.min(l, surface) + 0.05);
      });
    });

    expect(ratios.length).toBeGreaterThan(1);
    expect(ratios).toEqual([...ratios].sort((a, b) => b - a));
  });
}
