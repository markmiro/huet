import "huet/huet.css";
import "./style.css";
import { applyTheme, defaultTheme, type ThemeInput } from "huet";

const themes: Record<string, ThemeInput> = {
  default: defaultTheme,
  ocean: { dark: "#1d2a3a", light: "#e8f0ff", hues: { red: "#e5484d", blue: "#3e63dd" } },
};
const range = document.querySelector<HTMLInputElement>("#bg")!;
const select = document.querySelector<HTMLSelectElement>("#theme")!;
// Keep the slider position when switching themes.
const apply = () => applyTheme(document.documentElement, { ...themes[select.value], bg: range.valueAsNumber });
range.addEventListener("input", apply);
select.addEventListener("change", apply);
