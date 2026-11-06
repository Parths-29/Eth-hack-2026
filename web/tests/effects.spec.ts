import { test, expect } from "@playwright/test";
test("scroll effects reveal content and preserve title geometry", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:5173/");
  const title = page.locator("#features h2");
  await title.scrollIntoViewIfNeeded();
  await expect(page.locator("#features .center-heading")).toHaveClass(
    /revealed/,
  );
  await expect(title.locator("svg")).toHaveClass(/pixels-visible/);
  await page.waitForTimeout(1600);
  const before = await title.boundingBox();
  await title.hover();
  await page.mouse.move(
    before!.x + before!.width / 2,
    before!.y + before!.height / 2,
  );
  await expect(title).toHaveJSProperty(
    "offsetHeight",
    Math.round(before!.height),
  );
  const card = page.locator(".feature-tile").first();
  await card.hover();
  expect(
    await card.evaluate((e) =>
      getComputedStyle(e).getPropertyValue("--pointer-x"),
    ),
  ).not.toBe("");
  await page.locator("#pricing").scrollIntoViewIfNeeded();
  await expect(page.locator("#pricing .center-heading")).toHaveClass(
    /revealed/,
  );
});
test("reduced motion keeps all sections and pixels static", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:5173/");
  await page.locator("#features").scrollIntoViewIfNeeded();
  expect(
    await page
      .locator("#features .center-heading")
      .evaluate((e) => getComputedStyle(e).opacity),
  ).toBe("1");
  expect(
    await page
      .locator(".pixel-title rect")
      .first()
      .evaluate((e) => getComputedStyle(e).animationName),
  ).toBe("none");
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
