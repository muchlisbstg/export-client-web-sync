import { expect, test } from "@playwright/test";

test("renders the buyer overview and primary navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Australian Halal Beef/);
  await expect(page.getByRole("heading", { name: /Good afternoon, Pacific Gourmet/ })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Buyer workspace navigation" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Product catalogue/ })).toBeVisible();
});

test("filters products and opens an RFQ with the selected product", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Product catalogue/ }).click();
  await expect(page.getByRole("heading", { name: "Product catalogue" })).toBeVisible();
  await page.getByRole("button", { name: "Wagyu", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Wagyu Ribeye" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Angus Tenderloin" })).toHaveCount(0);
  await page.getByRole("button", { name: /Request quote/ }).first().click();
  await expect(page.getByRole("heading", { name: "My RFQs" })).toBeVisible();
  await expect(page.getByLabel("Product")).toHaveValue("Wagyu Ribeye");
});

test("adds a local demo RFQ without a network transaction", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /My RFQs/ }).click();
  await page.getByLabel("Target volume").fill("250 kg");
  await page.getByLabel("Destination market").fill("Singapore");
  await page.getByLabel(/Specification notes/).fill("Chilled, vacuum packed");
  await page.getByRole("button", { name: "＋ Add demo RFQ" }).click();
  await expect(page.getByText("DEMO-RFQ-004")).toBeVisible();
  await expect(page.getByText(/has not been sent to Australian Halal Beef/)).toBeVisible();
});

test("keeps the buyer workspace within a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Good afternoon, Pacific Gourmet/ })).toBeVisible();
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
  const diagnostics = await page.evaluate(() => Array.from(document.querySelectorAll("body *")).map((element) => { const rect = element.getBoundingClientRect(); return { tag: element.tagName, className: typeof element.className === "string" ? element.className : "", text: (element.textContent || "").trim().slice(0, 45), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width), scrollWidth: element.scrollWidth, clientWidth: element.clientWidth }; }).filter((item) => item.right > document.documentElement.clientWidth + 1 || item.left < -1).slice(0, 20));\n  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);\n  console.log("mobile overflow diagnostics", JSON.stringify({ viewportWidth, documentWidth, diagnostics }));
  expect(documentWidth).toBeLessThanOrEqual(viewportWidth);
});