import { test, expect, type Page } from "@playwright/test";
import { fileURLToPath } from "node:url";

// Videos and iframes, which Huet lays layers over instead of replacing.
// Vite serves the library source, so the page imports it like an app would.
const clip = "/src/demo/assets/video/market.webm";
const poster = "/src/demo/assets/video/market-poster.jpg";

async function setup(page: Page) {
  // Another origin, serving the repo's files without CORS headers.
  await page.route("https://elsewhere.test/**", (route) =>
    route.fulfill({ path: fileURLToPath(new URL(".." + new URL(route.request().url()).pathname, import.meta.url)) }),
  );
  await page.goto("/lab.html");
  await page.evaluate(async () => {
    const w = window as any;
    w.images = await import("/packages/huet/src/core/images.ts");
    w.elsewhere = (path: string) => `https://elsewhere.test${path}`;
    // What a proxy on the page's own origin would do.
    w.here = (src: string) => {
      const url = new URL(src);
      return url.hostname === "elsewhere.test" ? location.origin + url.pathname : src;
    };
    // A source's pixels at the size of the canvas it's compared with.
    w.frame = (source: HTMLVideoElement | HTMLCanvasElement, like: HTMLCanvasElement) => {
      const c = document.createElement("canvas");
      c.width = like.width;
      c.height = like.height;
      c.getContext("2d")!.drawImage(source, 0, 0, c.width, c.height);
      return Array.from(c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data);
    };
    w.difference = (a: number[], b: number[]) => {
      let sum = 0;
      for (let i = 0; i < a.length; i += 4)
        sum += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
      return sum / (a.length / 4);
    };
    w.until = async (check: () => boolean, ms = 5000) => {
      const start = performance.now();
      while (!check()) {
        if (performance.now() - start > ms) throw new Error("Timed out: " + check);
        await new Promise((r) => setTimeout(r, 20));
      }
    };
    w.event = (target: EventTarget, type: string) => new Promise((r) => target.addEventListener(type, r, { once: true }));
  });
}

test("mountVideos recolors frames and the poster, follows the theme and hover, and cleans up", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await setup(page);
  const result = await page.evaluate(
    async (clip) => {
      const { images, frame, difference, until, event } = window as any;
      // A solid poster, so it can't be mistaken for the first frame.
      const solid = document.createElement("canvas");
      solid.width = 64;
      solid.height = 36;
      const context = solid.getContext("2d")!;
      context.fillStyle = "#d14457";
      context.fillRect(0, 0, 64, 36);
      const poster = solid.toDataURL();
      const root = document.createElement("div");
      root.style.cssText = "position: relative; width: 320px; padding: 10px";
      root.innerHTML = `<video data-huet-recolor muted preload="auto" poster="${poster}" style="display: block; width: 320px; height: 180px; border: 4px solid red"><source src="${clip}" type="video/webm"></video>`;
      document.body.prepend(root);
      const video = root.querySelector("video")!;
      if (video.readyState < 2) await event(video, "loadeddata");

      const sunset = { neutral: ["#242744", "#ffe173"], colorModel: "hcl" };
      const mount = images.mountVideos(root, sunset, { hoverOriginal: true });
      await mount.ready();
      const canvas = video.nextElementSibling as HTMLCanvasElement;
      const box = video.getBoundingClientRect();
      const over = canvas.getBoundingClientRect();
      // Not played yet, so the canvas holds the recolored poster.
      const image = new Image();
      image.src = poster;
      await image.decode();
      const posterDiff = difference(frame(images.recolorImage(image, sunset), canvas), frame(canvas, canvas));
      const placed = {
        canvas: canvas instanceof HTMLCanvasElement,
        // Inside the 4px border.
        left: over.left - box.left,
        top: over.top - box.top,
        width: over.width,
        height: over.height,
        pointer: getComputedStyle(canvas).pointerEvents,
        marker: video.getAttribute("data-huet-recolored"),
        visible: getComputedStyle(canvas).visibility,
      };

      // Seek, which leaves the poster, and compare the canvas with the frame.
      video.currentTime = 2;
      await event(video, "seeked");
      await new Promise((r) => requestAnimationFrame(r));
      const original = frame(video, canvas);
      const sunsetDiff = difference(original, frame(canvas, canvas));
      mount.update({ neutral: ["#000000", "#ffffff"] });
      await mount.ready();
      const identityDiff = difference(original, frame(canvas, canvas));

      // Playing draws new frames; hovering stops drawing and shows the original.
      mount.update(sunset);
      await video.play();
      let draws = 0;
      const count = () => {
        draws++;
        video.requestVideoFrameCallback(count);
      };
      video.requestVideoFrameCallback(count);
      await until(() => draws > 5);
      video.dispatchEvent(new PointerEvent("pointerenter"));
      const hovered = getComputedStyle(canvas).visibility;
      const before = frame(canvas, canvas);
      await until(() => draws > 15);
      const frozen = difference(before, frame(canvas, canvas)) === 0;
      video.dispatchEvent(new PointerEvent("pointerleave"));
      const left = getComputedStyle(canvas).visibility;
      video.pause();

      mount.destroy();
      return {
        posterDiff,
        placed,
        sunsetDiff,
        identityDiff,
        hovered,
        frozen,
        left,
        canvases: root.querySelectorAll("canvas").length,
        marker: video.hasAttribute("data-huet-recolored"),
        style: video.getAttribute("style"),
      };
    },
    clip,
  );
  expect(result.posterDiff).toBeLessThan(3);
  expect(result.placed).toEqual({
    canvas: true,
    left: 4,
    top: 4,
    width: 320 - 8,
    height: 180 - 8,
    pointer: "none",
    marker: "",
    visible: "visible",
  });
  expect(result.sunsetDiff).toBeGreaterThan(20);
  expect(result.identityDiff).toBeLessThan(6);
  expect(result.hovered).toBe("hidden");
  expect(result.frozen).toBe(true);
  expect(result.left).toBe("visible");
  expect(result.canvases).toBe(0);
  expect(result.marker).toBe(false);
  expect(result.style).toBe("display: block; width: 320px; height: 180px; border: 4px solid red;");
  expect(errors).toEqual([]);
});

test("mountVideos reads another origin through readableUrl, and reports a video it can't read", async ({ page }) => {
  await setup(page);
  const result = await page.evaluate(async (clip) => {
    const { images, elsewhere, here, until } = window as any;
    const reported: string[] = [];
    window.addEventListener("error", (e) => reported.push(e.message));
    const root = document.createElement("div");
    root.innerHTML = `<video data-huet-recolor muted preload="auto" src="${elsewhere(clip)}" style="width: 160px"></video><div class="proxied"><video data-huet-recolor muted preload="auto" src="${elsewhere(clip)}" style="width: 160px"></video></div>`;
    document.body.prepend(root);
    const [unreadable, proxied] = root.querySelectorAll("video");
    const theme = { neutral: ["#242744", "#ffe173"] };
    const plain = images.mountVideos(root, theme, { selector: "video:not(.proxied video)" });
    const routed = images.mountVideos(root.querySelector(".proxied"), theme, { readableUrl: here });
    await until(() => unreadable.hasAttribute("data-huet-recolored") && proxied.getAttribute("data-huet-recolored") === "");
    const out = {
      unreadable: unreadable.getAttribute("data-huet-recolored"),
      unreadableCanvas: unreadable.nextElementSibling instanceof HTMLCanvasElement,
      proxiedSrc: proxied.getAttribute("src") === location.origin + clip,
      crossOrigin: proxied.crossOrigin,
      reported,
    };
    plain.destroy();
    routed.destroy();
    return out;
  }, clip);
  expect(result.unreadable).toBe("original");
  expect(result.unreadableCanvas).toBe(false);
  expect(result.proxiedSrc).toBe(true);
  expect(result.crossOrigin).toBe("anonymous");
  expect(result.reported).toHaveLength(1);
  expect(result.reported[0]).toMatch(/can't read the pixels of the video at https:\/\/elsewhere\.test.*readableUrl/);
});

test("mountImages reads another origin through readableUrl, and keeps originals it gives null", async ({ page }) => {
  await setup(page);
  const result = await page.evaluate(async (poster) => {
    const { images, elsewhere, here } = window as any;
    const root = document.createElement("div");
    root.innerHTML = `<img data-huet-recolor class="routed" src="${elsewhere(poster)}"><img data-huet-recolor class="refused" src="${poster}">`;
    document.body.prepend(root);
    const mount = images.mountImages(root, { neutral: ["#242744", "#ffe173"] }, {
      readableUrl: (src: string) => (src.startsWith(location.origin) ? null : here(src)),
    });
    await mount.ready();
    const routed = root.querySelector<HTMLImageElement>(".routed")!;
    const refused = root.querySelector<HTMLImageElement>(".refused")!;
    const out = {
      routed: routed.getAttribute("data-huet-recolored"),
      routedCanvas: routed.nextElementSibling instanceof HTMLCanvasElement,
      src: routed.getAttribute("src") === elsewhere(poster),
      refused: refused.getAttribute("data-huet-recolored"),
    };
    mount.destroy();
    return out;
  }, poster);
  expect(result).toEqual({ routed: "", routedCanvas: true, src: true, refused: "original" });
});

test("mountIframes lays blend layers over iframes, follows the theme and hover, and cleans up", async ({ page }) => {
  await setup(page);
  const result = await page.evaluate(async () => {
    const { images } = window as any;
    const root = document.createElement("div");
    root.style.cssText = "position: relative";
    root.innerHTML = `<iframe data-huet-recolor srcdoc="<body style='margin:0;background:#fff'><div style='height:40px;background:#000'></div></body>" style="display: block; width: 200px; height: 100px; border: 2px solid; border-radius: 10px"></iframe>`;
    document.body.prepend(root);
    const iframe = root.querySelector("iframe")!;
    await new Promise((r) => iframe.addEventListener("load", r, { once: true }));
    const sunset = { neutral: ["#242744", "#ffe173"], colorModel: "hcl" };
    const mount = images.mountIframes(root, sunset, { hoverOriginal: true });
    const layers = [...root.querySelectorAll<HTMLElement>("[data-huet-iframe]")];
    const box = iframe.getBoundingClientRect();
    const over = layers[0].getBoundingClientRect();
    const colors = images.blendLayers(sunset);
    const shown = {
      modes: layers.map((l) => l.style.mixBlendMode),
      backgrounds: layers.map((l) => l.style.background),
      expected: [colors.multiply, colors.screen].map((c: string) => {
        const probe = document.createElement("div");
        probe.style.background = c;
        return probe.style.background;
      }),
      left: over.left - box.left,
      width: over.width,
      radius: layers[0].style.borderRadius,
      pointer: getComputedStyle(layers[0]).pointerEvents,
    };
    iframe.dispatchEvent(new PointerEvent("pointerenter"));
    const hovered = layers.map((l) => getComputedStyle(l).visibility);
    iframe.dispatchEvent(new PointerEvent("pointerleave"));
    mount.update({ neutral: ["#000000", "#ffffff"] });
    const identity = layers.map((l) => l.style.background);
    // Iframes added later get layers too.
    const added = document.createElement("iframe");
    added.setAttribute("data-huet-recolor", "");
    root.append(added);
    await new Promise((r) => setTimeout(r));
    const addedLayers = added.nextElementSibling?.getAttribute("data-huet-iframe");
    mount.destroy();
    return { shown, hovered, identity, addedLayers, left: root.querySelectorAll("[data-huet-iframe]").length };
  });
  expect(result.shown.modes).toEqual(["multiply", "screen"]);
  expect(result.shown.backgrounds).toEqual(result.shown.expected);
  expect(result.shown.left).toBe(2);
  expect(result.shown.width).toBe(196);
  expect(result.shown.radius).toBe("8px");
  expect(result.shown.pointer).toBe("none");
  expect(result.hovered).toEqual(["hidden", "hidden"]);
  expect(result.identity).toEqual(["rgb(255, 255, 255)", "rgb(0, 0, 0)"]);
  expect(result.addedLayers).toBe("multiply");
  expect(result.left).toBe(0);
});

test("mountIframes recolors what an iframe paints, black and white exactly", async ({ page }) => {
  await setup(page);
  const theme = { neutral: ["#242744", "#ffe173"], colorModel: "hcl" };
  await page.evaluate(async (theme) => {
    const { images } = window as any;
    document.body.innerHTML = `<iframe id="embed" srcdoc="<body style='margin:0;background:#fff'><div style='height:50px;background:#000'></div></body>" style="display: block; width: 100px; height: 100px; border: 0"></iframe>`;
    const iframe = document.querySelector("iframe")!;
    await new Promise((r) => iframe.addEventListener("load", r, { once: true }));
    images.mountIframes(document.body, theme, { selector: "iframe" });
  }, theme);
  const expected = await page.evaluate(async (theme) => {
    const { images } = window as any;
    const map = images.recolorer(theme);
    return [map(0, 0, 0), map(1, 1, 1)].map((rgb: number[]) => rgb.map((c) => Math.round(c * 255)));
  }, theme);
  const shot = await page.locator("#embed").screenshot();
  const pixels = await page.evaluate(async (data) => {
    const image = new Image();
    image.src = "data:image/png;base64," + data;
    await image.decode();
    const c = document.createElement("canvas");
    c.width = image.naturalWidth;
    c.height = image.naturalHeight;
    const x = c.getContext("2d")!;
    x.drawImage(image, 0, 0);
    const at = (y: number) => Array.from(x.getImageData(c.width / 2, y, 1, 1).data.slice(0, 3));
    return [at(c.height * 0.25), at(c.height * 0.75)];
  }, shot.toString("base64"));
  for (const [i, rgb] of pixels.entries())
    for (const [channel, value] of rgb.entries()) expect(Math.abs(value - expected[i][channel])).toBeLessThanOrEqual(3);
});
