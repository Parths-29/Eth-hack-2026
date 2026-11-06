import { test, expect } from "@playwright/test";
const address = "0x0000000000000000000000000000000000000001";
for (const width of [1440, 768, 375])
  test(`Redress full flow and responsive layout ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: "When oracles fail. Make people whole.",
      }),
    ).toBeVisible();
    await noOverflow(page);
    await page
      .getByRole("button", { name: "Connect wallet", exact: true })
      .click();
    await expect(
      page.getByText("MetaMask not detected.", { exact: false }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Select DEMO account 2/ }).click();
    await page.getByRole("button", { name: "Continue to dashboard" }).click();
    await expect(
      page.getByRole("heading", { name: "Replay Theater", exact: true }),
    ).toBeVisible();
    await noOverflow(page);
    await page.getByRole("button", { name: "Next replay block" }).click();
    await expect(
      page.getByText("WRONGFUL", { exact: true }).first(),
    ).toBeVisible();
    await page.getByRole("button", { name: /0x0000…0001/ }).click();
    await expect(
      page.getByRole("heading", { name: "Verdict & evidence" }),
    ).toBeVisible();
    await expect(
      page.getByText("SIMULATED • NOT PAID", { exact: true }),
    ).toBeVisible();
    await noOverflow(page);
    await page
      .getByRole("button", { name: "Was I wronged?", exact: true })
      .click();
    await page.getByLabel("Borrower wallet address").fill(address);
    await page.getByRole("button", { name: "Check address" }).click();
    await expect(
      page.getByRole("button", { name: /0x0000…0001/ }),
    ).toBeVisible();
    await noOverflow(page);
    expect(errors).toEqual([]);
  });
async function noOverflow(page: import("@playwright/test").Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
test("lookup validates address and returns honest no-record state", async ({
  page,
}) => {
  await page.goto("/#lookup");
  await page.getByLabel("Borrower wallet address").fill("0xabc");
  await page.getByRole("button", { name: "Check address" }).click();
  await expect(page.getByRole("alert")).toContainText("complete");
  await page
    .getByLabel("Borrower wallet address")
    .fill("0xffffffffffffffffffffffffffffffffffffffff");
  await page.getByRole("button", { name: "Check address" }).click();
  await expect(page.getByRole("status")).toContainText("No record found");
});
test("replay autoplay, pause, seek and reset work", async ({ page }) => {
  await page.goto("/#replay");
  await page.getByRole("button", { name: "Play replay", exact: true }).click();
  await expect(page.getByLabel("Replay position")).toHaveValue("1", {
    timeout: 4000,
  });
  await page.getByRole("button", { name: "Pause replay", exact: true }).click();
  await page.getByLabel("Replay position").fill("4");
  await expect(
    page.getByText("INCONCLUSIVE", { exact: true }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset replay" }).click();
  await expect(page.getByLabel("Replay position")).toHaveValue("0");
});
test("explorer filters and vault cap simulator", async ({ page }) => {
  await page.goto("/#incidents");
  await page
    .getByRole("combobox", { name: "Verdict", exact: true })
    .selectOption("VALID");
  await expect(
    page.getByText("1 matching records", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("Minimum redress (WETH)").fill("100");
  await expect(page.getByText("No records match these filters.")).toBeVisible();
  await page
    .getByRole("button", { name: "Vault & coverage", exact: true })
    .click();
  await page.getByLabel("Oracle deviation percent").fill("0");
  await expect(
    page.getByRole("heading", { name: "Computed obligation" }).locator(".."),
  ).toContainText("0.0000");
  await page.getByLabel("Operator bond WETH").fill("0");
  await page.getByLabel("Shared reserve WETH").fill("0");
  await page.getByLabel("Oracle deviation percent").fill("2.85");
  await expect(
    page.getByRole("heading", { name: "Queued obligation" }).locator(".."),
  ).not.toContainText("0.0000");
  await noOverflow(page);
});
test("rejected connection and Escape restore keyboard focus", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as any).ethereum = {
      isMetaMask: true,
      request: async () => {
        throw { code: 4001 };
      },
    };
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Connect wallet", exact: true })
    .click();
  await expect(
    page.getByText("MetaMask request rejected.", { exact: false }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Connect wallet", exact: true }),
  ).toBeFocused();
});
test("wallet identity populates borrower lookup", async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).ethereum = {
      isMetaMask: true,
      request: async ({ method }: any) =>
        ({
          eth_requestAccounts: ["0x1234567890123456789012345678901234567890"],
          eth_chainId: "0x2105",
          eth_getBalance: "0x1bc16d674ec80000",
        })[method],
    };
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Connect wallet", exact: true })
    .click();
  await expect(page.getByText("2.0000 ETH", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue to dashboard" }).click();
  await page
    .getByRole("button", { name: "Was I wronged?", exact: true })
    .click();
  await expect(page.getByLabel("Borrower wallet address")).toHaveValue(
    "0x1234567890123456789012345678901234567890",
  );
});
test("home preserves theme and domain actions", async ({ page }) => {
  await page.goto("/");
  const colors = await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement);
    return ["--navy", "--cream", "--coral"].map((k) =>
      css.getPropertyValue(k).trim(),
    );
  });
  expect(colors).toEqual(["#05070E", "#F1F3F7", "#FF5533"]);
  await page.getByRole("button", { name: "Stress 2×" }).click();
  await expect(page.getByText("2000", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Lookup", exact: true }).click();
  await page
    .getByLabel("Borrower address (optional for replay)")
    .fill("not-an-address");
  await page.getByRole("button", { name: "Open Redress workspace" }).click();
  await expect(page.getByRole("status")).toContainText("complete 0x");
});
