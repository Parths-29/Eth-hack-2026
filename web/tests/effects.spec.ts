import { test, expect } from "@playwright/test";
test("full-width dark shell and sans headings", async ({ page }) => {
  await page.goto("/");
  expect(
    await page
      .locator(".app-shell")
      .evaluate((e) => e.getBoundingClientRect().width),
  ).toBe(
    await page.evaluate(() => document.body.getBoundingClientRect().width),
  );
  expect(
    await page
      .locator(".mosaic-hero")
      .evaluate((e) => getComputedStyle(e).borderTopWidth),
  ).toBe("1px");
  await expect(page.locator("#features h2")).toHaveText("Built for redress");
  await expect(page.locator("#features h2 svg,#pricing h2 svg")).toHaveCount(0);
  const background = await page
    .locator(".pricing-section")
    .evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(background).toBe("rgba(0, 0, 0, 0)");
});
test("lifecycle selection supports keyboard and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const first = page.getByRole("tab", { name: /Detect oracle anomaly/ });
  await first.click();
  await first.press("ArrowDown");
  await expect(
    page.getByRole("tab", { name: /Rebuild the independent band/ }),
  ).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText(
    "Independent price band",
  );
  await page.getByRole("tab", { name: /Publish verifiable evidence/ }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Not published");
  await expect(
    page.getByRole("button", { name: "Pause lifecycle" }),
  ).toHaveCount(0);
  await page.waitForTimeout(4700);
  await expect(
    page.getByRole("tab", { name: /Publish verifiable evidence/ }),
  ).toHaveAttribute("aria-selected", "true");
});
test("wave background falls back without WebGL", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: any,
      ...args: any[]
    ) {
      if (type === "webgl") return null;
      return (original as any).apply(this, [type, ...args]);
    } as any;
  });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5173/");
  await expect(
    page.getByRole("heading", {
      name: "When oracles fail. Make people whole.",
    }),
  ).toBeVisible();
  expect(
    await page
      .locator(".wave-background")
      .evaluate((e) => getComputedStyle(e).backgroundImage),
  ).toContain("gradient");
  await page
    .getByRole("button", { name: "Connect wallet", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Choose your account." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("reduced motion disables the animated shader", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:5173/");
  await expect(page.locator(".wave-background")).toBeVisible();
  await expect(page.locator(".wave-background canvas")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".wave-background canvas")).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".wave-background canvas")).toHaveCount(0);
});

test("wallet has one home action and a centered picker", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Connect wallet", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Back to home", exact: true }),
  ).toHaveCount(1);
  expect(
    await page
      .locator(".connect-page")
      .evaluate((e) => getComputedStyle(e).justifyContent),
  ).toBe("center");
});
test("synthetic tracker never claims a transaction or funds sent", async ({
  page,
}) => {
  await page.goto("/#replay");
  await page.getByRole("button", { name: "Next replay block" }).click();
  await page.getByRole("button", { name: /0x0000…0001/ }).click();
  const tracker = page.getByRole("region", {
    name: "Restitution transaction tracker",
  });
  await expect(tracker).toContainText("Synthetic walkthrough · No funds sent");
  await expect(tracker).toContainText(
    "No CRE attestation or block-confirmation data",
  );
  await expect(tracker.locator("a")).toHaveCount(0);
  const downloadPromise = page.waitForEvent("download");
  await tracker.getByRole("button", { name: "View evidence manifest" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "redress-synthetic-1.json",
  );
});

test("lifecycle autoplay advances only while visible and pauses for exploration", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.locator("#features").scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(
    page.getByRole("tab", { name: /Rebuild the independent band/ }),
  ).toHaveAttribute("aria-selected", "true", { timeout: 6500 });
  await page.getByRole("tab", { name: /Rebuild the independent band/ }).hover();
  await page.waitForTimeout(4700);
  await expect(
    page.getByRole("tab", { name: /Rebuild the independent band/ }),
  ).toHaveAttribute("aria-selected", "true");
});
