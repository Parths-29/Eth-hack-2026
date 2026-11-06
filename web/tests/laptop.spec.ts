import { test, expect } from "@playwright/test";
for (const [width, height] of [
  [1366, 768],
  [1440, 900],
  [1280, 720],
  [1536, 864],
  [1920, 1080],
  [1280, 600],
])
  test(`hero fits laptop ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const hero = await page.locator(".mosaic-hero").boundingBox();
    expect(hero!.y + hero!.height).toBeLessThanOrEqual(height);
    await expect(
      page.getByRole("button", { name: "Explore replay", exact: true }),
    ).toBeInViewport();
    await expect(
      page.getByRole("button", { name: "Open Redress workspace" }),
    ).toBeInViewport();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const styles = await page
      .locator(".lifecycle-section")
      .evaluate((e) => ({
        blur: getComputedStyle(e).backdropFilter,
        border: getComputedStyle(e).borderTopWidth,
      }));
    expect(styles).toEqual({ blur: "none", border: "0px" });
  });
