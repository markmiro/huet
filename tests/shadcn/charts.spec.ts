import { existsSync, readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";

import { themes } from "../../packages/huet/src/core/themes";
import type { Theme } from "../../packages/huet/src/core/theme";

const v4 = new URL("../../vendor/shadcn-ui/apps/v4/", import.meta.url);
const index = new URL("app/(app)/charts/charts.tsx", v4);
if (!existsSync(index))
  throw new Error(
    "vendor/shadcn-ui is missing. Run: git submodule update --init vendor/shadcn-ui && pnpm shadcn:setup",
  );
// Every chart on /charts, so a chart added upstream is checked too.
const charts = [...readFileSync(index, "utf8").matchAll(/id: "(chart-[\w-]+)"/g)].map((match) => match[1]);

/** Pages that draw charts outside the /charts iframes. */
const pages = [
  "/",
  "/examples/dashboard",
  "/view/new-york-v4/dashboard-01",
  "/docs/components/base/chart",
  "/docs/components/radix/chart",
  ...charts.map((id) => `/view/new-york-v4/${id}`),
];

/** Loads `path` with a saved Huet theme, once Huet has painted the page. */
async function open(page: Page, path: string, theme: Theme, background: number) {
  await page.goto(path);
  await page.evaluate(
    ([theme, background]) => localStorage.setItem("huet-shadcn", JSON.stringify({ theme, background })),
    [theme, background] as const,
  );
  await page.reload();
  await page.waitForFunction(() => document.getElementById("huet-charts"));
}

/**
 * Every visible paint in the page's charts, keyed by element. Charts below
 * the fold draw their series once scrolled to, and hovering shows a tooltip.
 */
async function paintsOf(page: Page, path: string, theme: Theme, background: number) {
  await open(page, path, theme, background);
  for (const chart of await page.locator("[data-slot=chart]").all()) await chart.scrollIntoViewIfNeeded();
  const surface = page.locator(".recharts-surface").first();
  if (await surface.count()) {
    await surface.scrollIntoViewIfNeeded();
    const box = await surface.boundingBox();
    if (box) await page.mouse.move(box.x + box.width * 0.55, box.y + box.height / 2);
  }
  // Let the series finish drawing and the tooltip appear.
  await page.waitForTimeout(600);
  return page.evaluate(() => {
    const paints: Record<string, string> = {};
    const key = (el: Element) => {
      const parts: string[] = [];
      for (let e: Element | null = el; e && e !== document.body; e = e.parentElement)
        parts.unshift(`${e.tagName.toLowerCase()}:${e.parentElement ? [...e.parentElement.children].indexOf(e) : 0}`);
      return parts.join(">");
    };
    const ownText = (el: Element) =>
      [...el.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent!.trim());
    const record = (el: Element, property: string) => {
      const value = getComputedStyle(el).getPropertyValue(property);
      if (!value || value === "none" || value.startsWith("url(") || /^rgba\(.*, 0\)$/.test(value)) return;
      paints[`${key(el)} ${property}`] = value;
    };
    const seen = new Set<Element>();
    const visit = (el: Element) => {
      if (seen.has(el)) return;
      seen.add(el);
      // Clip paths and masks are geometry, never painted.
      if (el instanceof SVGClipPathElement || el instanceof SVGMaskElement) return;
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return;
      if (el instanceof SVGStopElement) record(el, "stop-color");
      else if (el instanceof SVGTextContentElement) {
        if (ownText(el)) record(el, "fill");
      } else if (el instanceof SVGGeometryElement) {
        // Lines, like the tooltip cursor, have no area to fill.
        const { width, height } = el.getBBox();
        if (!(el instanceof SVGLineElement) && width > 0 && height > 0) record(el, "fill");
        if (style.strokeWidth !== "0px") record(el, "stroke");
      } else if (el instanceof HTMLElement) {
        record(el, "background-color");
        if (style.borderTopWidth !== "0px") record(el, "border-top-color");
        if (ownText(el)) record(el, "color");
      }
      for (const child of el.children) visit(child);
    };
    document
      .querySelectorAll("[data-slot=chart], .recharts-tooltip-wrapper, [class*='bg-chart'], [class*='text-chart']")
      .forEach(visit);
    return paints;
  });
}

const same = (a: Record<string, string>, b: Record<string, string>) =>
  Object.keys(a)
    .filter((key) => key in b && a[key] === b[key])
    .map((key) => `${key} = ${a[key]}`);

test.describe("every chart paint follows the Huet theme", () => {
  test.describe.configure({ mode: "parallel" });
  for (const path of pages) {
    test(path, async ({ page }) => {
      const base = await paintsOf(page, path, themes.Base, 1);
      expect(Object.keys(base).length, "the page draws chart paints").toBeGreaterThan(0);
      expect(same(base, await paintsOf(page, path, themes.Radioactive, 1)), "unchanged between light themes").toEqual([]);
      const dark = await paintsOf(page, path, themes.Base, 0);
      expect(same(dark, await paintsOf(page, path, themes.Paperback, 0)), "unchanged between dark themes").toEqual([]);
    });
  }
});

/** The computed color of `value` inside the first chart, for comparing with a paint. */
const colorInChart = (page: Page, value: string) =>
  page.locator("[data-slot=chart]").first().evaluate((chart, value) => {
    const probe = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    probe.style.fill = value;
    chart.querySelector("svg")!.append(probe);
    const color = getComputedStyle(probe).fill;
    probe.remove();
    return color;
  }, value);

test("axis tick labels use the muted text color", async ({ page }) => {
  for (const [path, tick] of [
    ["/view/new-york-v4/chart-bar-multiple", ".recharts-cartesian-axis-tick-value"],
    ["/view/new-york-v4/chart-radar-default", ".recharts-polar-angle-axis-tick-value"],
  ]) {
    for (const background of [1, 0]) {
      await open(page, path, themes.Paperback, background);
      const muted = await colorInChart(page, "var(--muted-foreground)");
      await expect(page.locator(tick).first()).toHaveCSS("fill", muted);
    }
  }
});

test("a custom radar label is drawn in the text color", async ({ page }) => {
  await open(page, "/view/new-york-v4/chart-radar-label-custom", themes.Paperback, 0);
  const foreground = await colorInChart(page, "var(--foreground)");
  const value = page.locator(".recharts-polar-angle-axis-ticks text tspan").first();
  await expect(value).toHaveCSS("fill", foreground);
});

test("literal chart config colors follow the theme, and ones Huet can't read raise an error", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  // The shape ChartContainer renders for a config of { a: { color: "#2563eb" }, … }
  const mount = () =>
    page.evaluate(() => {
      const chart = document.createElement("div");
      chart.dataset.slot = "chart";
      chart.dataset.chart = "huet-test";
      chart.innerHTML =
        "<style>[data-chart=huet-test]{--color-a:#2563eb;--color-b:var(--chart-2);--color-c:not-a-color}</style>";
      document.body.append(chart);
    });
  const colorA = () =>
    page.locator("[data-chart=huet-test]").evaluate((chart) => getComputedStyle(chart).getPropertyValue("--color-a"));

  await open(page, "/view/new-york-v4/chart-bar-default", themes.Base, 1);
  await mount();
  await expect.poll(colorA).not.toBe("#2563eb");
  const onBase = await colorA();
  expect(errors.some((error) => error.includes("can't theme the chart color --color-c: not-a-color"))).toBe(true);

  await open(page, "/view/new-york-v4/chart-bar-default", themes.Radioactive, 1);
  await mount();
  await expect.poll(colorA).not.toBe("#2563eb");
  expect(await colorA()).not.toBe(onBase);
});

test("chart iframes follow the top page's theme live and show no editor of their own", async ({ page }) => {
  // Dev mode sends hundreds of chunks per iframe, so load just the first chart.
  await page.route(/\/view\//, (route) =>
    route.request().resourceType() === "document" && !route.request().url().endsWith("/chart-area-interactive")
      ? route.abort()
      : route.continue(),
  );
  await open(page, "/charts/area", themes.Base, 1);
  const frame = page.frameLocator("iframe").first();
  await page.locator("iframe").first().scrollIntoViewIfNeeded();
  await frame.locator(".recharts-surface").first().waitFor();
  await expect(frame.getByRole("button", { name: /Huet Theme Configurator/ })).toHaveCount(0);

  const chart1 = () =>
    frame.locator("html").evaluate((html) => getComputedStyle(html).getPropertyValue("--chart-1"));
  const before = await chart1();
  const toggle = page.getByRole("button", { name: /Huet Theme Configurator/ });
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
  await page.getByRole("button", { name: "Radioactive", exact: true }).click();

  const top = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--chart-1"));
  expect(top).not.toBe(before);
  await expect.poll(chart1).toBe(top);
});
