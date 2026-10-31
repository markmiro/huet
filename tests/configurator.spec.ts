import { test, expect, type Page } from "@playwright/test";

import { configurator, openConfigurator } from "./helpers/configurator";

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
    await dialog.getByRole("button", { name: "Edit Theme" }).click();
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
  await expect(dialog.getByRole("button", { name: "Remove" })).toHaveCount(0);

  await openConfigurator(page, "Edit Theme");
  await page.getByLabel("Theme Name").fill("Renamed");
  await openConfigurator(page, "Themes");
  const edited = dialog.getByRole("button", { name: "Renamed Edited" });
  await expect(edited).toHaveAttribute("aria-pressed", "true");

  await dialog.getByRole("button", { name: "Reset" }).click();
  await expect(dialog.getByRole("button", { name: "Base", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await openConfigurator(page, "Edit Theme");
  await page.getByLabel("Theme Name").fill("Mine");
  await openConfigurator(page, "Themes");
  await dialog.getByRole("button", { name: "Save as New" }).click();
  const saved = dialog.getByRole("button", { name: "Mine", exact: true });
  await expect(saved).toHaveAttribute("aria-pressed", "true");
  // The original is untouched
  await expect(dialog.getByRole("button", { name: "Base", exact: true })).toHaveCount(1);

  await dialog.getByRole("button", { name: "Remove" }).click();
  await expect(saved).toHaveCount(0);
});

test("host page CSS doesn't leak into the configurator", async ({ page }) => {
  // Tall enough that the popover keeps its full height below the host's
  // padded header
  await page.setViewportSize({ width: 1280, height: 1400 });
  const dialog = await open(page);

  const styles = (name: string) =>
    dialog.getByRole("button", { name, exact: true }).evaluate((el) => {
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
    activeTab: await styles("Themes"),
    inactiveTab: await styles("Edit Theme"),
    theme: await styles("Base Inverted"),
    importButton: await dialog
      .getByText("Import", { exact: true })
      .evaluate((el) => getComputedStyle(el).backgroundColor),
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
      #page, astro-island { transform: translateX(13px); overflow: hidden; }
    `,
  });

  expect(await measure()).toEqual(before);
});
