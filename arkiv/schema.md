# Arkiv entity schema — proposed, not deployed

PRD entity types: verdict, incident, claim, recovery. Attestor owns entities; vault events remain canonical. All monetary integer strings live in payload JSON. Numeric query attributes use milli-ETH/bps; string filters use equality.

| Entity | Attributes | Expiry target |
|---|---|---|
| verdict | protocol, chainId, block, txHash, logIndex, user, verdict, redressMilliEth, deviationBps, srcCount, incidentId, evidenceBzz, vaultTx | 365 days |
| incident | incidentId, protocol, startBlock, endBlock, victims, totalRedressMilliEth, status | 365 days |
| claim | claimId, user, kind, status, amountMilliEth | 7-day claim deadline |
| recovery | liquidationTx, liquidator, status, amountMilliEth | 90 days |

No chain IDs, RPCs or deployed keys are asserted here. Confirm testnet configuration against current official documentation before integration. No SDK writes/reads or expiry behavior have been verified in this branch.
## SDK v1 integration note

The live reader expects trusted ownership, indexed string `type=verdict`, indexed lowercase string `user`, and a bytes attribute `record` containing UTF-8 `FrontendVerdict` JSON. This versioned schema replaces the older payload assumption for the pinned SDK v1.0.1 integration; the conceptual PRD entities above remain the design goal. The publisher must adopt this shape or the team must modify only the adapter. See `shared/ADAPTER.md` for units and failure policy.
