import { oklabFromRgb, type Triple } from "../../core/color";
import {
  coordinatesOf,
  rampColor,
  recolorer,
  toCube,
  type Palette,
  type RecolorOptions,
} from "../../core/recolor";
import { createTheme, mountTheme, contrastRatio } from "../../core";
import { hues, type Hue, type HuetTheme } from "../../core/theme";
import { images, themes, type DemoImage, type RecolorTheme } from "./data";
import { emojiSheet } from "./emoji";
import { GpuRecolor } from "../../core/gpu";
import type { Request } from "./worker";
import "./recolor.css";

type Mode = "gpu" | "worker" | "exact";
const app = document.querySelector<HTMLElement>("#app")!;
app.innerHTML = `
<header><a href="/">huet<span> / image recolor</span></a><a class="tag huet-surface-10" href="/lab.html">Contrast lab ↗</a></header>
<main>
  <section class="intro">
    <p class="eyebrow">THEME RAMPS AS A COLOR SPACE</p>
    <h1>Recolor any image with a theme.</h1>
    <p>Every pixel is written in Huet's ramp coordinates: a position <i>t</i> on the dark → light ramp, plus weights on the two neighboring hue ramps (red, yellow, green, blue, purple). Swap the theme and the same coordinates land on the new ramps — grays follow the new neutral ramp, greens become the theme's green.</p>
  </section>
  <section class="controls huet-surface-5 huet-border" aria-label="Recolor controls">
    <label>Theme <select id="theme" class="huet-surface-10 huet-border">${themes.map((t, i) => `<option value="${i}">${t.name}</option>`).join("")}</select></label>
    <label class="check" title="Theme this page with Huet using the selected theme"><input id="page-theme" type="checkbox" checked> Theme the page</label>
    <label class="check"><input id="originals" type="checkbox" checked> Show originals</label>
    <label class="check" title="Swap the theme's background between its dark and light ends. Images keep their lightness."><input id="invert-theme" type="checkbox"> Invert theme</label>
    <label>Strength <input id="strength" type="range" min="0" max="100" value="100"><output id="strength-value">100%</output></label>
    <label title="How much the neutral ramp's tint also shifts saturated colors">Neutral tint on colors <input id="tint" type="range" min="0" max="100" value="0"><output id="tint-value">0%</output></label>
    <label class="check" title="Off: light stays light and dark stays dark. On: images detected as UI screenshots (mostly flat light or dark background) are inverted when the theme has the opposite polarity. Photos are never inverted."><input id="polarity" type="checkbox"> Invert UI screenshots for opposite-polarity themes</label>
    <label>Renderer <select id="mode" class="huet-surface-10 huet-border"><option value="gpu">GPU · WebGL2 LUT</option><option value="worker">Worker · CPU LUT</option><option value="exact">Worker · exact per pixel (slow)</option></select></label>
    <label>LUT size <select id="size" class="huet-surface-10 huet-border"><option selected>17</option><option>33</option><option>65</option></select></label>
    <button id="cube" type="button" class="huet-surface-10 huet-border">Download .cube</button>
  </section>
  <p id="metrics" class="metrics" aria-live="polite"></p>
  <section class="ramps"><h2>Coordinate grid</h2><p class="note"><span class="before">Left: Huet's default ramps, which the images are read in. Right: the same coordinates in the selected theme.</span><span class="after">The selected theme's ramps.</span></p><div id="ramps"></div></section>
  <section class="focus"><div class="section-heading"><h2>One image, every theme</h2><span class="note">Click any image below to focus it. Click a theme to select it. Hover an image to read a pixel's coordinates.</span></div>
    <div class="focus-grid"><div class="focus-main"><img id="focus-original" class="huet-surface-5" alt=""><canvas id="focus-result" class="huet-surface-5"></canvas><div id="inspect" class="inspect">Hover an image to inspect a pixel</div><button id="png" type="button" class="huet-surface-10 huet-border">Download recolored PNG</button></div><div id="matrix" class="matrix"></div></div>
  </section>
  <section class="bench"><div class="section-heading"><h2>Cost</h2><button id="bench" type="button" class="huet-surface-10 huet-border">Benchmark focused image</button></div><div id="bench-result"><p class="note">Measures the exact per-pixel transform against a baked lookup table on the CPU (in a worker) and on the GPU.</p></div></section>
  <section><div class="section-heading"><h2>Emoji</h2><span class="note">Rendered by the system emoji font into a transparent canvas, then recolored like any image.</span></div><div class="gallery emoji" id="emoji"></div></section>
  <section><div class="section-heading"><h2>Unsplash · nature and flowers</h2><span class="note pair-note">Original · recolored</span></div><div class="gallery" id="unsplash"></div></section>
  <section><div class="section-heading"><h2>markmiro.com</h2><span class="note pair-note">Original · recolored</span></div><div class="gallery" id="markmiro"></div></section>
</main>`;

const $ = <T extends Element>(selector: string) => document.querySelector<T>(selector)!;
const themeSelect = $<HTMLSelectElement>("#theme");
const strength = $<HTMLInputElement>("#strength");
const tint = $<HTMLInputElement>("#tint");
const polarity = $<HTMLInputElement>("#polarity");
const modeSelect = $<HTMLSelectElement>("#mode");
const sizeSelect = $<HTMLSelectElement>("#size");
const metrics = $<HTMLElement>("#metrics");
const pageTheme = $<HTMLInputElement>("#page-theme");
const invertTheme = $<HTMLInputElement>("#invert-theme");
const originals = $<HTMLInputElement>("#originals");

let gpu: GpuRecolor | null = null;
try {
  gpu = new GpuRecolor();
} catch {
  modeSelect.querySelector<HTMLOptionElement>('[value="gpu"]')!.disabled = true;
  modeSelect.value = "worker";
}
const state = {
  theme: themes.findIndex((t) => t.name === "Sunset"),
  focus: 0,
};
themeSelect.value = String(state.theme);

// ---- Worker ----
const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
let requestId = 0;
const pending = new Map<number, (data: any) => void>();
worker.onmessage = ({ data }) => {
  pending.get(data.id)!(data);
  pending.delete(data.id);
};
function call<T>(request: Request, transfer: Transferable[] = []): Promise<T & { ms: number }> {
  const id = ++requestId;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    worker.postMessage({ ...request, id }, transfer);
  });
}

const palette = ({ dark, light, neutral, colors }: RecolorTheme): Palette => ({
  dark,
  light,
  neutral,
  colors,
});
/** The theme's background position on its ramp, after the invert toggle. */
const backgroundOf = (theme: RecolorTheme) =>
  invertTheme.checked ? 1 - theme.background : theme.background;
const optionsFor = (theme: RecolorTheme, image?: HTMLImageElement): RecolorOptions => {
  const surface = polarity.checked && image ? surfaceOf(image) : null;
  return {
    invert: !!surface && surface !== (backgroundOf(theme) < 0.5 ? "dark" : "light"),
    strength: Number(strength.value) / 100,
    tint: Number(tint.value) / 100,
  };
};
const lutSize = () => Number(sizeSelect.value);
const luts = new Map<string, Promise<{ lut: Float32Array; ms: number }>>();
function lutFor(theme: RecolorTheme, image?: HTMLImageElement) {
  const options = optionsFor(theme, image),
    size = lutSize();
  const key = JSON.stringify([palette(theme), options, size]);
  let lut = luts.get(key);
  if (!lut) {
    luts.set(key, (lut = call<{ lut: Float32Array }>({ type: "lut", target: palette(theme), options, size })));
  }
  return lut;
}

// ---- Images ----
const loaded = new Map<DemoImage, HTMLImageElement>();
async function load(image: DemoImage) {
  const element = new Image();
  element.src = image.url;
  await element.decode();
  loaded.set(image, element);
  return element;
}
const pixelCache = new WeakMap<HTMLImageElement, ImageData>();
function pixelsOf(image: HTMLImageElement) {
  let data = pixelCache.get(image);
  if (!data) {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true })!;
    context.drawImage(image, 0, 0);
    data = context.getImageData(0, 0, canvas.width, canvas.height);
    pixelCache.set(image, data);
  }
  return data;
}
/**
 * UI screenshots sit on large flat light or dark backgrounds; photos don't.
 * Across the demo images, screenshots have ≥ 53% flat background pixels and
 * photos ≤ 44%.
 */
const surfaces = new Map<string, "light" | "dark" | null>();
function surfaceOf(image: HTMLImageElement) {
  let surface = surfaces.get(image.src);
  if (surface === undefined) {
    const { data } = pixelsOf(image);
    let light = 0,
      dark = 0,
      n = 0;
    for (let p = 0; p < data.length; p += 4 * 13) {
      // Transparent pixels (e.g. around emoji) are not a background.
      if (data[p + 3] < 128) continue;
      n++;
      const [L, a, b] = oklabFromRgb(data[p] / 255, data[p + 1] / 255, data[p + 2] / 255);
      if (Math.hypot(a, b) >= 0.03) continue;
      if (L > 0.85) light++;
      else if (L < 0.35) dark++;
    }
    surface = !n ? null : light / n >= 0.5 ? "light" : dark / n >= 0.5 ? "dark" : null;
    surfaces.set(image.src, surface);
  }
  return surface;
}

/** Render one image through a theme. Returns time spent on the image itself. */
async function render(
  image: HTMLImageElement,
  out: HTMLCanvasElement,
  theme: RecolorTheme,
  mode: Mode,
  width = image.naturalWidth,
) {
  const height = Math.round((image.naturalHeight / image.naturalWidth) * width);
  if (mode === "gpu" && gpu) {
    const { lut } = await lutFor(theme, image);
    const start = performance.now();
    gpu.setLut(lut, lutSize());
    gpu.render(image, out, width, height);
    return performance.now() - start;
  }
  // CPU paths work at natural size; the canvas is scaled with CSS.
  const source = pixelsOf(image);
  const pixels = source.data.slice();
  const result = await call<{ pixels: Uint8ClampedArray }>(
    { type: "apply", mode: mode === "exact" ? "exact" : "lut", pixels, target: palette(theme), options: optionsFor(theme, image), size: lutSize() },
    [pixels.buffer],
  );
  out.width = source.width;
  out.height = source.height;
  out.getContext("2d")!.putImageData(new ImageData(result.pixels as Uint8ClampedArray<ArrayBuffer>, source.width, source.height), 0, 0);
  return result.ms;
}

// ---- Gallery ----
// ---- Emoji ----
images.push({
  url: emojiSheet(),
  title: "System color emoji",
  source: "https://unicode.org/emoji/charts/full-emoji-list.html",
  group: "emoji",
});

const cards = images.map((image, index) => {
  const figure = document.createElement("figure");
  figure.className = "card";
  figure.innerHTML = `<button type="button" class="pair" aria-label="Focus ${image.title}"><img class="huet-surface-5" src="${image.url}" alt="${image.title}, original"><canvas class="huet-surface-5" aria-label="${image.title}, recolored"></canvas></button><figcaption>${image.title} · <a href="${image.source}" target="_blank" rel="noreferrer">source</a><span class="kind"></span></figcaption>`;
  figure.querySelector("button")!.addEventListener("click", () => {
    state.focus = index;
    renderFocus();
    renderMatrix();
    $("#focus-original").scrollIntoView({ behavior: "smooth", block: "center" });
  });
  $(`#${image.group}`).append(figure);
  return { image, canvas: figure.querySelector("canvas")!, kind: figure.querySelector(".kind")! };
});

// ---- Coordinate grid ----
function rampStrip(palette: Palette, hue: Hue | null) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 1;
  const context = canvas.getContext("2d")!;
  const row = context.createImageData(128, 1);
  for (let x = 0; x < 128; x++) {
    const [r, g, b] = rampColor(palette, x / 127, hue ?? undefined);
    row.data.set([r * 255, g * 255, b * 255, 255], x * 4);
  }
  context.putImageData(row, 0, 0);
  return canvas;
}
function renderRamps() {
  const theme = palette(themes[state.theme]);
  const root = $("#ramps");
  root.replaceChildren();
  for (const hue of [null, ...hues]) {
    const row = document.createElement("div");
    row.className = "ramp-row";
    row.innerHTML = `<span>${hue ?? "neutral"}</span>`;
    row.append(
      Object.assign(rampStrip({}, hue), { className: "before" }),
      Object.assign(document.createElement("span"), { textContent: "→", className: "arrow before" }),
      rampStrip(theme, hue),
    );
    root.append(row);
  }
}

// ---- Page theme ----
// The page itself is colored by Huet: surfaces carry `huet-surface-*` classes,
// and the stylesheet falls back to fixed colors when no theme is mounted.
const pageThemes = new Map<string, HuetTheme>();
let pageMount: ReturnType<typeof mountTheme> | null = null;
function themePage() {
  const root = document.documentElement;
  if (!pageTheme.checked) {
    pageMount?.destroy();
    pageMount = null;
    root.style.colorScheme = "";
    return;
  }
  const theme = themes[state.theme];
  const background = backgroundOf(theme),
    key = `${state.theme}:${background}`;
  let next = pageThemes.get(key);
  if (!next) {
    next = createTheme({ ...palette(theme), background });
    pageThemes.set(key, next);
  }
  if (pageMount) pageMount.update(next);
  else pageMount = mountTheme(document.body, next);
  // Match native controls and scrollbars to the page's polarity.
  const bg = next.tokens().background;
  root.style.colorScheme = contrastRatio(bg, "#ffffff") > contrastRatio(bg, "#000000") ? "dark" : "light";
}

// ---- Rendering passes ----
let generation = 0;
async function renderAll() {
  const current = ++generation;
  const theme = themes[state.theme];
  const mode = modeSelect.value as Mode;
  themePage();
  metrics.textContent = "Building lookup table…";
  const lutStart = performance.now();
  const { ms: lutMs } = await lutFor(theme);
  const lutWait = performance.now() - lutStart;
  if (current !== generation) return;
  renderRamps();
  renderFocus();
  void renderMatrix();
  let total = 0,
    megapixels = 0,
    done = 0;
  const wall = performance.now();
  for (const { image, canvas, kind } of cards) {
    const element = loaded.get(image) ?? (await load(image));
    if (current !== generation) return;
    total += await render(element, canvas, theme, mode);
    const surface = polarity.checked && surfaceOf(element);
    const label = surface
      ? ` · UI, ${surface} background${optionsFor(theme, element).invert ? " → inverted" : ""}`
      : "";
    // Avoid needless DOM mutations: the page theme observes the tree.
    if (kind.textContent !== label) kind.textContent = label;
    if (current !== generation) return;
    megapixels += (element.naturalWidth * element.naturalHeight) / 1e6;
    done++;
    if (mode !== "gpu")
      metrics.textContent = `Rendering off the main thread… ${done}/${cards.length} images`;
  }
  const where = { gpu: "WebGL2 (LUT)", worker: "a worker (CPU LUT)", exact: "a worker (exact per pixel)" }[mode];
  metrics.innerHTML =
    `<b>${theme.name}</b> · ${lutSize()}³ LUT built in ${lutMs.toFixed(1)} ms in a worker` +
    (lutWait < 1 ? " (cached)" : "") +
    ` · ${cards.length} images (${megapixels.toFixed(1)} MP) recolored in ${total.toFixed(1)} ms of ${where} time` +
    ` · ${(performance.now() - wall).toFixed(0)} ms wall clock`;
}

async function renderFocus() {
  const image = images[state.focus];
  const element = loaded.get(image) ?? (await load(image));
  $<HTMLImageElement>("#focus-original").src = image.url;
  const mode = modeSelect.value as Mode;
  await render(element, $<HTMLCanvasElement>("#focus-result"), themes[state.theme], mode);
}

let matrixGeneration = 0;
async function renderMatrix() {
  const current = ++matrixGeneration;
  const image = images[state.focus];
  const element = loaded.get(image) ?? (await load(image));
  const matrix = $("#matrix");
  if (matrix.children.length !== themes.length) {
    matrix.replaceChildren(
      ...themes.map((theme, index) => {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "cell";
        cell.innerHTML = `<canvas class="huet-surface-5"></canvas><span>${theme.name}</span>`;
        cell.addEventListener("click", () => {
          state.theme = index;
          themeSelect.value = String(index);
          renderAll();
        });
        return cell;
      }),
    );
  }
  const mode = modeSelect.value === "exact" ? "worker" : (modeSelect.value as Mode);
  for (const [index, theme] of themes.entries()) {
    const cell = matrix.children[index] as HTMLElement;
    cell.classList.toggle("selected", index === state.theme);
    await render(element, cell.querySelector("canvas")!, theme, mode, 320);
    if (current !== matrixGeneration) return;
  }
}

// ---- Pixel inspector ----
const focusOriginal = $<HTMLImageElement>("#focus-original");
const swatch = (rgb: Triple) =>
  `<i class="swatch" style="background:rgb(${rgb.map((v) => Math.round(v * 255)).join(",")})"></i>`;
/** Inspect the original pixel under the cursor, on either the original or the recolored image. */
function inspect(event: MouseEvent) {
  const data = pixelsOf(focusOriginal);
  // Both images use object-fit: contain, so map through the letterboxed content box.
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const scale = Math.min(rect.width / data.width, rect.height / data.height);
  const left = rect.left + (rect.width - data.width * scale) / 2,
    top = rect.top + (rect.height - data.height * scale) / 2;
  const x = Math.floor((event.clientX - left) / scale),
    y = Math.floor((event.clientY - top) / scale);
  if (x < 0 || y < 0 || x >= data.width || y >= data.height) return;
  const p = (y * data.width + x) * 4;
  const rgb = [data.data[p] / 255, data.data[p + 1] / 255, data.data[p + 2] / 255] as unknown as Triple;
  const { t, weights } = coordinatesOf(rgb);
  const parts = Object.entries(weights).map(([hue, w]) => `${hue} ${w!.toFixed(2)}`);
  const theme = themes[state.theme];
  const mapped = recolorer(palette(theme), optionsFor(theme, focusOriginal))(...rgb);
  $("#inspect").innerHTML =
    `<span class="before">${swatch(rgb)}</span> t ${t.toFixed(2)}${parts.length ? " + " + parts.join(" + ") : " (neutral)"} → ${swatch(mapped)} ${theme.name}`;
}
focusOriginal.addEventListener("mousemove", inspect);
$<HTMLCanvasElement>("#focus-result").addEventListener("mousemove", inspect);

// ---- Benchmark ----
const deltaE = (a: Uint8ClampedArray, b: Uint8ClampedArray) => {
  let sum = 0,
    max = 0,
    n = 0;
  // Sample every 7th pixel: the statistics converge long before 1 MP.
  for (let p = 0; p < a.length; p += 28, n++) {
    const x = oklabFromRgb(a[p] / 255, a[p + 1] / 255, a[p + 2] / 255);
    const y = oklabFromRgb(b[p] / 255, b[p + 1] / 255, b[p + 2] / 255);
    const d = Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
    sum += d;
    max = Math.max(max, d);
  }
  return { mean: sum / n, max };
};
$("#bench").addEventListener("click", async () => {
  const button = $<HTMLButtonElement>("#bench");
  button.disabled = true;
  const out = $("#bench-result");
  out.innerHTML = `<p class="note">Running…</p>`;
  const theme = themes[state.theme];
  const image = images[state.focus];
  const element = loaded.get(image) ?? (await load(image));
  const source = pixelsOf(element);
  const mp = (source.width * source.height) / 1e6;
  const target = palette(theme),
    options = optionsFor(theme, element);
  const rows: [string, string, number, string][] = [];
  const exact = await call<{ pixels: Uint8ClampedArray }>(
    { type: "apply", mode: "exact", pixels: source.data.slice(), target, options, size: lutSize() },
  );
  rows.push(["Exact transform, every pixel", "Worker", exact.ms, "Reference result"]);
  const fresh = await call<{ lut: Float32Array }>({ type: "lut", target, options, size: lutSize(), fresh: true });
  rows.push([`Build ${lutSize()}³ LUT`, "Worker", fresh.ms, "Once per theme, independent of image size"]);
  const cpu = await call<{ pixels: Uint8ClampedArray }>(
    { type: "apply", mode: "lut", pixels: source.data.slice(), target, options, size: lutSize() },
  );
  const accuracy = deltaE(cpu.pixels, exact.pixels);
  rows.push(["Apply LUT (trilinear)", "Worker", cpu.ms, `ΔE<sub>OK</sub> vs exact: mean ${accuracy.mean.toFixed(4)}, max ${accuracy.max.toFixed(3)}`]);
  if (gpu) {
    const { lut } = await lutFor(theme, element);
    const canvas = document.createElement("canvas");
    gpu.setLut(lut, lutSize());
    gpu.render(element, canvas, source.width, source.height); // warm up: texture upload
    gpu.finish();
    const runs = 20,
      start = performance.now();
    for (let i = 0; i < runs; i++) gpu.render(element, canvas, source.width, source.height);
    gpu.finish();
    rows.push(["Apply LUT", "GPU (WebGL2)", (performance.now() - start) / runs, `Average of ${runs}, includes copy to a 2D canvas`]);
  }
  out.innerHTML = `<p class="note">${image.title}: ${source.width}×${source.height} (${mp.toFixed(2)} MP), theme ${theme.name}.</p>
  <table class="huet-surface-5 huet-border"><thead><tr><th>Step</th><th>Where</th><th>Time</th><th>Per megapixel</th><th>Notes</th></tr></thead><tbody>${rows
    .map(([step, where, ms, note]) => `<tr><td>${step}</td><td>${where}</td><td>${ms.toFixed(1)} ms</td><td>${step.startsWith("Build") ? "—" : (ms / mp).toFixed(1) + " ms"}</td><td>${note}</td></tr>`)
    .join("")}</tbody></table>`;
  button.disabled = false;
});

// ---- Downloads ----
function download(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
$("#cube").addEventListener("click", async () => {
  const theme = themes[state.theme];
  const { lut } = await lutFor(theme);
  download(new Blob([toCube(lut, lutSize(), `Huet ${theme.name}`)]), `huet-${slug(theme.name)}.cube`);
});
$("#png").addEventListener("click", () => {
  $<HTMLCanvasElement>("#focus-result").toBlob((blob) =>
    download(blob!, `${slug(images[state.focus].title)}-${slug(themes[state.theme].name)}.png`),
  );
});

// ---- Controls ----
themeSelect.addEventListener("change", () => {
  state.theme = Number(themeSelect.value);
  renderAll();
});
strength.addEventListener("input", () => {
  $("#strength-value").textContent = `${strength.value}%`;
  renderAll();
});
tint.addEventListener("input", () => {
  $("#tint-value").textContent = `${tint.value}%`;
  renderAll();
});
pageTheme.addEventListener("change", themePage);
function showOriginals() {
  app.classList.toggle("hide-originals", !originals.checked);
  for (const note of document.querySelectorAll(".pair-note"))
    note.textContent = originals.checked ? "Original · recolored" : "Recolored · hover for the original";
}
originals.addEventListener("change", showOriginals);
for (const control of [polarity, invertTheme, modeSelect, sizeSelect]) control.addEventListener("change", renderAll);
renderAll();
