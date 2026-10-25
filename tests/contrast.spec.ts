import { test, expect } from "@playwright/test";
import { toOklab, contrastRatio } from "../src/core/color";
import { writeFileSync } from "node:fs";
const screenshots = process.env.HUET_SCREENSHOTS ?? "test-results/screenshots";

test("Color Contrast forms retain hue and scale low-strength fills", async ({ page }) => {
  await page.setViewportSize({ width: 2000, height: 1100 });
  await page.goto("/");
  await expect.poll(() => page.evaluate(() =>
    Object.values(localStorage).some(v => { try { return !!JSON.parse(v)?.pallet; } catch { return false; } }),
  )).toBe(true);
  const results = [];
  for (const position of [1, .75, .25, 0]) {
    await page.evaluate(position => {
      for (const [key, value] of Object.entries(localStorage)) {
        try {
          const config = JSON.parse(value);
          if (config?.pallet && config.bgRamp) {
            config.bgRampValue = position;
            config.contrastMultiplier = 1;
            localStorage.setItem(key, JSON.stringify(config));
          }
        } catch {}
      }
    }, position);
    await page.reload();
    await page.locator("select").first().selectOption("colorContrast");
    await expect(page.getByRole("button", { name: "Submit", exact: true })).toHaveCount(24);
    const form = page.locator('div[style*="overflow: scroll"]');
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
  await page.goto("/");
  await page.locator("select").first().selectOption("colorContrast");
  await page.getByText("Edit Theme", { exact: true }).click();
  const form = page.locator('div[style*="overflow: scroll"]');
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
