import type { Palette } from "huet/images";
import { hues } from "huet";
import { themeConfigs } from "huet/config";

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
  /** What an Unsplash photo shows, so pages can group them. */
  kind?: "face" | "macro" | "scene";
}

const urls = import.meta.glob<string>("./images/*/*", {
  eager: true,
  query: "?url",
  import: "default",
});
// Editorial, straight-from-camera photos for faces, depth, texture and mid tones
const unsplashPhotos: Record<string, [title: string, kind: NonNullable<DemoImage["kind"]>]> = {
  "1580489944761-15a19d654956": ["Woman, white background", "face"],
  "1507003211169-0a1dd7228f2d": ["Man, grey wall", "face"],
  "1632765854612-9b02b6ec2b15": ["Woman, grey backdrop", "face"],
  "1600752384899-7d3dcbb2428c": ["Honeybee on an aster", "macro"],
  "1679801250448-d3fbd4d6a3b2": ["Lichen on rock", "macro"],
  "1591588368590-7b6f50b87663": ["Feather", "macro"],
  "1671810456796-48fd984dd413": ["Human iris", "macro"],
  "1584714553526-15c9ea4ce83b": ["Mineral specimen", "macro"],
  "1571378023115-0df759b786aa": ["Nautilus shell", "macro"],
  "1553755322-56baa43a31d7": ["Forest in daylight", "scene"],
  "1676234324899-06e4134c1f59": ["Beach, sea and sky", "scene"],
  "1672279410716-c676739163e9": ["City skyline at dusk", "scene"],
  "1596003903067-bf5762ad5c19": ["Mountain lake", "scene"],
  "1580060092295-dbe639fffda3": ["Busy street", "scene"],
  "1559855604-f11cd5d385eb": ["Produce market", "scene"],
  "1771339140250-7450e666818e": ["Table of food", "scene"],
  "1784288195989-056788fdae4c": ["Kitchen in morning sun", "scene"],
  "1626248801379-51a0748a5f96": ["Rugby match", "scene"],
  "1760606370385-22e8dd8d2795": ["Snowy mountain village", "scene"],
  "1778694277039-5cbf0b9a1fcf": ["Candlelit restaurant", "scene"],
};
const markmiroBase = "https://markmiro-website-content.s3.us-west-1.amazonaws.com/figma-export/";

export const images: DemoImage[] = Object.entries(urls).map(([path, url]) => {
  const [, group, file] = path.match(/\.\/images\/(\w+)\/(.+)$/) as unknown as string[];
  const stem = file.replace(/\.\w+$/, "");
  if (group === "unsplash") {
    const [title, kind] = unsplashPhotos[stem] ?? [stem, "scene"];
    return { url, group, title, kind, source: `https://images.unsplash.com/photo-${stem}` };
  }
  return {
    url,
    group: "markmiro",
    title: stem
      .replace(/^project-thumb-|-2x$/g, "")
      .replace(/-/g, " ")
      .replace("migratingcranes", "migrating cranes")
      .replace(/^\w/, (c) => c.toUpperCase()),
    source:
      stem === "github-theme-red"
        ? "https://markmiro.com/projects/github-vscode-theme"
        : markmiroBase + file,
  };
});
// Show the Unsplash photos first, in the order listed above.
const order = Object.values(unsplashPhotos).map(([title]) => title);
images.sort(
  (a, b) =>
    (a.group === b.group ? 0 : a.group === "unsplash" ? -1 : 1) ||
    order.indexOf(a.title) - order.indexOf(b.title),
);
