import { test, expect, type Page } from "@playwright/test";

function panelBox(page: Page) {
  return page.evaluate(() => {
    const titleBar = [...document.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("Huet Theme Configurator")
    );
    let panel = titleBar?.parentElement ?? null;
    while (panel && getComputedStyle(panel).position !== "fixed") {
      panel = panel.parentElement;
    }
    if (!panel) throw new Error("Configurator panel not found");
    const { x, y, width, height } = panel.getBoundingClientRect();
    return { x, y, width, height };
  });
}

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 1280, height: 600 },
]) {
  test(`configurator stays the same size across tabs at ${viewport.height}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await page.getByRole("button", { name: "Themes", exact: true }).click();
    // Wait out the mount transition
    await page.waitForTimeout(400);
    const themes = await panelBox(page);
    await page.getByRole("button", { name: "Edit Theme" }).click();
    const editTheme = await panelBox(page);

    expect(editTheme).toEqual(themes);
    // Docked to the bottom-right corner and inside the viewport
    expect(themes.y).toBeGreaterThan(0);
    expect(viewport.width - (themes.x + themes.width)).toBeCloseTo(12, 0);
    expect(viewport.height - (themes.y + themes.height)).toBeCloseTo(12, 0);
  });
}
