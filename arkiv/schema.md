# Arkiv entity schema — proposed, not deployed

PRD entity types: verdict, incident, claim, recovery. Attestor owns entities; vault events remain canonical. All monetary integer strings live in payload JSON. Numeric query attributes use milli-ETH/bps; string filters use equality.

| Entity | Attributes | Expiry target |
|---|---|---|
| verdict | protocol, chainId, block, txHash, logIndex, user, verdict, redressMilliEth, deviationBps, srcCount, incidentId, evidenceBzz, vaultTx | 365 days |
| incident | incidentId, protocol, startBlock, endBlock, victims, totalRedressMilliEth, status | 365 days |
| claim | claimId, user, kind, status, amountMilliEth | 7-day claim deadline |
| recovery | liquidationTx, liquidator, status, amountMilliEth | 90 days |

No chain IDs, RPCs or deployed keys are asserted here. Confirm testnet configuration against current official documentation before integration. No SDK writes/reads or expiry behavior have been verified in this branch.
