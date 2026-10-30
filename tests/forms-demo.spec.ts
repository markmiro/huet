import { expect, test, type Page } from "@playwright/test";

async function open(page: Page) {
  await page.goto("/forms");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator("#page")).toHaveAttribute("data-huet-root", "");
  return page.getByRole("switch", { name: "Minimal styling" });
}

const css = (page: Page, selector: string, property: string) =>
  page.locator(selector).first().evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), property);

test("the toggle applies the minimal form styles and is remembered", async ({ page }) => {
  const toggle = await open(page);
  const form = page.locator("form[data-forms-demo]");
  await expect(toggle).not.toBeChecked();
  await expect(form).not.toHaveAttribute("data-huet-forms");
  await expect(page.getByLabel("Checked", { exact: true })).toHaveCSS("appearance", "auto");

  await toggle.click();
  await expect(form).toHaveAttribute("data-huet-forms", "");
  await expect(page.getByLabel("Checked", { exact: true })).toHaveCSS("appearance", "none");

  await page.reload();
  await expect(page.getByRole("switch", { name: "Minimal styling" })).toBeChecked();
  await expect(form).toHaveAttribute("data-huet-forms", "");
});

test("controls take their colors from the theme and the surface they're on", async ({ page }) => {
  const toggle = await open(page);
  await toggle.click();
  const border = await css(page, "#page", "--huet-border");
  // Lines use the surface's border color, fills use the text color
  await expect(page.getByLabel("Name", { exact: true })).toHaveCSS("border-top-color", hexToRgb(border));
  await expect(page.getByLabel("Checked", { exact: true })).toHaveCSS("background-color", "rgb(0, 0, 0)");
  await expect(page.getByLabel("Volume")).toHaveCSS("color", "rgb(0, 0, 0)");
  await expect(page.getByLabel("Email")).toHaveCSS("border-top-color", hexToRgb(await css(page, "#page", "--huet-red")));
  // A Huet text class recolors a control's fill
  const blue = page.getByLabel("Blue, from huet-text-blue-100").first();
  await expect(blue).not.toHaveCSS("background-color", "rgb(0, 0, 0)");

  // Inside an inverted surface, fills flip to white
  const inverted = page.locator("fieldset.huet-bg-100");
  await expect(inverted.getByLabel("Starred")).toHaveCSS("background-color", "rgb(255, 255, 255)");

  await page.getByRole("button", { name: /^Theme:/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Base Inverted" }).click();
  await expect(page.getByLabel("Checked", { exact: true })).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(inverted.getByLabel("Starred")).toHaveCSS("background-color", "rgb(0, 0, 0)");
});

test("disabled controls fade along with their labels, once", async ({ page }) => {
  const toggle = await open(page);
  await toggle.click();
  const color = (text: string) => page.locator("label", { hasText: text }).evaluate((el) => getComputedStyle(el).color);
  const drone = page.getByLabel("Drone (disabled)");
  // Black text mixed 35% over white
  const faded = "color(srgb 0.65 0.65 0.65)";
  expect(await color("Express")).toBe("rgb(0, 0, 0)");
  expect(await color("Drone (disabled)")).toBe(faded);
  // The radio inherits the faded color rather than fading it again
  await expect(drone).toHaveCSS("color", faded);
  await expect(page.locator("form button[type=button][disabled]")).toHaveCSS("color", faded);
});

function hexToRgb(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.trim().slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}
