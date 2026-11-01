import { test, expect } from "@playwright/test";

import { configurator, openConfigurator, openSettings, setPercent } from "./helpers/configurator";

test("bad saved state falls back to defaults instead of crashing", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await page.evaluate(() => {
    // Values the old order-based keys could hand to the wrong hook
    localStorage.setItem("useBrowserState_huet_0_", JSON.stringify([{ id: 1 }]));
    // The configurator no longer saves the theme or a theme list
    localStorage.setItem("huet:theme", JSON.stringify({ pallet: "nope" }));
    localStorage.setItem("huet:themes", "{not json");
    localStorage.setItem("huet:embedded:currentTab", JSON.stringify(true));
    localStorage.setItem("huet:demo:page", JSON.stringify("missing"));
    // A setting that no longer exists
    localStorage.setItem("huet:themer:showHelp", JSON.stringify(true));
    // A theme the demo saved in the old format
    localStorage.setItem("huet-demo:theme", JSON.stringify({ theme: { pallet: {} }, background: 1 }));
    localStorage.setItem("hostApp", "keep me");
  });
  await page.reload();

  await expect(page.getByText("Something went wrong")).toHaveCount(0);
  await expect(page.locator("[data-theme-name]")).toHaveText("Base");
  expect(errors.some((e) => e.includes("the saved theme is invalid, so it was reset"))).toBe(true);
  await page.getByRole("button", { name: /^Theme:/ }).click();
  // The bad saved tab falls back to Themes
  await expect(configurator(page).getByText("Import", { exact: true })).toBeVisible();
  const keys = await page.evaluate(() => Object.keys(localStorage));
  for (const removed of ["useBrowserState_huet_0_", "huet:theme", "huet:themes", "huet:themer:showHelp"])
    expect(keys).not.toContain(removed);
  expect(keys).toContain("hostApp");
});

test("the theme and configurator state survive a reload", async ({ page }) => {
  page.on("dialog", (dialog) => void dialog.accept());
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const dialog = await openConfigurator(page, "Edit Theme");
  await setPercent(page, "Blending and contrast", "Contrast", 50);
  await expect(page.locator("[data-theme-name]")).toHaveText("Custom");
  // Leaving the page flushes pending writes
  await page.reload();

  // Reopens on the Edit Theme tab, with the edit and where it came from
  await page.getByRole("button", { name: /^Theme:/ }).click();
  const settings = await openSettings(page, "Blending and contrast");
  await expect(settings.getByRole("textbox", { name: "Contrast", exact: true })).toHaveValue("50");
  await page.keyboard.press("Escape");
  const keys = await page.evaluate(() => Object.keys(localStorage).sort());
  expect(keys).toEqual(["huet-demo:theme", "huet:embedded:currentTab", "huet:themer:editedFrom"]);
  await expect(dialog.getByText("from Base", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator("[data-theme-name]")).toHaveText("Base");
});
