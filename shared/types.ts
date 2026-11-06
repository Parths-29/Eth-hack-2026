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
export type VerdictStatus = VerdictType;
/** Compatibility/display DTO only. Settlement arithmetic must use the exact-string types above. */
export interface LiquidationVerdict {
  liquidationTx: `0x${string}`;
  logIndex: number;
  blockNumber: number;
  user: `0x${string}`;
  collateralAsset: string;
  debtAsset: string;
  debtToCover: string;
  collateralSeized: string;
  protocolOraclePrice: number;
  independentBandLow: number;
  independentBandHigh: number;
  verdict: VerdictStatus;
  redressAmountWETH: number;
  evidenceHash: string;
  payoutTxHash?: `0x${string}`;
  arkivEntityKey?: string;
}
export interface IncidentSummary {
  incidentId: string;
  protocol: string;
  date: string;
  targetAsset: string;
  totalLiquidatedCollateral: string;
  affectedAccountsCount: number;
  totalRedressPaidWETH: number;
  oracleDeviationPct: number;
}
export interface VaultReserves {
  operatorBond: string;
  protocolReserve: string;
  recoveredMev: string;
  provenance: "synthetic" | "chain";
  blockNumber?: string;
}
