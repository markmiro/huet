import { test, expect } from "@playwright/test";

import { configurator, openConfigurator } from "./helpers/configurator";

test("bad saved state falls back to defaults instead of crashing", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    // Values the old order-based keys could hand to the wrong hook
    localStorage.setItem("useBrowserState_huet_0_", JSON.stringify([{ id: 1 }]));
    localStorage.setItem("huet:theme", JSON.stringify({ pallet: "nope" }));
    localStorage.setItem("huet:themes", "{not json");
    localStorage.setItem("huet:embedded:currentTab", JSON.stringify(true));
    localStorage.setItem("huet:demo:page", JSON.stringify("missing"));
    // A setting that no longer exists
    localStorage.setItem("huet:themer:showHelp", JSON.stringify(true));
    localStorage.setItem("hostApp", "keep me");
  });
  await page.reload();

  await expect(page.getByText("Something went wrong")).toHaveCount(0);
  await page.getByRole("button", { name: /^Theme:/ }).click();
  // The bad saved tab falls back to Themes
  await expect(configurator(page).getByText("Import", { exact: true })).toBeVisible();
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).not.toContain("useBrowserState_huet_0_");
  expect(keys).not.toContain("huet:themer:showHelp");
  expect(keys).toContain("hostApp");
});

test("themer state survives a reload", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await openConfigurator(page, "Edit Theme");
  await page.getByLabel("Theme Name").fill("Renamed");
  // Leaving the page flushes pending writes
  await page.reload();

  // Reopens on the Edit Theme tab
  await page.getByRole("button", { name: /^Theme:/ }).click();
  await expect(page.getByLabel("Theme Name")).toHaveValue("Renamed");
  const keys = await page.evaluate(() => Object.keys(localStorage).sort());
  expect(keys).toEqual(["huet:embedded:currentTab", "huet:theme"]);
});
