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
  // Port each legacy theme's gray ramp (stops and color model) to `neutral`,
  // e.g. Sunset in HCL and Astro through its peach middle stop.
  ...themeConfigs.map(({ name = "", pallet, ramps, bgRampValue }) => ({
    name,
    neutral: {
      colors: (ramps.gray.colors ?? ["black", "white"]).map((stop) => pallet[stop] ?? stop),
      colorModel: ramps.gray.colorModel ?? "lab",
    },
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
  // Editorial, straight-from-camera photos for faces, depth and mid tones
  "1553755322-56baa43a31d7": "Forest in daylight",
  "1676234324899-06e4134c1f59": "Beach, sea and sky",
  "1672279410716-c676739163e9": "City skyline at dusk",
  "1596003903067-bf5762ad5c19": "Mountain lake",
  "1580060092295-dbe639fffda3": "Busy street",
  "1559855604-f11cd5d385eb": "Produce market",
  "1771339140250-7450e666818e": "Table of food",
  "1784288195989-056788fdae4c": "Kitchen in morning sun",
  "1626248801379-51a0748a5f96": "Rugby match",
  "1760606370385-22e8dd8d2795": "Snowy mountain village",
  "1778694277039-5cbf0b9a1fcf": "Candlelit restaurant",
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
