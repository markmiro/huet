import { test, expect, type Page } from "@playwright/test";
import { configurator, openConfigurator } from "./helpers/configurator";

import { themes } from "../packages/huet/src/core/themes";

// An edited Sunset, saved as "Import Test"
const theme = { ...themes.Sunset, contrast: 0.8 };
const themeFile = (contents: unknown = theme) => ({
  name: "Import Test Huet Theme.json",
  mimeType: "application/json",
  buffer: Buffer.from(JSON.stringify(contents)),
});

// Theme list entries. (The header's theme button is named "Theme: Import Test".)
const listed = (page: Page, name = "Import Test") =>
  configurator(page).getByRole("button", { name, exact: true });

async function openThemes(page: Page) {
  const alerts: string[] = [];
  page.on("dialog", (dialog) => {
    alerts.push(dialog.message());
    void dialog.dismiss();
  });
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await openConfigurator(page);
  return { alerts, input: page.locator('input[type="file"]') };
}

test("imports a .json theme whose file reports no MIME type, named after the file", async ({ page }) => {
  const { alerts, input } = await openThemes(page);

  // `setInputFiles` fills in a type from the extension, so build the File
  // here to get the empty type some browsers and OSes report for .json
  await input.evaluate((element: HTMLInputElement, json) => {
    const file = new File([json], "Import Test Huet Theme.json", { type: "" });
    const transfer = new DataTransfer();
    transfer.items.add(file);
    element.files = transfer.files;
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }, JSON.stringify(theme));

  await expect(listed(page)).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-theme-name]")).toHaveText("Import Test");
  expect(alerts).toEqual([]);
});

test("importing the same file twice adds two separately selectable themes", async ({ page }) => {
  const { alerts, input } = await openThemes(page);

  await input.setInputFiles(themeFile());
  // Cleared, so choosing the same file again fires `change`
  await expect(input).toHaveValue("");
  await input.setInputFiles(themeFile());

  await expect(listed(page)).toHaveCount(1);
  await expect(listed(page, "Import Test 2")).toHaveCount(1);
  // Only one is selected: both are the same theme, so the first listed wins
  await expect(configurator(page).locator("[aria-pressed=true]")).toHaveCount(1);
  expect(alerts).toEqual([]);
});

test("rejects an old theme config and says why", async ({ page }) => {
  const { alerts, input } = await openThemes(page);
  await input.setInputFiles(themeFile({ name: "Old", pallet: { black: "#000000" }, ramps: {}, bgRampValue: 1 }));
  await expect.poll(() => alerts).toHaveLength(1);
  expect(alerts[0]).toContain("old ThemeConfig format");
  await expect(listed(page)).toHaveCount(0);
});

test("rejects files that aren't JSON", async ({ page }) => {
  const { alerts, input } = await openThemes(page);

  await input.setInputFiles({
    name: "theme.txt",
    mimeType: "text/plain",
    buffer: Buffer.from(JSON.stringify(theme)),
  });

  await expect.poll(() => alerts).toEqual(["Only JSON files are accepted."]);
  await expect(listed(page)).toHaveCount(0);
});
