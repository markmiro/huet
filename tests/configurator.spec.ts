import { test, expect, type Page } from "@playwright/test";

// The panel renders into its own container on <body>
const panel = (page: Page) => page.locator("body > [data-huet-configurator] > *");

async function panelBox(page: Page) {
  await expect(panel(page)).toHaveCSS("position", "fixed");
  const box = await panel(page).boundingBox();
  if (!box) throw new Error("Configurator panel not found");
  return box;
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

test("host page CSS doesn't leak into the configurator", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Themes", exact: true }).click();
  // Wait out the mount transition
  await page.waitForTimeout(400);

  const styles = (name: string) =>
    page.getByRole("button", { name, exact: true }).evaluate((el) => {
      const s = getComputedStyle(el);
      const { width, height } = el.getBoundingClientRect();
      return {
        width,
        height,
        background: s.backgroundColor,
        color: s.color,
        padding: s.padding,
        margin: s.margin,
        border: s.border,
        font: s.font,
        lineHeight: s.lineHeight,
      };
    });
  const measure = async () => ({
    panel: await panelBox(page),
    activeTab: await styles("Themes"),
    inactiveTab: await styles("Edit Theme"),
    importButton: await page
      .getByText("Import Theme")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
    title: await page
      .getByRole("heading", { level: 3, name: "Base", exact: true })
      .evaluate((el) => getComputedStyle(el).font),
  });
  const before = await measure();
  // Sanity: the active tab is a filled Huet surface
  expect(before.activeTab.background).not.toBe("rgba(0, 0, 0, 0)");

  await page.addStyleTag({
    content: `
      button, input, label, div, span, h3 {
        padding: 20px; margin: 7px; font: 30px serif; background: red;
        border: 5px solid green; line-height: 3; color: blue;
      }
      /* Would trap a position: fixed panel rendered in place */
      #page, astro-island { transform: translateX(13px); overflow: hidden; }
    `,
  });

  expect(await measure()).toEqual(before);
});
