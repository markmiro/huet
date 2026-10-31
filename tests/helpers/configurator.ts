import type { Page } from "@playwright/test";

/** The configurator popover, opened from the header's theme button. */
export const configurator = (page: Page) =>
  page.getByRole("dialog", { name: "Theme Configurator" });

/** Opens the configurator popover, if it isn't already, on `tab`. */
export async function openConfigurator(
  page: Page,
  tab: "Themes" | "Edit Theme" = "Themes",
) {
  const dialog = configurator(page);
  if (!(await dialog.isVisible()))
    await page.getByRole("button", { name: /^Theme:/ }).click();
  await dialog.getByRole("button", { name: tab, exact: true }).click();
  return dialog;
}

/** Picks a saved theme from the configurator's Themes tab. */
export async function pickTheme(page: Page, name: string) {
  const dialog = await openConfigurator(page);
  await dialog.getByRole("button", { name, exact: true }).click();
}
