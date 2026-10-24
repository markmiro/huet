import { applyTheme } from "../src/index.ts";
import { themes } from "./themes.ts";

const params = new URLSearchParams(location.search);
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;

const themeSelect = $<HTMLSelectElement>("theme")!;
const bgInput = $<HTMLInputElement>("bg")!;
const contrastInput = $<HTMLInputElement>("contrast")!;

for (const name of Object.keys(themes)) themeSelect.add(new Option(name, name));
themeSelect.value = params.get("theme") ?? "Base";

function setTheme(fromThemeDefaults: boolean) {
  const theme = themes[themeSelect.value] ?? themes.Base;
  if (fromThemeDefaults) {
    bgInput.value = params.get("bg") ?? String(theme.bg);
    contrastInput.value = params.get("contrast") ?? String(theme.contrast);
    params.delete("bg");
    params.delete("contrast");
  }
  const bg = Number(bgInput.value);
  const contrast = Number(contrastInput.value);
  // A handful of custom properties on <html>. No re-render, just a style recalc.
  applyTheme(document.documentElement, { ...theme, bg, contrast });
  $("bg-out")!.textContent = bg.toFixed(2);
  $("contrast-out")!.textContent = contrast.toFixed(2);
  const name = $("theme-name");
  if (name) name.textContent = themeSelect.value;
  const url = new URL(location.href);
  url.searchParams.set("theme", themeSelect.value);
  url.searchParams.set("bg", String(bg));
  url.searchParams.set("contrast", String(contrast));
  history.replaceState(null, "", url);
}

themeSelect.addEventListener("change", () => setTheme(true));
bgInput.addEventListener("input", () => setTheme(false));
contrastInput.addEventListener("input", () => setTheme(false));
setTheme(true);

// Selectable rows: swap the bg-* class. The classes are listed in style.css via @source inline().
const row = $<HTMLInputElement>("row");
row?.addEventListener("input", () => {
  const n = Number(row.value);
  $("row-out")!.textContent = `${n}%`;
  for (const el of document.querySelectorAll<HTMLElement>(".row")) {
    el.className = el.className.replace(/(^|\s)(hover:)?bg-\d+%/g, "");
    el.classList.add(`bg-${n}%`, `hover:bg-${Math.max(0, n - 10)}%`);
  }
});
