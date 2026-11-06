import { test, expect } from "@playwright/test";
import { withFallback } from "../src/lib/adapter-core";
import { queryArkivVerdicts } from "../src/lib/arkiv-client";
import { readVaultReserves } from "../src/lib/vault-client";
import { cn } from "../src/lib/utils";
test("successful live responses never call fallback", async () => {
  let called = false;
  expect(
    await withFallback(
      async () => ["live"],
      () => {
        called = true;
        return ["mock"];
      },
      () => {},
    ),
  ).toEqual(["live"]);
  expect(called).toBe(false);
});
test("RPC failure calls fallback and reports provenance", async () => {
  let notified = 0;
  expect(
    await withFallback(
      async () => {
        throw Error("RPC unavailable");
      },
      () => ["synthetic"],
      () => notified++,
    ),
  ).toEqual(["synthetic"]);
  expect(notified).toBe(1);
});
test("cancellation does not turn into demo results", async () => {
  const controller = new AbortController();
  controller.abort();
  let fallback = false;
  await expect(
    withFallback(
      async () => [],
      () => {
        fallback = true;
        return [];
      },
      () => {},
      controller.signal,
    ),
  ).rejects.toThrow();
  expect(fallback).toBe(false);
});
test("live readers require explicit trusted publisher and capital addresses", async () => {
  await expect(queryArkivVerdicts({})).rejects.toThrow("trusted Arkiv");
  await expect(readVaultReserves({})).rejects.toThrow("addresses are required");
});
test("cn merges conflicting Tailwind utilities", () => {
  expect(cn("p-2", false && "hidden", "p-4")).toBe("p-4");
});
