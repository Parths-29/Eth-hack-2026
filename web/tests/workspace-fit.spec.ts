import { test, expect } from "@playwright/test";
for (const [width, height] of [
  [1366, 768],
  [1280, 720],
  [1280, 600],
])
  for (const route of [
    "connect",
    "replay",
    "lookup",
    "monitor",
    "incidents",
    "vault",
  ])
    test(`${route} fits ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/#" + route);
      if (route === "connect")
        await page
          .getByRole("button", { name: "Continue to dashboard" })
          .waitFor();
      else
        await expect(
          page.getByRole("heading", { name: "Loading verdicts" }),
        ).toHaveCount(0);
      await expect(
        page.getByRole("link", { name: "Home", exact: true }).first(),
      ).toBeInViewport();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollHeight <= innerHeight,
        ),
      ).toBe(true);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if (route !== "connect") {
        const body = await page.locator(".workspace-body").boundingBox();
        expect(body!.height).toBeGreaterThan(200);
        expect(body!.y + body!.height).toBeLessThanOrEqual(height);
        await expect(
          page.getByRole("navigation", { name: "Redress workspace" }),
        ).toBeInViewport();
      } else {
        await page
          .getByRole("button", { name: "Continue to dashboard" })
          .scrollIntoViewIfNeeded();
        await expect(
          page.getByRole("button", { name: "Continue to dashboard" }),
        ).toBeInViewport();
      }
    });
test('workspace scrolling resets when switching tabs',async({page})=>{
 await page.setViewportSize({width:1366,height:768});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#replay');await page.getByRole('button',{name:'Next replay block'}).waitFor();
 await page.locator('.workspace-body').evaluate(e=>e.scrollTop=300);
 await page.getByRole('button',{name:'Protocol Monitor',exact:true}).click();await expect(page.getByRole('heading',{name:'Calm-day negative control · demo'})).toBeVisible();
 expect(await page.locator('.workspace-body').evaluate(e=>e.scrollTop)).toBe(0);await expect(page.getByRole('link',{name:'Home',exact:true}).first()).toBeInViewport();
});
