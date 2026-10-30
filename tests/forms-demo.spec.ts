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
  // Black text mixed 45% over white
  const faded = "color(srgb 0.55 0.55 0.55)";
  expect(await color("Express")).toBe("rgb(0, 0, 0)");
  expect(await color("Drone (disabled)")).toBe(faded);
  // The radio inherits the faded color rather than fading it again
  await expect(drone).toHaveCSS("color", faded);
  await expect(page.locator("form button[type=button][disabled]")).toHaveCSS("color", faded);
});

test("disabled fields keep a faded outline, and disabled sliders keep their fill stronger than the track", async ({ page }) => {
  const toggle = await open(page);
  await toggle.click();
  const field = page.locator("form label", { hasText: "Disabled" }).locator("input[type=text]");
  await expect(field).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(field).not.toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
  for (const theme of ["Base", "Orange Boost"]) {
    await page.getByRole("button", { name: /^Theme:/ }).click();
    await page.getByRole("dialog").getByRole("button", { name: theme, exact: true }).click();
    await page.reload();
    await expect(page.locator("h1[data-theme-name]")).toHaveText(theme);
    const [fill, track, background] = await page.locator("form input[type=range][disabled]").evaluate((el) => {
      // Resolve a color expression the way the browser paints it
      const resolve = (value: string) => {
        const probe = document.createElement("span");
        probe.style.color = value;
        el.parentElement!.append(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        return color;
      };
      const style = getComputedStyle(el);
      return [style.color, resolve(style.getPropertyValue("--_line")), resolve(style.getPropertyValue("--huet-background"))];
    });
    expect(contrast(fill, background), `${theme} fill ${fill}, track ${track}`).toBeGreaterThan(contrast(track, background));
  }
});

/** WCAG contrast of two computed colors, rgb() or color(srgb …) */
function contrast(a: string, b: string) {
  const luminance = (color: string) => {
    const [r, g, bl] = color.startsWith("color(")
      ? color.slice(11, -1).split(" ").map(Number)
      : color.slice(color.indexOf("(") + 1, -1).split(",").map((x) => Number(x) / 255);
    const linear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(bl);
  };
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

function hexToRgb(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.trim().slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}
