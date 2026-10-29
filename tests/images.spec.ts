import { test, expect, type Page } from "@playwright/test";

// Vite serves the library source, so the page imports it like an app would.
async function setup(page: Page, { webgl = true } = {}) {
  if (!webgl)
    await page.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        return type === "webgl2" ? null : getContext.call(this, type as "2d", ...(rest as []));
      } as typeof getContext;
    });
  await page.goto("/lab.html");
  await page.evaluate(async () => {
    const w = window as any;
    w.images = await import("/src/core/images.ts");
    w.core = await import("/src/core/index.ts");
    // A gray ramp over a band of the default theme's hue anchors.
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 32;
    const context = canvas.getContext("2d")!;
    for (let x = 0; x < 64; x++) {
      const v = Math.round((x / 63) * 255);
      context.fillStyle = `rgb(${v},${v},${v})`;
      context.fillRect(x, 0, 1, 16);
    }
    ["#d14457", "#9d6f00", "#298830", "#0082dc", "#a359b9"].forEach((color, i) => {
      context.fillStyle = color;
      context.fillRect(i * 13, 16, 13, 16);
    });
    w.fixture = canvas.toDataURL();
    w.pixels = async (src: string) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      const c = document.createElement("canvas");
      c.width = image.naturalWidth;
      c.height = image.naturalHeight;
      const x = c.getContext("2d")!;
      x.drawImage(image, 0, 0);
      return Array.from(x.getImageData(0, 0, c.width, c.height).data);
    };
    w.difference = (a: number[], b: number[]) => {
      let sum = 0;
      for (let i = 0; i < a.length; i += 4)
        sum += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
      return sum / (a.length / 4);
    };
  });
}

for (const webgl of [true, false]) {
  test(`mountImages recolors, follows changes, and cleans up (${webgl ? "GPU" : "CPU"})`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await setup(page, { webgl });
    const result = await page.evaluate(async () => {
      const { images, core, fixture, pixels, difference } = window as any;
      const root = document.createElement("div");
      root.innerHTML = `<img data-huet-recolor src="${fixture}" alt=""><img class="plain" src="${fixture}" alt="">`;
      document.body.append(root);
      const img = root.querySelector<HTMLImageElement>("img[data-huet-recolor]")!;
      const original = await pixels(fixture);

      const sunset = core.createTheme({ neutral: { colors: ["#242744", "#ffe173"], colorModel: "hcl" } });
      const mount = images.mountImages(root, sunset, { hoverOriginal: true });
      await mount.ready();
      const recoloredSrc = img.src;
      const sunsetDiff = difference(original, await pixels(img.src));

      mount.update(core.createTheme());
      await mount.ready();
      const identityDiff = difference(original, await pixels(img.src));

      img.dispatchEvent(new PointerEvent("pointerenter"));
      const hovered = img.getAttribute("src");
      img.dispatchEvent(new PointerEvent("pointerleave"));

      // Images added later and new originals are picked up.
      mount.update(sunset);
      const added = Object.assign(document.createElement("img"), { src: fixture });
      added.setAttribute("data-huet-recolor", "");
      root.append(added);
      await new Promise((r) => setTimeout(r));
      await mount.ready();
      const addedRecolored = added.src.startsWith("blob:");
      const inverted = document.createElement("canvas");
      inverted.width = inverted.height = 4;
      const swapped = inverted.toDataURL();
      img.src = swapped;
      await new Promise((r) => setTimeout(r));
      await mount.ready();
      const afterSwap = await pixels(img.src);

      mount.destroy();
      return {
        recoloredSrc,
        sunsetDiff,
        identityDiff,
        hovered: hovered === fixture,
        added: addedRecolored,
        swappedSize: afterSwap.length / 4,
        restored: img.getAttribute("src") === swapped && added.getAttribute("src") === fixture,
        marker: img.hasAttribute("data-huet-recolored"),
        plain: root.querySelector<HTMLImageElement>(".plain")!.src === fixture,
      };
    });
    expect(result.recoloredSrc).toMatch(/^blob:/);
    expect(result.sunsetDiff).toBeGreaterThan(20);
    expect(result.identityDiff).toBeLessThan(3);
    expect(result.hovered).toBe(true);
    expect(result.added).toBe(true);
    expect(result.swappedSize).toBe(16);
    expect(result.restored).toBe(true);
    expect(result.marker).toBe(false);
    expect(result.plain).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("mountImages restores srcset and leaves unreadable images alone", async ({ page }) => {
  await setup(page);
  const result = await page.evaluate(async () => {
    const { images, core, fixture } = window as any;
    const root = document.createElement("div");
    root.innerHTML = `<img data-huet-recolor src="${fixture}" srcset="${fixture} 1x" alt=""><img data-huet-recolor id="broken" src="/missing.png" alt="">`;
    document.body.append(root);
    const [img, broken] = root.querySelectorAll("img");
    const mount = images.mountImages(root, core.createTheme({ dark: "#302723", light: "#f1e4cd" }));
    await mount.ready();
    const during = {
      srcset: img.hasAttribute("srcset"),
      src: img.src.startsWith("blob:"),
      broken: broken.getAttribute("data-huet-recolored"),
      brokenVisible: getComputedStyle(broken).visibility,
    };
    mount.destroy();
    return {
      during,
      srcset: img.getAttribute("srcset") === `${fixture} 1x`,
      broken: broken.getAttribute("src"),
    };
  });
  expect(result.during).toEqual({ srcset: false, src: true, broken: "original", brokenVisible: "visible" });
  expect(result.srcset).toBe(true);
  expect(result.broken).toBe("/missing.png");
});

test("mountImages never paints the original", async ({ page }) => {
  await setup(page);
  const frames = await page.evaluate(async () => {
    const { images, core, fixture } = window as any;
    const root = document.createElement("div");
    document.body.append(root);
    const sunset = core.createTheme({ neutral: { colors: ["#242744", "#ffe173"], colorModel: "hcl" } });
    const mount = images.mountImages(root, sunset);
    const frames: string[] = [];
    let sampling = true;
    const sample = () => {
      for (const img of root.querySelectorAll("img"))
        if (getComputedStyle(img).visibility === "visible" && img.complete)
          frames.push(img.currentSrc.startsWith("blob:") ? "recolored" : "original");
      if (sampling) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
    const add = () => {
      const img = Object.assign(document.createElement("img"), { src: `${fixture}#${Math.random()}` });
      img.setAttribute("data-huet-recolor", "");
      root.append(img);
      return img;
    };
    // An image added after mounting, and one whose src changes.
    const changed = add();
    await new Promise((r) => setTimeout(r, 50));
    await mount.ready();
    changed.src = `${fixture}#changed`;
    add();
    await new Promise((r) => setTimeout(r, 50));
    await mount.ready();
    mount.update(core.createTheme({ dark: "#302723", light: "#f1e4cd" }));
    await mount.ready();
    for (let i = 0; i < 3; i++) await new Promise((r) => requestAnimationFrame(r));
    sampling = false;
    mount.destroy();
    return frames;
  });
  expect(frames.length).toBeGreaterThan(0);
  expect(frames).not.toContain("original");
});

test("recolorImage matches on the GPU and CPU", async ({ browser }) => {
  const render = async (webgl: boolean) => {
    const page = await browser.newPage();
    await setup(page, { webgl });
    const data = await page.evaluate(async () => {
      const { images, core, fixture } = window as any;
      const image = new Image();
      image.src = fixture;
      await image.decode();
      const canvas = images.recolorImage(image, core.createTheme({ dark: "#233b91" }), { strength: 0.8 });
      return Array.from(canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data) as number[];
    });
    await page.close();
    return data;
  };
  const [gpu, cpu] = [await render(true), await render(false)];
  expect(gpu.length).toBe(cpu.length);
  let worst = 0;
  for (let i = 0; i < gpu.length; i++) worst = Math.max(worst, Math.abs(gpu[i] - cpu[i]));
  // The GPU stores the LUT in 8 bits; both interpolate trilinearly.
  expect(worst).toBeLessThanOrEqual(3);
});
