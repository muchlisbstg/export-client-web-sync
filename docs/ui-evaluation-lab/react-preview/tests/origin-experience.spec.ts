import { expect, test } from "@playwright/test";

test("Australian origin explorer lists jurisdictions and clearly separates context from supply claims", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Know the origin. See the evidence." })).toBeVisible();
  await expect(page.getByRole("group", { name: "Australian states and territories" }).getByRole("button")).toHaveCount(8);
  await expect(page.getByText("NOT VERIFIED", { exact: true })).toBeVisible();
  await expect(page.getByText(/no farm, supplier, establishment, livestock consignment or product lot has been verified/i)).toBeVisible();
});

test("buyer can select a jurisdiction and see contextual due-diligence guidance", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /VIC Victoria Melbourne/ }).click();
  await expect(page.getByRole("heading", { name: "Victoria" })).toBeVisible();
  await expect(page.getByText(/no current AHB sourcing relationship is represented/i)).toBeVisible();
  await expect(page.getByText(/actual property, processing establishment and lot-level chain of custody/i)).toBeVisible();
});

test("jurisdiction search filters states and territories with an empty state", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search Australian jurisdictions").fill("Tasmania");
  await expect(page.getByRole("button", { name: /TAS Tasmania Hobart/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /NSW New South Wales Sydney/ })).toHaveCount(0);
  await page.getByLabel("Search Australian jurisdictions").fill("Atlantis");
  await expect(page.getByText(/No matching jurisdiction/)).toBeVisible();
});

test("origin traceability framework exposes property-to-export evidence chain", async ({ page }) => {
  await page.goto("/");
  for (const label of ["Property of origin", "Livestock identity", "Processing establishment", "Product & carton lot", "Export consignment"]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
  await expect(page.getByText(/No live NLIS, supplier, establishment, government or logistics data is connected/i)).toBeVisible();
});

test("buyer can prepare a local-only origin evidence checklist for a destination market", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: /Build buyer evidence checklist/ });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Origin evidence checklist" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Destination market").fill("Singapore");
  await dialog.getByLabel("Property identity").check();
  await dialog.getByLabel("Livestock traceability").check();
  await dialog.getByRole("button", { name: /Prepare evidence request/ }).click();
  await expect(dialog.getByRole("status")).toContainText("No supplier was contacted");
});

test("origin checklist dialog supports keyboard focus trapping, Escape and focus restoration", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: /Build buyer evidence checklist/ });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Origin evidence checklist" });
  const close = dialog.getByRole("button", { name: "Close origin checklist" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByLabel("Destination market")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
