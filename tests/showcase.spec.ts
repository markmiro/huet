import { test, expect, type Page } from "@playwright/test";

import { contrast } from "../packages/huet/src/core/color";
import { themes } from "../packages/huet/src/core/themes";
import type { Theme } from "../packages/huet/src/core/theme";

/** Loads `path` with `theme` saved, once Huet's shadcn adapter has painted it. */
async function open(page: Page, path: string, theme: Theme, background: number) {
  await page.goto(path);
  await page.evaluate(
    ([theme, background]) => localStorage.setItem("huet-demo:theme", JSON.stringify({ theme, background })),
    [theme, background] as const,
  );
  await page.reload();
  await page.waitForFunction(
    () => document.getElementById("huet-charts") && document.getElementById("page")?.hasAttribute("data-huet-root"),
  );
}

/** An element's computed color property as #rrggbb, through a canvas so oklab() and color-mix() resolve. */
const hexOf = (page: Page, selector: string, property: "backgroundColor" | "color" | "fill") =>
  page
    .locator(selector)
    .first()
    .evaluate((el, property) => {
      const context = document.createElement("canvas").getContext("2d")!;
      context.fillStyle = getComputedStyle(el)[property];
      context.fillRect(0, 0, 1, 1);
      const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
      return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
    }, property);

test("the home page fits every lead card on a 14-inch laptop screen", async ({ page }) => {
  // A 14-inch MacBook Pro's browser window, inside the menu bar and toolbar
  await page.setViewportSize({ width: 1512, height: 860 });
  await open(page, "/", themes.Base, 1);
  for (const title of ["Design team", "Design review", "Spending", "Issues", "Build failed"]) {
    const box = await page.getByText(title, { exact: true }).first().boundingBox();
    expect(box, title).not.toBeNull();
    expect(box!.y + box!.height, title).toBeLessThan(860);
  }
  // The gallery, the chart and the code diff are whole
  for (const selector of ['[aria-label="Next photo"]', "[data-slot=chart] svg", "pre.has-diff"]) {
    const box = (await page.locator(selector).first().boundingBox())!;
    expect(box.y + box.height, selector).toBeLessThan(860);
  }
});

test("the side nav moves between the overview and the shadcn integration", async ({ page }) => {
  await open(page, "/", themes.Base, 1);
  const nav = page.getByRole("navigation", { name: "Showcase" });
  await expect(nav.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
  await nav.getByRole("link", { name: "shadcn integration" }).click();
  await expect(page).toHaveURL(/\/shadcn$/);
  await expect(nav.getByRole("link", { name: "shadcn integration" })).toHaveAttribute("aria-current", "page");
  const ids = await page.locator("section[id]").evaluateAll((sections) => sections.map((section) => section.id));
  expect(ids).toEqual(["forms", "badges", "charts", "themes", "code"]);
  // It marks the section you're reading
  const marked = () => nav.locator('[aria-current="location"]');
  await expect(marked()).toHaveText("Form states");
  for (const [id, label] of [["badges", "Badges"], ["charts", "Charts"], ["themes", "Themes"]]) {
    await page.locator(`#${id}`).evaluate((section) => section.scrollIntoView());
    await expect(marked()).toHaveText(label);
  }
  // It stays on screen while the page scrolls, just below the sticky header
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  const header = (await page.locator("header").first().boundingBox())!;
  await expect.poll(async () => (await nav.boundingBox())?.y).toBe(header.y + header.height);
  await expect(marked()).toHaveText("Code");
});

test("photos and avatars are recolored into the theme", async ({ page }) => {
  await open(page, "/", themes.Sunset, 0);
  const images = page.locator("img");
  for (const img of await images.all()) await expect(img).toHaveAttribute("data-huet-recolor", "");
  // Huet recolors an image as it nears the viewport, so flip through the gallery.
  for (let i = 1; i < (await page.locator("[data-slot=carousel-item]").count()); i++)
    await page.getByRole("button", { name: "Next photo" }).click();
  await expect.poll(() => page.locator("img[data-huet-recolored]").count()).toBe(await images.count());
});

test("Tailwind's colors in charts and badges follow the theme", async ({ page }) => {
  const paints = {
    bar: () => hexOf(page, "[data-slot=chart] .recharts-bar-rectangle path", "fill"),
    label: () => hexOf(page, "[data-slot=badge]:text-is('bug')", "backgroundColor"),
    tick: () => hexOf(page, ".recharts-cartesian-axis-tick-value", "fill"),
  };
  await open(page, "/", themes.Base, 1);
  const base: Record<string, string> = {};
  for (const [key, paint] of Object.entries(paints)) base[key] = await paint();
  await open(page, "/", themes.Sunset, 1);
  // Charts draw after hydrating, so wait for each paint rather than reading it once.
  for (const [key, paint] of Object.entries(paints)) await expect.poll(paint, { message: key }).not.toBe(base[key]);
});

for (const [mode, background] of [["light", 1], ["dark", 0]] as const) {
  test(`shadcn's accent classes keep their primary readable (${mode})`, async ({ page }) => {
    await open(page, "/shadcn", themes.Sunset, background);
    // `.theme-yellow .theme-container` sets --primary to var(--color-yellow-400),
    // which on its own lands wherever Huet puts that swatch.
    for (const accent of ["yellow", "amber", "green", "red", "purple"]) {
      const button = `.theme-${accent} .theme-container [data-slot=button]:text-is("Primary")`;
      await expect
        .poll(async () => contrast(await hexOf(page, button, "backgroundColor"), await hexOf(page, button, "color")), {
          message: `theme-${accent}`,
        })
        .toBeGreaterThan(60);
    }
  });
}
