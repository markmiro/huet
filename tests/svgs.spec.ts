import { test, expect, type Page } from "@playwright/test";

const theme = { neutral: ["#123456", "#abcdef"] };
const dark = "rgb(18, 52, 86)";
const light = "rgb(171, 205, 239)";

// Vite serves the library source, so the page imports it like an app would.
async function setup(page: Page, html: string) {
  await page.goto("/lab.html");
  await page.evaluate(async (html) => {
    const w = window as any;
    w.svgs = await import("/packages/huet/src/core/svgs.ts");
    w.root = document.createElement("div");
    w.root.innerHTML = html;
    document.body.append(w.root);
    w.frames = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    w.paint = (id: string, property = "fill") =>
      getComputedStyle(w.root.querySelector(`#${id}`)).getPropertyValue(property);
  }, html);
}

test("maps solid paints and leaves CSS-driven ones connected", async ({ page }) => {
  await setup(
    page,
    `<style>
      .ink { fill: var(--ink, red) }
      .fill-current { fill: currentColor }
      .paper { fill: white }
    </style>
    <div style="color: rgb(0, 128, 0)">
      <svg data-huet-recolor>
        <rect id="implicit" />
        <rect id="white" fill="white" opacity=".4" />
        <rect id="modern" fill="oklch(1 0 0)" />
        <rect id="ruled" class="paper" fill="black" />
        <rect id="clear" fill="transparent" />
        <path id="outline" fill="none" stroke="rgba(255, 255, 255, 0.5)" />
        <path id="current" fill="currentColor" />
        <path id="variable" class="ink" />
        <g fill="currentColor"><rect id="inheritsCurrent" /><rect id="ownInLive" fill="white" /></g>
        <rect id="server" fill="url(#gradient)" />
        <linearGradient id="gradient">
          <stop id="stop" stop-color="white" stop-opacity=".3" />
          <stop id="implicitStop" offset="1" />
          <stop id="liveStop" style="stop-color: currentColor" />
        </linearGradient>
      </svg>
      <div class="fill-current"><svg id="connected" data-huet-recolor><rect /></svg></div>
      <svg id="untouched"><rect fill="white" /></svg>
    </div>`,
  );
  const result = await page.evaluate((theme) => {
    const w = window as any;
    w.svgs.mountSvgs(w.root, theme);
    const style = (selector: string) => w.root.querySelector(selector).getAttribute("style");
    return {
      implicit: w.paint("implicit"),
      white: w.paint("white"),
      modern: w.paint("modern"),
      ruled: w.paint("ruled"),
      clear: w.paint("clear"),
      outlineFill: w.paint("outline"),
      outlineStroke: w.paint("outline", "stroke"),
      current: w.paint("current"),
      variable: w.paint("variable"),
      inheritsCurrent: w.paint("inheritsCurrent"),
      ownInLive: w.paint("ownInLive"),
      server: w.paint("server"),
      stop: w.paint("stop", "stop-color"),
      implicitStop: w.paint("implicitStop", "stop-color"),
      liveStop: w.paint("liveStop", "stop-color"),
      opacity: w.root.querySelector("#white").getAttribute("opacity"),
      stopOpacity: w.root.querySelector("#stop").getAttribute("stop-opacity"),
      // Attribute paints stay attributes, and children that inherit a paint get nothing of their own.
      whiteStyle: style("#white"),
      implicitStyle: style("#implicit"),
      implicitFill: w.root.querySelector("#implicit").getAttribute("fill"),
      // A stylesheet rule outranks attributes, so its mapped paint goes inline.
      ruledStyle: style("#ruled"),
      connected: style("#connected"),
      untouched: style("#untouched rect"),
      vector: w.root.querySelector("canvas") === null,
    };
  }, theme);
  expect(result).toEqual({
    implicit: dark,
    white: light,
    modern: light,
    ruled: light,
    clear: "rgba(0, 0, 0, 0)",
    outlineFill: "none",
    outlineStroke: "rgba(171, 205, 239, 0.5)",
    current: "rgb(0, 128, 0)",
    variable: "rgb(255, 0, 0)",
    inheritsCurrent: "rgb(0, 128, 0)",
    ownInLive: light,
    server: 'url("#gradient")',
    stop: light,
    implicitStop: dark,
    liveStop: "rgb(0, 128, 0)",
    opacity: ".4",
    stopOpacity: ".3",
    whiteStyle: null,
    implicitStyle: null,
    implicitFill: null,
    ruledStyle: `fill: ${light};`,
    connected: null,
    untouched: null,
    vector: true,
  });
});

test("maps the original paints on every update, and keeps the page's later edits", async ({ page }) => {
  await setup(page, `<svg data-huet-recolor><rect id="a" fill="white" style="opacity: 0.5" /><rect id="b" fill="white" /></svg>`);
  const result = await page.evaluate(async (theme) => {
    const w = window as any;
    const mount = w.svgs.mountSvgs(w.root, theme);
    const a = w.root.querySelector("#a");
    const b = w.root.querySelector("#b");
    const first = a.getAttribute("fill");
    mount.update({ neutral: ["#000000", "#808080"] });
    await mount.ready();
    const gray = w.paint("a");
    mount.update(theme);
    await mount.ready();
    const back = a.getAttribute("fill");
    // The page edits the paints of recolored elements.
    a.setAttribute("fill", "black");
    b.style.setProperty("fill", "black");
    await mount.ready();
    const edited = [w.paint("a"), w.paint("b")];
    mount.destroy();
    return { first, gray, back, edited, a: a.outerHTML, b: b.outerHTML };
  }, theme);
  expect(result.gray).toBe("rgb(128, 128, 128)");
  expect(result.back).toBe(result.first);
  expect(result.edited).toEqual([dark, dark]);
  expect(result.back).toBe(light);
  // Destroy keeps the page's later edits.
  expect(result.a).toBe('<rect id="a" fill="black" style="opacity: 0.5"></rect>');
  expect(result.b).toBe('<rect id="b" fill="white" style="fill: black;"></rect>');
});

test("follows added, removed, and opted-out SVGs, and restores the markup", async ({ page }) => {
  await setup(page, "");
  const result = await page.evaluate(async (theme) => {
    const w = window as any;
    const mount = w.svgs.mountSvgs(w.root, theme);
    w.root.innerHTML = `<svg id="svg" data-huet-recolor><circle id="circle" fill="white" /></svg>`;
    const original = w.root.innerHTML;
    const svg = w.root.querySelector("svg");
    await w.frames();
    const added = [w.paint("svg"), w.paint("circle")];
    svg.insertAdjacentHTML("beforeend", `<rect id="later" stroke="white" />`);
    await w.frames();
    const later = w.paint("later", "stroke");
    const rect = w.root.querySelector("#later");
    rect.remove();
    await w.frames();
    const removed = rect.getAttribute("stroke");
    svg.removeAttribute("data-huet-recolor");
    await w.frames();
    const optedOut = w.root.innerHTML;
    svg.setAttribute("data-huet-recolor", "");
    await mount.ready();
    const optedIn = w.paint("circle");
    mount.destroy();
    mount.destroy();
    let throws = false;
    try {
      mount.update(theme);
    } catch {
      throws = true;
    }
    return { original, added, later, removed, optedOut, optedIn, destroyed: w.root.innerHTML, throws };
  }, theme);
  expect(result.added).toEqual([dark, light]);
  expect(result.later).toBe(light);
  expect(result.removed).toBe("white");
  expect(result.optedOut).toBe(result.original.replace(' data-huet-recolor=""', ""));
  expect(result.optedIn).toBe(light);
  expect(result.destroyed).toBe(result.original);
  expect(result.throws).toBe(true);
});

test("recolors a root that is itself an SVG", async ({ page }) => {
  await setup(page, `<svg id="svg" data-huet-recolor><g fill="white"><rect id="rect" /></g></svg>`);
  const result = await page.evaluate((theme) => {
    const w = window as any;
    const svg = w.root.querySelector("svg");
    const mount = w.svgs.mountSvgs(svg, theme);
    const painted = [w.paint("svg"), w.paint("rect")];
    mount.destroy();
    return { painted, markup: svg.outerHTML };
  }, theme);
  expect(result).toEqual({
    painted: [dark, light],
    markup: '<svg id="svg" data-huet-recolor=""><g fill="white"><rect id="rect"></rect></g></svg>',
  });
});

test("the page's state rules still outrank recolored attribute paints", async ({ page }) => {
  await setup(
    page,
    `<style>.hot:hover { fill: rgb(0, 128, 0) }</style>
    <svg data-huet-recolor width="100" height="100"><rect id="hot" class="hot" width="100" height="100" fill="white" /></svg>`,
  );
  await page.evaluate((theme) => (window as any).svgs.mountSvgs((window as any).root, theme), theme);
  expect(await page.evaluate(() => (window as any).paint("hot"))).toBe(light);
  await page.hover("#hot");
  expect(await page.evaluate(() => (window as any).paint("hot"))).toBe("rgb(0, 128, 0)");
});
