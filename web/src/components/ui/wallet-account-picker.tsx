import type { RefObject } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Check, Copy, X } from "lucide-react";
export type Account = {
  address: string;
  name: string;
  balance: string;
  network: string;
  symbol: string;
  demo: boolean;
  avatar: number;
};
const short = (s: string) => `${s.slice(0, 6)}…${s.slice(-4)}`;
function Avatar({ index, large = false }: { index: number; large?: boolean }) {
  return (
    <svg
      width={large ? 160 : 48}
      height={large ? 160 : 48}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={`face-${index}-${large}`}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <g clipPath={`url(#face-${index}-${large})`}>
        <rect
          width="100"
          height="100"
          fill={
            [
              "var(--graphite)",
              "var(--foreground)",
              "var(--accent-2)",
              "var(--primary)",
            ][index % 4]
          }
        />
        <path
          d={
            index % 2
              ? "M10 100Q5 40 50 25Q95 40 90 100Z"
              : "M12 100V55Q12 12 50 15Q88 12 88 55V100Z"
          }
          fill="var(--background)"
        />
        <path
          d="M29 48Q50 35 71 48V67Q50 90 29 67Z"
          fill={index === 3 ? "var(--accent-2)" : "var(--foreground)"}
        />
        <path
          d="M34 55h8m16 0h8"
          stroke="var(--background)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d={index === 2 ? "M43 67h14" : "M42 65q8 9 16 0"}
          stroke="var(--background)"
          strokeWidth="3"
          fill="none"
        />
        <path
          d={
            index === 1
              ? "M20 41L50 6L80 41Z"
              : "M21 43Q50 0 79 43L62 35L50 43L38 35Z"
          }
          fill={index === 0 ? "var(--primary)" : "var(--graphite)"}
        />
      </g>
    </svg>
  );
}
type Props = {
  loading: boolean;
  accounts: Account[];
  selected: Account;
  spin: number;
  copied: string;
  status: string;
  closeRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onCopy: () => void;
  onContinue: () => void;
  onRetry: () => void;
  onSelect: (account: Account) => void;
};
export function WalletAccountPicker({
  loading,
  accounts,
  selected,
  spin,
  copied,
  status,
  closeRef,
  onClose,
  onCopy,
  onContinue,
  onRetry,
  onSelect,
}: Props) {
  return (
    <motion.section
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="picker"
      aria-label="Wallet account picker"
    >
      <div className="picker-banner">
        <span className="tag">
          <span className={loading ? "" : "dot"} />
          {loading ? "Connecting…" : selected.demo ? "Demo mode" : "Connected"}
        </span>
        <button
          ref={closeRef}
          className="icon-button"
          aria-label="Close account picker"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
      {!loading && accounts.length > 0 ? (
        <>
          <motion.div
            className="main-avatar"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <motion.div
              animate={{ rotate: spin }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            >
              <Avatar index={selected.avatar} large />
            </motion.div>
          </motion.div>
          <div className="picker-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected.address}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <h2>{selected.name}</h2>
                <button
                  className="address"
                  onClick={onCopy}
                  aria-label="Copy wallet address"
                >
                  {short(selected.address)}
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </button>
                <p className="copy-status" role="status">
                  {copied}
                </p>
                <div className="badges">
                  <span className="tag">
                    <span className="dot" />
                    {selected.demo ? "DEMO wallet" : "MetaMask"}
                  </span>
                  <span className="tag">{selected.network}</span>
                </div>
                <p className="balance">
                  {selected.demo ? "Demo balance" : "Wallet balance"}{" "}
                  <strong className="mono">
                    {selected.balance} {selected.symbol}
                  </strong>
                </p>
              </motion.div>
            </AnimatePresence>
            <p className="choose-label">Select your account</p>
            <div className="avatar-list">
              {accounts.map((a, i) => (
                <motion.button
                  key={a.address}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.2 + i * 0.1,
                  }}
                  whileHover={{ y: -2 }}
                  onClick={() => onSelect(a)}
                  className="avatar-button"
                  aria-pressed={selected.address === a.address}
                  aria-label={`Select ${a.name} (${short(a.address)})`}
                >
                  <Avatar index={a.avatar} />
                  {selected.address === a.address && (
                    <motion.span
                      className="selected-ring"
                      initial={{ opacity: 0, rotate: -180 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
            <button className="primary continue" onClick={onContinue}>
              Continue to dashboard <ArrowRight size={17} />
            </button>
          </div>
        </>
      ) : (
        <div className="loading">
          <span className="loader" />
          <p>Waiting for MetaMask…</p>
        </div>
      )}
      <div className="wallet-notice">
        <p role="status">{status}</p>
        {!loading && selected.demo && (
          <div className="notice-links">
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noreferrer"
            >
              Install MetaMask ↗
            </a>
            <button onClick={onRetry}>Retry connection</button>
          </div>
        )}
      </div>
    </motion.section>
  );
}
