import { validateRecords } from "../src/lib/schema";
import { test, expect } from "@playwright/test";
import { DEMO_RECORDS } from "../../shared/demo";
import { evaluate, units, format } from "../../shared/math";
test("PRD example computes a conservative floor in exact debt units", () => {
  const record = DEMO_RECORDS[0],
    result = evaluate(record.position);
  expect(result.verdict).toBe("WRONGFUL");
  expect(result.amount).toBe(units("6.5745483").toString());
  expect(format(result.hfWorst)).toBe("1.0186");
  expect(BigInt(result.amount)).toBeLessThan(
    (BigInt(record.collateralSeized) * BigInt(record.bandLow)) /
      BigInt(record.position.debtHigh),
  );
});
test("market-driven, source outage and overpricing never invent payout", () => {
  expect(evaluate(DEMO_RECORDS[2].position)).toMatchObject({
    verdict: "VALID",
    amount: "0",
  });
  expect(evaluate(DEMO_RECORDS[3].position)).toMatchObject({
    verdict: "INCONCLUSIVE",
    amount: "0",
  });
  expect(
    evaluate({
      ...DEMO_RECORDS[0].position,
      oracleCollateral: units("1.3").toString(),
    }),
  ).toMatchObject({ verdict: "VALID", amount: "0", anomaly: "OVERPRICED" });
});
test("interval boundary is ambiguous and excess uses allowed bonus", () => {
  const base = {
    ...DEMO_RECORDS[0].position,
    collateralLow: units("1.2").toString(),
    collateralHigh: units("1.3").toString(),
    oracleCollateral: units("1").toString(),
  };
  expect(evaluate(base).verdict).toBe("AMBIGUOUS");
  expect(
    evaluate({
      ...base,
      collateral: units("200").toString(),
      seized: units("180").toString(),
    }).verdict,
  ).toBe("EXCESS");
});
test("invalid position evidence and decimal precision fail validation", () => {
  expect(() => evaluate({ ...DEMO_RECORDS[0].position, debt: "0" })).toThrow();
  expect(() => units("-1")).toThrow();
  expect(() => units("1.1234567890123456789")).toThrow();
});

test("API schema rejects false settlement and inconsistent evidence", () => {
  expect(validateRecords(DEMO_RECORDS)).toHaveLength(4);
  expect(() =>
    validateRecords([
      { ...DEMO_RECORDS[0], provenance: "verified", settlement: "paid" },
    ]),
  ).toThrow();
  expect(() =>
    validateRecords([{ ...DEMO_RECORDS[0], settlement: "paid" }]),
  ).toThrow();
  expect(() =>
    validateRecords([{ ...DEMO_RECORDS[0], bandLow: "1" }]),
  ).toThrow();
});
