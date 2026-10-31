import { test, expect } from "@playwright/test";

test("SVG paints retain originals, CSS connections, alpha and vector structure", async ({ page }) => {
  await page.goto("/lab.html");
  const result = await page.evaluate(async () => {
    const { mountSvgs } = await import("/packages/huet/src/core/images.ts");
    const root = document.createElement("div");
    root.innerHTML = `<style>.live { fill: var(--ink, red) }</style><svg data-huet-recolor><rect id="implicit"/><rect id="white" fill="white" opacity=".4"/><path id="none" fill="none" stroke="rgba(255, 0, 0, 0.5)"/><path id="css" fill="currentColor"/><path id="var" class="live"/><path id="server" fill="url(#g)"/><linearGradient id="g"><stop stop-color="red" stop-opacity=".3"/></linearGradient></svg><svg id="untouched"><rect/></svg>`;
    document.body.append(root);
    const original = root.innerHTML;
    const mount = mountSvgs(root, { dark: "#123456", light: "#abcdef" });
    const first = root.querySelector("#implicit")!.getAttribute("style");
    const properties = {
      implicit: getComputedStyle(root.querySelector("#implicit")!).fill,
      white: getComputedStyle(root.querySelector("#white")!).fill,
      none: getComputedStyle(root.querySelector("#none")!).fill,
      stroke: getComputedStyle(root.querySelector("#none")!).stroke,
      css: (root.querySelector("#css") as SVGElement).style.fill,
      variable: (root.querySelector("#var") as SVGElement).style.fill,
      server: getComputedStyle(root.querySelector("#server")!).fill,
      opacity: root.querySelector("#white")!.getAttribute("opacity"),
      stopOpacity: root.querySelector("stop")!.getAttribute("stop-opacity"),
      untouched: root.querySelector("#untouched rect")!.getAttribute("style"),
    };
    mount.update({ dark: "#000000", light: "#ffffff" }); await mount.ready();
    mount.update({ dark: "#123456", light: "#abcdef" }); await mount.ready();
    const stable = first === root.querySelector("#implicit")!.getAttribute("style");
    root.querySelector("svg")!.insertAdjacentHTML("beforeend", '<circle id="added"/>');
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const added = (root.querySelector("#added") as SVGElement).style.fill;
    root.querySelector("#added")!.remove();
    mount.destroy(); mount.destroy();
    return { ...properties, stable, added, restored: root.innerHTML === original, vector: !root.querySelector("canvas") };
  });
  expect(result.implicit).toBe("rgb(18, 52, 86)");
  expect(result.white).toBe("rgb(171, 205, 239)");
  expect(result.none).toBe("none");
  expect(result.stroke).toContain("0.5");
  expect(result.css).toBe(""); expect(result.variable).toBe("");
  expect(result.server).toContain("url(");
  expect(result.opacity).toBe(".4"); expect(result.stopOpacity).toBe(".3");
  expect(result.untouched).toBeNull();
  expect(result.stable).toBe(true); expect(result.added).not.toBe("");
  expect(result.restored).toBe(true); expect(result.vector).toBe(true);
});

test("root opt-in, removal, reinsertion and destroy restore authored styles", async ({ page }) => {
  await page.goto("/lab.html");
  expect(await page.evaluate(async () => {
    const { mountSvgs } = await import("/packages/huet/src/core/images.ts");
    const root = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    root.setAttribute("data-huet-recolor", "");
    root.innerHTML = '<g fill="white"><rect style="opacity: 0.2"/></g><stop stop-color="black"/>';
    document.body.append(root);
    const original = root.innerHTML;
    const mount = mountSvgs(root, { dark: "#123456", light: "#abcdef" });
    const inherited = getComputedStyle(root.querySelector("rect")!).fill === "rgb(171, 205, 239)";
    const stop = getComputedStyle(root.querySelector("stop")!).stopColor === "rgb(18, 52, 86)";
    root.removeAttribute("data-huet-recolor");
    await mount.ready();
    const restored = original === root.innerHTML;
    root.setAttribute("data-huet-recolor", ""); await mount.ready();
    const rect = root.querySelector("rect")!;
    rect.remove(); await mount.ready();
    const removed = rect.getAttribute("style") === "opacity: 0.2";
    root.append(rect); await mount.ready();
    mount.update({ dark: "#222222", light: "#eeeeee" });
    mount.destroy();
    let throws = false;
    try { mount.update({}); } catch { throws = true; }
    return inherited && stop && restored && removed && throws && rect.getAttribute("style") === "opacity: 0.2";
  })).toBe(true);
});
