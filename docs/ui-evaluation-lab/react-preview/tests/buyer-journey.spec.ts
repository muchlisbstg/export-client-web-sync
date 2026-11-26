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
  await page.getByLabel("Filter by category").selectOption("Wagyu");
  await expect(page.getByRole("heading", { name: "Wagyu Ribeye" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Angus Tenderloin" })).toHaveCount(0);
  await page.getByLabel("Filter by category").selectOption("All products");
  await page.getByLabel("Search product catalogue").fill("AHB-P-005");
  await expect(page.getByRole("heading", { name: "Beef Short Ribs" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Wagyu Ribeye" })).toHaveCount(0);
});

test("opens a product-specific buyer enquiry from the product specification", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "View specifications" }).first().click();
  await expect(page.getByRole("dialog", { name: "Wagyu Ribeye" })).toBeVisible();
  await page.getByRole("button", { name: /Configure buyer enquiry/ }).click();
  await expect(page.getByRole("dialog", { name: "Wagyu Ribeye" }).getByLabel("Destination market")).toBeVisible();
  await expect(page.getByLabel("Estimated quantity")).toBeVisible();
});

test("submits a local-only buyer enquiry without sending data", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Request a quotation/ }).first().click();
  await page.getByLabel("Business email").fill("buyer@example.com");
  await page.getByPlaceholder("Country / destination port").fill("Singapore");
  await page.getByLabel("Estimated volume").fill("2,000 kg per month");
  await page.getByRole("button", { name: /Submit preview enquiry/ }).click();
  await expect(page.getByRole("status")).toContainText("captured locally");
  await expect(page.getByText(/does not transmit or store personal information/)).toBeVisible();
});

test("discloses that Halal assurance and origin details are not verified", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("STATUS · NOT VERIFIED IN THIS PREVIEW")).toBeVisible();
  await expect(page.getByText(/No farm, supplier, establishment, livestock consignment or product lot has been verified/i)).toBeVisible();
  await expect(page.getByText(/Claims must be substantiated against the actual lot and the rules of the destination market/i)).toBeVisible();
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

test("keeps keyboard focus inside the product specification dialog and supports Escape", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "View specifications" }).first();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Wagyu Ribeye" });
  const close = page.getByRole("button", { name: "Close product details" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: /Configure buyer enquiry/ })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("uses a real stock photograph in the hero with an explicit non-origin disclaimer", async ({ page }) => {
  await page.goto("/");
  const heroPhoto = page.locator(".hero-image-art img");
  await expect(heroPhoto).toHaveAttribute("src", /images\.pexels\.com\/photos\/31406830\//);
  await expect(heroPhoto).toHaveAttribute("alt", /not a representation of AHB inventory or Australian origin/i);
  await expect(page.getByText(/ILLUSTRATIVE STOCK PHOTOGRAPH.*NOT AHB INVENTORY/)).toBeVisible();
  const naturalWidth = await heroPhoto.evaluate(async (node: HTMLImageElement) => {
    await node.decode();
    return node.naturalWidth;
  });
  expect(naturalWidth).toBeGreaterThan(0);
});

test("uses a Gloucester NSW regional stock photo with a supplier-origin disclaimer", async ({ page }) => {
  await page.goto("/");
  const originPhoto = page.locator(".ahb-origin-photo > img");
  await expect(originPhoto).toHaveAttribute("src", /images\.pexels\.com\/photos\/29531063\//);
  await expect(originPhoto).toHaveAttribute("alt", /Gloucester, New South Wales.*not an AHB supplier farm/i);
  await expect(page.locator(".ahb-origin-photo-disclaimer")).toContainText("Not an AHB supplier farm or verified supply location");
  const naturalWidth = await originPhoto.evaluate(async (node: HTMLImageElement) => {
    await node.decode();
    return node.naturalWidth;
  });
  expect(naturalWidth).toBeGreaterThan(0);
});

test("loads all public-site visual assets without broken images", async ({ page }) => {
  await page.goto("/");
  const images = page.locator("main img");
  await expect(images).toHaveCount(25);
  for (const image of await images.all()) {
    const naturalWidth = await image.evaluate(async (node: HTMLImageElement) => {
      node.loading = "eager";
      await node.decode();
      return node.naturalWidth;
    });
    expect(naturalWidth, `image failed to load: ${await image.getAttribute("src")}`).toBeGreaterThan(0);
  }
});
