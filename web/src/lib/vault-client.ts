import { createPublicClient, http, parseAbi, isAddress } from "viem";
import { sepolia } from "viem/chains";
import type { VaultReserves } from "../../../shared/types";
/** Only standard ERC20 balanceOf is assumed; no invented RedressVault getters. */
export async function readVaultReserves(
  config: {
    rpcUrl?: string;
    token?: string;
    bond?: string;
    reserve?: string;
    recovery?: string;
  },
  signal?: AbortSignal,
): Promise<VaultReserves> {
  const { rpcUrl, token, bond, reserve, recovery } = config;
  if (
    !rpcUrl ||
    ![token, bond, reserve, recovery].every((v) => v && isAddress(v))
  )
    throw Error(
      "Sepolia RPC, token and all three capital-holder addresses are required",
    );
  const client = createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl, { timeout: 8000, retryCount: 0 }),
  });
  signal?.throwIfAborted();
  if ((await client.getChainId()) !== 11155111)
    throw Error("Vault reader requires Sepolia");
  const blockNumber = await client.getBlockNumber();
  const read = (holder: string) =>
    client.readContract({
      address: token as `0x${string}`,
      abi: parseAbi([
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)",
      ]),
      functionName: "balanceOf",
      args: [holder as `0x${string}`],
      blockNumber,
    });
  const decimals = await client.readContract({
    address: token as `0x${string}`,
    abi: parseAbi(["function decimals() view returns (uint8)"]),
    functionName: "decimals",
    blockNumber,
  });
  if (decimals !== 18) throw Error("Configure an 18-decimal WETH token");
  const [a, b, c] = await Promise.all([
    read(bond!),
    read(reserve!),
    read(recovery!),
  ]);
  signal?.throwIfAborted();
  return {
    operatorBond: a.toString(),
    protocolReserve: b.toString(),
    recoveredMev: c.toString(),
    provenance: "chain",
    blockNumber: blockNumber.toString(),
  };
}
