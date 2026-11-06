# Shared integration contract (proposed)

`types.ts` preserves Gemini's VerdictReport fields and adds FrontendVerdict metadata required for honest presentation. It is a proposal for teammates, not an agreed deployed ABI.

- Monetary values: decimal integer strings at 18-decimal precision, in named asset units. Price bands: quote-numeraire per token at 18 decimals. Backend normalizes other token decimals before export.
- Ordering and idempotency identity: `(liquidationTx, logIndex)`; demo id is UI-only. Backend owns unique ids and block/log ordering.
- `provenance=synthetic` must never be promoted to verified without chain reconstruction. Synthetic records have no invented tx/evidence hashes and settlement `simulated`.
- `settlement=paid` on verified records requires the exact payout hash. Evidence hash is a full 32-byte content hash, not a shortened identifier.
- Verified network support in this frontend: Ethereum (1), Sepolia (11155111). No transaction execution is exposed.
- Position pre-state must reflect B−1 adjusted for preceding liquidations, as PRD 6.4 requires. Source timestamps, source independence, outlier rejection, staleness and the band-building algorithm are backend responsibilities; this UI does not certify them.
- `math.ts` is a pure frontend reference for the supplied single-collateral/single-debt interval. It assumes validated independent bands and uses integer/rational comparisons. It is NOT the Solidity implementation. Unit tests are examples, not a fuzz or parity certificate.
- Current tolerance 75 bps and HF margin 10 bps are reference defaults, not timelocked contract parameters. Future API should export versioned configuration.

## API handoff

`GET /verdicts?user=0x...&incidentId=...&protocol=...&verdict=...` returns `FrontendVerdict[]` (maximum 10k records). CORS must allow the frontend origin. The frontend also filters locally; pagination and streaming need a versioned API extension for larger datasets. Monitor polls every 10 seconds and preserves the old snapshot with an error notice if refresh fails. No SSE or POST /replay/start is implemented yet.

The service behind borrower lookup must actually read Arkiv and expose source provenance before the sponsor criterion can be claimed. Fill `incident-2026-03-10.json` only from a reproducible verified pipeline export; the current empty dataset is intentional. `demo.ts` must remain separate.
