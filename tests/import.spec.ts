import { test, expect, type Page } from "@playwright/test";

import baseThemeConfig from "../src/private/baseThemeConfig";

// No `id`, like a hand-written theme file
const { id: _id, ...theme } = { ...baseThemeConfig, name: "Import Test" };
const themeFile = {
  name: "Import Test Huet Theme.json",
  mimeType: "application/json",
  buffer: Buffer.from(JSON.stringify(theme)),
};

// Theme list entries; the page header repeats the selected theme's name
const listed = (page: Page) =>
  page.getByRole("heading", { level: 3, name: "Import Test" });

async function openThemes(page: Page) {
  const alerts: string[] = [];
  const errors: string[] = [];
  page.on("dialog", (dialog) => {
    alerts.push(dialog.message());
    void dialog.dismiss();
  });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByText("Import Theme")).toBeVisible();
  return { alerts, errors, input: page.locator('input[type="file"]') };
}

test("imports a .json theme whose file reports no MIME type", async ({
  page,
}) => {
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

  await expect(listed(page)).toHaveCount(1);
  expect(alerts).toEqual([]);
});

test("importing the same file twice adds two separately selectable themes", async ({
  page,
}) => {
  const { alerts, errors, input } = await openThemes(page);

  await input.setInputFiles(themeFile);
  // Cleared, so choosing the same file again fires `change`
  await expect(input).toHaveValue("");
  await input.setInputFiles(themeFile);

  await expect(listed(page)).toHaveCount(2);
  // Only the latest import is selected; the other is still a button
  await expect(
    page.getByRole("button", { name: /Import Test/ }),
  ).toHaveCount(1);
  expect(errors.filter((e) => e.includes("key"))).toEqual([]);
  expect(alerts).toEqual([]);
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
