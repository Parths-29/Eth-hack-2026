import type { FrontendVerdict, PositionInput } from "./types";
import { evaluate, units } from "./math";
export const INCIDENT_ID = "demo-capo-2026-03-10";
const base: PositionInput = {
  collateral: units("300").toString(),
  debt: units("345.16").toString(),
  seized: units("145.99").toString(),
  repaid: units("172.58").toString(),
  collateralLow: units("1.22717").toString(),
  collateralHigh: units("1.23053").toString(),
  debtLow: units("1").toString(),
  debtHigh: units("1").toString(),
  oracleCollateral: units("1.193957").toString(),
  oracleDebt: units("1").toString(),
  thresholdBps: 9550,
  bonusBps: 100,
  sourceCount: 4,
};
/** Constructed examples, NOT the 34 real incident borrowers, hashes or block numbers. */
export const DEMO_RECORDS: FrontendVerdict[] = [
  {},
  {
    collateral: units("200").toString(),
    debt: units("230").toString(),
    seized: units("97").toString(),
    repaid: units("115").toString(),
  },
  {
    debt: units("400").toString(),
    repaid: units("172.58").toString(),
    oracleCollateral: units("1.228").toString(),
  },
  { sourceCount: 2 },
].map((change, i) => {
  const position = { ...base, ...change };
  const result = evaluate(position);
  return {
    id: `synthetic-${i + 1}`,
    incidentId: INCIDENT_ID,
    protocol: i % 2 ? "Aave v3 Prime" : "Aave v3 Core",
    chainId: 1,
    provenance: "synthetic",
    settlement: "simulated",
    liquidationTx: "",
    logIndex: i,
    blockNumber: i + 1,
    user: `0x${(i + 1).toString().padStart(40, "0")}`,
    collateralAsset: "wstETH",
    debtAsset: "WETH",
    debtToCover: position.repaid,
    collateralSeized: position.seized,
    bandLow: position.collateralLow,
    bandHigh: position.collateralHigh,
    verdict: result.verdict,
    redressAmount: result.amount,
    evidenceHash: "",
    position,
    sources: [
      "Lido fundamental",
      "Uniswap v3 TWAP",
      "Aggregator A",
      "Aggregator B",
    ].map((name, j) => ({
      name,
      price: units(["1.2284", "1.2290", "1.2288", "1.2286"][j]).toString(),
      status: j < position.sourceCount ? "synthetic input" : "unavailable",
    })),
  };
});
