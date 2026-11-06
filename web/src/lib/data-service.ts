import { useSyncExternalStore } from "react";
import { DEMO_RECORDS } from "../../../shared/demo";
import type { FrontendVerdict, VaultReserves } from "../../../shared/types";
import { units } from "../../../shared/math";
import { validateRecords } from "./schema";
import { withFallback } from "./adapter-core";
const env = (
  import.meta as ImportMeta & { env: Record<string, string | undefined> }
).env;
export const API_URL = (env.VITE_REDRESS_API_URL ?? "").replace(/\/$/, "");
const toggle = env.VITE_USE_MOCK_DATA ?? env.NEXT_PUBLIC_USE_MOCK_DATA;
export const configuredMode =
  toggle === "false"
    ? "live"
    : toggle === undefined && API_URL
      ? "api"
      : "mock";
export let isDemo = configuredMode === "mock";
type Status = { mode: "mock" | "live" | "api" | "fallback"; message: string };
let status: Status = {
  mode: configuredMode,
  message:
    configuredMode === "mock"
      ? "Demo data · synthetic examples"
      : "Live reads configured · awaiting verification",
};
const listeners = new Set<() => void>();
function update(mode: Status["mode"], message: string) {
  isDemo = mode === "mock" || mode === "fallback";
  if (status.mode === mode && status.message === message) return;
  status = { mode, message };
  listeners.forEach((fn) => fn());
}
export const getDataStatus = () => status;
export function useDataStatus() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    getDataStatus,
    getDataStatus,
  );
}
const demoVault: VaultReserves = {
  operatorBond: units("250").toString(),
  protocolReserve: units("1000").toString(),
  recoveredMev: "0",
  provenance: "synthetic",
};
export const getDemoScenario = (kind: "wrongful" | "valid" = "wrongful") =>
  DEMO_RECORDS[kind === "valid" ? 2 : 0];
export const getDemoVaultReserves = () => ({ ...demoVault });
export type Filters = {
  user?: string;
  incidentId?: string;
  protocol?: string;
  verdict?: string;
};
async function read(filters: Filters = {}, signal?: AbortSignal) {
  const mock = () =>
    DEMO_RECORDS.filter(
      (r) =>
        (!filters.user ||
          r.user.toLowerCase() === filters.user.toLowerCase()) &&
        (!filters.incidentId || r.incidentId === filters.incidentId) &&
        (!filters.protocol || r.protocol === filters.protocol) &&
        (!filters.verdict || r.verdict === filters.verdict),
    );
  if (configuredMode === "mock") {
    signal?.throwIfAborted();
    return mock();
  }
  const live = async () => {
    let rows: FrontendVerdict[];
    if (configuredMode === "api") {
      const url = new URL(`${API_URL}/verdicts`);
      Object.entries(filters).forEach(([k, v]) => {
        if (v) url.searchParams.set(k, v);
      });
      const response = await fetch(url, {
        signal: signal
          ? AbortSignal.any([signal, AbortSignal.timeout(10000)])
          : AbortSignal.timeout(10000),
      });
      if (!response.ok) throw Error("Verdict API unavailable");
      rows = validateRecords(await response.json());
    } else {
      const { queryArkivVerdicts } = await import("./arkiv-client");
      rows = await queryArkivVerdicts(
        {
          rpcUrl: env.VITE_ARKIV_RPC_URL,
          accessKey: env.VITE_ARKIV_ACCESS_KEY,
          owner: env.VITE_ARKIV_PUBLISHER,
        },
        filters.user,
        signal,
      );
    }
    signal?.throwIfAborted();
    update(
      rows.some((r) => r.provenance === "synthetic")
        ? "fallback"
        : configuredMode,
      rows.some((r) => r.provenance === "synthetic")
        ? "Source returned synthetic records · not live evidence"
        : "Live source response · independently verify provenance",
    );
    return rows.filter(
      (r) =>
        (!filters.user ||
          r.user.toLowerCase() === filters.user.toLowerCase()) &&
        (!filters.incidentId || r.incidentId === filters.incidentId) &&
        (!filters.protocol || r.protocol === filters.protocol) &&
        (!filters.verdict || r.verdict === filters.verdict),
    );
  };
  return withFallback(
    live,
    mock,
    () => {
      console.warn(
        "[Redress] Live verdict read unavailable; showing labelled synthetic fallback.",
      );
      update(
        "fallback",
        "Live read unavailable · synthetic fallback · no funds sent",
      );
    },
    signal,
  );
}
export const getIncidentReplayData = (signal?: AbortSignal) => read({}, signal);
export const getBorrowerVerdict = (address: string, signal?: AbortSignal) => {
  if (!/^0x[\da-fA-F]{40}$/.test(address))
    return Promise.reject(Error("Invalid borrower address"));
  return read({ user: address.toLowerCase() }, signal);
};
export const getLiveMonitorFeed = (signal?: AbortSignal) =>
  read(configuredMode === "mock" ? { verdict: "VALID" } : {}, signal);
export const getIncidentVerdicts = (
  filters: Filters = {},
  signal?: AbortSignal,
) => read(filters, signal);
export async function getVaultReserves(
  signal?: AbortSignal,
): Promise<VaultReserves> {
  if (configuredMode === "mock") return getDemoVaultReserves();
  return withFallback(
    async () => {
      const { readVaultReserves } = await import("./vault-client");
      return readVaultReserves(
        {
          rpcUrl: env.VITE_SEPOLIA_RPC_URL,
          token: env.VITE_WETH_ADDRESS,
          bond: env.VITE_OPERATOR_BOND_ADDRESS,
          reserve: env.VITE_REDRESS_VAULT_ADDRESS,
          recovery: env.VITE_RECOVERY_ADDRESS,
        },
        signal,
      );
    },
    getDemoVaultReserves,
    () => {
      console.warn(
        "[Redress] Vault read unavailable; using illustrative capital.",
      );
      update(
        "fallback",
        "Vault read unavailable · illustrative capital, not funded",
      );
    },
    signal,
  );
}
export const fetchArkivVerdictByUser = getBorrowerVerdict;
