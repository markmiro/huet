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
    w.images = await import("/packages/huet/src/core/images.ts");
    w.core = await import("/packages/huet/src/core/index.ts");
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
    w.canvasPixels = (canvas: HTMLCanvasElement) =>
      Array.from(canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data);
    w.tick = () => new Promise((r) => setTimeout(r));
    w.frames = async (count: number) => {
      for (let i = 0; i < count; i++) await new Promise((r) => requestAnimationFrame(r));
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
      const { images, core, fixture, pixels, canvasPixels, difference, tick } = window as any;
      const root = document.createElement("div");
      root.innerHTML = `<img data-huet-recolor class="photo" style="border: 1px solid red" src="${fixture}" alt="Ramp"><img class="plain" src="${fixture}" alt="">`;
      document.body.append(root);
      const img = root.querySelector<HTMLImageElement>("img[data-huet-recolor]")!;
      const original = await pixels(fixture);

      const sunset = core.createTheme({ neutral: { colors: ["#242744", "#ffe173"], colorModel: "hcl" } });
      const mount = images.mountImages(root, sunset, { hoverOriginal: true });
      await mount.ready();
      const canvas = img.nextElementSibling as HTMLCanvasElement;
      const shown = {
        canvas: canvas instanceof HTMLCanvasElement,
        imgDisplay: getComputedStyle(img).display,
        className: canvas.className,
        border: canvas.style.border,
        label: canvas.getAttribute("aria-label"),
        role: canvas.getAttribute("role"),
        src: img.getAttribute("src") === fixture,
      };
      const sunsetDiff = difference(original, canvasPixels(canvas));

      mount.update(core.createTheme());
      await mount.ready();
      const identityDiff = difference(original, canvasPixels(canvas));

      canvas.dispatchEvent(new PointerEvent("pointerenter"));
      const hovered = !canvas.isConnected && getComputedStyle(img).display !== "none";
      img.dispatchEvent(new PointerEvent("pointerleave"));
      const left = img.nextElementSibling === canvas && getComputedStyle(img).display === "none";

      img.className = "photo wide";
      img.alt = "";
      await tick();
      const mirrored = { className: canvas.className, hidden: canvas.getAttribute("aria-hidden") };

      // Images added later and new originals are picked up.
      mount.update(sunset);
      const added = Object.assign(document.createElement("img"), { src: fixture });
      added.setAttribute("data-huet-recolor", "");
      root.append(added);
      await tick();
      await mount.ready();
      const addedRecolored = added.nextElementSibling instanceof HTMLCanvasElement;
      const inverted = document.createElement("canvas");
      inverted.width = inverted.height = 4;
      const swapped = inverted.toDataURL();
      img.src = swapped;
      await tick();
      await mount.ready();
      const swappedSize = canvasPixels(img.nextElementSibling as HTMLCanvasElement).length / 4;

      mount.destroy();
      return {
        shown,
        sunsetDiff,
        identityDiff,
        hovered,
        left,
        mirrored,
        added: addedRecolored,
        swappedSize,
        canvases: root.querySelectorAll("canvas").length,
        restored: img.getAttribute("src") === swapped && img.getAttribute("style") === "border: 1px solid red;",
        marker: img.hasAttribute("data-huet-recolored"),
      };
    });
    expect(result.shown).toEqual({
      canvas: true,
      imgDisplay: "none",
      className: "photo",
      border: "1px solid red",
      label: "Ramp",
      role: "img",
      src: true,
    });
    expect(result.sunsetDiff).toBeGreaterThan(20);
    expect(result.identityDiff).toBeLessThan(3);
    expect(result.hovered).toBe(true);
    expect(result.left).toBe(true);
    expect(result.mirrored).toEqual({ className: "photo wide", hidden: "true" });
    expect(result.added).toBe(true);
    expect(result.swappedSize).toBe(16);
    expect(result.canvases).toBe(0);
    expect(result.restored).toBe(true);
    expect(result.marker).toBe(false);
    expect(errors).toEqual([]);
  });
}

test("mountImages leaves srcset alone and unreadable images as they are", async ({ page }) => {
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
      srcset: img.getAttribute("srcset") === `${fixture} 1x`,
      canvas: img.nextElementSibling instanceof HTMLCanvasElement,
      broken: broken.getAttribute("data-huet-recolored"),
      brokenVisible: getComputedStyle(broken).visibility,
      brokenCanvas: broken.nextElementSibling instanceof HTMLCanvasElement,
    };
    mount.destroy();
    return during;
  });
  expect(result).toEqual({
    srcset: true,
    canvas: true,
    broken: "original",
    brokenVisible: "visible",
    brokenCanvas: false,
  });
});

test("mountImages never paints the original", async ({ page }) => {
  await setup(page);
  const frames = await page.evaluate(async () => {
    const { images, core, fixture } = window as any;
    const root = document.createElement("div");
    document.body.prepend(root);
    const sunset = core.createTheme({ neutral: { colors: ["#242744", "#ffe173"], colorModel: "hcl" } });
    const mount = images.mountImages(root, sunset);
    const frames: string[] = [];
    let sampling = true;
    const sample = () => {
      for (const img of root.querySelectorAll("img")) {
        const style = getComputedStyle(img);
        if (style.visibility === "visible" && style.display !== "none" && img.complete) frames.push("original");
      }
      if (root.querySelector("canvas")) frames.push("recolored");
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
  expect(frames).toContain("recolored");
  expect(frames).not.toContain("original");
});

test("mountImages redraws once per frame, and only near the viewport", async ({ page }) => {
  await setup(page);
  const result = await page.evaluate(async () => {
    const { images, core, fixture, frames } = window as any;
    let draws = 0;
    const drawImage = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (this: CanvasRenderingContext2D, ...args: any[]) {
      if (this.canvas.getAttribute("role") === "img") draws++;
      return (drawImage as any).apply(this, args);
    };
    const root = document.createElement("div");
    root.innerHTML = `<img data-huet-recolor src="${fixture}" alt=""><div style="height: 500vh"></div><img data-huet-recolor id="far" src="${fixture}#far" alt="">`;
    document.body.prepend(root);
    window.scrollTo(0, 0);
    const [near, far] = root.querySelectorAll("img");
    const mount = images.mountImages(root, core.createTheme({ dark: "#302723" }));
    await frames(5);
    const initially = { near: !!near.nextElementSibling?.matches("canvas"), far: far.nextElementSibling !== null };

    draws = 0;
    for (const dark of ["#111111", "#222222", "#333333", "#444444"]) mount.update(core.createTheme({ dark }));
    await frames(3);
    const burst = draws;

    far.scrollIntoView();
    await frames(5);
    const scrolled = far.nextElementSibling instanceof HTMLCanvasElement;
    mount.destroy();
    window.scrollTo(0, 0);
    return { initially, burst, scrolled };
  });
  expect(result.initially).toEqual({ near: true, far: false });
  // Four updates in one frame draw the visible image once.
  expect(result.burst).toBe(1);
  expect(result.scrolled).toBe(true);
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
