import { test, type Page } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { contrast, lightness } from "../packages/huet/src/core/color";
import { themes } from "../packages/huet/src/core/themes";

/*
  Before/after evidence for docs/disabled-controls.md: disabled controls on the
  Forms page, measured in APCA Lc and captured on light and dark backgrounds.
  Skipped unless HUET_BEFORE_URL points at a dev server running the baseline
  checkout (with the same Forms page markup):

    HUET_BEFORE_URL=http://localhost:8735 npx playwright test tests/disabled-screenshots.spec.ts

  The pure-CSS prototypes are the baseline's disabled rules with their sRGB
  mixes switched to another color space. The committed images were then
  reduced to 256 colors: magick FILE -dither None -colors 256 PNG8:FILE
*/
const before = process.env.HUET_BEFORE_URL!;
const baseline = (url: string) => fetch(`${url}/packages/huet/src/core/forms.css?raw`).then((r) => r.text()).then((js) => JSON.parse(js.slice(js.indexOf('"'), js.lastIndexOf('"') + 1)) as string);
const inSpace = (forms: string, space: string) => {
  const block = forms.slice(forms.indexOf("  [data-huet-forms] {\n    --_disabled"), forms.indexOf("  /* Icons inside disabled fields"));
  return `@layer base {\n${block.replaceAll("in srgb", `in ${space}`)}\n}`;
};
const variants = [
  { name: "before", url: before, space: "" },
  { name: "lab", url: before, space: "lab" },
  { name: "oklab", url: before, space: "oklab" },
  { name: "prophoto", url: before, space: "prophoto-rgb" },
  { name: "after", url: "http://localhost:8733", space: "" },
];
const cases = [["Base", 1], ["Base", 0], ["Sunset", 1], ["Sunset", 0], ["Orange Boost", 1], ["Orange Boost", 0]] as const;
const out = "docs/screenshots";

async function open(page: Page, url: string, theme: keyof typeof themes, background: number, css: string) {
  await page.addInitScript(([t, b]) => {
    localStorage.setItem("huet-demo:theme", JSON.stringify({ theme: t, background: b }));
    localStorage.setItem("huet:demo:forms:styled", "true");
  }, [themes[theme], background] as const);
  await page.goto(`${url}/forms`);
  await page.waitForSelector("#page[data-huet-root]");
  if (css) await page.addStyleTag({ content: css });
  await page.waitForTimeout(200);
}

/** Every color as painted, in sRGB hex, keyed by name */
const sample = (page: Page) => page.evaluate(() => {
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
  const hex = (color: string) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000"; ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
  };
  const resolve = (el: Element, value: string) => {
    const probe = document.createElement("span");
    probe.style.color = value; el.append(probe);
    const c = getComputedStyle(probe).color; probe.remove(); return c;
  };
  const q = (s: string, root: ParentNode = document) => root.querySelector(s)!;
  const label = (text: string, root: ParentNode = document) => [...root.querySelectorAll("label")].find((l) => l.textContent!.trim().startsWith(text))!;
  const css = (el: Element, p: string) => getComputedStyle(el).getPropertyValue(p);
  const surfaceOf = (el: Element) => el.closest("fieldset.huet-bg-100, fieldset.huet-bg-blue-20");
  const pick = (selector: string, scope: Element | null, text?: string) =>
    [...document.querySelectorAll(selector)].find((el) => surfaceOf(el) === scope && (!text || el.textContent!.trim().startsWith(text)))!;
  const at = (scope: Element | null, bgEl: Element) => {
    const enabledField = pick("input[type=text]:not([disabled]):not([readonly])", scope);
    const disabledField = pick("input[type=text][disabled]", scope);
    const enabledText = scope ? pick("label", scope, "Project name") : pick("label", null, "Express");
    const disabledText = scope ? pick("label", scope, "Owner (disabled)") : pick("label", null, "Drone (disabled)");
    const enabledButton = scope ? pick("button[type=button]:not([disabled])", scope) : pick("button[type=button]:not([disabled])", null, "Cancel");
    const disabledButton = pick("button[type=button][disabled]", scope);
    return {
      background: hex(css(bgEl, "--huet-background")),
      text: hex(css(enabledText, "color")), textDisabled: hex(css(disabledText, "color")),
      line: hex(css(enabledField, "border-top-color")), lineDisabled: hex(css(disabledField, "border-top-color")),
      buttonLine: hex(css(enabledButton, "border-top-color")), buttonFill: hex(css(disabledButton, "background-color")),
      buttonText: hex(css(disabledButton, "color")),
    };
  };
  const page = q("#page");
  const range = q("form input[type=range][disabled]");
  return {
    page: { ...at(null, page), sliderFill: hex(css(range, "color")), sliderTrack: hex(resolve(range.parentElement!, css(range, "--_line"))) },
    inverted: at(q("fieldset.huet-bg-100"), q("fieldset.huet-bg-100")),
    blue: at(q("fieldset.huet-bg-blue-20"), q("fieldset.huet-bg-blue-20")),
  };
});

const lc = (bg: string, c: string) => Math.round(contrast(bg, c) * 10) / 10;

test("capture disabled controls before and after", async ({ browser }) => {
  test.skip(!before, "Set HUET_BEFORE_URL to a dev server running the baseline checkout");
  test.setTimeout(600_000);
  mkdirSync(`${out}/disabled`, { recursive: true });
  const forms = await baseline(before);
  const rows: Record<string, unknown>[] = [];
  const shots: Record<string, string[]> = {};
  for (const { name: variant, url, space } of variants) {
    for (const [theme, background] of cases) {
      const context = await browser.newContext({ viewport: { width: 1100, height: 900 } });
      const page = await context.newPage();
      await open(page, url, theme, background, space ? inSpace(forms, space) : "");
      const colors = await sample(page);
      for (const [surface, c] of Object.entries(colors) as [string, Record<string, string>][]) {
        const m = (x: string) => lc(c.background, c[x]);
        rows.push({
          variant, theme, background, surface, colors: c,
          text: m("text"), textDisabled: m("textDisabled"),
          line: m("line"), lineDisabled: m("lineDisabled"),
          buttonLine: m("buttonLine"), buttonFill: m("buttonFill"), buttonText: m("buttonText"), fillDL: Math.round(Math.abs(lightness(c.buttonFill) - lightness(c.background)) * 1000) / 10, lineDL: Math.round(Math.abs(lightness(c.line) - lightness(c.background)) * 1000) / 10,
          ...(c.sliderFill ? { sliderFill: m("sliderFill"), sliderTrack: m("sliderTrack") } : {}),
        });
      }
      // Hide everything but the sections with disabled controls
      await page.evaluate(() => {
        const keep = ["Checkboxes, radios and switches", "Buttons", "On other surfaces"];
        for (const s of document.querySelectorAll("form[data-forms-demo] > section"))
          if (!keep.includes(s.querySelector("h2")!.textContent!.trim())) (s as HTMLElement).style.display = "none";
        for (const h of document.querySelectorAll("form[data-forms-demo] h2")) (h as HTMLElement).style.margin = "1.5rem 0 3.75rem";
      });
      const form = page.locator("form[data-forms-demo]");
      const slug = `${theme.toLowerCase().replace(/ /g, "-")}-${variant}`;
      (shots[slug] ??= [])[background === 1 ? 0 : 1] = (await form.screenshot()).toString("base64");
      await context.close();
    }
  }
  // Light on the left, dark on the right
  const page = await browser.newPage();
  for (const [slug, [light, dark]] of Object.entries(shots)) {
    await page.setContent(`<body style="margin:0;display:flex;width:max-content">${[light, dark].map((x) => `<img src="data:image/png;base64,${x}">`).join("")}</body>`);
    await page.locator("body").screenshot({ path: `${out}/disabled/${slug}.png` });
  }
  await page.close();
  writeFileSync(`${out}/disabled/lc.json`, JSON.stringify(rows, null, 1));
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) + "%" : "–");
  console.log("variant | theme | bg | surface | text Lc (dis/en) | line Lc (dis/en) | button fill Lc | button text Lc | slider fill/track");
  for (const r of rows as any[])
    console.log(`${r.variant} | ${r.theme} | ${r.background} | ${r.surface} | ${r.textDisabled}/${r.text} ${pct(r.textDisabled, r.text)} | ${r.lineDisabled}/${r.line} ${pct(r.lineDisabled, r.line)} | ${r.buttonFill} (ΔL* ${r.fillDL}, line ΔL* ${r.lineDL}) | ${r.buttonText} | ${r.sliderFill ?? ""}/${r.sliderTrack ?? ""}`);
});
