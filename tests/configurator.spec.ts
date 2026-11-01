import { test, expect, type Page } from "@playwright/test";

import { configurator, openConfigurator, setPercent } from "./helpers/configurator";

async function size(page: Page) {
  const box = await configurator(page).boundingBox();
  if (!box) throw new Error("Configurator popover not found");
  return { width: box.width, height: box.height };
}

async function open(page: Page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  return openConfigurator(page);
}

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 1280, height: 600 },
]) {
  test(`configurator stays the same size across tabs at ${viewport.height}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const dialog = await open(page);
    const themes = await size(page);
    await dialog.getByRole("tab", { name: "Edit Theme" }).click();
    expect(await size(page)).toEqual(themes);

    // Inside the viewport
    const box = (await dialog.boundingBox())!;
    expect(box.y).toBeGreaterThan(0);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  });
}

test("edits show in the theme list until saved or reset", async ({ page }) => {
  page.on("dialog", (dialog) => void dialog.accept());
  const dialog = await open(page);
  const edit = async (contrast: number) => {
    await openConfigurator(page, "Edit Theme");
    await setPercent(page, "Blending and contrast", "Contrast", contrast);
    await page.keyboard.press("Escape");
    await openConfigurator(page, "Themes");
  };

  // An edit stands in for the theme it came from, marked as edited
  await edit(50);
  await expect(dialog.getByRole("button", { name: "Base Edited" })).toHaveAttribute("aria-pressed", "true");
  await dialog.getByRole("button", { name: "Reset" }).click();
  await expect(dialog.getByRole("button", { name: "Base", exact: true })).toHaveAttribute("aria-pressed", "true");

  // Saved as a new theme, then renamed
  await edit(70);
  await dialog.getByRole("button", { name: "Save as New" }).click();
  await expect(dialog.getByRole("button", { name: "Base Copy", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(dialog.getByRole("button", { name: "Base", exact: true })).toHaveCount(1);
  await openConfigurator(page, "Edit Theme");
  await dialog.getByRole("button", { name: "Rename theme" }).click();
  await dialog.getByRole("textbox", { name: "Theme name" }).fill("Mine");
  await dialog.getByRole("textbox", { name: "Theme name" }).press("Enter");
  await openConfigurator(page, "Themes");
  const saved = dialog.getByRole("button", { name: "Mine", exact: true });
  await expect(saved).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-theme-name]")).toHaveText("Mine");

  await dialog.getByRole("button", { name: "Remove" }).click();
  await expect(saved).toHaveCount(0);
  // Removing the picked theme picks the first one left
  await expect(dialog.getByRole("button", { name: "Base", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("host page CSS doesn't leak into the configurator", async ({ page }) => {
  // Tall enough that the popover keeps its full height below the host's
  // padded header
  await page.setViewportSize({ width: 1280, height: 1400 });
  const dialog = await open(page);

  const styles = (name: string, role: "button" | "tab" = "button") =>
    dialog.getByRole(role, { name, exact: true }).evaluate((el) => {
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
    // The popover follows its trigger, which the host's CSS may move
    size: await size(page),
    activeTab: await styles("Themes", "tab"),
    inactiveTab: await styles("Edit Theme", "tab"),
    theme: await styles("Blueprint"),
    importButton: await dialog
      .getByText("Import", { exact: true })
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  });
  const before = await measure();
  // Sanity: the tabs take Huet colors, active and inactive apart
  expect(before.activeTab.color).not.toBe(before.inactiveTab.color);

  await page.addStyleTag({
    content: `
      button, input, label, div, span, h3 {
        padding: 20px; margin: 7px; font: 30px serif; background: red;
        border: 5px solid green; line-height: 3; color: blue;
      }
      #page, astro-island { transform: translateX(13px); overflow: hidden; }
    `,
  });

  expect(await measure()).toEqual(before);
});
