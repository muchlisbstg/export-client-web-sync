import { expect, test } from "@playwright/test";

test("replaces the four-step teaser with an interactive 12-stage buyer order lifecycle", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /From first enquiry to confirmed delivery/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Buyer verification/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Acceptance & repeat order/ })).toBeVisible();
  await expect(page.getByText("STAGE 01 / 12")).toBeVisible();
  await page.getByRole("button", { name: /Quality & halal review/ }).click();
  await expect(page.getByText("STAGE 07 / 12")).toBeVisible();
  await expect(page.getByText(/Halal and quality decisions are separate/)).toBeVisible();
});

test("supports sequential stage navigation and disables lifecycle boundaries", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Previous stage" })).toBeDisabled();
  await page.getByRole("button", { name: "Next stage" }).click();
  await expect(page.getByText("STAGE 02 / 12")).toBeVisible();
  await page.getByRole("button", { name: /Acceptance & repeat order/ }).click();
  await expect(page.getByRole("button", { name: "Next stage" })).toBeDisabled();
});

test("shows the illustrative 30/30/40 payment model and server-side release control", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("30%", { exact: true })).toBeVisible();
  await expect(page.getByText("40%", { exact: true })).toBeVisible();
  await expect(page.getByText(/Goods release requires authoritative server-side authorisation/)).toBeVisible();
  await expect(page.getByText(/No payment instruction, bank connection or settlement occurs/)).toBeVisible();
});

test("buyer preparation checklist updates locally without creating or transmitting an RFQ", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("checkbox", { name: /Company and authorised contact details/ }).check();
  await expect(page.getByText("1 of 5 preparation items selected · 20%")).toBeVisible();
  await page.getByLabel("Destination market").selectOption("Malaysia");
  await page.getByRole("button", { name: "Prepare local buyer brief" }).click();
  await expect(page.getByRole("status")).toContainText("prepared locally for Malaysia");
  await expect(page.getByText(/No personal or company information is transmitted or persisted/)).toBeVisible();
});

test("discloses demonstration-only status and does not expose live operational claims", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("DEMONSTRATION WORKFLOW")).toBeVisible();
  await expect(page.getByText(/No buyer verification, RFQ transmission, quotation, contract, payment, goods release or shipment operation is connected/)).toBeVisible();
  await expect(page.getByText(/UI state cannot authorise or release goods/)).toBeVisible();
});
