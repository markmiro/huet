import { test, expect } from "@playwright/test";

test("explicit contrast classes render original colors and update live", async ({ page }) => {
  await page.goto("/lab.html");
  const result = await page.evaluate(async () => {
    const modulePath = "/packages/huet/src/core/index.ts";
    const { mountTheme } = await import(modulePath);
    const { resolveTheme } = await import("/packages/huet/src/internal.ts");
    const root = document.createElement("div");
    root.innerHTML = `<section class="huet-bg-gray-60"><div>
      <button class="huet-bg-blue-20 huet-text-100 huet-border-red-60" style="border-width:1px;border-style:solid">Save</button>
      <input class="huet-bg-10 huet-bg/text-80 huet-bg/border-red-60" style="border-width:1px;border-style:solid">
    </div></section>`;
    document.body.append(root);
    const button = root.querySelector("button")!;
    const input = root.querySelector("input")!;
    const hex = (value: string) => "#" + value.match(/[\d.]+/g)!.slice(0, 3)
      .map(Number).map(n => n.toString(16).padStart(2, "0")).join("");
    const base = { neutral: ["#000000", "#ffffff"] };
    let theme = resolveTheme(base);
    const mount = mountTheme(root, base);
    const checks: { actual: string; expected: string }[] = [];
    for (const [next, options] of [[base, {}], [base, { background: 0 }], [{ ...base, contrast: .3 }, { background: 1 }]] as const) {
      theme = resolveTheme(next, options);
      mount.update(next, options);
      const parent = theme.step(theme.root, 60);
      const bg = theme.step(parent, 20, "blue");
      const inputBg = theme.step(parent, 10);
      for (const [el, expected] of [
        [button, [bg.hex, theme.step(parent, 100).hex, theme.step(parent, 60, "red").hex]],
        [input, [inputBg.hex, theme.step(inputBg, 80).hex, theme.step(inputBg, 60, "red").hex]],
      ] as const) {
        const style = getComputedStyle(el);
        [style.backgroundColor, style.color, style.borderColor].forEach((color, i) =>
          checks.push({ actual: hex(color), expected: expected[i] }));
      }
    }
    input.className = "huet-text-green-70";
    await new Promise(resolve => requestAnimationFrame(resolve));
    checks.push({ actual: hex(getComputedStyle(input).color), expected:
      theme.step(theme.step(theme.root, 60), 70, "green").hex });
    mount.destroy();
    root.remove();
    return checks;
  });
  for (const check of result) expect(check.actual).toBe(check.expected);
});
