import { test, expect } from "@playwright/test";
import { openConfigurator } from "./helpers/configurator";

test("image controls recolor, persist and restore originals", async ({ page }) => {
  await page.goto("/images.html");
  const dialog = await openConfigurator(page, "Edit Theme");
  const toggle = dialog.getByRole("checkbox", { name: "Theme images", exact: true });
  // Themes without image settings recolor images.
  await expect(toggle).toBeChecked();
  const tint = dialog.getByRole("slider", { name: "Image tint", exact: true });
  const strength = dialog.getByRole("slider", { name: "Image strength", exact: true });
  await tint.fill("65");
  await strength.fill("80");
  await expect(page.locator("img[data-huet-recolored] + canvas").first()).toBeVisible();
  await strength.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "docs/screenshots/configurator-images-enabled.png" });
  await page.reload();
  const restored = await openConfigurator(page, "Edit Theme");
  await expect(restored.getByRole("slider", { name: "Image tint", exact: true })).toHaveValue("65");
  await expect(restored.getByRole("slider", { name: "Image strength", exact: true })).toHaveValue("80");
  await restored.getByRole("checkbox", { name: "Theme images", exact: true }).uncheck();
  await expect(page.locator("#page canvas")).toHaveCount(0);
  await expect(restored.getByRole("slider", { name: "Image tint", exact: true })).toHaveCount(0);
  await page.screenshot({ path: "docs/screenshots/configurator-images-disabled.png" });
});
