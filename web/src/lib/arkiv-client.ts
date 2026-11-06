import { createPublicClient } from "@arkiv-network/sdk";
import { rabdi } from "@arkiv-network/sdk/chains";
import { eq } from "@arkiv-network/sdk/query";
import { http, hexToString, isAddress } from "viem";
import { validateRecords } from "./schema";
import type { FrontendVerdict } from "../../../shared/types";
export interface ArkivConfig {
  rpcUrl?: string;
  accessKey?: string;
  owner?: string;
}
/** SDK v1 uses select/where/fetch, not the obsolete buildQuery API in the draft. */
export async function queryArkivVerdicts(
  config: ArkivConfig,
  user?: string,
  signal?: AbortSignal,
): Promise<FrontendVerdict[]> {
  if (user && !isAddress(user)) throw Error("Invalid borrower address");
  if (!config.owner || !isAddress(config.owner))
    throw Error("Configure the trusted Arkiv publisher address");
  const chain = rabdi({ accessKey: config.accessKey ?? "" });
  const client = createPublicClient({
    chain,
    transport: http(config.rpcUrl || undefined, {
      timeout: 8000,
      retryCount: 0,
    }),
  });
  if ((await client.getChainId()) !== 7794095)
    throw Error("Arkiv RPC is not Rabdi");
  const records: FrontendVerdict[] = [];
  for (let offset = 0; offset < 10000; offset += 100) {
    signal?.throwIfAborted();
    let query = client
      .select({ $key: true, record: true })
      .ownedBy(config.owner as `0x${string}`)
      .where(eq("type", "verdict"));
    if (user)
      query = query.where(
        eq("type", "verdict"),
        eq("user", user.toLowerCase()),
      );
    const page = await query.limit(100).offset(offset).fetch();
    signal?.throwIfAborted();
    for (const entity of page.entities) {
      if (!entity.record || entity.record.type !== "bytes")
        throw Error("Expected a v1 bytes attribute named record");
      const row = JSON.parse(hexToString(entity.record.value));
      records.push(
        ...validateRecords([{ ...row, arkivEntityKey: entity.$key }]),
      );
    }
    if (page.entities.length < 100) return records;
  }
  throw Error("Arkiv result exceeds frontend limit; narrow the query");
}

export const fetchArkivVerdictByUser = (
  walletAddress: string,
  config: ArkivConfig,
  signal?: AbortSignal,
) => queryArkivVerdicts(config, walletAddress, signal);
