import { expect, test } from "@playwright/test";

test("professional product catalogue exposes category, handling and sorting filters", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("6 product ranges")).toBeVisible();
  await page.getByLabel("Filter by category").selectOption("Wagyu");
  await expect(page.getByRole("heading", { name: "Wagyu Ribeye" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Angus Tenderloin" })).toHaveCount(0);
  await page.getByLabel("Filter by category").selectOption("All products");
  await page.getByLabel("Filter by handling").selectOption("Frozen");
  await expect(page.getByRole("heading", { name: "Beef Short Ribs" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Wagyu Ribeye" })).toBeVisible();
  await page.getByLabel("Sort products").selectOption("name");
  await expect(page.getByText("6 product ranges")).toBeVisible();
});

test("catalogue search supports product ID and provides a clear empty state", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search product catalogue").fill("AHB-P-005");
  await expect(page.getByRole("heading", { name: "Beef Short Ribs" })).toBeVisible();
  await page.getByLabel("Search product catalogue").fill("nonexistent-cut");
  await expect(page.getByText("No matching product ranges")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByText("6 product ranges")).toBeVisible();
});

test("product details disclose required evidence and configurable specifications", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "View specifications" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Wagyu Ribeye" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Documentary evidence required")).toBeVisible();
  await expect(dialog.getByText("Certificate and scope verification required")).toBeVisible();
  await expect(dialog.getByText(/No live stock or price is represented/)).toBeVisible();
});

test("buyer can compare two selected products", async ({ page }) => {
  await page.goto("/");
  const checks = page.getByRole("checkbox", { name: "Compare" });
  await checks.nth(0).check();
  await checks.nth(1).check();
  await page.getByRole("button", { name: "Compare products" }).click();
  await expect(page.getByRole("dialog", { name: "Compare product ranges" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Wagyu Ribeye" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Wagyu Striploin" })).toBeVisible();
});

test("product-specific enquiry captures buyer requirements locally only", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "View specifications" }).first().click();
  await page.getByRole("button", { name: /Configure buyer enquiry/ }).click();
  await page.getByRole("dialog", { name: "Wagyu Ribeye" }).getByLabel("Destination market").fill("Singapore");
  await page.getByLabel("Estimated quantity").fill("2,000 kg");
  await page.getByLabel("Preferred handling").selectOption("Chilled");
  await page.getByRole("button", { name: "Save preview enquiry" }).click();
  await expect(page.getByRole("status")).toContainText("No data was transmitted");
});

test("product detail dialog supports keyboard trapping, Escape and focus restoration", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "View specifications" }).first();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Wagyu Ribeye" });
  const close = page.getByRole("button", { name: "Close product details" });
  await expect(dialog).toBeVisible();
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: /Configure buyer enquiry/ })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
