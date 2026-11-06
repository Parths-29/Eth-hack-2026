# Incident pipeline handoff — Person B

Supply verified March 10 event logs, real borrower addresses, full tx hashes, block/log order, B−1 position snapshots, independently aligned price bands and scorecard output. The real dataset in shared/ is currently empty. The four synthetic web examples are NOT a source of historical data.

Publish verified verdicts to Arkiv, evidence to Swarm, and expose GET /verdicts as documented in shared/README.md. Reference math does not replace multi-source verification, historical execution or Solidity parity. Archive RPC/Etherscan credentials belong in ignored local env files or CI secrets, never in the browser bundle.
## Current frontend bridge

`web/src/lib/data-service.ts` is now the integration boundary. Direct SDK/Viem paths and explicitly labelled synthetic fallback are wired. See `shared/ADAPTER.md` before publishing. The browser expects a trusted-owner Arkiv v1 bytes attribute `record`, not a shortened hash or legacy payload object. Contract-specific vault getters still need the team's ABI; current reads are standard WETH balances of configured capital holders at one block.
