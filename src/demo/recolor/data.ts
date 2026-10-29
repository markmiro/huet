import type { Palette } from "../../core/recolor";
import { hues } from "../../core/theme";
import themeConfigs from "../themeConfigs";

export interface RecolorTheme extends Palette {
  name: string;
  /** Where the theme's background sits on its ramp; below 0.5 is a dark theme. */
  background: number;
}

export const themes: RecolorTheme[] = [
  { name: "Huet default (identity)", background: 1 },
  ...themeConfigs.map(({ name = "", pallet, bgRampValue }) => ({
    name,
    dark: pallet.black,
    light: pallet.white,
    colors: Object.fromEntries(hues.map((hue) => [hue, pallet[hue]])),
    background: bgRampValue,
  })),
  { name: "Lab · White & blue", dark: "#233b91", light: "#ffffff", background: 1 },
  { name: "Lab · Paper", dark: "#302723", light: "#f1e4cd", background: 1 },
  { name: "Lab · Low contrast", dark: "#777479", light: "#b6b0ae", background: 0.7 },
];

export interface DemoImage {
  url: string;
  title: string;
  source: string;
  group: "markmiro" | "unsplash" | "emoji";
}

const urls = import.meta.glob<string>("./images/*/*", {
  eager: true,
  query: "?url",
  import: "default",
});
const unsplashTitles: Record<string, string> = {
  "1490750967868-88aa4486c946": "California poppies",
  "1508610048659-a06b669e3321": "Rainbow roses",
  "1455659817273-f96807779a8a": "Sunflowers",
  "1462275646964-a0e3386b89fa": "Cherry blossoms",
  "1444021465936-c6ca81d39b84": "Dahlia",
  "1496062031456-07b8f162a322": "Red rose",
  "1433086966358-54859d0ed716": "Multnomah Falls",
  "1441974231531-c6227db76b6e": "Forest path",
  "1426604966848-d7adac402bff": "Yosemite Valley",
};
const markmiroBase = "https://markmiro-website-content.s3.us-west-1.amazonaws.com/figma-export/";

export const images: DemoImage[] = Object.entries(urls).map(([path, url]) => {
  const [, group, file] = path.match(/\.\/images\/(\w+)\/(.+)$/) as unknown as string[];
  const stem = file.replace(/\.\w+$/, "");
  if (group === "unsplash")
    return {
      url,
      group,
      title: unsplashTitles[stem] ?? stem,
      source: `https://images.unsplash.com/photo-${stem}`,
    };
  return {
    url,
    group: "markmiro",
    title: stem
      .replace(/^project-thumb-|-2x$/g, "")
      .replace(/-/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase()),
    source:
      stem === "github-theme-red"
        ? "https://markmiro.com/projects/github-vscode-theme"
        : markmiroBase + file,
  };
});
// Show the colorful Unsplash photos first, in the order listed above.
const order = Object.values(unsplashTitles);
images.sort(
  (a, b) =>
    (a.group === b.group ? 0 : a.group === "unsplash" ? -1 : 1) ||
    order.indexOf(a.title) - order.indexOf(b.title),
);
