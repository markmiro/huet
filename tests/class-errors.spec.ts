import { test, expect } from "@playwright/test";

test("an invalid class added after mount is reported without half-updating the tree", async ({ page }) => {
  await page.goto("/lab.html");
  const result = await page.evaluate(async () => {
    const modulePath = "/packages/huet/src/core/index.ts";
    const { mountTheme } = await import(modulePath);
    const root = document.createElement("div");
    root.innerHTML = '<p class="huet-bg-10"></p><p class="huet-bg-10"></p>';
    document.body.append(root);
    const [first, second] = root.querySelectorAll("p");
    const mount = mountTheme(root, { neutral: ["#000000", "#ffffff"] });
    const background = (el: HTMLElement) => el.style.getPropertyValue("--huet-background");
    const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    const reported: string[] = [];
    const onError = (event: ErrorEvent) => {
      reported.push(event.message);
      event.preventDefault();
    };
    window.addEventListener("error", onError);
    const before = background(first);
    // The observer has no caller to throw to: the error is reported, the root records it,
    // and the valid change before the invalid class isn't written either.
    first.className = "huet-bg-50";
    second.className = "huet-bg-10 hover:huet-surface-25";
    await frame();
    const broken = {
      first: background(first),
      error: root.getAttribute("data-huet-error"),
    };
    second.className = "huet-bg-10 hover:huet-bg-20";
    await frame();
    const fixed = { first: background(first), error: root.getAttribute("data-huet-error") };
    window.removeEventListener("error", onError);
    mount.destroy();
    root.remove();
    return { before, broken, fixed, reported };
  });
  expect(result.reported).toHaveLength(1);
  expect(result.reported[0]).toContain("Tailwind variants work on huet-bg-AMOUNT classes, not huet-surface-*: hover:huet-surface-25");
  expect(result.broken.first).toBe(result.before);
  expect(result.broken.error).toContain('"hover:huet-bg-20"');
  expect(result.fixed.first).not.toBe(result.before);
  expect(result.fixed.error).toBeNull();
});
