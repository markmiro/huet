import { test, expect, type Page } from "@playwright/test";

const theme = { neutral: ["#242744", "#ffe173"], colorModel: "hcl" };

// Vite serves the library source, so the page imports it like an app would.
async function setup(page: Page) {
  await page.goto("/lab.html");
  await page.evaluate(async () => {
    const w = window as any;
    w.images = await import("/packages/huet/src/core/images.ts");
    w.errors = [];
    window.addEventListener("error", (event) => w.errors.push(event.message));
    // A colorful band, so filters and recoloring both show.
    const canvas = document.createElement("canvas");
    canvas.width = 30;
    canvas.height = 10;
    const context = canvas.getContext("2d")!;
    ["#c83232", "#1ea05a", "#3264e6"].forEach((color, i) => {
      context.fillStyle = color;
      context.fillRect(i * 10, 0, 10, 10);
    });
    w.fixture = canvas.toDataURL();
    w.decode = async (src: string) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      return image;
    };
    w.pixels = (source: CanvasImageSource & { width: number; height: number }) => {
      const c = document.createElement("canvas");
      c.width = source.width;
      c.height = source.height;
      const x = c.getContext("2d")!;
      x.drawImage(source, 0, 0);
      return Array.from(x.getImageData(0, 0, c.width, c.height).data);
    };
    w.difference = (a: number[], b: number[]) => {
      let sum = 0;
      for (let i = 0; i < a.length; i += 4)
        sum += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
      return sum / (a.length / 4);
    };
    /** A paint through the theme, after a filter, as mountSvgs writes it. */
    w.expected = (theme: object, filter: string, [r, g, b]: number[]) => {
      const mapped = w.images.recolorer(theme, { filter }, "svgs")(r / 255, g / 255, b / 255);
      return `rgb(${mapped.map((v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255)).join(", ")})`;
    };
  });
}

test("mountSvgs recolors SVGs inside a marked wrapper through the wrapper's filter, and lifts it", async ({ page }) => {
  await setup(page);
  const result = await page.evaluate(async (theme) => {
    const w = window as any;
    const root = document.createElement("div");
    // As shadcn's registry directory renders logos: markup from a string, in a grayscale wrapper.
    root.innerHTML = `<div id="wrap" data-huet-recolor class="logo" style="filter: grayscale(1) blur(0px)"><svg style="fill: var(--ink, black)"><rect id="solid" fill="rgb(200, 50, 50)" /><rect id="live" /></svg></div>`;
    document.body.append(root);
    const original = root.innerHTML;
    const wrap = root.querySelector<HTMLElement>("#wrap")!;
    const paint = (id: string) => getComputedStyle(root.querySelector(`#${id}`)!).fill;

    const mount = w.images.mountSvgs(root, theme);
    const mounted = {
      filter: getComputedStyle(wrap).filter,
      solid: paint("solid"),
      // The page's CSS already themes this one, so it's left connected.
      live: paint("live"),
      expected: w.expected(theme, "grayscale(1) blur(0px)", [200, 50, 50]),
      unfiltered: w.expected(theme, "", [200, 50, 50]),
    };

    mount.update({ ...theme, svgs: { strength: 0 } });
    await mount.ready();
    const off = { filter: getComputedStyle(wrap).filter, solid: paint("solid"), markup: root.innerHTML };

    mount.update(theme);
    await mount.ready();
    const on = getComputedStyle(wrap).filter;
    mount.destroy();
    return { mounted, off, on, original, destroyed: root.innerHTML, errors: w.errors };
  }, theme);

  // Only the color function is lifted; the blur stays.
  expect(result.mounted.filter).toBe("blur(0px)");
  expect(result.mounted.solid).toBe(result.mounted.expected);
  expect(result.mounted.solid).not.toBe(result.mounted.unfiltered);
  expect(result.mounted.live).toBe("rgb(0, 0, 0)");
  expect(result.off).toEqual({ filter: "grayscale(1) blur(0px)", solid: "rgb(200, 50, 50)", markup: result.original });
  expect(result.on).toBe("blur(0px)");
  expect(result.destroyed).toBe(result.original);
  expect(result.errors).toEqual([]);
});

test("mountSvgs recolors raster images inside SVGs, and reports ones it can't read", async ({ page }) => {
  await setup(page);
  const result = await page.evaluate(async (theme) => {
    const w = window as any;
    const root = document.createElement("div");
    root.innerHTML = `<svg data-huet-recolor style="filter: grayscale(1)" width="30" height="10"><image id="raster" href="${w.fixture}" width="30" height="10" /></svg><svg data-huet-recolor><image id="broken" href="data:image/png;base64,AAAA" /></svg>`;
    document.body.append(root);
    const original = root.innerHTML;
    const raster = root.querySelector<SVGImageElement>("#raster")!;

    const mount = w.images.mountSvgs(root, theme);
    // Hidden until its recolored copy is ready, so the original never shows.
    const pending = raster.getAttribute("visibility");
    await mount.ready();
    const href = raster.getAttribute("href")!;
    const expected = w.pixels(
      w.images.recolorImage(await w.decode(w.fixture), { ...theme, images: theme.svgs }, { filter: "grayscale(1)" }),
    );
    const recolored = {
      href: href.slice(0, 22),
      visibility: raster.getAttribute("visibility"),
      fromExpected: w.difference(w.pixels(await w.decode(href)), expected),
      fromOriginal: w.difference(w.pixels(await w.decode(href)), w.pixels(await w.decode(w.fixture))),
    };

    // A new theme keeps the last copy until its own is ready, so it doesn't flash.
    mount.update({ ...theme, neutral: ["#000000", "#ff8800"] });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const meanwhile = raster.getAttribute("href") === href;
    await mount.ready();
    const updated = raster.getAttribute("href") !== href;

    mount.destroy();
    return { pending, recolored, meanwhile, updated, original, destroyed: root.innerHTML, errors: w.errors };
  }, theme);

  expect(result.pending).toBe("hidden");
  expect(result.recolored.href).toBe("data:image/png;base64,");
  expect(result.recolored.visibility).toBeNull();
  expect(result.recolored.fromExpected).toBeLessThan(1);
  expect(result.recolored.fromOriginal).toBeGreaterThan(20);
  expect(result.meanwhile).toBe(true);
  expect(result.updated).toBe(true);
  expect(result.destroyed).toBe(result.original);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0]).toMatch(/couldn't read the raster <image> inside <svg>/);
});

test("mountSvgs reports a color filter it can't lift, once", async ({ page }) => {
  await setup(page);
  const result = await page.evaluate(async (theme) => {
    const w = window as any;
    const root = document.createElement("div");
    root.innerHTML = `<div id="card" class="card" style="filter: sepia(1)"><p>Caption</p><svg data-huet-recolor><rect fill="white" /></svg></div>`;
    document.body.append(root);
    const mount = w.images.mountSvgs(root, theme);
    mount.update({ ...theme, neutral: ["#000000", "#ff8800"] });
    await mount.ready();
    const filter = getComputedStyle(root.querySelector("#card")!).filter;
    mount.destroy();
    return { filter, errors: w.errors };
  }, theme);

  // Lifting it would also change the caption.
  expect(result.filter).toBe("sepia(1)");
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0]).toMatch(/its ancestor <div#card\.card> has `filter: sepia\(1\)`/);
});

test("mountImages folds the image's and its wrapper's filters into the canvas", async ({ page }) => {
  await setup(page);
  const result = await page.evaluate(async (theme) => {
    const w = window as any;
    const root = document.createElement("div");
    // shadcn's avatars put the filter on a wrapper; its article photos put it on the image.
    root.innerHTML = `<span id="avatar" style="filter: sepia(1)"><img id="wrapped" data-huet-recolor src="${w.fixture}" alt=""></span><div data-huet-recolor><img id="own" class="photo" style="filter: brightness(0.5) grayscale(1)" src="${w.fixture}" alt=""></div>`;
    document.body.append(root);
    const own = root.querySelector<HTMLImageElement>("#own")!;
    const wrapped = root.querySelector<HTMLImageElement>("#wrapped")!;
    const avatar = root.querySelector<HTMLElement>("#avatar")!;
    const image = await w.decode(w.fixture);
    const drawn = (img: HTMLImageElement, filter: string) =>
      w.difference(w.pixels(img.nextElementSibling), w.pixels(w.images.recolorImage(image, theme, { filter })));

    const mount = w.images.mountImages(root, theme);
    await mount.ready();
    const canvas = own.nextElementSibling as HTMLCanvasElement;
    const mounted = {
      // Picked up through the marked wrapper.
      own: own.getAttribute("data-huet-recolored"),
      canvasFilter: getComputedStyle(canvas).filter,
      fromOwn: drawn(own, "brightness(0.5) grayscale(1)"),
      fromUnfiltered: drawn(own, ""),
      avatarFilter: getComputedStyle(avatar).filter,
      fromWrapped: drawn(wrapped, "sepia(1)"),
    };
    mount.destroy();
    const destroyed = { avatarStyle: avatar.getAttribute("style"), canvases: root.querySelectorAll("canvas").length };
    return { mounted, destroyed, errors: w.errors };
  }, theme);

  expect(result.mounted.own).toBe("");
  expect(result.mounted.canvasFilter).toBe("none");
  expect(result.mounted.fromOwn).toBeLessThan(1);
  expect(result.mounted.fromUnfiltered).toBeGreaterThan(20);
  expect(result.mounted.avatarFilter).toBe("none");
  expect(result.mounted.fromWrapped).toBeLessThan(1);
  expect(result.destroyed).toEqual({ avatarStyle: "filter: sepia(1)", canvases: 0 });
  expect(result.errors).toEqual([]);
});

test("mountImages reports a color filter it can't lift", async ({ page }) => {
  await setup(page);
  const result = await page.evaluate(async (theme) => {
    const w = window as any;
    const root = document.createElement("div");
    root.innerHTML = `<figure style="filter: grayscale(1)"><img data-huet-recolor src="${w.fixture}" alt=""><figcaption>Caption</figcaption></figure>`;
    document.body.append(root);
    const mount = w.images.mountImages(root, theme);
    await mount.ready();
    mount.update({ ...theme, neutral: ["#000000", "#ff8800"] });
    await mount.ready();
    const filter = getComputedStyle(root.querySelector("figure")!).filter;
    mount.destroy();
    return { filter, errors: w.errors };
  }, theme);

  expect(result.filter).toBe("grayscale(1)");
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0]).toMatch(/Huet recolored <img>, but its ancestor <figure> has `filter: grayscale\(1\)`/);
});
