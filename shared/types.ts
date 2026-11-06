export type VerdictType =
  "VALID" | "WRONGFUL" | "EXCESS" | "AMBIGUOUS" | "INCONCLUSIVE";
/** Quantities and prices are 18-decimal integer strings. Never use formatted units here. */
export interface VerdictReport {
  liquidationTx: string;
  logIndex: number;
  blockNumber: number;
  user: string;
  collateralAsset: string;
  debtAsset: string;
  debtToCover: string;
  collateralSeized: string;
  bandLow: string;
  bandHigh: string;
  verdict: VerdictType;
  redressAmount: string;
  evidenceHash: string;
  arkivEntityKey?: string;
  payoutTxHash?: string;
}
export interface PositionInput {
  collateral: string;
  debt: string;
  seized: string;
  repaid: string;
  collateralLow: string;
  collateralHigh: string;
  debtLow: string;
  debtHigh: string;
  oracleCollateral: string;
  oracleDebt: string;
  thresholdBps: number;
  bonusBps: number;
  sourceCount: number;
}
export interface VerdictResult {
  verdict: VerdictType;
  amount: string;
  hfWorst: string;
  hfBest: string;
  gate: boolean;
  anomaly?: "OVERPRICED";
}
export interface FrontendVerdict extends VerdictReport {
  id: string;
  incidentId: string;
  protocol: string;
  chainId: number;
  provenance: "synthetic" | "verified";
  settlement: "simulated" | "pending" | "paid";
  position: PositionInput;
  sources: { name: string; price: string; status: string }[];
}
