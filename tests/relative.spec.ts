import { test, expect } from "@playwright/test";

test("explicit contrast classes render original colors and update live", async ({ page }) => {
  await page.goto("/lab.html");
  const result = await page.evaluate(async () => {
    const modulePath = "/packages/huet/src/core/index.ts";
    const { createTheme, mountTheme } = await import(modulePath);
    const root = document.createElement("div");
    root.innerHTML = `<section class="huet-bg-gray-60"><div>
      <button class="huet-bg-blue-25 huet-text-100 huet-border-red-60" style="border-width:1px;border-style:solid">Save</button>
      <input class="huet-bg-10 huet-bg/text-80 huet-bg/border-red-60" style="border-width:1px;border-style:solid">
    </div></section>`;
    document.body.append(root);
    const button = root.querySelector("button")!;
    const input = root.querySelector("input")!;
    const hex = (value: string) => "#" + value.match(/[\d.]+/g)!.slice(0, 3)
      .map(Number).map(n => n.toString(16).padStart(2, "0")).join("");
    let theme = createTheme();
    const mount = mountTheme(root, theme);
    const checks: { actual: string; expected: string }[] = [];
    for (const options of [{}, { background: 0 }, { contrast: .3 }]) {
      theme = createTheme(options);
      mount.update(theme);
      const parent = theme.relative.contrast(60);
      const bg = parent.contrast(25, parent.theme.ramps.blue);
      const inputBg = parent.contrast(10);
      for (const [el, expected] of [
        [button, [bg.hex, parent.contrast(100).hex, parent.contrast(60, parent.theme.ramps.red).hex]],
        [input, [inputBg.hex, inputBg.contrast(80).hex, inputBg.contrast(60, parent.theme.ramps.red).hex]],
      ] as const) {
        const style = getComputedStyle(el);
        [style.backgroundColor, style.color, style.borderColor].forEach((color, i) =>
          checks.push({ actual: hex(color), expected: expected[i] }));
      }
    }
    input.className = "huet-text-green-75";
    await new Promise(resolve => requestAnimationFrame(resolve));
    checks.push({ actual: hex(getComputedStyle(input).color), expected:
      theme.relative.contrast(60).contrast(75, theme.relative.theme.ramps.green).hex });
    mount.destroy();
    root.remove();
    return checks;
  });
  for (const check of result) expect(check.actual).toBe(check.expected);
});
