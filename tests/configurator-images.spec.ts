import { test, expect } from "@playwright/test";
import { openConfigurator, openSettings, setPercent } from "./helpers/configurator";

test("image controls recolor, persist and restore originals", async ({ page }) => {
  await page.goto("/images.html");
  const dialog = await openConfigurator(page, "Edit Theme");
  const toggle = dialog.getByRole("switch", { name: "Theme images", exact: true });
  // Themes without image settings recolor images.
  await expect(toggle).toBeChecked();
  await setPercent(page, "Theme images settings", "Tint", 65);
  await setPercent(page, "Theme images settings", "Strength", 80);
  await expect(page.locator("img[data-huet-recolored] + canvas").first()).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/configurator-images-enabled.png" });
  await page.reload();
  const restored = await openConfigurator(page, "Edit Theme");
  const settings = await openSettings(page, "Theme images settings");
  await expect(settings.getByRole("textbox", { name: "Tint", exact: true })).toHaveValue("65");
  await expect(settings.getByRole("textbox", { name: "Strength", exact: true })).toHaveValue("80");
  await page.keyboard.press("Escape");
  await restored.getByRole("switch", { name: "Theme images", exact: true }).uncheck();
  await expect(page.locator("#page canvas")).toHaveCount(0);
  // Off: no tint or strength to set
  await expect(restored.getByRole("button", { name: /^Theme images settings/ })).toHaveCount(0);
  await page.screenshot({ path: "docs/screenshots/configurator-images-disabled.png" });
});

test("the SVG switch recolors inline SVGs on its own and restores their paints", async ({ page }) => {
  await page.goto("/images.html");
  const sun = page.locator("#landscape circle");
  await expect(sun).toHaveAttribute("fill", /^rgb\(/);
  const dialog = await openConfigurator(page, "Edit Theme");
  // Turning image theming off leaves SVGs themed.
  await dialog.getByRole("switch", { name: "Theme images", exact: true }).uncheck();
  await expect(sun).toHaveAttribute("fill", /^rgb\(/);
  const toggle = dialog.getByRole("switch", { name: "Theme SVGs", exact: true });
  await expect(toggle).toBeChecked();
  await setPercent(page, "Theme SVGs settings", "Strength", 40);
  await page.reload();
  const restored = await openConfigurator(page, "Edit Theme");
  const settings = await openSettings(page, "Theme SVGs settings");
  await expect(settings.getByRole("textbox", { name: "Strength", exact: true })).toHaveValue("40");
  await page.keyboard.press("Escape");
  await restored.getByRole("switch", { name: "Theme SVGs", exact: true }).uncheck();
  await expect(sun).toHaveAttribute("fill", "#f4b400");
  await expect(restored.getByRole("button", { name: /^Theme SVGs settings/ })).toHaveCount(0);
  await page.locator("#landscape").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "docs/screenshots/configurator-svgs-disabled.png" });
});
