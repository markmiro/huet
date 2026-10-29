import {
  createTheme,
  mountTheme,
  contrastRatio,
  type ThemeOptions,
} from "../core";
import { toOklab } from "../core/color";
import "../core/styles.css";
import "./lab.css";

const shell = document.querySelector<HTMLElement>("#lab")!;
shell.innerHTML = `
<header><a href="/">huet<span> / contrast lab</span></a><span class="tag">Plain JavaScript · no React</span></header>
<main><div class="intro"><p class="eyebrow">A SMALL COLOR SYSTEM FOR WORKING SOFTWARE</p><h1>Change the theme.<br>Keep the hierarchy.</h1><p>Relative surfaces, readable controls, and colors that still feel like themselves.</p></div>
<section class="controls" aria-label="Theme controls"><label>Theme <select id="preset"><option value="gray49">Gray · legacy 49%</option><option value="gray51">Gray · legacy 51%</option><option value="light">Light</option><option value="dark">Dark</option><option value="blue">White & blue</option><option value="paper">Paper</option><option value="soft">Intentionally low contrast</option></select></label><label>Background <input id="position" type="range" min="0" max="100" step="1"><output id="position-value"></output></label><label>Dark endpoint <input id="dark" type="color" value="#000000"></label><label>Light endpoint <input id="light" type="color" value="#ffffff"></label></section>
<div class="workspace" id="themed"><section class="account"><div class="section-heading"><span class="eyebrow">01 / FORM CONTROLS</span><span class="huet-muted">Nearest surface → inherited tokens</span></div><h2>Your workspace</h2><p class="huet-muted">Invite your team and make something useful.</p><form><label>Workspace name<input class="huet-surface-5 huet-border huet-focus" value="Studio North" required></label><p class="huet-text-green feedback">✓ This name is available</p><label>Email address<input class="huet-surface-5 huet-border huet-focus" type="email" value="alex@" aria-invalid="true" aria-describedby="email-error"></label><p class="huet-text-red feedback" id="email-error">Enter a complete email address</p><label>Default role<select class="huet-surface-5 huet-border huet-focus"><option>Editor</option><option>Viewer</option><option>Admin</option></select></label><div class="actions"><button type="button" class="huet-surface-blue huet-border huet-focus" id="invite">Create workspace</button><button type="button" class="huet-surface-10 huet-border" disabled>Invite later</button></div><p class="huet-muted small" id="status" aria-live="polite">Your settings can be changed at any time.</p></form></section>
<section class="nesting"><div class="section-heading"><span class="eyebrow">02 / NESTED SURFACES</span></div><div class="huet-surface-10 nested"><span class="huet-muted small">huet-surface-10</span><h3>A quieter panel</h3><p>Ordinary wrapper elements do not break inheritance.</p><div><div class="huet-surface-25 nested"><span class="huet-muted small">huet-surface-25</span><h3>One level deeper</h3><p class="huet-muted">Secondary text keeps its contrast.</p><div class="huet-surface-100 nested"><span class="huet-muted small">huet-surface-100</span><h3>Opposite end of the ramp</h3><button class="huet-surface-10 huet-border huet-focus" id="add">Add a nested surface</button><div id="added"></div></div></div></div></div></section>
<section class="signals"><div class="section-heading"><span class="eyebrow">03 / SEMANTIC COLORS</span></div><div class="chips">${["red", "yellow", "green", "blue", "purple"].map((hue) => `<div class="huet-surface-${hue} chip">${hue}</div>`).join("")}</div><p>${["red", "yellow", "green", "blue", "purple"].map((hue) => `<span class="huet-text-${hue}">${hue}</span>`).join(" · ")}</p></section>
</div><footer><p id="metrics"></p><p>Colors are resolved on surface boundaries; text inherits CSS variables. No component rerenders.</p><a href="/">Open the original React demo ↗</a></footer></main>`;
const root = document.querySelector<HTMLElement>("#themed")!;
const preset = document.querySelector<HTMLSelectElement>("#preset")!;
const position = document.querySelector<HTMLInputElement>("#position")!;
const dark = document.querySelector<HTMLInputElement>("#dark")!;
const light = document.querySelector<HTMLInputElement>("#light")!;
const presets: Record<string, ThemeOptions> = {
  gray49: { background: toOklab("#747474")[0] },
  gray51: { background: toOklab("#797979")[0] },
  light: { background: 1 },
  dark: { background: 0 },
  blue: { dark: "#233b91", light: "#ffffff", background: 1 },
  paper: { dark: "#302723", light: "#f1e4cd", background: 1 },
  soft: { dark: "#777479", light: "#b6b0ae", background: 0.7 },
};
let options: ThemeOptions = presets.gray49;
let theme = createTheme(options);
const controller = mountTheme(root, theme);
function report(elapsed: number) {
  const t = theme.tokens();
  document.querySelector("#metrics")!.textContent =
    `Root text ${contrastRatio(t.background, t.foreground).toFixed(2)}:1 · secondary ${contrastRatio(t.background, t.muted).toFixed(2)}:1 · border ${contrastRatio(t.background, t.border).toFixed(2)}:1 · theme update ${elapsed.toFixed(1)} ms`;
  document.querySelector("#position-value")!.textContent =
    `${Math.round((options.background ?? 1) * 100)}% OKLab`;
}
function update() {
  const start = performance.now();
  theme = createTheme(options);
  controller.update(theme);
  report(performance.now() - start);
}
function syncControls() {
  position.value = String((options.background ?? 1) * 100);
  dark.value = options.dark ?? "#000000";
  light.value = options.light ?? "#ffffff";
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
for (const [input, key] of [
  [dark, "dark"],
  [light, "light"],
] as const)
  input.addEventListener("input", () => {
    const next = { ...options, [key]: input.value };
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
