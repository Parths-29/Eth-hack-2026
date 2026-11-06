import { test, expect } from "@playwright/test";
test("workspace shell persists and heading geometry stays stable across routes", async ({
  page,
}) => {
  await page.goto("/#replay");
  await page.getByRole("button", { name: "Next replay block" }).waitFor();
  await page.evaluate(() => {
    (window as any).workspaceNode = document.querySelector(".dashboard");
  });
  const before = await page.locator(".dashboard-heading").boundingBox();
  for (const name of [
    "Was I wronged?",
    "Protocol Monitor",
    "Incident Explorer",
    "Vault & coverage",
    "Replay Theater",
  ]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
    expect(
      await page.evaluate(
        () =>
          document.querySelector(".dashboard") ===
          (window as any).workspaceNode,
      ),
    ).toBe(true);
    const after = await page.locator(".dashboard-heading").boundingBox();
    expect(Math.abs(after!.y - before!.y)).toBeLessThan(1);
    expect(after!.width).toBe(before!.width);
  }
  await expect(
    page.getByRole("button", { name: "Next replay block" }),
  ).toBeVisible();
});
test("home terminal previews and safely rejects without changing hero height", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const before = await page.locator(".mosaic-hero").boundingBox();
  await page.getByRole("button", { name: "Open Redress workspace" }).click();
  const tracker = page.getByRole("region", {
    name: "Restitution transaction tracker",
  });
  await expect(tracker).toContainText("Demo calculation complete");
  const after = await page.locator(".mosaic-hero").boundingBox();
  expect(Math.abs(after!.height - before!.height)).toBeLessThan(2);
  await page
    .getByRole("button", { name: "Safe rejection", exact: true })
    .click();
  await expect(tracker).toContainText("VALID — no payout issued");
  await expect(tracker.locator("a")).toHaveCount(0);
  await page.getByRole("button", { name: "Back to explorer ×" }).click();
  await expect(
    page.getByLabel("Borrower address (optional for replay)"),
  ).toBeVisible();
});
test("lookup fills shared shell and shows a tracker as soon as a verdict is found", async ({
  page,
}) => {
  await page.goto("/#lookup");
  await page
    .getByRole("button", { name: "Use a synthetic example address ↗" })
    .click();
  await page.getByRole("button", { name: "Check address" }).click();
  await expect(
    page.getByRole("complementary", { name: "Borrower verdict preview" }),
  ).toContainText("Demo calculation complete");
  expect(
    await page
      .locator(".lookup-grid")
      .evaluate((e) => e.getBoundingClientRect().height),
  ).toBeGreaterThan(700);
});
test("rapid navigation resolves to the final scene with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#replay");
  await page.getByRole("button", { name: "Next replay block" }).waitFor();
  for (const name of ["Protocol Monitor", "Was I wronged?", "Vault & coverage"])
    await page.getByRole("button", { name, exact: true }).click();
  await expect(page.getByLabel("Oracle deviation percent")).toBeVisible();
  await expect(page.getByLabel("Borrower wallet address")).toHaveCount(0);
  expect(
    await page
      .locator(".workspace-scene")
      .evaluate((e) => getComputedStyle(e).transform),
  ).toBe("none");
});
