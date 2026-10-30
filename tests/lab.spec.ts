import { test, expect } from "@playwright/test";
import baseThemeConfig from "../packages/huet/src/private/baseThemeConfig";
import { contrast } from "../packages/huet/src/core/color";
/** Unsigned APCA Lc of a computed CSS color on another. */
const lc = (background: string, color: string) => {
  const hex = (value: string) => value.startsWith("#") ? value : "#" + value.match(/[\d.]+/g)!.slice(0, 3)
    .map((n) => Math.round(Number(n)).toString(16).padStart(2, "0")).join("");
  return contrast(hex(background), hex(color));
};
const screenshots = process.env.HUET_SCREENSHOTS ?? "test-results/screenshots";

test("gray controls, focus, inheritance, live themes and mobile layout", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/lab.html");
  for (const preset of [
    "gray49",
    "gray51",
    "light",
    "dark",
    "blue",
    "paper",
    "soft",
  ]) {
    await page.locator("#preset").selectOption(preset);
    await expect(page.locator("#metrics")).toContainText("Root text");
    const checks = await page.evaluate(() => {
      const bg = (el: Element): string => {
        const color = getComputedStyle(el).backgroundColor;
        return color === "rgba(0, 0, 0, 0)" && el.parentElement
          ? bg(el.parentElement)
          : color;
      };
      return [
        ...document.querySelectorAll(
          "#themed input,#themed select,#themed button,#themed .huet-muted,#themed .feedback,#themed .chip",
        ),
      ].map((el) => {
        const s = getComputedStyle(el);
        return {
          tag: el.tagName,
          class: el.className,
          color: s.color,
          borderColor: s.borderColor,
          background: bg(el),
          parent: bg(el.parentElement!),
          // The surface's text, which is as far as its roles can go (up to Lc 90).
          foreground: s.getPropertyValue("--huet-foreground").trim(),
        };
      });
    });
    if (["gray49", "gray51", "light", "dark", "blue", "paper"].includes(preset))
      for (const row of checks) {
        // Text reaches at least the muted share (⅔) of the surface's text contrast,
        // and borders the border share (⅓), against the surface and its parent.
        const text = lc(row.background, row.foreground);
        expect(
          lc(row.background, row.color),
          `${preset} ${JSON.stringify(row)}`,
        ).toBeGreaterThanOrEqual((text * 2) / 3 - 0.5);
        if (row.tag === "INPUT" || row.tag === "SELECT") {
          expect(lc(row.background, row.borderColor), `${preset} border`).toBeGreaterThanOrEqual(text / 3 - 0.5);
          expect(lc(row.parent, row.borderColor), `${preset} outer border`).toBeGreaterThanOrEqual(text / 3 - 0.5);
        }
      }
    await page.screenshot({
      path: `${screenshots}/lab-${preset}.png`,
      fullPage: true,
    });
  }
  await page.locator("#preset").selectOption("gray49");
  await page.getByLabel("Workspace name").fill("An unsaved edit");
  await page.getByLabel("Workspace name").focus();
  await expect(page.getByLabel("Workspace name")).toHaveCSS(
    "outline-style",
    "solid",
  );
  await page.screenshot({
    path: `${screenshots}/lab-focus.png`,
    fullPage: true,
  });
  await page.locator("#preset").selectOption("blue");
  await expect(page.getByLabel("Workspace name")).toHaveValue(
    "An unsaved edit",
  );
  await page.getByRole("button", { name: "Add a nested surface" }).click();
  await expect(page.getByText("Inserted after mount")).toBeVisible();
  await expect(page.locator("#added>div")).toHaveAttribute(
    "style",
    /--huet-background/,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.screenshot({
    path: `${screenshots}/lab-mobile.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("original React form and alerts after the color fixes", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Form", exact: true }),
  ).toBeVisible();
  for (const value of [0.49, 0.51]) {
    await page.evaluate(
      (config) => localStorage.setItem("huet:theme", JSON.stringify(config)),
      {
        ...baseThemeConfig,
        bgRampValue: value,
        name: `Gray ${Math.round(value * 100)}%`,
      },
    );
    await page.reload();
    await page
      .getByRole("heading", { name: "Form", exact: true })
      .scrollIntoViewIfNeeded();
    await page.evaluate(() =>
      [...document.querySelectorAll("h2")]
        .find((x) => x.textContent === "Form")!
        .scrollIntoView(),
    );
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({
      path: `${screenshots}/legacy-${Math.round(value * 100)}-after.png`,
    });
    const alerts = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Alert", exact: true }),
    });
    await alerts.screenshot({
      path: `${screenshots}/legacy-alerts-${Math.round(value * 100)}.png`,
    });
    // Feedback stays unboxed; only its computed color changes.
    await expect(page.getByText("Invalid email", { exact: true })).toHaveCSS(
      "background-color", "rgba(0, 0, 0, 0)",
    );

  }
});

test("large trees update surface variables without replacing content", async ({
  page,
}) => {
  await page.goto("/lab.html");
  const result = await page.evaluate(async () => {
    const modulePath = "/packages/huet/src/core/index.ts";
    const { createTheme, mountTheme } = await import(modulePath);
    const root = document.createElement("div");
    for (let i = 0; i < 1000; i++) {
      const surface = document.createElement("div");
      surface.className = "huet-surface-10";
      for (let j = 0; j < 10; j++)
        surface.append(document.createElement("span"));
      root.append(surface);
    }
    document.body.append(root);
    const first = root.firstElementChild;
    const mount = mountTheme(root, createTheme());
    const start = performance.now();
    mount.update(createTheme({ background: 0 }));
    const elapsed = performance.now() - start;
    const unchanged =
      first === root.firstElementChild &&
      root.querySelectorAll("span").length === 10000;
    const background = (first as HTMLElement).style.getPropertyValue(
      "--huet-background",
    );
    mount.destroy();
    root.remove();
    return { elapsed, unchanged, background };
  });
  expect(result.unchanged).toBe(true);
  expect(result.background).not.toBe("");
  console.log("1000 surfaces / 10000 text elements:", result);
});

test("semantic colors stay on one side while the background slider moves", async ({ page }) => {
  await page.goto("/lab.html");
  for (const preset of ["light", "blue", "paper"]) {
    await page.locator("#preset").selectOption(preset);
    const failures = await page.evaluate(() => {
      const lum = (color: string) => {
        const [r, g, b] = color.match(/[\d.]+/g)!.slice(0, 3).map(Number)
          .map(x => x / 255).map(x => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
        return .2126 * r + .7152 * g + .0722 * b;
      };
      const failures: number[] = [];
      const slider = document.querySelector<HTMLInputElement>("#position")!;
      for (let i = 0; i <= 100; i++) {
        slider.value = String(i);
        slider.dispatchEvent(new Event("input", { bubbles: true }));
        const bg = lum(getComputedStyle(document.querySelector("#themed")!).backgroundColor);
        const values = [
          ...[...document.querySelectorAll(".signals .chip")].map(el => lum(getComputedStyle(el).backgroundColor)),
          ...[...document.querySelectorAll(".signals p span")].map(el => lum(getComputedStyle(el).color)),
        ];
        if (values.some(x => x > bg) && values.some(x => x < bg)) failures.push(i);
      }
      return failures;
    });
    expect(failures, preset).toEqual([]);
  }
});
