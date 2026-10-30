import { test, expect, type Page } from "@playwright/test";
import { toOklab, contrastRatio, luminance } from "../packages/huet/src/core/color";
import { writeFileSync } from "node:fs";
import baseThemeConfig from "../packages/huet/src/private/baseThemeConfig";
const screenshots = process.env.HUET_SCREENSHOTS ?? "test-results/screenshots";
const rampButton = (page: Page, ramp: string) =>
  page.getByRole("group", { name: "Background ramp" }).getByRole("button", { name: ramp, exact: true });

test("Color Contrast forms retain hue and scale low-strength fills", async ({ page }) => {
  await page.setViewportSize({ width: 2000, height: 1100 });
  await page.goto("/color-contrast");
  const results = [];
  for (const position of [1, .75, .25, 0]) {
    await page.evaluate(config => {
      localStorage.setItem("huet:theme", JSON.stringify(config));
    }, { ...baseThemeConfig, bgRampValue: position, contrastMultiplier: 1 });
    await page.reload();
    await expect(page.getByRole("button", { name: "Submit", exact: true })).toHaveCount(24);
    const form = page.locator("[data-form-example]");
    const colors = await form.evaluate(el => {
      const hex = (value: string) => "#" + value.match(/[\d.]+/g)!.slice(0, 3)
        .map(Number).map(n => n.toString(16).padStart(2, "0")).join("");
      return [...el.children].map(column => ({
        background: hex(getComputedStyle(column).backgroundColor),
        borders: [...column.querySelectorAll("input")].map(input => hex(getComputedStyle(input).borderColor)),
        fills: [...column.querySelectorAll("button")].map(button => hex(getComputedStyle(button).backgroundColor)),
      }));
    });
    for (const column of colors) {
      for (let i = 1; i < column.borders.length; i++) {
        const [, a, b] = toOklab(column.borders[i]);
        expect(Math.hypot(a, b), JSON.stringify(column)).toBeGreaterThan(.035);
        const fraction = Math.log(contrastRatio(column.background, column.fills[i])) /
          Math.log(contrastRatio(column.background, column.borders[i]));
        expect(fraction).toBeGreaterThan(.10);
        expect(fraction).toBeLessThan(.14);
      }
    }
    results.push({ position, columns: colors.map(c => ({
      ...c, semanticContrast: c.borders.slice(1).map(color => contrastRatio(c.background, color)),
    })) });
    await form.screenshot({ path: screenshots + "/contrast-" + position * 100 + "-after.png" });
  }
  writeFileSync(screenshots + "/contrast-measurements.json", JSON.stringify(results, null, 2));
});

test("both existing signal-lightness sliders affect the rendered form", async ({ page }) => {
  await page.goto("/color-contrast");
  await page.getByText("Edit Theme", { exact: true }).click();
  const form = page.locator("[data-form-example]");
  for (const [label, index] of [["Signal Lightness on 'White'", 0], ["Signal Lightness on 'Black'", 3]] as const) {
    const red = form.locator(":scope > div").nth(index).locator("input").nth(1);
    const slider = page.getByRole("slider", { name: label, exact: true });
    const set = async (value: string) => {
      await slider.evaluate((element, value) => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(element, value);
        element.dispatchEvent(new Event("input", { bubbles: true }));
      }, value);
      await expect(slider).toHaveValue(value);
    };
    await set("0.3");
    const first = await red.evaluate(el => getComputedStyle(el).borderColor);
    await set("0.7");
    await expect.poll(() => red.evaluate(el => getComputedStyle(el).borderColor)).not.toBe(first);
  }
});

test("gray cells blend with each selected colored background ramp", async ({ page }) => {
  await page.setViewportSize({ width: 2000, height: 1100 });
  await page.goto("/color-contrast");
  await expect(page.locator("[data-row]")).toHaveCount(6);
  for (const hue of ["red", "yellow", "green", "blue", "purple"]) {
    await rampButton(page, hue).click();
    await expect(rampButton(page, hue)).toHaveAttribute("aria-pressed", "true");
    const cells = await page.locator('[data-row="20"]')
      .evaluate(row => {
        const hex = (v: string) => "#" + v.match(/[\d.]+/g)!.slice(0, 3)
          .map(Number).map(n => n.toString(16).padStart(2, "0")).join("");
        const tiles = [...row.querySelectorAll("[data-swatch]")];
        return {
          background: hex(getComputedStyle(row).backgroundColor),
          zero: hex(getComputedStyle(tiles[0]).backgroundColor),
          gray20: hex(getComputedStyle(tiles[1]).backgroundColor),
          gray100: hex(getComputedStyle(tiles[5]).backgroundColor),
        };
      });
    expect(cells.zero, hue).toBe(cells.background);
    const [, a, b] = toOklab(cells.background);
    const [, x, y] = toOklab(cells.gray20);
    expect(Math.hypot(x, y), hue).toBeGreaterThan(.005);
    expect(Math.abs(Math.atan2(a * y - b * x, a * x + b * y)), hue).toBeLessThan(.15);
    expect(["#000000", "#ffffff"]).toContain(cells.gray100);
    if (hue === "blue")
      await page.locator("[data-matrix]")
        .screenshot({ path: screenshots + "/ramp-blue-neutral-after.png" });
  }
});

test("matching gray and blue ramps keep distinct evenly spaced steps in middle rows", async ({ page }) => {
  await page.setViewportSize({ width: 2000, height: 1100 });
  await page.goto("/color-contrast");
  await expect(page.locator("[data-row]")).toHaveCount(6);
  for (const [name, index] of [["gray", 0], ["blue", 4]] as const) {
    await rampButton(page, name).click();
    await expect(rampButton(page, name)).toHaveAttribute("aria-pressed", "true");
    for (const amount of [40, 60]) {
      const colors = await page.locator(`[data-row="${amount}"]`)
        .evaluate((row, index) => {
          const hex = (v: string) => "#" + v.match(/[\d.]+/g)!.slice(0, 3)
            .map(Number).map(n => n.toString(16).padStart(2, "0")).join("");
          return [...row.querySelectorAll("[data-swatch]")].slice(index * 6, (index + 1) * 6)
            .map(el => hex(getComputedStyle(el).backgroundColor));
        }, index);
      expect(new Set(colors).size, name + " " + amount).toBe(6);
      const full = contrastRatio(colors[0], colors[5]);
      for (let step = 0; step < 6; step++) {
        const progress = Math.log(contrastRatio(colors[0], colors[step])) / Math.log(full);
        expect(Math.abs(progress - step / 5)).toBeLessThan(.025);
      }
    }
    await page.locator("[data-matrix]")
      .screenshot({ path: screenshots + "/ramp-" + name + "-spacing-after.png" });
  }
});

test("contrast slider fades nested form colors without polarity flips", async ({ page }) => {
  await page.goto("/color-contrast");
  await page.getByText("Edit Theme", { exact: true }).click();
  const slider = page.getByRole("slider", { name: "Contrast", exact: true });
  const form = page.locator("[data-form-example]");
  const set = async (amount: number) => {
    await slider.evaluate((el, value) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(el, value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }, String(amount));
    await expect(slider).toHaveValue(String(amount));
  };
  const read = () => form.evaluate(el => {
    const hex = (value: string) => "#" + value.match(/[\d.]+/g)!.slice(0, 3)
      .map(Number).map(n => n.toString(16).padStart(2, "0")).join("");
    return [...el.children].flatMap(column => [
      hex(getComputedStyle(column).backgroundColor),
      ...[...column.querySelectorAll("input, button")].flatMap(element => {
        const style = getComputedStyle(element);
        return [style.color, style.borderColor, style.backgroundColor]
          .filter(value => !value.includes("rgba")).map(hex);
      }),
    ]);
  });
  await set(1);
  const enabled = await read();
  await set(0);
  const origin = await read();
  for (const amount of [.1, .25, .4, .5, .6, .75, .9, 1, .9, .75, .6, .5, .4, .25, .1, 0]) {
    await set(amount);
    const colors = await read();
    expect(colors).toHaveLength(enabled.length);
    colors.forEach((color, index) => {
      const expected = luminance(origin[index]) * (1 - amount) + luminance(enabled[index]) * amount;
      expect(Math.abs(luminance(color) - expected), `contrast ${amount}, color ${index}`).toBeLessThan(.005);
    });
  }
});
