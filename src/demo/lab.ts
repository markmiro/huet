import {
  createTheme,
  mountTheme,
  contrastRatio,
  type ColorModel,
  type ThemeOptions,
} from "../core";
import { toOklab } from "../core/color";
import "../core/styles.css";
import "./lab.css";

const shell = document.querySelector<HTMLElement>("#lab")!;
shell.innerHTML = `
<header><a href="${import.meta.env.BASE_URL}">huet<span> / contrast lab</span></a><span class="tag">Plain JavaScript · no React</span></header>
<main><div class="intro"><p class="eyebrow">A SMALL COLOR SYSTEM FOR WORKING SOFTWARE</p><h1>Change the theme.<br>Keep the hierarchy.</h1><p>Relative surfaces, readable controls, and colors that still feel like themselves.</p></div>
<section class="controls" aria-label="Theme controls"><label>Theme <select id="preset"><option value="gray49">Gray · legacy 49%</option><option value="gray51">Gray · legacy 51%</option><option value="light">Light</option><option value="dark">Dark</option><option value="blue">White & blue</option><option value="paper">Paper</option><option value="soft">Intentionally low contrast</option><option value="sunset">Sunset · HCL</option><option value="astro">Astro · HCL through peach</option></select></label><label>Background <input id="position" type="range" min="0" max="100" step="1"><output id="position-value"></output></label><label>Dark endpoint <input id="dark" type="color" value="#000000"></label><label>Light endpoint <input id="light" type="color" value="#ffffff"></label><label><input id="use-middle" type="checkbox"> Middle stop <input id="middle" type="color" value="#ffb980" aria-label="Middle stop color"></label><label>Color model <select id="model"><option value="">OKLab (default)</option><option value="hcl">HCL</option><option value="oklch">OKLCH</option><option value="lch">LCH</option><option value="lab">Lab</option><option value="lrgb">Linear RGB</option><option value="rgb">RGB</option><option value="hsl">HSL</option></select></label></section>
<div class="workspace" id="themed"><section class="account"><div class="section-heading"><span class="eyebrow">01 / FORM CONTROLS</span><span class="huet-muted">Nearest surface → inherited tokens</span></div><h2>Your workspace</h2><p class="huet-muted">Invite your team and make something useful.</p><form><label>Workspace name<input class="huet-surface-5 huet-border huet-focus" value="Studio North" required></label><p class="huet-text-green feedback">✓ This name is available</p><label>Email address<input class="huet-surface-5 huet-border huet-focus" type="email" value="alex@" aria-invalid="true" aria-describedby="email-error"></label><p class="huet-text-red feedback" id="email-error">Enter a complete email address</p><label>Default role<select class="huet-surface-5 huet-border huet-focus"><option>Editor</option><option>Viewer</option><option>Admin</option></select></label><div class="actions"><button type="button" class="huet-surface-blue huet-border huet-focus" id="invite">Create workspace</button><button type="button" class="huet-surface-10 huet-border" disabled>Invite later</button></div><p class="huet-muted small" id="status" aria-live="polite">Your settings can be changed at any time.</p></form></section>
<section class="nesting"><div class="section-heading"><span class="eyebrow">02 / NESTED SURFACES</span></div><div class="huet-surface-10 nested"><span class="huet-muted small">huet-surface-10</span><h3>A quieter panel</h3><p>Ordinary wrapper elements do not break inheritance.</p><div><div class="huet-surface-25 nested"><span class="huet-muted small">huet-surface-25</span><h3>One level deeper</h3><p class="huet-muted">Secondary text keeps its contrast.</p><div class="huet-surface-100 nested"><span class="huet-muted small">huet-surface-100</span><h3>Opposite end of the ramp</h3><button class="huet-surface-10 huet-border huet-focus" id="add">Add a nested surface</button><div id="added"></div></div></div></div></div></section>
<section class="signals"><div class="section-heading"><span class="eyebrow">03 / SEMANTIC COLORS</span></div><div class="chips">${["red", "yellow", "green", "blue", "purple"].map((hue) => `<div class="huet-surface-${hue} chip">${hue}</div>`).join("")}</div><p>${["red", "yellow", "green", "blue", "purple"].map((hue) => `<span class="huet-text-${hue}">${hue}</span>`).join(" · ")}</p></section>
<section class="ramp"><div class="section-heading"><span class="eyebrow">04 / NEUTRAL RAMP</span><span class="huet-muted" id="ramp-label"></span></div><div class="ramp-path" id="ramp-path" aria-hidden="true"></div><div class="swatches">${Array.from({ length: 11 }, (_, i) => `<div class="huet-bg-${i * 10} swatch"><code>huet-bg-${i * 10}</code><span class="huet-bg/text-60">text-60</span></div>`).join("")}</div></section>
</div><footer><p id="metrics"></p><p>Colors are resolved on surface boundaries; text inherits CSS variables. No component rerenders.</p><a href="${import.meta.env.BASE_URL}">Open the original React demo ↗</a></footer></main>`;
const root = document.querySelector<HTMLElement>("#themed")!;
const preset = document.querySelector<HTMLSelectElement>("#preset")!;
const position = document.querySelector<HTMLInputElement>("#position")!;
const dark = document.querySelector<HTMLInputElement>("#dark")!;
const light = document.querySelector<HTMLInputElement>("#light")!;
const useMiddle = document.querySelector<HTMLInputElement>("#use-middle")!;
const middle = document.querySelector<HTMLInputElement>("#middle")!;
const model = document.querySelector<HTMLSelectElement>("#model")!;
const presets: Record<string, ThemeOptions> = {
  gray49: { background: toOklab("#747474")[0] },
  gray51: { background: toOklab("#797979")[0] },
  light: { background: 1 },
  dark: { background: 0 },
  blue: { dark: "#233b91", light: "#ffffff", background: 1 },
  paper: { dark: "#302723", light: "#f1e4cd", background: 1 },
  soft: { dark: "#777479", light: "#b6b0ae", background: 0.7 },
  // The original React demo's multi-hue themes, ported to huet/core.
  sunset: {
    neutral: { colors: ["#242744", "#ffe173"], colorModel: "hcl" },
    background: 0,
    colors: { red: "#f20031", yellow: "#c16000", green: "#008d29", blue: "#12889d", purple: "#b555c8" },
  },
  astro: {
    neutral: { colors: ["#040816", "#ffb980", "#ffffff"], colorModel: "hcl" },
    background: 0,
    colors: { red: "#cb1c00", yellow: "#bd8f5a", green: "#02b984", blue: "#4f81a7", purple: "#b982d5" },
  },
};
let options: ThemeOptions = presets.gray49;
let theme = createTheme(options);
const controller = mountTheme(root, theme);
function report(elapsed: number) {
  const t = theme.tokens();
  document.querySelector("#metrics")!.textContent =
    `Root text ${contrastRatio(t.background, t.foreground).toFixed(2)}:1 · secondary ${contrastRatio(t.background, t.muted).toFixed(2)}:1 · border ${contrastRatio(t.background, t.border).toFixed(2)}:1 · theme update ${elapsed.toFixed(1)} ms`;
  document.querySelector("#position-value")!.textContent =
    `${Math.round((options.background ?? 1) * 100)}% ${theme.neutral.colorModel}`;
  document.querySelector("#ramp-label")!.textContent =
    `${theme.neutral.colors.join(" → ")} in ${theme.neutral.colorModel}`;
  document.querySelector<HTMLElement>("#ramp-path")!.style.background =
    `linear-gradient(to right, ${Array.from({ length: 33 }, (_, i) => theme.ramp(i / 32)).join(", ")})`;
}
function update() {
  const start = performance.now();
  theme = createTheme(options);
  controller.update(theme);
  report(performance.now() - start);
}
function syncControls() {
  position.value = String((options.background ?? 1) * 100);
  const stops = options.neutral?.colors ?? [options.dark ?? "#000000", options.light ?? "#ffffff"];
  dark.value = stops[0];
  light.value = stops[stops.length - 1];
  useMiddle.checked = stops.length > 2;
  if (stops.length > 2) middle.value = stops[1];
  model.value = options.neutral?.colorModel ?? "";
}
/** Endpoints only and no model → dark/light; otherwise a full neutral ramp. */
function fromControls(): ThemeOptions {
  const { dark: _dark, light: _light, neutral: _neutral, ...rest } = options;
  const stops = [dark.value, ...(useMiddle.checked ? [middle.value] : []), light.value];
  return model.value || stops.length > 2
    ? { ...rest, neutral: { colors: stops, colorModel: (model.value || undefined) as ColorModel | undefined } }
    : { ...rest, dark: dark.value, light: light.value };
}
preset.addEventListener("change", () => {
  options = { ...presets[preset.value] };
  syncControls();
  update();
});
position.addEventListener("input", () => {
  options = { ...options, background: Number(position.value) / 100 };
  update();
});
for (const input of [dark, light, useMiddle, middle, model])
  input.addEventListener("input", () => {
    const next = fromControls();
    try {
      createTheme(next);
      options = next;
      input.setCustomValidity("");
      update();
    } catch {
      input.setCustomValidity(
        "The dark endpoint must be darker than the light endpoint.",
      );
      input.reportValidity();
    }
  });
document.querySelector("#add")!.addEventListener("click", () => {
  const panel = document.createElement("div");
  panel.className = "huet-surface-25 nested";
  panel.innerHTML =
    '<strong>Inserted after mount</strong><p class="huet-muted">Automatically inherits from the nearest surface.</p>';
  document.querySelector("#added")!.append(panel);
});
document.querySelector("#invite")!.addEventListener("click", () => {
  document.querySelector("#status")!.textContent =
    "Demo only — no workspace was created.";
});
syncControls();
report(0);
if (import.meta.hot) import.meta.hot.dispose(() => controller.destroy());
