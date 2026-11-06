import type { FrontendVerdict } from "../../../../shared/types";
import { evaluate, format } from "../../../../shared/math";
import {
  RestitutionTrackerCard,
  type RestitutionStep,
} from "../ui/tracker-card-1";
export function VerdictTracker({
  record,
  onViewEvidence,
}: {
  record: FrontendVerdict;
  onViewEvidence?: () => void;
}) {
  const result = evaluate(record.position);
  const synthetic = record.provenance === "synthetic";
  const insufficient = record.position.sourceCount < 3;
  const trackerSteps: RestitutionStep[] = [
    {
      title: synthetic ? "Synthetic inputs loaded" : "Backend inputs received",
      description: synthetic
        ? "Constructed position; no historical event was observed."
        : "Read the underlying transaction before relying on this record.",
      status: "completed",
    },
    {
      title: "Independent price inputs",
      description: insufficient
        ? "Fewer than three inputs. Re-evaluation is required."
        : `${record.position.sourceCount} ${synthetic ? "illustrative" : "reported"} inputs; source independence is not certified by the browser.`,
      status: insufficient ? "error" : "completed",
    },
    {
      title: "Reference verdict",
      description: insufficient
        ? "INCONCLUSIVE — no payout computed."
        : record.verdict === "VALID"
          ? "Liquidatable across the supplied interval. VALID — no payout issued."
          : `${result.verdict}, calculated from the supplied interval.`,
      status: insufficient
        ? "pending"
        : record.verdict === "VALID"
          ? "error"
          : "completed",
    },
    {
      title: "Provable floor",
      description: insufficient
        ? "Awaiting sufficient source inputs."
        : `${format(result.amount)} WETH. This calculation does not send a transaction.`,
      status: insufficient ? "pending" : "completed",
    },
    {
      title: "Contract report",
      description:
        "No CRE attestation or block-confirmation data has been supplied.",
      status: "pending",
    },
    {
      title: "Restitution settlement",
      description: synthetic
        ? "Simulation only. No funds have been sent."
        : record.settlement === "paid"
          ? "Reported paid by the backend. Verify the transaction onchain."
          : "No completed payout has been reported.",
      status:
        !synthetic && record.settlement === "paid" ? "completed" : "pending",
      txHash: record.payoutTxHash,
    },
  ];
  return (
    <RestitutionTrackerCard
      status={
        insufficient
          ? "Source inputs unavailable"
          : record.verdict === "VALID"
            ? "Valid · no restitution"
            : synthetic
              ? "Demo calculation complete"
              : record.settlement === "paid"
                ? "Reported restitution complete"
                : "Restitution queued"
      }
      userAddress={record.user}
      liquidatedAsset={record.collateralAsset}
      payoutAmountWei={record.redressAmount}
      steps={trackerSteps}
      chainId={record.chainId}
      synthetic={synthetic}
      onViewEvidence={onViewEvidence}
    />
  );
}
