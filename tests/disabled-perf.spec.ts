import { test, type Browser } from "@playwright/test";
import { writeFileSync } from "node:fs";

/*
  What recoloring costs on a page full of form controls, for the disabled-color
  approaches in docs/disabled-controls.md. Skipped unless HUET_BEFORE_URL points
  at a dev server running the baseline checkout (before --huet-disabled):

    HUET_BEFORE_URL=http://localhost:8735 npx playwright test tests/disabled-perf.spec.ts

  Each run builds a synthetic page of nested huet-bg-* and huet-surface-*
  surfaces holding form controls, about half of them disabled, mounts a theme,
  then applies a sequence of theme updates the way the configurator does:
  switching presets, dragging the blue hue, and dragging the neutral ramp's
  dark endpoint. It times mountTheme's update() in JS and reads Chrome's trace
  for the style recalc, layout and paint of the frame that follows.
*/

const variants = [
  { name: "before: color-mix in srgb", url: process.env.HUET_BEFORE_URL, css: "" },
  { name: "before + color-mix in oklab", url: process.env.HUET_BEFORE_URL, css: "oklab" },
  { name: "after: solver variables", url: "http://localhost:8733", css: "" },
];
const sizes = (process.env.HUET_PERF_SIZES ?? "50,1000,5000").split(",").map(Number);
const runs = Number(process.env.HUET_PERF_RUNS ?? 5);
const updates = 30;

/** Builds the page, mounts Base, and returns the number of surfaces and controls. */
async function setUp(browser: Browser, url: string, controls: number, space: string) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const page = await context.newPage();
  await page.goto(`${url}/lab.html`);
  const counts = await page.evaluate(async ({ controls, space }) => {
    const huet = await import(/* @vite-ignore */ "/packages/huet/src/core/index.ts");
    const css = async (file: string) => (await import(/* @vite-ignore */ `/packages/huet/src/core/${file}?raw`)).default as string;
    let forms = await css("forms.css");
    if (space) {
      const start = forms.indexOf("  [data-huet-forms] {\n    --_disabled");
      const end = forms.indexOf("  /* Icons inside disabled fields");
      forms += `\n@layer base {\n${forms.slice(start, end).replaceAll("in srgb", `in ${space}`)}\n}`;
    }
    document.head.querySelectorAll("style, link[rel=stylesheet]").forEach((x) => x.remove());
    const style = document.createElement("style");
    style.textContent = (await css("styles.css")) + forms + "body{margin:0;font:14px system-ui} .card{padding:8px;margin:6px;border-radius:6px;display:flex;flex-wrap:wrap;gap:6px}";
    document.head.append(style);
    document.body.innerHTML = "";

    const block = [
      `<label>Name <input type="text" value="Ada"></label>`,
      `<label>Locked <input type="text" value="Ada" disabled></label>`,
      `<label><input type="checkbox" checked> On</label>`,
      `<label><input type="checkbox" disabled> Off</label>`,
      `<label><input type="radio" name="r" checked> A</label>`,
      `<label><input type="radio" name="r" disabled> B</label>`,
      `<label><input type="checkbox" role="switch" checked> Sync</label>`,
      `<label><input type="checkbox" role="switch" checked disabled> Lock</label>`,
      `<input type="range" value="40">`,
      `<input type="range" value="60" disabled>`,
      `<select><option>One</option></select>`,
      `<select disabled><option>Two</option></select>`,
      `<button type="button">Cancel</button>`,
      `<button type="button" disabled>Archive</button>`,
      `<button type="submit">Save</button>`,
      `<button type="submit" disabled>Send</button>`,
      `<textarea rows="1">Hi</textarea>`,
      `<progress value="40" max="100"></progress>`,
      `<fieldset disabled><legend>Off</legend><input type="text" value="x"></fieldset>`,
      `<input type="file">`,
    ]; // 20 controls: 8 disabled, plus a disabled fieldset and the field inside it
    const surfaces = ["huet-surface-10", "huet-bg-blue-20", "huet-bg-100", "huet-bg-20"];
    const root = document.createElement("div");
    root.setAttribute("data-huet-forms", "");
    root.className = "huet-text-100";
    let html = "", made = 0, section = 0;
    while (made < controls) {
      html += `<section class="huet-bg-5 card">`;
      for (let i = 0; i < 4 && made < controls; i++, made += block.length) {
        const half = block.length / 2;
        html += `<div class="${surfaces[(section + i) % 4]} card">${block.slice(0, half).join("")}` +
          `<div class="huet-bg-10 card">${block.slice(half).join("")}</div></div>`;
      }
      html += `</section>`;
      section++;
    }
    root.innerHTML = html;
    document.body.append(root);
    let writes = 0;
    const setProperty = CSSStyleDeclaration.prototype.setProperty;
    CSSStyleDeclaration.prototype.setProperty = function (...args: Parameters<typeof setProperty>) {
      writes++;
      return setProperty.apply(this, args);
    };
    const w = window as unknown as Record<string, unknown>;
    w.huet = huet;
    w.mount = huet.mountTheme(root, huet.themes.Base, { background: 1 });
    w.writes = () => writes;
    root.getBoundingClientRect();
    return {
      surfaces: root.querySelectorAll("[data-huet-color-bg]").length + 1,
      controls: root.querySelectorAll("input, select, textarea, button, progress").length,
      disabled: root.querySelectorAll(":disabled").length,
    };
  }, { controls, space });
  return { context, page, counts };
}

const scenarios = {
  /** Switching between the presets, as on the configurator's Themes tab */
  "switch preset": (i: number, huet: { themes: Record<string, unknown> }) => Object.values(huet.themes)[i % 12],
  /** Dragging the blue hue in the configurator: 40 distinct hues */
  "drag a hue": (i: number, huet: { themes: { Base: { colors: object } } }, drag: { hues: string[] }) =>
    ({ ...huet.themes.Base, colors: { ...huet.themes.Base.colors, blue: drag.hues[i % 40] } }),
  /** Dragging the neutral ramp's dark endpoint: every surface changes */
  "drag the neutral": (i: number, huet: { themes: { Base: object } }, drag: { darks: string[] }) =>
    ({ ...huet.themes.Base, neutral: [drag.darks[i % 40], "#ffffff"] }),
};

const quantile = (xs: number[], q: number) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
};

test("recolor cost of disabled-color approaches", async ({ browser }) => {
  test.skip(!process.env.HUET_BEFORE_URL, "Set HUET_BEFORE_URL to a dev server running the baseline checkout");
  test.setTimeout(3_600_000);
  const drag = makeDrag();
  type Sample = { js: number; style: number; layout: number; paint: number; writes: number };
  const results: Record<string, Sample[]> = {};
  const meta: Record<string, unknown> = {};
  for (let run = 0; run < runs; run++)
    for (const size of sizes)
      for (const [scenario, make] of Object.entries(scenarios))
        // Interleave the variants so drift on the machine hits them alike
        for (const variant of variants) {
          const { context, page, counts } = await setUp(browser, variant.url!, size, variant.css);
          meta[`${size}`] = counts;
          // Warm up: the first updates compile and fill the solver's caches
          await page.evaluate(async ({ source, drag }) => {
            const make = eval(source);
            const w = window as any;
            for (let i = 0; i < 3; i++) w.mount.update(make(i + 50, w.huet, drag), { background: 1 });
            await new Promise((r) => requestAnimationFrame(() => setTimeout(r)));
          }, { source: make.toString(), drag });
          await browser.startTracing(page, { categories: ["devtools.timeline", "blink.user_timing"] });
          const js = await page.evaluate(async ({ source, drag, updates }) => {
            const make = eval(source);
            const w = window as any;
            const out: { js: number; writes: number }[] = [];
            for (let i = 0; i < updates; i++) {
              const theme = make(i, w.huet, drag);
              const writes = w.writes();
              performance.mark(`huet-start-${i}`);
              const t = performance.now();
              w.mount.update(theme, { background: 1 });
              out.push({ js: performance.now() - t, writes: w.writes() - writes });
              // Let the frame render: style, layout and paint
              await new Promise((r) => requestAnimationFrame(() => setTimeout(r)));
              performance.mark(`huet-end-${i}`);
            }
            return out;
          }, { source: make.toString(), drag, updates });
          const trace = JSON.parse((await browser.stopTracing()).toString()).traceEvents as TraceEvent[];
          const frames = byUpdate(trace, updates);
          const key = `${variant.name}|${size}|${scenario}`;
          (results[key] ??= []).push(...js.map((x, i) => ({ ...x, ...frames[i] })));
          await context.close();
        }

  const rows = Object.entries(results).map(([key, samples]) => {
    const [variant, size, scenario] = key.split("|");
    const stat = (k: keyof Sample) => ({ median: quantile(samples.map((s) => s[k]), 0.5), p95: quantile(samples.map((s) => s[k]), 0.95) });
    return { variant, size: Number(size), scenario, n: samples.length, js: stat("js"), style: stat("style"), layout: stat("layout"), paint: stat("paint"), writes: stat("writes") };
  });
  writeFileSync(process.env.HUET_PERF_OUT ?? "test-results/disabled-perf.json", JSON.stringify({ meta, rows }, null, 1));
  const ms = (x: { median: number; p95: number }) => `${x.median.toFixed(2)} / ${x.p95.toFixed(2)}`;
  console.log("| Controls | Change | Approach | JS update() | Style recalc | Layout | Paint | Writes |");
  for (const r of rows.sort((a, b) => a.size - b.size || a.scenario.localeCompare(b.scenario)))
    console.log(`| ${r.size} | ${r.scenario} | ${r.variant} | ${ms(r.js)} | ${ms(r.style)} | ${ms(r.layout)} | ${ms(r.paint)} | ${r.writes.median} |`);
  console.log(JSON.stringify(meta));
});

interface TraceEvent { name: string; ph: string; ts: number; dur?: number; pid: number; tid: number; cat: string }

/** Main-thread time per update, between its start and end marks */
function byUpdate(events: TraceEvent[], count: number) {
  const mark = (name: string) => events.find((e) => e.name === name && e.cat.includes("user_timing"))!;
  const main = mark("huet-start-0");
  const groups: Record<string, "style" | "layout" | "paint"> = {
    UpdateLayoutTree: "style", Layout: "layout", PrePaint: "paint", Paint: "paint", Layerize: "paint", PaintImage: "paint",
  };
  const timed = events.filter((e) => e.ph === "X" && e.pid === main.pid && e.tid === main.tid && groups[e.name]);
  return Array.from({ length: count }, (_, i) => {
    const [start, end] = [mark(`huet-start-${i}`).ts, mark(`huet-end-${i}`).ts];
    const sums = { style: 0, layout: 0, paint: 0 };
    // Skip events nested inside another counted event of the same group
    let until = { style: 0, layout: 0, paint: 0 };
    for (const e of timed.filter((e) => e.ts >= start && e.ts <= end).sort((a, b) => a.ts - b.ts)) {
      const group = groups[e.name];
      if (e.ts < until[group]) continue;
      sums[group] += (e.dur ?? 0) / 1000;
      until = { ...until, [group]: e.ts + (e.dur ?? 0) };
    }
    return sums;
  });
}

/** 40 hues around the default blue, and 40 dark endpoints from black to #3a3a3a */
function makeDrag() {
  const hex = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  const darks = Array.from({ length: 40 }, (_, i) => "#" + hex((0x3a * i) / 39).repeat(3));
  // Rotate #0082dc around the hue wheel in sRGB's YIQ plane: close enough for a drag
  const [r, g, b] = [0x00, 0x82, 0xdc];
  const y = 0.299 * r + 0.587 * g + 0.114 * b, i0 = 0.596 * r - 0.274 * g - 0.322 * b, q0 = 0.211 * r - 0.523 * g + 0.312 * b;
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const hues = Array.from({ length: 40 }, (_, k) => {
    const a = (k * 4 * Math.PI) / 180, i = i0 * Math.cos(a) - q0 * Math.sin(a), q = i0 * Math.sin(a) + q0 * Math.cos(a);
    return "#" + [y + 0.956 * i + 0.621 * q, y - 0.272 * i - 0.647 * q, y - 1.106 * i + 1.703 * q].map((v) => hex(clamp(v))).join("");
  });
  return { hues, darks };
}
