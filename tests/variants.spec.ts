import { test, expect, type Page } from "@playwright/test";
import { compile } from "@tailwindcss/node";
import { fileURLToPath } from "node:url";

// Real Tailwind v4 output for the classes below, from huet/tailwind.css.
const html = `<div id="root" style="padding: 8px">
  <div id="card" class="group huet-bg-10 hover:huet-bg-25 p-4">
    <p id="nested" class="huet-text-80">Nested amount</p>
    <p id="token" class="text-huet-blue">Token</p>
    <div id="inner" class="group-hover:huet-bg-blue-40 p-2">
      <p id="own" class="huet-bg-5 huet-bg/text-70">Two levels down</p>
    </div>
  </div>
  <button id="button" class="huet-outline-blue-80 focus-visible:outline-2 focus-visible:huet-outline-red-90">Focus</button>
  <a id="link" href="#" class="huet-text-60 hover:huet-text-100">Link</a>
  <div id="responsive" class="huet-bg-10 md:huet-bg-50 md:hover:huet-bg-75 p-4">Responsive</div>
  <div id="aria" aria-pressed="false" class="huet-bg-10 aria-pressed:huet-bg-60 p-4">Pressed</div>
  <div id="arbitrary" class="huet-bg-20 [&>svg]:huet-bg/text-red-90 p-4"><svg id="icon" width="10" height="10"></svg></div>
</div>`;

async function setup(page: Page) {
  const compiler = await compile('@import "tailwindcss"; @import "./tailwind.css";', {
    base: fileURLToPath(new URL("../packages/huet/src/core/", import.meta.url)),
    onDependency: () => {},
  });
  const css = compiler.build([...new Set(html.match(/class="([^"]*)"/g)!.flatMap((x) => x.slice(7, -1).split(/\s+/)))]);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/lab.html");
  await page.setContent(`<!doctype html><html><head><style>${css}</style></head><body>${html}</body></html>`);
  await page.evaluate(async () => {
    const { createTheme, mountTheme } = await import("/packages/huet/src/core/index.ts" as string);
    (window as { mount?: unknown }).mount = mountTheme(document.getElementById("root")!, createTheme());
  });
  return errors;
}

/** Computed colors next to what the solver gives for the same chain of backgrounds. */
function measure(page: Page, options = {}) {
  return page.evaluate(async (options) => {
    const { createTheme } = await import("/packages/huet/src/core/index.ts" as string);
    const theme = createTheme(options);
    const hex = (value: string) => {
      const srgb = /^color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)/.exec(value);
      const channels = srgb ? srgb.slice(1).map((x) => Number(x) * 255) : value.match(/[\d.]+/g)!.slice(0, 3).map(Number);
      return "#" + channels.map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
    };
    const style = (id: string) => getComputedStyle(document.getElementById(id)!);
    const matches = (id: string, selector: string) => document.getElementById(id)!.matches(selector);
    const md = matchMedia("(width >= 48rem)").matches;
    const root = theme.relative, blue = root.theme.ramps.blue, red = root.theme.ramps.red;
    const card = root.contrast(matches("card", ":hover") ? 25 : 10);
    const inner = matches("card", ":hover") ? card.contrast(40, blue) : card;
    const own = inner.contrast(5);
    const responsive = root.contrast(!md ? 10 : matches("responsive", ":hover") ? 75 : 50);
    const pressed = document.getElementById("aria")!.getAttribute("aria-pressed") === "true";
    const arbitrary = root.contrast(20);
    const pairs: Record<string, [string, string]> = {
      "card background": [hex(style("card").backgroundColor), card.hex],
      "card text": [hex(style("card").color), card.contrast(100).hex],
      "nested amount": [hex(style("nested").color), card.contrast(80).hex],
      "inner background": [hex(style("inner").backgroundColor), matches("card", ":hover") ? inner.hex : card.hex],
      "inner token": [hex(style("token").color), theme.tokens(card.hex, root.hex).blue],
      "two levels down background": [hex(style("own").backgroundColor), own.hex],
      "two levels down own text": [hex(style("own").color), own.contrast(70).hex],
      "outline color": [hex(style("button").outlineColor), root.contrast(matches("button", ":focus-visible") ? 90 : 80,
        matches("button", ":focus-visible") ? red : blue).hex],
      "outline": [style("button").outlineStyle + " " + style("button").outlineWidth,
        matches("button", ":focus-visible") ? "solid 2px" : "none 3px"],
      "link": [hex(style("link").color), root.contrast(matches("link", ":hover") ? 100 : 60).hex],
      "responsive": [hex(style("responsive").backgroundColor), responsive.hex],
      "aria": [hex(style("aria").backgroundColor), root.contrast(pressed ? 60 : 10).hex],
      "arbitrary": [hex(style("icon").color), arbitrary.contrast(90, red).hex],
    };
    return pairs;
  }, options);
}

async function check(page: Page, label: string, options = {}) {
  for (const [name, [actual, expected]] of Object.entries(await measure(page, options)))
    expect(actual, `${label}: ${name}`).toBe(expected);
}

test("Tailwind variants on Huet classes, including colors nested under a changed background", async ({ page }) => {
  const errors = await setup(page);
  await page.mouse.move(1270, 1090);
  await check(page, "rest");
  const rest = await measure(page);
  /** Each step must change exactly these colors, so a variant that never applies fails. */
  const expectChanged = async (label: string, names: string[]) => {
    const now = await measure(page);
    const changed = Object.keys(now).filter((name) => now[name][0] !== rest[name][0]);
    expect(changed.sort(), label).toEqual(names.sort());
  };
  await page.hover("#nested");
  await check(page, "hover and group-hover");
  // Full-contrast card text is the same color on both card backgrounds.
  await expectChanged("hover and group-hover", ["card background", "nested amount", "inner background",
    "inner token", "two levels down background", "two levels down own text"]);
  await page.hover("#link");
  await check(page, "hover text");
  await expectChanged("hover text", ["link"]);
  await page.mouse.move(1270, 1090);
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement?.id)).toBe("button");
  await check(page, "focus-visible");
  await expectChanged("focus-visible", ["outline color", "outline"]);
  await page.evaluate(() => document.getElementById("aria")!.setAttribute("aria-pressed", "true"));
  await check(page, "aria");
  await expectChanged("aria", ["outline color", "outline", "aria"]);
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await check(page, "md");
  await page.hover("#responsive");
  await check(page, "md:hover");
  await expectChanged("md:hover", ["aria", "responsive"]);
  await page.setViewportSize({ width: 600, height: 1100 });
  await page.hover("#responsive");
  await check(page, "below md");
  // The resting measurement was at md width: huet-bg-50, not huet-bg-10.
  await expectChanged("below md", ["aria", "responsive"]);
  expect(errors).toEqual([]);
});

test("colors follow theme updates while a variant is active", async ({ page }) => {
  await setup(page);
  await page.hover("#nested");
  for (const options of [{ background: 0 }, { contrast: 0.4 }, { dark: "#233b91", background: 0.3 }]) {
    await page.evaluate(async (options) => {
      const { createTheme } = await import("/packages/huet/src/core/index.ts" as string);
      (window as unknown as { mount: { update(theme: unknown): void } }).mount.update(createTheme(options));
    }, options);
    await check(page, JSON.stringify(options), options);
  }
});
