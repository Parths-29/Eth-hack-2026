import { validateRecords } from "./schema";
import type {
  FrontendVerdict,
  PositionInput,
  VerdictType,
} from "../../../shared/types";
import { DEMO_RECORDS } from "../../../shared/demo";
const env = (import.meta as ImportMeta & { env: Record<string, string> }).env;
export const API_URL = (env.VITE_REDRESS_API_URL ?? "").replace(/\/$/, "");
export const isDemo = !API_URL;
const address = /^0x[\da-fA-F]{40}$/;
const hash = /^0x[\da-fA-F]{64}$/;
export const isAddress = (value: string) => address.test(value);
export const shorten = (value: string) =>
  value ? `${value.slice(0, 6)}…${value.slice(-4)}` : "Not published";
export type Filters = {
  user?: string;
  incidentId?: string;
  protocol?: string;
  verdict?: string;
};
export async function loadVerdicts(
  filters: Filters = {},
  signal?: AbortSignal,
): Promise<FrontendVerdict[]> {
  let records: FrontendVerdict[];
  if (isDemo) {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, 100);
      signal?.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          reject(new DOMException("Aborted", "AbortError"));
        },
        { once: true },
      );
    });
    records = DEMO_RECORDS;
  } else {
    const url = new URL(`${API_URL}/verdicts`);
    Object.entries(filters).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
    const res = await fetch(url, {
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(10000)])
        : AbortSignal.timeout(10000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw Error(`Verdict service returned HTTP ${res.status}`);
    records = validateRecords(await res.json());
  }
  return records.filter(
    (r) =>
      (!filters.user || r.user.toLowerCase() === filters.user.toLowerCase()) &&
      (!filters.incidentId || r.incidentId === filters.incidentId) &&
      (!filters.protocol || r.protocol === filters.protocol) &&
      (!filters.verdict || r.verdict === filters.verdict),
  );
}
export function transactionUrl(
  record: FrontendVerdict,
  payout = false,
): string | null {
  const tx = payout ? record.payoutTxHash : record.liquidationTx;
  if (record.provenance !== "verified" || !hash.test(tx ?? "")) return null;
  return `https://${record.chainId === 11155111 ? "sepolia." : ""}etherscan.io/tx/${tx}`;
}
