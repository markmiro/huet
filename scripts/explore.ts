import { parseColor, wcag, apca, chroma, hue } from "../src/color.ts";
import { resolve } from "../src/engine.ts";
import { createTheme, derive } from "../src/theme.ts";

const bgs = [1, 0.75, 0.6, 0.55, 0.51, 0.49, 0.45, 0.25, 0];
const probes = [
  ["text", ["text-100%"]],
  ["muted", ["text-50%"]],
  ["border25", ["border-25%"]],
  ["red text", ["text-red-100%"]],
  ["green text", ["text-green-100%"]],
  ["blue text", ["text-blue-100%"]],
  ["red bg10", ["bg-red-10%"]],
  ["red bg100", ["bg-red-100%"]],
] as const;

for (const bg of bgs) {
  const theme = createTheme({ bg });
  const d = derive(theme);
  const page = resolve([""], theme);
  const pageBg = resolve(["bg-0%"], theme).bg!;
  const line: string[] = [`bg=${bg} flip=${d.flip.toFixed(3)} page=${pageBg}`];
  for (const [label, stack] of probes) {
    const r = resolve(stack, theme);
    const c = (r.bg ?? (r as Record<string, string>)[label.startsWith("border") ? "border" : "text"])!;
    const lab = parseColor(c);
    line.push(
      `${label}: ${c} wcag=${wcag(lab, parseColor(pageBg)).toFixed(2)} Lc=${apca(lab, parseColor(pageBg)).toFixed(0)} C=${chroma(lab).toFixed(3)} h=${hue(lab).toFixed(0)}`
    );
  }
  console.log(line.join("\n  "));
  void page;
}
