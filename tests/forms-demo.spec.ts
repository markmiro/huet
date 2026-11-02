import { expect, test, type Page } from "@playwright/test";
import { contrast as apcaContrast } from "../packages/huet/src/core/color";

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

  // On a dark page background
  await page.getByRole("combobox", { name: "Background", exact: true }).selectOption("0");
  await expect(page.getByLabel("Checked", { exact: true })).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(inverted.getByLabel("Starred")).toHaveCSS("background-color", "rgb(0, 0, 0)");
});

test("disabled controls fade along with their labels, once", async ({ page }) => {
  const toggle = await open(page);
  await toggle.click();
  const color = (text: string) => page.locator("label", { hasText: text }).evaluate((el) => getComputedStyle(el).color);
  const drone = page.getByLabel("Drone (disabled)");
  // The page's disabled text color, which the solver writes next to --huet-muted
  const faded = hexToRgb(await css(page, "#page", "--huet-disabled"));
  expect(await color("Express")).toBe("rgb(0, 0, 0)");
  expect(await color("Drone (disabled)")).toBe(faded);
  // The radio inherits the faded color rather than fading it again
  await expect(drone).toHaveCSS("color", faded);
  await expect(page.locator("form button[type=button][disabled]").first()).toHaveCSS("color", faded);
});

test("disabled text and lines keep the same share of their Lc on light and dark surfaces", async ({ page }) => {
  const toggle = await open(page);
  await toggle.click();
  for (const theme of ["Base", "Orange Boost"]) {
    if (theme !== "Base") {
      await page.getByRole("button", { name: /^Theme:/ }).click();
      await page.getByRole("dialog").getByRole("button", { name: theme, exact: true }).click();
      await page.reload();
      await expect(page.locator("h1[data-theme-name]")).toHaveText(theme);
    }
    // Disabled text and lines as a share of the enabled ones' Lc, and their own Lc,
    // on the page, an inverted surface and a blue one
    const shares: Record<string, number[][]> = {};
    for (const background of ["1", "0"]) {
      await page.getByRole("combobox", { name: "Background", exact: true }).selectOption(background);
      for (const scope of ["form > section", "fieldset.huet-bg-100", "fieldset.huet-bg-blue-20"]) {
        const [bg, enabledText, text, line, enabledLine] = await page.locator(scope).filter({ has: page.locator("input[type=text][disabled]") }).first().evaluate((el) => {
          const surface = el.closest("[data-huet-color-bg], #page")!;
          const field = el.querySelector("input[type=text][disabled]")!;
          const enabled = el.querySelector("input[type=text]:not([disabled])")!;
          const style = (x: Element) => getComputedStyle(x);
          return [style(surface).getPropertyValue("--huet-background"), style(enabled.closest("label")!).color,
            style(field.closest("label")!).color, style(field).borderTopColor, style(enabled).borderTopColor];
        });
        const [lc, lcText, lcLine, lcEnabledLine] = [enabledText, text, line, enabledLine].map((x) => contrast(x.trim(), bg.trim()));
        (shares[scope] ??= []).push([lcText / lc, lcLine / lcEnabledLine, lcText, lcLine]);
      }
    }
    for (const [scope, [light, dark]] of Object.entries(shares)) {
      const message = `${theme} ${scope}: light ${light}, dark ${dark}`;
      // Text keeps Lc 45 of the foreground's 90, which is 42% of the endpoint's Lc 107
      for (const [text, line] of [light, dark]) {
        expect(text, message).toBeGreaterThan(0.4);
        expect(text, message).toBeLessThan(0.55);
        expect(line, message).toBeCloseTo(0.5, 1);
      }
      // The same Lc whether the surface is light or dark. (A 55% sRGB mix gave
      // Base's disabled text Lc 73 on white and Lc 41 on black.)
      expect(Math.abs(light[2] - dark[2]), message).toBeLessThan(2);
      expect(Math.abs(light[3] - dark[3]), message).toBeLessThan(1);
    }
  }
});

test("disabled fields keep a faded outline, and disabled sliders keep their fill stronger than the track", async ({ page }) => {
  const toggle = await open(page);
  await toggle.click();
  const field = page.getByRole("textbox", { name: "Disabled", exact: true });
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

/** APCA contrast (unsigned Lc) of a computed color on a background, rgb() or color(srgb …) */
function contrast(color: string, background: string) {
  const hex = (value: string) => {
    if (value.startsWith("#")) return value;
    const channels = value.startsWith("color(")
      ? value.slice(11, -1).split(" ").map(Number)
      : value.slice(value.indexOf("(") + 1, -1).split(",").map((x) => Number(x) / 255);
    return "#" + channels.slice(0, 3).map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
  };
  return apcaContrast(hex(background), hex(color));
}

function hexToRgb(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.trim().slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}
