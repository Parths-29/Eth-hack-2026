import { evaluate } from "../../../shared/math";
import type {
  FrontendVerdict,
  PositionInput,
  VerdictType,
} from "../../../shared/types";
const address = /^0x[\da-fA-F]{40}$/;
const hash = /^0x[\da-fA-F]{64}$/;
export function validateRecords(value: unknown): FrontendVerdict[] {
  if (!Array.isArray(value) || value.length > 10000)
    throw Error("Backend must return an array of verdicts (maximum 10,000).");
  const verdicts: VerdictType[] = [
    "VALID",
    "WRONGFUL",
    "EXCESS",
    "AMBIGUOUS",
    "INCONCLUSIVE",
  ];
  return value.map((raw) => {
    const r = raw as FrontendVerdict;
    if (
      !r ||
      !address.test(r.user) ||
      !verdicts.includes(r.verdict) ||
      !r.id ||
      !Number.isSafeInteger(r.blockNumber) ||
      r.blockNumber < 0 ||
      !Number.isSafeInteger(r.logIndex) ||
      r.logIndex < 0 ||
      !r.protocol ||
      !r.incidentId ||
      ![1, 11155111].includes(r.chainId)
    )
      throw Error("Invalid verdict identity or network from backend");
    for (const key of [
      "debtToCover",
      "collateralSeized",
      "bandLow",
      "bandHigh",
      "redressAmount",
    ] as const)
      if (!/^\d+$/.test(r[key])) throw Error(`Invalid integer amount: ${key}`);
    if (
      !r.position ||
      !Array.isArray(r.sources) ||
      !["synthetic", "verified"].includes(r.provenance) ||
      !["simulated", "pending", "paid"].includes(r.settlement)
    )
      throw Error("Missing provenance or evidence data");
    for (const key of [
      "collateral",
      "debt",
      "seized",
      "repaid",
      "collateralLow",
      "collateralHigh",
      "debtLow",
      "debtHigh",
      "oracleCollateral",
      "oracleDebt",
    ] as (keyof PositionInput)[])
      if (!/^\d+$/.test(String(r.position[key])))
        throw Error("Invalid position evidence");
    for (const s of r.sources)
      if (
        typeof s.name !== "string" ||
        !/^\d+$/.test(s.price) ||
        typeof s.status !== "string"
      )
        throw Error("Invalid price source");
    if (
      r.provenance === "verified" &&
      (!hash.test(r.liquidationTx) || !hash.test(r.evidenceHash))
    )
      throw Error(
        "Verified records require full liquidation and evidence hashes",
      );
    if (
      r.provenance === "verified" &&
      r.settlement === "paid" &&
      !hash.test(r.payoutTxHash ?? "")
    )
      throw Error("Paid records require a full transaction hash");
    if (r.provenance === "synthetic" && r.settlement !== "simulated")
      throw Error("Synthetic records cannot claim settlement");
    if (
      r.debtToCover !== r.position.repaid ||
      r.collateralSeized !== r.position.seized ||
      r.bandLow !== r.position.collateralLow ||
      r.bandHigh !== r.position.collateralHigh
    )
      throw Error("Report and position evidence disagree");
    evaluate(r.position);
    return r;
  });
}
