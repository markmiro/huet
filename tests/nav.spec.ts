import { test, expect } from "@playwright/test";

test("Website Examples swaps the nav's row for the sites, and Back swaps it back", async ({ page }) => {
  await page.goto("/basic");
  const nav = page.getByRole("navigation", { name: "Demos" });
  await expect(page.locator("header")).not.toContainText("Example Demos");
  await expect(nav.getByRole("link", { name: "Basic" })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "GitHub" })).toBeHidden();

  await nav.getByRole("button", { name: "Website Examples" }).click();
  await expect(nav.getByRole("link", { name: "Basic" })).toBeHidden();
  await expect(nav.getByRole("link", { name: "GitHub" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "YouTube" })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Back" })).toBeFocused();

  await nav.getByRole("button", { name: "Back" }).click();
  await expect(nav.getByRole("link", { name: "Basic" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "GitHub" })).toBeHidden();
  await expect(nav.getByRole("button", { name: "Website Examples" })).toBeFocused();

  // The sites are links to their own pages
  await nav.getByRole("button", { name: "Website Examples" }).click();
  await nav.getByRole("link", { name: "YouTube" }).click();
  await expect(page).toHaveURL(/\/youtube$/);
});

test("a site's page opens the nav on the sites", async ({ page }) => {
  await page.goto("/github");
  const nav = page.getByRole("navigation", { name: "Demos" });
  await expect(nav.getByRole("link", { name: "GitHub" })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Basic" })).toBeHidden();

  // Back to the main row, where Website Examples shows as the current section
  await nav.getByRole("button", { name: "Back" }).click();
  const websites = nav.getByRole("button", { name: "Website Examples" });
  await expect(websites).toHaveClass(/huet-bg-100/);
  await expect(nav.getByRole("link", { name: "Basic" })).not.toHaveAttribute("aria-current");
});
