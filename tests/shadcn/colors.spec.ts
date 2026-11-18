import { test, expect, type Page, type Frame } from "@playwright/test";

import { contrast } from "../../packages/huet/src/core/color";
import { themes } from "../../packages/huet/src/core/themes";
import type { Theme } from "../../packages/huet/src/core/theme";

// Sunset's neutrals are navy to yellow, so anything still on shadcn's own
// grays (or Tailwind's own green) stands out.
const sunset = themes.Sunset;

/** Loads `path` with `theme` (Sunset by default) saved, once Huet has painted the page. */
async function open(page: Page, path: string, background: number, theme: Theme = sunset) {
  await page.goto(path);
  await page.evaluate(
    ([theme, background]) => {
      localStorage.setItem("huet-shadcn", JSON.stringify({ theme, background }));
      localStorage.setItem("shadcn-create-welcome-dialog", "true");
    },
    [theme, background] as const,
  );
  await page.reload();
  await page.waitForFunction(() => document.getElementById("huet-dark"));
}

/** OKLCH chroma of sRGB channels (0–255), through OKLab. */
function chromaOf([r, g, b]: number[]) {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const b2 = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return Math.hypot(a, b2);
}

/**
 * An element's computed color property as opaque sRGB channels (0–255).
 * Computed colors may be oklab() or color-mix() results, so a canvas
 * converts them.
 */
const colorOf = (page: Page, selector: string, property: "backgroundColor" | "fill" | "color") =>
  page
    .locator(selector)
    .first()
    .evaluate((el, property) => {
      const context = document.createElement("canvas").getContext("2d")!;
      context.fillStyle = getComputedStyle(el)[property];
      context.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
      // Undo the translucency against black, so only the color is compared.
      return [r, g, b].map((v) => (a ? (v * 255) / a : 0));
    }, property);

for (const [mode, background] of [["light", 1], ["dark", 0]] as const) {
  test(`/typeset's menu and toolbar take the theme's dark colors (${mode})`, async ({ page }) => {
    await open(page, "/typeset", background);
    // shadcn's .dark card is a neutral gray; Sunset's dark end is navy.
    for (const selector of ["[data-slot=card].dark", "div.dark.rounded-xl"])
      await expect.poll(async () => chromaOf(await colorOf(page, selector, "backgroundColor"))).toBeGreaterThan(0.02);
  });

  test(`/create's menu, toolbar and waveform follow the theme (${mode})`, async ({ page }) => {
    await open(page, "/create?item=preview", background);
    for (const selector of ["[data-slot=card].dark", "div.dark.absolute.right-3"])
      await expect.poll(async () => chromaOf(await colorOf(page, selector, "backgroundColor"))).toBeGreaterThan(0.02);

    const frame = page.frameLocator("iframe").first();
    const card = frame.locator("[data-slot=card]", { hasText: "Live Audio Waveform" }).first();
    await card.scrollIntoViewIfNeeded();
    // The bars were a fixed `gray`: no chroma whatever the theme.
    await expect
      .poll(() =>
        card.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
          const { data } = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height);
          let best = 0;
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] < 200) continue;
            best = Math.max(best, Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]));
          }
          return best;
        }),
      )
      .toBeGreaterThan(30);
  });

  test(`dashboard-01's done check is the theme's green (${mode})`, async ({ page }) => {
    await open(page, "/view/new-york-v4/dashboard-01", background);
    const [r, g, b] = await colorOf(page, "svg.fill-green-500", "fill");
    // Tailwind's green-500 is a bright #22c55e. Sunset's green is #008d29,
    // and green-400 on dark pages sits just above it.
    expect(g).toBeGreaterThan(r + 60);
    expect(g).toBeGreaterThan(b + 40);
    expect(g).toBeLessThan(background ? 160 : 200);
  });

  test(`text without a color class takes the theme's foreground (${mode})`, async ({ page }) => {
    // shadcn never sets body's color, so this text kept the browser's black
    // (or white on a dark page) whatever the theme.
    await open(page, "/blocks", background);
    const foreground = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.style.color = "var(--foreground)";
      document.body.append(probe);
      const context = document.createElement("canvas").getContext("2d")!;
      context.fillStyle = getComputedStyle(probe).color;
      probe.remove();
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
    });
    expect(chromaOf(foreground)).toBeGreaterThan(0.02);
    await expect.poll(() => colorOf(page, "a[href='#dashboard-01']", "color")).toEqual(foreground);

    await open(page, "/view/new-york-v4/dashboard-01", background);
    await expect.poll(() => colorOf(page, "h1", "color")).toEqual(foreground);
  });
}

// Radioactive runs gray to lime: its text only reaches about Lc 60 on a card.
const radioactive = themes.Radioactive;

for (const [mode, background] of [["light", 1], ["dark", 0]] as const) {
  test(`muted text stays readable on a narrow ramp (${mode})`, async ({ page }) => {
    // The step shadcn's muted gray maps to read at Lc 34 on Radioactive's cards.
    await open(page, "/", background, radioactive);
    const [card, muted] = await page.evaluate(() =>
      ["--card", "--muted-foreground"].map((name) => document.documentElement.style.getPropertyValue(name)),
    );
    expect(contrast(card, muted)).toBeGreaterThanOrEqual(44.5);
  });
}

test("GitHub avatars load and take the theme", async ({ page }) => {
  // github.com/<user>.png redirects without CORS headers, so the CORS request
  // Huet needs to read the pixels failed and every avatar showed as broken.
  await open(page, "/preview/radix/preview", 0, radioactive);
  const avatars = page.locator("[data-slot=avatar] img");
  await expect(avatars.first()).toBeAttached();
  await expect
    .poll(() =>
      avatars.evaluateAll((images) =>
        (images as HTMLImageElement[]).filter(
          (img) => !(img.naturalWidth > 0 && img.getAttribute("data-huet-recolored") === ""),
        ).map((img) => img.src),
      ),
    )
    .toEqual([]);
});

test("an image from a host without CORS shows its original", async ({ page }) => {
  await open(page, "/", 0, radioactive);
  // Another origin that sends no CORS headers: the same server by IP.
  const src = new URL("/apple-touch-icon.png", page.url()).href.replace("localhost", "127.0.0.1");
  await page.evaluate((src) => {
    const img = document.createElement("img");
    img.id = "no-cors";
    img.src = src;
    document.body.prepend(img);
  }, src);
  const img = page.locator("#no-cors");
  await expect(img).toHaveAttribute("data-huet-recolored", "original");
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  await expect(img).toBeVisible();
});

test("the /create preview's QR code takes the theme, like its frame", async ({ page }) => {
  // The frame's bg-white becomes the theme's light end; a QR code left black
  // on white sat inside it like a sticker.
  await open(page, "/preview/radix/preview-02", 0, radioactive);
  const qr = page.locator("svg[data-huet-recolor]").first();
  await expect(qr).toBeAttached();
  await expect
    .poll(() =>
      qr.evaluate((svg) =>
        [...svg.querySelectorAll("path")].map((path) => getComputedStyle(path).fill),
      ),
    )
    .not.toContain("rgb(0, 0, 0)");
});
