import { expect, test } from "@playwright/test";

test("renders the public Australian Halal Beef website and navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Australian Halal Beef/);
  await expect(page.getByRole("heading", { name: /Integrity in every cut/i })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Our products" })).toBeVisible();
});

test("filters the public product catalogue by category and search", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Wagyu", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Wagyu Ribeye" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Angus Tenderloin" })).toHaveCount(0);
  await page.getByRole("button", { name: "All cuts" }).click();
  await page.getByRole("textbox", { name: "Search products" }).fill("short ribs");
  await expect(page.getByRole("heading", { name: "Beef Short Ribs" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Wagyu Ribeye" })).toHaveCount(0);
});

test("opens a product-specific quotation enquiry", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Request product quotation/ }).first().click();
  await expect(page.getByRole("dialog", { name: "Request a quotation" })).toBeVisible();
  await expect(page.getByLabel("Product of interest")).toHaveValue("Wagyu Ribeye");
});

test("submits a local-only buyer enquiry without sending data", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Request a quotation/ }).first().click();
  await page.getByLabel("Business email").fill("buyer@example.com");
  await page.getByLabel("Destination market").fill("Singapore");
  await page.getByLabel("Estimated volume").fill("2,000 kg per month");
  await page.getByRole("button", { name: /Submit preview enquiry/ }).click();
  await expect(page.getByRole("status")).toContainText("captured locally");
  await expect(page.getByText(/does not transmit or store personal information/)).toBeVisible();
});

test("discloses that Halal assurance and origin details are not verified", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("STATUS · NOT VERIFIED IN THIS PREVIEW")).toBeVisible();
  await expect(page.getByText(/Specific farm locations, establishment approvals/)).toBeVisible();
  await expect(page.getByText(/destination-specific approval/)).toBeVisible();
});

test("renders without horizontal overflow at mobile, tablet and desktop widths", async ({ page }) => {
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Integrity in every cut/i })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
  }
});
