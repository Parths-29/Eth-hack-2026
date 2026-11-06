# Mock-to-live integration handoff

The UI reads `web/src/lib/data-service.ts`. Default mode is deterministic synthetic data. Live mode uses lazy-loaded Arkiv SDK and Viem readers; no UI redesign is needed.

## Configuration

Copy `web/.env.example` to `web/.env.local` and restart Vite. `VITE_USE_MOCK_DATA=false` enables direct reads. `NEXT_PUBLIC_USE_MOCK_DATA=false` is accepted as a compatibility alias if the VITE toggle is unset. Both are public configuration; this remains a Vite app, not Next.js. With neither toggle set, an existing `VITE_REDRESS_API_URL` retains legacy backend mode. Explicit true always chooses mock data.

Required live settings:
- `VITE_ARKIV_PUBLISHER`: trusted attestor/owner address. The reader does NOT accept arbitrary public verdict entities as proof.
- `VITE_ARKIV_RPC_URL`: Rabdi endpoint (chain ID 7794095 is checked), optionally an origin-restricted public Arkiv access key. Public RPC is rate limited.
- `VITE_SEPOLIA_RPC_URL`, `VITE_WETH_ADDRESS`, `VITE_OPERATOR_BOND_ADDRESS`, `VITE_REDRESS_VAULT_ADDRESS`, `VITE_RECOVERY_ADDRESS`: Sepolia RPC and three WETH capital-holder addresses.

No secrets or signing keys belong in frontend env. Use a backend proxy for private RPC credentials.

## Arkiv SDK v1 publishing contract

Installed `@arkiv-network/sdk` 1.0.1 uses `select().where().fetch()` rather than the outdated `buildQuery().withPayload()` sketch. The live reader filters by trusted owner, indexed string `type=verdict`, and lowercase indexed string `user` for borrower lookup. Store the complete versioned `FrontendVerdict` JSON as a **bytes attribute named `record`**, UTF-8 encoded; JSON does not fit the SDK's short string attribute limit. The reader selects `$key` plus `record`, decodes the bytes, validates the exact-string record and injects the entity key. Reads are paginated at 100 records with a 10k cap. Changing the publisher schema only requires updating this adapter. The prior PRD payload schema needs this versioned SDK migration; do not mix legacy payloads and v1 bytes entities.

SDK sources consulted: https://docs.arkiv.network/networks/rabdi/ and https://docs.arkiv.network/querying/filter/; installed SDK TypeScript sources are the authority for this pinned version. Pages are read at the latest index block, not a historical replay snapshot. SDK lookup does not itself prove contract settlement or source independence.

## Vault reads

The team has not supplied a RedressVault ABI. The implemented Viem path uses standard ERC20 `decimals` and `balanceOf` at one Sepolia block. It requires an 18-decimal WETH token and reads configured bond, reserve and recovery holders. These are token balances, NOT a certificate of vault accounting, obligations or solvency. See https://viem.sh/docs/contract/readContract. Replace/extend `vault-client.ts` with the team's actual getters once available. No wallet writes, deposits, signing or payouts are added.

## APIs and numerical contracts

- `getIncidentReplayData`, `getBorrowerVerdict`, `getLiveMonitorFeed`, `getIncidentVerdicts`, `getVaultReserves`: the common service boundary.
- `getDemoScenario` / `getDemoVaultReserves`: explicitly synthetic explanatory visuals and stress defaults, including when live mode is configured. Marketing visuals never claim to be live reads.
- `shared/types.ts` includes the requested `LiquidationVerdict` and `IncidentSummary` compatibility DTOs. Float fields are display/compatibility only. Existing `FrontendVerdict` integer strings and BigInt math remain canonical for calculations. A real contract ABI is not locked by a TypeScript interface.
- The actual 34-account incident export is still absent. `shared/incident-2026-03-10.json` remains empty. Mock mode uses four constructed records; no historical success rate or paid total is fabricated.

## Failure and state policy

Live network/config/schema errors produce a clean warning and **visible synthetic fallback**, including a retry control. An empty valid live query stays empty; an empty fallback query stays labelled fallback. Cancellation does not become synthetic success and late results are ignored. The persistent workspace shell continues retaining its loaded snapshot across tab changes. User-edited stress capital is not overwritten by a delayed reserve read. Timeouts bound RPC requests. Live reads need actual endpoints/entities/addresses before end-to-end integration can be certified.

Tests cover the policy and browser fallback on a separate live-configured Vite instance at port 5174, with no external chain traffic when publisher config is missing. Default mock browser/layout tests run on 5173. No claim of real Arkiv reads, deployed CRE or real payouts is made by passing those tests.
