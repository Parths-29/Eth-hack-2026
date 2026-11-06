import { motion, useReducedMotion } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { format } from "../../../../shared/math";
export type StepStatus = "completed" | "active" | "pending" | "error";
export interface RestitutionStep {
  title: string;
  description: string;
  date?: string;
  status: StepStatus;
  txHash?: string;
}
export interface RestitutionTrackerCardProps {
  status: string;
  userAddress: string;
  liquidatedAsset: string;
  payoutAmountWei: string;
  steps: RestitutionStep[];
  className?: string;
  onViewEvidence?: () => void;
  chainId?: number;
  synthetic?: boolean;
}
export function RestitutionTrackerCard({
  status,
  userAddress,
  liquidatedAsset,
  payoutAmountWei,
  steps,
  className = "",
  onViewEvidence,
  chainId = 11155111,
  synthetic = true,
}: RestitutionTrackerCardProps) {
  const reduced = useReducedMotion();
  const base =
    chainId === 1
      ? "https://etherscan.io"
      : chainId === 11155111
        ? "https://sepolia.etherscan.io"
        : null;
  return (
    <section
      className={`restitution-tracker ${className}`}
      aria-label="Restitution transaction tracker"
    >
      <div className="tracker-header">
        <span className="tracker-status">{status}</span>
        <span className="tracker-address" title={userAddress}>
          {userAddress}
        </span>
        <p>Provable floor · {liquidatedAsset}</p>
        <div className="tracker-amount">
          {format(payoutAmountWei)} <small>WETH</small>
        </div>
        <span className="tracker-provenance">
          {synthetic
            ? "Synthetic walkthrough · No funds sent"
            : "Backend-reported state · independently verify onchain"}
        </span>
      </div>
      <motion.ol
        className="tracker-steps"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {steps.map((step, index) => {
          const Icon =
            step.status === "completed"
              ? CheckCircle2
              : step.status === "active"
                ? Clock
                : step.status === "error"
                  ? AlertCircle
                  : Circle;
          const tx =
            !synthetic && base && /^0x[\da-fA-F]{64}$/.test(step.txHash ?? "")
              ? `${base}/tx/${step.txHash}`
              : null;
          return (
            <motion.li
              key={`${index}-${step.title}`}
              className={`tracker-step status-${step.status}`}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : index * 0.06, duration: 0.2 }}
            >
              <span className="tracker-step-icon">
                <Icon size={16} />
              </span>
              <div className="tracker-step-content">
                <div className="tracker-step-heading">
                  <h3>{step.title}</h3>
                  <span>{step.date ?? step.status}</span>
                </div>
                <p>{step.description}</p>
                {tx && (
                  <a href={tx} target="_blank" rel="noreferrer">
                    View transaction <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </motion.li>
          );
        })}
      </motion.ol>
      {onViewEvidence && (
        <div className="tracker-footer">
          <button className="primary" onClick={onViewEvidence}>
            View evidence manifest
          </button>
        </div>
      )}
    </section>
  );
}
