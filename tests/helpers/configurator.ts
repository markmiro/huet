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
  await dialog.getByRole("tab", { name: tab, exact: true }).click();
  return dialog;
}

/**
 * Opens one of the Edit Theme tab's "⋯" settings popovers, such as
 * "Blending and contrast", if it isn't already, and returns it.
 */
export async function openSettings(page: Page, label: string) {
  const popover = page.getByRole("dialog", { name: label, exact: true });
  if (!(await popover.isVisible()))
    await configurator(page).getByRole("button", { name: new RegExp(`^${label}`) }).click();
  return popover;
}

/** Types `percent` into a settings number field, such as Contrast. */
export async function setPercent(page: Page, popoverLabel: string, field: string, percent: number) {
  const popover = await openSettings(page, popoverLabel);
  const input = popover.getByRole("textbox", { name: field, exact: true });
  await input.fill(String(percent));
  await input.press("Enter");
}

/** Picks a saved theme from the configurator's Themes tab. */
export async function pickTheme(page: Page, name: string) {
  const dialog = await openConfigurator(page);
  await dialog.getByRole("button", { name, exact: true }).click();
}
