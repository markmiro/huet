import { test, expect, type Page } from "@playwright/test";

const theme = { neutral: ["#123456", "#abcdef"], colors: { red: "#2f8f3f" } };
const other = { neutral: ["#242744", "#ffe173"], colorModel: "hcl" };
const fixture = "/packages/huet-emoji/src/fixtures/twemoji-subset";
// The solid red of Twemoji's heart.
const heart = [0xdd, 0x2e, 0x44];

// Vite serves the library source, so the page imports it like an app would.
async function setup(page: Page, css: string) {
  await page.goto("/lab.html");
  await page.evaluate(async (css) => {
    const w = window as any;
    w.emoji = await import("/packages/huet-emoji/src/index.ts");
    w.images = await import("/packages/huet/src/core/images.ts");
    w.errors = [];
    window.addEventListener("error", (event) => w.errors.push(event.message));
    document.head.append(Object.assign(document.createElement("style"), { textContent: css }));
    // Outside #page, which the demo themes itself.
    w.root = document.createElement("div");
    w.root.innerHTML = `<span id="heart" style="display: inline-block; font: 120px/1 'Test Emoji'">❤️</span>`;
    document.body.append(w.root);
    w.expected = (theme: object, [r, g, b]: number[]) =>
      w.images.recolorer(theme)(r / 255, g / 255, b / 255).map((value: number) => Math.round(value * 255));
    w.overrides = () =>
      /override-colors: (.*);/.exec(document.querySelector("style[data-huet-fonts]")?.textContent ?? "")?.[1].split(", ") ?? [];
    await document.fonts.load("120px 'Test Emoji'", "❤️");
  }, css);
}

/** The color at the middle of the heart, as the page paints it. */
async function heartColor(page: Page) {
  const shot = await page.locator("#heart").screenshot();
  return page.evaluate(async (png) => {
    const image = new Image();
    image.src = `data:image/png;base64,${png}`;
    await image.decode();
    const canvas = Object.assign(document.createElement("canvas"), { width: image.width, height: image.height });
    const context = canvas.getContext("2d")!;
    context.drawImage(image, 0, 0);
    return Array.from(context.getImageData(image.width >> 1, image.height >> 1, 1, 1).data.slice(0, 3));
  }, shot.toString("base64"));
}

const hasBrotli = (page: Page) =>
  page.evaluate(() => {
    try {
      new DecompressionStream("brotli" as CompressionFormat);
      return true;
    } catch {
      return false;
    }
  });

test("themes a font found through its @font-face rule, as live text", async ({ page }) => {
  const fetched: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "fetch") fetched.push(new URL(request.url()).pathname);
  });
  await setup(
    page,
    `@font-face { font-family: "Test Emoji"; src: url("${fixture}.woff2") format("woff2"), url("${fixture}.woff") format("woff"); }`,
  );
  expect(await heartColor(page)).toEqual(heart);

  const result = await page.evaluate(
    async ({ theme, heart }) => {
      const w = window as any;
      w.mount = w.emoji.mountFonts(w.root, theme, { fonts: ["Test Emoji"] });
      const before = w.root.style.getPropertyValue("font-palette");
      await w.mount.ready();
      return { before, name: w.root.style.getPropertyValue("font-palette"), overrides: w.overrides().length, expected: w.expected(theme, heart) };
    },
    { theme, heart },
  );
  // The palette is read first, so the font keeps its own colors until then.
  expect(result.before).toBe("");
  expect(result.name).toMatch(/^--huet-fonts-\d+$/);
  expect(result.overrides).toBe(20);
  // It reads the first source it can: Chromium can't decompress WOFF2 from a script.
  expect(fetched).toEqual([(await hasBrotli(page)) ? `${fixture}.woff2` : `${fixture}.woff`]);
  // The theme's red is green, and so is the heart, still as text.
  expect(result.expected).not.toEqual(heart);
  expect(await heartColor(page)).toEqual(result.expected);
  expect(await page.locator("#heart").textContent()).toBe("❤️");

  const updated = await page.evaluate(
    ({ other, heart }) => {
      const w = window as any;
      w.mount.update(other);
      return w.expected(other, heart);
    },
    { other, heart },
  );
  expect(updated).not.toEqual(result.expected);
  expect(await heartColor(page)).toEqual(updated);

  // At strength 0 and after destroy, the font paints its own colors.
  await page.evaluate((other) => (window as any).mount.update(other, { strength: 0 }), other);
  expect(await heartColor(page)).toEqual(heart);
  await page.evaluate((other) => (window as any).mount.update(other, { strength: 1 }), other);
  expect(await heartColor(page)).toEqual(updated);
  await page.evaluate(() => (window as any).mount.destroy());
  expect(await heartColor(page)).toEqual(heart);
  expect(await page.locator("style[data-huet-fonts]").count()).toBe(0);
  expect(await page.evaluate(() => (window as any).errors)).toEqual([]);
});

test("themes a WOFF2 font from a palette read ahead of time", async ({ page }) => {
  await setup(page, `@font-face { font-family: "Test Emoji"; src: url("${fixture}.woff2") format("woff2"); }`);
  // Where the browser can't read WOFF2, the font is reported and keeps its colors.
  if (!(await hasBrotli(page))) {
    const errors = await page.evaluate(async (theme) => {
      const w = window as any;
      const mount = w.emoji.mountFonts(w.root, theme, { fonts: ["Test Emoji"] });
      await mount.ready();
      mount.destroy();
      return w.errors.splice(0);
    }, theme);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain(`Huet couldn't theme the font "Test Emoji", so it keeps its own colors: this browser can't read WOFF2 files from a script.`);
    expect(await heartColor(page)).toEqual(heart);
  }

  const expected = await page.evaluate(
    async ({ theme, heart, fixture }) => {
      const w = window as any;
      // What `npx huet-emoji palette` writes, read here from the same font as WOFF.
      const colors = await w.emoji.readFontPalette(await (await fetch(`${fixture}.woff`)).arrayBuffer());
      w.emoji.mountFonts(w.root, theme, { fonts: [{ family: "Test Emoji", colors }] });
      // Given the palette, there's nothing to wait for.
      return { name: w.root.style.getPropertyValue("font-palette"), color: w.expected(theme, heart) };
    },
    { theme, heart, fixture },
  );
  expect(expected.name).toMatch(/^--huet-fonts-\d+$/);
  expect(await heartColor(page)).toEqual(expected.color);
  expect(await page.evaluate(() => (window as any).errors)).toEqual([]);
});

test("reports a family whose files have different palettes", async ({ page }) => {
  // Two files under one family name, as font services split fonts by unicode-range.
  await setup(
    page,
    `@font-face { font-family: "Test Emoji"; src: url("${fixture}.woff"); unicode-range: U+2600-27BF; }
     @font-face { font-family: "Test Emoji"; src: url("/src/demo/assets/fonts/twemoji-demo.ttf"); unicode-range: U+1F000-1FAFF; }`,
  );
  // A font with nothing but a one-color palette.
  await page.route("**/twemoji-demo.ttf", (route) => {
    const bytes = Buffer.alloc(46);
    bytes.writeUInt32BE(0x00010000, 0);
    bytes.writeUInt16BE(1, 4);
    bytes.write("CPAL", 12, "latin1");
    bytes.writeUInt32BE(28, 20);
    bytes.writeUInt32BE(18, 24);
    bytes.writeUInt16BE(1, 30); // entries
    bytes.writeUInt16BE(1, 32); // palettes
    bytes.writeUInt16BE(1, 34); // color records
    bytes.writeUInt32BE(14, 36); // offset to the records
    bytes.set([0x44, 0x2e, 0xdd, 0xff], 42);
    return route.fulfill({ body: bytes, contentType: "font/ttf" });
  });
  const result = await page.evaluate(async (theme) => {
    const w = window as any;
    const mount = w.emoji.mountFonts(w.root, theme, { fonts: ["Test Emoji"] });
    await mount.ready();
    return { errors: w.errors, palette: w.root.style.getPropertyValue("font-palette") };
  }, theme);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0]).toContain("its @font-face rules load files with different palettes");
  expect(result.palette).toBe("");
  expect(await heartColor(page)).toEqual(heart);
});
