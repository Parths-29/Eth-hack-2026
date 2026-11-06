import type { PositionInput, VerdictResult } from "./types";
export const UNIT = 10n ** 18n;
export function units(value: string): bigint {
  if (!/^\d+(\.\d{1,18})?$/.test(value))
    throw new Error("Expected a non-negative decimal with up to 18 places");
  const [whole, frac = ""] = value.split(".");
  return BigInt(whole) * UNIT + BigInt(frac.padEnd(18, "0"));
}
export function format(value: string | bigint, places = 4): string {
  const n = BigInt(value);
  const sign = n < 0n ? "-" : "";
  const a = n < 0n ? -n : n;
  return `${sign}${a / UNIT}${places ? "." + (a % UNIT).toString().padStart(18, "0").slice(0, places) : ""}`;
}
const nonNegative = (n: bigint) => (n > 0n ? n : 0n);
/** Frontend reference only. Contract/pipeline parity remains a required team gate. */
export function evaluate(p: PositionInput): VerdictResult {
  const vals = [
    p.collateral,
    p.debt,
    p.seized,
    p.repaid,
    p.collateralLow,
    p.collateralHigh,
    p.debtLow,
    p.debtHigh,
    p.oracleCollateral,
    p.oracleDebt,
  ];
  if (vals.some((v) => !/^\d+$/.test(v)))
    throw Error("Position amounts must be unsigned integer strings");
  if (
    !Number.isInteger(p.thresholdBps) ||
    p.thresholdBps <= 0 ||
    p.thresholdBps > 10000 ||
    !Number.isInteger(p.bonusBps) ||
    p.bonusBps < 0 ||
    !Number.isInteger(p.sourceCount) ||
    p.sourceCount < 0
  )
    throw Error("Invalid position parameters");
  const [A, D, C, X, cL, cH, dL, dH, oC, oD] = vals.map(BigInt);
  if (!D || !dL || !oD || cL > cH || dL > dH || !cL || C > A || X > D)
    throw Error("Invalid position or price interval");
  const lt = BigInt(p.thresholdBps);
  const worst = (A * cL * lt * UNIT) / (D * dH * 10000n),
    best = (A * cH * lt * UNIT) / (D * dL * 10000n);
  const gate = oC * 10000n < cL * 9925n || oD * 10000n > dH * 10075n;
  const result = (
    verdict: VerdictResult["verdict"],
    amount = 0n,
  ): VerdictResult => ({
    verdict,
    amount: amount.toString(),
    hfWorst: worst.toString(),
    hfBest: best.toString(),
    gate,
    ...(oC > cH ? { anomaly: "OVERPRICED" as const } : {}),
  });
  if (p.sourceCount < 3) return result("INCONCLUSIVE");
  if (!gate) return result("VALID");
  const excess = nonNegative(
    (C * cL * 10000n - X * dH * (10000n + BigInt(p.bonusBps))) / (dH * 10000n),
  );
  // Compare full rational values at boundaries; truncated display HF never drives verdicts.
  if (A * cL * lt * 10000n >= D * dH * 10000n * 10010n)
    return result("WRONGFUL", nonNegative((C * cL - X * dH) / dH));
  if (A * cH * lt < D * dL * 10000n)
    return result(excess > 0n ? "EXCESS" : "VALID", excess);
  return result("AMBIGUOUS", excess);
}
