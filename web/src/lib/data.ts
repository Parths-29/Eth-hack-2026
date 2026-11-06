import type { FrontendVerdict } from "../../../shared/types";
export {
  isDemo,
  API_URL,
  getIncidentVerdicts as loadVerdicts,
} from "./data-service";
export type { Filters } from "./data-service";
const hash = /^0x[\da-fA-F]{64}$/;
export const isAddress = (value: string) => /^0x[\da-fA-F]{40}$/.test(value);
export const shorten = (value: string) =>
  value ? `${value.slice(0, 6)}…${value.slice(-4)}` : "Not published";
export function transactionUrl(
  record: FrontendVerdict,
  payout = false,
): string | null {
  const tx = payout ? record.payoutTxHash : record.liquidationTx;
  if (record.provenance !== "verified" || !hash.test(tx ?? "")) return null;
  return `https://${record.chainId === 11155111 ? "sepolia." : ""}etherscan.io/tx/${tx}`;
}
