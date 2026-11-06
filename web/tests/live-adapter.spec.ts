import { test, expect } from "@playwright/test";
test("live mode missing config falls back visibly without breaking lookup", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5174/#lookup");
  await expect(
    page.getByText("Live integration unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Retry live read" }),
  ).toBeVisible();
  await page
    .getByLabel("Borrower wallet address")
    .fill("0x0000000000000000000000000000000000000001");
  await page.getByRole("button", { name: "Check address" }).click();
  await expect(
    page.getByRole("complementary", { name: "Borrower verdict preview" }),
  ).toContainText("Synthetic walkthrough");
  expect(errors).toEqual([]);
});
test("empty fallback query is not relabelled as live success", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:5174/#lookup");
  await page
    .getByLabel("Borrower wallet address")
    .fill("0xffffffffffffffffffffffffffffffffffffffff");
  await page.getByRole("button", { name: "Check address" }).click();
  await expect(
    page.getByText("No record found for this address", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText("Live integration unavailable.", { exact: false }),
  ).toBeVisible();
});
