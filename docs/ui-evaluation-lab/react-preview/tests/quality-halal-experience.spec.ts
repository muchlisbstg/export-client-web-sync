import { expect, test } from "@playwright/test";

test("quality and halal assurance clearly discloses that no records are verified", async ({page})=>{
 await page.goto("/");
 await expect(page.getByRole("heading",{name:/Evidence-led assurance/})).toBeVisible();
 await expect(page.getByText(/NO LIVE VERIFICATION/)).toBeVisible();
 await expect(page.getByText("0",{exact:true}).first()).toBeVisible();
 await expect(page.getByText("NOT CONNECTED",{exact:true}).first()).toBeVisible();
});
test("buyer can filter evidence controls by halal and quality domains",async({page})=>{
 await page.goto("/");
 await page.getByLabel("Filter evidence domain").selectOption("Halal");
 await expect(page.getByText("Halal certificate & scope")).toBeVisible();
 await expect(page.getByText("Cut & product specification")).toHaveCount(0);
 await page.getByLabel("Filter evidence domain").selectOption("Quality");
 await expect(page.getByText("Cut & product specification")).toBeVisible();
 await expect(page.getByText("Halal certificate & scope")).toHaveCount(0);
});
test("evidence control expands to show acceptance criteria and linkage scope",async({page})=>{
 await page.goto("/");
 await page.getByRole("button",{name:/Halal certificate & scope/}).click();
 await expect(page.getByText(/certificate number, validity, covered establishment/)).toBeVisible();
 await expect(page.getByText(/Required linkage:/)).toContainText("Establishment + product lot + destination");
});
test("evidence search has a useful empty state",async({page})=>{
 await page.goto("/");
 await page.getByLabel("Search assurance evidence").fill("made-up-control");
 await expect(page.getByText(/No matching evidence controls/)).toBeVisible();
});
test("buyer review brief is local-only and makes no verification claim",async({page})=>{
 await page.goto("/");
 await page.locator(".ahb-assurance-review").getByLabel("Destination market").fill("Indonesia");
 await page.locator(".ahb-assurance-review").getByLabel("Demo lot reference").fill("SYNTHETIC-LOT-99");
 await page.getByRole("button",{name:/Prepare review brief/}).click();
 await expect(page.getByRole("status")).toContainText("No certificate, lot, supplier or destination eligibility was verified");
});
