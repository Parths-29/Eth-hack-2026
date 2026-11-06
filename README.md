# Redress

**When an oracle gets it wrong, make people whole in blocks, not weeks.**

Redress is a hackathon prototype for evidence-based restitution after oracle-driven liquidations. This branch implements the frontend and shared reference interfaces. It is **not a deployed payout system, insurance product, verified incident replay, or live CRE/Arkiv integration**.

## Run

Requirements: Node.js 22+ and npm. From the repository root:

```sh
npm ci
npm run dev
npm run build
npm run test:e2e
```

Open http://127.0.0.1:5173. Browser tests automatically start/reuse Vite. On Linux/CI, first run `npx playwright install --with-deps chromium`. On Windows the config uses installed Chrome; set `CHROME_PATH` to override its executable path.

## What works

- Redress home with an edge-to-edge dark shell (#0B0E17), off-white text (#EEF0F4), coral actions (#FF5C39), Waves background, modern sans headings and responsive layouts. Template pricing became illustrative coverage capital; the composer became a borrower/workspace entry point.
- Public routes: `/#replay`, `/#lookup`, `/#monitor`, `/#incidents`, `/#vault`. No wallet required for public evidence. Legacy `/#dashboard` opens replay. Direct links and reloads work; state is ephemeral.
- MetaMask account/network/native-balance reads; honest demo fallback and no signing, approvals or transactions.
- Replay play/pause/reset, block stepping, speed, seek, running lower-bound totals and evidence drilldown. Demo steps are NOT historical block numbers. No mainnet fork executes in this UI.
- Address validation, positive/empty/error lookup states, incident/protocol/verdict/block/minimum-redress filters, local JSON evidence downloads, optional backend polling.
- Vault scenario inputs: bond, reserve, epoch cap and oracle deviation; reference verdict arithmetic drives obligations, cap-limited payable amounts and the bond → reserve waterfall. No capital operations are exposed.
- Exact BigInt reference calculations for interval verdicts and debt-unit provable floors. These are **not independently verified contract math**; Solidity/pipeline parity is a remaining gate.

## Data and integration

Default: four deliberately synthetic records in `shared/demo.ts`. Addresses 0x…0001 through 0x…0004 are synthetic identifiers, not historical victims. No synthetic transaction or evidence hashes are invented. The real incident dataset `shared/incident-2026-03-10.json` remains empty pending pipeline verification. PRD baseline figures are attributed to the PRD and marked unverified in the UI.

Copy `web/.env.example` to `web/.env.local` and set `VITE_REDRESS_API_URL` to use your backend. Restart Vite. This is public browser configuration: **never put secrets or private keys in VITE variables**.

The adapter requests `GET /verdicts` and expects a JSON `FrontendVerdict[]` (see `shared/types.ts`). Optional equality query parameters: user, incidentId, protocol, verdict. Amounts/prices are unsigned 18-decimal integer strings; do not put formatted amounts in these fields. Backend must normalize token decimals. The adapter validates response shape, supported Ethereum/Sepolia networks, position inputs and verified hashes. Errors do not silently become synthetic records. The browser requires CORS access from its origin.

The backend must query Arkiv for lookup, independently verify provenance, fetch current chain evidence and enforce all authentication, caps, idempotency and payout rules. A connected HTTP API is not proof of a running DON or of Arkiv sponsor compliance. This branch does not implement a direct Arkiv SDK read. No fake explorer links are rendered: verified full transaction hashes are required.

## Team ownership

| Directory | Owner | Status |
|---|---|---|
| `web/` | Frontend | Implemented on `feat/frontend-deck` |
| `shared/` | All, agree changes before merging | Proposed types, constructed fixtures and reference math; not a locked contract ABI |
| `contracts/` | Contracts teammate | Handoff only; no Solidity implementation |
| `cre/`, `pipeline/` | Automation/data teammate | Handoff only; no workflow or historical scraper implemented |
| `arkiv/` | Frontend + pipeline | Design and pending integration evidence |

The PRD suggests Next.js; this branch retains the working React/Vite app to preserve the approved UI and avoid an unnecessary migration. `web/` is a Vite workspace, not a Next app. If a Next requirement becomes mandatory, migrate separately with visual regression checks.

## Verification and limits

Playwright covers public routes, wallet flows, responsive overflow, lookup validation and empty states, replay controls, filters, vault caps, exact math, reduced motion and WebGL fallback. Browser-success MetaMask tests mock the provider; an actual extension smoke check remains pending. No 34/34 classification, ±2% historical scorecard, two-block latency, 200+ real negative controls or actual payout is claimed.

For the final hackathon integration, supply verified incident logs and source snapshots; deployed Sepolia addresses and CRE forwarder; actual CRE transcript; Arkiv entities/query endpoint; Swarm references; and a tested backend. Then verify contract/pipeline parity, finality, epoch/per-event caps, idempotency and the real replay. No real-money mainnet deployment is in scope.

Motion: GPU work is capped around 30fps/950k pixels; hidden/offscreen rendering pauses; reduced motion/unavailable WebGL/context loss use a static fallback. Shared styling contains inherited iteration layers; no palette redesign was performed for this branch. Original generic bento component is retained as source reference; the Redress workspace reuses its surface and four-column tile layout.

## Submission materials

- [PRD](PRD.md): user-supplied requirements, including unverified claims. Not an implementation status report.
- [API and integration handoff](shared/README.md)
- [Arkiv schema](arkiv/schema.md), [why Arkiv](arkiv/why-arkiv.md), [usage](arkiv/how-you-use-arkiv.md), [friction](arkiv/friction.md), [reach](arkiv/reach.md), [Swarm](arkiv/swarm.md)
- [Sponsor feedback](FEEDBACK.md): pending actual integration feedback, not fabricated experience.
- MIT license. No private keys or RPC secrets belong in this repository.


## Visual audit refinement

The current UI follows the latest supplied audit: no framed hero card, no cream coverage panel, no pixel homepage headings, and only one wallet home action. The viewport-wide shader remains decorative. `web/src/polish.css` contains the current layout refinements; shared palette values stay in `globals.css`.

`components/features/feature-section.tsx` implements the six-step lifecycle with keyboard tabs, code-rendered synthetic visuals, visible autoplay controls, pointer/focus pause, offscreen/tab-hidden pause and manual reduced-motion mode. It reuses `motion/react`; no duplicate framer-motion installation is needed.

`components/ui/tracker-card-1.tsx` renders transaction-step states in verdict details. Exact payout units remain integer strings. Synthetic calculations do not imply consensus, block confirmation or payout. Explorer links require a verified backend record, supported network and full hash; evidence buttons download the existing local JSON instead of claiming a published Swarm manifest.


## Stable liquid-glass navigation

The latest brief refines the palette to obsidian #05070E, off-white #F1F3F7 and sunset coral #FF5533, with coral/crimson atmospheric light and emerald/red semantic tracker states. `glass.css` defines this material treatment, fluid shared page widths and lookup's two-column layout.

The workspace shell stays mounted while tabs change; verdict data is not refetched on each tab. Keyed content scenes use a brief rise/perspective-tilt transition without animating document height. The stable scrollbar gutter prevents horizontal shifts. Reduced-motion mode uses immediate scene changes. The home terminal reserves space for its inline synthetic tracker and offers a safe VALID rejection scenario. Lookup shows its tracker directly alongside the query rather than shrinking into a single short card. No synthetic example asserts a real 14.28 WETH payout, CRE consensus or chain confirmations.
